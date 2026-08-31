const crypto = require("crypto");

function sha1(value) {
  return crypto.createHash("sha1").update(value).digest("hex");
}

function paraguayDatePlusHours(hours = 48) {
  const d = new Date(Date.now() + hours * 3600 * 1000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Asuncion",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false
  }).formatToParts(d);
  const p = Object.fromEntries(parts.filter(x => x.type !== "literal").map(x => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`;
}

module.exports = async function handler(req, res) {
  const publicKey = process.env.PAGOPAR_PUBLIC_KEY;
  const privateKey = process.env.PAGOPAR_PRIVATE_KEY;

  // Safe browser health check. Never returns either key.
  if (req.method === "GET") {
    return res.status(publicKey && privateKey ? 200 : 503).json({
      service: "alice-lucas-pagopar",
      api: "online",
      publicKeyConfigured: Boolean(publicKey),
      privateKeyConfigured: Boolean(privateKey),
      ready: Boolean(publicKey && privateKey)
    });
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!publicKey || !privateKey) {
    return res.status(503).json({
      error: "Credenciais Pagopar não estão disponíveis nesta implantação da Vercel."
    });
  }

  try {
    const { giftId, giftName, description, image, amount, paymentMethod, buyer } = req.body || {};
    const total = Math.round(Number(amount));

    if (!giftName || !Number.isFinite(total) || total < 1000) {
      return res.status(400).json({ error: "Presente ou valor inválido." });
    }
    if (!buyer?.name || !buyer?.email || !buyer?.document) {
      return res.status(400).json({ error: "Nome, e-mail e documento são obrigatórios." });
    }

    // Os meios de pagamento usados pela página são:
    // 9 = cartão de crédito/débito; 11 = transferência bancária.
    const method = [9, 11].includes(Number(paymentMethod)) ? Number(paymentMethod) : 9;
    const orderId = `AL${Date.now()}${crypto.randomBytes(3).toString("hex")}`.replace(/[^a-zA-Z0-9]/g, "");
    const token = sha1(privateKey + orderId + String(total));

    const payload = {
      token,
      comprador: {
        ruc: "",
        email: String(buyer.email).trim(),
        ciudad: 1,
        nombre: String(buyer.name).trim(),
        telefono: String(buyer.phone || "").trim(),
        direccion: "",
        documento: String(buyer.document).trim(),
        coordenadas: "",
        razon_social: String(buyer.name).trim(),
        tipo_documento: "CI",
        direccion_referencia: ""
      },
      public_key: publicKey,
      monto_total: total,
      tipo_pedido: "VENTA-COMERCIO",
      compras_items: [{
        ciudad: "1",
        nombre: String(giftName).slice(0, 120),
        cantidad: 1,
        categoria: "909",
        public_key: publicKey,
        url_imagen: String(image || ""),
        descripcion: String(description || giftName).slice(0, 240),
        id_producto: Number(giftId) || 1,
        precio_total: total,
        vendedor_telefono: "",
        vendedor_direccion: "",
        vendedor_direccion_referencia: "",
        vendedor_direccion_coordenadas: ""
      }],
      fecha_maxima_pago: paraguayDatePlusHours(48),
      id_pedido_comercio: orderId,
      descripcion_resumen: String(giftName).slice(0, 120),
      forma_pago: method
    };

    const apiResponse = await fetch("https://api.pagopar.com/api/comercios/2.0/iniciar-transaccion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const raw = await apiResponse.text();
    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      result = null;
    }

    if (!apiResponse.ok || !result?.respuesta || !result?.resultado?.[0]?.data) {
      console.error("Pagopar create error:", {
        status: apiResponse.status,
        result: result || raw
      });

      const gatewayMessage =
        typeof result?.resultado === "string"
          ? result.resultado
          : (result?.mensaje || result?.message || raw || "Resposta inválida do Pagopar.");

      return res.status(502).json({
        error: "Pagopar recusou a criação da cobrança.",
        gatewayError: gatewayMessage,
        gatewayStatus: apiResponse.status
      });
    }

    const hash = result.resultado[0].data;
    const checkoutUrl = `https://www.pagopar.com/pagos/${encodeURIComponent(hash)}?forma_pago=${method}`;

    // O hash deve ser persistido se você quiser controlar "pago/pendente" no seu próprio banco.
    return res.status(200).json({ checkoutUrl, hash, orderId });
  } catch (err) {
    console.error("create-payment exception:", err);
    return res.status(500).json({
      error: "Erro interno ao criar pagamento.",
      detail: err && err.message ? err.message : String(err)
    });
  }
};
