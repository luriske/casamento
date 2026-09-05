const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const history = {
  1:'5b70198e320eb04238dd2d4475c587aafadd3afa',
  2:'5b70198e320eb04238dd2d4475c587aafadd3afa',
  3:'e3ebda09efb17c782fc2ffdf387469ed1095af33',
  4:'e3ebda09efb17c782fc2ffdf387469ed1095af33',
  5:'b6a173be8a160f4dbd6cab80e0efce9bd67614d2',
  6:'b6a173be8a160f4dbd6cab80e0efce9bd67614d2',
  7:'c2b05363b5fc909a3ccb613d3f36eb74a2a4aa94',
  8:'c2b05363b5fc909a3ccb613d3f36eb74a2a4aa94',
  9:'b862959fb06ed5000a0a6b7ef4227d55b30f88ca',
  10:'b862959fb06ed5000a0a6b7ef4227d55b30f88ca',
  11:'bfcea7bf1bb0ac7d07f54715df5f199f04d89846',
  12:'bfcea7bf1bb0ac7d07f54715df5f199f04d89846',
  13:'55844d3e70d1b9ef4f4af536952aae58137cb710',
  14:'55844d3e70d1b9ef4f4af536952aae58137cb710',
  15:'1afed8e3604515bb03353c915013369943f96929',
  16:'1afed8e3604515bb03353c915013369943f96929',
  17:'4136eff518528b491a721eca2127ba18f353dd45',
  18:'094bc6ae5bdb6582820e4cfc2a7f1d33853febe0',
  19:'0a04f475bbac27111117c2b03571f04ba3cd9e02',
  20:'2d44c38a325cb82b11046a1025811d065d80ab93'
};

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'assets', 'presentes', 'final');
fs.rmSync(outDir, { recursive:true, force:true });
fs.mkdirSync(outDir, { recursive:true });

function git(args) {
  return execFileSync('git', args, { cwd:root, encoding:'utf8', maxBuffer:64*1024*1024 });
}
function changedFiles(commit) {
  return git(['diff-tree','--no-commit-id','--name-only','-r',commit]).split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
}
function readAt(commit,file) {
  try { return git(['show',`${commit}:${file}`]); } catch (_) { return ''; }
}
function detect(buffer) {
  if (buffer.length>3 && buffer[0]===0xff && buffer[1]===0xd8 && buffer[2]===0xff) return {ext:'jpg',mime:'image/jpeg'};
  if (buffer.length>12 && buffer.slice(0,4).toString('ascii')==='RIFF' && buffer.slice(8,12).toString('ascii')==='WEBP') return {ext:'webp',mime:'image/webp'};
  if (buffer.length>8 && buffer[0]===0x89 && buffer.slice(1,4).toString('ascii')==='PNG') return {ext:'png',mime:'image/png'};
  return null;
}
function validBase64(s) {
  if (!s || s.length<1000) return null;
  try {
    const buffer=Buffer.from(s.replace(/\s+/g,''),'base64');
    const type=detect(buffer);
    return type && buffer.length>=1000 ? {buffer,...type} : null;
  } catch (_) { return null; }
}

function executeHandler(text,id) {
  if (!/module\.exports\s*=/.test(text)) return null;
  try {
    const mod={exports:{}};
    const localRequire=(name)=>{
      if (name==='buffer') return require('buffer');
      throw new Error(`blocked require: ${name}`);
    };
    const factory=new Function('module','exports','require','Buffer',`${text}\n;return module.exports;`);
    const handler=factory(mod,mod.exports,localRequire,Buffer);
    if (typeof handler!=='function') return null;
    let statusCode=200;
    let chunks=[];
    const res={
      status(code){statusCode=code;return this;},
      setHeader(){return this;}, header(){return this;}, set(){return this;},
      write(data){if(data!=null) chunks.push(Buffer.isBuffer(data)?Buffer.from(data):Buffer.from(String(data)));return true;},
      end(data){if(data!=null) chunks.push(Buffer.isBuffer(data)?Buffer.from(data):Buffer.from(String(data)));return this;},
      send(data){if(data!=null) chunks.push(Buffer.isBuffer(data)?Buffer.from(data):Buffer.from(String(data)));return this;}
    };
    const req={query:{id:String(id)},method:'GET',headers:{}};
    handler(req,res);
    if (statusCode!==200 || !chunks.length) return null;
    const buffer=Buffer.concat(chunks);
    const type=detect(buffer);
    return type && buffer.length>=1000 ? {buffer,...type} : null;
  } catch (_) { return null; }
}

function exactKeyed(text,id) {
  const patterns=[
    new RegExp(`["']${id}["']\\s*:\\s*["']data:image\\/(?:webp|jpeg|jpg|png);base64,([A-Za-z0-9+/=\\r\\n]+)["']`,'i'),
    new RegExp(`["']${id}["']\\s*:\\s*["']([A-Za-z0-9+/=\\r\\n]{1000,})["']`,'i')
  ];
  for(const re of patterns){const m=text.match(re);if(m){const v=validBase64(m[1]);if(v)return v;}}
  return null;
}

function recover(id) {
  const commit=history[id];
  const files=changedFiles(commit);
  if(!files.length) throw new Error(`Gift ${id}: commit sem arquivos alterados`);

  // Preferência: executa exatamente o handler histórico, com o id original.
  for(const file of files.filter(f=>/\.(js|cjs)$/.test(f))){
    const text=readAt(commit,file);
    const hit=executeHandler(text,id);
    if(hit) return {...hit,source:file,commit,method:'handler'};
  }

  // Assets de browser (1–6): extrai a chave exata do objeto de data URLs.
  for(const file of files){
    const text=readAt(commit,file);
    const hit=exactKeyed(text,id);
    if(hit) return {...hit,source:file,commit,method:'keyed'};
  }

  throw new Error(`Gift ${id}: não foi possível recuperar em ${commit}; arquivos=${files.join(',')}`);
}

const manifest={};
const hashes=new Set();
for(let id=1;id<=20;id++){
  const r=recover(id);
  const filename=`gift-${String(id).padStart(2,'0')}.${r.ext}`;
  fs.writeFileSync(path.join(outDir,filename),r.buffer);
  manifest[id]=`/assets/presentes/final/${filename}`;
  const fingerprint=require('crypto').createHash('sha256').update(r.buffer).digest('hex');
  console.log(`${id}: ${filename} ${r.buffer.length} bytes ${r.mime} sha256=${fingerprint.slice(0,16)} <- ${r.method}:${r.source}@${r.commit.slice(0,8)}`);
  hashes.add(fingerprint);
}
const files=fs.readdirSync(outDir).filter(f=>/^gift-\d{2}\.(webp|jpg|png)$/.test(f));
if(files.length!==20) throw new Error(`Expected 20 gift images, found ${files.length}`);
if(hashes.size!==20) throw new Error(`Expected 20 distinct images, found ${hashes.size} distinct hashes`);
fs.writeFileSync(path.join(outDir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('OK: 20 imagens estáticas, válidas e distintas recuperadas.');
