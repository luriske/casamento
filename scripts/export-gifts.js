const fs = require('fs');
const path = require('path');

const handlers = {
  1: require('../lib/gifts-01'), 2: require('../lib/gifts-01'),
  3: require('../lib/coffee-local'), 4: require('../lib/robot-local'),
  5: require('../lib/gifts-03'), 6: require('../lib/gifts-03'),
  7: require('../lib/gifts-04'), 8: require('../lib/gifts-04'),
  9: require('../lib/gifts-05'), 10: require('../lib/gifts-05'),
  11: require('../lib/gifts-06'), 12: require('../lib/gifts-06'),
  13: require('../lib/gifts-07'), 14: require('../lib/gifts-07'),
  15: require('../lib/gifts-08'), 16: require('../lib/gifts-08'),
  17: require('../lib/gift-17'), 18: require('../lib/gift-18'),
  19: require('../lib/gift-19'), 20: require('../lib/gift-20')
};

const outDir = path.join(__dirname, '..', 'assets', 'presentes', 'final');
fs.mkdirSync(outDir, { recursive: true });

async function render(id) {
  let statusCode = 200;
  let contentType = '';
  let body;
  const res = {
    setHeader(name, value) {
      if (String(name).toLowerCase() === 'content-type') contentType = String(value);
      return this;
    },
    status(code) { statusCode = Number(code); return this; },
    end(data) { body = data; return this; },
    send(data) { body = data; return this; }
  };

  await Promise.resolve(handlers[id]({ query: { id: String(id) } }, res));
  if (statusCode >= 400 || body == null) throw new Error(`Gift ${id}: handler returned ${statusCode}`);
  const buffer = Buffer.isBuffer(body) ? body : Buffer.from(body);
  if (buffer.length < 1000) throw new Error(`Gift ${id}: image is too small (${buffer.length} bytes)`);
  if (!/^image\//i.test(contentType)) throw new Error(`Gift ${id}: invalid content type ${contentType}`);

  const ext = contentType.includes('png') ? 'png' : contentType.includes('jpeg') ? 'jpg' : 'webp';
  const filename = `gift-${String(id).padStart(2, '0')}.${ext}`;
  fs.writeFileSync(path.join(outDir, filename), buffer);
  console.log(`${id}: ${filename} ${buffer.length} bytes ${contentType}`);
}

(async () => {
  for (let id = 1; id <= 20; id++) await render(id);
  const files = fs.readdirSync(outDir).filter(f => /^gift-\d{2}\.(webp|jpg|png)$/.test(f));
  if (files.length !== 20) throw new Error(`Expected 20 gift images, found ${files.length}`);
  console.log('OK: 20 static gift images generated.');
})().catch(err => { console.error(err); process.exit(1); });
