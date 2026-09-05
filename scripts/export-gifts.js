const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const history={
1:'5b70198e320eb04238dd2d4475c587aafadd3afa',2:'5b70198e320eb04238dd2d4475c587aafadd3afa',
3:'e3ebda09efb17c782fc2ffdf387469ed1095af33',4:'e3ebda09efb17c782fc2ffdf387469ed1095af33',
5:'b6a173be8a160f4dbd6cab80e0efce9bd67614d2',6:'b6a173be8a160f4dbd6cab80e0efce9bd67614d2',
7:'c2b05363b5fc909a3ccb613d3f36eb74a2a4aa94',8:'c2b05363b5fc909a3ccb613d3f36eb74a2a4aa94',
9:'b862959fb06ed5000a0a6b7ef4227d55b30f88ca',10:'b862959fb06ed5000a0a6b7ef4227d55b30f88ca',
11:'bfcea7bf1bb0ac7d07f54715df5f199f04d89846',12:'bfcea7bf1bb0ac7d07f54715df5f199f04d89846',
13:'55844d3e70d1b9ef4f4af536952aae58137cb710',14:'55844d3e70d1b9ef4f4af536952aae58137cb710',
15:'1afed8e3604515bb03353c915013369943f96929',16:'1afed8e3604515bb03353c915013369943f96929',
17:'4136eff518528b491a721eca2127ba18f353dd45',18:'094bc6ae5bdb6582820e4cfc2a7f1d33853febe0',
19:'0a04f475bbac27111117c2b03571f04ba3cd9e02',20:'2d44c38a325cb82b11046a1025811d065d80ab93'};

const root=path.join(__dirname,'..');
const outDir=path.join(root,'assets','presentes','final');
fs.rmSync(outDir,{recursive:true,force:true});fs.mkdirSync(outDir,{recursive:true});
function git(a){return execFileSync('git',a,{cwd:root,encoding:'utf8',maxBuffer:128*1024*1024});}
function files(c){return git(['diff-tree','--no-commit-id','--name-only','-r',c]).split(/\r?\n/).filter(Boolean);}
function read(c,f){try{return git(['show',`${c}:${f}`]);}catch{return '';}}
function type(b){if(b.length>3&&b[0]===255&&b[1]===216&&b[2]===255)return{ext:'jpg',mime:'image/jpeg'};if(b.length>12&&b.slice(0,4).toString()==='RIFF'&&b.slice(8,12).toString()==='WEBP')return{ext:'webp',mime:'image/webp'};if(b.length>8&&b[0]===137&&b.slice(1,4).toString()==='PNG')return{ext:'png',mime:'image/png'};return null;}
function decode(s){try{const b=Buffer.from(String(s).replace(/\s+/g,''),'base64');const t=type(b);return t&&b.length>1000?{buffer:b,...t}:null;}catch{return null;}}

function literal(text,id){
  const markers=[`'${id}':'`,`"${id}":"`,`'${id}':"`,`"${id}":'`];
  for(const marker of markers){
    const i=text.indexOf(marker);if(i<0)continue;
    const quote=marker.endsWith("'")?"'":"\"";
    const start=i+marker.length,end=text.indexOf(quote,start);if(end<0)continue;
    let raw=text.slice(start,end);
    const comma=raw.indexOf('base64,');if(comma>=0)raw=raw.slice(comma+7);
    const hit=decode(raw);if(hit)return hit;
  }
  return null;
}
function handler(text,id){
  if(!/module\.exports\s*=/.test(text))return null;
  try{
    const mod={exports:{}};const fn=new Function('module','exports','require','Buffer',`${text}\n;return module.exports;`);
    const h=fn(mod,mod.exports,()=>{throw new Error('require blocked')},Buffer);if(typeof h!=='function')return null;
    let code=200,chunks=[];const res={status(n){code=n;return this},setHeader(){return this},header(){return this},set(){return this},write(x){if(x!=null)chunks.push(Buffer.isBuffer(x)?Buffer.from(x):Buffer.from(String(x)));return true},end(x){if(x!=null)chunks.push(Buffer.isBuffer(x)?Buffer.from(x):Buffer.from(String(x)));return this},send(x){if(x!=null)chunks.push(Buffer.isBuffer(x)?Buffer.from(x):Buffer.from(String(x)));return this}};
    h({query:{id:String(id)},method:'GET',headers:{}},res);if(code!==200||!chunks.length)return null;const b=Buffer.concat(chunks),t=type(b);return t&&b.length>1000?{buffer:b,...t}:null;
  }catch{return null;}
}
function recover(id){const c=history[id],fsx=files(c);for(const f of fsx){const txt=read(c,f);const x=literal(txt,id);if(x)return{...x,source:f,commit:c,method:'literal'};}for(const f of fsx.filter(f=>/\.js$/.test(f))){const x=handler(read(c,f),id);if(x)return{...x,source:f,commit:c,method:'handler'};}throw new Error(`Gift ${id}: unrecoverable ${c} ${fsx.join(',')}`);}

const manifest={},hashes=new Set();
for(let id=1;id<=20;id++){
 const r=recover(id),name=`gift-${String(id).padStart(2,'0')}.${r.ext}`;fs.writeFileSync(path.join(outDir,name),r.buffer);manifest[id]=`/assets/presentes/final/${name}`;const h=crypto.createHash('sha256').update(r.buffer).digest('hex');if(hashes.has(h))throw new Error(`Gift ${id}: duplicate image hash ${h}`);hashes.add(h);console.log(`${id}: ${name} ${r.buffer.length} ${r.mime} sha256=${h.slice(0,16)} ${r.method}:${r.source}@${r.commit.slice(0,8)}`);
}
if(hashes.size!==20)throw new Error(`Expected 20 distinct images, got ${hashes.size}`);
fs.writeFileSync(path.join(outDir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('OK: 20 static distinct images recovered.');
