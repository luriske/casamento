export default async function handler(req,res){
  try{
    const host=req.headers.host;
    const proto=(req.headers['x-forwarded-proto']||'https').split(',')[0];
    const r=await fetch(`${proto}://${host}/index.html`,{cache:'no-store'});
    let html=await r.text();

    // Corrige o link antigo de RSVP e injeta uma proteção extra no cliente.
    html=html.replace(
      /href="#"\s+onclick="alert\('Aqui entraremos com o formulário definitivo de confirmação de presença\.'\);return false;"/i,
      'href="/confirmacao.html"'
    );

    const patch=`<script>(function(){function fixRSVP(){var links=[].slice.call(document.querySelectorAll('a.action'));var a=links.find(function(el){return (el.textContent||'').toLowerCase().indexOf('confirmar presença')>=0});if(a){a.setAttribute('href','/confirmacao.html');a.removeAttribute('onclick');a.onclick=null}}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',fixRSVP)}else{fixRSVP()}})();<\/script>`;
    html=html.replace('</body>',patch+'</body>');

    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.setHeader('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');
    return res.status(200).send(html);
  }catch(err){
    console.error('home error',err);
    return res.status(500).send('Erro ao carregar a página inicial.');
  }
}
