require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const jwt = require('jsonwebtoken');
const { customAlphabet } = require('nanoid');
const twilio = require('twilio');
const nodemailer = require('nodemailer');
const { readJson, appendJson } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'replace-this-in-production';
const otpGenerator = customAlphabet('0123456789', 6);

const otpStore = new Map();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));
app.use(express.static(path.join(__dirname, '..', 'public')));

function getTwilioClient() {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return null;
  return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

function getMailer() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
}

function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ ok: false, message: 'Missing token' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ ok: false, message: 'Invalid token' });
  }
}

app.post('/api/auth/request-otp', async (req, res) => {
  const { identifier } = req.body;
  if (!identifier) return res.status(400).json({ ok: false, message: 'Phone or email required' });

  const otp = otpGenerator();
  const expiresAt = Date.now() + 5 * 60 * 1000;
  otpStore.set(identifier, { otp, expiresAt });

  const twilioClient = getTwilioClient();
  const mailer = getMailer();
  const isPhone = /^\+?[1-9]\d{9,14}$/.test(identifier);

  try {
    if (isPhone && twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      await twilioClient.messages.create({
        body: `Your Shambhu Events OTP is ${otp}. It is valid for 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: identifier
      });
      return res.json({ ok: true, message: 'OTP sent on WhatsApp/SMS via Twilio' });
    }

    if (!isPhone && mailer && process.env.MAIL_FROM) {
      await mailer.sendMail({
        from: process.env.MAIL_FROM,
        to: identifier,
        subject: 'Shambhu Events OTP Verification',
        text: `Your OTP is ${otp}. It will expire in 5 minutes.`
      });
      return res.json({ ok: true, message: 'OTP sent on email' });
    }

    // Dev fallback for local setup when messaging providers are not configured.
    return res.json({
      ok: true,
      message: 'OTP generated in local mode. Configure Twilio/SMTP for production sends.',
      devOtp: otp
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: 'Unable to send OTP', error: error.message });
  }
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { identifier, otp } = req.body;
  const record = otpStore.get(identifier);

  if (!record || record.expiresAt < Date.now()) {
    return res.status(400).json({ ok: false, message: 'OTP expired. Request again.' });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ ok: false, message: 'Invalid OTP' });
  }

  otpStore.delete(identifier);
  const token = jwt.sign({ identifier, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ ok: true, token });
});

app.post('/api/leads', (req, res) => {
  const { name, phone, email, eventType, budget, message } = req.body;
  if (!name || !phone || !email) {
    return res.status(400).json({ ok: false, message: 'Name, phone and email are required' });
  }

  const lead = {
    id: `lead_${Date.now()}`,
    name,
    phone,
    email,
    eventType: eventType || 'General Inquiry',
    budget: budget || 'Not shared',
    message: message || '',
    createdAt: new Date().toISOString()
  };

  appendJson('leads.json', lead);
  return res.status(201).json({ ok: true, message: 'Lead captured successfully', lead });
});

app.get('/api/dashboard/summary', auth, (req, res) => {
  const customers = readJson('customers.json', []);
  const leads = readJson('leads.json', []);

  res.json({
    ok: true,
    stats: {
      totalCustomers: customers.length,
      totalLeads: leads.length,
      todaysLeads: leads.filter((lead) => lead.createdAt.startsWith(new Date().toISOString().slice(0, 10))).length
    },
    latestLeads: leads.slice(0, 10)
  });
});

app.get('/api/customers', auth, (req, res) => {
  const customers = readJson('customers.json', []);
  res.json({ ok: true, customers });
});

app.get('/health', (_, res) => {
  res.json({ ok: true, status: 'running', service: 'Shambhu Events API' });
});

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Shambhu Events server live on http://localhost:${PORT}`);
});
