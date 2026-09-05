const crypto = require("crypto");

function sha1(value) {
  return crypto.createHash("sha1").update(value).digest("hex");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");
  const privateKey = process.env.PAGOPAR_PRIVATE_KEY;
  if (!privateKey) return res.status(503).send("Missing configuration");

  try {
    const body = req.body || {};
    const item = body?.resultado?.[0];
    if (!item?.hash_pedido || !item?.token) return res.status(400).send("Invalid payload");

    const expected = sha1(privateKey + item.hash_pedido);
    if (expected !== item.token) return res.status(401).send("Invalid token");

    // Aqui você pode gravar em banco de dados que o presente foi pago.
    // Por enquanto validamos a notificação e registramos no log do servidor.
    console.log("Pagopar notification:", {
      hash: item.hash_pedido,
      paid: item.pagado,
      amount: item.monto,
      paymentMethod: item.forma_pago,
      receipt: item.numero_comprobante_interno
    });

    // A documentação recomenda devolver o próprio resultado recebido.
    return res.status(200).json(body.resultado);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Webhook error");
  }
};
