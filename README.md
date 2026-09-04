# Casamento Alice & Lucas

Projeto oficial do casamento, hospedado na Vercel e conectado ao Pagopar.

## Estrutura
- `home.html`: página principal ativa do casamento
- `confirmacao.html`: confirmação de presença (Sim/Não + quantidade)
- `presentes.html`: lista de presentes
- `resultado.html`: retorno do Pagopar
- `diagnostico.html`: diagnóstico da integração
- `api/create-payment.js`: cria cobrança no Pagopar
- `api/pagopar-webhook.js`: recebe confirmação do Pagopar
- `api/payment-status.js`: consulta status do pagamento
- `assets/presentes/`: imagens locais dos presentes críticos

## Variáveis da Vercel
- `PAGOPAR_PUBLIC_KEY`
- `PAGOPAR_PRIVATE_KEY`

Nunca coloque a chave privada dentro do código ou do GitHub.
