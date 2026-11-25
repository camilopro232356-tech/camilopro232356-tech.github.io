import crypto from 'node:crypto';
const SECRET = () => process.env.APP_SECRET || ('k-' + (process.env.APP_PASS || ''));
const b64 = s => Buffer.from(s).toString('base64url');
export function firmar(u) {
  const p = b64(JSON.stringify({ u, exp: Date.now() + 30 * 864e5 }));
  return p + '.' + crypto.createHmac('sha256', SECRET()).update(p).digest('base64url');
}
export function valido(req) {
  const t = (req.headers.authorization || '').replace(/^Bearer /, '');
  const [p, f] = t.split('.');
  if (!p || !f) return false;
  const ok = crypto.createHmac('sha256', SECRET()).update(p).digest('base64url');
  if (ok.length !== f.length || !crypto.timingSafeEqual(Buffer.from(ok), Buffer.from(f))) return false;
  try { return JSON.parse(Buffer.from(p, 'base64url').toString()).exp > Date.now(); } catch { return false; }
}
export function cuerpo(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { return {}; }
}
