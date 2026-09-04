export default async function handler(req,res){
  try{
    const host=req.headers.host;
    const proto=(req.headers['x-forwarded-proto']||'https').split(',')[0];
    const r=await fetch(`${proto}://${host}/index.html`);
    let html=await r.text();
    html=html.replace(
      `href="#" onclick="alert('Aqui entraremos com o formulário definitivo de confirmação de presença.');return false;"`,
      `href="/confirmacao.html"`
    );
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.setHeader('Cache-Control','no-store');
    return res.status(200).send(html);
  }catch(err){
    console.error('home error',err);
    return res.status(500).send('Erro ao carregar a página inicial.');
  }
}
