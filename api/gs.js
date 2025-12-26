module.exports = async (req, res) => {
  const GAS_URL = process.env.GAS_URL;

  if (!GAS_URL) {
    res.status(500).json({ ok: false, error: "Falta GAS_URL en Vercel" });
    return;
  }

  try {
    // ===== GET: reenvía TODOS los query params =====
    if (req.method === "GET") {
      const url = new URL(GAS_URL);

      for (const [k, v] of Object.entries(req.query || {})) {
        url.searchParams.set(k, String(v));
      }

      const r = await fetch(url.toString(), { method: "GET" });
      const text = await r.text();

      res.status(r.status);
      res.setHeader("Content-Type", "application/json");
      return res.send(text);
    }

    // ===== POST: reenvía JSON tal cual =====
    if (req.method === "POST") {
      const body =
        typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});

      const r = await fetch(GAS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await r.text();

      res.status(r.status);
      res.setHeader("Content-Type", "application/json");
      return res.send(text);
    }

    return res.status(405).json({ ok: false, error: "Método no permitido" });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
};
