const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

function readJson(fileName, fallback = []) {
  const filePath = path.join(dataDir, fileName);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(fileName, payload) {
  const filePath = path.join(dataDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
}

function appendJson(fileName, record) {
  const data = readJson(fileName, []);
  data.unshift(record);
  writeJson(fileName, data);
  return data;
}

module.exports = {
  readJson,
  writeJson,
  appendJson
};
