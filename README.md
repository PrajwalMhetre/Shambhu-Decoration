# Shambhu Events & Management (Black & Gold Premium Full-Stack)

A responsive, animation-rich website and CRM backend for **Shambhu Events & Management** with:
- Premium black + gold UI/UX
- Big animated hero intro
- CTA for call + WhatsApp
- Lead capture with customer contact + email
- OTP login flow (Twilio/SMTP capable)
- Dashboard with live lead confirmation
- Seeded database with **520 customer records**

## 1) Backend First

### Run locally
```bash
npm install
cp .env.example .env
npm run dev
```
Server starts at `http://localhost:4000`.

### API Endpoints
- `POST /api/auth/request-otp`
- `POST /api/auth/verify-otp`
- `POST /api/leads`
- `GET /api/dashboard/summary` (auth required)
- `GET /api/customers` (auth required)
- `GET /health`

### OTP setup (Twilio / SMTP / Supabase note)
- For **production OTP**, add Twilio secrets in `.env`:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER`
- For email OTP, configure SMTP values.
- If not configured, app runs in local dev OTP mode and returns OTP in API response.
- If you want Supabase Auth OTP instead, keep frontend same and switch backend auth handlers to Supabase SDK.

## 2) Frontend Second

Main pages:
- `/` → Premium landing page
- `/login.html` → OTP login + live dashboard cards and lead stream

Brand CTA configured:
- Phone: `+91 9146620490`
- WhatsApp: `+91 9172620490`
- Instagram display: `@Shambhu Events-Mangment`

## 3) Deploy Third

### Option A: Render / Railway (single service)
1. Push repo to GitHub.
2. Create Node Web Service.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add env vars from `.env.example`.

### Option B: Docker
```bash
docker build -t shambhu-events .
docker run -p 4000:4000 --env-file .env shambhu-events
```

## Data files
- `data/customers.json` seeded with 520 records
- `data/leads.json` stores new inquiries

## Important production notes
- Use HTTPS, rotate secrets, and secure JWT secret.
- Replace JSON file storage with managed DB (Postgres/Supabase) for scale.
- Add rate limit + captcha before go-live.
