let nicks = [], players = [], alive = []
let opened = 0

/* =========================
   CLUE BANK (BANYAK & RANDOM)
========================= */
const clueBank = [
  ["nasi","beras"],["roti","tepung"],["kopi","kafein"],["teh","daun"],
  ["laut","air"],["danau","air"],["sungai","air"],
  ["kucing","harimau"],["anjing","serigala"],["burung","elang"],
  ["mobil","mesin"],["motor","bensin"],["pesawat","sayap"],
  ["sekolah","murid"],["kampus","mahasiswa"],
  ["api","panas"],["es","dingin"],
  ["gunung","tinggi"],["laut","dalam"],
  ["matahari","panas"],["bulan","malam"],
  ["pisau","tajam"],["jarum","runcing"],
  ["dokter","rumah sakit"],["polisi","kantor"],
  ["bola","olahraga"],["raket","tenis"],
  ["hp","baterai"],["laptop","keyboard"],
  ["uang","dompet"],["buku","halaman"]
]

/* =========================
   RANDOM UTILS
========================= */
function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1))
    ;[arr[i],arr[j]]=[arr[j],arr[i]]
  }
  return arr
}

function pickClue(){
  const pair = shuffle([...clueBank])[0]
  return Math.random()<0.5
    ? {civil:pair[0], imp:pair[1]}
    : {civil:pair[1], imp:pair[0]}
}

/* =========================
   PLAYER SETUP
========================= */
function addNick(){
  let v = nickInput.value.trim()
  if(!v) return
  nicks.push(v)
  nickInput.value=""
  nickList.innerHTML=nicks.map(n=>`<div>${n}</div>`).join("")
}

function startSetup(){
  if(nicks.length<3){
    showToast("Minimal 3 pemain","error")
    return
  }

  let total=nicks.length
  let impostor=Math.max(1,Math.floor(total/4))
  let white=1

  showToast(`Impostor ${impostor} | Mr White ${white}`,"info",2500)

  const {civil,imp}=pickClue()
  let roles=[]

  for(let i=0;i<impostor;i++)
    roles.push({role:"imp",clue:imp})

  roles.push({role:"white",clue:"Kamu Adalah Mr. White"})

  while(roles.length<total)
    roles.push({role:"civil",clue:civil})

  roles=shuffle(roles)

  players=nicks.map((n,i)=>({
    id:i,name:n,...roles[i],alive:true
  }))
  alive=[...players]

  step1.classList.add("hidden")
  renderCards()
}

/* =========================
   CARD PHASE
========================= */
function renderCards(){
  cards.classList.remove("hidden")
  cards.innerHTML=""
  players.forEach(p=>{
    let c=document.createElement("div")
    c.className="card"
    c.innerHTML=`
      <div class="inner">
        <div class="face front">${p.name}</div>
        <div class="face back">${p.clue}</div>
      </div>`
    c.onclick=()=>openCard(c)
    cards.appendChild(c)
  })
}

function openCard(card){
  overlay.classList.remove("hidden")
  modal.innerHTML=`
    <div class="card open">${card.innerHTML}</div>
    <button onclick="closeCard()">OK</button>`
  opened++
  card.remove()
}

function closeCard(){
  overlay.classList.add("hidden")
  if(opened===players.length) startVoting()
}

/* =========================
   VOTING
========================= */
function startVoting(){
  voting.classList.remove("hidden")
  renderVote()
}

function renderVote(){
  voteGrid.innerHTML=""
  alive.forEach(p=>{
    let t=document.createElement("div")
    t.className="tag"
    t.innerText=p.name
    t.onclick=()=>votePlayer(p)
    voteGrid.appendChild(t)
  })
}

function votePlayer(p){
  overlay.classList.remove("hidden")
  modal.innerHTML=`
    <h3>${p.name}</h3>
    <button onclick="vote(${p.id},'imp')">Vote Impostor</button>
    <button onclick="vote(${p.id},'white')">Vote Mr White</button>`
}

function vote(id,type){
  let p=players[id]

  if(type==="imp"){
    eliminate(p,p.role==="imp"?"IMPOSTOR":"BUKAN IMPOSTOR")
    checkWin()
    return
  }

  if(type==="white"){
    if(p.role==="white"){
      showWhiteGuess(p,2)
    }else{
      showToast("Dia BUKAN Mr White","error")
      overlay.classList.add("hidden")
    }
  }
}

/* =========================
   MR WHITE
========================= */
function showWhiteGuess(p,chance){
  modal.innerHTML=`
    <h3>${p.name} adalah Mr White</h3>
    <p>Tebak clue (${chance}x)</p>
    <input id="guess">
    <button onclick="submitGuess(${p.id},${chance})">Submit</button>`
}

function submitGuess(id,chance){
  let ans=document.getElementById("guess").value.toLowerCase()
  let civil=players.find(x=>x.role==="civil")

  if(ans===civil.clue.toLowerCase()){
    showToast("MR WHITE MENANG","success",3000)
    setTimeout(()=>location.reload(),3000)
  }else{
    chance--
    if(chance>0){
      showToast("SALAH! Coba lagi","error")
      showWhiteGuess(players[id],chance)
    }else{
      eliminate(players[id],"MR WHITE")
      checkWin()
    }
  }
}

/* =========================
   ELIM & WIN
========================= */
function eliminate(p,label){
  showToast(`${p.name} adalah ${label}`,"info",2500)
  p.alive=false
  alive=alive.filter(x=>x.alive)
  overlay.classList.add("hidden")
  renderVote()
}

function checkWin(){
  let imp=alive.filter(p=>p.role==="imp").length
  let civil=alive.filter(p=>p.role==="civil").length
  let white=alive.filter(p=>p.role==="white").length

  if(civil<=imp){
    showToast("IMPOSTOR MENANG","error",3000)
    setTimeout(()=>location.reload(),3000)
  }

  if(imp===0 && white===0){
    showToast("ORANG BIASA MENANG","success",3000)
    setTimeout(()=>location.reload(),3000)
  }
}

/* =========================
   TOAST (APK STYLE)
========================= */
function showToast(msg,type="info",time=2000){
  const toast=document.getElementById("toast")
  toast.className=`toast show ${type}`
  toast.innerText=msg
  setTimeout(()=>{
    toast.className="toast hidden"
  },time)
}
