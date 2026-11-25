/* Mega Muebles HL — catálogo, carrito de cotización y WhatsApp (compartido por las 3 propuestas) */
(function () {
  const WA = '573229498300';
  const BASE = document.documentElement.dataset.base || '';
  const IMG = (n) => BASE + 'img/' + n + '.jpg';

  const PRODUCTS = [
    { id: 'comedor-madera', cat: 'Comedores', name: 'Comedor en madera y vidrio', tag: 'Más vendido', img: 'comedor-madera',
      desc: 'Comedor de 4 puestos con sillas de espaldar tallado en madera maciza, cubierta en vidrio templado y asiento tapizado.' },
    { id: 'comedor-taburetes', cat: 'Comedores', name: 'Comedor compacto con taburetes', tag: 'Ahorra espacio', img: 'comedor-taburetes',
      desc: 'Mesa en madera con 4 taburetes tapizados que se guardan debajo. Ideal para apartamentos y espacios pequeños.' },
    { id: 'comedor-redondo', cat: 'Comedores', name: 'Comedor redondo tapizado', tag: 'Nuevo', img: 'comedor-redondo',
      desc: 'Mesa redonda con cubierta tipo mármol y sillas tapizadas con patas en madera. Elegante y moderno.' },
    { id: 'comedor-tapizado', cat: 'Comedores', name: 'Comedor con sillas acanaladas', tag: '', img: 'comedor-tapizado',
      desc: 'Comedor rectangular con sillas de espaldar acanalado en tela suave. Disponible en 4, 6 u 8 puestos.' },
    { id: 'sala-l', cat: 'Salas', name: 'Sala en L tapizada', tag: 'Personalizable', img: 'sala-l',
      desc: 'Sala esquinera con espaldar acanalado, cojines decorativos incluidos. Elige tela, color y medidas.' },
    { id: 'sofa-capitoneado', cat: 'Salas', name: 'Sofá capitoneado + poltronas', tag: '', img: 'sofa-capitoneado',
      desc: 'Sofá con espaldar capitoneado, poltronas giratorias y mesa auxiliar. Un toque clásico para tu sala.' },
    { id: 'poltronas', cat: 'Salas', name: 'Poltronas y mesa auxiliar', tag: '', img: 'poltronas',
      desc: 'Poltronas en terciopelo con mesa auxiliar de diseño nórdico. Perfectas para complementar tu sala.' },
    { id: 'peinador', cat: 'Alcobas', name: 'Peinador con espejo de luces', tag: 'Tendencia', img: 'peinador',
      desc: 'Tocador tipo camerino con espejo iluminado y cajonera. Disponible en varios acabados de madera y MDF.' },
    { id: 'colchones', cat: 'Alcobas', name: 'Colchones y base camas', tag: '', img: 'colchones',
      desc: 'Colchones sencillos, semidobles, dobles, queen y king. Pregunta por combos con base cama.' },
    { id: 'closet', cat: 'Alcobas', name: 'Closet y alacenas', tag: '', img: 'closet',
      desc: 'Closets, alacenas y cajoneras a la medida, en madera o MDF, con los herrajes y el acabado que prefieras.' },
  ];

  const MATERIALS = ['Madera de roble', 'Otra madera (a elección)', 'MDF (opción económica)'];
  const COJIN = ['Con cojinería', 'Sin cojinería'];
  const COLORS = [
    ['Beige', '#d9cbb5'], ['Gris', '#9a9a9d'], ['Rosa palo', '#d58b8f'], ['Mostaza', '#d4a12a'],
    ['Verde', '#3f6b56'], ['Azul', '#2f4a7a'], ['Blanco hueso', '#f1ece2'], ['Café', '#6b4a33'],
  ];
  const EXTRA = ['Camas', 'Sofá camas', 'Cajoneras', 'Gabinetes de cocina', 'Mesas para TV', 'Electrodomésticos', 'Espejos', 'Mesas para equipo'];

  /* ---------- Carrito (memoria + localStorage protegido) ---------- */
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('mm_cart') || '[]') || []; } catch (e) { cart = []; }
  const save = () => { try { localStorage.setItem('mm_cart', JSON.stringify(cart)); } catch (e) {} };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function count() { return cart.reduce((a, i) => a + i.qty, 0); }

  function renderCount() {
    $$('[data-cart-count]').forEach((el) => { el.textContent = count(); el.classList.toggle('show', count() > 0); });
  }

  function add(item) {
    const key = [item.id, item.mat, item.coj, item.color].join('|');
    const f = cart.find((i) => i.key === key);
    if (f) f.qty += item.qty; else cart.push(Object.assign({ key }, item));
    save(); renderCount(); renderCart(); toast('Agregado al carrito ✓');
    $$('[data-cart-count]').forEach((el) => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); });
  }

  function renderCart() {
    const list = $('#cartList'); if (!list) return;
    if (!cart.length) {
      list.innerHTML = '<div class="cart-empty"><p>Tu carrito está vacío.</p><small>Agrega los muebles que te gustan y te enviamos la cotización por WhatsApp.</small></div>';
    } else {
      list.innerHTML = cart.map((i, n) => `
        <div class="cart-item">
          <img src="${IMG(i.img)}" alt="">
          <div class="ci-body">
            <strong>${esc(i.name)}</strong>
            <small>${esc(i.mat)} · ${esc(i.coj)} · Tela ${esc(i.color)}</small>
            <div class="ci-qty">
              <button data-q="${n}" data-d="-1" aria-label="Menos">−</button><span>${i.qty}</span><button data-q="${n}" data-d="1" aria-label="Más">+</button>
              <button class="ci-del" data-del="${n}">Quitar</button>
            </div>
          </div>
        </div>`).join('');
    }
    updateSend();
  }

  /* Abre siempre el WhatsApp normal (no Business). En Android se fuerza la app com.whatsapp;
     si no la tiene instalada, cae a wa.me. En iPhone y computador se usa wa.me. */
  const ANDROID = /Android/i.test(navigator.userAgent);
  function waLink(text) {
    const web = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text);
    if (!ANDROID) return web;
    return 'intent://send?phone=' + WA + '&text=' + encodeURIComponent(text) +
      '#Intent;scheme=whatsapp;package=com.whatsapp;S.browser_fallback_url=' + encodeURIComponent(web) + ';end';
  }

  function updateSend() {
    const btn = $('#cartSend'); if (!btn) return;
    btn.classList.toggle('disabled', !cart.length);
    btn.href = cart.length ? waLink(buildMsg()) : '#';
  }
  function buildMsg() {
    const name = ($('#cartName') && $('#cartName').value.trim()) || '';
    const lines = cart.map((i, n) => `${n + 1}. ${i.name} x${i.qty}\n   • ${i.mat}\n   • ${i.coj}\n   • Color de tela: ${i.color}`);
    const msg = `¡Hola Mega Muebles! 👋${name ? ' Soy ' + name + '.' : ''}\nQuiero cotizar estos muebles:\n\n${lines.join('\n')}\n\n¿Me pueden dar precio y tiempo de entrega? Gracias.`;
    return msg;
  }

  /* ---------- Catálogo ---------- */
  let current = 'Todos';
  function renderGrid() {
    const grid = $('#grid'); if (!grid) return;
    const items = PRODUCTS.filter((p) => current === 'Todos' || p.cat === current);
    grid.innerHTML = items.map((p) => `
      <article class="card" data-open="${p.id}">
        <div class="card-img"><img src="${IMG(p.img)}" alt="${esc(p.name)}" loading="lazy">${p.tag ? `<span class="card-tag">${p.tag}</span>` : ''}</div>
        <div class="card-body">
          <span class="card-cat">${p.cat}</span>
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.desc)}</p>
          <div class="card-foot">
            <span class="card-price">Precio a tu medida</span>
            <button class="card-add" data-open="${p.id}">Personalizar y agregar</button>
          </div>
        </div>
      </article>`).join('');
  }
  function renderFilters() {
    const f = $('#filters'); if (!f) return;
    const cats = ['Todos'].concat([...new Set(PRODUCTS.map((p) => p.cat))]);
    f.innerHTML = cats.map((c) => `<button class="${c === current ? 'active' : ''}" data-cat="${c}">${c}</button>`).join('');
  }
  function renderExtra() {
    const e = $('#extra'); if (!e) return;
    e.innerHTML = EXTRA.map((x) => `<a href="${waLink('¡Hola Mega Muebles! Quiero información sobre ' + x.toLowerCase() + '.')}" target="${ANDROID ? '_self' : '_blank'}" rel="noopener">${x}<span>→</span></a>`).join('');
  }

  /* ---------- Modal de personalización ---------- */
  function openProduct(id) {
    const p = PRODUCTS.find((x) => x.id === id); if (!p) return;
    const m = $('#pmodal');
    m.innerHTML = `
      <div class="pm-box" role="dialog" aria-modal="true" aria-label="${esc(p.name)}">
        <button class="pm-close" data-close aria-label="Cerrar">×</button>
        <div class="pm-img"><img src="${IMG(p.img)}" alt="${esc(p.name)}"></div>
        <div class="pm-body">
          <span class="card-cat">${p.cat}</span>
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.desc)}</p>
          <label>Material</label>
          <div class="pm-opts" data-group="mat">${MATERIALS.map((x, i) => `<button class="${i === 0 ? 'on' : ''}" data-v="${x}">${x}</button>`).join('')}</div>
          <label>Cojinería</label>
          <div class="pm-opts" data-group="coj">${COJIN.map((x, i) => `<button class="${i === 0 ? 'on' : ''}" data-v="${x}">${x}</button>`).join('')}</div>
          <label>Color de tela <em id="pmColorName">Beige</em></label>
          <div class="pm-swatches" data-group="color">${COLORS.map((c, i) => `<button class="${i === 0 ? 'on' : ''}" data-v="${c[0]}" title="${c[0]}" style="--sw:${c[1]}"></button>`).join('')}</div>
          <div class="pm-row">
            <div class="pm-qty"><button data-pq="-1">−</button><span id="pmQty">1</span><button data-pq="1">+</button></div>
            <button class="pm-add" id="pmAdd">Agregar al carrito</button>
          </div>
          <a class="pm-wa" target="${ANDROID ? '_self' : '_blank'}" rel="noopener" href="${waLink('¡Hola Mega Muebles! Me interesa: ' + p.name + '. ¿Me dan más información?')}">Preguntar por WhatsApp</a>
        </div>
      </div>`;
    m.classList.add('open'); document.body.classList.add('lock');
    let qty = 1;
    m.onclick = (ev) => {
      const t = ev.target;
      if (t === m || t.closest('[data-close]')) return closeModal();
      const opt = t.closest('[data-group] button');
      if (opt) {
        $$('button', opt.parentElement).forEach((b) => b.classList.remove('on')); opt.classList.add('on');
        if (opt.parentElement.dataset.group === 'color') $('#pmColorName').textContent = opt.dataset.v;
      }
      const pq = t.closest('[data-pq]');
      if (pq) { qty = Math.max(1, qty + Number(pq.dataset.pq)); $('#pmQty').textContent = qty; }
      if (t.closest('#pmAdd')) {
        const g = (k) => $(`[data-group="${k}"] .on`, m).dataset.v;
        add({ id: p.id, name: p.name, img: p.img, mat: g('mat'), coj: g('coj'), color: g('color'), qty });
        closeModal(); openCart();
      }
    };
  }
  function closeModal() { const m = $('#pmodal'); m.classList.remove('open'); document.body.classList.remove('lock'); }
  function openCart() { $('#cart').classList.add('open'); $('#cartShade').classList.add('open'); renderCart(); }
  function closeCart() { $('#cart').classList.remove('open'); $('#cartShade').classList.remove('open'); }

  let tt;
  function toast(t) {
    let el = $('#toast'); if (!el) { el = document.createElement('div'); el.id = 'toast'; document.body.appendChild(el); }
    el.textContent = t; el.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('show'), 1800);
  }

  /* ---------- Estructura común: carrito, modal y botón WhatsApp ---------- */
  function injectShell() {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="cartShade"></div>
      <aside id="cart" aria-label="Carrito">
        <header><h3>Tu carrito</h3><button id="cartClose" aria-label="Cerrar">×</button></header>
        <div id="cartList"></div>
        <footer>
          <p class="cart-note">Te enviamos precio, opciones de tela y tiempo de entrega por WhatsApp. Aceptamos sistema de separado, Addi y Sistecrédito.</p>
          <input id="cartName" placeholder="Tu nombre (opcional)">
          <a id="cartSend" class="disabled" href="#" target="${ANDROID ? '_self' : '_blank'}" rel="noopener"><svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="${WA_PATH}"/></svg> Enviar pedido por WhatsApp</a>
        </footer>
      </aside>
      <div id="pmodal"></div>
      ${BASE ? '<a class="back-prop" href="' + BASE + 'index.html">← Ver las 3 propuestas</a>' : ''}
      <a class="wa-float" href="${waLink('¡Hola Mega Muebles! Quiero información sobre sus muebles.')}" target="${ANDROID ? '_self' : '_blank'}" rel="noopener" aria-label="Escríbenos por WhatsApp">
        <svg viewBox="0 0 24 24" width="30" height="30"><path fill="#fff" d="${WA_PATH}"/></svg><span>¿Te ayudamos?</span>
      </a>`);
  }

  const WA_PATH = 'M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.42-9.44 9.42m8.03-17.45A11.27 11.27 0 0 0 12.05.72C5.79.72.7 5.8.7 12.07c0 2 .52 3.95 1.52 5.67L.6 23.6l6-1.57a11.33 11.33 0 0 0 5.43 1.38h.01c6.26 0 11.35-5.09 11.35-11.35 0-3.03-1.18-5.88-3.32-8.02';

  window.MM = { waLink, WA_PATH, openCart };

  document.addEventListener('DOMContentLoaded', () => {
    injectShell(); renderFilters(); renderGrid(); renderExtra(); renderCount(); renderCart();
    $$('[data-wa]').forEach((a) => { a.href = waLink(a.dataset.wa || '¡Hola Mega Muebles! Quiero información.'); a.target = ANDROID ? '_self' : '_blank'; a.rel = 'noopener'; });
    document.addEventListener('click', (ev) => {
      const t = ev.target;
      const op = t.closest('[data-open]'); if (op) { ev.preventDefault(); openProduct(op.dataset.open); return; }
      const c = t.closest('[data-cat]'); if (c) { current = c.dataset.cat; renderFilters(); renderGrid(); return; }
      if (t.closest('[data-cart-open]')) { ev.preventDefault(); openCart(); return; }
      if (t.closest('#cartClose') || t.id === 'cartShade') return closeCart();
      const q = t.closest('[data-q]'); if (q) { const i = cart[q.dataset.q]; i.qty = Math.max(1, i.qty + Number(q.dataset.d)); save(); renderCart(); renderCount(); return; }
      const d = t.closest('[data-del]'); if (d) { cart.splice(Number(d.dataset.del), 1); save(); renderCart(); renderCount(); return; }
      if (t.closest('#cartSend.disabled')) ev.preventDefault();
    });
    document.addEventListener('input', (e) => { if (e.target.id === 'cartName') updateSend(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(); closeCart(); } });
    const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: .12 }) : null;
    $$('.reveal').forEach((el) => io ? io.observe(el) : el.classList.add('in'));
  });
})();
