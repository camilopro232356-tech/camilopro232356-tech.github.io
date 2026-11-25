import { firmar, cuerpo } from './_auth.js';
export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  const { u = '', p = '' } = cuerpo(req);
  const U = (process.env.APP_USER || 'admin').trim().toLowerCase(), P = process.env.APP_PASS || '';
  if (!P || u.trim().toLowerCase() !== U || p !== P) return res.status(401).json({ error: 'Usuario o clave incorrectos' });
  res.status(200).json({ token: firmar(U) });
}
