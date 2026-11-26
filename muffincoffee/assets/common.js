/* Funciones compartidas: menú, pedido por WhatsApp, galería, animaciones */
(function () {
  const BASE = window.MC_BASE || "../";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  window.mcImg = (n, sm) => `${BASE}img/${sm ? "sm/" : ""}${n}.jpg`;
  window.mcWa = (txt) => `https://wa.me/${MC.wa}?text=${encodeURIComponent(txt)}`;
  const WA_SVG = '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3C8.8 3 3 8.7 3 15.8c0 2.5.7 4.9 2 6.9L3 29l6.5-2c1.9 1 4.1 1.6 6.5 1.6 7.2 0 13-5.7 13-12.8S23.2 3 16 3zm0 23.3c-2.1 0-4.1-.6-5.8-1.7l-.4-.3-3.9 1.2 1.2-3.8-.3-.4c-1.2-1.8-1.8-3.8-1.8-5.9C5 9.9 9.9 5.1 16 5.1S27 9.9 27 15.8s-4.9 10.5-11 10.5zm6-7.9c-.3-.2-2-1-2.3-1.1-.3-.1-.5-.2-.8.2-.2.3-.9 1.1-1.1 1.3-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.7-1.7-1-.9-1.7-2-1.9-2.3-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.3-.6.1-.2 0-.4 0-.6l-1-2.5c-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.4c.2.2 2.4 3.6 5.8 5 .8.3 1.4.5 1.9.7.8.3 1.6.2 2.2.1.7-.1 2-.8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.2-.3-.3-.6-.4z"/></svg>';
  window.mcWaIcon = WA_SVG;

  /* ---------- Menú con pestañas ---------- */
  window.mcMenu = function (opts) {
    const tabs = $(opts.tabs), list = $(opts.items), head = opts.head ? $(opts.head) : null;
    function show(id) {
      const cat = MENU.find((c) => c.id === id);
      $$("button", tabs).forEach((b) => b.classList.toggle("on", b.dataset.id === id));
      if (head) head.innerHTML = opts.headTpl(cat);
      list.classList.remove("swap"); void list.offsetWidth; list.classList.add("swap");
      list.innerHTML = cat.items.map((it) => opts.itemTpl(it, cat)).join("");
      $$("[data-add]", list).forEach((b) => b.addEventListener("click", () => addItem(b.dataset.add, b)));
    }
    tabs.innerHTML = MENU.map((c) => `<button type="button" data-id="${c.id}">${c.titulo}</button>`).join("");
    $$("button", tabs).forEach((b) => b.addEventListener("click", () => show(b.dataset.id)));
    show(MENU[0].id);
  };
  window.mcAddBtn = (it, label = "Agregar") =>
    `<button type="button" class="mc-add" data-add="${it.n.replace(/"/g, "&quot;")}" aria-label="Agregar ${it.n} al pedido"><span>+</span> ${label}</button>`;

  /* ---------- Pedido por WhatsApp ---------- */
  const pedido = {};
  function addItem(n, btn) {
    pedido[n] = (pedido[n] || 0) + 1; paint();
    if (btn) { btn.classList.add("ok"); setTimeout(() => btn.classList.remove("ok"), 700); }
    const fab = $("#mc-cart"); fab.classList.remove("bump"); void fab.offsetWidth; fab.classList.add("bump");
  }
  function paint() {
    const keys = Object.keys(pedido).filter((k) => pedido[k] > 0);
    const count = keys.reduce((s, k) => s + pedido[k], 0);
    $("#mc-cart").classList.toggle("show", count > 0);
    $("#mc-cart b").textContent = count;
    $("#mc-lines").innerHTML = keys.length
      ? keys.map((k) => `<li><span>${k}</span><div class="q"><button data-q="-" data-k="${k}">−</button><em>${pedido[k]}</em><button data-q="+" data-k="${k}">+</button></div></li>`).join("")
      : '<li class="empty">Aún no has agregado productos.</li>';
    $$("#mc-lines [data-q]").forEach((b) => b.onclick = () => { pedido[b.dataset.k] += b.dataset.q === "+" ? 1 : -1; if (pedido[b.dataset.k] <= 0) delete pedido[b.dataset.k]; paint(); });
    const txt = "Hola Muffin & Coffee 👋 Quiero hacer este pedido:\n" + keys.map((k) => `• ${pedido[k]} x ${k}`).join("\n") + "\n\n¿Me confirman disponibilidad y valor? ¡Gracias!";
    $("#mc-send").href = mcWa(txt);
  }

  function buildUI() {
    const ui = document.createElement("div");
    ui.innerHTML = `
      <a class="mc-wa" href="${mcWa("Hola Muffin & Coffee 👋 Quisiera más información.")}" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp">${WA_SVG}<span>¿Pedimos?</span></a>
      <button id="mc-cart" class="mc-cart" type="button" aria-label="Ver pedido">🧺 Mi pedido <b>0</b></button>
      <div class="mc-drawer" id="mc-drawer" aria-hidden="true">
        <div class="mc-sheet" role="dialog" aria-label="Tu pedido">
          <div class="mc-sh"><strong>Tu pedido</strong><button type="button" class="mc-x" aria-label="Cerrar">✕</button></div>
          <ul id="mc-lines"></ul>
          <a id="mc-send" class="mc-send" target="_blank" rel="noopener">${WA_SVG} Enviar pedido por WhatsApp</a>
          <p class="mc-note">Te respondemos con el valor y el tiempo de entrega.</p>
        </div>
      </div>
      <div class="mc-lb" id="mc-lb" aria-hidden="true"><button class="mc-x" type="button" aria-label="Cerrar">✕</button><button class="mc-nav p" type="button" aria-label="Anterior">‹</button><img alt=""><button class="mc-nav n" type="button" aria-label="Siguiente">›</button></div>`;
    document.body.appendChild(ui);
    const dr = $("#mc-drawer");
    $("#mc-cart").onclick = () => dr.classList.add("open");
    dr.onclick = (e) => { if (e.target === dr || e.target.classList.contains("mc-x")) dr.classList.remove("open"); };
    paint();
  }

  /* ---------- Galería con visor ---------- */
  window.mcGallery = function (sel, tpl) {
    const g = $(sel); if (!g) return;
    g.innerHTML = GALERIA.map((n, i) => tpl ? tpl(n, i) : `<button type="button" class="g-it" data-lb="${i}"><img src="${mcImg(n, 1)}" alt="Muffin & Coffee Quimbaya" loading="lazy"></button>`).join("");
    const lb = $("#mc-lb"), im = $("img", lb); let cur = 0;
    const open = (i) => { cur = (i + GALERIA.length) % GALERIA.length; im.src = mcImg(GALERIA[cur]); lb.classList.add("open"); };
    $$("[data-lb]", g).forEach((b) => b.addEventListener("click", () => open(+b.dataset.lb)));
    $(".p", lb).onclick = (e) => { e.stopPropagation(); open(cur - 1); };
    $(".n", lb).onclick = (e) => { e.stopPropagation(); open(cur + 1); };
    lb.onclick = (e) => { if (e.target === lb || e.target.classList.contains("mc-x")) lb.classList.remove("open"); };
    document.addEventListener("keydown", (e) => { if (!lb.classList.contains("open")) return; if (e.key === "Escape") lb.classList.remove("open"); if (e.key === "ArrowRight") open(cur + 1); if (e.key === "ArrowLeft") open(cur - 1); });
  };

  /* ---------- Slideshow de portada ---------- */
  window.mcSlides = function (sel, names, ms = 5500) {
    const box = $(sel); if (!box) return;
    box.innerHTML = names.map((n, i) => `<div class="sl${i === 0 ? " on" : ""}" style="background-image:url('${mcImg(n)}')"></div>`).join("");
    const s = $$(".sl", box); let i = 0;
    setInterval(() => { s[i].classList.remove("on"); i = (i + 1) % s.length; s[i].classList.add("on"); }, ms);
  };

  document.addEventListener("DOMContentLoaded", () => {
    buildUI();
    $$("[data-wa]").forEach((a) => { a.href = mcWa(a.dataset.wa || "Hola Muffin & Coffee 👋"); a.target = "_blank"; a.rel = "noopener"; });
    $$("[data-fill]").forEach((el) => (el.textContent = MC[el.dataset.fill]));
    $$("[data-map]").forEach((f) => (f.src = MC.mapEmbed));
    $$("[data-maps]").forEach((a) => { a.href = MC.maps; a.target = "_blank"; a.rel = "noopener"; });
    $$("[data-ig]").forEach((a) => { a.href = MC.instagram; a.target = "_blank"; a.rel = "noopener"; });
    $$("[data-nav-toggle]").forEach((b) => b.addEventListener("click", () => document.body.classList.toggle("nav-open")));
    $$("nav a").forEach((a) => a.addEventListener("click", () => document.body.classList.remove("nav-open")));
    const hdr = $("header"); const onS = () => hdr && hdr.classList.toggle("scrolled", scrollY > 40); addEventListener("scroll", onS, { passive: true }); onS();
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    $$(".rv").forEach((el) => io.observe(el));
    const y = $("[data-year]"); if (y) y.textContent = new Date().getFullYear();
  });
})();
