const $ = (id) => document.getElementById(id);
const managerInfo = {
  sileo: { name:'Sileo', icon:'assets/sileo.png', protocol:url=>`sileo://source/${url}` },
  zebra: { name:'Zebra', icon:'assets/zebra.png', protocol:url=>`zbra://sources/add/${url}` },
  cydia: { name:'Cydia', icon:'assets/cydia.png', protocol:url=>`cydia://url/https://cydia.saurik.com/api/share#?source=${url}` }
};
const fresh = path => fetch(`${path}?v=${Date.now()}`, {cache:'no-store'}).then(r=>r.json());
Promise.all([fresh('repo-config.json'), fresh('packages.json')]).then(([config, packages])=>{
  const s=config.site,r=config.repository; document.documentElement.style.setProperty('--lime',s.accent);document.documentElement.style.setProperty('--violet',s.accentSecondary);
  document.querySelector('.github').href='https://github.com/ImKelvinDass/ImKelvinDass.github.io';
  $('country').textContent=s.showFlag?`${s.flag} ${s.country}`:'';$('eyebrow').textContent=`✦ ${s.eyebrow}`;$('headline-top').textContent=s.headlineTop;$('headline-accent').textContent=s.headlineAccent;$('intro').textContent=s.intro;
  $('trust').innerHTML=s.trustBadges.map(x=>`<span>${x}</span>`).join('');$('add-title').textContent=s.addTitle;$('add-subtitle').textContent=s.addSubtitle;$('packages-title').textContent=s.packagesTitle;$('packages-subtitle').textContent=s.packagesSubtitle;$('footer-copy').textContent=s.footer;$('repo-url').textContent=r.publicURL;
  $('managers').innerHTML=Object.entries(config.managers).filter(([,enabled])=>enabled).map(([key])=>{const m=managerInfo[key];return `<article><img src="${m.icon}" alt="${m.name} icon"><div><h3>${m.name}</h3><p>Add KiLlErZoN3 to ${m.name}</p></div><a href="${m.protocol(r.publicURL)}">Add</a></article>`}).join('');
  $('packages').innerHTML=packages.map(p=>`<a class="package-card" href="package.html?id=${encodeURIComponent(p.id)}"><img class="tweak-icon" src="assets/kz3-mark.png" alt="KiLlErZoN3 logo"><span>${p.compatibility||p.architecture}</span><h3>${p.name}</h3><p>${p.tagline||p.summary}</p><div><b>${p.version}</b><strong>View details →</strong></div></a>`).join('');
  const sections={hero:$('top'),add:document.querySelector('.section.add'),tweaks:document.querySelector('.section.tweaks'),footer:document.querySelector('footer')};
  (s.sectionOrder||[]).forEach(id=>{const el=sections[id];if(el)document.querySelector('main').appendChild(el)});
  $('copy-url').onclick=async()=>{await navigator.clipboard.writeText(r.publicURL);$('copy-url').textContent='Copied!';setTimeout(()=>$('copy-url').textContent='Copy',1400)};
}).catch(()=>document.body.classList.add('load-error'));
