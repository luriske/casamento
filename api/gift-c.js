const gifts06=require('../lib/gifts-06');
const gifts07=require('../lib/gifts-07');
const gifts08=require('../lib/gifts-08');
module.exports=function(req,res){
  const id=String(req.query.id||'');
  req.query.id=id;
  if(id==='11'||id==='12') return gifts06(req,res);
  if(id==='13'||id==='14') return gifts07(req,res);
  if(id==='15') return gifts08(req,res);
  return res.status(404).end();
};
