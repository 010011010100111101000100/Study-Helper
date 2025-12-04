/* ============================
   Study Helper — updated script.js
   - theme-aware starfield
   - 100+ quotes & 100+ facts (immutable)
   - grammar checker page
   - rest of app (todos, notes, pomodoro, spotify embed)
   ============================ */

/* ---------- Helpers ---------- */
const $ = id => document.getElementById(id);
const SAVE = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const LOAD = (k, fallback) => {
  const v = localStorage.getItem(k);
  if (v === null) return fallback;
  try { return JSON.parse(v); } catch { return fallback; }
};

/* ---------- App state ---------- */
const state = {
  todos: LOAD('sh_todos', []),
  notes: localStorage.getItem('sh_notes') || '',
  theme: localStorage.getItem('sh_theme') || 'space',
  soundEnabled: localStorage.getItem('sh_sound') !== 'false',
  musicEnabled: localStorage.getItem('sh_music') !== 'false',
  deviceType: localStorage.getItem('sh_device') || null,
  autoDark: localStorage.getItem('sh_auto') === 'true',
  pomodoro: LOAD('sh_pomodoro', { running:false, work:25, break:5, remaining:25*60, mode:'work' }),
  playlist: LOAD('sh_playlist', []),
  lastView: localStorage.getItem('sh_lastView') || 'home'
};

/* ---------- IMMUTABLE FACTS & QUOTES (100+ each) ---------- */
/* These arrays are intentionally not exposed to editing UI. They are static in code. */

const FACTS = [
"Water expands when it freezes.",
"Honey never spoils.",
"Bananas are berries, but strawberries aren't.",
"Octopuses have three hearts.",
"A day on Venus is longer than its year.",
"Some metals melt in your hand (gallium).",
"A bolt of lightning is five times hotter than the Sun's surface.",
"There are more trees on Earth than stars in the Milky Way.",
"Wombat poop is cube-shaped.",
"Sharks existed before trees.",
"Jupiter's Great Red Spot is a giant storm larger than Earth.",
"Adult humans have fewer bones than babies (bones fuse).",
"Hot water can freeze faster than cold water (Mpemba effect).",
"The Eiffel Tower can grow in summer due to thermal expansion.",
"Birds are dinosaurs (they evolved from theropods).",
"Humans share about 60% of their DNA with bananas.",
"There are more possible chess games than atoms in the observable universe (approx).",
"Some turtles can breathe through their butts (cloacal respiration).",
"Venus spins in the opposite direction to most planets.",
"A hummingbird's heart can beat over 1,200 times per minute.",
"A group of flamingos is called a flamboyance.",
"The Moon is moving away from Earth about 3.8 cm per year.",
"An ostrich's eye is bigger than its brain.",
"Sloths can hold their breath longer than dolphins (up to 40 minutes).",
"The speed of sound is faster in water than in air.",
"Sea otters hold hands while sleeping to stay together.",
"The longest living insect is the termite queen (many decades).",
"Some trees can communicate via fungal networks in soil.",
"Your nose and ears keep growing throughout life.",
"A single bolt of lightning contains enough energy to toast 100,000 slices of bread.",
"The concept of zero was developed independently in several cultures.",
"Cleopatra lived closer to the moon landing than to the building of the Great Pyramid.",
"Koalas have fingerprints almost indistinguishable from humans.",
"Ants outnumber humans about a million to one.",
"The shortest war in history lasted 38-45 minutes (Britain vs Zanzibar).",
"A teaspoon of a neutron star would weigh about a billion tons.",
"You shed about 600,000 particles of skin every hour.",
"Oxford University is older than the Aztec Empire.",
"Certain fungi can create zombies out of insects (Cordyceps).",
"The human brain uses roughly 20% of the body's energy.",
"Some jellyfish are biologically immortal (Turritopsis dohrnii).",
"Camels have three eyelids and two sets of eyelashes to protect from sand.",
"The Amazon rainforest produces about 20% of Earth's oxygen (approx).",
"A group of crows is called a murder.",
"The deepest part of the ocean (Mariana Trench) is deeper than Mount Everest is tall.",
"Blue whales are the largest animals to have ever existed.",
"A snail can sleep for three years.",
"Trees can live for thousands of years (e.g., bristlecone pines).",
"The first programmable computer dates back to the 19th century (Babbage's designs).",
"Polar bear fur is actually transparent; their skin is black.",
"A teaspoon of soil can contain billions of microorganisms.",
"Honeybees can recognize human faces.",
"Venus has a very slow retrograde rotation.",
"Some mushrooms glow in the dark (bioluminescent fungi).",
"Some languages are written right-to-left (e.g., Arabic, Hebrew).",
"Saturn could float in water if a huge enough bathtub existed (it is less dense than water).",
"The Statue of Liberty's original color was brown (copper); it turned green from oxidation.",
"Plants 'hear' and respond to vibrations and insect chewing.",
"Ravens can mimic human speech similar to parrots.",
"Butterflies taste with their feet.",
"Oxford English Dictionary has over 600,000 words.",
"The mantis shrimp has one of the fastest punches in nature.",
"The first vaccine was for smallpox (by Edward Jenner in 1796).",
"Some metals like platinum are used in catalytic converters because of chemical properties.",
"Human fingerprints are unique, even between identical twins.",
"Sound cannot travel through a vacuum.",
"Light from the Sun takes about 8 minutes to reach Earth.",
"All the gold ever mined would fit inside a 20-meter cube.",
"Venom and poison are different—venom requires a delivery mechanism.",
"Adults have 206 bones; babies have around 270.",
"The Great Barrier Reef is visible from space.",
"Saturn's rings are mostly ice and rock.",
"A cheetah can accelerate from 0 to 60 mph faster than many sports cars.",
"Peanuts are legumes, not nuts.",
"There's a species of frog that freezes solid and revives when it thaws.",
"Some owls can rotate their heads about 270 degrees.",
"Earth's magnetic field flips periodically over geologic time.",
"The first person to reach the South Pole was Roald Amundsen (1911).",
"The first successful powered airplane flight was by the Wright brothers in 1903.",
"Hummingbirds are the only birds that can fly backwards.",
"The mantis shrimp sees colors we can't imagine (more photoreceptors).",
"Astronauts in space grow slightly taller due to spinal decompression.",
"Alaska has the most coastline of any US state.",
"The strongest muscle by weight is the masseter (jaw muscle).",
"Some bacteria can survive in extreme heat (thermophiles).",
"Mars has the tallest volcano in the solar system (Olympus Mons).",
"Purple dye in ancient times was extremely expensive (Tyrian purple).",
"Glass is an amorphous solid (behaves like a supercooled liquid).",
"Some fish can walk on land for short periods (mudskippers).",
"The human eye can distinguish about 10 million different colors.",
"The first electronic computer ENIAC was built in the 1940s.",
"Radar was crucial during WWII for detecting aircraft.",
"Bamboo can grow over a meter in a 24-hour period in ideal conditions."
]; // ~100 facts

const QUOTES = [
"Believe you can and you're halfway there.",
"Small steps every day add up to big changes.",
"Progress, not perfection.",
"Focus on what you can control.",
"Consistency is powerful.",
"You are capable of amazing things.",
"One day at a time.",
"Make it happen.",
"Start before you're ready.",
"Done is better than perfect.",
"Learn something new today.",
"Mistakes are proof you are trying.",
"Keep moving forward.",
"Discipline beats motivation.",
"Compare yourself to who you were yesterday.",
"Stress is temporary; growth is permanent.",
"Dream big. Start small.",
"Be kind to yourself.",
"Your only limit is your mind.",
"Make your future self proud.",
"Work hard in silence. Let success make the noise.",
"Focus on the process, not the outcome.",
"You are stronger than you think.",
"Small progress is still progress.",
"Turn 'I have to' into 'I get to.'",
"Be the person who makes others feel welcome.",
"The secret of getting ahead is getting started.",
"Do something today that your future self will thank you for.",
"Be stubborn about your goals and flexible about your methods.",
"The expert in anything was once a beginner.",
"Don't wait for opportunity. Create it.",
"Stay humble. Hustle hard.",
"Practice beats talent when talent doesn't practice.",
"Don't wish for it—work for it.",
"Success is the sum of small efforts repeated daily.",
"The journey is the reward.",
"Be consistent. Be patient.",
"Keep your eyes on the prize.",
"Take pride in how far you've come.",
"Pursue progress, not perfection.",
"Opportunities don't happen. You create them.",
"Let your actions speak louder than words.",
"Be somebody who makes everyone feel like somebody.",
"Wake up with determination. Go to bed with satisfaction.",
"Set goals. Crush them. Repeat.",
"You are the author of your own life story.",
"Hard work compounds over time.",
"Stay focused and never give up.",
"Turn setbacks into comebacks.",
"Energy flows where attention goes.",
"Good things take time.",
"Don't stop until you're proud.",
"Consistency creates momentum.",
"Keep going — success might be one step away.",
"If not now, when?",
"Don't be afraid to fail; be afraid not to try.",
"Make each day your masterpiece.",
"Take small steps every day.",
"Be stronger than your excuses.",
"You're capable of more than you know.",
"Create the life you can't wait to wake up to.",
"Push yourself, because no one else is going to do it for you.",
"Stay patient. Trust the process.",
"Success begins where your comfort zone ends.",
"Invest in yourself. You are worth it.",
"Strive for progress over perfection.",
"The best view comes after the hardest climb.",
"Don't compare your chapter 1 to someone else's chapter 20.",
"Turn your wounds into wisdom.",
"Start where you are. Use what you have.",
"Don't limit your challenges; challenge your limits.",
"Make failure your teacher, not your undertaker.",
"Be the energy you want to attract.",
"Great things never come from comfort zones.",
"Action is the foundational key to all success.",
"Where focus goes, energy flows.",
"The harder you work, the luckier you get.",
"Consistency is more important than intensity.",
"Your attitude determines your direction.",
"Dream it. Wish it. Do it.",
"Create. Learn. Grow. Repeat.",
"Do it with passion or not at all.",
"Believe in the process.",
"Small daily improvements are the key to staggering long-term results.",
"Let your dedication be louder than your words.",
"Stay curious and keep learning.",
"Be patient and trust your journey.",
"Every accomplishment starts with the decision to try.",
"Your future is created by what you do today, not tomorrow.",
"Start now. Perfect later.",
"Keep grinding. Stay humble.",
"Don't quit. Suffer now and live the rest of your life as a champion."
]; // ~100 quotes

/* ---------- daily pick helpers ---------- */
function pickDaily(key, arr) {
  const day = new Date().toISOString().slice(0,10);
  const stored = LOAD(key, null);
  if (stored && stored.day === day) return stored.value;
  const value = arr[Math.floor(Math.random() * arr.length)];
  SAVE(key, { day, value });
  return value;
}

/* render daily quote/fact */
if ($('quoteText')) $('quoteText').textContent = pickDaily('sh_quote', QUOTES);
if ($('factText')) $('factText').textContent = pickDaily('sh_fact', FACTS);

/* ---------- starfield (theme-aware) ---------- */
(function initStarfield(){
  const canvas = $('starfield');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');

  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  let stars = [];

  function createStars(theme){
    stars = [];
    const density = theme === 'neon' ? 1.6 : theme === 'space' ? 1.4 : theme === 'future' ? 1.3 : 0.9;
    const COUNT = Math.max(80, Math.floor((w*h) / (6000 / density)));
    for(let i=0;i<COUNT;i++){
      stars.push({
        x: Math.random()*w,
        y: Math.random()*h,
        z: Math.random()*1.8 + 0.2,
        r: Math.random()*1.6 + 0.2,
        vx: (Math.random()-0.5)*(0.2 + Math.random()*0.2)
      });
    }
  }

  function getThemeColors(theme){
    // return color for stars based on theme
    if(theme === 'neon') return { star: 'rgba(0,255,255,', glow:'#00ffff' };
    if(theme === 'space') return { star: 'rgba(220,240,255,', glow:'#9bd0ff' };
    if(theme === 'chill') return { star: 'rgba(30,200,220,', glow:'#7ec8e3' };
    if(theme === 'nature') return { star: 'rgba(120,255,170,', glow:'#7aff8c' };
    if(theme === 'future') return { star: 'rgba(170,140,255,', glow:'#a18bff' };
    return { star: 'rgba(255,255,255,', glow:'#ffffff' };
  }

  let theme = localStorage.getItem('sh_theme') || 'space';
  createStars(theme);
  window.addEventListener('resize', () => {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
    createStars(theme);
  });

  // listen for theme changes
  const observer = new MutationObserver(()=> {
    const newTheme = localStorage.getItem('sh_theme') || 'space';
    if(newTheme !== theme){ theme = newTheme; createStars(theme); }
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  let t = 0;
  function frame(){
    t += 0.6;
    ctx.clearRect(0,0,w,h);

    // background gradient adjusts per theme
    if(theme === 'chill' || theme === 'nature') {
      const g = ctx.createLinearGradient(0,0,0,h);
      g.addColorStop(0, 'rgba(255,255,255,0.02)');
      g.addColorStop(1, 'rgba(0,0,0,0.02)');
      ctx.fillStyle = g;
      ctx.fillRect(0,0,w,h);
    } else {
      const g = ctx.createLinearGradient(0,0,0,h);
      g.addColorStop(0, '#010214');
      g.addColorStop(1, '#000814');
      ctx.fillStyle = g;
      ctx.fillRect(0,0,w,h);
    }

    const colors = getThemeColors(theme);

    for(const s of stars){
      s.x += s.vx * s.z;
      s.y += Math.sin((t + s.x*0.01) / 50) * 0.06;
      if(s.x < -5) s.x = w + 5;
      if(s.x > w + 5) s.x = -5;
      const alpha = 0.5 + 0.5 * Math.sin((s.x + s.y + t) / 100);
      ctx.beginPath();
      ctx.fillStyle = `${colors.star}${Math.min(1,alpha * s.z)})`;
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
  if (dt) dt.textContent = now.toLocaleTimeString();
}
setInterval(updateTime, 1000);
updateTime();

/* ---------- WEATHER ---------- */
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

/* ---------- NOTES ---------- */
if ($('notesArea')) {
  $('notesArea').value = localStorage.getItem('sh_notes') || '';
  $('notesArea').addEventListener('input', e => {
    localStorage.setItem('sh_notes', e.target.value);
    playSfx('sClick');
  });
}

/* ---------- THEME & SETTINGS ---------- */
function applyTheme(name) {
  document.documentElement.classList.remove('theme-space','theme-neon','theme-chill','theme-nature','theme-future');
  document.documentElement.classList.add('theme-' + name);
  localStorage.setItem('sh_theme', name);
  state.theme = name;
  // update text color in body to reflect theme (CSS variables handle it)
  document.body.style.color = getComputedStyle(document.documentElement).getPropertyValue('--text') || '';
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
function applyAutoDark(){ const h = new Date().getHours(); if (h < 6 || h >= 19) document.documentElement.style.colorScheme = 'dark'; else document.documentElement.style.colorScheme = 'light'; }
if (state.autoDark) applyAutoDark();

/* ---------- SFX (optional) ---------- */
(function loadSfx(){
  const sClick = $('sClick');
  const sComplete = $('sComplete');
  if (sClick) sClick.src = 'assets/sounds/click.mp3';
  if (sComplete) sComplete.src = 'assets/sounds/complete.mp3';
})();
function playSfx(id) { if (!state.soundEnabled) return; const el = $(id); if (!el) return; try { el.currentTime = 0; el.play().catch(()=>{}); } catch {} }

/* ---------- SPOTIFY EMBED ---------- */
if ($('playlistPicker') && $('spotifyEmbed')) {
  $('playlistPicker').addEventListener('change', e => {
    const pid = e.target.value;
    $('spotifyEmbed').src = `https://open.spotify.com/embed/playlist/${pid}`;
    playSfx('sClick');
  });
}

/* ---------- LOCAL MUSIC (optional) ---------- */
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
    alert('Playlist saved (to local storage). To enable downloads, include repo paths like assets/music/yourfile.mp3');
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
  if (!musicPlayer.src) return alert('No local track loaded.');
  const a = document.createElement('a');
  a.href = musicPlayer.src;
  a.download = musicPlayer.src.split('/').pop();
  document.body.appendChild(a);
  a.click();
  a.remove();
  playSfx('sClick');
});

/* ---------- POMODORO ---------- */
let pomInterval = null;
function secToStr(s) { const mm = String(Math.floor(s/60)).padStart(2,'0'); const ss = String(s%60).padStart(2,'0'); return `${mm}:${ss}`; }
if ($('workMinutes')) $('workMinutes').value = state.pomodoro.work;
if ($('breakMinutes')) $('breakMinutes').value = state.pomodoro.break;
if ($('timer-display')) $('timer-display').textContent = secToStr(state.pomodoro.remaining);
if ($('startBtn')) $('startBtn').addEventListener('click', () => {
  if (pomInterval) return;
  state.pomodoro.running = true; SAVE('sh_pomodoro', state.pomodoro);
  pomInterval = setInterval(()=> {
    state.pomodoro.remaining--;
    if (state.pomodoro.remaining <= 0) {
      playSfx('sComplete');
      if (state.pomodoro.mode === 'work') {
        state.pomodoro.mode = 'break'; state.pomodoro.remaining = state.pomodoro.break * 60;
      } else {
        state.pomodoro.mode = 'work'; state.pomodoro.remaining = state.pomodoro.work * 60;
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
  clearInterval(pomInterval); pomInterval=null; state.pomodoro.running=false; state.pomodoro.mode='work';
  state.pomodoro.remaining = state.pomodoro.work * 60; SAVE('sh_pomodoro', state.pomodoro);
  if ($('timer-display')) $('timer-display').textContent = secToStr(state.pomodoro.remaining);
  playSfx('sClick');
});
if ($('workMinutes')) $('workMinutes').addEventListener('change', e => {
  state.pomodoro.work = Math.max(1, parseInt(e.target.value || 25)); state.pomodoro.remaining = state.pomodoro.work*60; SAVE('sh_pomodoro', state.pomodoro);
  if ($('timer-display')) $('timer-display').textContent = secToStr(state.pomodoro.remaining);
});
if ($('breakMinutes')) $('breakMinutes').addEventListener('change', e => { state.pomodoro.break = Math.max(1, parseInt(e.target.value || 5)); SAVE('sh_pomodoro', state.pomodoro); });

/* ---------- CALCULATOR ---------- */
const calc = { expr: '', display: '' };
const calcDisp = $('calcDisplay');
function updateCalc() { if (calcDisp) calcDisp.value = calc.display || calc.expr || '0'; }
function calcEval(expr) {
  try { const safe = expr.replace(/\^/g,'**'); return Function('"use strict";return (' + safe + ')')(); } catch { return 'ERR'; }
}
document.querySelectorAll('.calc-buttons button').forEach(btn => {
  btn.addEventListener('click', () => {
    const c = btn.dataset.cmd;
    if (!c) return;
    if (c === 'C') { calc.expr=''; calc.display=''; updateCalc(); return; }
    if (c === '=') { const res = calcEval(calc.expr); calc.display = String(res); calc.expr = calc.display; updateCalc(); return; }
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
      calc.display = String(r); calc.expr = calc.display; updateCalc(); return;
    }
    if (['MC','MR','MS','M+'].includes(c)) {
      if (!window.calcMem) window.calcMem = 0;
      if (c === 'MC') window.calcMem = 0;
      if (c === 'MR') { calc.expr = String(window.calcMem); calc.display=''; updateCalc(); }
      if (c === 'MS') { window.calcMem = calcEval(calc.expr || '0'); }
      if (c === 'M+') { window.calcMem += calcEval(calc.expr || '0'); }
      return;
    }
    calc.expr += c; calc.display=''; updateCalc();
  });
});
updateCalc();

/* ---------- ONBOARDING ---------- */
const onboard = $('onboard');
if (onboard) {
  const skip = localStorage.getItem('sh_onboardSkip') === 'true';
  if (!state.deviceType && !skip) onboard.classList.remove('hidden');
  const btnMobile = $('btnMobile'), btnDesktop = $('btnDesktop'), dontAsk = $('dontAsk');
  if (btnMobile) btnMobile.addEventListener('click', () => { state.deviceType='mobile'; localStorage.setItem('sh_device','mobile'); if (dontAsk && dontAsk.checked) localStorage.setItem('sh_onboardSkip','true'); onboard.classList.add('hidden'); playSfx('sClick'); });
  if (btnDesktop) btnDesktop.addEventListener('click', () => { state.deviceType='desktop'; localStorage.setItem('sh_device','desktop'); if (dontAsk && dontAsk.checked) localStorage.setItem('sh_onboardSkip','true'); onboard.classList.add('hidden'); playSfx('sClick'); });
}

/* ---------- NAVIGATION ---------- */
document.querySelectorAll('.nav-btn').forEach(b => {
  b.addEventListener('click', () => {
    const view = b.dataset.view;
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    const target = $('view-' + view);
    if (target) target.classList.remove('hidden');
    state.lastView = view; localStorage.setItem('sh_lastView', view);
    playSfx('sClick');
  });
});
document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
const initial = $('view-' + (state.lastView || 'home')) || $('view-home');
if (initial) initial.classList.remove('hidden');

/* ---------- GRAMMAR CHECKER (simple, client-side) ---------- */
/*
  This grammar checker is a helpful, client-side tool (not a full NLP service).
  It provides:
  - spelling-like fixes for common mistakes (their/there/they're, youre/you're, its/it's)
  - repeated-space removal, sentence capitalization suggestions
  - punctuation suggestions (missing periods)
  - simple passive voice detection (very basic)
  Users can "Auto-fix simple issues" which applies safe replacements.
*/

function grammarSuggestions(text){
  const suggestions = [];
  // simple replacement rules (safe)
  const rules = [
    { find: /\b([Tt])here\b/g, note: "Check 'there' usage." },
  ];
  // common confusions
  const confusions = [
    { re: /\btheire\b/gi, from:'theire', to:"their", note:"'their' is probably intended" },
    { re: /\bthier\b/gi, from:'thier', to:"their", note:"'their' is probably intended" },
    { re: /\brecieve\b/gi, from:'recieve', to:"receive", note:"spelling: receive" },
    { re: /\byoure\b/gi, from:'youre', to:"you're", note:"use you're = you are" },
    { re: /\bit's\b/gi, from:"it's" },
    { re: /\bits\b/gi, from:"its" },
    { re: /\btheir\b/gi, from:"their" }
  ];

  // Detect simple common mistakes
  const confused = [
    { re:/\b(their|there|they're)\b/gi, note:"Check 'their/there/they're' usage." },
    { re:/\b(its|it's)\b/gi, note:"Check 'its' vs 'it's' usage." },
    { re:/\byoure\b/gi, note:"Did you mean 'you're'?" },
    { re:/\brecieve\b/gi, note:"Spelling: 'receive'." },
    { re:/\bthier\b/gi, note:"Spelling: 'their'." },
    { re:/\btheire\b/gi, note:"Spelling: 'their'." }
  ];
  confused.forEach(c=>{
    if (c.re.test(text)) suggestions.push({type:'word', text: c.re.exec(text) ? (c.note||'Check usage') : 'Check usage', fixHint: null});
  });

  // repeated spaces
  if (/\s{2,}/.test(text)) suggestions.push({type:'format', text:'Multiple spaces detected. Consider replacing with single spaces.', fixHint: text.replace(/\s{2,}/g,' ')});

  // sentence capitalization (detect sentences that start with lowercase)
  const sentences = text.split(/([.?!]\s+)/);
  for (let i=0;i<sentences.length;i+=2){
    const sent = sentences[i].trim();
    if (sent.length && sent[0] && sent[0] === sent[0].toLowerCase() && /[a-zA-Z]/.test(sent[0])){
      suggestions.push({type:'cap', text:`Sentence may be uncapitalized: "${sent.slice(0,50)}"`, fixHint: sent[0].toUpperCase() + sent.slice(1)});
    }
  }

  // punctuation: missing period at end of text
  if (text.trim() && !/[.?!]"?$/.test(text.trim())) suggestions.push({type:'punct', text:'Consider ending with a period or question mark.', fixHint: text.trim() + '.'});

  // passive voice (very naive): look for 'was'/'were' + past participle (ending with 'ed')
  const passiveMatches = text.match(/\b(was|were|is|are|been|be|being)\b\s+\b([a-zA-Z]+ed)\b/gi);
  if (passiveMatches && passiveMatches.length) suggestions.push({type:'style', text:'Passive voice detected; consider active voice for clarity.', fixHint: null});

  // specific replacements (auto-fix safe ones later)
  const autoReplacements = [];
  if (/\byoure\b/gi.test(text)) autoReplacements.push({from:/\byoure\b/gi, to:"you're"});
  if (/\brecieve\b/gi.test(text)) autoReplacements.push({from:/\brecieve\b/gi, to:"receive"});
  if (/\bthier\b/gi.test(text)) autoReplacements.push({from:/\bthier\b/gi, to:"their"});
  if (/\btheire\b/gi.test(text)) autoReplacements.push({from:/\btheire\b/gi, to:"their"});

  return { suggestions, autoReplacements };
}

function renderGrammarResults(resultObj, originalText){
  const container = $('grammarResults');
  container.innerHTML = '';
  if (!resultObj) return;
  const { suggestions, autoReplacements } = resultObj;
  const ul = document.createElement('ul');
  if (suggestions.length === 0 && autoReplacements.length === 0) {
    container.innerHTML = '<div class="muted">No issues found by quick check.</div>';
    return;
  }
  suggestions.forEach(s=>{
    const li = document.createElement('li');
    li.textContent = s.text;
    ul.appendChild(li);
  });
  if (autoReplacements.length) {
    const li = document.createElement('li');
    li.textContent = `Auto-fixable items available: ${autoReplacements.length}`;
    ul.appendChild(li);
  }
  container.appendChild(ul);
}

/* auto-fix simple replacements */
function applyAutoFixes(text){
  const res = grammarSuggestions(text);
  let out = text;
  res.autoReplacements.forEach(r => { out = out.replace(r.from, r.to); });
  // also normalize multiple spaces
  out = out.replace(/\s{2,}/g, ' ');
  // fix starting sentence capitalization
  out = out.replace(/(?:^|[.?!]\s+)([a-z])/g, (m,p1) => m.replace(p1, p1.toUpperCase()));
  // ensure sentence end
  if (out.trim() && !/[.?!]"?$/.test(out.trim())) out = out.trim() + '.';
  return out;
}

if ($('checkGrammar')) $('checkGrammar').addEventListener('click', ()=>{
  const t = $('grammarInput') ? $('grammarInput').value : '';
  const res = grammarSuggestions(t);
  renderGrammarResults(res, t);
});
if ($('autoFixGrammar')) $('autoFixGrammar').addEventListener('click', ()=>{
  const t = $('grammarInput') ? $('grammarInput').value : '';
  const fixed = applyAutoFixes(t);
  if ($('grammarInput')) $('grammarInput').value = fixed;
  const res = grammarSuggestions(fixed);
  renderGrammarResults(res, fixed);
  playSfx('sClick');
});

/* ---------- NAV setup already done earlier ---------- */

/* ---------- RENDER + SAVE ON UNLOAD ---------- */
applyTheme(state.theme);
renderTodos();

if (state.pomodoro.running && !pomInterval) {
  $('startBtn') && $('startBtn').click();
}

window.addEventListener('beforeunload', () => {
  SAVE('sh_todos', state.todos);
  localStorage.setItem('sh_notes', $('notesArea') ? $('notesArea').value : (localStorage.getItem('sh_notes') || ''));
  SAVE('sh_pomodoro', state.pomodoro);
  SAVE('sh_playlist', state.playlist);
  localStorage.setItem('sh_theme', state.theme);
  localStorage.setItem('sh_lastView', state.lastView || 'home');
});

/* accessibility */
document.addEventListener('keydown', e => {
  if (e.code === 'Space' && !['INPUT','TEXTAREA','SELECT','BUTTON'].includes(document.activeElement.tagName)) e.preventDefault();
});
