import { put, list, del } from '@vercel/blob';
const SEMILLA = 'https://camilopro232356-tech.github.io/inventario-tienda/datos.json';
const pad = (n, l = 3) => String(n).padStart(l, '0');
export async function leer() {
  const { blobs } = await list({ prefix: 'inv/' });
  let S;
  if (!blobs.length) {
    const d = await (await fetch(SEMILLA)).json();
    S = { items: d.items, ventas: [] };
  } else {
    blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    S = await (await fetch(blobs[0].url + '?t=' + Date.now(), { cache: 'no-store' })).json();
  }
  return migrar(S);
}
export function migrar(S) {
  if (S.v === 2) return S;
  S.v = 2;
  S.negocio = S.negocio || { nombre: S.tienda || 'Tecnocenter', nit: '', dir: '', ciudad: 'Armenia, Quindío', tel: '', pie: '¡Gracias por su compra! Cambios con factura dentro de los 8 días.' };
  delete S.tienda;
  S.items = (S.items || []).map(it => ({ cod: pad(it.id), barras: '', costo: null, min: 0, promo: null, ...it }));
  S.ventas = (S.ventas || []).map(v => v.lineas ? v : { id: 'L' + v.f, num: 'Anterior', f: v.f, user: '', rol: '', lineas: [{ id: v.id, cod: pad(v.id), n: v.n, q: v.q, p: v.t / (v.q || 1), costo: null }], sub: v.t, desc: 0, total: v.t, pago: { met: 'efectivo' }, cliente: null, anulada: false });
  S.clientes = S.clientes || []; S.abonos = S.abonos || []; S.movs = S.movs || [];
  S.consec = S.consec || 0; S.seg = S.seg || {};
  return S;
}
export async function escribir(S) {
  S.rev = Date.now();
  await put('inv/' + S.rev + '.json', JSON.stringify(S), { access: 'public', contentType: 'application/json', addRandomSuffix: true, cacheControlMaxAge: 60 });
  const { blobs } = await list({ prefix: 'inv/' });
  blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  const viejos = blobs.slice(30).map(b => b.url);
  if (viejos.length) await del(viejos).catch(() => {});
  return S.rev;
}
// Lo que cada rol puede ver
export function filtrar(S, rol) {
  const o = structuredClone(S);
  const seg = o.seg || {};
  o.seg = { cajaU: seg.cajaU || process.env.CAJA_USER || 'cajero', ownerU: seg.ownerU || process.env.APP_USER || 'tecnocenter' };
  if (rol !== 'dueno') {
    o.items.forEach(i => { delete i.costo; });
    o.ventas.forEach(v => v.lineas.forEach(l => { delete l.costo; }));
    o.movs.forEach(m => { delete m.costo; });
    delete o.seg.ownerU;
  }
  return o;
}
