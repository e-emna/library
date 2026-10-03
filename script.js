const TYPES=['Song','Album','Artist','Book','Movie','Show','Game','Genre','Hobby','Link / Photo'];
const MANUAL=['Game','Genre','Hobby','Link / Photo'];
const PH={Game:'e.g. Hades',Genre:'e.g. pop',Hobby:'e.g. pottery','Link / Photo':'Title'};
const TH={blue:['#e4eafe','#d5dffa','#d3dcfb','#b6c4f5','#1a1f3d','#5b6384','#8a9be8'],
 pink:['#fde7f0','#f9d3e3','#f7cfe0','#f2b3cf','#451f33','#7a5568','#e58cb3'],
 green:['#e3f2e4','#cfe6d2','#cde4d0','#b0d4b6','#1d3a25','#52695a','#8bb88f'],
 peach:['#ffeadb','#ffd9bd','#fdd5b8','#fbc29a','#4a2410','#8a5a42','#f4a77a'],
 purple:['#efe7fd','#e0d2f9','#ddd0f8','#c8b3f2','#2f1d52','#6a5d86','#a98be8']};
const $=id=>document.getElementById(id);
let S={items:[],cols:[],theme:'pink',name:''},cur='all',type='Song',sel=null,timer,photoData='',openId=null,view=null;
try{const d=JSON.parse(localStorage.getItem('myshelf2')||'null');if(d)S=Object.assign(S,d)}catch(e){}
function dlg({title,input,ok='OK',cancel=true}){return new Promise(res=>{
 const d=$('dlg'),i=$('di');$('dt').textContent=title;i.style.display=input?'block':'none';i.value='';i.placeholder=input||'';
 $('dyes').textContent=ok;$('dno').style.display=cancel?'':'none';d.classList.add('show');(input?i:$('dyes')).focus();
 const end=v=>{d.classList.remove('show');d.onkeydown=null;$('dyes').onclick=$('dno').onclick=null;d.onclick=null;res(v)};
 $('dyes').onclick=()=>end(input?i.value:true);$('dno').onclick=()=>end(null);
 d.onclick=e=>{if(e.target===d)end(null)};
 d.onkeydown=e=>{if(e.key==='Escape'){e.stopPropagation();end(null)}if(e.key==='Enter'&&input){e.preventDefault();end(i.value)}};
})}
const save=()=>{try{localStorage.setItem('myshelf2',JSON.stringify(S))}catch(e){dlg({title:'Storage is full. Export a backup and remove some photos.',cancel:false})}};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const star=(()=>{const p=[];for(let i=0;i<24;i++){const a=i*Math.PI/12,r=i%2?40:50;p.push((50+r*Math.sin(a)).toFixed(1)+'% '+(50-r*Math.cos(a)).toFixed(1)+'%')}return`polygon(${p.join(',')})`})();
document.documentElement.style.setProperty('--star',star);

function theme(){const t=TH[S.theme]||TH.pink,r=document.documentElement.style;
 ['--bg','--tile','--chip','--hl','--ink','--mute','--shape'].forEach((v,i)=>r.setProperty(v,t[i]));
 chrome()}
function closePops(){document.querySelectorAll('.pop').forEach(p=>p.hidden=true);document.querySelectorAll('.tbtn').forEach(b=>b.setAttribute('aria-expanded','false'))}
function chrome(){
 $('dots').innerHTML=`<div class="themewrap"><button class="tbtn" id="tb" aria-haspopup="true" aria-expanded="false"><i></i>Theme</button><div class="pop" id="pop" hidden>`+
  Object.keys(TH).map(k=>`<button class="dot ${k===S.theme?'on':''}" data-t="${k}" style="background:${TH[k][6]}" aria-label="${k} theme"></button>`).join('')+`</div></div><button class="add" id="addBtn">+ Add</button>`;
 [['tb','pop']].forEach(([b,p])=>{$(b).onclick=e=>{e.stopPropagation();const open=$(p).hidden;closePops();$(p).hidden=!open;$(b).setAttribute('aria-expanded',open)};$(p).onclick=e=>e.stopPropagation()});
 $('dots').querySelectorAll('.dot').forEach(d=>d.onclick=()=>{S.theme=d.dataset.t;save();theme()});
 $('addBtn').onclick=openAdd}
document.addEventListener('click',closePops);

function art(i){const t=i.type,im=esc(i.img);
 if(t==='Album'&&i.img)return`<div class="vinyl"><img src="${im}" alt=""></div>`;
 if(t==='Artist'&&i.img)return`<div class="pol"><img src="${im}" alt=""></div>`;
 if(t==='Game'&&i.img)return`<img class="art app" src="${im}" alt="">`;
 if(t==='Song'&&i.img)return`<img class="art sq" src="${im}" alt="">`;
 if(i.img)return`<img class="art" src="${im}" alt="">`;
 return`<div class="star">${esc(i.title)}</div>`}

function render(){
 const n=c=>S.items.filter(i=>c==='all'||i.col===c).length;
 $('tabs').innerHTML=`<button class="tab ${cur==='all'?'on':''}" data-c="all">All<span>${n('all')}</span></button>`+
  S.cols.map(c=>`<button class="tab ${cur===c?'on':''}" data-c="${esc(c)}">${esc(c)}<span>${n(c)}</span></button>`).join('')+`<button class="tab" id="newc">+ New collection</button>`+(cur!=='all'?`<button class="tab" id="delc">Remove collection</button>`:'');
 $('tabs').querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{cur=b.dataset.c;render()});
 $('newc').onclick=async()=>{const v=((await dlg({title:'Name your collection',input:'e.g. Comfort watches',ok:'Create'}))||'').trim();if(v&&!S.cols.includes(v)){S.cols.push(v);cur=v;view=null;save();render()}};
if($('delc'))$('delc').onclick=async()=>{if(await dlg({title:`Remove "${cur}"? Its items stay on your shelf under All.`,ok:'Remove'})){S.items.forEach(i=>{if(i.col===cur)i.col=''});S.cols=S.cols.filter(c=>c!==cur);cur='all';view=null;save();render()}};
 const base=S.items.filter(i=>cur==='all'||i.col===cur);
 if(view&&!base.some(i=>i.type===view))view=null;
 if(!base.length){$('shelf').innerHTML='<div class="empty" id="emp">Your shelf is empty — tap to add your first favourite</div>';$('emp').onclick=openAdd;return}
 if(!view){
  const groups=TYPES.map(t=>({t,items:base.filter(i=>i.type===t)})).filter(g=>g.items.length);
  $('shelf').innerHTML=`<div class="grid">${groups.map(g=>{const last=g.items.reduce((m,i)=>i.added>m.added?i:m);
   return`<button class="tile" data-v="${esc(g.t)}" aria-label="${esc(g.t)}, ${g.items.length} saved"><div class="stage">${art(last)}</div><div class="foot"><small>${esc(g.t)}</small><span class="cnt">▶ ${g.items.length}</span></div></button>`}).join('')}</div>`;
  $('shelf').querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{view=b.dataset.v;render();window.scrollTo(0,0)});
 }else{
  const list=base.filter(i=>i.type===view).sort((a,b)=>b.added-a.added);
  $('shelf').innerHTML=`<div class="crumb"><button class="tab" id="back">‹ Home</button><h2>${esc(view)}</h2></div><div class="grid">${list.map(i=>`<button class="tile" data-o="${i.id}" aria-label="${esc(i.title)}"><div class="stage">${art(i)}</div><div class="foot"><small class="one">${esc(i.title)}</small>${i.date?`<span class="cnt">${esc(i.date)}</span>`:''}</div></button>`).join('')}</div>`;
  $('back').onclick=()=>{view=null;render()};
  $('shelf').querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>openDet(+b.dataset.o));
 }}

function openDet(id){const i=S.items.find(x=>x.id===id);if(!i)return;openId=id;
 $('det').innerHTML=`<div class="stagebig">${art(i)}</div><div class="kind">${esc(i.type)}</div><div class="ttl">${esc(i.title)}</div>
 ${i.sub?`<div class="by">${esc(i.sub)}</div>`:''}${i.link?`<a class="ol" href="${esc(i.link)}" target="_blank" rel="noopener">Open link</a>`:''}
 <label for="d2">Date (optional)</label><input type="date" id="d2" value="${esc(i.date)}">
 <label for="n2">Notes (optional)</label><textarea id="n2" placeholder="Why it's on your shelf…">${esc(i.notes)}</textarea>
 <div class="row"><button class="sec" id="rm">Remove</button><button class="put" id="sv">Save</button></div>`;
 $('rm').onclick=async()=>{if(await dlg({title:'Remove this from your shelf?',ok:'Remove'})){S.items=S.items.filter(x=>x.id!==id);save();$('ov2').classList.remove('show');render()}};
 $('sv').onclick=()=>{i.date=$('d2').value;i.notes=$('n2').value.trim();save();$('ov2').classList.remove('show');render()};
 $('ov2').classList.add('show')}
$('ov2').onclick=e=>{if(e.target===$('ov2'))$('ov2').classList.remove('show')};

function openAdd(){
 $('col').innerHTML='<option value="">No collection</option>'+S.cols.map(c=>`<option ${c===cur?'selected':''}>${esc(c)}</option>`).join('');
 $('q').value='';$('date').value='';$('notes').value='';$('url').value='';$('photo').value='';photoData='';
 if(view)type=view;setType(type);$('ov').classList.add('show');$('q').focus()}
const close=()=>$('ov').classList.remove('show');
$('cancel').onclick=close;$('ov').onclick=e=>{if(e.target===$('ov'))close()};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const m=$('ov').classList.contains('show')||$('ov2').classList.contains('show');close();$('ov2').classList.remove('show');if(!m&&view){view=null;render()}}});

$('types').innerHTML=TYPES.map(t=>`<button class="chip" data-t="${t}">${t}</button>`).join('');
$('types').querySelectorAll('.chip').forEach(b=>b.onclick=()=>{$('q').value='';setType(b.dataset.t);$('q').focus()});
function setType(t){type=t;sel=null;$('res').innerHTML='';const m=MANUAL.includes(t);
 $('types').querySelectorAll('.chip').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
 $('url').style.display=t==='Link / Photo'?'block':'none';$('photoBox').style.display=m?'block':'none';
 $('q').placeholder=m?PH[t]:`Search a ${t.toLowerCase()}…`;check()}
function check(){$('put').disabled=MANUAL.includes(type)?!$('q').value.trim():!sel}

$('photo').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();
 r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,500/Math.max(im.width,im.height)),c=document.createElement('canvas');
  c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);photoData=c.toDataURL('image/jpeg',.8)};im.src=r.result};r.readAsDataURL(f)};

$('q').oninput=()=>{check();if(MANUAL.includes(type))return;sel=null;check();clearTimeout(timer);
 const v=$('q').value.trim();if(v.length<2){$('res').innerHTML='';return}
 $('res').innerHTML='<div class="msg">Searching…</div>';timer=setTimeout(()=>search(v,type),350)};

async function search(q,t){
 try{let out=[];const E=encodeURIComponent(q);
  if(t==='Book'){const d=await (await fetch(`https://openlibrary.org/search.json?q=${E}&limit=8&fields=key,title,author_name,first_publish_year,cover_i`)).json();
   out=d.docs.map(b=>({title:b.title,sub:(b.author_name||[]).slice(0,2).join(', ')+(b.first_publish_year?' · '+b.first_publish_year:''),img:b.cover_i?`https://covers.openlibrary.org/b/id/${b.cover_i}-L.jpg`:''}))}
  else if(t==='Artist'){const d=await (await fetch(`https://itunes.apple.com/search?term=${E}&limit=25&media=music&entity=album&attribute=artistTerm`)).json();
   const seen={};d.results.forEach(r=>{if(!seen[r.artistName])seen[r.artistName]={title:r.artistName,sub:r.primaryGenreName||'',img:(r.artworkUrl100||'').replace('100x100','400x400')}});out=Object.values(seen).slice(0,8)}
  else{const P={Song:'media=music&entity=song',Album:'media=music&entity=album',Movie:'media=movie&entity=movie',Show:'media=tvShow&entity=tvSeason'}[t];
   const d=await (await fetch(`https://itunes.apple.com/search?term=${E}&limit=8&${P}`)).json();
   out=d.results.map(r=>{const y=(r.releaseDate||'').slice(0,4),img=(r.artworkUrl100||'').replace('100x100','400x400');
    if(t==='Song')return{title:r.trackName,sub:r.artistName,img};
    if(t==='Album')return{title:r.collectionName,sub:r.artistName+(y?' · '+y:''),img};
    if(t==='Movie')return{title:r.trackName,sub:[r.artistName,y].filter(Boolean).join(' · '),img};
    return{title:r.collectionName,sub:y,img}})}
  if($('q').value.trim()!==q||type!==t)return;
  window._r=out;
  $('res').innerHTML=out.length?out.map((r,i)=>`<button class="r" data-i="${i}">${r.img?`<img src="${esc(r.img.replace('400x400','100x100'))}" alt="">`:'<div class="ph"></div>'}<span><b>${esc(r.title)}</b><small>${esc(r.sub)}</small></span></button>`).join(''):'<div class="msg">No results. Try different words.</div>';
  $('res').querySelectorAll('.r').forEach(b=>b.onclick=()=>{sel=window._r[b.dataset.i];$('res').querySelectorAll('.r').forEach(x=>x.classList.toggle('on',x===b));check()});
 }catch(e){$('res').innerHTML='<div class="msg">Search failed. Check your connection and try again.</div>'}}

$('put').onclick=()=>{
 let b=sel;
 if(MANUAL.includes(type)){const u=$('url').value.trim();b={title:$('q').value.trim(),sub:'',img:photoData,link:u}}
 S.items.push({id:Date.now(),type,title:b.title,sub:b.sub||'',img:b.img||'',link:b.link||'',date:$('date').value,notes:$('notes').value.trim(),col:$('col').value,added:Date.now()});
 if(view)view=type;save();close();render()};

$('exp').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:'application/json'}));a.download='my-shelf-backup.json';a.click()};
$('imp').onclick=()=>$('file').click();
$('file').onchange=async e=>{try{const d=JSON.parse(await e.target.files[0].text());if(!Array.isArray(d.items))throw 0;
 if(await dlg({title:'Replace your current shelf with this backup?',ok:'Replace'})){S=Object.assign({items:[],cols:[],theme:'pink'},d);save();theme();render()}}catch(x){dlg({title:'That file is not a valid shelf backup.',cancel:false})}e.target.value=''};

function head(){const n=S.name,t=n?(/s$/i.test(n)?n+'’':n+'’s')+' Soft Spot':'Soft Spot';$('ttl').textContent=t;document.title=t}
function ask(){$('nm').value=S.name;$('wel').classList.add('show');$('nm').focus()}
function go(){const v=$('nm').value.trim();if(!v)return;S.name=v;save();head();$('wel').classList.remove('show')}
$('go').onclick=go;$('nm').onkeydown=e=>{if(e.key==='Enter')go()};$('chn').onclick=ask;
theme();render();head();if(!S.name)ask();