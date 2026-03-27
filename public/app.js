const leadForm = document.getElementById('leadForm');
const formMessage = document.getElementById('formMessage');
const year = document.getElementById('year');

year.textContent = new Date().getFullYear();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.2 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

leadForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(leadForm).entries());
  formMessage.textContent = 'Submitting...';

  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Submission failed');

    leadForm.reset();
    formMessage.textContent = 'Thank you! Team Shambhu will contact you shortly.';
  } catch (error) {
    formMessage.textContent = error.message;
  }
});
