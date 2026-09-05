const fs = require('fs');
const path = require('path');

const sources = {
  1:'gifts-01.js',2:'gifts-01.js',3:'coffee-local.js',4:'robot-local.js',
  5:'gifts-03.js',6:'gifts-03.js',7:'gifts-04.js',8:'gifts-04.js',
  9:'gifts-05.js',10:'gifts-05.js',11:'gifts-06.js',12:'gifts-06.js',
  13:'gifts-07.js',14:'gifts-07.js',15:'gifts-08.js',16:'gifts-08.js',
  17:'gift-17.js',18:'gift-18.js',19:'gift-19.js',20:'gift-20.js'
};

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'assets', 'presentes', 'final');
fs.mkdirSync(outDir, { recursive: true });

function extractBase64(id) {
  const filename = sources[id];
  const text = fs.readFileSync(path.join(root, 'lib', filename), 'utf8');

  // Arquivos compartilhados normalmente têm {'9':'<base64>','10':'<base64>'}.
  const keyed = text.match(new RegExp(`["']${id}["']\\s*:\\s*["']([A-Za-z0-9+/=]{1000,})["']`));
  if (keyed) return keyed[1];

  // Arquivos individuais/locais normalmente têm const DATA='<base64>' ou Buffer.from('<base64>','base64').
  const named = text.match(/(?:DATA|Buffer\.from\()\s*=?\s*["']([A-Za-z0-9+/=]{1000,})["']/);
  if (named) return named[1];

  // Fallback seguro: só aceita se existir uma única string longa de base64 no arquivo.
  const all = [...text.matchAll(/["']([A-Za-z0-9+/]{1000,}={0,2})["']/g)].map(m => m[1]);
  if (all.length === 1) return all[0];

  throw new Error(`Gift ${id}: cannot uniquely extract base64 from ${filename}; candidates=${all.length}`);
}

function detect(buffer) {
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return {ext:'jpg', mime:'image/jpeg'};
  if (buffer.slice(0,4).toString('ascii') === 'RIFF' && buffer.slice(8,12).toString('ascii') === 'WEBP') return {ext:'webp', mime:'image/webp'};
  if (buffer.slice(1,4).toString('ascii') === 'PNG') return {ext:'png', mime:'image/png'};
  throw new Error('Unknown image signature');
}

for (let id = 1; id <= 20; id++) {
  const b64 = extractBase64(id);
  const buffer = Buffer.from(b64, 'base64');
  if (buffer.length < 1000) throw new Error(`Gift ${id}: decoded file too small (${buffer.length})`);
  const {ext,mime} = detect(buffer);
  const filename = `gift-${String(id).padStart(2,'0')}.${ext}`;
  fs.writeFileSync(path.join(outDir, filename), buffer);
  console.log(`${id}: ${filename} ${buffer.length} bytes ${mime}`);
}

const files = fs.readdirSync(outDir).filter(f => /^gift-\d{2}\.(webp|jpg|png)$/.test(f));
if (files.length !== 20) throw new Error(`Expected 20 gift images, found ${files.length}`);
console.log('OK: 20 static gift images generated.');
