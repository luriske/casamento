export default async function handler(req,res){
  try{
    const r=await fetch('https://raw.githubusercontent.com/luriske/casamento/main/presentes.html',{cache:'no-store'});
    let html=await r.text();

    html=html.replace(
      'https://images.studiokreatura.pl/2024/10/dc2fac1d-46b5-4678-be1d-d718bc5fa719.webp',
      '/api/gift-image?id=coffee'
    );
    html=html.replace(
      'https://us.narwal.com/cdn/shop/articles/best-robot-vacuum-for-a-large-house-in-2024-508122.jpg?v=1725989345&width=1100',
      '/api/gift-image?id=robot'
    );

    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.setHeader('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');
    return res.status(200).send(html);
  }catch(err){
    console.error('presentes-page error',err);
    return res.status(500).send('Erro ao carregar a lista de presentes.');
  }
}
