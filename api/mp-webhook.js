export default async function handler(req, res) {
  // Mercado Pago: siempre 200 para evitar reintentos infinitos
  const ok200 = (payload) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(200).send(
      typeof payload === "string" ? payload : JSON.stringify(payload || { ok: true })
    );
  };

  try {
    const GAS_URL = process.env.GAS_URL; // tu /exec
    if (!GAS_URL) {
      return ok200({ ok: false, error: "Falta GAS_URL en Vercel" });
    }

    const base = new URL(GAS_URL);
    base.searchParams.set("action", "mp_webhook");

    // Reenviar query params (si vienen)
    const q = req.query || {};
    for (const [k, v] of Object.entries(q)) {
      if (v === undefined || v === null) continue;
      base.searchParams.set(k, String(v));
    }

    const isGet = req.method === "GET";

    let forwardBody = null;

    // MP puede mandar body en POST (JSON)
    if (!isGet) {
      if (typeof req.body === "string") {
        forwardBody = req.body; // ya viene crudo
      } else {
        forwardBody = JSON.stringify(req.body || {});
      }
    }

    const mpRes = await fetch(base.toString(), {
      method: isGet ? "GET" : "POST",
      headers: { "Content-Type": "application/json" },
      body: isGet ? undefined : forwardBody,
    });

    const text = await mpRes.text();

    // Respondemos 200 SIEMPRE, pero regresamos el texto para debug
    if (text && text.trim().length) return ok200(text);
    return ok200({ ok: true });
  } catch (err) {
    return ok200({ ok: false, error: String(err) });
  }
}
