export default async function handler(req, res) {
  try {
    const GAS_URL = process.env.GAS_URL; // tu /exec en variables de entorno
    if (!GAS_URL) {
      return res.status(500).json({ ok: false, error: "Falta GAS_URL en Vercel" });
    }

    const target = `${GAS_URL}?action=mp_webhook`;

    // Mercado Pago puede mandar JSON o params; reenviamos TODO
    const isGet = req.method === "GET";

    let forwardUrl = target;

    // Si viene GET con query, lo agregamos
    if (isGet) {
      const qs = new URLSearchParams(req.query).toString();
      if (qs) forwardUrl += `&${qs}`;
    }

    // Body crudo (si existe)
    let body = null;
    if (!isGet) {
      if (typeof req.body === "string") body = req.body;
      else body = JSON.stringify(req.body || {});
    }

    const mpRes = await fetch(forwardUrl, {
      method: isGet ? "GET" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: isGet ? undefined : body,
    });

    const text = await mpRes.text();

    // Respondemos 200 siempre a MP para que no reintente infinito
    return res.status(200).send(text || JSON.stringify({ ok: true }));

  } catch (err) {
    // Igual respondemos 200 para que MP no se vuelva loco con reintentos,
    // pero dejamos el error para debug.
    return res.status(200).json({ ok: false, error: String(err) });
  }
}
