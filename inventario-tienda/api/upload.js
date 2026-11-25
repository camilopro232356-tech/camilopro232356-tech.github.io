import { put } from '@vercel/blob';
import { valido, cuerpo } from './_auth.js';
export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };
export default async function handler(req, res) {
  if (!valido(req)) return res.status(401).json({ error: 'Sesión vencida' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  try {
    const { data } = cuerpo(req);
    if (!data || data.length > 5.5e6) return res.status(400).json({ error: 'Imagen inválida o muy grande' });
    const b = await put('fotos/producto-' + Date.now() + '.jpg', Buffer.from(data, 'base64'), { access: 'public', contentType: 'image/jpeg', addRandomSuffix: true });
    res.status(200).json({ url: b.url });
  } catch (e) { res.status(500).json({ error: 'No se pudo subir: ' + e.message }); }
}
