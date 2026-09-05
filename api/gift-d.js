const gifts08=require('../lib/gifts-08');
const gift17=require('../lib/gift-17');
const gift18=require('../lib/gift-18');
const gift19=require('../lib/gift-19');
const gift20=require('../lib/gift-20');
module.exports=function(req,res){
  const id=String(req.query.id||'');
  req.query.id=id;
  if(id==='16') return gifts08(req,res);
  if(id==='17') return gift17(req,res);
  if(id==='18') return gift18(req,res);
  if(id==='19') return gift19(req,res);
  if(id==='20') return gift20(req,res);
  return res.status(404).end();
};
