import { put, list, del } from '@vercel/blob';
import { valido, cuerpo } from './_auth.js';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!valido(req)) return res.status(401).json({ error: 'Sesión vencida' });
  try {
    if (req.method === 'GET') {
      const { blobs } = await list({ prefix: 'inv/' });
      if (!blobs.length) return res.status(200).json({ vacio: true });
      blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      const r = await fetch(blobs[0].url + '?t=' + Date.now(), { cache: 'no-store' });
      return res.status(200).json({ estado: await r.json() });
    }
    if (req.method === 'POST') {
      const { estado } = cuerpo(req);
      if (!estado || !Array.isArray(estado.items)) return res.status(400).json({ error: 'Datos inválidos' });
      estado.rev = Date.now();
      await put('inv/' + estado.rev + '.json', JSON.stringify(estado), { access: 'public', contentType: 'application/json', addRandomSuffix: true, cacheControlMaxAge: 60 });
      const { blobs } = await list({ prefix: 'inv/' });
      blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      const viejos = blobs.slice(15).map(b => b.url);
      if (viejos.length) await del(viejos);
      return res.status(200).json({ ok: true, rev: estado.rev });
    }
    res.status(405).json({ error: 'Método no permitido' });
  } catch (e) { res.status(500).json({ error: 'Error del servidor: ' + e.message }); }
}
