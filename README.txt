ALICE & LUCAS — LISTA DE PRESENTES COM CHECKOUT PAGOPAR/uPay

O que já está pronto
- Convite original incorporado no HTML.
- Lista completa de 20 presentes com fotos.
- Sem rótulos "real", "fictício" ou equivalentes.
- Layout mobile-first.
- Presente de valor livre.
- Modal de checkout com nome, e-mail, telefone e documento.
- Cartão (forma_pagamento 9).
- Transferência bancária (forma_pagamento 11).
- Backend para criar a transação no Pagopar.
- Webhook com validação SHA-1 do token.
- Endpoint para consultar o status.
- Página de retorno.

COMO COLOCAR NO AR
1) Crie um projeto no Vercel e envie todo o conteúdo desta pasta.
2) No Pagopar, abra a opção "Integrar con mi sitio web" e copie:
   - Public Key
   - Private Key
3) No Vercel > Settings > Environment Variables crie:
   PAGOPAR_PUBLIC_KEY
   PAGOPAR_PRIVATE_KEY
4) Faça novo deploy.
5) No painel Pagopar, configure:
   URL de resposta/webhook:
   https://SEU-DOMINIO/api/pagopar-webhook
   URL de resultado:
   https://SEU-DOMINIO/resultado.html

IMPORTANTE
- Não compartilhe a PRIVATE KEY por WhatsApp, HTML ou repositório público.
- Nome, e-mail e documento são pedidos porque a API do Pagopar os exige para criar a cobrança.
- Os meios 9 e 11 precisam estar habilitados na conta do comércio.
- Para controlar quantas vezes cada presente foi comprado, o próximo passo seria acrescentar um banco de dados.
- As fotos estão hospedadas no Unsplash e carregam pela internet.


DIAGNOSTICO
Após publicar, abra /diagnostico.html. Deve mostrar ready=true.
Se o pagamento falhar, o próprio site agora exibirá a mensagem real devolvida pelo Pagopar.
