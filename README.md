# Casamento Alice & Lucas

Projeto oficial do casamento, hospedado na Vercel e conectado ao Pagopar.

## Estrutura
- `index.html`: página principal do casamento
- `presentes.html`: lista de presentes
- `resultado.html`: retorno do Pagopar
- `diagnostico.html`: diagnóstico da integração
- `api/create-payment.js`: cria cobrança no Pagopar
- `api/pagopar-webhook.js`: recebe confirmação do Pagopar
- `api/payment-status.js`: consulta status do pagamento

## Variáveis da Vercel
- `PAGOPAR_PUBLIC_KEY`
- `PAGOPAR_PRIVATE_KEY`

Nunca coloque a chave privada dentro do código ou do GitHub.
