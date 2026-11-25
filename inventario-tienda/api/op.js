import { sesion, cuerpo, hash } from './_auth.js';
import { leer, escribir, filtrar } from './_estado.js';

const METODOS = ['efectivo', 'nequi', 'daviplata', 'tarjeta', 'transferencia', 'credito'];
const ent = v => Number.isFinite(+v) ? Math.round(+v) : NaN;
const txt = (v, n = 120) => String(v ?? '').trim().slice(0, n);
const pad = (n, l) => String(n).padStart(l, '0');
class Err extends Error { constructor(m, c = 400) { super(m); this.c = c; } }
const soloDueno = s => { if (s.rol !== 'dueno') throw new Err('Solo el dueño puede hacer esto', 403); };
const pinOk = (S, pin) => !!pin && hash(pin) === (S.seg.pinH || hash(process.env.OWNER_PIN || ''));
const saldo = (S, cid) => S.ventas.filter(v => v.cliente === cid && v.pago.met === 'credito' && !v.anulada).reduce((a, v) => a + v.total, 0)
  - S.abonos.filter(a => a.cliente === cid && !a.anulado).reduce((a, x) => a + x.valor, 0);

const OPS = {
  venta(S, s, b) {
    const lineas = Array.isArray(b.lineas) ? b.lineas : [];
    if (!lineas.length) throw new Err('La venta no tiene productos');
    const out = []; let sub = 0;
    for (const l of lineas) {
      const it = S.items.find(i => i.id === +l.id); const q = ent(l.q);
      if (!it) throw new Err('Producto no encontrado');
      if (!(q > 0)) throw new Err('Cantidad inválida en ' + it.n);
      const p = it.promo > 0 ? it.promo : it.p;
      if (!(p >= 0) || p === null) throw new Err(it.n + ' no tiene precio. El dueño debe ponerle precio.');
      if ((it.q || 0) < q && !(b.forzar && s.rol === 'dueno')) throw new Err(`Solo hay ${it.q || 0} unidad(es) de ${it.n}`);
      out.push({ id: it.id, cod: it.cod, n: it.n + (it.m ? ' ' + it.m : ''), q, p, base: it.p, costo: it.costo ?? null }); sub += p * q;
    }
    let desc = 0, aut = '';
    if (b.desc && +b.desc.valor > 0) {
      if (s.rol !== 'dueno' && !pinOk(S, b.pin)) throw new Err('PIN del dueño incorrecto: el descuento no fue autorizado', 403);
      desc = b.desc.tipo === '%' ? Math.round(sub * Math.min(100, +b.desc.valor) / 100) : Math.min(sub, ent(b.desc.valor));
      aut = s.rol === 'dueno' ? s.u : 'PIN del dueño';
    }
    const total = sub - desc;
    const met = METODOS.includes(b.pago?.met) ? b.pago.met : 'efectivo';
    let cliente = null;
    if (met === 'credito') {
      cliente = S.clientes.find(c => c.id === b.cliente);
      if (!cliente) throw new Err('Para vender a crédito seleccione o cree el cliente');
    }
    const recibido = met === 'efectivo' ? Math.max(ent(b.pago?.recibido) || total, total) : total;
    for (const l of out) {
      const it = S.items.find(i => i.id === l.id); it.q = (it.q || 0) - l.q;
    }
    S.consec = (S.consec || 0) + 1;
    const v = { id: 'V' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), num: 'TC-' + pad(S.consec, 6), f: Date.now(), user: s.u, rol: s.rol, lineas: out, sub, desc, descMotivo: txt(b.desc?.motivo), descAut: aut, total, pago: { met, recibido, cambio: recibido - total }, cliente: cliente?.id || null, clienteN: cliente?.nombre || txt(b.clienteN, 60) || '', anulada: false };
    S.ventas.push(v);
    out.forEach(l => S.movs.push({ f: v.f, tipo: 'salida', id: l.id, cod: l.cod, n: l.n, q: l.q, nota: 'Venta ' + v.num, user: s.u }));
    return { venta: v };
  },
  anular(S, s, b) {
    soloDueno(s);
    const v = S.ventas.find(x => x.id === b.id);
    if (!v || v.anulada) throw new Err('Venta no encontrada o ya anulada');
    v.anulada = true; v.anuladaPor = s.u; v.anuladaF = Date.now(); v.motivoAnul = txt(b.motivo);
    v.lineas.forEach(l => { const it = S.items.find(i => i.id === l.id); if (it) it.q = (it.q || 0) + l.q; S.movs.push({ f: Date.now(), tipo: 'devolucion', id: l.id, cod: l.cod, n: l.n, q: l.q, nota: 'Anulación ' + v.num, user: s.u }); });
  },
  cliente(S, s, b) {
    const nombre = txt(b.nombre, 80); if (!nombre) throw new Err('Escriba el nombre del cliente');
    let c = b.id && S.clientes.find(x => x.id === b.id);
    if (!c) { c = { id: 'C' + Date.now().toString(36), f: Date.now() }; S.clientes.push(c); }
    Object.assign(c, { nombre, doc: txt(b.doc, 30), tel: txt(b.tel, 30), dir: txt(b.dir, 100), cupo: s.rol === 'dueno' ? (ent(b.cupo) || 0) : (c.cupo || 0) });
    return { cliente: c };
  },
  abono(S, s, b) {
    const c = S.clientes.find(x => x.id === b.cliente); if (!c) throw new Err('Cliente no encontrado');
    const valor = ent(b.valor), sal = saldo(S, c.id);
    if (!(valor > 0)) throw new Err('Valor del abono inválido');
    if (valor > sal) throw new Err('El abono supera el saldo pendiente');
    const a = { id: 'A' + Date.now().toString(36), f: Date.now(), cliente: c.id, clienteN: c.nombre, valor, met: METODOS.includes(b.met) && b.met !== 'credito' ? b.met : 'efectivo', user: s.u, saldoDespues: sal - valor };
    S.abonos.push(a); return { abono: a };
  },
  producto(S, s, b) {
    soloDueno(s);
    const p = b.p || {}; let it = p.id && S.items.find(i => i.id === +p.id);
    const nuevo = !it;
    const cod = txt(p.cod, 30) || (nuevo ? pad(Math.max(0, ...S.items.map(i => i.id)) + 1, 3) : it.cod);
    if (S.items.some(i => i !== it && i.cod.toLowerCase() === cod.toLowerCase())) throw new Err('El código ' + cod + ' ya existe');
    const barras = txt(p.barras, 40);
    if (barras && S.items.some(i => i !== it && i.barras === barras)) throw new Err('Ese código de barras ya está en otro producto');
    if (!txt(p.n)) throw new Err('Escriba el nombre del producto');
    const num = v => v === '' || v === null || v === undefined ? null : Math.max(0, ent(v));
    if (nuevo) { it = { id: Math.max(0, ...S.items.map(i => i.id)) + 1, h: 0, pct: false, q: 0 }; S.items.push(it); }
    const antes = it.q || 0;
    Object.assign(it, { cod, barras, n: txt(p.n), m: txt(p.m), c: txt(p.c) || 'Sin categoría', p: num(p.p), costo: num(p.costo), promo: num(p.promo) || null, min: num(p.min) || 0, nota: txt(p.nota, 200) });
    if ('foto' in p) it.foto = /^https:\/\//.test(p.foto || '') ? p.foto : '';
    if (p.q !== undefined && p.q !== '' && ent(p.q) !== antes) {
      it.q = Math.max(0, ent(p.q));
      S.movs.push({ f: Date.now(), tipo: nuevo ? 'entrada' : 'ajuste', id: it.id, cod: it.cod, n: it.n, q: it.q - antes, nota: nuevo ? 'Producto nuevo' : 'Ajuste de existencias (antes ' + antes + ')', user: s.u, costo: it.costo });
    }
    return { item: it };
  },
  eliminar(S, s, b) { soloDueno(s); const i = S.items.findIndex(x => x.id === +b.id); if (i < 0) throw new Err('No existe'); S.items.splice(i, 1); },
  entrada(S, s, b) {
    soloDueno(s);
    const it = S.items.find(i => i.id === +b.id); const q = ent(b.q);
    if (!it) throw new Err('Producto no encontrado'); if (!(q > 0)) throw new Err('Cantidad inválida');
    it.q = (it.q || 0) + q;
    if (b.costo !== undefined && b.costo !== '' && ent(b.costo) >= 0) it.costo = ent(b.costo);
    S.movs.push({ f: Date.now(), tipo: 'entrada', id: it.id, cod: it.cod, n: it.n + (it.m ? ' ' + it.m : ''), q, nota: txt(b.nota) || 'Compra de mercancía', user: s.u, costo: it.costo ?? null });
  },
  negocio(S, s, b) { soloDueno(s); const n = b.negocio || {}; S.negocio = { nombre: txt(n.nombre, 60) || 'Tecnocenter', nit: txt(n.nit, 40), dir: txt(n.dir, 100), ciudad: txt(n.ciudad, 60), tel: txt(n.tel, 40), pie: txt(n.pie, 300), regimen: txt(n.regimen, 120) }; },
  seguridad(S, s, b) {
    soloDueno(s);
    if (b.cajaU) S.seg.cajaU = txt(b.cajaU, 30).toLowerCase();
    if (b.cajaP) { if (String(b.cajaP).length < 4) throw new Err('La clave del cajero debe tener al menos 4 caracteres'); S.seg.cajaH = hash(b.cajaP); }
    if (b.ownerP) { if (String(b.ownerP).length < 6) throw new Err('Su clave debe tener al menos 6 caracteres'); S.seg.ownerH = hash(b.ownerP); }
    if (b.pin) { if (!/^\d{4,6}$/.test(b.pin)) throw new Err('El PIN debe tener de 4 a 6 números'); S.seg.pinH = hash(b.pin); }
  },
  validarPin(S, s, b) { if (!pinOk(S, b.pin)) throw new Err('PIN incorrecto', 403); return { ok: true, sinGuardar: true }; }
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const s = sesion(req);
  if (!s) return res.status(401).json({ error: 'Sesión vencida' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  const b = cuerpo(req);
  const fn = OPS[b.op];
  if (!fn) return res.status(400).json({ error: 'Operación desconocida' });
  try {
    const S = await leer();
    const r = fn(S, s, b) || {};
    if (!r.sinGuardar) await escribir(S);
    if (s.rol !== 'dueno' && r.venta) r.venta = filtrar({ ...S, ventas: [r.venta], items: [], movs: [] }, s.rol).ventas[0];
    res.status(200).json({ ...r, estado: filtrar(S, s.rol) });
  } catch (e) { res.status(e.c || 500).json({ error: e.c ? e.message : 'Error del servidor: ' + e.message }); }
}
