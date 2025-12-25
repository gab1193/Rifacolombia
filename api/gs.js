module.exports = async (req, res) => {
  const GAS_URL = process.env.GAS_URL;

  if (!GAS_URL) {
    res.status(500).json({ ok: false, error: "Falta GAS_URL en Vercel" });
    return;
  }

  try {
    // GET -> /api/gs?action=get_status
    if (req.method === "GET") {
      const action = req.query.action || "";
      const url = `${GAS_URL}?action=${encodeURIComponent(action)}`;
      const r = await fetch(url);
      const data = await r.json();
      res.status(200).json(data);
      return;
    }

    // POST -> /api/gs
    if (req.method === "POST") {
      const body = typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

      const r = await fetch(GAS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await r.text();
      let data;
      try { data = JSON.parse(text); }
      catch { data = { ok: false, error: text }; }

      res.status(200).json(data);
      return;
    }

    res.status(405).json({ ok: false, error: "Método no permitido" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.toString() });
  }
};
