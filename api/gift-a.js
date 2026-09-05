const gifts01=require('../lib/gifts-01');
const coffee=require('../lib/coffee-local');
const robot=require('../lib/robot-local');
const gifts03=require('../lib/gifts-03');
module.exports=function(req,res){
  const id=String(req.query.id||'');
  req.query.id=id;
  if(id==='1'||id==='2') return gifts01(req,res);
  if(id==='3') return coffee(req,res);
  if(id==='4') return robot(req,res);
  if(id==='5') return gifts03(req,res);
  return res.status(404).end();
};
