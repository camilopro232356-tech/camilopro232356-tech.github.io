{
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cop=n=>n==null||isNaN(n)?'—':(n<0?'−':'')+'$'+Math.abs(Math.round(n)).toLocaleString('es-CO');
const pad=(n,l=2)=>String(n).padStart(l,'0');
const norm=s=>String(s??'').toLowerCase().normalize('NFD').replace(/\p{M}/gu,'');
const dia=t=>new Date(t).toLocaleDateString('en-CA');
const hoy=()=>dia(Date.now());
const hora=t=>new Date(t).toLocaleTimeString('es-CO',{hour:'numeric',minute:'2-digit'});
const fechaL=t=>new Date(t).toLocaleString('es-CO',{dateStyle:'medium',timeStyle:'short'});
const MET={efectivo:'Efectivo',nequi:'Nequi',daviplata:'Daviplata',tarjeta:'Tarjeta',transferencia:'Transferencia',credito:'Crédito'};
const TIPO={entrada:['Entrada','ok'],salida:['Salida','n'],ajuste:['Ajuste','w'],devolucion:['Devolución','w']};
const ls={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}},del:k=>{try{localStorage.removeItem(k)}catch(e){}}};
function toast(t,bad){const e=$('#toast');e.textContent=t;e.className='toast on'+(bad?' bad':'');clearTimeout(e._t);e._t=setTimeout(()=>e.className='toast',bad?3800:2200)}
const fotoUrl=u=>/^https:\/\//.test(u||'')?u:'';
const camIco='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3.2"/></svg>';

let TOK=ls.get('tc-tok'),YO=null,S=null,H={},vista='caja',ocupado=false;
const D=()=>YO&&YO.rol==='dueno';
let cart=[];try{cart=JSON.parse(ls.get('tc-cart')||'[]')}catch(e){}
let desc=null,met='efectivo',sel=0;

/* ---------- Conexión ---------- */
async function api(path,opt={}){
 const r=await fetch(path,{...opt,headers:{'Content-Type':'application/json',Authorization:'Bearer '+TOK}});
 const j=await r.json().catch(()=>({}));
 if(r.status===401&&path!=='/api/login'){salir('Su sesión venció. Ingrese de nuevo.');throw new Error('401')}
 if(!r.ok)throw new Error(j.error||'Error '+r.status);return j}
function estado(t,c){$('#syncT').textContent=t;$('#sync').className='sync '+(c||'')}
async function op(nombre,body={}){
 ocupado=true;estado('Guardando…','w');
 try{const j=await api('/api/op',{method:'POST',body:JSON.stringify({op:nombre,...body})});if(j.estado)S=j.estado;estado('Guardado · '+hora(Date.now()));render();return j}
 catch(e){estado('Sin guardar','e');if(e.message!=='401')toast(e.message,true);throw e}
 finally{ocupado=false}}
async function refrescar(){if(ocupado||document.hidden||!TOK||!S)return;
 try{const j=await api('/api/data?rev='+(S.rev||0));if(j.estado){S=j.estado;render()}estado('En línea · '+hora(Date.now()))}catch(e){if(e.message!=='401')estado('Sin conexión','e')}}

/* ---------- Ingreso ---------- */
$('#lgFotos').innerHTML=[1,3,4,6,8,10,11,13,14,16,18,20,2,5,7,12].map(n=>`<img src="img/mini-${pad(n)}.jpg" alt="">`).join('');
$('#verP').onclick=()=>{const i=$('#lP');i.type=i.type==='password'?'text':'password';$('#verP').textContent=i.type==='password'?'Mostrar':'Ocultar'};
$('#fLogin').addEventListener('submit',async e=>{e.preventDefault();$('#lErr').textContent='';$('#lBtn').disabled=true;$('#lBtn').textContent='Ingresando…';
 try{const j=await api('/api/login',{method:'POST',body:JSON.stringify({u:$('#lU').value,p:$('#lP').value})});TOK=j.token;ls.set('tc-tok',TOK);$('#lP').value='';await iniciar()}
 catch(err){$('#lErr').textContent=err.message}
 $('#lBtn').disabled=false;$('#lBtn').textContent='Entrar'});
function salir(msg){TOK=null;YO=null;S=null;ls.del('tc-tok');$('#app').hidden=true;$('#login').hidden=false;$('#lErr').textContent=msg||'';clearInterval(window._poll)}
$('#bSalir').onclick=()=>salir('');
async function iniciar(){
 $('#cargando').hidden=false;
 try{const j=await api('/api/data');S=j.estado;YO=j.yo;
  $('#login').hidden=true;$('#app').hidden=false;
  $$('.soloD').forEach(e=>e.hidden=!D());
  $('#rolT').textContent=D()?'Dueño':'Cajero';$('#userT').textContent=YO.u;
  if(!D()&&['res','aju'].includes(vista))vista='caja';
  tab(vista);estado('En línea · '+hora(Date.now()));
  clearInterval(window._poll);window._poll=setInterval(refrescar,20000);
  setTimeout(()=>$('#cod').focus(),50);
 }catch(e){if(e.message!=='401')$('#lErr').textContent='No se pudo cargar: '+e.message}
 $('#cargando').hidden=true}
fetch('datos.json').then(r=>r.json()).then(d=>{H=d.hojas;$('#gal').innerHTML=Object.entries(H).map(([n,t])=>`<button data-h="${n}"><img loading="lazy" src="img/mini-${pad(n)}.jpg" alt="Hoja ${n}"><span><b>Hoja ${n}</b><br>${esc(t)}</span></button>`).join('')}).catch(()=>{});

/* ---------- Cálculos ---------- */
const precio=it=>it.promo>0?it.promo:it.p;
const byId=id=>S.items.find(i=>i.id===id);
const vendidas=()=>S.ventas.filter(v=>!v.anulada);
function vend30(){const m={},lim=Date.now()-30*864e5;vendidas().forEach(v=>{if(v.f>=lim)v.lineas.forEach(l=>m[l.id]=(m[l.id]||0)+l.q)});return m}
function estadoIt(it){const q=it.q||0;if(q<=0)return['Agotado','b'];if(it.min>0&&q<=it.min)return['Bajo mínimo','w'];if(q===1)return['Última unidad','n'];return['Disponible','ok']}
const saldoCli=id=>vendidas().filter(v=>v.cliente===id&&v.pago.met==='credito').reduce((a,v)=>a+v.total,0)-S.abonos.filter(a=>a.cliente===id).reduce((a,x)=>a+x.valor,0);
const porComprar=(uno)=>S.items.filter(i=>(i.q||0)<=0||(i.min>0&&i.q<=i.min)||(uno&&i.q===1));
const utilidad=vs=>vs.reduce((a,v)=>{let g=0,bc=0;v.lineas.forEach(l=>{if(l.costo!=null){g+=(l.p-l.costo)*l.q;bc+=l.p*l.q}});return a+g-(v.sub?v.desc*bc/v.sub:0)},0);

/* ---------- Pestañas ---------- */
function tab(t){vista=t;$$('#tabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.t===t));$$('main section[id^=v-]').forEach(s=>s.hidden=s.id!=='v-'+t);render();if(t==='caja')setTimeout(()=>$('#cod').focus(),30)}
$('#tabs').addEventListener('click',e=>{const b=e.target.closest('button');if(b)tab(b.dataset.t)});
function render(){if(!S)return;
 $('#nTienda').textContent=S.negocio?.nombre||'Tecnocenter';document.title=(S.negocio?.nombre||'Tecnocenter')+' · Caja e inventario';
 const nc=porComprar().length;$('#nComp').hidden=!nc;$('#nComp').textContent=nc;
 const ncr=S.clientes.filter(c=>saldoCli(c.id)>0).length;$('#nCred').hidden=!ncr;$('#nCred').textContent=ncr;
 ({caja:rCaja,ventas:rVentas,inv:rInv,compras:rComp,cred:rCred,movs:rMovs,res:rRes,aju:rAju}[vista]||(()=>{}))()}

/* ---------- CAJA ---------- */
function buscar(t){t=norm(t.trim());if(!t)return[];
 const ex=S.items.filter(i=>norm(i.cod)===t||(i.barras&&norm(i.barras)===t));if(ex.length)return ex;
 const w=t.split(/\s+/);return S.items.filter(i=>{const h=norm(i.cod+' '+i.n+' '+i.m+' '+i.c+' '+(i.barras||''));return w.every(x=>h.includes(x))}).slice(0,8)}
function parseEntrada(){const v=$('#cod').value.trim();const m=v.match(/^(\d+)\s*[*x]\s*(.+)$/i);return m?{q:+m[1],t:m[2]}:{q:1,t:v}}
function sugs(){const {t}=parseEntrada();const L=buscar(t);sel=Math.min(sel,Math.max(0,L.length-1));
 $('#sugs').innerHTML=L.map((i,k)=>{const p=precio(i);return`<button class="sug${k===sel?' on':''}" data-add="${i.id}"><span class="c">${esc(i.cod)}</span><span><b>${esc(i.n)}</b> <small class="lbl">${esc(i.m)}</small><br><span class="st ${estadoIt(i)[1]}">${i.q||0} en existencia</span>${D()&&i.costo!=null?` <small class="lbl">· costo ${cop(i.costo)}</small>`:''}</span><span class="stk lbl">${esc(i.c)}</span><span class="pz">${i.promo>0?`<s>${cop(i.p)}</s>`:''}${cop(p)}</span></button>`}).join('');return L}
function agregar(id,q=1){const it=byId(id);if(!it)return;
 if(precio(it)==null){toast(it.n+' no tiene precio. El dueño debe ponerle precio en Inventario.',true);return}
 const l=cart.find(x=>x.id===id);const nueva=(l?l.q:0)+q;
 if(nueva>(it.q||0)){toast(`Solo hay ${it.q||0} unidad(es) de ${it.n}`,true);return}
 if(l)l.q=nueva;else cart.push({id,q});guardaCart();$('#cod').value='';$('#sugs').innerHTML='';sel=0;rCaja();$('#cod').focus();toast('+'+q+' · '+it.n+' · '+cop(precio(it)))}
function guardaCart(){ls.set('tc-cart',JSON.stringify(cart))}
function totales(){let sub=0,u=0;cart.forEach(l=>{const it=byId(l.id);if(it){sub+=precio(it)*l.q;u+=l.q}});
 let d=0;if(desc)d=desc.tipo==='%'?Math.round(sub*Math.min(100,desc.valor)/100):Math.min(sub,desc.valor);return{sub,d,total:sub-d,u}}
function rCaja(){
 cart=cart.filter(l=>byId(l.id));
 $('#cart tbody').innerHTML=cart.length?cart.map(l=>{const it=byId(l.id),p=precio(it);return`<tr data-c="${it.id}"><td class="mono">${esc(it.cod)}</td><td><b>${esc(it.n)}</b><small>${esc(it.m)} · quedan ${(it.q||0)-l.q}</small></td><td class="num"><span class="qbox"><button data-cq="-1" aria-label="Menos">−</button><input value="${l.q}" inputmode="numeric" data-cqi aria-label="Cantidad"><button data-cq="1" aria-label="Más">+</button></span></td><td class="num">${it.promo>0?`<s>${cop(it.p)}</s>`:''}${cop(p)}</td><td class="num"><b>${cop(p*l.q)}</b></td><td class="num"><button class="btn sm" data-cdel aria-label="Quitar">✕</button></td></tr>`}).join(''):'<tr><td colspan="6" class="empty">Pase un producto por el lector o escriba su código para empezar la venta.</td></tr>';
 const t=totales();$('#cUds').textContent=t.u;$('#cSub').textContent=cop(t.sub);$('#cTot').textContent=cop(t.total);
 $('#cDescRow').hidden=!desc;if(desc){$('#cDesc').textContent='−'+cop(t.d);$('#cDescT').textContent=desc.tipo==='%'?desc.valor+'%':''}
 $$('#pay button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===met));
 $('#efBox').hidden=met!=='efectivo';$('#crBox').hidden=met!=='credito';$('#nomBox').hidden=met==='credito';
 const rec=+$('#cRec').value||0;$('#cCam').textContent=rec?cop(Math.max(0,rec-t.total)):'$0';$('#cCam').style.color=rec&&rec<t.total?'var(--bad)':'';
 const cur=$('#cCli').value;$('#cCli').innerHTML='<option value="">Seleccione el cliente…</option>'+S.clientes.slice().sort((a,b)=>a.nombre.localeCompare(b.nombre,'es')).map(c=>`<option value="${esc(c.id)}">${esc(c.nombre)}${c.doc?' · '+esc(c.doc):''}</option>`).join('');$('#cCli').value=cur;cliInfo();
 $('#bCobrar').disabled=!cart.length;$('#bCobrar').textContent=cart.length?'Cobrar '+cop(t.total):'Cobrar'}
function cliInfo(){const c=S.clientes.find(x=>x.id===$('#cCli').value);if(!c){$('#cCliSaldo').textContent='';return}const s=saldoCli(c.id),t=totales().total;$('#cCliSaldo').innerHTML=`Saldo actual ${cop(s)} · después de esta venta <b>${cop(s+t)}</b>`+(c.cupo?` · cupo ${cop(c.cupo)}`+(s+t>c.cupo?' <b style="color:var(--bad)">(supera el cupo)</b>':''):'')}
$('#cCli').addEventListener('change',cliInfo);
$('#cod').addEventListener('input',()=>{sel=0;sugs()});
$('#cod').addEventListener('keydown',e=>{const L=$$('#sugs .sug');
 if(e.key==='ArrowDown'){e.preventDefault();sel=Math.min(sel+1,L.length-1);sugs()}
 else if(e.key==='ArrowUp'){e.preventDefault();sel=Math.max(sel-1,0);sugs()}
 else if(e.key==='Enter'){e.preventDefault();const {q,t}=parseEntrada();const R=buscar(t);if(!t)return;if(!R.length){toast('No existe un producto con "'+t+'"',true);$('#cod').select();return}
  const ex=R.filter(i=>norm(i.cod)===norm(t)||i.barras===t.trim());if(ex.length===1||R.length===1)agregar((ex[0]||R[0]).id,q);else agregar(R[sel]?.id??R[0].id,q)}
 else if(e.key==='Escape'){$('#cod').value='';$('#sugs').innerHTML=''}});
$('#bAdd').onclick=()=>$('#cod').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}));
$('#sugs').addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(b)agregar(+b.dataset.add,parseEntrada().q)});
$('#cart').addEventListener('click',e=>{const tr=e.target.closest('tr[data-c]');if(!tr)return;const l=cart.find(x=>x.id===+tr.dataset.c);
 if(e.target.closest('[data-cdel]')){cart=cart.filter(x=>x!==l);guardaCart();rCaja();return}
 const b=e.target.closest('[data-cq]');if(b){const n=l.q+ +b.dataset.cq,it=byId(l.id);if(n<1)return;if(n>(it.q||0)){toast(`Solo hay ${it.q||0} unidad(es)`,true);return}l.q=n;guardaCart();rCaja()}});
$('#cart').addEventListener('change',e=>{if(!e.target.matches('[data-cqi]'))return;const tr=e.target.closest('tr');const l=cart.find(x=>x.id===+tr.dataset.c),it=byId(l.id);let n=Math.max(1,Math.round(+e.target.value||1));if(n>(it.q||0)){toast(`Solo hay ${it.q||0} unidad(es)`,true);n=it.q||1}l.q=n;guardaCart();rCaja()});
$('#pay').addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(!b)return;met=b.dataset.m;rCaja();if(met==='efectivo')$('#cRec').focus()});
$('#cRec').addEventListener('input',rCaja);
$('#bVaciar').onclick=()=>{cart=[];desc=null;guardaCart();$('#cRec').value='';$('#cNom').value='';rCaja();$('#cod').focus()};
// Descuento
$('#bDesc').onclick=()=>{if(!cart.length){toast('Primero agregue productos');return}$('#dErr').textContent='';$('#dPinBox').hidden=D();$('#dPin').value='';$('#dTipo').value=desc?.tipo||'%';$('#dVal').value=desc?.valor||'';$('#dMot').value=desc?.motivo||'';$('#dQuitar').hidden=!desc;$('#dDesc').showModal()};
$('#dQuitar').onclick=()=>{desc=null;$('#dDesc').close();rCaja()};
$('#fDesc').addEventListener('submit',async e=>{e.preventDefault();const v=Math.max(0,+$('#dVal').value||0);if(!v){$('#dErr').textContent='Escriba el valor del descuento';return}
 if($('#dTipo').value==='%'&&v>100){$('#dErr').textContent='El porcentaje no puede pasar de 100';return}
 let pin='';if(!D()){pin=$('#dPin').value.trim();if(!pin){$('#dErr').textContent='Pida al dueño que escriba su PIN';return}
  try{await api('/api/op',{method:'POST',body:JSON.stringify({op:'validarPin',pin})})}catch(err){$('#dErr').textContent=err.message;return}}
 desc={tipo:$('#dTipo').value,valor:v,motivo:$('#dMot').value.trim(),pin};$('#dDesc').close();rCaja();toast('Descuento autorizado')});
// Cobrar
async function cobrar(){if(!cart.length||ocupado)return;const t=totales();
 if(met==='efectivo'){const rec=+$('#cRec').value||0;if(rec&&rec<t.total){toast('El dinero recibido es menor que el total',true);$('#cRec').focus();return}}
 if(met==='credito'&&!$('#cCli').value){toast('Seleccione el cliente para el crédito',true);$('#cCli').focus();return}
 $('#bCobrar').disabled=true;$('#bCobrar').textContent='Registrando…';
 try{const j=await op('venta',{lineas:cart,desc:desc?{tipo:desc.tipo,valor:desc.valor,motivo:desc.motivo}:null,pin:desc?.pin,pago:{met,recibido:+$('#cRec').value||0},cliente:met==='credito'?$('#cCli').value:null,clienteN:$('#cNom').value.trim()});
  cart=[];desc=null;guardaCart();$('#cRec').value='';$('#cNom').value='';met='efectivo';rCaja();verTicket(j.venta)}
 catch(e){rCaja()}}
$('#bCobrar').onclick=cobrar;
document.addEventListener('keydown',e=>{if(e.key==='F2'){e.preventDefault();tab('caja');$('#cod').focus()}if(e.key==='F9'&&vista==='caja'){e.preventDefault();cobrar()}});

/* ---------- Mini factura ---------- */
function ticketHTML(v){const n=S.negocio||{};const cli=v.cliente?S.clientes.find(c=>c.id===v.cliente):null;const sal=v.cliente?saldoCli(v.cliente):0;
 return`<div class="tk"><h4>${esc(n.nombre||'Tecnocenter')}</h4><div class="c">${n.nit?'NIT '+esc(n.nit)+'<br>':''}${esc(n.dir||'')}${n.ciudad?(n.dir?' · ':'')+esc(n.ciudad):''}${n.tel?'<br>Tel. '+esc(n.tel):''}${n.regimen?'<br><span class="s">'+esc(n.regimen)+'</span>':''}</div><hr>
 <div class="r"><span>Comprobante</span><span><b>${esc(v.num)}</b></span></div><div class="r"><span>Fecha</span><span>${fechaL(v.f)}</span></div><div class="r"><span>Atendió</span><span>${esc(v.user)}</span></div>
 ${cli?`<div class="r"><span>Cliente</span><span>${esc(cli.nombre)}</span></div>${cli.doc?`<div class="r"><span>C.C./NIT</span><span>${esc(cli.doc)}</span></div>`:''}`:v.clienteN?`<div class="r"><span>Cliente</span><span>${esc(v.clienteN)}</span></div>`:'<div class="r"><span>Cliente</span><span>Consumidor final</span></div>'}<hr>
 ${v.lineas.map(l=>`<div>${esc(l.n)}</div><div class="r"><span>${l.q} x ${cop(l.p)}${l.base&&l.base>l.p?' (promo)':''}</span><span>${cop(l.p*l.q)}</span></div>`).join('')}<hr>
 <div class="r"><span>Subtotal</span><span>${cop(v.sub)}</span></div>${v.desc?`<div class="r"><span>Descuento${v.descMotivo?' ('+esc(v.descMotivo)+')':''}</span><span>−${cop(v.desc)}</span></div>`:''}
 <div class="r t"><span>TOTAL</span><span>${cop(v.total)}</span></div>
 <div class="r"><span>Pago</span><span>${MET[v.pago.met]}</span></div>${v.pago.met==='efectivo'&&v.pago.recibido>v.total?`<div class="r"><span>Recibido</span><span>${cop(v.pago.recibido)}</span></div><div class="r"><span>Cambio</span><span>${cop(v.pago.cambio)}</span></div>`:''}
 ${v.pago.met==='credito'?`<hr><div class="c"><b>VENTA A CRÉDITO</b><br>Saldo pendiente del cliente: <b>${cop(sal)}</b><br><br>Firma: _______________________</div>`:''}
 ${v.anulada?'<hr><div class="c"><b>*** ANULADA ***</b></div>':''}<hr><div class="c s">${esc(n.pie||'')}<br>Comprobante de venta · no es factura electrónica</div></div>`}
function abonoHTML(a){const n=S.negocio||{};return`<div class="tk"><h4>${esc(n.nombre||'Tecnocenter')}</h4><div class="c">${n.nit?'NIT '+esc(n.nit)+'<br>':''}${esc(n.tel?'Tel. '+n.tel:'')}</div><hr><div class="c"><b>RECIBO DE ABONO</b></div><hr>
 <div class="r"><span>Fecha</span><span>${fechaL(a.f)}</span></div><div class="r"><span>Cliente</span><span>${esc(a.clienteN)}</span></div><div class="r"><span>Método</span><span>${MET[a.met]}</span></div><div class="r t"><span>ABONO</span><span>${cop(a.valor)}</span></div><div class="r"><span>Saldo pendiente</span><span>${cop(a.saldoDespues)}</span></div><div class="r"><span>Recibió</span><span>${esc(a.user)}</span></div><hr><div class="c s">${esc(n.pie||'')}</div></div>`}
let tkTexto='';
function verTicket(v,esAbono){$('#tkPrint').innerHTML=esAbono?abonoHTML(v):ticketHTML(v);tkTexto=$('#tkPrint').innerText.replace(/\n{3,}/g,'\n\n');$('#tkOk').textContent=esAbono?'Listo':'Nueva venta';$('#dTk').showModal()}
$('#tkImp').onclick=()=>window.print();
$('#tkWa').onclick=()=>{const a=document.createElement('a');a.href='https://wa.me/?text='+encodeURIComponent(tkTexto);a.target='_blank';a.rel='noopener';a.click()};
$('#dTk').addEventListener('close',()=>{if(vista==='caja')$('#cod').focus()});

/* ---------- VENTAS DEL DÍA ---------- */
$('#vFecha').value=hoy();$('#vFecha').addEventListener('change',rVentas);$('#vHoy').onclick=()=>{$('#vFecha').value=hoy();rVentas()};
function rVentas(){const f=$('#vFecha').value||hoy();$('#vFechaT').textContent=new Date(f+'T12:00').toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
 const V=S.ventas.filter(v=>dia(v.f)===f),ok=V.filter(v=>!v.anulada),A=S.abonos.filter(a=>dia(a.f)===f);
 const sum=(arr,fn)=>arr.reduce((a,x)=>a+fn(x),0),porM=m=>sum(ok.filter(v=>v.pago.met===m),v=>v.total);
 const tot=sum(ok,v=>v.total),ef=porM('efectivo'),dig=porM('nequi')+porM('daviplata')+porM('transferencia')+porM('tarjeta'),cr=porM('credito'),abT=sum(A,a=>a.valor),abEf=sum(A.filter(a=>a.met==='efectivo'),a=>a.valor);
 $('#vKpis').innerHTML=[['Total vendido',cop(tot),'hi'],['Ventas',ok.length+(V.length>ok.length?` <small>(${V.length-ok.length} anuladas)</small>`:'')],['Unidades vendidas',sum(ok,v=>v.lineas.reduce((a,l)=>a+l.q,0))],['Efectivo en caja',cop(ef+abEf)],['Nequi, Daviplata, tarjeta y transferencia',cop(dig)],['Vendido a crédito',cop(cr)],['Abonos recibidos',cop(abT)],['Descuentos dados',cop(sum(ok,v=>v.desc))],...(D()?[['Ganancia estimada',cop(utilidad(ok)),'ow']]:[])].map(([a,b,c])=>`<div class="kpi ${c||''}"><b>${b}</b><span>${a}</span></div>`).join('');
 $('#tVentas tbody').innerHTML=V.length?V.slice().reverse().map(v=>`<tr class="${v.anulada?'anul':''}"><td>${hora(v.f)}</td><td class="mono">${esc(v.num)}</td><td>${v.lineas.map(l=>`${l.q} × ${esc(l.n)}`).join('<br>')}</td><td>${esc(v.cliente?(S.clientes.find(c=>c.id===v.cliente)?.nombre||''):v.clienteN||'—')}</td><td>${MET[v.pago.met]}${v.anulada?' <span class="st b">Anulada</span>':''}</td><td class="num"><b>${cop(v.total)}</b>${v.desc?`<small>desc. ${cop(v.desc)}</small>`:''}</td><td>${esc(v.user)}</td><td class="num"><button class="btn sm" data-tk="${esc(v.id)}">Factura</button>${D()&&!v.anulada?` <button class="btn sm" data-anul="${esc(v.id)}">Anular</button>`:''}</td></tr>`).join(''):'<tr><td colspan="8" class="empty">No hay ventas este día.</td></tr>';
 $('#tAbDia tbody').innerHTML=A.length?A.slice().reverse().map(a=>`<tr><td>${hora(a.f)}</td><td>${esc(a.clienteN)}</td><td>${MET[a.met]}</td><td class="num"><b>${cop(a.valor)}</b></td><td>${esc(a.user)}</td></tr>`).join(''):'<tr><td colspan="5" class="empty">No hay abonos este día.</td></tr>'}
$('#tVentas').addEventListener('click',e=>{const t=e.target.closest('[data-tk]');if(t){verTicket(S.ventas.find(v=>v.id===t.dataset.tk));return}
 const a=e.target.closest('[data-anul]');if(a){const v=S.ventas.find(x=>x.id===a.dataset.anul);confirmar('Anular venta '+v.num,`Se devolverán ${v.lineas.reduce((s,l)=>s+l.q,0)} unidad(es) al inventario y el total de ${cop(v.total)} saldrá de las ventas.`,true,async m=>{await op('anular',{id:v.id,motivo:m});toast('Venta anulada')})}});

/* ---------- INVENTARIO ---------- */
const FI={bajo:false,cero:false,promo:false,sinp:false,sinc:false};
$$('#v-inv .chip').forEach(c=>c.onclick=()=>{FI[c.dataset.f]=!FI[c.dataset.f];c.setAttribute('aria-pressed',FI[c.dataset.f]);rInv()});
$('#iQ').addEventListener('input',rInv);$('#iCat').addEventListener('change',rInv);
function rInv(){const v30=vend30(),it=S.items;
 const uni=it.reduce((a,i)=>a+Math.max(0,i.q||0),0),valP=it.reduce((a,i)=>a+Math.max(0,i.q||0)*(i.p||0),0),valC=it.reduce((a,i)=>a+Math.max(0,i.q||0)*(i.costo||0),0);
 $('#iSub').textContent=it.length+' productos registrados';
 $('#iKpis').innerHTML=[['Unidades en existencia',uni.toLocaleString('es-CO')],['Valor a precio detal',cop(valP),'hi'],...(D()?[['Valor a costo (lo invertido)',cop(valC),'ow'],['Ganancia si se vende todo',cop(it.reduce((a,i)=>a+(i.costo!=null&&i.p!=null?Math.max(0,i.q||0)*(i.p-i.costo):0),0)),'ow']]:[]),['Agotados',it.filter(i=>(i.q||0)<=0).length],['Bajo mínimo',it.filter(i=>i.min>0&&i.q>0&&i.q<=i.min).length]].map(([a,b,c])=>`<div class="kpi ${c||''}"><b>${b}</b><span>${a}</span></div>`).join('');
 const cats=[...new Set(it.map(i=>i.c))].sort((a,b)=>a.localeCompare(b,'es')),cur=$('#iCat').value;$('#iCat').innerHTML='<option value="">Todas las categorías</option>'+cats.map(c=>`<option>${esc(c)}</option>`).join('');$('#iCat').value=cats.includes(cur)?cur:'';
 $('#cats').innerHTML=cats.map(c=>`<option value="${esc(c)}">`).join('');
 const q=norm($('#iQ').value.trim()),c=$('#iCat').value;
 const L=it.filter(i=>(!c||i.c===c)&&(!FI.cero||(i.q||0)<=0)&&(!FI.bajo||(i.min>0&&i.q<=i.min))&&(!FI.promo||i.promo>0)&&(!FI.sinp||i.p==null)&&(!FI.sinc||i.costo==null)&&(!q||norm(i.cod+' '+i.n+' '+i.m+' '+i.c+' '+(i.barras||'')).includes(q)));
 $('#tInv tbody').innerHTML=L.length?L.map(i=>{const [et,ec]=estadoIt(i),f=fotoUrl(i.foto),mg=i.costo!=null&&i.p?Math.round((i.p-i.costo)/i.p*100):null;return`<tr data-id="${i.id}"><td class="mono">${esc(i.cod)}</td><td><div class="pr"><button class="ph" data-foto="${i.id}" aria-label="Foto">${f?`<img src="${esc(f)}" alt="" loading="lazy">`:camIco}</button><div><b>${esc(i.n)}</b>${i.promo>0?' <span class="st w">Promo '+cop(i.promo)+'</span>':''}<small>${esc(i.m)}${i.m?' · ':''}${esc(i.c)}</small></div></div></td><td class="num"><b>${i.q??0}</b></td><td class="num">${i.min||'—'}</td><td><span class="st ${ec}">${et}</span></td><td class="num">${v30[i.id]||0}</td><td class="num">${cop(i.p)}</td>${D()?`<td class="num">${cop(i.costo)}</td><td class="num">${mg==null?'—':mg+'%'}</td>`:''}<td class="num">${D()?`<button class="btn sm" data-edit>Editar</button> <button class="btn sm" data-ent>Entrada</button> `:''}${i.h?`<button class="btn sm" data-h="${i.h}">Hoja ${i.h}</button>`:''}</td></tr>`}).join(''):'<tr><td colspan="10" class="empty">No hay productos con ese filtro.</td></tr>';
 $('#iPie').textContent=`${L.length} productos mostrados · ${L.reduce((a,i)=>a+Math.max(0,i.q||0),0)} unidades · ${cop(L.reduce((a,i)=>a+Math.max(0,i.q||0)*(i.p||0),0))} a precio detal`}
$('#tInv').addEventListener('click',e=>{const tr=e.target.closest('tr[data-id]');if(!tr)return;const it=byId(+tr.dataset.id);
 if(e.target.closest('[data-edit]'))editar(it);if(e.target.closest('[data-ent]'))entrada(it);
 if(e.target.closest('[data-foto]')){if(fotoUrl(it.foto))verFoto(it);else if(D())editar(it)}});
// Producto
const dProd=$('#dProd');let ed=null,fotoN;
function margen(){const p=+$('#pPromo').value||+$('#pP').value,c=$('#pCosto').value;$('#pMarg').textContent=c===''||!p?'—':cop(p-c)+' ('+Math.round((p-c)/p*100)+'%)'}
['pP','pPromo','pCosto'].forEach(i=>$('#'+i).addEventListener('input',margen));
function editar(it){ed=it||null;fotoN=undefined;$('#dProdT').textContent=it?'Editar producto':'Producto nuevo';
 $('#pCod').value=it?.cod||'';$('#pBar').value=it?.barras||'';$('#pN').value=it?.n||'';$('#pM').value=it?.m||'';$('#pC').value=it?.c||$('#iCat').value||'';$('#pP').value=it?.p??'';$('#pPromo').value=it?.promo||'';$('#pCosto').value=it?.costo??'';$('#pQ').value=it?.q??0;$('#pMin').value=it?.min||0;$('#pNota').value=it?.nota||'';
 $('#pPh').innerHTML=fotoUrl(it?.foto)?`<img src="${esc(it.foto)}" alt="">`:'Sin foto';$('#pFotoT').textContent='Se mejora y se sube a la nube.';$('#pDel').hidden=!it;margen();dProd.showModal()}
$('#bNuevo').onclick=()=>editar(null);
$('#pFile').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;$('#pOk').disabled=true;$('#pFotoT').textContent='Mejorando y subiendo…';
 try{const b64=await mejorar(f);const j=await api('/api/upload',{method:'POST',body:JSON.stringify({data:b64})});fotoN=j.url;$('#pPh').innerHTML=`<img src="${esc(j.url)}" alt="">`;$('#pFotoT').textContent='Foto lista ✓'}catch(err){$('#pFotoT').textContent='No se pudo subir: '+err.message}
 $('#pOk').disabled=false;e.target.value=''});
$('#fProd').addEventListener('submit',async e=>{e.preventDefault();const p={id:ed?.id,cod:$('#pCod').value,barras:$('#pBar').value,n:$('#pN').value,m:$('#pM').value,c:$('#pC').value,p:$('#pP').value,promo:$('#pPromo').value,costo:$('#pCosto').value,q:$('#pQ').value,min:$('#pMin').value,nota:$('#pNota').value};if(fotoN!==undefined)p.foto=fotoN;
 try{const j=await op('producto',{p});dProd.close();toast((ed?'Producto actualizado: ':'Producto creado con código ')+j.item.cod)}catch(err){}});
$('#pBar').addEventListener('keydown',e=>{if(e.key==='Enter')e.preventDefault()});
$('#pDel').onclick=()=>{const it=ed;dProd.close();confirmar('Eliminar '+it.n,'El producto se quitará del inventario. Las ventas pasadas se conservan.',false,async()=>{await op('eliminar',{id:it.id});toast('Producto eliminado')})};
// Entrada
function entrada(it){$('#dlProds').innerHTML=S.items.map(i=>`<option value="${esc(i.cod)} · ${esc(i.n)}${i.m?' '+esc(i.m):''}">`).join('');$('#eBus').value=it?`${it.cod} · ${it.n}${it.m?' '+it.m:''}`:'';$('#eQ').value='';$('#eNota').value='';eInfo();$('#dEnt').showModal();setTimeout(()=>(it?$('#eQ'):$('#eBus')).focus(),50)}
function eProd(){const v=$('#eBus').value.split(' · ')[0].trim();return S.items.find(i=>norm(i.cod)===norm(v)||(i.barras&&i.barras===v))}
function eInfo(){const it=eProd();$('#eInfo').textContent=it?`Existencia actual: ${it.q||0} · costo actual ${cop(it.costo)} · precio detal ${cop(it.p)}`:'Escriba o pase el código del producto';if(it&&$('#eCosto').dataset.id!=it.id){$('#eCosto').value=it.costo??'';$('#eCosto').dataset.id=it.id}}
$('#eBus').addEventListener('input',eInfo);$('#bEntradaG').onclick=()=>entrada(null);
$('#fEnt').addEventListener('submit',async e=>{e.preventDefault();const it=eProd();if(!it){toast('Producto no encontrado',true);return}
 try{await op('entrada',{id:it.id,q:+$('#eQ').value,costo:$('#eCosto').value,nota:$('#eNota').value});$('#dEnt').close();toast(`Entraron ${$('#eQ').value} de ${it.n}. Ahora hay ${byId(it.id).q}.`)}catch(err){}});
// Mejora de fotos de productos
async function mejorar(file){const img=await createImageBitmap(file,{imageOrientation:'from-image'}).catch(()=>null);if(!img)throw new Error('No se pudo leer la imagen');
 const L=Math.max(img.width,img.height),k=Math.min(1920,Math.max(1200,L))/L,W=Math.round(img.width*k),Hh=Math.round(img.height*k);
 const c=document.createElement('canvas');c.width=W;c.height=Hh;const x=c.getContext('2d');x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(img,0,0,W,Hh);
 const d=x.getImageData(0,0,W,Hh),s=d.data,o=new Uint8ClampedArray(s),a=.35;
 for(let y=1;y<Hh-1;y++)for(let i=1;i<W-1;i++){const p=(y*W+i)*4;for(let ch=0;ch<3;ch++)o[p+ch]=s[p+ch]*(1+4*a)-a*(s[p-4+ch]+s[p+4+ch]+s[p-W*4+ch]+s[p+W*4+ch])}
 x.putImageData(new ImageData(o,W,Hh),0,0);let q=.9,b64;do{b64=c.toDataURL('image/jpeg',q).split(',')[1];q-=.08}while(b64.length>3.6e6&&q>.5);return b64}

/* ---------- POR COMPRAR ---------- */
let uno=false;$('#cUno').onclick=()=>{uno=!uno;$('#cUno').setAttribute('aria-pressed',uno);rComp()};
function sugerido(i,v30){const obj=Math.max(i.min*2,v30[i.id]||0,1);return Math.max(obj-(i.q||0),1)}
function rComp(){const v30=vend30(),L=porComprar(uno).sort((a,b)=>(a.q||0)-(b.q||0)||(v30[b.id]||0)-(v30[a.id]||0));
 $('#pKpis').innerHTML=[['Productos por comprar',L.length,'hi'],['Agotados',L.filter(i=>(i.q||0)<=0).length],['Unidades sugeridas',L.reduce((a,i)=>a+sugerido(i,v30),0)],...(D()?[['Inversión estimada',cop(L.reduce((a,i)=>a+sugerido(i,v30)*(i.costo||0),0)),'ow']]:[])].map(([a,b,c])=>`<div class="kpi ${c||''}"><b>${b}</b><span>${a}</span></div>`).join('');
 $('#tComp tbody').innerHTML=L.length?L.map(i=>`<tr><td class="mono">${esc(i.cod)}</td><td><b>${esc(i.n)}</b><small>${esc(i.m)}</small></td><td class="num"><span class="st ${estadoIt(i)[1]}">${i.q||0}</span></td><td class="num">${i.min||'—'}</td><td class="num">${v30[i.id]||0}</td><td class="num"><b>${sugerido(i,v30)}</b></td>${D()?`<td class="num">${i.costo!=null?cop(i.costo*sugerido(i,v30)):'Sin costo'}</td>`:''}</tr>`).join(''):'<tr><td colspan="7" class="empty">No hay productos por comprar.</td></tr>'}
$('#bCopiarComp').onclick=async()=>{const v30=vend30();const t=`Pedido ${S.negocio?.nombre||'Tecnocenter'} · ${new Date().toLocaleDateString('es-CO')}\n`+porComprar(uno).map(i=>`• ${sugerido(i,v30)} × ${i.n}${i.m?' '+i.m:''} (cód. ${i.cod})`).join('\n');try{await navigator.clipboard.writeText(t);toast('Lista copiada: péguela en WhatsApp')}catch(e){toast('No se pudo copiar',true)}};

/* ---------- CRÉDITOS ---------- */
let soloSaldo=true;$('#crSaldo').onclick=()=>{soloSaldo=!soloSaldo;$('#crSaldo').setAttribute('aria-pressed',soloSaldo);rCred()};$('#crQ').addEventListener('input',rCred);
function rCred(){const q=norm($('#crQ').value.trim());
 const L=S.clientes.map(c=>{const comp=vendidas().filter(v=>v.cliente===c.id&&v.pago.met==='credito').reduce((a,v)=>a+v.total,0),ab=S.abonos.filter(a=>a.cliente===c.id).reduce((a,x)=>a+x.valor,0);return{...c,comp,ab,saldo:comp-ab}}).filter(c=>(!soloSaldo||c.saldo>0)&&(!q||norm(c.nombre+' '+c.doc+' '+c.tel).includes(q))).sort((a,b)=>b.saldo-a.saldo);
 const tot=S.clientes.reduce((a,c)=>a+saldoCli(c.id),0);
 $('#crKpis').innerHTML=[['Total por cobrar',cop(tot),'hi'],['Clientes con saldo',S.clientes.filter(c=>saldoCli(c.id)>0).length],['Clientes registrados',S.clientes.length],['Abonos recibidos hoy',cop(S.abonos.filter(a=>dia(a.f)===hoy()).reduce((a,x)=>a+x.valor,0))]].map(([a,b,c])=>`<div class="kpi ${c||''}"><b>${b}</b><span>${a}</span></div>`).join('');
 $('#tCred tbody').innerHTML=L.length?L.map(c=>`<tr data-cli="${esc(c.id)}"><td><b>${esc(c.nombre)}</b>${c.cupo&&c.saldo>c.cupo?' <span class="st b">Supera cupo</span>':''}</td><td>${esc(c.doc||'—')}</td><td>${esc(c.tel||'—')}</td><td class="num">${cop(c.comp)}</td><td class="num">${cop(c.ab)}</td><td class="num"><b>${cop(c.saldo)}</b></td><td class="num">${c.saldo>0?'<button class="btn sm pri" data-abonar>Abonar</button> ':''}<button class="btn sm" data-hist>Historial</button> <button class="btn sm" data-ecli>Editar</button></td></tr>`).join(''):`<tr><td colspan="7" class="empty">${soloSaldo?'No hay clientes con saldo pendiente.':'No hay clientes.'}</td></tr>`}
$('#tCred').addEventListener('click',e=>{const tr=e.target.closest('tr[data-cli]');if(!tr)return;const c=S.clientes.find(x=>x.id===tr.dataset.cli);
 if(e.target.closest('[data-abonar]'))abonar(c);if(e.target.closest('[data-hist]'))historial(c);if(e.target.closest('[data-ecli]'))cliente(c)});
let cliEd=null,cliDesdeCaja=false;
function cliente(c,desdeCaja){cliEd=c||null;cliDesdeCaja=!!desdeCaja;$('#dCliT').textContent=c?'Editar cliente':'Cliente nuevo';$('#kN').value=c?.nombre||'';$('#kDoc').value=c?.doc||'';$('#kTel').value=c?.tel||'';$('#kDir').value=c?.dir||'';$('#kCupo').value=c?.cupo||'';$('#dCli').showModal()}
$('#bCliNuevo').onclick=()=>cliente(null,true);$('#bCliNuevo2').onclick=()=>cliente(null);
$('#fCli').addEventListener('submit',async e=>{e.preventDefault();try{const j=await op('cliente',{id:cliEd?.id,nombre:$('#kN').value,doc:$('#kDoc').value,tel:$('#kTel').value,dir:$('#kDir').value,cupo:$('#kCupo').value});$('#dCli').close();toast('Cliente guardado');if(cliDesdeCaja){$('#cCli').value=j.cliente.id;cliInfo()}}catch(err){}});
let abCli=null;
function abonar(c){abCli=c;const s=saldoCli(c.id);$('#aInfo').innerHTML=`${esc(c.nombre)} · saldo pendiente <b>${cop(s)}</b>`;$('#aVal').value='';$('#aVal').max=s;$('#aMet').value='efectivo';$('#dAbono').showModal()}
$('#aTodo').onclick=()=>$('#aVal').value=saldoCli(abCli.id);
$('#fAbono').addEventListener('submit',async e=>{e.preventDefault();try{const j=await op('abono',{cliente:abCli.id,valor:+$('#aVal').value,met:$('#aMet').value});$('#dAbono').close();$('#dHist').close();verTicket(j.abono,true)}catch(err){}});
function historial(c){abCli=c;const mov=[...vendidas().filter(v=>v.cliente===c.id&&v.pago.met==='credito').map(v=>({f:v.f,t:'Compra '+v.num+': '+v.lineas.map(l=>l.q+' × '+l.n).join(', '),cargo:v.total,ab:0,v})),...S.abonos.filter(a=>a.cliente===c.id).map(a=>({f:a.f,t:'Abono ('+MET[a.met]+')',cargo:0,ab:a.valor,a}))].sort((a,b)=>a.f-b.f);
 let s=0;mov.forEach(m=>{s+=m.cargo-m.ab;m.s=s});
 $('#hT').textContent=c.nombre;$('#hK').innerHTML=[['Saldo pendiente',cop(s),'hi'],['Cédula / NIT',esc(c.doc||'—')],['Teléfono',esc(c.tel||'—')]].map(([a,b,k])=>`<div class="kpi ${k||''}"><b>${b}</b><span>${a}</span></div>`).join('');
 $('#tHist tbody').innerHTML=mov.length?mov.slice().reverse().map((m,i)=>`<tr><td>${fechaL(m.f)}</td><td>${esc(m.t)}</td><td class="num">${m.cargo?cop(m.cargo):''}</td><td class="num">${m.ab?cop(m.ab):''}</td><td class="num"><b>${cop(m.s)}</b></td><td class="num"><button class="btn sm" data-hk="${m.v?'v:'+esc(m.v.id):'a:'+esc(m.a.id)}">Recibo</button></td></tr>`).join(''):'<tr><td colspan="6" class="empty">Sin movimientos de crédito.</td></tr>';
 $('#hAbonar').hidden=s<=0;$('#dHist').showModal()}
$('#hAbonar').onclick=()=>abonar(abCli);
$('#tHist').addEventListener('click',e=>{const b=e.target.closest('[data-hk]');if(!b)return;const [t,id]=b.dataset.hk.split(':');if(t==='v')verTicket(S.ventas.find(v=>v.id===id));else verTicket(S.abonos.find(a=>a.id===id),true)});

/* ---------- MOVIMIENTOS ---------- */
$('#mFecha').value=hoy();$('#mFecha').addEventListener('change',rMovs);$('#mTipo').addEventListener('change',rMovs);$('#mHoy').onclick=()=>{$('#mFecha').value=hoy();rMovs()};
function rMovs(){const f=$('#mFecha').value||hoy(),t=$('#mTipo').value,M=S.movs.filter(m=>dia(m.f)===f),L=M.filter(m=>!t||m.tipo===t);
 const s=tp=>M.filter(m=>m.tipo===tp).reduce((a,m)=>a+Math.abs(m.q),0);
 $('#mKpis').innerHTML=[['Unidades que entraron',s('entrada'),'hi'],['Unidades que salieron (ventas)',s('salida')],['Devoluciones',s('devolucion')],['Ajustes',M.filter(m=>m.tipo==='ajuste').length],['Existencia total ahora',S.items.reduce((a,i)=>a+Math.max(0,i.q||0),0).toLocaleString('es-CO')]].map(([a,b,c])=>`<div class="kpi ${c||''}"><b>${b}</b><span>${a}</span></div>`).join('');
 $('#tMovs tbody').innerHTML=L.length?L.slice().reverse().map(m=>{const [tn,tc]=TIPO[m.tipo]||[m.tipo,'n'];const sg=m.tipo==='salida'?-Math.abs(m.q):m.tipo==='ajuste'?m.q:Math.abs(m.q);return`<tr><td>${hora(m.f)}</td><td><span class="st ${tc}">${tn}</span></td><td class="mono">${esc(m.cod)}</td><td>${esc(m.n)}</td><td class="num"><b>${sg>0?'+':''}${sg}</b></td><td>${esc(m.nota)}${D()&&m.costo!=null&&m.tipo==='entrada'?` <small>costo ${cop(m.costo)} c/u</small>`:''}</td><td>${esc(m.user)}</td></tr>`}).join(''):'<tr><td colspan="7" class="empty">No hay movimientos este día.</td></tr>'}

/* ---------- RESUMEN (dueño) ---------- */
function rRes(){if(!D())return;const ok=vendidas(),hD=hoy(),now=new Date();
 const ini=d=>{const x=new Date(now);x.setHours(0,0,0,0);x.setDate(x.getDate()-d);return+x};
 const enRango=(d)=>ok.filter(v=>v.f>=ini(d));const sum=a=>a.reduce((s,v)=>s+v.total,0);
 const mes=ok.filter(v=>{const d=new Date(v.f);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()});
 const it=S.items;
 $('#rKpis').innerHTML=[['Vendido hoy',cop(sum(ok.filter(v=>dia(v.f)===hD))),'hi'],['Últimos 7 días',cop(sum(enRango(6)))],['Este mes',cop(sum(mes))],['Ganancia del mes',cop(utilidad(mes)),'ow'],['Por cobrar (créditos)',cop(S.clientes.reduce((a,c)=>a+saldoCli(c.id),0))],['Inventario a costo',cop(it.reduce((a,i)=>a+Math.max(0,i.q||0)*(i.costo||0),0)),'ow'],['Inventario a precio detal',cop(it.reduce((a,i)=>a+Math.max(0,i.q||0)*(i.p||0),0))],['Productos sin costo',it.filter(i=>i.costo==null).length]].map(([a,b,c])=>`<div class="kpi ${c||''}"><b>${b}</b><span>${a}</span></div>`).join('');
 const dias=[...Array(14)].map((_,k)=>{const d=new Date(now);d.setDate(d.getDate()-13+k);const key=dia(d);return{key,lab:d.toLocaleDateString('es-CO',{weekday:'short'}).slice(0,2)+' '+d.getDate(),v:sum(ok.filter(v=>dia(v.f)===key))}});const mx=Math.max(1,...dias.map(d=>d.v));
 $('#rDias').innerHTML=dias.map(d=>`<div class="${d.key===hD?'hoy':''}" title="${d.lab}: ${cop(d.v)}"><span>${d.v?Math.round(d.v/1000)+'k':''}</span><i style="height:${(d.v/mx*100).toFixed(1)}%"></i><span>${d.lab}</span></div>`).join('');
 const v30={},v30v={},nm={};ok.filter(v=>v.f>=ini(29)).forEach(v=>v.lineas.forEach(l=>{const it=byId(l.id);nm[l.id]=it?(it.n+(it.m?' '+it.m:'')):l.n;v30[l.id]=(v30[l.id]||0)+l.q;v30v[l.id]=(v30v[l.id]||0)+l.q*l.p}));
 const top=Object.entries(v30).sort((a,b)=>b[1]-a[1]).slice(0,10),mt=top[0]?.[1]||1;
 $('#rTop').innerHTML=top.length?top.map(([k,q])=>`<div class="bar"><span>${esc(nm[k])}</span><span class="tr"><i style="width:${q/mt*100}%"></i></span><span>${q} uds · ${cop(v30v[k])}</span></div>`).join(''):'<p class="lbl">Aún no hay ventas en los últimos 30 días.</p>';
 const g={};it.forEach(i=>g[i.c]=(g[i.c]||0)+Math.max(0,i.q||0)*(i.p||0));const gc=Object.entries(g).sort((a,b)=>b[1]-a[1]),mc=gc[0]?.[1]||1;
 $('#rCat').innerHTML=gc.map(([c,v])=>`<div class="bar"><span>${esc(c)}</span><span class="tr"><i style="width:${v/mc*100}%"></i></span><span>${cop(v)}</span></div>`).join('');
 const u={};ok.filter(v=>dia(v.f)===hD).forEach(v=>{const k=v.user||'Antes del sistema';u[k]=(u[k]||0)+v.total});const gu=Object.entries(u),mu=Math.max(1,...gu.map(x=>x[1]));
 $('#rUser').innerHTML=gu.length?gu.map(([n,v])=>`<div class="bar"><span>${esc(n)}</span><span class="tr"><i style="width:${v/mu*100}%"></i></span><span>${cop(v)}</span></div>`).join(''):'<p class="lbl">Aún no hay ventas hoy.</p>'}

/* ---------- AJUSTES ---------- */
function rAju(){if(!D())return;const n=S.negocio||{};$('#nNom').value=n.nombre||'';$('#nNit').value=n.nit||'';$('#nDir').value=n.dir||'';$('#nCiu').value=n.ciudad||'';$('#nTel').value=n.tel||'';$('#nReg').value=n.regimen||'';$('#nPie').value=n.pie||'';
 $('#sOwn').textContent=S.seg?.ownerU||YO.u;$('#sCajaU').value=S.seg?.cajaU||'';prev()}
function prev(){const v={num:'TC-000123',f:Date.now(),user:YO?.u||'',lineas:[{n:'Memoria micro SD Kingston 32 GB',q:1,p:40000},{n:'Cable USB-C a Lightning 1 m',q:2,p:20000}],sub:80000,desc:0,total:80000,pago:{met:'efectivo',recibido:100000,cambio:20000},cliente:null,clienteN:''};
 const n0=S.negocio;S.negocio={nombre:$('#nNom').value,nit:$('#nNit').value,dir:$('#nDir').value,ciudad:$('#nCiu').value,tel:$('#nTel').value,regimen:$('#nReg').value,pie:$('#nPie').value};$('#tkPrev').innerHTML=ticketHTML(v);S.negocio=n0}
$('#fNeg').addEventListener('input',prev);
$('#fNeg').addEventListener('submit',async e=>{e.preventDefault();try{await op('negocio',{negocio:{nombre:$('#nNom').value,nit:$('#nNit').value,dir:$('#nDir').value,ciudad:$('#nCiu').value,tel:$('#nTel').value,regimen:$('#nReg').value,pie:$('#nPie').value}});toast('Datos del negocio guardados')}catch(err){}});
$('#fSeg').addEventListener('submit',async e=>{e.preventDefault();try{await op('seguridad',{cajaU:$('#sCajaU').value.trim(),cajaP:$('#sCajaP').value,ownerP:$('#sOwnP').value,pin:$('#sPin').value.trim()});$('#sCajaP').value=$('#sOwnP').value=$('#sPin').value='';toast('Cambios de seguridad guardados')}catch(err){}});

/* ---------- Varios ---------- */
let cfFn=null;function confirmar(t,m,motivo,fn){$('#cfT').textContent=t;$('#cfM').textContent=m;$('#cfInBox').hidden=!motivo;$('#cfIn').value='';cfFn=fn;$('#dConf').showModal()}
$('#fConf').addEventListener('submit',async e=>{e.preventDefault();const fn=cfFn;$('#dConf').close();try{await fn($('#cfIn').value)}catch(err){}});
document.addEventListener('click',e=>{const c=e.target.closest('[data-close]');if(c)c.closest('dialog').close();const h=e.target.closest('[data-h]');if(h)verHoja(+h.dataset.h)});
let hA=1;const lb=$('#lb');
function verHoja(n){hA=n;$('#lbPrev').hidden=$('#lbNext').hidden=false;$('#lbT').textContent='Hoja '+n+' · '+(H[n]||'');$('#lbI').src='img/hoja-'+pad(n)+'.jpg';lb.classList.add('on','fit');$('#lbZoom').textContent='Tamaño real';$('#lbX').focus()}
function verFoto(it){$('#lbPrev').hidden=$('#lbNext').hidden=true;$('#lbT').textContent=it.n+(it.m?' · '+it.m:'');$('#lbI').src=it.foto;lb.classList.add('on','fit');$('#lbX').focus()}
$('#lbX').onclick=()=>lb.classList.remove('on');$('#lbPrev').onclick=()=>verHoja(hA>1?hA-1:20);$('#lbNext').onclick=()=>verHoja(hA<20?hA+1:1);
$('#lbZoom').onclick=()=>{const f=lb.classList.toggle('fit');$('#lbZoom').textContent=f?'Tamaño real':'Ajustar a pantalla'};
document.addEventListener('keydown',e=>{if(!lb.classList.contains('on'))return;if(e.key==='Escape')lb.classList.remove('on');if(e.key==='ArrowLeft'&&!$('#lbPrev').hidden)$('#lbPrev').click();if(e.key==='ArrowRight'&&!$('#lbNext').hidden)$('#lbNext').click()});

/* ---------- Excel ---------- */
$('#bExcel').onclick=()=>{if(!window.XLSX){toast('Cargando Excel… intente en un momento');return}
 const X=XLSX,wb=X.utils.book_new(),nom=S.negocio?.nombre||'Tecnocenter',fecha=new Date().toLocaleDateString('es-CO'),fmt='"$"#,##0',v30=vend30();
 const hoja=(nombre,titulo,cab,filas,money,anchos,totales)=>{const a=[[titulo],['Generado el '+fecha+' por '+YO.u],[],cab,...filas];const ws=X.utils.aoa_to_sheet(a);const ini=5,fin=4+filas.length;
  filas.forEach((f,k)=>money.forEach(ci=>{const ref=X.utils.encode_cell({r:ini-1+k,c:ci});if(ws[ref]&&typeof ws[ref].v==='number')ws[ref].z=fmt}));
  if(totales&&filas.length){const row=cab.map((_,ci)=>ci===0?'TOTAL':totales.includes(ci)?{t:'n',f:`SUM(${X.utils.encode_col(ci)}${ini}:${X.utils.encode_col(ci)}${fin})`,z:money.includes(ci)?fmt:undefined}:'');X.utils.sheet_add_aoa(ws,[row],{origin:'A'+(fin+2)})}
  ws['!cols']=anchos.map(w=>({wch:w}));if(filas.length)ws['!autofilter']={ref:`A4:${X.utils.encode_col(cab.length-1)}${fin}`};X.utils.book_append_sheet(wb,ws,nombre)};
 const its=S.items.slice().sort((a,b)=>a.cod.localeCompare(b.cod,'es',{numeric:true}));
 hoja('Inventario',nom+' — Inventario',['Código','Código de barras','Producto','Modelo','Categoría','Existencia','Mínimo','Estado','Vendidos 30 días','Precio detal','Precio promo',...(D()?['Costo (mayor)','Margen %','Valor a costo']:[]),'Valor a precio detal','Hoja cuaderno','Nota'],
  its.map(i=>[i.cod,i.barras||'',i.n,i.m,i.c,i.q??0,i.min||0,estadoIt(i)[0],v30[i.id]||0,i.p??'',i.promo||'',...(D()?[i.costo??'',i.costo!=null&&i.p?Math.round((i.p-i.costo)/i.p*100):'',Math.max(0,i.q||0)*(i.costo||0)]:[]),Math.max(0,i.q||0)*(i.p||0),i.h?'Hoja '+i.h:'',i.nota||'']),
  D()?[9,10,11,13,14]:[9,10,11],D()?[9,14,40,22,26,10,8,14,10,13,12,13,9,14,16,12,36]:[9,14,40,22,26,10,8,14,10,13,12,16,12,36],D()?[5,13,14]:[5,11]);
 const lin=[];S.ventas.slice().sort((a,b)=>a.f-b.f).forEach(v=>v.lineas.forEach((l,k)=>lin.push([fechaL(v.f),v.num,v.anulada?'ANULADA':'',v.user,MET[v.pago.met],v.cliente?(S.clientes.find(c=>c.id===v.cliente)?.nombre||''):v.clienteN||'',l.cod||'',l.n,l.q,l.p,l.q*l.p,k===0?v.desc:0,k===0?(v.anulada?0:v.total):'',...(D()?[l.costo??'',l.costo!=null?(l.p-l.costo)*l.q:'']:[])])));
 hoja('Ventas',nom+' — Ventas (detalle por producto)',['Fecha','Factura','Estado','Vendió','Pago','Cliente','Código','Producto','Cant.','Precio','Subtotal línea','Descuento','Total factura',...(D()?['Costo unit.','Ganancia línea']:[])],lin,D()?[9,10,11,12,13,14]:[9,10,11,12],[18,11,9,11,13,22,8,36,6,11,12,11,12,11,12],[8,10,11,12]);
 hoja('Créditos',nom+' — Cartera de créditos',['Cliente','Cédula / NIT','Teléfono','Dirección','Compras a crédito','Abonado','Saldo pendiente'],S.clientes.map(c=>{const comp=vendidas().filter(v=>v.cliente===c.id&&v.pago.met==='credito').reduce((a,v)=>a+v.total,0),ab=S.abonos.filter(a=>a.cliente===c.id).reduce((a,x)=>a+x.valor,0);return[c.nombre,c.doc||'',c.tel||'',c.dir||'',comp,ab,comp-ab]}),[4,5,6],[28,16,14,26,16,14,16],[4,5,6]);
 hoja('Abonos',nom+' — Abonos recibidos',['Fecha','Cliente','Método','Valor','Saldo después','Recibió'],S.abonos.map(a=>[fechaL(a.f),a.clienteN,MET[a.met],a.valor,a.saldoDespues,a.user]),[3,4],[18,28,14,12,14,12],[3]);
 hoja('Entradas y salidas',nom+' — Entradas y salidas de mercancía',['Fecha','Tipo','Código','Producto','Cantidad','Detalle','Usuario',...(D()?['Costo unit.']:[])],S.movs.slice().sort((a,b)=>a.f-b.f).map(m=>[fechaL(m.f),(TIPO[m.tipo]||[m.tipo])[0],m.cod,m.n,m.tipo==='salida'?-Math.abs(m.q):m.q,m.nota,m.user,...(D()?[m.costo??'']:[])]),D()?[7]:[],[18,12,8,38,10,30,12,12]);
 hoja('Por comprar',nom+' — Lista de compras',['Código','Producto','Modelo','Existencia','Mínimo','Vendidos 30 días','Sugerido comprar',...(D()?['Costo unit.','Costo estimado']:[])],porComprar(uno).map(i=>[i.cod,i.n,i.m,i.q||0,i.min||0,v30[i.id]||0,sugerido(i,v30),...(D()?[i.costo??'',i.costo!=null?i.costo*sugerido(i,v30):'']:[])]),D()?[7,8]:[],[9,36,22,10,8,12,12,12,14],D()?[6,8]:[6]);
 X.writeFile(wb,`${nom.replace(/[^\p{L}\p{N} _-]/gu,'').trim()||'Tecnocenter'} - ${fecha.replace(/\//g,'-')}.xlsx`);toast('Excel descargado')};

if(TOK)iniciar();
}
