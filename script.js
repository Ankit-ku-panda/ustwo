// ---------- state ----------
let S={name:"",done:{},custom:[]};
try{Object.assign(S,JSON.parse(localStorage.getItem("ustwo")||"{}"))}catch(e){}
const save=()=>{try{localStorage.setItem("ustwo",JSON.stringify(S))}catch(e){}};
const $=s=>document.querySelector(s), app=$("#app");

// ---------- levels (edit these to add more) ----------
const RIDDLES=[
["I have keys but open no doors. What am I?","keyboard","You are probably touching one."],
["The more you take, the more you leave behind. What am I?","footsteps","Think about walking."],
["What has hands but cannot clap?","clock","It tells time."],
["What gets wetter the more it dries?","towel","Found in a bathroom."],
["I speak without a mouth and hear without ears. What am I?","echo","Shout in a canyon."],
["What has a heart that does not beat?","artichoke","A vegetable."],
["What can travel the world while staying in a corner?","stamp","Goes on envelopes."],
["What runs but never walks?","river","It has a mouth and a bed."]];
const WORDS=["react","pixel","shader","canvas","vector","texture","camera","render","gradient","polygon"];
const MEM=[["🍎","🍌","🍇","🍓"],["🚀","🌙","⭐","🪐","☄️","🌍"],["🐱","🐶","🦊","🐼","🐸","🦁","🐙","🦄"],["🍕","🍔","🍟","🌮","🍩","🍦","🍣","🥐"]];
const ZIP=[3,4,5,6,7];
const CATS=[
{id:"riddle",ic:"🧩",t:"Riddles",d:"Brain teasers with hints",n:RIDDLES.length},
{id:"scr",ic:"🔤",t:"Word Scramble",d:"Unscramble tech words",n:WORDS.length},
{id:"mem",ic:"🃏",t:"Memory Match",d:"Flip cards in 3D",n:MEM.length},
{id:"zip",ic:"🧵",t:"Zip Path",d:"Draw one line through every cell",n:ZIP.length},
{id:"mine",ic:"✍️",t:"Create a game",d:"Write your own riddles",n:0}];

// ---------- helpers ----------
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const split=t=>[...t].map((c,i)=>`<span class="ch" style="--i:${i}">${c===" "?"&nbsp;":esc(c)}</span>`).join("");
const stars=()=>Object.keys(S.done).length;
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const isDone=(c,i)=>!!S.done[c+":"+i];
const unlocked=(c,i)=>i===0||isDone(c,i-1);
function top(back){return `<div class="bar"><div>${back?`<button class="btn g" data-go="${back}">← Back</button>`:""}</div><div><span class="pill">👤 ${esc(S.name)}</span> <span class="pill">⭐ ${stars()}</span></div></div>`}

// ---------- screens ----------
function home(){
 if(!S.name){
  app.innerHTML=`<h1>${split("UsTwo")} <span class="grad">${split("Arcade")}</span></h1>
  <p class="sub">Pick a name, choose a game, clear levels. Your progress stays on this device.</p>
  <div class="panel"><input id="nm" maxlength="16" placeholder="Choose a username" autocomplete="off"><br><button class="btn" id="go">Start playing</button><div class="msg" id="m"></div></div>`;
  const go=()=>{const v=$("#nm").value.trim();if(v.length<2){$("#m").textContent="Use at least 2 characters.";return}S.name=v;save();home()};
  $("#go").onclick=go;$("#nm").onkeydown=e=>e.key==="Enter"&&go();return}
 app.innerHTML=top()+`<h1>${split("Hey "+S.name)}</h1><p class="sub">Choose a game category.</p>
 <div class="grid">${CATS.map(c=>`<button class="card" data-cat="${c.id}"><span class="ic">${c.ic}</span><b>${c.t}</b><small>${c.d}${c.n?" · "+c.n+" levels":""}</small></button>`).join("")}</div>
 <p><button class="btn g" id="rn">Change username</button></p>`;
 $("#rn").onclick=()=>{S.name="";save();home()};
}
function levels(c){
 const cat=CATS.find(x=>x.id===c);
 if(c==="mine")return mine();
 app.innerHTML=top("home")+`<h2>${cat.ic} ${cat.t}</h2><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(90px,1fr))">${[...Array(cat.n)].map((_,i)=>`<button class="card lv" data-lv="${c}:${i}" ${unlocked(c,i)?"":"disabled"}>${unlocked(c,i)?(isDone(c,i)?"✓ ":"")+(i+1):"🔒"}</button>`).join("")}</div>`;
}
function mine(){
 app.innerHTML=top("home")+`<h2>✍️ Create a game</h2><p class="sub">Write a riddle for someone you know. It appears below as a level.</p>
 <div class="panel"><input id="q" placeholder="Question"><br><br><input id="a" placeholder="Answer (one word)"><br><br><input id="h" placeholder="Hint (optional)"><br><button class="btn" id="add">Add level</button><div class="msg" id="m"></div></div>
 <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(90px,1fr))">${S.custom.map((r,i)=>`<button class="card lv" data-lv="mine:${i}">${i+1}</button>`).join("")}</div>`;
 $("#add").onclick=()=>{const q=$("#q").value.trim(),a=$("#a").value.trim(),h=$("#h").value.trim();if(!q||!a){$("#m").textContent="Add a question and an answer.";return}S.custom.push([q,a.toLowerCase(),h||"No hint for this one."]);save();mine()};
}
function winBox(c,i){
 S.done[c+":"+i]=1;save();
 const total=c==="mine"?S.custom.length:CATS.find(x=>x.id===c).n;
 $("#res").innerHTML=`<div class="panel win"><h2>Level ${i+1} cleared ⭐</h2>${i+1<total?`<button class="btn" data-lv="${c}:${i+1}">Next level</button>`:""}<button class="btn g" data-go="cat:${c}">All levels</button></div>`;
}
function play(c,i){
 i=+i;const back="cat:"+c;
 const head=top(back)+`<h2>Level ${i+1}</h2>`;
 if(c==="riddle"||c==="mine"){
  const r=c==="mine"?S.custom[i]:RIDDLES[i];
  app.innerHTML=head+`<div class="panel"><p style="font-size:1.2rem">${esc(r[0])}</p><input id="in" placeholder="Your answer" autocomplete="off"><br><button class="btn" id="ck">Check</button><button class="btn g" id="ht">Hint</button><div class="msg" id="m"></div></div><div id="res"></div>`;
  const ck=()=>{if($("#in").value.trim().toLowerCase()===r[1].toLowerCase()){$("#m").textContent="Correct!";winBox(c,i)}else $("#m").textContent="Not yet. Try again."};
  $("#ck").onclick=ck;$("#in").onkeydown=e=>e.key==="Enter"&&ck();$("#ht").onclick=()=>$("#m").textContent="Hint: "+r[2];
 }
 if(c==="scr"){
  const w=WORDS[i];let s;do{s=shuffle(w).join("")}while(s===w);
  app.innerHTML=head+`<div class="panel"><div class="scr">${s.toUpperCase()}</div><input id="in" placeholder="Unscrambled word" autocomplete="off"><br><button class="btn" id="ck">Check</button><button class="btn g" id="ht">Reveal a letter</button><div class="msg" id="m"></div></div><div id="res"></div>`;
  const ck=()=>{if($("#in").value.trim().toLowerCase()===w){$("#m").textContent="Correct!";winBox(c,i)}else $("#m").textContent="Not quite."};
  $("#ck").onclick=ck;$("#in").onkeydown=e=>e.key==="Enter"&&ck();$("#ht").onclick=()=>$("#m").textContent="Starts with "+w[0].toUpperCase()+", ends with "+w.slice(-1).toUpperCase();
 }
 if(c==="mem"){
  const deck=shuffle([...MEM[i],...MEM[i]]);let open=[],lock=false,found=0,moves=0;
  app.innerHTML=head+`<div class="panel"><div class="msg" id="m">Moves: 0</div><div class="mem">${deck.map((e,k)=>`<button class="mc" data-k="${k}"><span class="fr">?</span><span class="bk">${e}</span></button>`).join("")}</div></div><div id="res"></div>`;
  document.querySelectorAll(".mc").forEach(b=>b.onclick=()=>{
   if(lock||b.classList.contains("f"))return;b.classList.add("f");open.push(b);
   if(open.length===2){moves++;$("#m").textContent="Moves: "+moves;const[x,y]=open;
    if(deck[x.dataset.k]===deck[y.dataset.k]){x.classList.add("d");y.classList.add("d");open=[];if(++found===MEM[i].length)winBox(c,i)}
    else{lock=true;setTimeout(()=>{x.classList.remove("f");y.classList.remove("f");open=[];lock=false},800)}}});
 }
 if(c==="zip"){
  const n=ZIP[i],k=n+1,tr=Math.random()<.5,fx=Math.random()<.5,fy=Math.random()<.5;
  const num={};const cell=t=>{const r=t/n|0;let cc=r%2?n-1-t%n:t%n,rr=r;if(fx)cc=n-1-cc;if(fy)rr=n-1-rr;return tr?cc*n+rr:rr*n+cc};
  for(let j=0;j<k;j++)num[cell(Math.round(j*(n*n-1)/(k-1)))]=j+1;
  let path=[];
  const draw=()=>{document.querySelectorAll(".zc").forEach((b,x)=>b.classList.toggle("on",path.includes(x)))};
  app.innerHTML=head+`<div class="panel"><p class="sub">Start at 1, reach every number in order, and fill every cell. Tap a cell on your line to step back.</p><div class="zip" style="grid-template-columns:repeat(${n},1fr)">${[...Array(n*n)].map((_,x)=>`<button class="zc" data-x="${x}">${num[x]||""}</button>`).join("")}</div><div class="msg" id="m"></div><button class="btn g" id="rs">Reset</button></div><div id="res"></div>`;
  $("#rs").onclick=()=>{path=[];draw();$("#m").textContent=""};
  document.querySelectorAll(".zc").forEach(b=>b.onclick=()=>{
   const x=+b.dataset.x,m=$("#m"),at=path.indexOf(x);m.textContent="";
   if(at>=0){path=path.slice(0,at+1)}
   else if(!path.length){if(num[x]===1)path=[x];else m.textContent="Start on 1."}
   else{const l=path[path.length-1],near=Math.abs((l/n|0)-(x/n|0))+Math.abs(l%n-x%n)===1;
    const seen=path.filter(p=>num[p]).length;
    if(!near)m.textContent="Move to a neighbouring cell.";
    else if(num[x]&&num[x]!==seen+1)m.textContent="Numbers must go in order.";
    else path.push(x)}
   draw();
   if(path.length===n*n&&num[path[path.length-1]]===k)winBox(c,i);
  });
 }
}

// ---------- events ----------
document.addEventListener("click",e=>{
 const t=e.target.closest("[data-cat],[data-lv],[data-go]");if(!t||t.disabled)return;
 if(t.dataset.cat)levels(t.dataset.cat);
 else if(t.dataset.lv){const[c,i]=t.dataset.lv.split(":");play(c,i)}
 else{const g=t.dataset.go;g==="home"?home():levels(g.split(":")[1])}
 window.scrollTo(0,0);
});
document.addEventListener("mousemove",e=>{
 const c=e.target.closest&&e.target.closest(".card");if(!c)return;
 const r=c.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
 c.style.setProperty("--mx",x+"px");c.style.setProperty("--my",y+"px");
 c.style.transform=`rotateX(${((y/r.height)-.5)*-12}deg) rotateY(${((x/r.width)-.5)*12}deg)`;
});
document.addEventListener("mouseout",e=>{const c=e.target.closest&&e.target.closest(".card");if(c)c.style.transform=""});

// ---------- 3D background ----------
(function(){
 try{
  const cv=$("#bg"),R=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true}),sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(55,1,.1,100);
  cam.position.z=14;sc.add(new THREE.AmbientLight(0xffffff,.6));const dl=new THREE.DirectionalLight(0xffffff,.9);dl.position.set(5,8,6);sc.add(dl);
  const geos=[new THREE.IcosahedronGeometry(1),new THREE.OctahedronGeometry(1),new THREE.TorusGeometry(.8,.3,16,32),new THREE.TorusKnotGeometry(.7,.22,64,10)],cols=[0x7c5cff,0xff5ca8,0x4cc9f0,0xffd166],ms=[];
  for(let i=0;i<16;i++){const m=new THREE.Mesh(geos[i%4],new THREE.MeshStandardMaterial({color:cols[i%4],roughness:.3,metalness:.4}));
   m.position.set((Math.random()-.5)*22,(Math.random()-.5)*14,(Math.random()-.5)*8-2);m.scale.setScalar(.5+Math.random()*.9);m.userData={s:.2+Math.random()*.5,p:Math.random()*6};sc.add(m);ms.push(m)}
  let mx=0,my=0;addEventListener("pointermove",e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});
  const rs=()=>{R.setSize(innerWidth,innerHeight,false);R.setPixelRatio(Math.min(devicePixelRatio,2));cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()};rs();addEventListener("resize",rs);
  const still=matchMedia("(prefers-reduced-motion:reduce)").matches;
  (function loop(t){t*=.001;ms.forEach(m=>{if(!still){m.rotation.x+=.003*m.userData.s;m.rotation.y+=.005*m.userData.s;m.position.y+=Math.sin(t*m.userData.s+m.userData.p)*.004}});
   cam.position.x+=(mx*3-cam.position.x)*.04;cam.position.y+=(-my*2-cam.position.y)*.04;cam.lookAt(0,0,0);R.render(sc,cam);requestAnimationFrame(loop)})(0);
 }catch(e){}
})();
home();
