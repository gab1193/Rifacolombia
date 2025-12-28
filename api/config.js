export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    gas_url: process.env.GAS_URL || ""
  });
}
