export default async function handler(req,res){
  try{
    const r=await fetch(`https://raw.githubusercontent.com/luriske/casamento/main/presentes.html?v=${Date.now()}`,{cache:'no-store'});
    let html=await r.text();

    // Substitui as duas imagens externas que estavam bloqueando hotlink por fontes estáveis do Unsplash.
    html=html.replace(
      'https://images.studiokreatura.pl/2024/10/dc2fac1d-46b5-4678-be1d-d718bc5fa719.webp',
      'https://images.unsplash.com/photo-1772442363880-17ad476bdfee?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1800'
    );
    html=html.replace(
      'https://us.narwal.com/cdn/shop/articles/best-robot-vacuum-for-a-large-house-in-2024-508122.jpg?v=1725989345&width=1100',
      'https://images.unsplash.com/photo-1762500825301-569628303acb?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1800'
    );

    // QR vira o meio padrão e o cartão fica como alternativa separada.
    html=html.replace('let selectedGift=null,paymentMethod=9;','let selectedGift=null,paymentMethod=24;');
    html=html.replace('.methods{display:grid;grid-template-columns:1fr 1fr;','.methods{display:grid;grid-template-columns:repeat(3,1fr);');

    html=html.replace(
      /<div class="methods">[\s\S]*?<\/div><div class="payer-fields"/,
      `<div class="methods">
        <button class="method active" type="button" data-method="24" onclick="chooseMethod(this)"><strong>Pago QR</strong><small>Recomendado — pague com o app do seu banco.</small></button>
        <button class="method" type="button" data-method="9" onclick="chooseMethod(this)"><strong>Cartão de crédito</strong><small>Visa, Mastercard e demais bandeiras habilitadas.</small></button>
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
