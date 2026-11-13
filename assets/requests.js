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
fetch('repo-config.json').then(r=>r.json()).then(cfg=>{const api=(cfg.site.analyticsAPIURL||'').replace(/\/$/,'');setupForm(cfg.site,api,()=>fetch(`${api}/requests?t=${Date.now()}`).then(r=>r.json()).then(d=>{all=d.requests||[];const n=s=>all.filter(r=>r.status===s).length;$('n-queue').textContent=n('Requested');$('n-done').textContent=n('Completed');$('n-unable').textContent=n('Unable');render();loadIcons()}).catch(()=>{}));
return Promise.all([fetch(`${api}/requests`).then(r=>r.json()),fetch('packages.json').then(r=>r.json()).catch(()=>[])])}).then(([data,pk])=>{
pk.forEach(p=>tweaks[p.id]=p);all=data.requests||[];const n=s=>all.filter(r=>r.status===s).length;
$('n-queue').textContent=n('Requested');$('n-done').textContent=n('Completed');$('n-unable').textContent=n('Unable');render();loadIcons()})
.catch(()=>{$('requests').innerHTML='<p class="updates-empty">Couldn’t load the board. Try again in a moment.</p>'})})();

// "Request an app": same form as the homepage, opened right here as a dropdown.
function setupForm(s,analytics,reload){const $=id=>document.getElementById(id),btn=$('open-request'),panel=$('request-panel'),form=$('request-form');if(!btn||!form)return;
btn.onclick=()=>{const open=panel.hidden;panel.hidden=!open;btn.setAttribute('aria-expanded',String(open));btn.classList.toggle('is-open',open);if(open)setTimeout(()=>panel.scrollIntoView({behavior:'smooth',block:'start'}),60)};
const submit=$('request-submit'),status=$('request-status'),endpoint=(s.requestFormURL||'').trim(),inbox=(s.requestInboxEmail||'').trim(),otherRequest=form.elements.request_type_other,otherJailbreak=form.elements.jailbreak_other,publicListing=form.elements.public_listing,appURL=form.elements.app_url;
const syncFields=()=>{otherRequest.required=form.elements.request_type.value==='Other';otherJailbreak.required=form.elements.jailbreak.value==='Other';appURL.required=publicListing.checked;[otherRequest,otherJailbreak,appURL].forEach(x=>x.classList.toggle('required-other',x.required))};
form.addEventListener('change',syncFields);syncFields();if(!endpoint&&!inbox){submit.disabled=true;status.textContent='Private request inbox is being configured. Please check back soon.'}
form.onsubmit=async event=>{event.preventDefault();syncFields();if(!form.reportValidity())return;const data=new FormData(form);if(data.get('website')){status.textContent='Request received.';form.reset();return}
submit.disabled=true;submit.textContent='Sending…';status.textContent='';const kind=data.get('request_type')==='Other'?data.get('request_type_other'):data.get('request_type');data.append('_subject',`New ${kind} request: ${data.get('app_name')}`);
try{if(endpoint){const r=await fetch(endpoint,{method:'POST',body:data,headers:{Accept:'application/json'}});if(!r.ok)throw Error('Request service unavailable')}else{const lines=[...data.entries()].filter(([k])=>!['website','consent','_subject'].includes(k)).map(([k,v])=>`${k.replaceAll('_',' ')}: ${v}`);location.href=`mailto:${encodeURIComponent(inbox)}?subject=${encodeURIComponent(data.get('_subject'))}&body=${encodeURIComponent(lines.join('\n'))}`}
 const listed=publicListing.checked;if(listed&&analytics){const r=await fetch(`${analytics}/requests`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({appName:data.get('app_name'),appUrl:data.get('app_url')})});if(!r.ok){const x=await r.json().catch(()=>({}));throw Error(x.error||'Public board unavailable')}}
 status.textContent=listed?'✓ Request sent — it’s now on the board above.':'✓ Request sent privately to Kelvin.';form.reset();syncFields();if(listed)reload()}
catch(error){status.textContent=error.message==='Duplicate request'?'Your private request was sent, but that app is already on the board.':`Could not finish sending: ${error.message||'please try again.'}`}
finally{submit.disabled=!endpoint&&!inbox;submit.textContent='Send request'}}}
