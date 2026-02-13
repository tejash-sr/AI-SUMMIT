import { getShieldReport } from '../src/evidence/shield.js';

export default async function handler(req, res) {
  if (req.headers['x-api-key'] !== process.env.API_KEY) return res.status(401).end();
  const { caseId } = req.query || {};
  const report = getShieldReport(caseId);
  if (!report) return res.status(404).json({ error: 'Case not found' });
  return res.status(200).json(report);
}
