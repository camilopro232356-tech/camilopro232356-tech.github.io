import { firmar, cuerpo, hash } from './_auth.js';
import { leer } from './_estado.js';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  const { u = '', p = '' } = cuerpo(req);
  const usr = u.trim().toLowerCase();
  let seg = {};
  try { seg = (await leer()).seg || {}; } catch { }
  const ownerU = (seg.ownerU || process.env.APP_USER || 'tecnocenter').toLowerCase();
  const ownerH = seg.ownerH || hash(process.env.APP_PASS || '');
  const cajaU = (seg.cajaU || process.env.CAJA_USER || 'cajero').toLowerCase();
  const cajaH = seg.cajaH || (process.env.CAJA_PASS ? hash(process.env.CAJA_PASS) : '');
  const h = hash(p);
  if (p && usr === ownerU && h === ownerH) return res.status(200).json({ token: firmar(usr, 'dueno'), rol: 'dueno', u: usr });
  if (p && cajaH && usr === cajaU && h === cajaH) return res.status(200).json({ token: firmar(usr, 'cajero'), rol: 'cajero', u: usr });
  res.status(401).json({ error: 'Usuario o clave incorrectos' });
}
