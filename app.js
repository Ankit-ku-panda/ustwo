const $=s=>document.querySelector(s),T=['Riddle','Zip path','Word cross'];
const LV=[
{n:'Level 1',
 r:{q:'I have keys but open no locks, and hammers but build nothing. What am I?',a:['piano'],h:'Black and white keys make music.'},
 z:{n:4,m:'RRRDLLLDRRRDLLL',k:[0,5,10,15]},
 c:[{a:'LOVE',r:0,c:0,d:0,h:'What you feel for your partner'},{a:'LIFE',r:0,c:0,d:1,h:'Something to share with someone'},{a:'EYES',r:0,c:3,d:1,h:'You see with them'},{a:'EARS',r:3,c:0,d:0,h:'You hear with them'}]},
{n:'Level 2',
 r:{q:'The more you take, the more you leave behind. What am I?',a:['footsteps','steps','footstep'],h:'Think about walking.'},
 z:{n:5,m:'RRRRDDDDLLLLUUURRRDDLLUR',k:[0,6,12,18,24]},
 c:[{a:'HEART',r:0,c:0,d:0,h:'Valentine symbol'},{a:'HUGS',r:0,c:0,d:1,h:'Warm squeezes'},{a:'TOYS',r:0,c:4,d:1,h:'Kids play with them'},{a:'SOULS',r:3,c:0,d:0,h:'Soulmates share these'}]},
{n:'Level 3',
 r:{q:'What can travel around the world while staying in one corner?',a:['stamp','postage stamp'],h:'You find it on an envelope.'},
 z:{n:5,m:'DDDDRUUUURDDDDRUUUURDDDD',k:[0,6,12,18,24]},
 c:[{a:'DREAM',r:0,c:0,d:0,h:'You see it while sleeping'},{a:'DANCE',r:0,c:0,d:1,h:'Move to the music'},{a:'MOONS',r:0,c:4,d:1,h:'Jupiter has dozens of these'},{a:'ELVES',r:4,c:0,d:0,h:"Santa's helpers"}]}
];
const TOT=LV.length*3,S={idx:0,me:{},peer:{},done:{},pd:{},name:'Me',pn:'Partner',on:0};
let peer,conn,ROOM;
const send=o=>conn&&conn.open&&conn.send(o),push=st=>send({t:'st',idx:S.idx,st});
const fresh=k=>k==0?{tries:0,hint:0,ok:0,len:0}:k==1?{p:[]}:{g:{},hint:0};
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),2800)};
const norm=s=>s.toLowerCase().replace(/^(a|an|the)\s+/,'').replace(/[^a-z]/g,'');
const cellsOf=z=>{let r=0,c=0;const o=[0];for(const m of z.m){m=='R'?c++:m=='L'?c--:m=='D'?r++:r--;o.push(r*z.n+c)}return o};

function render(){
  if(S.idx>=TOT){$('#game').hidden=true;$('#end').hidden=false;return}
  const l=LV[S.idx/3|0],k=S.idx%3,st=S.me[S.idx]||(S.me[S.idx]=fresh(k));
  $('#lt').textContent=l.n+': '+T[k];$('#pb').style.width=S.idx/TOT*100+'%';
  $('#n1').textContent=S.name+' (you)';$('#n2').textContent=S.pn;
  draw($('#b1'),l,k,st,0);renderPeer();status();
}
const draw=(el,l,k,st,ro)=>[riddle,zip,cross][k](el,l,st,ro);
const renderPeer=()=>{if(S.idx<TOT){const k=S.idx%3;draw($('#b2'),LV[S.idx/3|0],k,S.peer[S.idx]||fresh(k),1)}};
const status=()=>{$('#s1').textContent=S.done[S.idx]?'done ✓':'solving';$('#s2').textContent=S.pd[S.idx]?'done ✓':'solving'};
function fin(){
  if(S.done[S.idx])return;S.done[S.idx]=1;send({t:'done',idx:S.idx});status();
  S.pd[S.idx]?adv():toast('Solved! Waiting for '+S.pn+'…');
}
function adv(){if(S.done[S.idx]&&S.pd[S.idx]){S.idx++;toast('Both done. Next step!');render()}}

function riddle(el,l,st,ro){
  const q=l.r;
  if(ro){el.innerHTML=`<p class="q dim">${st.ok?'Riddle solved ✓':'Thinking about the riddle…'}</p><p class="msg">Tries: ${st.tries} · Hint ${st.hint?'used':'not used'}</p><div class="dots">${'●'.repeat(st.len||0)}</div>`;return}
  el.innerHTML=`<p class="q">${q.q}</p><input id="ri" placeholder="Your answer" autocomplete="off" ${S.done[S.idx]?'disabled':''}><div class="row"><button id="rs">Submit</button><button id="rh" class="ghost">Hint</button></div><p id="rm" class="msg">${st.hint?q.h:''}</p>`;
  const ri=$('#ri');
  ri.oninput=()=>{st.len=ri.value.length;push(st)};
  const go=()=>{
    if(S.done[S.idx])return;
    if(q.a.map(norm).includes(norm(ri.value))){st.ok=1;$('#rm').textContent='Correct!';push(st);fin()}
    else{st.tries++;ri.classList.add('shake');setTimeout(()=>ri.classList.remove('shake'),400);$('#rm').textContent='Not quite. Try again.';push(st)}
  };
  $('#rs').onclick=go;ri.onkeydown=e=>e.key=='Enter'&&go();
  $('#rh').onclick=()=>{st.hint=1;$('#rm').textContent=q.h;push(st)};
}

function zip(el,l,st,ro){
  const z=l.z,N=z.n,cs=cellsOf(z),num={};z.k.forEach((i,j)=>num[cs[i]]=j+1);
  el.innerHTML=`<div class="zip" style="--n:${N}">${[...Array(N*N)].map((_,i)=>`<div class="zc" data-i="${i}">${num[i]?'<b>'+num[i]+'</b>':''}</div>`).join('')}</div>${ro?'':'<button class="ghost sm" id="zr">Reset line</button>'}<p class="msg">Draw one line through every square, passing 1 to ${z.k.length} in order. Drag to draw, drag back to undo.</p>`;
  const g=el.firstChild,c=[...g.children],P=st.p;
  const paint=()=>c.forEach((x,i)=>{const j=P.indexOf(i);x.classList.toggle('on',j>=0);x.classList.toggle('head',j>=0&&j==P.length-1)});
  paint();if(ro)return;
  const adj=(a,b)=>Math.abs((a/N|0)-(b/N|0))+Math.abs(a%N-b%N)==1,seen=()=>P.filter(i=>num[i]).length;
  const go=i=>{
    if(S.done[S.idx])return;
    const j=P.indexOf(i),n=P.length;
    if(j>=0)P.length=j+1;
    else if(!n){if(num[i]==1)P.push(i)}
    else if(adj(P[n-1],i)&&(!num[i]||num[i]==seen()+1))P.push(i);
    if(P.length==n)return;
    paint();push(st);
    if(P.length==N*N&&num[P[P.length-1]]==z.k.length)fin();
  };
  let d=0;const at=e=>{const t=document.elementFromPoint(e.clientX,e.clientY),x=t&&t.closest('.zc');return x?+x.dataset.i:null};
  g.onpointerdown=e=>{d=1;const i=at(e);if(i!=null)go(i)};
  g.onpointermove=e=>{if(d){const i=at(e);if(i!=null)go(i)}};
  g.onpointerup=g.onpointercancel=()=>d=0;
  $('#zr').onclick=()=>{if(!S.done[S.idx]){P.length=0;paint();push(st)}};
}

function cross(el,l,st,ro){
  const W=l.c,m={},no={},nm=[];let cnt=0;
  const R=Math.max(...W.map(w=>w.r+(w.d?w.a.length:1))),C=Math.max(...W.map(w=>w.c+(w.d?1:w.a.length)));
  const pos=(wi,k)=>{const w=W[wi];return (w.r+(w.d?k:0))+','+(w.c+(w.d?0:k))};
  W.forEach((w,wi)=>{const s=w.r+','+w.c;if(!no[s])no[s]=++cnt;nm[wi]=no[s];[...w.a].forEach((ch,k)=>{(m[pos(wi,k)]=m[pos(wi,k)]||{a:ch,w:[]}).w.push(wi)})});
  let h='';
  for(let r=0;r<R;r++)for(let q=0;q<C;q++){const k=r+','+q;h+=m[k]?`<div class="xc">${no[k]?'<i>'+no[k]+'</i>':''}<input data-k="${k}" maxlength="1" autocomplete="off" autocapitalize="characters" value="${st.g[k]||''}" ${ro?'readonly tabindex="-1"':''}></div>`:'<div></div>'}
  el.innerHTML=`<div class="xw" style="--c:${C}">${h}</div><ol class="cl">${W.map((w,i)=>`<li data-w="${i}"><b>${nm[i]}${w.d?' down':' across'}</b>: ${w.h} (${w.a.length})</li>`).join('')}</ol>${ro?'':'<button class="ghost sm" id="xh">Reveal a letter</button>'}`;
  if(ro)return;
  let cw=0;const inp=k=>el.querySelector(`[data-k="${k}"]`),idxIn=(wi,k)=>[...W[wi].a].findIndex((_,q)=>pos(wi,q)==k);
  const chk=()=>{if(!S.done[S.idx]&&Object.keys(m).every(k=>(st.g[k]||'')==m[k].a))fin()};
  const mark=()=>el.querySelectorAll('.cl li').forEach(li=>li.classList.toggle('cur',+li.dataset.w==cw));
  el.querySelectorAll('input').forEach(i=>{
    const k=i.dataset.k;
    i.onfocus=()=>{if(!m[k].w.includes(cw))cw=m[k].w[0];mark();i.select()};
    i.oninput=()=>{
      const v=i.value.toUpperCase().replace(/[^A-Z]/g,'').slice(-1);i.value=v;st.g[k]=v;push(st);chk();
      const j=idxIn(cw,k);if(v&&j+1<W[cw].a.length)inp(pos(cw,j+1)).focus();
    };
    i.onkeydown=e=>{if(e.key=='Backspace'&&!i.value){const j=idxIn(cw,k);if(j>0)inp(pos(cw,j-1)).focus()}};
  });
  el.querySelectorAll('.cl li').forEach(li=>li.onclick=()=>{
    cw=+li.dataset.w;mark();
    const ks=[...W[cw].a].map((_,q)=>pos(cw,q));inp(ks.find(k=>!st.g[k])||ks[0]).focus();
  });
  $('#xh').onclick=()=>{
    const k=Object.keys(m).find(k=>st.g[k]!=m[k].a);
    if(!k||S.done[S.idx])return;
    st.g[k]=m[k].a;inp(k).value=m[k].a;st.hint++;push(st);chk();
  };
}

/* ---------- connection (PeerJS, no server needed) ---------- */
const CH='ABCDEFGHJKMNPQRSTUVWXYZ23456789',mkcode=()=>[...Array(5)].map(()=>CH[Math.random()*CH.length|0]).join('');
const ls=t=>$('#ls').textContent=t;
try{$('#nm').value=localStorage.nm||''}catch(e){}
const rq=new URLSearchParams(location.search).get('room');if(rq)$('#cd').value=rq.toUpperCase();
const getName=()=>{S.name=$('#nm').value.trim()||'Me';try{localStorage.nm=S.name}catch(e){}};

function begin(){S.on=1;$('#lobby').hidden=true;$('#game').hidden=false;$('#rc').textContent='Room '+ROOM;render()}
function onMsg(m){
  if(m.t=='hello'){S.pn=m.n;if(!S.on)begin();else{$('#n2').textContent=S.pn;send({t:'sync',idx:S.idx});push(S.me[S.idx]||fresh(S.idx%3));if(S.done[S.idx])send({t:'done',idx:S.idx})}}
  else if(m.t=='sync'){if(m.idx>S.idx){S.idx=m.idx;render()}}
  else if(m.t=='st'){S.peer[m.idx]=m.st;if(m.idx==S.idx)renderPeer()}
  else if(m.t=='done'){S.pd[m.idx]=1;if(m.idx==S.idx){status();adv()}}
}
function wire(c){
  conn=c;const hi=()=>send({t:'hello',n:S.name});
  c.open?hi():c.on('open',hi);
  c.on('data',onMsg);
  c.on('close',()=>{toast(S.pn+' disconnected. Ask them to rejoin with the same code.');if(!S.on)ls('Connection closed.')});
}
function host(code,tries=0){
  getName();ls('Creating room…');if(peer)peer.destroy();
  peer=new Peer('uz-'+code);
  peer.on('open',()=>{
    ROOM=code;ls('Room code: '+code+'. Waiting for your partner…');
    const link=location.origin+location.pathname+'?room='+code,b=$('#sh');b.hidden=false;
    b.onclick=()=>navigator.share?navigator.share({title:'Play UsTwo with me',url:link}).catch(()=>{}):navigator.clipboard.writeText(link).then(()=>ls('Invite link copied. Send it to your partner.'));
  });
  peer.on('connection',c=>{if(conn&&conn.open){c.close();return}wire(c)});
  peer.on('error',e=>{if(e.type=='unavailable-id'&&tries<5)host(mkcode(),tries+1);else ls('Could not connect ('+e.type+'). Check your internet and try again.')});
}
function join(){
  getName();const code=$('#cd').value.trim().toUpperCase();
  if(code.length<5)return ls('Enter the 5-character room code.');
  ls('Connecting…');if(peer)peer.destroy();
  peer=new Peer();
  peer.on('open',()=>{ROOM=code;wire(peer.connect('uz-'+code,{reliable:true}))});
  peer.on('error',e=>ls(e.type=='peer-unavailable'?'Room not found. Check the code with your partner.':'Could not connect ('+e.type+').'));
}
$('#mk').onclick=()=>host(mkcode());$('#jn').onclick=join;
let ip;addEventListener('beforeinstallprompt',e=>{e.preventDefault();ip=e;$('#in').hidden=false});
$('#in').onclick=()=>ip&&ip.prompt();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js');
