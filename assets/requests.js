// Request Board: live from the stats server; app icons from Apple's public lookup.
(()=>{const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=new Intl.DateTimeFormat('en-MY',{day:'numeric',month:'short',year:'numeric'});
const when=v=>{const d=new Date(String(v||'').replace(' ','T')+(/[zZ+]/.test(v||'')?'':'Z'));return isNaN(d)?'':fmt.format(d)};
const STATUS={Requested:['In queue','s-queue'],Completed:['Completed','s-done'],Unable:['Unable','s-unable']};
let all=[],tweaks={},filter='All',icons={};
try{icons=JSON.parse(localStorage.getItem('kz3-req-icons')||'{}')}catch{}
const appStore=u=>{const m=String(u||'').match(/apps\.apple\.com\/(?:([a-z]{2})\/)?.*?id(\d+)/i);return m?{country:m[1]||'us',id:m[2]}:null};
const initials=n=>esc(String(n||'?').replace(/[^\p{L}\p{N} ]/gu,'').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase()||'?');
const host=u=>{try{return new URL(u).hostname.replace(/^www\./,'')}catch{return ''}};
const card=r=>{const [label,cls]=STATUS[r.status]||STATUS.Requested,a=appStore(r.appUrl),icon=a&&icons[a.id],t=r.tweakId&&tweaks[r.tweakId];
return `<article class="req-card ${cls}"><div class="req-head">${icon?`<img class="req-icon" src="${esc(icon)}" alt="" loading="lazy">`:`<div class="req-icon req-initials">${initials(r.appName)}</div>`}
<div class="req-title"><h3>${esc(r.appName)}</h3>${r.appUrl&&/^https?:/i.test(r.appUrl)?`<a class="req-link" href="${esc(r.appUrl)}" target="_blank" rel="noopener">${esc(host(r.appUrl))} ↗</a>`:''}</div>
</div>
<div class="req-meta"><span class="req-pill ${cls}">${r.status==='Requested'?'<i></i>':r.status==='Completed'?'✓ ':''}${label}</span><div class="req-dates"><span>Requested ${esc(when(r.createdAt))}</span>${r.status!=='Requested'&&r.updatedAt?`<span>${r.status==='Completed'?'Done':'Updated'} ${esc(when(r.updatedAt))}</span>`:''}</div></div>
${r.status==='Completed'&&t?`<a class="req-get" href="package.html?id=${encodeURIComponent(r.tweakId)}"><img src="${esc(t.iconImage||'assets/kz3-mark.png')}" alt=""><span><small>Get the tweak</small><b>${esc(t.name)}</b></span><em>→</em></a>`:''}</article>`};
const render=()=>{const list=all.filter(r=>filter==='All'||r.status===filter);$('requests').innerHTML=list.length?list.map(card).join(''):`<p class="updates-empty">${filter==='Requested'?'The queue is empty — everything is done 🎉':'Nothing here yet.'}</p>`};
const setFilter=f=>{filter=f;document.querySelectorAll('#req-filter button').forEach(b=>b.classList.toggle('active',b.dataset.f===f));render()};
$('req-filter').onclick=e=>{const b=e.target.closest('button');if(b)setFilter(b.dataset.f)};
document.querySelectorAll('.req-stat').forEach(b=>b.onclick=()=>setFilter(b.dataset.f));
const loadIcons=()=>{const need={};for(const r of all){const a=appStore(r.appUrl);if(a&&!icons[a.id])(need[a.country]=need[a.country]||[]).push(a.id)}
Object.entries(need).forEach(([country,ids],n)=>{const cb=`kz3Icons${n}_${Date.now()}`;window[cb]=data=>{for(const x of data.results||[])icons[x.trackId]=x.artworkUrl100||x.artworkUrl60;try{localStorage.setItem('kz3-req-icons',JSON.stringify(icons))}catch{}render();delete window[cb]};
const s=document.createElement('script');s.src=`https://itunes.apple.com/lookup?id=${ids.slice(0,150).join(',')}&country=${country}&entity=software&callback=${cb}`;s.onerror=()=>delete window[cb];document.head.appendChild(s)})};
fetch('repo-config.json').then(r=>r.json()).then(cfg=>{const api=(cfg.site.analyticsAPIURL||'').replace(/\/$/,'');
return Promise.all([fetch(`${api}/requests`).then(r=>r.json()),fetch('packages.json').then(r=>r.json()).catch(()=>[])])}).then(([data,pk])=>{
pk.forEach(p=>tweaks[p.id]=p);all=data.requests||[];const n=s=>all.filter(r=>r.status===s).length;
$('n-queue').textContent=n('Requested');$('n-done').textContent=n('Completed');$('n-unable').textContent=n('Unable');render();loadIcons()})
.catch(()=>{$('requests').innerHTML='<p class="updates-empty">Couldn’t load the board. Try again in a moment.</p>'})})();
