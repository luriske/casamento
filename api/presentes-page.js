export default async function handler(req,res){
  try{
    const r=await fetch(`https://raw.githubusercontent.com/luriske/casamento/main/presentes.html?v=${Date.now()}`,{cache:'no-store'});
    let html=await r.text();

    const coffee='https://images.unsplash.com/photo-1772442363880-17ad476bdfee?auto=format&fit=crop&fm=jpg&q=82&w=1400';
    const robot='https://images.unsplash.com/photo-1762500825301-569628303acb?auto=format&fit=crop&fm=jpg&q=82&w=1400';

    // Corrige qualquer versão anterior dessas duas imagens.
    html=html
      .replace(/https:\/\/images\.studiokreatura\.pl\/2024\/10\/dc2fac1d-46b5-4678-be1d-d718bc5fa719\.webp/g,coffee)
      .replace(/https:\/\/us\.narwal\.com\/cdn\/shop\/articles\/best-robot-vacuum-for-a-large-house-in-2024-508122\.jpg\?v=1725989345&width=1100/g,robot)
      .replace(/https:\/\/images\.unsplash\.com\/photo-1772442363880-17ad476bdfee[^'\"]*/g,coffee)
      .replace(/https:\/\/images\.unsplash\.com\/photo-1762500825301-569628303acb[^'\"]*/g,robot)
      .replace(/\/api\/gift-image\?id=coffee/g,coffee)
      .replace(/\/api\/gift-image\?id=robot/g,robot);

    // Se uma imagem externa falhar, não deixa o cartão quebrado visualmente.
    html=html.replace(
      '<img class="photo" src="${safe(g.img)}" alt="${safe(g.name)}" loading="lazy" referrerpolicy="no-referrer">',
      '<img class="photo" src="${safe(g.img)}" alt="${safe(g.name)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src=\'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&q=75&w=1200\'">'
    );

    // QR vira o meio padrão e o cartão fica como alternativa separada.
    html=html.replace('let selectedGift=null,paymentMethod=9;','let selectedGift=null,paymentMethod=24;');
    html=html.replace('.methods{display:grid;grid-template-columns:1fr 1fr;','.methods{display:grid;grid-template-columns:repeat(3,1fr);');
    html=html.replace(
      /<div class="methods">[\s\S]*?<\/div><div class="payer-fields"/,
      `<div class="methods">
        <button class="method active" type="button" data-method="24" onclick="chooseMethod(this)"><strong>Pago QR</strong><small>Recomendado — pague com o app do seu banco.</small></button>
        <button class="method" type="button" data-method="9" onclick="chooseMethod(this)"><strong>Cartão de crédito</strong><small>Use esta opção somente se o cartão estiver habilitado pelo Pagopar.</small></button>
        <button class="method" type="button" data-method="11" onclick="chooseMethod(this)"><strong>Transferência bancária direta</strong><small>Use os dados da conta sem passar pelo gateway.</small></button>
      </div><div class="payer-fields"`
    );

    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.setHeader('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');
    return res.status(200).send(html);
  }catch(err){
    console.error('presentes-page error',err);
    return res.status(500).send('Erro ao carregar a lista de presentes.');
  }
}
