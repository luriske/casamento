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
  const handler=handlers[id];
  if(!handler)return res.status(404).end();

  req.query.id=id;
  let statusCode=200;
  let contentType='image/webp';
  let body=null;

  const capture={
    setHeader(name,value){if(String(name).toLowerCase()==='content-type')contentType=String(value);return capture;},
    status(code){statusCode=Number(code)||200;return capture;},
    end(data){body=data;return capture;},
    send(data){body=data;return capture;}
  };

  try{
    handler(req,capture);
  }catch(err){
    console.error('gift image handler failed',id,err);
    return res.status(500).end();
  }

  if(statusCode>=400||body==null)return res.status(statusCode>=400?statusCode:500).end();

  const buffer=Buffer.isBuffer(body)?body:Buffer.from(body);
  const mime=(contentType||'image/webp').split(';')[0].trim();
  const dataUri=`data:${mime};base64,${buffer.toString('base64')}`;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3" preserveAspectRatio="xMidYMid slice"><image href="${dataUri}" width="4" height="3" preserveAspectRatio="xMidYMid slice"/></svg>`;

  res.setHeader('Content-Type','image/svg+xml; charset=utf-8');
  res.setHeader('Cache-Control','public, max-age=31536000, immutable');
  return res.status(200).send(svg);
};
