module.exports = async (req, res) => {
  const GAS_URL = process.env.GAS_URL;

  // ===== CORS (por si algún navegador lo requiere) =====
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (!GAS_URL) {
    return res.status(500).json({ ok: false, error: "Falta GAS_URL en Vercel" });
  }

  try {
    // ===== GET: reenvía TODOS los query params =====
    if (req.method === "GET") {
      const url = new URL(GAS_URL);

      const q = req.query || {};
      for (const [k, v] of Object.entries(q)) {
        if (v === undefined || v === null) continue;
        url.searchParams.set(k, String(v));
      }

      const r = await fetch(url.toString(), { method: "GET" });
      const text = await r.text();

      res.status(r.status);
      // Si GAS ya regresa JSON, esto es suficiente
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.send(text);
    }

    // ===== POST: reenvía JSON tal cual =====
    if (req.method === "POST") {
      let bodyObj = {};

      if (typeof req.body === "string") {
        // por si Vercel lo entrega como string
        try {
          bodyObj = JSON.parse(req.body || "{}");
        } catch {
          bodyObj = {};
        }
      } else {
        bodyObj = req.body || {};
      }

      const r = await fetch(GAS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyObj),
      });

      const text = await r.text();

      res.status(r.status);
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.send(text);
    }

    return res.status(405).json({ ok: false, error: "Método no permitido" });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
};
