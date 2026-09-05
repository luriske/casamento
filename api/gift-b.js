const gifts03=require('../lib/gifts-03');
const gifts04=require('../lib/gifts-04');
const gifts05=require('../lib/gifts-05');
module.exports=function(req,res){
  const id=String(req.query.id||'');
  req.query.id=id;
  if(id==='6') return gifts03(req,res);
  if(id==='7'||id==='8') return gifts04(req,res);
  if(id==='9'||id==='10') return gifts05(req,res);
  return res.status(404).end();
};
