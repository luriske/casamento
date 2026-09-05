const handlers={
  '1':require('../lib/gifts-01'),'2':require('../lib/gifts-01'),
  '3':require('../lib/coffee-local'),'4':require('../lib/robot-local'),
  '5':require('../lib/gifts-03'),'6':require('../lib/gifts-03'),
  '7':require('../lib/gifts-04'),'8':require('../lib/gifts-04'),
  '9':require('../lib/gifts-05'),'10':require('../lib/gifts-05'),
  '11':require('../lib/gifts-06'),'12':require('../lib/gifts-06'),
  '13':require('../lib/gifts-07'),'14':require('../lib/gifts-07'),
  '15':require('../lib/gifts-08'),'16':require('../lib/gifts-08'),
  '17':require('../lib/gift-17'),'18':require('../lib/gift-18'),
  '19':require('../lib/gift-19'),'20':require('../lib/gift-20')
};

module.exports=function(req,res){
  const id=String(req.query.id||'');
  if(id==='18'){
    res.setHeader('Cache-Control','no-store');
    res.setHeader('Location','/assets/presentes/gift-18.svg?v=20260905b');
    return res.status(302).end();
  }
  const h=handlers[id];
  if(!h)return res.status(404).end();
  req.query.id=id;
  return h(req,res);
};
