export default async function handler(req,res){
  try{
    // Lê sempre a versão atual do GitHub para evitar servir um index antigo em cache.
    const r=await fetch(`https://raw.githubusercontent.com/luriske/casamento/main/index.html?v=${Date.now()}`,{cache:'no-store'});
    let html=await r.text();

    // Remove o alerta antigo e aponta o botão diretamente para a confirmação.
    html=html.replace(
      /href="#"\s+onclick="alert\([^\"]*confirmação de presença[^\"]*\);return false;"/i,
      'href="/confirmacao.html"'
    );

    // Proteção extra: mesmo que o HTML antigo mude um pouco, o botão é corrigido no cliente.
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
