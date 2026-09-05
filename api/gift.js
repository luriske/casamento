module.exports=function(req,res){
  const id=Number(req.query.id||0);
  if(!Number.isInteger(id)||id<1||id>20)return res.status(404).end();
  let group;
  if(id<=5)group='a';
  else if(id<=10)group='b';
  else if(id<=15)group='c';
  else group='d';
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('Location',`/api/gift-${group}?id=${id}&v=20260905c`);
  return res.status(302).end();
};
