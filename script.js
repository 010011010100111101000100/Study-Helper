/* ===========================
   Study Helper — script.js
   - starfield background
   - onboarding (device)
   - music playlist loader (random loop)
   - custom sound effects
   - all state saved in localStorage
   =========================== */

/* ----- Utility ----- */
const $ = id => document.getElementById(id);
const LOCAL = key => localStorage.getItem(key);
const SAVE = (k,v) => localStorage.setItem(k, JSON.stringify(v));
const LOAD = (k, fallback) => {
  const v = localStorage.getItem(k);
  if(v === null) return fallback;
  try { return JSON.parse(v); } catch(e){ return fallback; }
};

/* ----- App State (persisted) ----- */
const appState = {
  todos: LOAD('sh_todos', []),
  notes: localStorage.getItem('sh_notes') || '',
  theme: localStorage.getItem('sh_theme') || 'space',
  soundEnabled: localStorage.getItem('sh_sound') !== 'false',
  musicEnabled: localStorage.getItem('sh_music') !== 'false',
  deviceType: localStorage.getItem('sh_device') || null,
  autoDark: localStorage.getItem('sh_auto') === 'true',
  pomodoro: LOAD('sh_pomodoro', { running:false, work:25, break:5, remaining:25*60, mode:'work' }),
  // Playlist files are expected to live in assets/music/ (you should put files there)
  playlist: LOAD('sh_playlist', [
    // default placeholder filenames — replace with your real filenames in assets/music/
    "assets/music/lofi1.mp3",
    "assets/music/ambient1.mp3",
    "assets/music/nature1.mp3"
  ]),
};

/* ----- Starfield (animated) ----- */
(function initStarfield(){
  const canvas = $('starfield');
  const ctx = canvas.getContext('2d');
  let w=canvas.width = innerWidth, h=canvas.height=innerHeight;
  window.addEventListener('resize',()=>{ w=canvas.width=innerWidth; h=canvas.height=innerHeight; createStars(); });

  let stars = [];
  const STAR_COUNT = Math.floor((w*h)/4500);

  function createStars(){
    stars = [];
    for(let i=0;i<STAR_COUNT;i++){
      stars.push({
        x: Math.random()*w,
        y: Math.random()*h,
        z: Math.random()*1.2 + 0.2,
        size: Math.random()*1.2,
        vx: (Math.random()-0.5)*0.05
      });
    }
  }
  createStars();

  let t=0;
  function frame(){
    t+=0.5;
    ctx.clearRect(0,0,w,h);
    // gradient background subtle
    const g = ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0, '#03030a');
    g.addColorStop(1, '#000814');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

    // draw stars
    for(const s of stars){
      s.x += s.vx * s.z;
      s.y += Math.sin((t+s.x*0.01)/50)*0.1;
      if(s.x < -2) s.x = w+2;
      if(s.x > w+2) s.x = -2;
      const alpha = 0.6 + 0.4*Math.sin((s.x+s.y+t)/100);
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${alpha*s.z})`;
      ctx.arc(s.x, s.y, (s.size + s.z*1.2), 0, Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  frame();
})();

/* ----- Date & Time ----- */
function updateTime(){ const now=new Date(); $('dateTime').textContent = now.toLocaleString(); }
setInterval(updateTime,1000); updateTime();

/* ----- Weather (open-meteo) ----- */
async function updateWeather(){
  if(!navigator.geolocation) { $('weather').textContent = 'Location blocked'; return; }
  navigator.geolocation.getCurrentPosition(async pos=>{
    const {latitude, longitude} = pos.coords;
    try{
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
      const data = await res.json();
      if(data && data.current_weather){
        const w = data.current_weather;
        $('weather').textContent = `${Math.round(w.temperature)}°C • Wind ${Math.round(w.windspeed)} km/h`;
      } else { $('weather').textContent='Weather unavailable'; }
    } catch(err){ $('weather').textContent='Weather error'; }
  }, err=>{ $('weather').textContent='Weather denied'; });
}
updateWeather();

/* ----- Quotes & Facts (daily stable) ----- */
const QUOTES = [
  "Small daily improvements compound into big results.",
  "Focus on progress, not perfection.",
  "Start where you are. Use what you have. Do what you can.",
  "Your future self will thank you."
];
const FACTS = [
  "Honey never spoils.",
  "Octopuses have three hearts.",
  "Bananas are berries.",
  "A day on Venus is longer than its year."
];
function pickDaily(key, arr){
  const day = new Date().toISOString().slice(0,10);
  const stored = LOAD(key, null);
  if(stored && stored.day === day) return stored.value;
  const value = arr[Math.floor(Math.random()*arr.length)];
  SAVE(key, { day, value });
  return value;
}
$('quoteText').textContent = pickDaily('sh_quote', QUOTES);
$('factText').textContent = pickDaily('sh_fact', FACTS);
$('newFactBtn').addEventListener('click', ()=>{ localStorage.removeItem('sh_fact'); $('factText').textContent = pickDaily('sh_fact', FACTS); playSound('sClick'); });
$('newQuoteBtn').addEventListener('click', ()=>{ localStorage.removeItem('sh_quote'); $('quoteText').textContent = pickDaily('sh_quote', QUOTES); playSound('sClick'); });

/* ----- Notes ----- */
$('notesArea').value = appState.notes;
$('notesArea').addEventListener('input', e=>{
  localStorage.setItem('sh_notes', e.target.value);
  playSound('sClick');
});

/* ----- Todos ----- */
function renderTodos(){
  const ul = $('todoList'); ul.innerHTML = '';
  appState.todos.forEach((t,i)=>{
    const li = document.createElement('li');
    li.className = 'todo-item';
    const left = document.createElement('span'); left.textContent = t.text;
    if(t.done){ left.style.textDecoration='line-through'; left.style.opacity='0.7'; }
    const right = document.createElement('div');
    const doneBtn = document.createElement('button'); doneBtn.textContent = t.done ? 'Undo':'Done';
    const delBtn = document.createElement('button'); delBtn.textContent = 'Delete';
    doneBtn.onclick = ()=>{ appState.todos[i].done = !appState.todos[i].done; SAVE('sh_todos', appState.todos); renderTodos(); playSound('sClick'); };
    delBtn.onclick = ()=>{ appState.todos.splice(i,1); SAVE('sh_todos', appState.todos); renderTodos(); playSound('sClick'); };
    right.appendChild(doneBtn); right.appendChild(delBtn);
    li.appendChild(left); li.appendChild(right); ul.appendChild(li);
  });
}
$('addTodoBtn').addEventListener('click', ()=>{
  const t = $('todoText').value.trim(); if(!t) return;
  appState.todos.push({ text: t, done:false }); SAVE('sh_todos', appState.todos); $('todoText').value=''; renderTodos(); playSound('sClick');
});
$('todoText').addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); $('addTodoBtn').click(); } });
renderTodos();

/* ----- Theme & Settings ----- */
function applyTheme(name){
  document.documentElement.classList.remove('theme-space','theme-neon','theme-chill','theme-nature','theme-future');
  document.documentElement.classList.add('theme-'+name);
  localStorage.setItem('sh_theme', name);
}
$('themeSelect').value = appState.theme;
applyTheme(appState.theme);
$('themeSelect').addEventListener('change', e=>{ appState.theme = e.target.value; applyTheme(appState.theme); playSound('sClick'); });

$('soundToggle').checked = appState.soundEnabled;
$('soundToggle').addEventListener('change', e=>{ appState.soundEnabled = e.target.checked; localStorage.setItem('sh_sound', appState.soundEnabled); playSound('sClick'); });

$('musicToggle').checked = appState.musicEnabled;
$('musicToggle').addEventListener('change', e=>{ appState.musicEnabled = e.target.checked; localStorage.setItem('sh_music', appState.musicEnabled); if(appState.musicEnabled) startMusic(); else stopMusic(); playSound('sClick'); });

if(appState.autoDark){ $('autoDark').checked = true; autoDarkApply(); }
$('autoDark').addEventListener('change', e=>{ localStorage.setItem('sh_auto', e.target.checked); if(e.target.checked) autoDarkApply(); });

function autoDarkApply(){
  const h = new Date().getHours();
  if(h<6||h>=19) document.documentElement.style.colorScheme='dark'; else document.documentElement.style.colorScheme='light';
}

/* ----- Sounds (load placeholders if present) ----- */
/* Place sound files in assets/sounds/ e.g. click.mp3, complete.mp3 */
const soundFiles = {
  sClick: 'assets/sounds/click.mp3',
  sComplete: 'assets/sounds/complete.mp3'
};
for(const id in soundFiles){
  const el = document.getElementById(id);
  if(el) el.src = soundFiles[id];
}
function playSound(id){
  if(!appState.soundEnabled) return;
  const el = document.getElementById(id);
  if(!el) return;
  el.currentTime = 0;
  el.play().catch(()=>{/* user hasn't interacted yet */});
}

/* ----- Music Player (Option D) ----- */
/*
  How to use:
  - Put your royalty-free MP3 files into assets/music/
  - Update appState.playlist in localStorage or edit the default list
  - The player will pick a random track on start and loop it.
  - Next/Prev move through playlist (random start).
*/
const musicPlayer = $('musicPlayer');
let currentTrackIndex = 0;

function loadPlaylist(){
  const p = LOAD('sh_playlist', appState.playlist);
  appState.playlist = Array.isArray(p) ? p : appState.playlist;
  SAVE('sh_playlist', appState.playlist);
  // If playlist empty, do nothing (you must add files)
}
loadPlaylist();

function pickRandomTrack(){
  if(!appState.playlist.length) return null;
  return Math.floor(Math.random()*appState.playlist.length);
}

// start music (random start)
function startMusic(){
  if(!appState.playlist.length){ $('musicLabel').textContent = 'No tracks in playlist'; return; }
  if(currentTrackIndex === null || currentTrackIndex === undefined) currentTrackIndex = pickRandomTrack();
  musicPlayer.src = appState.playlist[currentTrackIndex];
  musicPlayer.loop = true;
  musicPlayer.play().then(()=>{ $('musicLabel').textContent = getTrackName(); }).catch(()=>{ /* autoplay blocked until user gesture */ $('musicLabel').textContent = getTrackName() + ' (tap Play)';});
}

function stopMusic(){ musicPlayer.pause(); $('musicLabel').textContent = 'Music stopped'; }

function nextMusic(){
  if(!appState.playlist.length) return;
  currentTrackIndex = (currentTrackIndex + 1) % appState.playlist.length;
  musicPlayer.src = appState.playlist[currentTrackIndex];
  if(appState.musicEnabled) musicPlayer.play();
  $('musicLabel').textContent = getTrackName();
}

function prevMusic(){
  if(!appState.playlist.length) return;
  currentTrackIndex = (currentTrackIndex - 1 + appState.playlist.length) % appState.playlist.length;
  musicPlayer.src = appState.playlist[currentTrackIndex];
  if(appState.musicEnabled) musicPlayer.play();
  $('musicLabel').textContent = getTrackName();
}

function getTrackName(){
  const src = appState.playlist[currentTrackIndex] || '';
  return src.split('/').pop();
}

$('musicPlay').addEventListener('click', ()=>{
  if(musicPlayer.paused){ musicPlayer.play().catch(()=>{}); $('musicPlay').textContent = '❚❚ Pause'; }
  else { musicPlayer.pause(); $('musicPlay').textContent = '▶ Play'; }
});
$('musicNext').addEventListener('click', ()=>{ nextMusic(); playSound('sClick'); });
$('musicPrev').addEventListener('click', ()=>{ prevMusic(); playSound('sClick'); });

// if music was enabled from previous session, start it (user gesture might be needed)
if(appState.musicEnabled) {
  // pick random start
  currentTrackIndex = pickRandomTrack();
  startMusic();
}

/* ----- Pomodoro ----- */
let pomInterval = null;
function secToStr(s){ const mm = String(Math.floor(s/60)).padStart(2,'0'); const ss = String(s%60).padStart(2,'0'); return `${mm}:${ss}`; }

$('workMinutes').value = appState.pomodoro.work;
$('breakMinutes').value = appState.pomodoro.break;
$('timer-display').textContent = secToStr(appState.pomodoro.remaining);

$('startBtn').addEventListener('click', ()=>{
  if(pomInterval) return;
  appState.pomodoro.running = true; SAVE('sh_pomodoro', appState.pomodoro);
  pomInterval = setInterval(()=>{
    appState.pomodoro.remaining--;
    if(appState.pomodoro.remaining <= 0){
      playSound('sComplete');
      if(appState.pomodoro.mode === 'work'){
        appState.pomodoro.mode = 'break';
        appState.pomodoro.remaining = appState.pomodoro.break * 60;
      } else {
        appState.pomodoro.mode = 'work';
        appState.pomodoro.remaining = appState.pomodoro.work * 60;
      }
    }
    $('timer-display').textContent = secToStr(appState.pomodoro.remaining);
    SAVE('sh_pomodoro', appState.pomodoro);
  },1000);
  playSound('sClick');
});
$('pauseBtn').addEventListener('click', ()=>{
  if(pomInterval){ clearInterval(pomInterval); pomInterval = null; appState.pomodoro.running=false; SAVE('sh_pomodoro', appState.pomodoro); playSound('sClick'); }
});
$('resetBtn').addEventListener('click', ()=>{
  clearInterval(pomInterval); pomInterval=null; appState.pomodoro.running=false; appState.pomodoro.mode='work'; appState.pomodoro.remaining = appState.pomodoro.work * 60; SAVE('sh_pomodoro', appState.pomodoro); $('timer-display').textContent = secToStr(appState.pomodoro.remaining); playSound('sClick');
});

$('workMinutes').addEventListener('change', e=>{ appState.pomodoro.work = Math.max(1, parseInt(e.target.value||25)); appState.pomodoro.remaining = appState.pomodoro.work*60; SAVE('sh_pomodoro', appState.pomodoro); $('timer-display').textContent = secToStr(appState.pomodoro.remaining); });
$('breakMinutes').addEventListener('change', e=>{ appState.pomodoro.break = Math.max(1, parseInt(e.target.value||5)); SAVE('sh_pomodoro', appState.pomodoro); });

/* ----- Onboarding (device selection) ----- */
const onboard = $('onboard');
function showOnboardIfNeeded(){
  const skip = localStorage.getItem('sh_onboardSkip') === 'true';
  if(appState.deviceType || skip) return;
  onboard.classList.remove('hidden');
}
$('btnMobile').addEventListener('click', ()=>{ appState.deviceType = 'mobile'; localStorage.setItem('sh_device','mobile'); if($('dontAsk').checked) localStorage.setItem('sh_onboardSkip','true'); onboard.classList.add('hidden'); applyDeviceLayout(); playSound('sClick'); });
$('btnDesktop').addEventListener('click', ()=>{ appState.deviceType = 'desktop'; localStorage.setItem('sh_device','desktop'); if($('dontAsk').checked) localStorage.setItem('sh_onboardSkip','true'); onboard.classList.add('hidden'); applyDeviceLayout(); playSound('sClick'); });

// if no device saved, try to detect mobile and show modal
if(!appState.deviceType){
  // naive detection
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  if(isMobile) { /* still ask; user may prefer desktop layout */ }
  showOnboardIfNeeded();
} else {
  applyDeviceLayout();
}
function applyDeviceLayout(){
  // you can tweak layout CSS based on device type — here we just set a class
  document.body.classList.toggle('is-mobile', appState.deviceType === 'mobile');
}

/* ----- Helper: tracklist management UI (optional) ----- */
/* Users can update playlist by editing localStorage key 'sh_playlist' (array of asset paths)
   or by replacing the default files in assets/music/. */

/* ----- Save on unload ----- */
window.addEventListener('beforeunload', ()=>{
  SAVE('sh_todos', appState.todos);
  localStorage.setItem('sh_notes', $('notesArea').value);
  SAVE('sh_pomodoro', appState.pomodoro);
  localStorage.setItem('sh_theme', appState.theme);
});

/* ----- Accessibility small helpers ----- */
document.addEventListener('keydown', e=>{
  if(e.key === ' ' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') e.preventDefault();
});
