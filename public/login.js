const requestOtpForm = document.getElementById('requestOtpForm');
const verifyOtpForm = document.getElementById('verifyOtpForm');
const messageEl = document.getElementById('authMessage');
const dashboard = document.getElementById('dashboard');
const stats = document.getElementById('stats');
const latestLeads = document.getElementById('latestLeads');

let currentIdentifier = '';

requestOtpForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const identifier = document.getElementById('identifier').value.trim();

  const response = await fetch('/api/auth/request-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier })
  });
  const data = await response.json();

  currentIdentifier = identifier;
  messageEl.textContent = data.devOtp
    ? `${data.message} (Dev OTP: ${data.devOtp})`
    : data.message;
});

verifyOtpForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const otp = document.getElementById('otp').value.trim();

  const response = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: currentIdentifier, otp })
  });
  const data = await response.json();

  if (!response.ok) {
    messageEl.textContent = data.message;
    return;
  }

  localStorage.setItem('shambhu_token', data.token);
  messageEl.textContent = 'Login successful. Loading dashboard...';
  await loadDashboard(data.token);
});

async function loadDashboard(token) {
  const response = await fetch('/api/dashboard/summary', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) {
    messageEl.textContent = data.message || 'Unable to load dashboard';
    return;
  }

  dashboard.hidden = false;
  stats.innerHTML = `
    <article class="card"><h3>${data.stats.totalCustomers}</h3><p>Total Customers</p></article>
    <article class="card"><h3>${data.stats.totalLeads}</h3><p>Total Leads</p></article>
    <article class="card"><h3>${data.stats.todaysLeads}</h3><p>Today's Leads</p></article>
  `;

  latestLeads.innerHTML = data.latestLeads.length
    ? data.latestLeads
        .map((lead) => `<div class="lead-item"><strong>${lead.name}</strong> • ${lead.phone} • ${lead.email}</div>`)
        .join('')
    : '<p>No leads yet.</p>';
}
