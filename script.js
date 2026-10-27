(function(){
// ---------- state ----------
let S={name:"",done:{},custom:[]};
try{Object.assign(S,JSON.parse(localStorage.getItem("ustwo")||"{}"))}catch(e){}
const save=()=>{try{localStorage.setItem("ustwo",JSON.stringify(S))}catch(e){}};
const $=s=>document.querySelector(s), app=$("#app");
let room={peer:null,conn:null,role:"",code:"",partnerName:"",category:"",level:0,active:false,selfDone:false,partnerDone:false,custom:[],joinAttempts:0,retryTimer:null,joinTimer:null,hostAttempts:0};

// ---------- levels (edit these to add more) ----------
const RIDDLES=[
["I have keys but open no doors. What am I?","keyboard","You are probably touching one."],
["The more you take, the more you leave behind. What am I?","footsteps","Think about walking."],
["What has hands but cannot clap?","clock","It tells time."],
["What gets wetter the more it dries?","towel","Found in a bathroom."],
["I speak without a mouth and hear without ears. What am I?","echo","Shout in a canyon."],
["What has a heart that does not beat?","artichoke","A vegetable."],
["What can travel the world while staying in a corner?","stamp","Goes on envelopes."],
["What runs but never walks?","river","It has a mouth and a bed."],
["What has one eye but cannot see?","needle","It is used for sewing."],
["What has many teeth but cannot bite?","comb","It helps tidy hair."],
["What has a neck but no head?","bottle","It can hold a drink."],
["What has cities but no houses, forests but no trees, and rivers but no water?","map","You might fold it before a trip."],
["What goes up but never comes down?","age","It increases each birthday."],
["What belongs to you but other people use it more?","name","People say it to get your attention."],
["What can you catch but not throw?","cold","It often comes with a cough."],
["What has four fingers and a thumb but is not alive?","glove","You wear it on your hand."],
["What has a head and a tail but no body?","coin","You flip it to choose."],
["What gets bigger the more you take away?","hole","Digging makes it grow."],
["What can fill a room but takes up no space?","light","A lamp can switch it on."],
["What has words but never speaks?","book","You turn its pages."],
["What has legs but never walks?","table","You might eat dinner at it."],
["What has branches but no fruit, trunk, or leaves?","bank","It keeps money safe."],
["What has a ring but no finger?","telephone","It rings when someone calls."],
["What has a bottom at the top?","leg","It is part of your body."],
["What can be cracked, made, told, and played?","joke","A punchline often follows it."],
["What has 13 hearts but no other organs?","cards","It is a deck used for games."],
["What kind of band never plays music?","rubber","It stretches around things."],
["What has an end but no beginning, a home but no family, and a space without a room?","keyboard","Look at the keys you type with."],
["What word is spelled incorrectly in every dictionary?","incorrectly","Read the question carefully."],
["What five-letter word becomes shorter when you add two letters?","short","Add the letters e and r."],
["What starts with E, ends with E, and contains one letter?","envelope","It carries a letter inside."],
["What has a spine but no bones and pages but no voice?","notebook","You can write notes in it."],
["What can be opened but has no hinges, lock, or lid?","mind","An idea can change it."],
["What has a tongue but cannot taste and sole but cannot walk?","shoe","It goes on your foot."],
["What has roots nobody sees, is taller than trees, and keeps growing upward?","mountain","Its peak can be snowy."],
["What has an eye at its center but cannot see, and spins without moving?","hurricane","It is a powerful storm."],
["What breaks the moment you say its name?","silence","A quiet room has it."],
["What can be measured but has no length, width, or height?","time","Clocks keep track of it."],
["What has a face and two hands but no arms or legs?","watch","It tells you the time."],
["What has a bed but never sleeps, a bank but no money, and a mouth but never eats?","river","It flows toward the sea."],
["What has keys that open no locks and space but no room, and lets you enter without walking?","keyboard","It is used with a computer."],
["What can be served but never eaten, returned but never borrowed, and is called during a match?","tennis","Players hit a ball over a net."],
["What is always in front of you but cannot be seen?","future","It has not happened yet."],
["What has no life but can die, has no lungs but needs air, and water ends it?","fire","It gives off heat and light."],
["What can travel from person to person without moving, and disappears when shared?","secret","You whisper it to someone you trust."],
["What has a number on every face but no eyes, and decides a board-game move?","dice","You roll a pair of them."],
["What is bought by the yard and worn by the foot?","carpet","It covers the floor."],
["What has a lock but no key, a space but no room, and stores files?","computer","It sits on a desk or lap."],
["What can point in every direction but never move from its place?","compass","Its needle points north."],
["What has a web but no spider, links but no chain, and pages all around the world?","internet","You browse it online."]];
const WORDS=["react","pixel","vector","shader","canvas","render","camera","matrix","buffer","vertex","texture","browser","compile","element","function","promise","closure","decimal","polygon","gradient","internet","keyboard","variable","constant","database","terminal","protocol","argument","recursion","algorithm","iteration","parameter","framework","interface","typescript","javascript","stylesheet","middleware","repository","responsive","accessible","concurrency","architecture","authentication","configuration","virtualization","implementation","representation","internationalization","interoperability"];
const MEM_ICONS=["🍎","🍌","🍇","🍓","🚀","🌙","⭐","🪐","☄️","🌍","🐱","🐶","🦊","🐼","🐸","🦁","🐙","🦄","🍕","🍔","🍟","🌮","🍩","🍦","🍣"];
const LEVEL_COUNT=50;
const ARCADE_GAMES=[
 {id:"duck",ic:"🦆",t:"Duck Dash",d:"Dodge, jump, and collect donuts",score:"distance and donuts"},
 {id:"stack",ic:"🧀",t:"Cheese Tower",d:"Stack moving slabs without toppling",score:"stacked cheese slabs"},
 {id:"whack",ic:"🥔",t:"Potato Whack",d:"Whack potatoes before time runs out",score:"potatoes whacked"}
];
const CATS=[
{id:"riddle",ic:"🧩",t:"Riddles",d:"Brain teasers with hints",n:LEVEL_COUNT},
{id:"scr",ic:"🔤",t:"Word Scramble",d:"Unscramble tech words",n:LEVEL_COUNT},
{id:"mem",ic:"🃏",t:"Memory Match",d:"Flip cards in 3D",n:LEVEL_COUNT},
{id:"zip",ic:"🧵",t:"Zip Path",d:"Draw one line through every cell",n:LEVEL_COUNT},
{id:"mine",ic:"✍️",t:"Create a game",d:"Write your own riddles",n:0}];
CATS.push(...ARCADE_GAMES.map(g=>({...g,n:LEVEL_COUNT})));

// ---------- helpers ----------
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const split=t=>[...t].map((c,i)=>`<span class="ch" style="--i:${i}">${c===" "?"&nbsp;":esc(c)}</span>`).join("");
const stars=()=>Object.keys(S.done).length;
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const isDone=(c,i)=>!!S.done[c+":"+i];
const unlocked=(c,i)=>i===0||isDone(c,i-1);
const arcadeGame=id=>ARCADE_GAMES.find(g=>g.id===id);
const levelCount=c=>c==="mine"?S.custom.length:LEVEL_COUNT;
const arcadeGoal=(c,i)=>c==="duck"?20+(i+1)*2:c==="stack"?3+Math.ceil((i+1)*.3):5+Math.ceil((i+1)*.45);
const memoryPairs=i=>Math.min(MEM_ICONS.length,4+Math.floor(i*(MEM_ICONS.length-4)/(LEVEL_COUNT-1)));
const zipSize=i=>Math.min(10,3+Math.floor(i/7));
const zipMarkers=(i,n)=>Math.min(n*n,4+Math.floor(i/4));
const generateRoomCode=()=>String(Math.floor(1000+Math.random()*9000));
function top(back){return `<div class="bar"><div>${room.active?`<button class="btn g" data-room-leave>Leave room</button>`:back?`<button class="btn g" data-go="${back}">← Back</button>`:""}</div><div><span class="pill">👤 ${esc(S.name)}</span> <span class="pill" id="star-count">⭐ ${stars()}</span></div></div>`}
function roomPlayerStatus(){return room.active?`<p class="sub" id="room-progress">Playing with ${esc(room.partnerName||"your partner")} · both players must solve this level to continue.</p>`:""}

function roomStatus(text){const el=$("#room-status");if(el)el.textContent=text}
function roomError(text){const el=$("#room-error");if(el)el.textContent=text}
function roomInviteUrl(code){
 const url=new URL(location.href);
 url.search="";url.hash="";url.searchParams.set("join",code);
 return url.toString();
}
function closeRoom(){
 clearTimeout(room.retryTimer);clearTimeout(room.joinTimer);
 if(room.conn)room.conn.close();
 if(room.peer)room.peer.destroy();
 room={peer:null,conn:null,role:"",code:"",partnerName:"",category:"",level:0,active:false,selfDone:false,partnerDone:false,custom:[],joinAttempts:0,retryTimer:null,joinTimer:null,hostAttempts:0};
 home();
}
function roomLobby(){
 app.innerHTML=top()+`<h2>Two-player room</h2><div class="panel">
  <p>${room.role==="host"?"Share this room code with your partner. Keep this page open while they join:":"Connecting to room:"} <strong>${esc(room.code)}</strong></p>
  ${room.role==="host"&&room.code?`<button class="btn" id="share-room">Share invite</button><button class="btn g" id="copy-room-code">Copy code</button>`:""}
  <p id="room-status" class="msg">${room.role==="host"?"Waiting for your partner to join. Keep this page open while they connect.":"Connecting…"}</p>
  ${room.role==="host"?`<div class="grid">${CATS.map(c=>`<button class="card" data-room-cat="${c.id}" ${c.id==="mine"&&!S.custom.length?"disabled":""}><span class="ic">${c.ic}</span><b>${c.t}</b><small>${c.id==="mine"&&!S.custom.length?"Add your own riddles first":c.d+(c.n?" · "+c.n+" levels":"")}</small></button>`).join("")}</div>`:""}
  ${room.role==="guest"?`<label for="room-code-input">Room code</label><br><input id="room-code-input" type="text" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" value="${esc(room.code)}" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="btn" id="retry-join">Join room</button>`:""}
  <div id="room-error" class="msg" role="alert"></div><button class="btn g" id="leave-room">Leave room</button>
 </div>`;
 $("#leave-room").onclick=closeRoom;
 const retry=$("#retry-join");
 if(retry){
  retry.onclick=()=>startRoomGuest($("#room-code-input").value);
  $("#room-code-input").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();retry.click()}};
 }
 const copy=$("#copy-room-code");
 if(copy)copy.onclick=async()=>{try{await navigator.clipboard.writeText(room.code);roomStatus("Room code copied. Waiting for your partner…")}catch(error){roomStatus("Copy failed. Select and copy the room code above.")}};
 const share=$("#share-room");
 if(share)share.onclick=async()=>{
  const url=roomInviteUrl(room.code);
  try{
   if(navigator.share)await navigator.share({title:"Join my UsTwo Arcade room",text:"Open this invite to join my game:",url});
   else{await navigator.clipboard.writeText(url);roomStatus("Invite link copied. Waiting for your partner…");return}
   roomStatus("Invite shared. Keep this page open while your partner joins.");
  }catch(error){if(error.name!=="AbortError")roomStatus("Could not share the invite. Copy the room code instead.")}
 };
}
function roomFailure(message){
 clearTimeout(room.retryTimer);clearTimeout(room.joinTimer);
 const wasActive=room.active;
 room.active=false;
 room.joinAttempts++;
 if(room.peer)room.peer.destroy();
 room.peer=null;room.conn=null;
 if(wasActive){home();roomError(message)}
 else if(room.role==="guest"){roomLobby();roomError(message)}
 else roomError(message);
}
function startRoomHost(){
 if(typeof Peer==="undefined"){roomError("Room connection is unavailable. Check your internet connection and reload.");return}
 if(room.peer)room.peer.destroy();
 room.role="host";room.partnerName="";room.hostAttempts=0;
 roomLobby();
 createHostPeer();
}
function createHostPeer(){
 if(room.hostAttempts>=12){roomFailure("Could not reserve a four-digit room code. Try creating a room again.");return}
 room.hostAttempts++;
 room.code=generateRoomCode();
 roomLobby();
 try{
  const peer=new Peer(room.code);
  room.peer=peer;
  peer.on("open",()=>roomLobby());
  peer.on("connection",conn=>{
   if(room.conn){conn.close();return}
   room.conn=conn;
   conn.on("open",()=>{
    roomStatus("Partner connected. Choose a game to begin.");
   });
   conn.on("data",onRoomMessage);
   conn.on("close",()=>{room.partnerName="";room.partnerDone=false;if(room.active){room.active=false;if(room.peer)room.peer.destroy();room.peer=null;room.conn=null;home();roomError("Your partner disconnected. Create a new room to play together.")}else{room.conn=null;roomStatus("Partner disconnected. Share the same room code and have them join again.")}});
   conn.on("error",()=>roomFailure("The room connection was interrupted. Please create a new room."));
  });
  peer.on("error",err=>{
   if(peer!==room.peer)return;
   if(err.type==="unavailable-id"){
    peer.destroy();room.peer=null;createHostPeer();
   }else roomFailure("Could not create a room. Check your internet connection and try again.");
  });
 }catch(error){room.peer=null;createHostPeer();}
}
function startRoomGuest(code){
 code=String(code||"").trim().replace(/\s+/g,"");
 if(!code){roomError("Enter the room code first.");return}
 if(!/^\d{4}$/.test(code)){roomError("Room codes must be exactly four digits.");return}
 if(typeof Peer==="undefined"){roomError("Room connection is unavailable. Check your internet connection and reload.");return}
 clearTimeout(room.retryTimer);clearTimeout(room.joinTimer);
 room.joinAttempts++;
 if(room.conn)room.conn.close();
 if(room.peer)room.peer.destroy();
 room.role="guest";room.code=code;room.partnerName="";room.conn=null;room.peer=null;room.joinAttempts=0;room.hostAttempts=0;roomLobby();
 try{
  room.peer=new Peer();
  room.peer.on("open",()=>connectToRoom(code));
  room.peer.on("error",err=>{
   if(err.type==="peer-unavailable")scheduleGuestRetry();
   else roomFailure("Could not connect to the room service. Check your internet connection and try again.");
  });
 }catch(error){roomFailure("Could not join the room. Check your internet connection and try again.");}
}
function connectToRoom(code){
 if(room.role!=="guest"||!room.peer||room.active)return;
 clearTimeout(room.joinTimer);
 room.joinAttempts++;
 roomStatus(room.joinAttempts===1?"Connecting…":`Retrying connection (${room.joinAttempts}/3)…`);
 try{
  room.conn=room.peer.connect(code,{reliable:true});
  bindGuestConnection(room.joinAttempts);
  room.joinTimer=setTimeout(()=>scheduleGuestRetry(),10000);
 }catch(error){scheduleGuestRetry()}
}
function scheduleGuestRetry(){
 if(room.role!=="guest"||room.active||room.retryTimer)return;
 clearTimeout(room.joinTimer);
 if(room.conn){room.conn.removeAllListeners();room.conn.close();room.conn=null}
 if(room.joinAttempts>=3){
  roomFailure("Room not found or host is offline. Check the code and ask the host to keep the room open, then try again.");
  return;
 }
 roomStatus(`Room not found yet. Retrying (${room.joinAttempts+1}/3)…`);
 room.retryTimer=setTimeout(()=>{room.retryTimer=null;connectToRoom(room.code)},1200);
}
function bindGuestConnection(attempt){
 const conn=room.conn;
 conn.on("open",()=>{
  if(attempt!==room.joinAttempts)return;
  clearTimeout(room.joinTimer);clearTimeout(room.retryTimer);
  roomStatus("Connected. Waiting for the host to choose a game…");conn.send({type:"hello",name:S.name});
 });
 conn.on("data",onRoomMessage);
 conn.on("close",()=>{if(attempt!==room.joinAttempts)return;if(room.active){room.active=false;if(room.peer)room.peer.destroy();room.peer=null;room.conn=null;home();roomError("The host disconnected. Ask them to create a new room and share its current code.")}else if(!conn.open)scheduleGuestRetry();else roomStatus("Host disconnected. Check the room code and try again.")});
 conn.on("error",error=>{if(attempt!==room.joinAttempts)return;if(error.type==="peer-unavailable")scheduleGuestRetry();else roomFailure("The room connection was interrupted. Please try joining again.")});
}
function beginRoomGame(category){
 if(!room.conn||!room.conn.open){roomError("Wait until your partner joins before starting a game.");return}
 room.category=category;room.level=0;room.custom=category==="mine"?S.custom.map(r=>[...r]):[];
 room.active=true;room.selfDone=false;room.partnerDone=false;
 room.conn.send({type:"start",category,level:0,custom:room.custom});
 play(category,0);
}
function onRoomMessage(message){
 if(!message||typeof message!=="object")return;
 if(message.type==="hello"&&room.role==="host"){
  room.partnerName=typeof message.name==="string"?message.name.slice(0,16):"Partner";
  room.conn.send({type:"welcome",name:S.name});
  roomStatus(`${room.partnerName} connected. Choose a game to begin.`);
  if(room.active)room.conn.send({type:"start",category:room.category,level:room.level,custom:room.custom});
 }else if(message.type==="welcome"&&room.role==="guest"){
  room.partnerName=typeof message.name==="string"?message.name.slice(0,16):"Host";
  if(!room.active)roomStatus(`Connected to ${room.partnerName}. Waiting for the host to choose a game…`);
 }else if(message.type==="start"&&room.role==="guest"&&typeof message.category==="string"&&Number.isInteger(message.level)){
  room.category=message.category;room.level=message.level;room.custom=Array.isArray(message.custom)?message.custom:[];
  room.active=true;room.selfDone=false;room.partnerDone=false;
  play(room.category,room.level);
 }else if(message.type==="complete"&&room.role==="host"&&room.active&&message.category===room.category&&message.level===room.level){
  room.partnerDone=true;
  const progress=$("#room-progress");
  if(progress)progress.textContent=room.selfDone?"Both players solved it. Moving to the next level…":"Your partner solved it. Now solve this level to continue.";
  checkRoomCompletion();
 }else if(message.type==="advance"&&room.role==="guest"&&room.active&&message.category===room.category&&message.level===room.level+1){
  markDone(room.category,room.level);
  room.level=message.level;room.selfDone=false;room.partnerDone=false;
  play(room.category,room.level);
 }else if(message.type==="finished"&&room.role==="guest"&&room.active&&message.category===room.category&&message.level===room.level){
  markDone(room.category,room.level);room.active=false;renderRoomFinished();
 }
}
function markDone(category,level){
 S.done[category+":"+level]=1;save();
}
function completeRoomLevel(category,level){
 if(room.selfDone)return;
 room.selfDone=true;
 if(room.role==="guest"&&room.conn&&room.conn.open)room.conn.send({type:"complete",category,level});
 if(room.role==="guest")$("#res").innerHTML=`<div class="panel"><h2>You solved it!</h2><p class="msg">Waiting for ${esc(room.partnerName||"your partner")} to finish this level…</p></div>`;
 const progress=$("#room-progress");
 if(progress)progress.textContent=room.role==="host"?"You solved it. Waiting for your partner…":"You solved it. Waiting for your partner…";
 if(room.role==="host")checkRoomCompletion();
}
function checkRoomCompletion(){
 if(room.role!=="host"||!room.active||!room.selfDone||!room.partnerDone)return;
 const category=room.category,level=room.level,total=category==="mine"?room.custom.length:CATS.find(c=>c.id===category).n;
 markDone(category,level);$("#star-count").textContent="⭐ "+stars();
 if(level+1<total){
  room.level=level+1;room.selfDone=false;room.partnerDone=false;
  room.conn.send({type:"advance",category,level:room.level});
  play(category,room.level);
 }else{
  room.conn.send({type:"finished",category,level});
  room.active=false;renderRoomFinished();
 }
}
function renderRoomFinished(){
 app.innerHTML=top()+`<div class="panel win"><h2>Both players cleared the game! ⭐</h2><p>Your progress is saved on this device.</p><button class="btn g" id="leave-room">Leave room</button></div>`;
 $("#leave-room").onclick=closeRoom;
}

// ---------- screens ----------
function home(){
 if(!S.name){
  app.innerHTML=`<h1>${split("UsTwo")} <span class="grad">${split("Arcade")}</span></h1>
  <p class="sub">Pick a name, choose a game, clear levels. Your progress stays on this device.</p>
  <form class="panel" id="name-form"><label for="nm">Your username</label><br><input id="nm" type="text" inputmode="text" maxlength="16" placeholder="Choose a username" autocomplete="nickname" autocapitalize="words" spellcheck="false" required><br><button class="btn" id="go" type="submit">Start playing</button><div class="msg" id="m" role="status"></div></form>`;
  $("#name-form").onsubmit=e=>{e.preventDefault();const v=$("#nm").value.trim();if(v.length<2){$("#m").textContent="Use at least 2 characters.";$("#nm").focus();return}S.name=v;save();home()};return}
 app.innerHTML=top()+`<h1>${split("Hey "+S.name)}</h1><p class="sub">Choose a game category or play together.</p>
 <div class="panel"><h2>Play together</h2><button class="btn" id="create-room">Create room</button>
 <input id="join-code" type="text" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" value="${esc(new URL(location.href).searchParams.get("join")||"")}" placeholder="Enter your partner's 4-digit room code" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="join"><button class="btn g" id="join-room">Join room</button><div class="msg" id="room-error" role="alert"></div></div>
 <h2>Play solo</h2>
 <div class="grid">${CATS.map(c=>`<button class="card" data-cat="${c.id}"><span class="ic">${c.ic}</span><b>${c.t}</b><small>${c.d}${c.n?" · "+c.n+" levels":""}</small></button>`).join("")}</div>
 <p><button class="btn g" id="rn">Change username</button></p>`;
 $("#rn").onclick=()=>{S.name="";save();home()};
 $("#create-room").onclick=startRoomHost;
 $("#join-room").onclick=()=>{const code=$("#join-code").value.trim();if(!code){roomError("Enter the room code first.");return}startRoomGuest(code)};
 $("#join-code").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();$("#join-room").click()}};
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
 if(room.active&&room.category===c&&room.level===i){completeRoomLevel(c,i);return}
 S.done[c+":"+i]=1;save();
 $("#star-count").textContent="⭐ "+stars();
 const total=c==="mine"?S.custom.length:CATS.find(x=>x.id===c).n;
 $("#res").innerHTML=`<div class="panel win"><h2>Level ${i+1} cleared ⭐</h2>${i+1<total?`<button class="btn" data-lv="${c}:${i+1}">Next level</button>`:""}<button class="btn g" data-go="cat:${c}">All levels</button></div>`;
}
function play(c,i){
 i=+i;const back=room.active?"":"cat:"+c;
 const head=top(back)+`<h2>Level ${i+1}</h2>`+roomPlayerStatus();
 if(c==="riddle"||c==="mine"){
  const r=c==="mine"?(room.active?room.custom[i]:S.custom[i]):RIDDLES[i];
  app.innerHTML=head+`<div class="panel"><p style="font-size:1.2rem">${esc(r[0])}</p><form id="answer-form"><input id="in" placeholder="Your answer" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done"><br><button class="btn" id="ck" type="submit">Check</button><button class="btn g" id="ht" type="button">Hint</button></form><div class="msg" id="m"></div></div><div id="res"></div>`;
  const ck=e=>{e.preventDefault();if($("#in").value.trim().toLowerCase()===r[1].trim().toLowerCase()){$("#m").textContent="Correct!";winBox(c,i)}else $("#m").textContent="Not yet. Try again."};
  $("#answer-form").onsubmit=ck;$("#ht").onclick=()=>$("#m").textContent="Hint: "+r[2];
 }
 if(c==="scr"){
  const w=WORDS[i];let s;do{s=shuffle(w).join("")}while(s===w);
  app.innerHTML=head+`<div class="panel"><div class="scr">${s.toUpperCase()}</div><form id="answer-form"><input id="in" placeholder="Unscrambled word" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done"><br><button class="btn" id="ck" type="submit">Check</button><button class="btn g" id="ht" type="button">Reveal a letter</button></form><div class="msg" id="m"></div></div><div id="res"></div>`;
  const ck=e=>{e.preventDefault();if($("#in").value.trim().toLowerCase()===w){$("#m").textContent="Correct!";winBox(c,i)}else $("#m").textContent="Not quite."};
  $("#answer-form").onsubmit=ck;$("#ht").onclick=()=>$("#m").textContent="Starts with "+w[0].toUpperCase()+", ends with "+w.slice(-1).toUpperCase();
 }
 if(c==="mem"){
  const pairs=memoryPairs(i),icons=shuffle(MEM_ICONS).slice(0,pairs);
  const deck=shuffle([...icons,...icons]);let open=[],lock=false,found=0,moves=0;
  app.innerHTML=head+`<div class="panel"><div class="msg" id="m">Moves: 0</div><div class="mem">${deck.map((e,k)=>`<button class="mc" data-k="${k}"><span class="fr">?</span><span class="bk">${e}</span></button>`).join("")}</div></div><div id="res"></div>`;
  document.querySelectorAll(".mc").forEach(b=>b.onclick=()=>{
   if(lock||b.classList.contains("f"))return;b.classList.add("f");open.push(b);
   if(open.length===2){moves++;$("#m").textContent="Moves: "+moves;const[x,y]=open;
    if(deck[x.dataset.k]===deck[y.dataset.k]){x.classList.add("d");y.classList.add("d");open=[];if(++found===pairs)winBox(c,i)}
    else{lock=true;setTimeout(()=>{x.classList.remove("f");y.classList.remove("f");open=[];lock=false},800)}}});
 }
 if(c==="zip"){
  const n=zipSize(i),k=zipMarkers(i,n),tr=Math.random()<.5,fx=Math.random()<.5,fy=Math.random()<.5;
  const num={};const cell=t=>{const r=t/n|0;let cc=r%2?n-1-t%n:t%n,rr=r;if(fx)cc=n-1-cc;if(fy)rr=n-1-rr;return tr?cc*n+rr:rr*n+cc};
  for(let j=0;j<k;j++)num[cell(Math.round(j*(n*n-1)/(k-1)))]=j+1;
  let path=[],pointerId=null,lastPointerCell=-1;
  const draw=()=>{document.querySelectorAll(".zc").forEach((b,x)=>b.classList.toggle("on",path.includes(x)))};
  app.innerHTML=head+`<div class="panel"><p class="sub">Start at 1, reach every number in order, and fill every cell. Slide your finger or tap neighbouring cells. Tap your line to step back.</p><div class="zip" style="grid-template-columns:repeat(${n},1fr)">${[...Array(n*n)].map((_,x)=>`<button class="zc" data-x="${x}">${num[x]||""}</button>`).join("")}</div><div class="msg" id="m"></div><button class="btn g" id="rs">Reset</button></div><div id="res"></div>`;
  $("#rs").onclick=()=>{path=[];draw();$("#m").textContent=""};
  const moveTo=x=>{
   const m=$("#m"),at=path.indexOf(x);
   if(path[path.length-1]===x)return;
   m.textContent="";
   if(at>=0){path=path.slice(0,at+1)}
   else if(!path.length){if(num[x]===1)path=[x];else m.textContent="Start on 1."}
   else{const l=path[path.length-1],near=Math.abs((l/n|0)-(x/n|0))+Math.abs(l%n-x%n)===1;
    const seen=path.filter(p=>num[p]).length;
    if(!near)m.textContent="Move to a neighbouring cell.";
    else if(num[x]&&num[x]!==seen+1)m.textContent="Numbers must go in order.";
    else path.push(x)}
   draw();
   if(path.length===n*n&&num[path[path.length-1]]===k)winBox(c,i);
  };
  const cellFromPoint=(x,y)=>document.elementFromPoint(x,y)?.closest(".zc");
  app.querySelectorAll(".zc").forEach(b=>b.addEventListener("click",()=>moveTo(+b.dataset.x)));
  const zip=app.querySelector(".zip");
  zip.addEventListener("pointerdown",e=>{
   const cell=e.target.closest(".zc");if(!cell)return;
   e.preventDefault();pointerId=e.pointerId;lastPointerCell=+cell.dataset.x;moveTo(lastPointerCell);
  });
  zip.addEventListener("pointermove",e=>{
   if(pointerId!==e.pointerId)return;
   const cell=cellFromPoint(e.clientX,e.clientY);if(!cell)return;
   const x=+cell.dataset.x;if(x===lastPointerCell)return;
   lastPointerCell=x;moveTo(x);
  });
  const endPointer=e=>{if(pointerId===e.pointerId){pointerId=null;lastPointerCell=-1}};
  zip.addEventListener("pointerup",endPointer);
  zip.addEventListener("pointercancel",endPointer);
 }
 if(arcadeGame(c)){
  const goal=arcadeGoal(c,i),src=new URL("./arcade.html",location.href);
  src.searchParams.set("campaign","1");
  src.searchParams.set("game",c);
  src.searchParams.set("level",String(i+1));
  src.searchParams.set("goal",String(goal));
  app.innerHTML=head+`<div class="panel"><p class="sub">Reach the score target to clear this level. The challenge increases each level.</p><iframe class="arcade-frame" title="${esc(arcadeGame(c).t)} — level ${i+1}" src="${esc(src.href)}" allow="autoplay; fullscreen" loading="eager"></iframe></div><div id="res"></div>`;
 }
}

// ---------- events ----------
window.addEventListener("message",e=>{
 if(e.origin!==location.origin||!room.active&& !$("#app .arcade-frame")||e.source!==$("#app .arcade-frame")?.contentWindow)return;
 const message=e.data;
 if(!message||message.type!=="arcade-level-complete"||!arcadeGame(message.game)||!Number.isInteger(message.level)||!Number.isFinite(message.score))return;
 const frame=$("#app .arcade-frame"),category=room.active?room.category:frame&&new URL(frame.src).searchParams.get("game"),level=room.active?room.level:Number(frame&&new URL(frame.src).searchParams.get("level"))-1;
 if(message.game!==category||message.level!==level+1||message.score<arcadeGoal(category,level))return;
 winBox(category,level);
});
document.addEventListener("click",e=>{
 const t=e.target.closest("[data-room-leave],[data-room-cat],[data-cat],[data-lv],[data-go]");if(!t||t.disabled)return;
 if(t.hasAttribute("data-room-leave"))closeRoom();
 else if(t.dataset.roomCat)beginRoomGame(t.dataset.roomCat);
 else if(t.dataset.cat)levels(t.dataset.cat);
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
})();
