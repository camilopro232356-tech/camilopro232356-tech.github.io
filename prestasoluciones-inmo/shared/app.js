/* Prestasoluciones del Quindío · datos y funciones compartidas por los 6 diseños */
const BIZ={
  nombre:'Prestasoluciones del Quindío',
  gerente:'Jhon Fabio Villegas Gaviria',
  cargo:'Gerente comercial',
  wa:'573107049521', waTxt:'310 704 9521',
  correo:'prestasolucionesdelquindio@gmail.com',
  sedes:['Filandia','Quimbaya'],
  cita:'Atención personalizada con cita previa'
};
const PROPS=[
  {id:1,t:'Casa colonial de balcones',tipo:'Casa',op:'Venta',ciudad:'Filandia',zona:'Centro histórico',precio:480000000,hab:4,ban:3,area:'180 m²',art:'colonial',tag:'Destacado',d:'Casa tradicional con balcones de colores a pocas cuadras del parque principal. Patio interior, techos altos y potencial para hospedaje.'},
  {id:2,t:'Finca cafetera con vista al valle',tipo:'Finca',op:'Venta',ciudad:'Quimbaya',zona:'Zona rural',precio:950000000,hab:5,ban:4,area:'3 ha',art:'finca',tag:'Exclusivo',d:'Finca productiva con cafetal, casa principal, kiosco y vista abierta a las montañas del Paisaje Cultural Cafetero.'},
  {id:3,t:'Apartamento nuevo con balcón',tipo:'Apartamento',op:'Arriendo',ciudad:'Quimbaya',zona:'Barrio residencial',precio:1200000,hab:3,ban:2,area:'72 m²',art:'apto',d:'Apartamento para estrenar, cocina integral, parqueadero y portería. Cerca de colegios y comercio.'},
  {id:4,t:'Local comercial en el parque',tipo:'Local',op:'Arriendo',ciudad:'Filandia',zona:'Parque principal',precio:2500000,hab:0,ban:1,area:'45 m²',art:'local',tag:'Alto flujo',d:'Local a pie de calle en la zona más visitada por turistas. Ideal para café, tienda de artesanías o restaurante.'},
  {id:5,t:'Lote campestre para construir',tipo:'Lote',op:'Venta',ciudad:'Filandia',zona:'Vía a Quimbaya',precio:180000000,hab:0,ban:0,area:'1.200 m²',art:'lote',d:'Lote plano con servicios disponibles y vista a la cordillera. Perfecto para casa campestre o glamping.'},
  {id:6,t:'Casa campestre con piscina',tipo:'Casa',op:'Venta',ciudad:'Quimbaya',zona:'Condominio campestre',precio:720000000,hab:4,ban:4,area:'320 m²',art:'campestre',tag:'Nuevo',d:'Casa amplia en condominio cerrado, piscina privada, zona BBQ y jardines. A minutos de los parques temáticos.'}
];
const SERV=[
  {k:'Gestión inmobiliaria',ic:'casa',items:['Compraventa','Arrendamientos','Administración de inmuebles','Rentas de locales, viviendas y apartamentos','Inversiones y proyectos inmobiliarios']},
  {k:'Finanzas y créditos',ic:'moneda',items:['Créditos de libranza','Libre inversión','Compra de cartera','Créditos hipotecarios','Negociación de obligaciones en mora','Orientación en Datacrédito']},
  {k:'Soluciones empresariales',ic:'grafica',items:['Asesoría empresarial','Estructuración y financiación de proyectos','Optimización de procesos','Desarrollo comercial','Seguros mediante aliados']}
];
const fmt=n=>'$'+Math.round(n).toLocaleString('es-CO');
const precioTxt=p=>fmt(p.precio)+(p.op==='Arriendo'?' /mes':'');
const wa=t=>`https://wa.me/${BIZ.wa}?text=${encodeURIComponent(t)}`;
const waProp=p=>wa(`Hola ${BIZ.nombre}, me interesa: ${p.t} en ${p.ciudad} (${p.op}, ${precioTxt(p)}). ¿Me pueden dar más información y agendar una visita?`);
const ICON={
  casa:'M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6',
  moneda:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15 9.5c-.6-1-1.7-1.5-3-1.5-1.7 0-3 .9-3 2s1.3 1.8 3 2 3 .9 3 2-1.3 2-3 2c-1.3 0-2.4-.5-3-1.5M12 6v12',
  grafica:'M4 20V10M10 20V4M16 20v-7M22 20H2',
  cama:'M3 18v-7h18v7M3 14h18M6 11V8h5v3',
  bano:'M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM6 12V6a2 2 0 0 1 4 0',
  area:'M4 4h16v16H4zM4 9h16M9 4v16',
  pin:'M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12zM12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  wa:'M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z',
  check:'M5 12l5 5 9-10',
  tel:'M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2',
  mail:'M3 6h18v12H3zM3 6l9 7 9-7'
};
const ico=(k,s=20)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICON[k]}"/></svg>`;

/* Ilustraciones vectoriales nítidas (se ven perfectas a cualquier tamaño) */
function art(kind,pal={}){
  const P=Object.assign({sky1:'#f6d9a8',sky2:'#fbeedd',hill:'#7fa36a',hill2:'#5b8450',ground:'#c9b48a',wall:'#f4efe6',roof:'#a5452f',trim:'#2f5d62',acc:'#e3a33b'},pal);
  const sky=`<defs><linearGradient id="s${kind}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sky1}"/><stop offset="1" stop-color="${P.sky2}"/></linearGradient></defs><rect width="400" height="260" fill="url(#s${kind})"/><circle cx="320" cy="62" r="26" fill="#fff6dc" opacity=".9"/>`;
  const hills=`<path d="M0 170 Q80 120 160 150 T320 135 T400 150 V260 H0z" fill="${P.hill}" opacity=".75"/><path d="M0 195 Q100 160 210 185 T400 175 V260 H0z" fill="${P.hill2}"/>`;
  let g='';
  if(kind==='colonial'){
    const cols=['#c8423b','#2f7f8f','#e3a33b','#5a8f4e'];
    g=`<rect x="70" y="232" width="260" height="28" fill="#8a7a66"/>`+[0,1,2,3].map(i=>`<g transform="translate(${80+i*62} 0)"><rect y="120" width="58" height="112" fill="${P.wall}" stroke="#d9cfbd"/><rect x="8" y="138" width="16" height="26" fill="${cols[i]}"/><rect x="34" y="138" width="16" height="26" fill="${cols[i]}"/><rect x="2" y="166" width="54" height="6" fill="${cols[(i+1)%4]}"/>${[6,14,22,30,38,46].map(x=>`<rect x="${x}" y="172" width="3" height="16" fill="${cols[(i+1)%4]}"/>`).join('')}<rect x="2" y="188" width="54" height="4" fill="${cols[(i+1)%4]}"/><rect x="19" y="198" width="20" height="34" fill="${cols[(i+2)%4]}"/></g>`).join('')+`<path d="M66 122 L200 92 L334 122 Z" fill="${P.roof}"/><rect x="66" y="118" width="268" height="6" fill="#7b2f22"/>`;
  }else if(kind==='finca'){
    g=hills+`<g fill="#3f6b3a">${Array.from({length:22},(_,i)=>`<circle cx="${20+i*18}" cy="${218+(i%2)*10}" r="7"/>`).join('')}</g><rect x="150" y="150" width="120" height="58" fill="${P.wall}"/><path d="M140 152 L210 112 L280 152Z" fill="${P.roof}"/><rect x="150" y="176" width="120" height="5" fill="${P.trim}"/>${[160,184,208,232,256].map(x=>`<rect x="${x}" y="181" width="3" height="27" fill="${P.trim}"/>`).join('')}<rect x="198" y="182" width="22" height="26" fill="${P.trim}"/><rect x="166" y="158" width="16" height="14" fill="${P.acc}"/><rect x="238" y="158" width="16" height="14" fill="${P.acc}"/><path d="M330 210 v-50 M330 165 q-14 -10 -24 -2 M330 165 q14 -12 24 -4 M330 175 q-12 -6 -20 2 M330 175 q12 -8 22 0" stroke="#3f6b3a" stroke-width="4" fill="none"/>`;
  }else if(kind==='apto'){
    g=hills+`<rect x="130" y="62" width="140" height="170" fill="${P.wall}"/><rect x="130" y="56" width="140" height="10" fill="${P.trim}"/>`+[0,1,2,3,4].map(r=>[0,1,2].map(c=>`<rect x="${144+c*42}" y="${78+r*30}" width="28" height="18" fill="#9cc3d0"/><rect x="${140+c*42}" y="${96+r*30}" width="36" height="3" fill="${P.trim}"/>`).join('')).join('')+`<rect x="186" y="200" width="28" height="32" fill="${P.trim}"/><rect x="60" y="232" width="280" height="28" fill="#b9ad97"/>`;
  }else if(kind==='local'){
    g=`<rect x="0" y="230" width="400" height="30" fill="#9d8f78"/><rect x="60" y="90" width="280" height="140" fill="${P.wall}"/><path d="M52 92 L200 64 L348 92Z" fill="${P.roof}"/><rect x="80" y="150" width="240" height="80" fill="#a8d0d8" stroke="${P.trim}" stroke-width="6"/><path d="M80 120 h240 l-12 22 h-216z" fill="${P.acc}"/>${[0,1,2,3,4,5].map(i=>`<path d="M${80+i*40} 142 l20 0 l-10 0" stroke="#fff" stroke-width="20" opacity=".25"/>`).join('')}<rect x="186" y="170" width="28" height="60" fill="${P.trim}"/><text x="200" y="112" text-anchor="middle" font-family="Georgia,serif" font-size="16" fill="${P.trim}">SE ARRIENDA</text>`;
  }else if(kind==='lote'){
    g=`<path d="M0 140 L70 70 L130 130 L200 60 L290 135 L350 90 L400 130 V260 H0z" fill="#8fa8b8" opacity=".6"/>`+hills+`<rect x="70" y="200" width="260" height="40" fill="#b8c98a" opacity=".9"/>${Array.from({length:14},(_,i)=>`<rect x="${70+i*20}" y="190" width="4" height="24" fill="#6b4f33"/>`).join('')}<rect x="70" y="196" width="264" height="3" fill="#6b4f33"/><rect x="70" y="206" width="264" height="3" fill="#6b4f33"/><g transform="translate(300 150)"><rect x="-2" y="0" width="4" height="40" fill="#6b4f33"/><rect x="-30" y="-14" width="60" height="22" fill="#fff" stroke="${P.trim}" stroke-width="2"/><text x="0" y="2" text-anchor="middle" font-family="Arial" font-size="10" font-weight="700" fill="${P.trim}">SE VENDE</text></g>`;
  }else{ /* campestre */
    g=hills+`<rect x="90" y="140" width="200" height="72" fill="${P.wall}"/><rect x="80" y="130" width="220" height="12" fill="${P.trim}"/><rect x="250" y="112" width="70" height="100" fill="${P.wall}"/><rect x="244" y="104" width="82" height="10" fill="${P.trim}"/><rect x="104" y="156" width="70" height="40" fill="#9cc3d0"/><rect x="186" y="156" width="46" height="56" fill="#9cc3d0"/><rect x="264" y="130" width="42" height="34" fill="#9cc3d0"/><path d="M40 222 h320 v20 h-320z" fill="#5fc0d6"/><path d="M50 230 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/><circle cx="60" cy="150" r="22" fill="#4f7d45"/><rect x="57" y="160" width="6" height="52" fill="#6b4f33"/>`;
  }
  return `<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Ilustración del inmueble">${sky}${g}</svg>`;
}

/* Filtros + render de inmuebles. card(p) lo define cada diseño. */
function mountProps({grid,filters,card,pal}){
  const st={op:'Todos',tipo:'Todos',ciudad:'Todas',q:''};
  const g=document.querySelector(grid),f=filters&&document.querySelector(filters);
  const draw=()=>{
    const L=PROPS.filter(p=>(st.op==='Todos'||p.op===st.op)&&(st.tipo==='Todos'||p.tipo===st.tipo)&&(st.ciudad==='Todas'||p.ciudad===st.ciudad)&&(!st.q||(p.t+p.zona+p.ciudad+p.tipo).toLowerCase().includes(st.q)));
    g.innerHTML=L.length?L.map(p=>card(p,art(p.art,pal))).join(''):`<p class="vacio">No hay inmuebles con esos filtros. Escríbenos y te buscamos uno a tu medida.</p>`;
  };
  if(f){
    const sel=(k,arr,lab)=>`<label>${lab}<select data-k="${k}">${arr.map(v=>`<option>${v}</option>`).join('')}</select></label>`;
    f.innerHTML=sel('op',['Todos','Venta','Arriendo'],'Operación')+sel('tipo',['Todos','Casa','Apartamento','Finca','Lote','Local'],'Tipo')+sel('ciudad',['Todas','Filandia','Quimbaya'],'Municipio')+`<label>Buscar<input data-k="q" type="search" placeholder="Ej: balcones, piscina…"></label>`;
    f.addEventListener('input',e=>{const k=e.target.dataset.k;if(!k)return;st[k]=k==='q'?e.target.value.trim().toLowerCase():e.target.value;draw()});
  }
  window.setFiltro=(k,v)=>{st[k]=v;if(f){const el=f.querySelector(`[data-k="${k}"]`);if(el)el.value=v}draw()};
  draw();
}

/* Simulador de crédito (valor aproximado) */
function mountSim(sel){
  const el=document.querySelector(sel);if(!el)return;
  el.innerHTML=`<div class="sim-in"><label>¿Cuánto necesitas?<input type="range" min="2000000" max="150000000" step="1000000" value="20000000" data-s="m"><output data-o="m"></output></label>
  <label>Plazo<input type="range" min="12" max="120" step="12" value="60" data-s="n"><output data-o="n"></output></label>
  <label>Línea<select data-s="r"><option value="1.4">Libranza</option><option value="1.8">Libre inversión</option><option value="1.6">Compra de cartera</option><option value="1.1">Hipotecario</option></select></label></div>
  <div class="sim-out"><span>Cuota mensual aproximada</span><b data-o="c"></b><small>Valor de referencia. La tasa y la cuota reales dependen de tu perfil y de la entidad aliada.</small><a class="sim-btn" target="_blank" rel="noopener" data-o="w">Solicitar este crédito</a></div>`;
  const q=s=>el.querySelector(s);
  const calc=()=>{const m=+q('[data-s=m]').value,n=+q('[data-s=n]').value,r=+q('[data-s=r]').value/100,lin=q('[data-s=r]').selectedOptions[0].text;
    const c=m*r/(1-Math.pow(1+r,-n));q('[data-o=m]').textContent=fmt(m);q('[data-o=n]').textContent=n+' meses';q('[data-o=c]').textContent=fmt(c);
    q('[data-o=w]').href=wa(`Hola ${BIZ.nombre}, quiero información de un crédito de ${lin} por ${fmt(m)} a ${n} meses.`)};
  el.addEventListener('input',calc);calc();
}

/* Formulario → WhatsApp */
function mountForm(sel){
  const f=document.querySelector(sel);if(!f)return;
  f.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(f),msg=f.querySelector('.fmsg');
    if(!d.get('nombre')){msg.textContent='Escribe tu nombre para continuar.';return}
    const t=`Hola ${BIZ.nombre}, soy ${d.get('nombre')}. Me interesa: ${d.get('servicio')} en ${d.get('municipio')}.${d.get('mensaje')?' '+d.get('mensaje'):''}`;
    const u=wa(t);msg.innerHTML=`Abriendo WhatsApp… si no abre, <a href="${u}" target="_blank" rel="noopener">toca aquí</a>.`;window.open(u,'_blank')});
}
const FORM_HTML=`<label>Nombre<input name="nombre" autocomplete="name" placeholder="Tu nombre"></label>
<label>Servicio<select name="servicio"><option>Comprar un inmueble</option><option>Arrendar un inmueble</option><option>Vender mi inmueble</option><option>Administración de mi inmueble</option><option>Crédito de libranza</option><option>Libre inversión</option><option>Compra de cartera</option><option>Crédito hipotecario</option><option>Asesoría empresarial</option></select></label>
<label>Municipio<select name="municipio"><option>Filandia</option><option>Quimbaya</option><option>Otro</option></select></label>
<label class="full">Mensaje<textarea name="mensaje" rows="2" placeholder="Cuéntanos qué buscas"></textarea></label>
<button class="full" type="submit">Enviar por WhatsApp</button><p class="fmsg full" role="status"></p>`;

function commonBoot(){
  document.querySelectorAll('[data-wa]').forEach(a=>{a.href=wa(a.dataset.wa||`Hola ${BIZ.nombre}, quiero información.`);a.target='_blank';a.rel='noopener'});
  document.querySelectorAll('.wanum').forEach(s=>s.textContent=BIZ.waTxt);
  document.querySelectorAll('.yr').forEach(s=>s.textContent=new Date().getFullYear());
  const t=document.querySelector('.menu-t'),l=document.querySelector('.links');
  if(t&&l){t.onclick=()=>{const o=l.classList.toggle('open');t.setAttribute('aria-expanded',o)};l.onclick=()=>l.classList.remove('open')}
  const rv=document.querySelectorAll('.rv');
  if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.1});rv.forEach(e=>io.observe(e))}else rv.forEach(e=>e.classList.add('in'));
}
const WA_SVG=`<svg viewBox="0 0 32 32" width="32" height="32" fill="#fff" aria-hidden="true"><path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.7c-2 0-4-.6-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.7 10.7 0 1 1 16 26.7zm5.9-8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.8 8.8 0 0 1-4.4-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.2.2 2.4 3.7 5.8 5.1 2.2.9 3 1 4.1.8.7-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5-.1-.2-.3-.2-.6-.4z"/></svg>`;
function waFloat(){const a=document.createElement('a');a.className='wa-float';a.href=wa(`Hola ${BIZ.nombre}, quiero información.`);a.target='_blank';a.rel='noopener';a.setAttribute('aria-label','Escribir por WhatsApp');a.innerHTML=WA_SVG;a.style.cssText='position:fixed;right:18px;bottom:18px;z-index:40;width:60px;height:60px;border-radius:50%;background:#25d366;display:grid;place-items:center;box-shadow:0 10px 30px rgba(0,0,0,.3)';document.body.appendChild(a);
  const b=document.createElement('a');b.href='../';b.textContent='← Ver los 6 diseños';b.style.cssText='position:fixed;left:14px;bottom:18px;z-index:40;display:inline-flex;align-items:center;min-height:44px;padding:0 16px;border-radius:999px;background:rgba(10,10,10,.85);color:#e8c766;border:1px solid rgba(232,199,102,.5);font:600 14px system-ui,sans-serif;text-decoration:none;backdrop-filter:blur(8px)';document.body.appendChild(b)}
