const crypto = require("crypto");
function sha1(v){return crypto.createHash("sha1").update(v).digest("hex");}

module.exports = async function handler(req,res){
  const publicKey=process.env.PAGOPAR_PUBLIC_KEY||"1814cd5994c5e9127038c6b6df25a158";
  const privateKey=process.env.PAGOPAR_PRIVATE_KEY;
  const hash=req.query?.hash || req.query?.hash_pedido;
  if(!publicKey||!privateKey) return res.status(503).json({error:"Missing configuration"});
  if(!hash) return res.status(400).json({error:"Missing hash"});

  try{
    const r=await fetch("https://api.pagopar.com/api/pedidos/1.1/traer",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        hash_pedido:String(hash),
        token:sha1(privateKey+"CONSULTA"),
        token_publico:publicKey
      })
    });
    const data=await r.json();
    return res.status(r.ok?200:502).json(data);
  }catch(e){
    console.error(e);
    return res.status(500).json({error:"Status lookup failed"});
  }
};
