const sources={
  coffee:[
    'https://lumenall.com/static/img/1736730898.jpeg',
    'https://static.wixstatic.com/media/d45e51_fc2d90226def40e4b4bb06ce4e800223~mv2.jpg/v1/fill/w_980,h_653,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/d45e51_fc2d90226def40e4b4bb06ce4e800223~mv2.jpg'
  ],
  robot:[
    'https://img.netzwelt.de/dw1600_dh900_sw1920_sh1080_sx0_sy0_sr16x9_nu2/picture/original/2026/02/oft-saugroboter-eigenen-wohnraeume-reinigen--haengt-verschiedenen-faktoren-ab-457226.jpeg',
    'https://us.narwal.com/cdn/shop/articles/best-robot-vacuum-for-a-large-house-in-2024-508122.jpg?v=1725989345&width=1100'
  ]
};

export default async function handler(req,res){
  const id=String(req.query.id||'');
  const list=sources[id];
  if(!list)return res.status(404).send('Imagem não encontrada');

  for(const url of list){
    try{
      const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}});
      if(!r.ok)continue;
      const type=r.headers.get('content-type')||'image/jpeg';
      const buf=Buffer.from(await r.arrayBuffer());
      res.setHeader('Content-Type',type);
      res.setHeader('Cache-Control','public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
      return res.status(200).send(buf);
    }catch(e){}
  }
  return res.status(502).send('Não foi possível carregar a imagem');
}
