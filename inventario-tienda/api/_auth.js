import crypto from 'node:crypto';
const SECRET = () => process.env.APP_SECRET || ('k-' + (process.env.APP_PASS || ''));
const b64 = s => Buffer.from(s).toString('base64url');
export const hash = s => crypto.createHash('sha256').update(SECRET() + '|' + String(s)).digest('hex');
export function firmar(u, rol) {
  const p = b64(JSON.stringify({ u, rol, exp: Date.now() + 30 * 864e5 }));
  return p + '.' + crypto.createHmac('sha256', SECRET()).update(p).digest('base64url');
}
export function sesion(req) {
  const t = (req.headers.authorization || '').replace(/^Bearer /, '');
  const [p, f] = t.split('.');
  if (!p || !f) return null;
  const ok = crypto.createHmac('sha256', SECRET()).update(p).digest('base64url');
  if (ok.length !== f.length || !crypto.timingSafeEqual(Buffer.from(ok), Buffer.from(f))) return null;
  try { const s = JSON.parse(Buffer.from(p, 'base64url').toString()); return s.exp > Date.now() ? { u: s.u, rol: s.rol || 'dueno' } : null; } catch { return null; }
}
export function cuerpo(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { return {}; }
}
