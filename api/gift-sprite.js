const p1=require('./sprite-part1');
const p2=require('./sprite-part2');
const p3=require('./sprite-part3');

module.exports=(req,res)=>{
  const data=Buffer.from(p1+p2+p3,'base64');
  res.setHeader('Content-Type','image/webp');
  res.setHeader('Cache-Control','public, max-age=31536000, immutable');
  res.status(200).send(data);
};
