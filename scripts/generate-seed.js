const fs = require('fs');
const path = require('path');

const firstNames = ['Aarav', 'Vihaan', 'Anaya', 'Ishita', 'Aditi', 'Rohan', 'Kavya', 'Sai', 'Mihir', 'Neha'];
const lastNames = ['Patil', 'Sharma', 'Jadhav', 'Pawar', 'Gupta', 'Mhetre', 'Kulkarni', 'Singh', 'Verma', 'Nair'];
const cities = ['Pune', 'Mumbai', 'Nashik', 'Nagpur', 'Kolhapur', 'Satara'];
const events = ['Wedding', 'Corporate Launch', 'Birthday', 'Reception', 'Haldi', 'Anniversary'];

const customers = Array.from({ length: 520 }, (_, i) => {
  const first = firstNames[i % firstNames.length];
  const last = lastNames[(i * 7) % lastNames.length];
  const city = cities[(i * 5) % cities.length];
  const eventType = events[(i * 3) % events.length];
  const mobileSuffix = String(1000000000 + i).slice(-10);

  return {
    id: `CUST-${String(i + 1).padStart(4, '0')}`,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${i + 1}@example.com`,
    phone: `+91${mobileSuffix}`,
    city,
    eventType,
    inquiryDate: new Date(Date.now() - i * 86400000).toISOString()
  };
});

fs.writeFileSync(path.join(__dirname, '..', 'data', 'customers.json'), JSON.stringify(customers, null, 2));
console.log(`Seeded ${customers.length} customer records`);
