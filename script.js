/* ============================
   Study Helper — script.js
   - Starfield background
   - Onboarding (device)
   - Spotify embed selector
   - Todos, Notes (localStorage)
   - Pomodoro (localStorage)
   - Settings & themes (localStorage)
   - Scientific calculator
   - Sound effects + optional local music
   ============================ */

/* ---------- Helpers ---------- */
const $ = id => document.getElementById(id);
const SAVE = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const LOAD = (k, fallback) => {
  const v = localStorage.getItem(k);
  if (v === null) return fallback;
  try { return JSON.parse(v); } catch { return fallback; }
};

/* ---------- App state (persisted) ---------- */
const state = {
  todos: LOAD('sh_todos', []),
  notes: localStorage.getItem('sh_notes') || '',
  theme: localStorage.getItem('sh_theme') || 'space',
  soundEnabled: localStorage.getItem('sh_sound') !== 'false',
  musicEnabled: localStorage.getItem('sh_music') !== 'false',
  deviceType: localStorage.getItem('sh_device') || null,
  autoDark: localStorage.getItem('sh_auto') === 'true',
  pomodoro: LOAD('sh_pomodoro', { running:false, work:25, break:5, remaining:25*60, mode:'work' }),
  // Optional local playlist (you can paste paths in Settings -> Playlist)
  playlist: LOAD('sh_playlist', []),
  lastView: localStorage.getItem('sh_lastView') || 'home'
};

/* ---------- STARFIELD CANVAS ---------- */
(function initStarfield(){
  const canvas = $('starfield');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  let stars = [];
  let COUNT = Math.max(80, Math.floor((w*h) / 6000));

  function createStars(){
    stars = [];
    COUNT = Math.max(80, Math.floor((w*h) / 6000));
    for(let i=0;i<COUNT;i++){
      stars.push({
        x: Math.random()*w,
        y: Math.random()*h,
        z: Math.random()*1.6 + 0.2,
        r: Math.random()*1.6 + 0.2,
        vx: (Math.random()-0.5)*0.2
      });
    }
  }
  createStars();
  window.addEventListener('resize', () => {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
    createStars();
  });

  let t = 0;
  function frame(){
    t += 0.5;
    ctx.clearRect(0,0,w,h);
    // subtle gradient
    const g = ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0, '#020217');
    g.addColorStop(1, '#000814');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

    for(const s of stars){
      s.x += s.vx * s.z;
      // slight vertical bob
      s.y += Math.sin((t + s.x*0.01) / 50) * 0.05;
      if(s.x < -5) s.x = w + 5;
      if(s.x > w + 5) s.x = -5;
      const alpha = 0.6 + 0.4 * Math.sin((s.x + s.y + t) / 100);
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${alpha * s.z})`;
      ctx.arc(s.x, s.y, Math.max(0.4, s.r * s.z), 0, Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  frame();
})();

/* ---------- DATE & TIME ---------- */
function updateTime() {
  const now = new Date();
  const dt = $('dateTime');
  if (dt) dt.textContent = now.toLocaleString();
}
setInterval(updateTime, 1000);
updateTime();

/* ---------- WEATHER (open-meteo) ---------- */
async function updateWeather() {
  const el = $('weather');
  if (!el) return;
  if (!navigator.geolocation) { el.textContent = 'Location not available'; return; }
  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude, longitude } = pos.coords;
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
      const data = await res.json();
      if (data && data.current_weather) {
        const w = data.current_weather;
        el.textContent = `${Math.round(w.temperature)}°C • Wind ${Math.round(w.windspeed)} km/h`;
      } else el.textContent = 'Weather unavailable';
    } catch (e) {
      el.textContent = 'Weather error';
    }
  }, err => {
    el.textContent = 'Weather denied';
  });
}
updateWeather();

/* ---------- QUOTES & FACTS (stable per day) ---------- */
const QUOTES = [
  "Small daily improvements compound into big results.",
  "Focus on progress, not perfection.",
  "Start where you are. Use what you have. Do what you can.",
  "Your future self will thank you.",
  "Consistency beats intensity over time.",
  "Take breaks — your brain needs them.",
  "Make today your masterpiece."
];

const FACTS = [
  "Honey never spoils.",
  "Octopuses have three hearts.",
  "Bananas are berries.",
  "A day on Venus is longer than its year.",
  "A bolt of lightning is five times hotter than the Sun's surface.",
  "There are more stars in the universe than grains of sand on Earth.",
  "Wombat poop is cube-shaped.",
  "Some turtles can breathe through their cloaca (a bit like breathing through their rear)."
];

function pickDaily(key, arr) {
  const day = new Date().toISOString().slice(0,10);
  const stored = LOAD(key, null);
  if (stored && stored.day === day) return stored.value;
  const value = arr[Math.floor(Math.random() * arr.length)];
  SAVE(key, { day, value });
  return value;
}

if ($('quoteText')) $('quoteText').textContent = pickDaily('sh_quote', QUOTES);
if ($('factText')) $('factText').textContent = pickDaily('sh_fact', FACTS);

if ($('newFactBtn')) $('newFactBtn').addEventListener('click', () => {
  localStorage.removeItem('sh_fact');
  if ($('factText')) $('factText').textContent = pickDaily('sh_fact', FACTS);
  playSfx('sClick');
});
if ($('newQuoteBtn')) $('newQuoteBtn').addEventListener('click', () => {
  localStorage.removeItem('sh_quote');
  if ($('quoteText')) $('quoteText').textContent = pickDaily('sh_quote', QUOTES);
  playSfx('sClick');
});

/* ---------- NOTES ---------- */
if ($('notesArea')) {
  $('notesArea').value = localStorage.getItem('sh_notes') || '';
  $('notesArea').addEventListener('input', e => {
    localStorage.setItem('sh_notes', e.target.value);
    playSfx('sClick');
  });
}

/* ---------- TODOS ---------- */
function renderTodos() {
  const ul = $('todoList');
  if(!ul) return;
  ul.innerHTML = '';
  state.todos.forEach((t, i) => {
    const li = document.createElement('li');
    li.className = 'todo-item';
    const left = document.createElement('span');
    left.textContent = t.text;
    if (t.done) { left.style.textDecoration = 'line-through'; left.style.opacity = '0.7'; }

    const right = document.createElement('div');
    const doneBtn = document.createElement('button');
    doneBtn.textContent = t.done ? 'Undo' : 'Done';
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';

    doneBtn.onclick = () => {
      state.todos[i].done = !state.todos[i].done;
      SAVE('sh_todos', state.todos);
      renderTodos();
      playSfx('sClick');
    };
    delBtn.onclick = () => {
      state.todos.splice(i, 1);
      SAVE('sh_todos', state.todos);
      renderTodos();
      playSfx('sClick');
    };

    right.appendChild(doneBtn);
    right.appendChild(delBtn);
    li.appendChild(left);
    li.appendChild(right);
    ul.appendChild(li);
  });
}

if ($('addTodoBtn')) $('addTodoBtn').addEventListener('click', () => {
  const text = ($('todoText') && $('todoText').value.trim()) || '';
  if (!text) return;
  state.todos.push({ text, done:false });
  SAVE('sh_todos', state.todos);
  if ($('todoText')) $('todoText').value = '';
  renderTodos();
  playSfx('sClick');
});
if ($('todoText')) $('todoText').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); if ($('addTodoBtn')) $('addTodoBtn').click(); }
});
renderTodos();

/* ---------- THEME & SETTINGS ---------- */
function applyTheme(name) {
  // remove all theme classes on root
  document.documentElement.classList.remove('theme-space','theme-neon','theme-chill','theme-nature','theme-future');
  document.documentElement.classList.add('theme-' + name);
  localStorage.setItem('sh_theme', name);
  state.theme = name;
}
if ($('themeSelect')) {
  $('themeSelect').value = state.theme;
  applyTheme(state.theme);
  $('themeSelect').addEventListener('change', e => {
    applyTheme(e.target.value);
    SAVE('sh_theme', e.target.value);
    playSfx('sClick');
  });
}
if ($('soundToggle')) {
  $('soundToggle').checked = state.soundEnabled;
  $('soundToggle').addEventListener('change', e => {
    state.soundEnabled = e.target.checked;
    localStorage.setItem('sh_sound', state.soundEnabled);
    playSfx('sClick');
  });
}
if ($('musicToggle')) {
  $('musicToggle').checked = state.musicEnabled;
  $('musicToggle').addEventListener('change', e => {
    state.musicEnabled = e.target.checked;
    localStorage.setItem('sh_music', state.musicEnabled);
    // note: local music is optional; Spotify embed unaffected
    playSfx('sClick');
  });
}
if ($('autoDark')) {
  $('autoDark').checked = state.autoDark;
  $('autoDark').addEventListener('change', e => {
    state.autoDark = e.target.checked;
    localStorage.setItem('sh_auto', state.autoDark);
    if (state.autoDark) applyAutoDark();
    playSfx('sClick');
  });
}
function applyAutoDark(){
  const h = new Date().getHours();
  if (h < 6 || h >= 19) document.documentElement.style.colorScheme = 'dark';
  else document.documentElement.style.colorScheme = 'light';
}
if (state.autoDark) applyAutoDark();

/* ---------- SFX (load if available) ---------- */
/*
  Add short mp3 files:
   - assets/sounds/click.mp3  -> loaded into #sClick
   - assets/sounds/complete.mp3 -> loaded into #sComplete
  If you don't add files, playSfx will safely ignore.
*/
(function loadSfx(){
  const sClick = $('sClick');
  const sComplete = $('sComplete');
  if (sClick) sClick.src = 'assets/sounds/click.mp3';
  if (sComplete) sComplete.src = 'assets/sounds/complete.mp3';
})();
function playSfx(id) {
  if (!state.soundEnabled) return;
  const el = $(id);
  if (!el) return;
  try { el.currentTime = 0; el.play().catch(()=>{}); } catch {}
}

/* ---------- SPOTIFY EMBED (selector) ---------- */
if ($('playlistPicker') && $('spotifyEmbed')) {
  $('playlistPicker').addEventListener('change', e => {
    const pid = e.target.value;
    $('spotifyEmbed').src = `https://open.spotify.com/embed/playlist/${pid}`;
    playSfx('sClick');
  });
}

/* ---------- LOCAL MUSIC PLAYER (optional) ----------
   This app primarily uses Spotify embed for streaming.
   If you want to support local MP3 loops and downloads, you can set
   state.playlist to an array of local paths (e.g. assets/music/lofi1.mp3)
   via the settings textarea (handled below).
----------------------------------------------- */
const musicPlayer = $('musicPlayer');
let trackIndex = 0;

function loadPlaylistFromInput() {
  const raw = ($('playlistInput') && $('playlistInput').value.trim()) || '';
  if (!raw) return;
  const arr = raw.split(',').map(s => s.trim()).filter(Boolean);
  if (arr.length) {
    state.playlist = arr;
    SAVE('sh_playlist', state.playlist);
  }
}
if ($('savePlaylist')) {
  $('savePlaylist').addEventListener('click', () => {
    loadPlaylistFromInput();
    playSfx('sClick');
    alert('Playlist saved (to local storage). If you want downloads, include repo paths like assets/music/yourfile.mp3');
  });
}

function loadTrack(i) {
  if (!musicPlayer) return;
  if (!Array.isArray(state.playlist) || state.playlist.length === 0) {
    musicPlayer.src = '';
    if ($('musicLabel')) $('musicLabel').textContent = 'No local tracks';
    return;
  }
  trackIndex = ((i % state.playlist.length) + state.playlist.length) % state.playlist.length;
  const src = state.playlist[trackIndex];
  musicPlayer.src = src;
  if ($('musicLabel')) $('musicLabel').textContent = src.split('/').pop();
}
if ($('musicNext')) $('musicNext').addEventListener('click', () => { loadTrack(trackIndex+1); playSfx('sClick'); if (musicPlayer && state.musicEnabled) musicPlayer.play().catch(()=>{}); });
if ($('musicPrev')) $('musicPrev').addEventListener('click', () => { loadTrack(trackIndex-1); playSfx('sClick'); if (musicPlayer && state.musicEnabled) musicPlayer.play().catch(()=>{}); });
if ($('musicPlay')) $('musicPlay').addEventListener('click', () => {
  if (!musicPlayer.src) loadTrack(trackIndex);
  if (musicPlayer.paused) { musicPlayer.play().then(()=>{ $('musicPlay').textContent = '❚❚'; }).catch(()=>{ alert('Tap to allow audio (browser autoplay rules).'); }); }
  else { musicPlayer.pause(); $('musicPlay').textContent = '▶'; }
  playSfx('sClick');
});
if ($('musicDownload')) $('musicDownload').addEventListener('click', () => {
  if (!musicPlayer.src) return alert('No local track loaded. Put files into assets/music/ or paste public URLs into Settings -> Playlist.');
  const a = document.createElement('a');
  a.href = musicPlayer.src;
  a.download = musicPlayer.src.split('/').pop();
  document.body.appendChild(a);
  a.click();
  a.remove();
  playSfx('sClick');
});

/* ---------- POMODORO TIMER ---------- */
let pomInterval = null;
function secToStr(s) {
  const mm = String(Math.floor(s/60)).padStart(2,'0');
  const ss = String(s%60).padStart(2,'0');
  return `${mm}:${ss}`;
}
if ($('workMinutes')) $('workMinutes').value = state.pomodoro.work;
if ($('breakMinutes')) $('breakMinutes').value = state.pomodoro.break;
if ($('timer-display')) $('timer-display').textContent = secToStr(state.pomodoro.remaining);

function savePom() { SAVE('sh_pomodoro', state.pomodoro); }

if ($('startBtn')) $('startBtn').addEventListener('click', () => {
  if (pomInterval) return;
  state.pomodoro.running = true;
  SAVE('sh_pomodoro', state.pomodoro);
  pomInterval = setInterval(() => {
    state.pomodoro.remaining--;
    if (state.pomodoro.remaining <= 0) {
      playSfx('sComplete');
      if (state.pomodoro.mode === 'work') {
        state.pomodoro.mode = 'break';
        state.pomodoro.remaining = state.pomodoro.break * 60;
      } else {
        state.pomodoro.mode = 'work';
        state.pomodoro.remaining = state.pomodoro.work * 60;
      }
    }
    if ($('timer-display')) $('timer-display').textContent = secToStr(state.pomodoro.remaining);
    SAVE('sh_pomodoro', state.pomodoro);
  }, 1000);
  playSfx('sClick');
});

if ($('pauseBtn')) $('pauseBtn').addEventListener('click', () => {
  if (pomInterval) { clearInterval(pomInterval); pomInterval = null; state.pomodoro.running = false; SAVE('sh_pomodoro', state.pomodoro); playSfx('sClick'); }
});
if ($('resetBtn')) $('resetBtn').addEventListener('click', () => {
  clearInterval(pomInterval); pomInterval = null; state.pomodoro.running = false; state.pomodoro.mode = 'work';
  state.pomodoro.remaining = state.pomodoro.work * 60;
  SAVE('sh_pomodoro', state.pomodoro);
  if ($('timer-display')) $('timer-display').textContent = secToStr(state.pomodoro.remaining);
  playSfx('sClick');
});
if ($('workMinutes')) $('workMinutes').addEventListener('change', e => {
  state.pomodoro.work = Math.max(1, parseInt(e.target.value || 25));
  state.pomodoro.remaining = state.pomodoro.work * 60;
  SAVE('sh_pomodoro', state.pomodoro);
  if ($('timer-display')) $('timer-display').textContent = secToStr(state.pomodoro.remaining);
});
if ($('breakMinutes')) $('breakMinutes').addEventListener('change', e => {
  state.pomodoro.break = Math.max(1, parseInt(e.target.value || 5));
  SAVE('sh_pomodoro', state.pomodoro);
});

/* ---------- CALCULATOR ---------- */
/* Simple scientific calculator: builds expression string, evaluates with Function() after replacing ^ with ** */
const calc = { expr: '', display: '' };
const calcDisp = $('calcDisplay');
function updateCalc() { if (calcDisp) calcDisp.value = calc.display || calc.expr || '0'; }
function calcEval(expr) {
  try {
    const safe = expr.replace(/\^/g, '**');
    // Very basic safety: allow digits, operators, parentheses, dot, e, letters for functions
    // We still use Function() for convenience; don't evaluate untrusted input outside calculator.
    // Evaluate:
    // eslint-disable-next-line no-new-func
    return Function('"use strict";return (' + safe + ')')();
  } catch {
    return 'ERR';
  }
}
document.querySelectorAll('.calc-buttons button').forEach(btn => {
  btn.addEventListener('click', () => {
    const c = btn.dataset.cmd;
    if (!c) return;
    if (c === 'C') { calc.expr = ''; calc.display = ''; updateCalc(); return; }
    if (c === '=') {
      const res = calcEval(calc.expr);
      calc.display = String(res);
      calc.expr = calc.display;
      updateCalc();
      return;
    }
    if (['sin','cos','tan','sqrt','ln','log'].includes(c)) {
      if (!calc.expr) return;
      const v = calcEval(calc.expr);
      let r = NaN;
      if (c === 'sin') r = Math.sin(v);
      if (c === 'cos') r = Math.cos(v);
      if (c === 'tan') r = Math.tan(v);
      if (c === 'sqrt') r = Math.sqrt(v);
      if (c === 'ln') r = Math.log(v);
      if (c === 'log') r = Math.log10 ? Math.log10(v) : Math.log(v) / Math.LN10;
      calc.display = String(r);
      calc.expr = calc.display;
      updateCalc();
      return;
    }
    if (['MC','MR','MS','M+'].includes(c)) {
      // memory operations (simple)
      if (!window.calcMem) window.calcMem = 0;
      if (c === 'MC') window.calcMem = 0;
      if (c === 'MR') { calc.expr = String(window.calcMem); calc.display = ''; updateCalc(); }
      if (c === 'MS') { window.calcMem = calcEval(calc.expr || '0'); }
      if (c === 'M+') { window.calcMem += calcEval(calc.expr || '0'); }
      return;
    }
    // digits & operators
    calc.expr += c;
    calc.display = '';
    updateCalc();
  });
});
updateCalc();

/* ---------- ONBOARDING (device) ---------- */
const onboard = $('onboard');
if (onboard) {
  const skip = localStorage.getItem('sh_onboardSkip') === 'true';
  if (!state.deviceType && !skip) onboard.classList.remove('hidden');
  const btnMobile = $('btnMobile'), btnDesktop = $('btnDesktop'), dontAsk = $('dontAsk');
  if (btnMobile) btnMobile.addEventListener('click', () => {
    state.deviceType = 'mobile';
    localStorage.setItem('sh_device', 'mobile');
    if (dontAsk && dontAsk.checked) localStorage.setItem('sh_onboardSkip', 'true');
    onboard.classList.add('hidden');
    playSfx('sClick');
  });
  if (btnDesktop) btnDesktop.addEventListener('click', () => {
    state.deviceType = 'desktop';
    localStorage.setItem('sh_device', 'desktop');
    if (dontAsk && dontAsk.checked) localStorage.setItem('sh_onboardSkip', 'true');
    onboard.classList.add('hidden');
    playSfx('sClick');
  });
}

/* ---------- NAVIGATION between views ---------- */
document.querySelectorAll('.nav-btn').forEach(b => {
  b.addEventListener('click', () => {
    const view = b.dataset.view;
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    const target = $('view-' + view);
    if (target) target.classList.remove('hidden');
    state.lastView = view;
    localStorage.setItem('sh_lastView', view);
    playSfx('sClick');
  });
});
// restore last view
document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
const lastView = state.lastView || 'home';
const initial = $('view-' + lastView) || $('view-home');
if (initial) initial.classList.remove('hidden');

/* ---------- RENDER INITIAL UI ---------- */
// set theme classes on load
applyTheme(state.theme);

// notes already connected earlier
renderTodos();

// restore pomodoro running if applicable (will not run while closed)
if (state.pomodoro.running) {
  // start interval (will continue for as long as the page is open)
  if (!pomInterval) {
    $('startBtn') && $('startBtn').click();
  }
}

/* ---------- SAVE ON UNLOAD ---------- */
window.addEventListener('beforeunload', () => {
  SAVE('sh_todos', state.todos);
  localStorage.setItem('sh_notes', $('notesArea') ? $('notesArea').value : (localStorage.getItem('sh_notes') || ''));
  SAVE('sh_pomodoro', state.pomodoro);
  SAVE('sh_playlist', state.playlist);
  localStorage.setItem('sh_theme', state.theme);
  localStorage.setItem('sh_lastView', state.lastView || 'home');
});

/* ---------- SMALL HELPERS ---------- */
// simple accessibility: stop spacebar scroll when not typing
document.addEventListener('keydown', e => {
  if (e.code === 'Space' && !['INPUT','TEXTAREA','SELECT','BUTTON'].includes(document.activeElement.tagName)) {
    e.preventDefault();
  }
});
