export default async function handler(req, res) {
  return res.status(200).json({ uptime: process.uptime(), timestamp: Date.now() });
}
