/* Diseños de referencia · funciones compartidas (pedido por WhatsApp, filtros, animación) */
const REF={wa:'573122544468'};
const wa=t=>`https://wa.me/${REF.wa}?text=${encodeURIComponent(t)}`;
const fmt=n=>'$'+Math.round(n).toLocaleString('es-CO');
const WA_SVG=`<svg viewBox="0 0 32 32" width="30" height="30" fill="#fff" aria-hidden="true"><path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.7c-2 0-4-.6-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.7 10.7 0 1 1 16 26.7zm5.9-8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.8 8.8 0 0 1-4.4-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.2.2 2.4 3.7 5.8 5.1 2.2.9 3 1 4.1.8.7-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5-.1-.2-.3-.2-.6-.4z"/></svg>`;
/* Carrito de pedido: items {id,n,p}. render(el) pinta el resumen; el botón envía todo a WhatsApp. */
const Cart={items:{},neg:'',
  add(id,n,p){const it=this.items[id]||(this.items[id]={n,p,q:0});it.q++;this.ui()},
  sub(id){const it=this.items[id];if(!it)return;it.q--;if(it.q<=0)delete this.items[id];this.ui()},
  count(){return Object.values(this.items).reduce((a,b)=>a+b.q,0)},
  total(){return Object.values(this.items).reduce((a,b)=>a+b.q*b.p,0)},
  msg(extra=''){const L=Object.values(this.items).map(i=>`• ${i.q} x ${i.n} (${fmt(i.p*i.q)})`).join('\n');return `Hola ${this.neg}, quiero hacer este pedido:\n${L}\nTotal: ${fmt(this.total())}${extra?'\n'+extra:''}`},
  ui(){document.querySelectorAll('[data-cart-count]').forEach(e=>e.textContent=this.count());
    const box=document.querySelector('[data-cart]');if(!box)return;
    const L=Object.entries(this.items);
    box.querySelector('.cl').innerHTML=L.length?L.map(([id,i])=>`<div class="ci"><span>${i.n}</span><span class="qq"><button aria-label="Quitar uno" onclick="Cart.sub('${id}')">−</button>${i.q}<button aria-label="Agregar uno" onclick="Cart.add('${id}','${i.n.replace(/'/g,"\\'")}',${i.p})">+</button></span><b>${fmt(i.p*i.q)}</b></div>`).join(''):'<p class="ce">Tu pedido está vacío. Agrega productos de la carta.</p>';
    box.querySelector('.ct').textContent=fmt(this.total());
    const s=box.querySelector('.cs');s.toggleAttribute('disabled',!L.length);
  },
  send(){if(!this.count())return;const d=document.querySelector('[data-cart] [name=dir]');const extra=d&&d.value.trim()?'Entrega: '+d.value.trim():'';window.open(wa(this.msg(extra)),'_blank')}
};
function openCart(o){const c=document.querySelector('[data-cart]');if(c)c.classList.toggle('open',o)}
function boot(){
  document.querySelectorAll('[data-wa]').forEach(a=>{a.href=wa(a.dataset.wa||'Hola, quiero más información.');a.target='_blank';a.rel='noopener'});
  const t=document.querySelector('.menu-t'),l=document.querySelector('.links');
  if(t&&l){t.onclick=()=>{const o=l.classList.toggle('open');t.setAttribute('aria-expanded',o)};l.onclick=()=>l.classList.remove('open')}
  const rv=document.querySelectorAll('.rv');
  if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.1});rv.forEach(e=>io.observe(e))}else rv.forEach(e=>e.classList.add('in'));
  const f=document.createElement('a');f.href=wa(`Hola ${Cart.neg}, quiero más información.`);f.target='_blank';f.rel='noopener';f.setAttribute('aria-label','Escribir por WhatsApp');f.innerHTML=WA_SVG;f.style.cssText='position:fixed;right:18px;bottom:18px;z-index:40;width:58px;height:58px;border-radius:50%;background:#25d366;display:grid;place-items:center;box-shadow:0 10px 30px rgba(0,0,0,.3)';document.body.appendChild(f);
  const b=document.createElement('a');b.href='../';b.textContent='← Ver los 3 diseños';b.style.cssText='position:fixed;left:14px;bottom:18px;z-index:40;display:inline-flex;align-items:center;min-height:44px;padding:0 16px;border-radius:999px;background:rgba(20,20,20,.85);color:#fff;font:600 14px system-ui,sans-serif;text-decoration:none;backdrop-filter:blur(8px)';document.body.appendChild(b);
  const lb=document.createElement('div');lb.className='lb';lb.style.cssText='position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.9);display:none;place-items:center;padding:20px;cursor:zoom-out';lb.innerHTML='<img alt="" style="max-width:min(94vw,1200px);max-height:88vh;object-fit:contain">';document.body.appendChild(lb);
  document.addEventListener('click',e=>{const g=e.target.closest('[data-zoom]');if(g){lb.firstChild.src=g.src;lb.style.display='grid'}});lb.onclick=()=>lb.style.display='none';
  Cart.ui();
}
