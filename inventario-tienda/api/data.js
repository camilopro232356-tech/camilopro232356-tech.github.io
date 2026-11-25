import { sesion } from './_auth.js';
import { leer, filtrar } from './_estado.js';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const s = sesion(req);
  if (!s) return res.status(401).json({ error: 'Sesión vencida' });
  try {
    const S = await leer();
    if (req.query?.rev && +req.query.rev === S.rev) return res.status(200).json({ igual: true });
    res.status(200).json({ estado: filtrar(S, s.rol), yo: s });
  } catch (e) { res.status(500).json({ error: 'Error del servidor: ' + e.message }); }
}
