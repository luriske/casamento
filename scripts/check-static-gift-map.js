const fs=require('fs'),vm=require('vm'),crypto=require('crypto');
const context={window:{}};vm.createContext(context);
for(const f of ['assets/presentes/images-1.js','assets/presentes/images-2.js','assets/presentes/images-3.js']){
  vm.runInContext(fs.readFileSync(f,'utf8'),context,{filename:f});
}
const m=context.window.GIFT_IMAGES||{};
const keys=Object.keys(m).map(Number).sort((a,b)=>a-b);
console.log('KEYS',keys.join(','));
if(keys.length!==20||keys.some((v,i)=>v!==i+1))throw new Error('Mapa não contém exatamente IDs 1-20');
const hashes=[];
for(let id=1;id<=20;id++){
 const s=m[id];if(typeof s!=='string'||!s.startsWith('data:image/'))throw new Error(`ID ${id}: data URL ausente`);
 const [head,b64]=s.split(',',2);const b=Buffer.from(b64,'base64');
 let ok=(b[0]===0xff&&b[1]===0xd8&&b[2]===0xff)||(b.slice(0,4).toString()==='RIFF'&&b.slice(8,12).toString()==='WEBP')||(b[0]===0x89&&b.slice(1,4).toString()==='PNG');
 if(!ok||b.length<1000)throw new Error(`ID ${id}: imagem inválida ${b.length}`);
 const h=crypto.createHash('sha256').update(b).digest('hex');hashes.push(h);console.log(`ID ${id}: ${head} ${b.length} bytes ${h.slice(0,16)}`);
}
if(new Set(hashes).size!==20)throw new Error('Existem imagens duplicadas');
console.log('OK_STATIC_MAP_20_VALID_DISTINCT');
