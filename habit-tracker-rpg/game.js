const STORAGE_KEY = 'sao_habit_tracker_v4';
const OLD_KEY_V3  = 'sao_habit_tracker_v3';

// ============================================================
// SOUND ENGINE — Final Fantasy X inspired
// ============================================================
const _ACtx = window.AudioContext || window.webkitAudioContext;
let _actx = null, soundEnabled = true;
function _getCtx() {
  if (!_actx) _actx = new _ACtx();
  if (_actx.state === 'suspended') _actx.resume();
  return _actx;
}
function toggleSound() { soundEnabled = !soundEnabled; const b = document.getElementById('soundToggle'); if(b){ b.textContent = soundEnabled ? '🔊' : '🔇'; b.classList.toggle('muted', !soundEnabled); } }

// Mobile audio unlock — iOS Safari requires a silent buffer played synchronously
// during the user gesture; playing it inside .then() is too late (async context)
function _unlockAudio() {
  if (!_ACtx) return;
  if (!_actx) _actx = new _ACtx();
  try {
    const buf = _actx.createBuffer(1, 1, 22050);
    const src = _actx.createBufferSource();
    src.buffer = buf; src.connect(_actx.destination); src.start(0);
  } catch(e) {}
  if (_actx.state === 'suspended') _actx.resume().catch(()=>{});
}
document.addEventListener('touchstart', _unlockAudio, {once: true, passive: true});
document.addEventListener('click',      _unlockAudio, {once: true});

// FF10 · Menu Confirm — crisp two-note bell chime (habit complete)
function playSwordSlash() {
  if (!soundEnabled || !_ACtx) return;
  try {
    const ctx = _getCtx(), t = ctx.currentTime;
    const master = ctx.createGain(); master.gain.value = 0.36; master.connect(ctx.destination);
    // C5 → G5  (perfect fifth, very snappy)
    [[523.25,0,0.19],[783.99,0.068,0.23]].forEach(([f,s,d])=>{
      const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=f;
      g.gain.setValueAtTime(0,t+s); g.gain.linearRampToValueAtTime(0.36,t+s+0.003);
      g.gain.exponentialRampToValueAtTime(0.001,t+s+d);
      o.connect(g); g.connect(master); o.start(t+s); o.stop(t+s+d+0.02);
      const o2=ctx.createOscillator(),g2=ctx.createGain(); o2.type='triangle'; o2.frequency.value=f*2;
      g2.gain.setValueAtTime(0,t+s); g2.gain.linearRampToValueAtTime(0.09,t+s+0.003);
      g2.gain.exponentialRampToValueAtTime(0.001,t+s+d*0.32);
      o2.connect(g2); g2.connect(master); o2.start(t+s); o2.stop(t+s+d*0.38);
    });
  } catch(e) {}
}

// FF10 · All Daily Quests cleared — 4-note C major ascending arpeggio + crystal shimmer
function playDailyComplete() {
  if (!soundEnabled || !_ACtx) return;
  try {
    const ctx = _getCtx(), t = ctx.currentTime;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value=-8; comp.knee.value=4; comp.ratio.value=3; comp.attack.value=0.001; comp.release.value=0.12; comp.connect(ctx.destination);
    [[261.63,0,0.15],[329.63,0.13,0.15],[392.00,0.26,0.15],[523.25,0.39,0.58]].forEach(([f,s,d])=>{
      const o=ctx.createOscillator(),g=ctx.createGain(); o.type='triangle'; o.frequency.value=f;
      g.gain.setValueAtTime(0,t+s); g.gain.linearRampToValueAtTime(0.22,t+s+0.008); g.gain.setValueAtTime(0.22,t+s+d*0.52); g.gain.exponentialRampToValueAtTime(0.001,t+s+d+0.06);
      o.connect(g); g.connect(comp); o.start(t+s); o.stop(t+s+d+0.10);
      const o2=ctx.createOscillator(),g2=ctx.createGain(); o2.type='sine'; o2.frequency.value=f;
      g2.gain.setValueAtTime(0,t+s); g2.gain.linearRampToValueAtTime(0.14,t+s+0.008); g2.gain.exponentialRampToValueAtTime(0.001,t+s+d+0.10);
      o2.connect(g2); g2.connect(comp); o2.start(t+s); o2.stop(t+s+d+0.12);
    });
    [1046.50,1318.51,1567.98].forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=f; const st=t+0.44+i*0.065; g.gain.setValueAtTime(0,st); g.gain.linearRampToValueAtTime(0.064-i*0.016,st+0.010); g.gain.exponentialRampToValueAtTime(0.001,st+0.55); o.connect(g); g.connect(comp); o.start(st); o.stop(st+0.60); });
  } catch(e) {}
}

// FF10 · Victory Fanfare — classic G-G-G-Ab-G | Bb-G | Bb-G-B-D-G5 (all weeklies cleared)
function playWeeklyComplete() {
  if (!soundEnabled || !_ACtx) return;
  try {
    const ctx = _getCtx(), t = ctx.currentTime;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value=-4; comp.knee.value=3; comp.ratio.value=4; comp.attack.value=0.001; comp.release.value=0.10; comp.connect(ctx.destination);
    [
      [392.00,0.000,0.085],[392.00,0.095,0.085],[392.00,0.190,0.085],
      [415.30,0.285,0.048],[392.00,0.338,0.135],
      [466.16,0.498,0.085],[392.00,0.592,0.185],
      [466.16,0.805,0.085],[392.00,0.899,0.085],[493.88,0.993,0.085],[587.33,1.087,0.085],
      [783.99,1.180,1.05]
    ].forEach(([f,s,d])=>{
      const o=ctx.createOscillator(),g=ctx.createGain(); o.type='square'; o.frequency.value=f;
      g.gain.setValueAtTime(0,t+s); g.gain.linearRampToValueAtTime(0.027,t+s+0.008); g.gain.setValueAtTime(0.027,t+s+d*0.72); g.gain.exponentialRampToValueAtTime(0.001,t+s+d+0.03);
      o.connect(g); g.connect(comp); o.start(t+s); o.stop(t+s+d+0.05);
      const o2=ctx.createOscillator(),g2=ctx.createGain(); o2.type='sine'; o2.frequency.value=f;
      g2.gain.setValueAtTime(0,t+s); g2.gain.linearRampToValueAtTime(0.034,t+s+0.008); g2.gain.exponentialRampToValueAtTime(0.001,t+s+d+0.05);
      o2.connect(g2); g2.connect(comp); o2.start(t+s); o2.stop(t+s+d+0.07);
    });
    // Final chord + shimmer on the held G5
    [783.99,987.77,1174.66,1567.98].forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.type='triangle'; o.frequency.value=f; const st=t+1.20; g.gain.setValueAtTime(0,st); g.gain.linearRampToValueAtTime(0.088-i*0.017,st+0.018); g.gain.exponentialRampToValueAtTime(0.001,st+1.45); o.connect(g); g.connect(comp); o.start(st); o.stop(st+1.50); });
    [1567.98,1975.53,2637.02].forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=f; const st=t+1.27+i*0.07; g.gain.setValueAtTime(0,st); g.gain.linearRampToValueAtTime(0.054-i*0.014,st+0.012); g.gain.exponentialRampToValueAtTime(0.001,st+0.90); o.connect(g); g.connect(comp); o.start(st); o.stop(st+0.96); });
  } catch(e) {}
}

// FF10 · All Work Missions cleared — triumphant 6-note ascending run + chord resolve
function playAllComplete() {
  if (!soundEnabled || !_ACtx) return;
  try {
    const ctx = _getCtx(), t = ctx.currentTime;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value=-6; comp.knee.value=4; comp.ratio.value=3; comp.attack.value=0.001; comp.release.value=0.12; comp.connect(ctx.destination);
    [[392.00,0.00,0.12],[493.88,0.11,0.12],[587.33,0.22,0.12],[783.99,0.33,0.12],[987.77,0.44,0.12],[1174.66,0.55,0.68]].forEach(([f,s,d])=>{
      const o=ctx.createOscillator(),g=ctx.createGain(); o.type='triangle'; o.frequency.value=f;
      g.gain.setValueAtTime(0,t+s); g.gain.linearRampToValueAtTime(0.19,t+s+0.007); g.gain.setValueAtTime(0.19,t+s+d*0.55); g.gain.exponentialRampToValueAtTime(0.001,t+s+d+0.05);
      o.connect(g); g.connect(comp); o.start(t+s); o.stop(t+s+d+0.08);
      const o2=ctx.createOscillator(),g2=ctx.createGain(); o2.type='sine'; o2.frequency.value=f;
      g2.gain.setValueAtTime(0,t+s); g2.gain.linearRampToValueAtTime(0.12,t+s+0.007); g2.gain.exponentialRampToValueAtTime(0.001,t+s+d+0.08);
      o2.connect(g2); g2.connect(comp); o2.start(t+s); o2.stop(t+s+d+0.10);
    });
    [1174.66,1480.00,1760.00].forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=f; const st=t+0.62+i*0.065; g.gain.setValueAtTime(0,st); g.gain.linearRampToValueAtTime(0.058-i*0.014,st+0.010); g.gain.exponentialRampToValueAtTime(0.001,st+0.65); o.connect(g); g.connect(comp); o.start(st); o.stop(st+0.70); });
  } catch(e) {}
}

// FF10 · Level Up — epic 2-octave ascending run (E3→E5) + full chord + crystal burst
function playLevelUp() {
  if (!soundEnabled || !_ACtx) return;
  try {
    const ctx = _getCtx(), t = ctx.currentTime;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value=-4; comp.knee.value=3; comp.ratio.value=4; comp.attack.value=0.001; comp.release.value=0.10; comp.connect(ctx.destination);
    [[164.81,0.00,0.07],[196.00,0.08,0.07],[246.94,0.16,0.07],[329.63,0.24,0.07],[392.00,0.32,0.07],[493.88,0.40,0.07],[659.25,0.48,0.65]].forEach(([f,s,d])=>{
      const o=ctx.createOscillator(),g=ctx.createGain(); o.type='square'; o.frequency.value=f;
      g.gain.setValueAtTime(0,t+s); g.gain.linearRampToValueAtTime(0.095,t+s+0.005); g.gain.setValueAtTime(0.095,t+s+d*0.65); g.gain.exponentialRampToValueAtTime(0.001,t+s+d);
      o.connect(g); g.connect(comp); o.start(t+s); o.stop(t+s+d+0.04);
      const o2=ctx.createOscillator(),g2=ctx.createGain(); o2.type='sine'; o2.frequency.value=f;
      g2.gain.setValueAtTime(0,t+s); g2.gain.linearRampToValueAtTime(0.10,t+s+0.005); g2.gain.exponentialRampToValueAtTime(0.001,t+s+d);
      o2.connect(g2); g2.connect(comp); o2.start(t+s); o2.stop(t+s+d+0.04);
    });
    // E major chord sustain (E4 G#4 B4 E5)
    [329.63,415.30,493.88,659.25].forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.type='triangle'; o.frequency.value=f; const st=t+0.52; g.gain.setValueAtTime(0,st); g.gain.linearRampToValueAtTime(0.10-i*0.018,st+0.018); g.gain.exponentialRampToValueAtTime(0.001,st+1.25); o.connect(g); g.connect(comp); o.start(st); o.stop(st+1.30); });
    // Crystal shimmer burst
    [1318.51,1760.00,2093.00,2637.02].forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=f; const st=t+0.57+i*0.065; g.gain.setValueAtTime(0,st); g.gain.linearRampToValueAtTime(0.050-i*0.009,st+0.012); g.gain.exponentialRampToValueAtTime(0.001,st+0.95); o.connect(g); g.connect(comp); o.start(st); o.stop(st+1.00); });
  } catch(e) {}
}

// FF10 · Stat Rank Up — Sphere Grid activation (crystalline arpeggio + vibrato)
function playStatRankUp() {
  if (!soundEnabled || !_ACtx) return;
  try {
    const ctx = _getCtx(), t = ctx.currentTime;
    const master = ctx.createGain(); master.gain.value = 0.46; master.connect(ctx.destination);
    [[523.25,0,0.14],[659.25,0.12,0.14],[783.99,0.24,0.14],[1046.50,0.36,0.62]].forEach(([f,s,d])=>{
      const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=f;
      const lfo=ctx.createOscillator(),lfog=ctx.createGain(); lfo.frequency.value=6.2; lfog.gain.value=f*0.007;
      lfo.connect(lfog); lfog.connect(o.frequency);
      g.gain.setValueAtTime(0,t+s); g.gain.linearRampToValueAtTime(0.22,t+s+0.008); g.gain.setValueAtTime(0.22,t+s+d*0.55); g.gain.exponentialRampToValueAtTime(0.001,t+s+d+0.08);
      o.connect(g); g.connect(master); o.start(t+s); lfo.start(t+s); o.stop(t+s+d+0.12); lfo.stop(t+s+d+0.12);
      const o2=ctx.createOscillator(),g2=ctx.createGain(); o2.type='triangle'; o2.frequency.value=f*1.5;
      g2.gain.setValueAtTime(0,t+s); g2.gain.linearRampToValueAtTime(0.07,t+s+0.008); g2.gain.exponentialRampToValueAtTime(0.001,t+s+d*0.70);
      o2.connect(g2); g2.connect(master); o2.start(t+s); o2.stop(t+s+d*0.75);
    });
    [2093.00,2637.02,3135.96].forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=f; const st=t+0.44+i*0.068; g.gain.setValueAtTime(0,st); g.gain.linearRampToValueAtTime(0.046-i*0.012,st+0.010); g.gain.exponentialRampToValueAtTime(0.001,st+0.50); o.connect(g); g.connect(master); o.start(st); o.stop(st+0.55); });
  } catch(e) {}
}


// ============================================================
// STATS / TIERS
// ============================================================
const STAT_KEYS = ['STR','DEX','CON','INT','VOL','CHA'];
const STAT_NAMES = { STR:'Strength', DEX:'Dexterity', CON:'Constitution', INT:'Intelligence', VOL:'Volition', CHA:'Charisma' };
const TIERS = [{t:'F',min:0},{t:'E',min:60},{t:'D',min:225},{t:'C',min:500},{t:'B',min:1350},{t:'A',min:2300},{t:'S',min:3500},{t:'SS',min:4400},{t:'SSS',min:5300}];
function tierFor(pts) {
  let curr=TIERS[0],next=TIERS[1];
  for(let i=0;i<TIERS.length;i++) if(pts>=TIERS[i].min){curr=TIERS[i];next=TIERS[i+1];}
  if(!next) return {tier:curr.t,pctToNext:100,currentMin:curr.min,nextMin:curr.min,capped:true};
  const span=next.min-curr.min, into=pts-curr.min;
  return {tier:curr.t,pctToNext:Math.min(100,(into/span)*100),currentMin:curr.min,nextMin:next.min,capped:false};
}

// ============================================================
// DEFAULT DATA
// ============================================================
const DEFAULT_HABITOS = [
  { id:'h0', text:'Levantarse a las 7am', xp:30, gains:{CON:2,VOL:1} },
  { id:'h1', text:'Tomar 2L de agua', xp:30, gains:{CON:3} },
  { id:'h2', text:'Caminata al parque', xp:40, gains:{DEX:2,CON:1,VOL:1} },
  { id:'h3', text:'Meditación (10 min)', xp:20, gains:{INT:1,VOL:1}, tiers:[
    {id:'10min',label:'10 minutos',sub:'',xp:20,gains:{INT:1,VOL:1}},
    {id:'20min',label:'20 minutos',sub:'',xp:30,gains:{INT:2,VOL:1},elite:true}
  ]},
  { id:'h4', text:'Entrenamiento físico', xp:40, gains:{STR:2,CON:1,VOL:1}, tiers:[
    {id:'small',label:'Sesión corta',sub:'< 30 min',xp:40,gains:{STR:2,CON:1,VOL:1}},
    {id:'30min',label:'30 minutos',sub:'Estándar',xp:70,gains:{STR:4,DEX:1,CON:1,VOL:1}},
    {id:'45min',label:'45 minutos',sub:'Intenso',xp:100,gains:{STR:6,DEX:2,CON:1,VOL:1}},
    {id:'60min',label:'1 hora+',sub:'Hard mode',xp:130,gains:{STR:8,DEX:3,CON:1,VOL:1},elite:true}
  ]},
  { id:'h5', text:'Anotar logros del día y tarea #1 de mañana', xp:20, gains:{INT:2} },
  { id:'h6', text:'Escribir 3 cosas por las que estás agradecido', xp:30, gains:{CHA:2,INT:1} },
  { id:'h7', text:'Lavar platos', xp:20, gains:{VOL:1,CHA:1} },
  { id:'h8', text:'Hacer cama', xp:20, gains:{VOL:1,CHA:1} },
  { id:'h9', text:'Leer', xp:30, gains:{INT:3} },
  { id:'h10', text:'Estiramientos', xp:30, gains:{CON:1,DEX:2} },
  { id:'h11', text:'Uso del celular', xp:20, gains:{INT:1,VOL:1}, tiers:[
    {id:'3hs',label:'3hs o menos',sub:'',xp:20,gains:{INT:1,VOL:1}},
    {id:'2hs',label:'2hs o menos',sub:'',xp:50,gains:{INT:2,VOL:2,CHA:1}},
    {id:'1h', label:'1h o menos', sub:'',xp:80,gains:{INT:3,VOL:3,CHA:2},elite:true}
  ]}
];
const DEFAULT_WEEKLY = [
  { id:'w0', text:'Fútbol',                   xp:430, gains:{DEX:15,STR:16,CON:8,CHA:4} },
  { id:'w1', text:'Pádel',                    xp:390, gains:{DEX:15,STR:12,CON:8,CHA:4} },
  { id:'w2', text:'Limpieza completa de casa', xp:250, gains:{DEX:5,VOL:10,CHA:10} },
  { id:'w3', text:'Cocinar plato complejo',    xp:270, gains:{CON:8,INT:7,VOL:8,CHA:4} },
  { id:'w4', text:'Acicalarme en profundidad', xp:270, gains:{CON:4,VOL:3,CHA:20} }
];

// ============================================================
// DATE UTILS
// ============================================================
const todayKey = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const yesterdayKey = () => { const d=new Date(); d.setDate(d.getDate()-1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
function isoWeekKey(date) {
  const d=new Date(date||new Date()); d.setHours(0,0,0,0); d.setDate(d.getDate()+3-((d.getDay()+6)%7));
  const w1=new Date(d.getFullYear(),0,4);
  const wn=1+Math.round(((d-w1)/86400000-3+(w1.getDay()+6)%7)/7);
  return `${d.getFullYear()}-W${String(wn).padStart(2,'0')}`;
}

// ============================================================
// STATE
// ============================================================
function defaultStats() { return STAT_KEYS.reduce((a,k)=>{a[k]=0;return a;},{}); }

function loadState() {
  try {
    const rawV4 = localStorage.getItem(STORAGE_KEY);
    if (rawV4) {
      const s = JSON.parse(rawV4);
      if (!s.stats) s.stats = defaultStats();
      if (!s.habitos) s.habitos = DEFAULT_HABITOS.map(h=>({...h,done:{}}));
      if (!s.weekly)  s.weekly  = DEFAULT_WEEKLY.map(w=>({...w,done:{}}));
      if (!s.trabajo) s.trabajo = [];
      if (typeof s.totalXp !== 'number') s.totalXp = 0;
      if (typeof s.streak  !== 'number') s.streak  = 0;
      if (!s.lastActiveDay) s.lastActiveDay = todayKey();
      if (typeof s.col !== 'number') s.col = 0;
      if (!s.playerName) s.playerName = 'Tuni';
      if (!s.playerTitle) s.playerTitle = 'Beginner';
      if (!s.achievements) s.achievements = {};
      if (!s.logros) s.logros = { perfectWeekCount:0, phoenixCount:0, lastPerfectWeekDay:null, lastPhoenixDay:null };
      if (!s.inventory) s.inventory = [{itemId:'iron_sword',quantity:1},{itemId:'leather_armor',quantity:1},{itemId:'iron_helm',quantity:1},{itemId:'leather_boots',quantity:1},{itemId:'hp_pot_s',quantity:5},{itemId:'mp_pot_s',quantity:2}];
      if (!s.equipment) s.equipment = {earring_l:null,helmet:null,earring_r:null,weapon:null,armor:null,shield:null,necklace:null,bracelet:null,belt:null,boots:null};
      if (!s.hasOwnProperty('hp') || s.hp === undefined) s.hp = null;
      if (!s.hasOwnProperty('mp') || s.mp === undefined) s.mp = null;
      if (!s.hasOwnProperty('lastHpMpTick')) s.lastHpMpTick = null;
      // ensure done exists on all habits
      s.habitos.forEach(h=>{ if(!h.done) h.done={}; });
      s.weekly.forEach(w=>{ if(!w.done) w.done={}; });
      s.trabajo.forEach(t=>{ if(!t.done) t.done={}; });
      return s;
    }
    // Migrate from v3
    const rawV3 = localStorage.getItem(OLD_KEY_V3);
    if (rawV3) {
      const v3 = JSON.parse(rawV3);
      const habitos = DEFAULT_HABITOS.map((def,i)=>{
        const old = (v3.habitos||[]).find(h=>h.id===def.id)||(v3.habitos||[])[i]||{};
        return {...def, done: old.done||{}};
      });
      const weekly = DEFAULT_WEEKLY.map((def,i)=>{
        const old = (v3.weekly||[]).find(w=>w.id===def.id)||(v3.weekly||[])[i]||{};
        return {...def, done: old.done||{}};
      });
      return { habitos, weekly, trabajo: v3.trabajo||[], stats: v3.stats||defaultStats(), totalXp: v3.totalXp||0, streak: v3.streak||0, lastActiveDay: v3.lastActiveDay||todayKey(), col: v3.col||0 };
    }
  } catch(e) { console.warn('load failed',e); }
  return { habitos: DEFAULT_HABITOS.map(h=>({...h,done:{}})), weekly: DEFAULT_WEEKLY.map(w=>({...w,done:{}})), trabajo: [], stats: defaultStats(), totalXp:0, streak:0, lastActiveDay:todayKey(), col:0, playerName:'Tuni', playerTitle:'Beginner', achievements:{}, logros:{perfectWeekCount:0,phoenixCount:0,lastPerfectWeekDay:null,lastPhoenixDay:null}, dungeon:null, inventory:[{itemId:'iron_sword',quantity:1},{itemId:'leather_armor',quantity:1},{itemId:'iron_helm',quantity:1},{itemId:'leather_boots',quantity:1},{itemId:'hp_pot_s',quantity:5},{itemId:'mp_pot_s',quantity:2}], equipment:{earring_l:null,helmet:null,earring_r:null,weapon:null,armor:null,shield:null,necklace:null,bracelet:null,belt:null,boots:null} };
}

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

let state = loadState();
let currentTab = 'habits';
let activeDate = todayKey();
let openTierFor = null;
let radarChart = null;
let openStatKey = null;
let invSelected = null;

// ============================================================
// DUNGEON SYSTEM — CONFIG
// ============================================================
const POMODORO_WORK_MS  = 25 * 60 * 1000;
const POMODORO_BREAK_MS =  5 * 60 * 1000;

const DUNGEON_CONFIG = {
  easy:  {id:'easy',  name:'Forest Cave',  emoji:'🌲', color:'#56ab2f', glow:'rgba(86,171,47,0.4)',  bgColor:'rgba(5,15,5,0.97)',
          minHours:2, rewardXP:200,  rewardCol:50,  rewardStat:'CON', rewardStatAmt:2,
          enemies:[{name:'Slime',emoji:'🟢',hp:30,atk:5},{name:'Goblin',emoji:'👺',hp:45,atk:8},{name:'Wolf',emoji:'🐺',hp:60,atk:12},{name:'Orc Scout',emoji:'👹',hp:80,atk:15}],
          boss:{name:'Forest Guardian',emoji:'🌳',hp:350,atk:18,special:'Root Bind',specialEvery:4}},
  medium:{id:'medium',name:'Dark Ruins',   emoji:'🏚️', color:'#f7971e', glow:'rgba(247,151,30,0.4)', bgColor:'rgba(20,10,0,0.97)',
          minHours:4, rewardXP:500,  rewardCol:120, rewardStat:'INT', rewardStatAmt:3,
          enemies:[{name:'Skeleton',emoji:'💀',hp:80,atk:18},{name:'Zombie',emoji:'🧟',hp:120,atk:15},{name:'Vampire',emoji:'🧛',hp:100,atk:25},{name:'Wraith',emoji:'👻',hp:90,atk:22}],
          boss:{name:'Dark Knight',emoji:'🗡️',hp:700,atk:35,special:'Dark Slash',specialEvery:3}},
  hard:  {id:'hard',  name:'Dragon Lair',  emoji:'🐉', color:'#f44336', glow:'rgba(244,67,54,0.4)',  bgColor:'rgba(25,3,3,0.97)',
          minHours:6, rewardXP:1000, rewardCol:250, rewardStat:'STR', rewardStatAmt:5,
          enemies:[{name:'Dragon Whelp',emoji:'🐲',hp:150,atk:35},{name:'Lava Golem',emoji:'🌋',hp:200,atk:30},{name:'Fire Demon',emoji:'😈',hp:180,atk:40},{name:'Inferno Drake',emoji:'🔥',hp:220,atk:38}],
          boss:{name:'Ancient Dragon',emoji:'🐉',hp:1200,atk:60,special:'Dragon Breath',specialEvery:4}},
  xhard: {id:'xhard', name:'Void Abyss',   emoji:'🌑', color:'#9c27b0', glow:'rgba(156,39,176,0.4)', bgColor:'rgba(5,0,15,0.99)',
          minHours:8, rewardXP:2000, rewardCol:500, rewardStat:'VOL', rewardStatAmt:8,
          enemies:[{name:'Void Shadow',emoji:'🌑',hp:250,atk:55},{name:'Nightmare',emoji:'😱',hp:300,atk:50},{name:'Abyssal Fiend',emoji:'👾',hp:280,atk:60},{name:'Chaos Wraith',emoji:'🌀',hp:320,atk:65}],
          boss:{name:'Void Overlord',emoji:'💀',hp:2000,atk:90,special:'Void Annihilation',specialEvery:3}}
};

const DUNGEON_SKILLS = [
  {id:'power_strike', name:'Power Strike', emoji:'⚔️', desc:'200% ATK · VOL+',      mpCost:0,  cooldown:3, type:'attack',  multiplier:2.0},
  {id:'shield_block', name:'Shield Block', emoji:'🛡️', desc:'Block 60% · CON absorb',mpCost:0,  cooldown:2, type:'defense'},
  {id:'battle_cry',   name:'Battle Cry',   emoji:'📯', desc:'+50% ATK 3t · VOL+',    mpCost:15, cooldown:4, type:'buff',    atkBonus:0.5, duration:3},
  {id:'arcane_bolt',  name:'Arcane Bolt',  emoji:'⚡', desc:'INT·VOL magic dmg',      mpCost:20, cooldown:2, type:'magic',   multiplier:1.5},
];

const INV_SIZE = 45;

const EQUIP_SLOTS = [
  { id:'earring_l', name:'Earring',  emoji:'💎', area:'earL' },
  { id:'helmet',    name:'Helmet',   emoji:'⛑️',  area:'helm' },
  { id:'earring_r', name:'Earring',  emoji:'💎', area:'earR' },
  { id:'weapon',    name:'Weapon',   emoji:'⚔️', area:'wpn'  },
  { id:'armor',     name:'Armor',    emoji:'🥋', area:'armor'},
  { id:'shield',    name:'Shield',   emoji:'🛡️', area:'shld' },
  { id:'necklace',  name:'Necklace', emoji:'📿', area:'neck' },
  { id:'bracelet',  name:'Bracelet', emoji:'💍', area:'brace'},
  { id:'belt',      name:'Belt',     emoji:'🏷️', area:'belt' },
  { id:'boots',     name:'Boots',    emoji:'👟', area:'boot' },
];

const ITEMS_DB = {
  // Weapons
  iron_sword:       {id:'iron_sword',       name:'Iron Sword',       slot:'weapon',   rarity:'common',    emoji:'🗡️', stats:{STR:3,ATK:8},                  desc:'A reliable iron sword for beginners.'},
  steel_blade:      {id:'steel_blade',      name:'Steel Blade',      slot:'weapon',   rarity:'rare',      emoji:'⚔️', stats:{STR:8,ATK:18,DEX:3},            desc:'A well-balanced steel blade.'},
  shadow_edge:      {id:'shadow_edge',      name:'Shadow Edge',      slot:'weapon',   rarity:'epic',      emoji:'🗡️', stats:{STR:18,ATK:35,DEX:8,critBonus:5},desc:'Forged in shadow essence.'},
  void_blade:       {id:'void_blade',       name:'Void Blade',       slot:'weapon',   rarity:'legendary', emoji:'⚔️', stats:{STR:30,ATK:60,DEX:15,critBonus:10},desc:'A blade that cuts through reality itself.'},
  // Armor
  leather_armor:    {id:'leather_armor',    name:'Leather Armor',    slot:'armor',    rarity:'common',    emoji:'🥋', stats:{CON:3,DEF:5},                   desc:'Basic leather protection.'},
  chain_mail:       {id:'chain_mail',       name:'Chain Mail',       slot:'armor',    rarity:'rare',      emoji:'🪖', stats:{CON:8,DEF:15,HP:30},             desc:'Interlocked metal rings.'},
  guardian_plate:   {id:'guardian_plate',   name:'Guardian Plate',   slot:'armor',    rarity:'epic',      emoji:'🛡️', stats:{CON:18,DEF:32,HP:80,blockBonus:5},desc:'Blessed by ancient guardians.'},
  dragon_armor:     {id:'dragon_armor',     name:'Dragon Armor',     slot:'armor',    rarity:'legendary', emoji:'🐉', stats:{CON:30,DEF:55,HP:150,blockBonus:10},desc:'Scales of an ancient dragon.'},
  // Helmet
  iron_helm:        {id:'iron_helm',        name:'Iron Helm',        slot:'helmet',   rarity:'common',    emoji:'⛑️', stats:{CON:2,DEF:3},                   desc:'Simple iron helmet.'},
  mage_hat:         {id:'mage_hat',         name:'Mage Hat',         slot:'helmet',   rarity:'rare',      emoji:'🎩', stats:{INT:8,VOL:3,MP:20},              desc:'Enhances magical affinity.'},
  void_crown:       {id:'void_crown',       name:'Void Crown',       slot:'helmet',   rarity:'epic',      emoji:'👑', stats:{INT:18,VOL:10,MP:60,CHA:5},      desc:'Crown radiating void energy.'},
  // Necklace
  health_amulet:    {id:'health_amulet',    name:'Health Amulet',    slot:'necklace', rarity:'common',    emoji:'📿', stats:{CON:3,HP:25},                   desc:'Grants minor vitality.'},
  wisdom_pendant:   {id:'wisdom_pendant',   name:'Wisdom Pendant',   slot:'necklace', rarity:'rare',      emoji:'🔮', stats:{INT:6,VOL:6,MP:35},              desc:'Enhances mental clarity.'},
  chaos_pendant:    {id:'chaos_pendant',    name:'Chaos Pendant',    slot:'necklace', rarity:'epic',      emoji:'💎', stats:{STR:8,INT:8,VOL:8,CHA:8},        desc:'Swirling with chaotic energy.'},
  // Earrings
  copper_earring:   {id:'copper_earring',   name:'Copper Earring',   slot:'earring',  rarity:'common',    emoji:'💎', stats:{DEX:2},                          desc:'Simple copper earrings.'},
  swift_earring:    {id:'swift_earring',    name:'Swift Earring',    slot:'earring',  rarity:'rare',      emoji:'💎', stats:{DEX:7,dodgeBonus:3},              desc:'Grants swifter reactions.'},
  void_earring:     {id:'void_earring',     name:'Void Earring',     slot:'earring',  rarity:'epic',      emoji:'💎', stats:{DEX:15,VOL:8,dodgeBonus:7},       desc:'Resonates with the void.'},
  // Shield
  wooden_shield:    {id:'wooden_shield',    name:'Wooden Shield',    slot:'shield',   rarity:'common',    emoji:'🛡️', stats:{CON:2,DEF:6},                   desc:'A sturdy wooden shield.'},
  iron_shield:      {id:'iron_shield',      name:'Iron Shield',      slot:'shield',   rarity:'rare',      emoji:'🛡️', stats:{CON:6,DEF:14,blockBonus:5},       desc:'Solid iron defense.'},
  // Bracelet
  power_bracelet:   {id:'power_bracelet',   name:'Power Bracelet',   slot:'bracelet', rarity:'rare',      emoji:'💍', stats:{STR:5,INT:3},                    desc:'Channels inner power.'},
  arcane_cuff:      {id:'arcane_cuff',      name:'Arcane Cuff',      slot:'bracelet', rarity:'epic',      emoji:'💍', stats:{INT:14,VOL:9,MP:45},              desc:'Resonates with arcane frequencies.'},
  // Belt
  leather_belt:     {id:'leather_belt',     name:'Leather Belt',     slot:'belt',     rarity:'common',    emoji:'🏷️', stats:{CON:2,HP:20},                   desc:'Holds everything in place.'},
  warrior_belt:     {id:'warrior_belt',     name:'Warrior Belt',     slot:'belt',     rarity:'rare',      emoji:'🏷️', stats:{STR:4,CON:5,HP:40},              desc:'Worn by hardened warriors.'},
  // Boots
  leather_boots:    {id:'leather_boots',    name:'Leather Boots',    slot:'boots',    rarity:'common',    emoji:'👟', stats:{DEX:2},                          desc:'Light and comfortable.'},
  swift_boots:      {id:'swift_boots',      name:'Swift Boots',      slot:'boots',    rarity:'rare',      emoji:'👢', stats:{DEX:8,dodgeBonus:4},              desc:'Enchanted for quick movement.'},
  shadow_boots:     {id:'shadow_boots',     name:'Shadow Boots',     slot:'boots',    rarity:'epic',      emoji:'👢', stats:{DEX:16,dodgeBonus:9},             desc:'Leave no trace.'},
  // Potions
  hp_pot_s:         {id:'hp_pot_s',         name:'HP Potion (S)',     slot:null, rarity:'common', emoji:'🧪', healHP:50,  stackable:true, stats:{}, desc:'Restores 50 HP in combat.'},
  hp_pot_m:         {id:'hp_pot_m',         name:'HP Potion (M)',     slot:null, rarity:'rare',   emoji:'⚗️', healHP:150, stackable:true, stats:{}, desc:'Restores 150 HP in combat.'},
  hp_pot_l:         {id:'hp_pot_l',         name:'HP Potion (L)',     slot:null, rarity:'epic',   emoji:'🍶', healHP:350, stackable:true, stats:{}, desc:'Restores 350 HP in combat.'},
  mp_pot_s:         {id:'mp_pot_s',         name:'MP Potion (S)',     slot:null, rarity:'common', emoji:'💧', healMP:30,  stackable:true, stats:{}, desc:'Restores 30 MP in combat.'},
  mp_pot_m:         {id:'mp_pot_m',         name:'MP Potion (M)',     slot:null, rarity:'rare',   emoji:'💦', healMP:80,  stackable:true, stats:{}, desc:'Restores 80 MP in combat.'},
  // Materials
  monster_gem:      {id:'monster_gem',      name:'Monster Gem',       slot:null, rarity:'common', emoji:'💠', stackable:true, stats:{}, desc:'Dropped by monsters.'},
  dragon_scale:     {id:'dragon_scale',     name:'Dragon Scale',      slot:null, rarity:'rare',   emoji:'🐉', stackable:true, stats:{}, desc:'Rare scale from a dragon.'},
  void_crystal:     {id:'void_crystal',     name:'Void Crystal',      slot:null, rarity:'epic',   emoji:'🔮', stackable:true, stats:{}, desc:'Fragment of void energy.'},
};

const DEFAULT_INVENTORY = [
  {itemId:'iron_sword',    quantity:1},
  {itemId:'leather_armor', quantity:1},
  {itemId:'iron_helm',     quantity:1},
  {itemId:'leather_boots', quantity:1},
  {itemId:'hp_pot_s',      quantity:5},
  {itemId:'mp_pot_s',      quantity:2},
];

const DUNGEON_DROP_TABLES = {
  easy:   ['iron_sword','leather_armor','iron_helm','wooden_shield','copper_earring','leather_belt','leather_boots','hp_pot_s','mp_pot_s','monster_gem'],
  medium: ['steel_blade','chain_mail','mage_hat','iron_shield','swift_earring','warrior_belt','swift_boots','health_amulet','hp_pot_m','dragon_scale'],
  hard:   ['shadow_edge','guardian_plate','void_crown','swift_earring','arcane_cuff','shadow_boots','chaos_pendant','hp_pot_m','mp_pot_m','dragon_scale'],
  xhard:  ['void_blade','dragon_armor','void_crown','void_earring','arcane_cuff','shadow_boots','chaos_pendant','hp_pot_l','mp_pot_m','void_crystal'],
};
const DUNGEON_DROP_CHANCE = {easy:0.4, medium:0.55, hard:0.70, xhard:0.85};

let dungeonTimer = null;
let combatTimer  = null;

// ============================================================
// ACHIEVEMENTS (LOGROS)
// ============================================================
const ACHIEVEMENTS = [
  // ── PROGRESIÓN — 12 hábitos reales ──────────────────────────
  // Busca el hábito por texto (textMatch) → independiente del ID
  { id:'wake7am',     name:'Early Riser',     icon:'🌅', category:'progresion', desc:'Wake up at 7am',                                 textMatch:'7am',           stat:'CON',
    tiers:[{count:10,label:'The Sleeper Defeated',reward:5,title:null},{count:30,label:'Dawn Guardian',reward:12,title:null},{count:100,label:'Dawn Hunter',reward:50,title:'Dawn Hunter'},{count:200,label:'Lord of Time',reward:125,title:'Lord of Time'},{count:365,label:'ASCENDED',reward:250,title:'ASCENDED'}]},

  { id:'hydration',   name:'Hydrated',      icon:'💧', category:'progresion', desc:'Drink 2L of water',                               textMatch:'agua',          stat:'CON',
    tiers:[{count:10,label:'Steady',reward:5,title:null},{count:30,label:'Steady Flow',reward:12,title:null},{count:100,label:'Fountain of Life',reward:50,title:'Fountain of Life'},{count:200,label:'Pure Torrent',reward:125,title:'Pure Torrent'},{count:365,label:'INNER SEA',reward:250,title:'INNER SEA'}]},

  { id:'walk',        name:'Walker',      icon:'🚶', category:'progresion', desc:'Walk to the park',                             textMatch:'parque',        stat:'DEX',
    tiers:[{count:10,label:'Stroller',reward:5,title:null},{count:30,label:'Explorer',reward:12,title:null},{count:100,label:'Ranger',reward:50,title:'Ranger'},{count:200,label:'Dawn Nomad',reward:125,title:'Dawn Nomad'},{count:365,label:'LORD OF THE PATH',reward:250,title:'LORD OF THE PATH'}]},

  { id:'meditation',  name:'Calm Mind',   icon:'🧘', category:'progresion', desc:'Meditation (10 min)',                            textMatch:'meditac',       stat:'VOL',
    tiers:[{count:10,label:'Zen Apprentice',reward:5,title:null},{count:30,label:'Meditator',reward:12,title:null},{count:100,label:'Crystal Mind',reward:50,title:'Crystal Mind'},{count:200,label:'Contemplative',reward:125,title:'Contemplative'},{count:365,label:'SACRED VOID',reward:250,title:'SACRED VOID'}]},

  { id:'training',    name:'Warrior',       icon:'💪', category:'progresion', desc:'Physical training',                           textMatch:'entrenamiento', stat:'STR',
    tiers:[{count:10,label:'Novice',reward:5,title:null},{count:30,label:'Soldier',reward:12,title:null},{count:100,label:'Iron Veteran',reward:50,title:'Iron Veteran'},{count:200,label:'Champion',reward:125,title:'Champion'},{count:365,label:'LIVING LEGEND',reward:250,title:'LIVING LEGEND'}]},

  { id:'journal',     name:'Strategist',      icon:'📝', category:'progresion', desc:'Log wins of the day and task #1 for tomorrow',    textMatch:'logros del',    stat:'INT',
    tiers:[{count:10,label:'Note Taker',reward:5,title:null},{count:30,label:'Planner',reward:12,title:null},{count:100,label:'Strategist',reward:50,title:'Strategist'},{count:200,label:'Visionary',reward:125,title:'Visionary'},{count:365,label:'MASTER OF TIME',reward:250,title:'MASTER OF TIME'}]},

  { id:'gratitude',   name:'Grateful',     icon:'🙏', category:'progresion', desc:'Write 3 things you are grateful for', textMatch:'agradecido',    stat:'CHA',
    tiers:[{count:10,label:'Mindful',reward:5,title:null},{count:30,label:'Generous',reward:12,title:null},{count:100,label:'Open Heart',reward:50,title:'Open Heart'},{count:200,label:'Light of the Group',reward:125,title:'Light of the Group'},{count:365,label:'PURE SOUL',reward:250,title:'PURE SOUL'}]},

  { id:'dishes',      name:'Order',          icon:'🍽️', category:'progresion', desc:'Wash dishes',                                  textMatch:'platos',        stat:'VOL',
    tiers:[{count:10,label:'The Washer',reward:5,title:null},{count:30,label:'Disciplined',reward:12,title:null},{count:100,label:'Master of Order',reward:50,title:'Master of Order'},{count:200,label:'Home Guardian',reward:125,title:'Home Guardian'},{count:365,label:'DOMESTIC MONK',reward:250,title:'DOMESTIC MONK'}]},

  { id:'bed',         name:'Solid Foundation',    icon:'🛏️', category:'progresion', desc:'Make your bed',                                    textMatch:'cama',          stat:'CHA',
    tiers:[{count:10,label:'The Methodical',reward:5,title:null},{count:30,label:'The Consistent',reward:12,title:null},{count:100,label:'Home Artisan',reward:50,title:'Home Artisan'},{count:200,label:'Day Architect',reward:125,title:'Day Architect'},{count:365,label:'RITUAL FORGER',reward:250,title:'RITUAL FORGER'}]},

  { id:'reading',     name:'Bibliophile',     icon:'📖', category:'progresion', desc:'Read',                                           textMatch:'leer',          stat:'INT',
    tiers:[{count:10,label:'Curious',reward:5,title:null},{count:30,label:'Studious',reward:12,title:null},{count:100,label:'Scholar',reward:50,title:'Scholar'},{count:200,label:'Sage',reward:125,title:'Sage'},{count:365,label:'MASTER OF KNOWLEDGE',reward:250,title:'MASTER OF KNOWLEDGE'}]},

  { id:'stretching',  name:'Agile',           icon:'🤸', category:'progresion', desc:'Stretching',                                 textMatch:'estiramiento',  stat:'DEX',
    tiers:[{count:10,label:'Stiffness Overcome',reward:5,title:null},{count:30,label:'Flexible',reward:12,title:null},{count:100,label:'Agile',reward:50,title:'Agile'},{count:200,label:'Acrobat',reward:125,title:'Acrobat'},{count:365,label:'SPIRIT OF THE WIND',reward:250,title:'SPIRIT OF THE WIND'}]},

  { id:'phone',       name:'Focused',       icon:'📵', category:'progresion', desc:'Mindful phone use',                    textMatch:'celular',       stat:'VOL',
    tiers:[{count:10,label:'Mindful',reward:5,title:null},{count:30,label:'Unplugged',reward:12,title:null},{count:100,label:'Free Mind',reward:50,title:'Free Mind'},{count:200,label:'Unchained',reward:125,title:'Unchained'},{count:365,label:'DIGITAL SOVEREIGN',reward:250,title:'DIGITAL SOVEREIGN'}]},

  // ── RACHA ───────────────────────────────────────────────────
  { id:'streak_gen',  name:'On Fire',      icon:'🔥', category:'racha',       desc:'Consecutive days with ≥70% habits complete',
    tiers:[{count:3,label:'Ignited',reward:2,title:null},{count:7,label:'Iron Week',reward:10,title:null},{count:14,label:'Unstoppable Fortnight',reward:25,title:null},{count:30,label:'Unbreakable Month',reward:60,title:'Unbreakable Month'},{count:100,label:'CENTURION',reward:200,title:'CENTURION'}]},

  // ── CONSISTENCIA ────────────────────────────────────────────
  { id:'perf_week',   name:'Perfect Week', icon:'⭐', category:'consistencia', desc:'7 consecutive days at 100% of habits',
    tiers:[{count:1,label:'First Perfection',reward:10,title:null},{count:3,label:'Triple Crown',reward:30,title:null},{count:5,label:'Weekly Elite',reward:60,title:'Weekly Elite'},{count:10,label:'Weekly Master',reward:150,title:'Weekly Master'},{count:20,label:'PERPETUAL PERFECTION',reward:300,title:'PERPETUAL PERFECTION'}]},

  // ── RESILIENCIA ─────────────────────────────────────────────
  { id:'phoenix',     name:'Phoenix',          icon:'🦅', category:'resiliencia', desc:'100% day after a 0% day',
    tiers:[{count:1,label:'Risen',reward:7,title:null},{count:3,label:'Fire Bird',reward:20,title:null},{count:5,label:'Indestructible',reward:40,title:'Indestructible'},{count:10,label:'No Surrender',reward:100,title:'No Surrender'},{count:20,label:'ETERNAL PHOENIX',reward:250,title:'ETERNAL PHOENIX'}]},
];

const TIER_LABELS  = ['🥉 BRONZE','🥈 SILVER','🥇 GOLD','💎 LEGENDARY','👑 UNIQUE'];
const TIER_ICONS   = ['🥉','🥈','🥇','💎','👑'];
const STAT_COLORS  = { STR:'#ff8a80', DEX:'#b9f6ca', CON:'#ffd180', INT:'#82b1ff', VOL:'#ce93d8', CHA:'#ffe082' };

function getAchievementCount(ach) {
  if (ach.id === 'streak_gen') return state.streak;
  if (ach.id === 'perf_week')  return state.logros.perfectWeekCount || 0;
  if (ach.id === 'phoenix')    return state.logros.phoenixCount || 0;
  // Text-based match (works with custom habits regardless of ID)
  if (ach.textMatch) {
    const p = ach.textMatch.toLowerCase();
    const h = [...state.habitos, ...state.weekly].find(x => x.text.toLowerCase().includes(p));
    return h ? Object.keys(h.done || {}).length : 0;
  }
  // Fallback: ID-based (legacy)
  const ids = ach.habitIds || (ach.habitId ? [ach.habitId] : []);
  return ids.reduce((sum, hid) => {
    const h = [...state.habitos, ...state.weekly].find(x => x.id === hid);
    return sum + (h ? Object.keys(h.done || {}).length : 0);
  }, 0);
}

function getAchievementTierIndex(ach, count) {
  let best = -1;
  ach.tiers.forEach((tier, i) => { if (count >= tier.count) best = i; });
  return best;
}

function awardAchievementTier(ach, tierIndex) {
  const tier = ach.tiers[tierIndex]; if (!tier) return;
  if (ach.stat && tier.reward) state.stats[ach.stat] = (state.stats[ach.stat] || 0) + tier.reward;
  setTimeout(() => {
    playStatRankUp();
    showNotif(`${TIER_ICONS[tierIndex]||'🏆'} ACHIEVEMENT: ${ach.name} · ${tier.label}`);
  }, 1600);
}

function checkAchievements() {
  const today = todayKey();
  // ─ Perfect-week check (last 7 days all 100%)
  const days7 = []; const dd = new Date();
  for (let i = 0; i < 7; i++) {
    days7.push(`${dd.getFullYear()}-${String(dd.getMonth()+1).padStart(2,'0')}-${String(dd.getDate()).padStart(2,'0')}`);
    dd.setDate(dd.getDate()-1);
  }
  if (days7.every(dk => { const inf=getHabitPct(dk); return inf && inf.total>0 && inf.pct===100; })) {
    if (state.logros.lastPerfectWeekDay !== today) {
      state.logros.perfectWeekCount = (state.logros.perfectWeekCount||0)+1;
      state.logros.lastPerfectWeekDay = today;
    }
  }
  // ─ Phoenix check (today 100%, yesterday 0%)
  const yKey = yesterdayKey();
  const todayInf = getHabitPct(today), yInf = getHabitPct(yKey);
  if (todayInf && todayInf.pct===100 && todayInf.total>0 && yInf && yInf.pct===0 && yInf.total>0) {
    if (state.logros.lastPhoenixDay !== today) {
      state.logros.phoenixCount = (state.logros.phoenixCount||0)+1;
      state.logros.lastPhoenixDay = today;
    }
  }
  // ─ Check all achievement tiers
  ACHIEVEMENTS.forEach(ach => {
    const count = getAchievementCount(ach);
    const alreadyAwarded = state.achievements[ach.id] ?? -1;
    const newTier = getAchievementTierIndex(ach, count);
    if (newTier > alreadyAwarded) {
      for (let i = alreadyAwarded+1; i <= newTier; i++) awardAchievementTier(ach, i);
      state.achievements[ach.id] = newTier;
    }
  });
}

// ─ INVENTORY helpers ────────────────────────────────────────
function getEquippedStats() {
  const totals = {STR:0,DEX:0,CON:0,INT:0,VOL:0,CHA:0,ATK:0,DEF:0,HP:0,MP:0,critBonus:0,dodgeBonus:0,blockBonus:0};
  Object.values(state.equipment||{}).forEach(id => {
    if (!id) return;
    const item = ITEMS_DB[id]; if (!item) return;
    Object.entries(item.stats||{}).forEach(([k,v]) => { if (totals[k] !== undefined) totals[k] += v; });
  });
  return totals;
}

function equipItem(bagIndex) {
  const entry = state.inventory[bagIndex]; if (!entry) return;
  const item = ITEMS_DB[entry.itemId]; if (!item || !item.slot) return;
  let slot = item.slot;
  if (slot === 'earring') {
    slot = !state.equipment.earring_l ? 'earring_l' : !state.equipment.earring_r ? 'earring_r' : 'earring_l';
  }
  if (state.equipment[slot]) {
    const old = ITEMS_DB[state.equipment[slot]];
    const ex = old?.stackable && state.inventory.find(e=>e.itemId===state.equipment[slot]);
    if (ex) ex.quantity++; else state.inventory.push({itemId:state.equipment[slot],quantity:1});
  }
  state.equipment[slot] = entry.itemId;
  if ((entry.quantity||1) > 1) entry.quantity--; else state.inventory.splice(bagIndex,1);
  invSelected = null; saveState(); renderInventory();
  showNotif(`⚔ ${item.name} equipped!`);
}

function unequipItem(slot) {
  const id = state.equipment[slot]; if (!id) return;
  const item = ITEMS_DB[id];
  if (state.inventory.length >= INV_SIZE) { showNotif('⚠ Inventory full!'); return; }
  const ex = item?.stackable && state.inventory.find(e=>e.itemId===id);
  if (ex) ex.quantity++; else state.inventory.push({itemId:id,quantity:1});
  state.equipment[slot] = null;
  invSelected = null; saveState(); renderInventory();
  showNotif(`↩ ${item?.name||id} unequipped.`);
}

function useItem(bagIndex) {
  const entry = state.inventory[bagIndex]; if (!entry) return;
  const item = ITEMS_DB[entry.itemId]; if (!item) return;
  if (item.healHP || item.healMP) {
    if (!state.dungeon?.combat) { showNotif('⚠ Potions can only be used in combat!'); return; }
    const c = state.dungeon.combat;
    if (item.healHP) { c.playerHP = Math.min(c.playerMaxHP, c.playerHP + item.healHP); c.log.push(`🧪 ${item.name}: +${item.healHP} HP`); }
    if (item.healMP) { c.playerMP = Math.min(c.playerMaxMP, c.playerMP + item.healMP); c.log.push(`💧 ${item.name}: +${item.healMP} MP`); }
    showNotif(`🧪 ${item.name} used!`);
  }
  if ((entry.quantity||1) > 1) entry.quantity--; else state.inventory.splice(bagIndex,1);
  invSelected = null; saveState(); renderAll();
}

function dropItem(bagIndex) {
  const entry = state.inventory[bagIndex]; if (!entry) return;
  const item = ITEMS_DB[entry.itemId];
  if (!confirm(`Drop ${item?.name||entry.itemId}?`)) return;
  if ((entry.quantity||1) > 1) entry.quantity--; else state.inventory.splice(bagIndex,1);
  invSelected = null; saveState(); renderInventory();
}

function grantItemDrop(difficulty) {
  const table = DUNGEON_DROP_TABLES[difficulty]; if (!table) return;
  if (Math.random() >= (DUNGEON_DROP_CHANCE[difficulty]||0.4)) return;
  if ((state.inventory||[]).length >= INV_SIZE) return;
  const id = table[Math.floor(Math.random()*table.length)];
  const item = ITEMS_DB[id]; if (!item) return;
  if (!state.inventory) state.inventory = [];
  const ex = item.stackable && state.inventory.find(e=>e.itemId===id);
  if (ex) ex.quantity++; else state.inventory.push({itemId:id,quantity:1});
  setTimeout(()=>showNotif(`💎 Item Drop: [${item.rarity.toUpperCase()}] ${item.name}!`), 800);
}

function renderInventory() {
  panelTitle.textContent = 'INVENTORY'; panelSubtitle.textContent = 'Equipment & items';
  panelContent.innerHTML = '';
  const lv = calcLevel(state.totalXp);
  const equip = state.equipment || {};
  const inv = state.inventory || [];
  const slots = Array(INV_SIZE).fill(null);
  inv.forEach((e,i) => { if (i < INV_SIZE) slots[i] = e; });

  const win = document.createElement('div');
  win.className = 'inv-window';

  // Title bar
  win.innerHTML = `<div class="inv-window-title">INVENTORY</div>`;

  const body = document.createElement('div');
  body.className = 'inv-body';

  // ── Left: Equipment panel
  const eqPanel = document.createElement('div');
  eqPanel.className = 'inv-equip-panel';
  eqPanel.innerHTML = `<div class="inv-section-label">EQUIPMENT</div>`;

  const grid = document.createElement('div');
  grid.className = 'inv-equip-grid';

  // Character center slot
  const charEl = document.createElement('div');
  charEl.className = 'inv-char-slot';
  charEl.style.gridArea = 'char';
  charEl.innerHTML = `<div class="inv-char-sprite">🗡️</div><div class="inv-char-name">${state.playerName}</div><div class="inv-char-lv">LV.${lv.level}</div>`;
  grid.appendChild(charEl);

  EQUIP_SLOTS.forEach(def => {
    const eqId = equip[def.id];
    const eqItem = eqId ? ITEMS_DB[eqId] : null;
    const isSel = invSelected?.source==='equip' && invSelected?.index===def.id;
    const el = document.createElement('div');
    el.style.gridArea = def.area;
    el.className = `inv-equip-slot${eqItem?' is-filled':''}${isSel?' is-selected':''}${eqItem?' r-'+eqItem.rarity:''}`;
    el.innerHTML = eqItem
      ? `<div class="inv-equip-slot-emoji">${eqItem.emoji}</div>`
      : `<div class="inv-equip-slot-emoji" style="opacity:0.2">${def.emoji}</div><div class="inv-equip-slot-label">${def.name}</div>`;
    el.addEventListener('click', () => {
      if (!eqItem) return;
      if (isSel) unequipItem(def.id);
      else { invSelected = {source:'equip', index:def.id}; renderInventory(); }
    });
    grid.appendChild(el);
  });
  eqPanel.appendChild(grid);

  // Equipment stat totals
  const eq = getEquippedStats();
  const bonusTags = Object.entries(eq)
    .filter(([k,v]) => v>0 && ['STR','DEX','CON','INT','VOL','CHA','ATK','DEF','HP','MP'].includes(k))
    .map(([k,v]) => `<span class="inv-eq-bonus-tag">+${v} ${k}</span>`).join('');
  if (bonusTags) {
    const bd = document.createElement('div');
    bd.className = 'inv-eq-bonuses';
    bd.innerHTML = bonusTags;
    eqPanel.appendChild(bd);
  }
  body.appendChild(eqPanel);

  // ── Right: Bag panel
  const bagPanel = document.createElement('div');
  bagPanel.className = 'inv-bag-panel';
  bagPanel.innerHTML = `<div class="inv-section-label">BAG (${inv.length}/${INV_SIZE})</div>`;

  const bagGrid = document.createElement('div');
  bagGrid.className = 'inv-bag-grid';
  slots.forEach((entry, i) => {
    const item = entry ? ITEMS_DB[entry.itemId] : null;
    const isSel = invSelected?.source==='bag' && invSelected?.index===i;
    const el = document.createElement('div');
    el.className = `inv-bag-slot${item?' has-item r-'+item.rarity:''}${isSel?' is-selected':''}`;
    if (item) el.innerHTML = `<div class="inv-slot-emoji">${item.emoji}</div>${(entry.quantity||1)>1?`<div class="inv-slot-qty">${entry.quantity}</div>`:''}`;
    el.addEventListener('click', () => {
      if (!entry) return;
      invSelected = isSel ? null : {source:'bag', index:i};
      renderInventory();
    });
    bagGrid.appendChild(el);
  });
  bagPanel.appendChild(bagGrid);

  // Info panel
  const info = document.createElement('div');
  info.className = 'inv-info-panel';
  if (invSelected) {
    let selItem = null, selSlot = null;
    if (invSelected.source==='bag') { const e=inv[invSelected.index]; if(e) selItem=ITEMS_DB[e.itemId]; }
    else { const id=equip[invSelected.index]; if(id){selItem=ITEMS_DB[id]; selSlot=invSelected.index;} }
    if (selItem) {
      const statTags = Object.entries(selItem.stats||{}).filter(([,v])=>v>0)
        .map(([k,v])=>`<span class="inv-info-stat">+${v} ${k}</span>`).join('');
      const healTags = [selItem.healHP&&`<span class="inv-info-heal">+${selItem.healHP} HP</span>`, selItem.healMP&&`<span class="inv-info-heal">+${selItem.healMP} MP</span>`].filter(Boolean).join('');
      let acts = '';
      if (invSelected.source==='bag') {
        if (selItem.slot) acts += `<button class="inv-act-btn equip" onclick="equipItem(${invSelected.index})">EQUIP</button>`;
        if (selItem.healHP||selItem.healMP) acts += `<button class="inv-act-btn use-item" onclick="useItem(${invSelected.index})">USE</button>`;
        acts += `<button class="inv-act-btn drop-item" onclick="dropItem(${invSelected.index})">DROP</button>`;
      } else if (selSlot) {
        acts += `<button class="inv-act-btn unequip" onclick="unequipItem('${selSlot}')">UNEQUIP</button>`;
      }
      info.innerHTML = `<div class="inv-info-name r-${selItem.rarity}">${selItem.name}</div><div class="inv-info-rarity">${selItem.rarity}</div><div class="inv-info-desc">${selItem.desc}</div><div class="inv-info-stats">${statTags}${healTags}</div><div class="inv-info-actions">${acts}</div>`;
    } else info.innerHTML = `<div class="inv-info-empty">— SELECT AN ITEM —</div>`;
  } else info.innerHTML = `<div class="inv-info-empty">— SELECT AN ITEM —</div>`;

  bagPanel.appendChild(info);
  body.appendChild(bagPanel);
  win.appendChild(body);

  // Yang bar
  const yang = document.createElement('div');
  yang.className = 'inv-yang-bar';
  yang.innerHTML = `<span>💰</span><span class="inv-yang-val">${(state.col||0).toLocaleString()}</span><span>GOLD</span>`;
  win.appendChild(yang);

  panelContent.appendChild(win);
}

// ─ Render LOGROS tab ────────────────────────────────────────
function renderLogros() {
  panelTitle.textContent = 'ACHIEVEMENTS'; panelSubtitle.textContent = 'Milestones & rewards';
  panelContent.innerHTML = '';

  const totalTiers    = ACHIEVEMENTS.reduce((s,a)=>s+a.tiers.length, 0);
  const unlockedTiers = Object.values(state.achievements).reduce((s,v)=>s+(v+1), 0);

  // Summary bar
  const sumEl = document.createElement('div'); sumEl.className = 'logros-summary';
  sumEl.innerHTML = `<div><div class="logros-summary-label">⟦ PROGRESS ⟧</div><div class="logros-summary-val">${unlockedTiers}<span class="logros-summary-sub">/ ${totalTiers}</span></div></div><div style="font-family:'Cinzel',serif;font-size:10px;color:var(--sao-text-dim);letter-spacing:2px;text-align:right;">TIERS<br>UNLOCKED</div>`;
  panelContent.appendChild(sumEl);

  const wrap = document.createElement('div'); wrap.className = 'logros-wrap';

  const CATS = [
    { key:'progresion',   label:'⟦ PROGRESSION ⟧'  },
    { key:'racha',        label:'⟦ STREAK ⟧'        },
    { key:'consistencia', label:'⟦ CONSISTENCY ⟧'   },
    { key:'resiliencia',  label:'⟦ RESILIENCE ⟧'    },
  ];

  CATS.forEach(cat => {
    const achs = ACHIEVEMENTS.filter(a => a.category === cat.key);
    if (!achs.length) return;
    const catEl = document.createElement('div');
    const hdr = document.createElement('div'); hdr.className = 'logro-cat-hdr';
    hdr.innerHTML = `<span class="logro-cat-label">${cat.label}</span><div class="logro-cat-line"></div>`;
    catEl.appendChild(hdr);

    const grid = document.createElement('div'); grid.className = 'logros-grid';
    achs.forEach(ach => {
      const count   = getAchievementCount(ach);
      const tierIdx = getAchievementTierIndex(ach, count);
      const isMaxed = tierIdx >= ach.tiers.length - 1;
      const nextTier = !isMaxed ? ach.tiers[tierIdx+1] : null;
      const target  = nextTier ? nextTier.count : ach.tiers[tierIdx]?.count || 1;
      const prev    = (tierIdx >= 0 && !isMaxed) ? ach.tiers[tierIdx].count : 0;
      const progPct = isMaxed ? 100 : Math.min(100, Math.round(((count - prev) / (target - prev)) * 100));
      const progTxt = isMaxed ? 'MAX ✓' : `${count} / ${target}`;
      const tClass  = `t${Math.max(0, tierIdx+1)}`;
      const badgeTxt= tierIdx >= 0 ? TIER_LABELS[tierIdx] : '🔒 BLOQUEADO';

      const card = document.createElement('div');
      card.className = 'logro-card' + (tierIdx >= 0 ? ` tier-${tierIdx+1}` : '');
      card.innerHTML = `
        <div class="logro-icon">${ach.icon}</div>
        <div class="logro-name">${ach.name}</div>
        <div class="logro-tier-badge ${tClass}">${badgeTxt}</div>
        <div class="logro-prog-wrap">
          <div class="logro-prog-track"><div class="logro-prog-fill ${tClass}" style="width:${progPct}%"></div></div>
          <div class="logro-prog-label">${progTxt}</div>
        </div>`;
      card.addEventListener('click', () => openAchievementModal(ach.id));
      grid.appendChild(card);
    });
    catEl.appendChild(grid);
    wrap.appendChild(catEl);
  });
  panelContent.appendChild(wrap);
}

function openAchievementModal(achId) {
  const ach = ACHIEVEMENTS.find(a => a.id === achId); if (!ach) return;
  const count = getAchievementCount(ach);
  const awardedTier = state.achievements[ach.id] ?? -1;

  document.getElementById('modalTitle').textContent = '⟦ ACHIEVEMENT ⟧';
  document.getElementById('modalSaveBtn').style.display = 'none';
  _modalSaveHandler = null;

  const body = document.getElementById('modalBody');
  const statColor = ach.stat ? (STAT_COLORS[ach.stat]||'var(--sao-cyan-bright)') : '';

  body.innerHTML = `
    <div class="logro-detail-hdr">
      <div class="logro-detail-icon">${ach.icon}</div>
      <div>
        <div class="logro-detail-name">${ach.name}</div>
        <div class="logro-detail-desc">${ach.desc}</div>
        ${ach.stat ? `<div class="logro-detail-stat" style="color:${statColor}">STAT → ${ach.stat}</div>` : ''}
      </div>
    </div>
    <div style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:3px;color:var(--sao-cyan-bright);margin-bottom:10px;text-shadow:0 0 6px var(--sao-cyan)">⟦ TIERS ⟧</div>`;

  ach.tiers.forEach((tier, i) => {
    const unlocked  = i <= awardedTier;
    const isCurrent = i === awardedTier;
    const row = document.createElement('div');
    row.className = 'logro-tier-row' + (unlocked?' unlocked':'') + (isCurrent?' is-current':'');
    const statChip = ach.stat && tier.reward
      ? `<div class="logro-reward-chip logro-reward-stat" style="color:${statColor};border-color:${statColor}55">+${tier.reward} ${ach.stat}</div>`
      : '';
    const titleChip = tier.title
      ? `<div class="logro-reward-chip logro-reward-title">「${tier.title}」</div>`
      : '';
    row.innerHTML = `
      <div class="logro-tier-check">${unlocked?'✓':''}</div>
      <div class="logro-tier-info">
        <div class="logro-tier-label">${TIER_LABELS[i]} · ${tier.label}</div>
        <div class="logro-tier-count">${tier.count}× veces</div>
      </div>
      <div class="logro-tier-rewards">${statChip}${titleChip}</div>`;
    body.appendChild(row);
  });

  const progEl = document.createElement('div'); progEl.className = 'logro-detail-prog';
  progEl.textContent = `PROGRESO ACTUAL: ${count}`;
  body.appendChild(progEl);

  document.getElementById('habitModal').classList.add('open');
}

// ============================================================
// STREAK / COMPLETION HELPERS
// ============================================================
function getHabitStreak(habit) {
  const today = todayKey(); let streak=0; const d=new Date();
  if (!habit.done||!habit.done[today]) d.setDate(d.getDate()-1);
  while(true) {
    const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (habit.done&&habit.done[key]) { streak++; d.setDate(d.getDate()-1); } else break;
  }
  return streak;
}

function getCompletion(task, key) { const d=task.done[key]; if(!d) return null; if(typeof d==='object') return d; return {gains:task.gains,xp:task.xp}; }
function applyGains(gains, mul) { Object.entries(gains||{}).forEach(([k,v])=>{ state.stats[k]=Math.max(0,(state.stats[k]||0)+v*mul); }); }

function calcLevel(totalXp) { let level=1,needed=100,acc=0; while(totalXp>=acc+needed){acc+=needed;level++;needed=100+(level-1)*50;} return {level,currentLevelXp:totalXp-acc,neededForNext:needed}; }
function calcHpPct() { const t=state.habitos.length; if(!t) return 100; const done=state.habitos.filter(h=>h.done[todayKey()]).length; return Math.round(60+(done/t)*40); }
function calcMpPct() { const week=isoWeekKey(); const t=state.weekly.length; if(!t) return 100; const done=state.weekly.filter(w=>w.done[week]).length; return Math.round((done/t)*100); }

function calcMaxHP() {
  const lv=calcLevel(state.totalXp), st=state.stats, eq=getEquippedStats();
  return 100 + ((st.CON||0)+(eq.CON||0))*3 + ((st.CHA||0)+(eq.CHA||0))*2 + lv.level*10 + (eq.HP||0);
}
function calcMaxMP() {
  const lv=calcLevel(state.totalXp), st=state.stats, eq=getEquippedStats();
  return 50 + ((st.INT||0)+(eq.INT||0))*2 + ((st.VOL||0)+(eq.VOL||0))*2 + ((st.CHA||0)+(eq.CHA||0)) + lv.level*3 + (eq.MP||0);
}

// HP regen: 4% of maxHP per hour (full recovery ~25h passively)
// MP regen: 15% of maxMP per hour (full recovery ~7h passively)
function tickHpMp() {
  const maxHP=calcMaxHP(), maxMP=calcMaxMP();
  if (state.hp===null||state.hp===undefined) state.hp=maxHP;
  if (state.mp===null||state.mp===undefined) state.mp=maxMP;
  state.hp=Math.min(maxHP, Math.max(0, state.hp));
  state.mp=Math.min(maxMP, Math.max(0, state.mp));
  const now=Date.now();
  if (state.lastHpMpTick) {
    const mins=(now-state.lastHpMpTick)/60000;
    state.hp=Math.min(maxHP, state.hp + maxHP*0.000667*mins);  // 4%/hr
    state.mp=Math.min(maxMP, state.mp + maxMP*0.0025*mins);    // 15%/hr
  }
  state.lastHpMpTick=now;
}

// Returns {hp, mp} gained so caller can include in notification
function gainHpMpFromHabit(gains) {
  const g=gains||{};
  const hpBonus=((g.STR||0)+(g.DEX||0)+(g.CON||0))*3;
  const mpBonus=((g.INT||0)+(g.VOL||0)+(g.CHA||0))*5;
  if (!hpBonus && !mpBonus) return {hp:0,mp:0};
  const maxHP=calcMaxHP(), maxMP=calcMaxMP();
  if (hpBonus) state.hp=Math.min(maxHP,(state.hp||0)+hpBonus);
  if (mpBonus) state.mp=Math.min(maxMP,(state.mp||0)+mpBonus);
  return {hp:hpBonus, mp:mpBonus};
}

function updateStreakOnLoad() {
  const today=todayKey();
  if (state.lastActiveDay!==today) {
    const y=yesterdayKey();
    const yDone=state.habitos.filter(h=>h.done[y]).length;
    const yPct=state.habitos.length ? yDone/state.habitos.length : 0;
    if (state.lastActiveDay===y && yPct>=0.7) state.streak+=1;
    else if (state.lastActiveDay!==y) state.streak=0;
    state.lastActiveDay=today; saveState();
  }
}

// ============================================================
// AVATAR PHOTO
// ============================================================
const AVATAR_KEY = 'sao_habit_tracker_avatar';

function applyAvatar(dataUrl) {
  const frame = document.getElementById('avatarFrame');
  const letter = document.getElementById('avatarLetter');
  if (dataUrl) {
    letter.style.display = 'none';
    let img = frame.querySelector('img');
    if (!img) { img = document.createElement('img'); frame.appendChild(img); }
    img.src = dataUrl;
  } else {
    letter.style.display = '';
    const img = frame.querySelector('img');
    if (img) img.remove();
  }
}

function initAvatar() {
  const saved = localStorage.getItem(AVATAR_KEY);
  if (saved) applyAvatar(saved);

  document.getElementById('avatarInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      const dataUrl = ev.target.result;
      localStorage.setItem(AVATAR_KEY, dataUrl);
      applyAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
    this.value = '';
  });
}

// ============================================================
// DOM REFS
// ============================================================
const dateLabel=document.getElementById('dateLabel');
const lvNum=document.getElementById('lvNum'), hpText=document.getElementById('hpText'), hpFill=document.getElementById('hpFill');
const mpText=document.getElementById('mpText'), mpFill=document.getElementById('mpFill');
const xpText=document.getElementById('xpText'), xpFill=document.getElementById('xpFill');
const statStreak=document.getElementById('statStreak'), statQuests=document.getElementById('statQuests'), statWeek=document.getElementById('statWeek'), statCol=document.getElementById('statCol');
const panelTitle=document.getElementById('panelTitle'), panelSubtitle=document.getElementById('panelSubtitle'), panelContent=document.getElementById('panelContent');
const notification=document.getElementById('notification'), notifMsg=document.getElementById('notifMsg');

function setDateLabel() {
  const d=new Date();
  const days=['SUN','MON','TUE','WED','THU','FRI','SAT'], months=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  dateLabel.textContent=`${days[d.getDay()]} ${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function renderHeader() {
  const today=todayKey(), week=isoWeekKey();
  const lv=calcLevel(state.totalXp);
  lvNum.textContent=lv.level;
  document.getElementById('playerNameEl').textContent=state.playerName;
  document.getElementById('playerTagEl').textContent=state.playerTitle.toUpperCase();
  statStreak.textContent=state.streak;
  statQuests.textContent=`${state.habitos.filter(h=>h.done[today]).length}/${state.habitos.length}`;
  statWeek.textContent=`${state.weekly.filter(w=>w.done[week]).length}/${state.weekly.length}`;
  statCol.textContent=state.col;
  xpText.textContent=`${lv.currentLevelXp}/${lv.neededForNext}`;
  xpFill.style.width=`${(lv.currentLevelXp/lv.neededForNext)*100}%`;
  const maxHP=calcMaxHP(), maxMP=calcMaxMP();
  const curHP=Math.floor(state.hp!==null ? Math.min(state.hp,maxHP) : maxHP);
  const curMP=Math.floor(state.mp!==null ? Math.min(state.mp,maxMP) : maxMP);
  hpText.textContent=`${curHP}/${maxHP}`; hpFill.style.width=`${(curHP/maxHP)*100}%`;
  mpText.textContent=`${curMP}/${maxMP}`; mpFill.style.width=`${(curMP/maxMP)*100}%`;
}

// ============================================================
// RENDER QUEST ITEM
// ============================================================
function renderQuestItem(task, opts) {
  const done = !!task.done[opts.periodKey];
  const completion = getCompletion(task, opts.periodKey);
  const wrap = document.createElement('div');
  wrap.dataset.wrapId = task.id;
  const el = document.createElement('div');
  el.className = 'quest'+(done?' completed':'')+(opts.isWeekly?' weekly':'');
  el.dataset.taskId = task.id;

  const ring = document.createElement('div'); ring.className='check-ring';
  const txt = document.createElement('div'); txt.className='quest-text'; txt.textContent=task.text;

  if (done && completion && completion.tierId) {
    const badge=document.createElement('span'); badge.className='tier-badge'; badge.textContent=completion.label||completion.tierId; txt.appendChild(badge);
  } else if (task.tiers && !done) {
    const mark=document.createElement('span'); mark.className='scalable-mark'; mark.textContent='▾'; mark.title='Scalable session'; txt.appendChild(mark);
  }

  const gains=document.createElement('div'); gains.className='gains';
  const showGains=(done&&completion)?completion.gains:task.gains;
  Object.entries(showGains||{}).forEach(([stat,val])=>{ const chip=document.createElement('span'); chip.className=`gain-chip gain-${stat}`; chip.textContent=`${stat}+${val}`; gains.appendChild(chip); });

  if (opts.allowReorder) { const h=document.createElement('div'); h.className='drag-handle'; h.textContent='⠿'; el.appendChild(h); }
  el.appendChild(ring); el.appendChild(txt); el.appendChild(gains);

  // Streak badge
  if (opts.listKey!=='trabajo') {
    const streak=getHabitStreak(task);
    if (streak>0) {
      const isMil=streak>=15&&streak%15===0;
      if (isMil) el.classList.add('streak-milestone');
      const badge=document.createElement('div'); badge.className='streak-badge'+(isMil?' milestone':'');
      badge.innerHTML=`<span class="streak-fire">🔥</span><span>${streak}</span>`;
      el.appendChild(badge);
    }
  }

  // Action buttons (edit + delete)
  const actions=document.createElement('div'); actions.className='quest-actions';
  if (opts.allowEdit) {
    const editBtn=document.createElement('button'); editBtn.className='quest-action-btn edit'; editBtn.title='Edit'; editBtn.textContent='✎';
    editBtn.addEventListener('click',(e)=>{ e.stopPropagation(); openHabitModal('edit', opts.listKey, task.id); });
    actions.appendChild(editBtn);
  }
  if (opts.allowDelete) {
    const delBtn=document.createElement('button'); delBtn.className='quest-action-btn del'; delBtn.title='Delete'; delBtn.textContent='✕';
    delBtn.addEventListener('click',(e)=>{ e.stopPropagation(); if(confirm(`Delete "${task.text}"?`)) { deleteTask(opts.listKey, task.id); } });
    actions.appendChild(delBtn);
  }
  if (actions.children.length) el.appendChild(actions);

  el.addEventListener('click',(e)=>{
    if(e.target.classList.contains('quest-action-btn')) return;
    if(task.tiers&&!done){ openTierFor=(openTierFor===task.id)?null:task.id; renderAll(); }
    else { toggleQuest(opts.listKey, opts.periodKey, task.id); }
  });

  wrap.appendChild(el);

  if (task.tiers&&!done&&openTierFor===task.id) {
    const sel=document.createElement('div'); sel.className='tier-selector show';
    const prompt=document.createElement('div'); prompt.className='tier-prompt'; prompt.textContent='⟦ SELECT INTENSITY ⟧'; sel.appendChild(prompt);
    const grid=document.createElement('div'); grid.className='tier-grid';
    task.tiers.forEach(tier=>{
      const btn=document.createElement('button'); btn.className='tier-btn'+(tier.elite?' elite':'');
      const time=document.createElement('div'); time.className='tier-time'; time.textContent=tier.label; btn.appendChild(time);
      const sub=document.createElement('div'); sub.className='tier-gains-line'; sub.textContent=tier.sub||''; btn.appendChild(sub);
      const gl=document.createElement('div'); gl.className='tier-gains-line'; gl.style.color='var(--sao-cyan-bright)'; gl.textContent=Object.entries(tier.gains).map(([k,v])=>`${k}+${v}`).join(' '); btn.appendChild(gl);
      const xl=document.createElement('div'); xl.className='tier-gains-line'; xl.style.color='var(--sao-gold-soft)'; xl.textContent=`+${tier.xp} EXP`; btn.appendChild(xl);
      btn.addEventListener('click',(e)=>{ e.stopPropagation(); completeTiered(opts.listKey,opts.periodKey,task.id,tier); });
      grid.appendChild(btn);
    });
    sel.appendChild(grid); wrap.appendChild(sel);
  }

  return wrap;
}

function makeSortable(listEl, listKey) {
  let dragId = null;
  listEl.querySelectorAll('.drag-handle').forEach(handle => {
    const quest = handle.closest('[data-task-id]');
    handle.addEventListener('pointerdown', e => {
      e.preventDefault();
      dragId = quest.dataset.taskId;
      quest.classList.add('dragging');
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener('pointermove', e => {
      if (!dragId || dragId !== quest.dataset.taskId) return;
      const wraps = Array.from(listEl.querySelectorAll('[data-wrap-id]'));
      const targetWrap = wraps.find(w => { const r=w.getBoundingClientRect(); return e.clientY>=r.top && e.clientY<=r.bottom; });
      listEl.querySelectorAll('.quest').forEach(q => q.classList.remove('drag-over-top','drag-over-bottom'));
      if (targetWrap && targetWrap.dataset.wrapId !== dragId) {
        const tq = targetWrap.querySelector('.quest');
        if (tq) { const r=targetWrap.getBoundingClientRect(); tq.classList.add(e.clientY < r.top+r.height/2 ? 'drag-over-top' : 'drag-over-bottom'); }
      }
    });
    const finishDrag = e => {
      if (!dragId || dragId !== quest.dataset.taskId) return;
      const wraps = Array.from(listEl.querySelectorAll('[data-wrap-id]'));
      const targetWrap = wraps.find(w => { const r=w.getBoundingClientRect(); return e.clientY>=r.top && e.clientY<=r.bottom; });
      listEl.querySelectorAll('.quest').forEach(q => q.classList.remove('dragging','drag-over-top','drag-over-bottom'));
      if (targetWrap && targetWrap.dataset.wrapId !== dragId) {
        const tgtId = targetWrap.dataset.wrapId;
        const r = targetWrap.getBoundingClientRect();
        const before = e.clientY < r.top + r.height/2;
        const arr = state[listKey];
        const srcIdx = arr.findIndex(t => t.id === dragId);
        const [moved] = arr.splice(srcIdx, 1);
        const tgtIdx = arr.findIndex(t => t.id === tgtId);
        arr.splice(before ? tgtIdx : tgtIdx+1, 0, moved);
        saveState(); renderAll();
      }
      dragId = null;
    };
    handle.addEventListener('pointerup', finishDrag);
    handle.addEventListener('pointercancel', finishDrag);
  });
}

function renderQuestList(list, opts) {
  const wrap=document.createElement('div'); wrap.className='quest-list';
  list.forEach(task=>wrap.appendChild(renderQuestItem(task,opts)));
  if (opts.allowReorder) makeSortable(wrap, opts.listKey);
  return wrap;
}

// ============================================================
// RENDER TABS
// ============================================================
function renderHabitos() {
  panelTitle.textContent='DAILY QUESTS';
  panelContent.innerHTML='';
  const today=todayKey();
  const isToday=activeDate===today;
  panelSubtitle.textContent=isToday?"Today's missions":`Registrando: ${activeDate}`;

  // Date banner when viewing a past/future day
  if(!isToday){
    const MONTHS_EN=['January','February','March','April','May','June','July','August','September','October','November','December'];
    const [sy,sm,sd]=activeDate.split('-');
    const banner=document.createElement('div'); banner.className='date-banner';
    const btxt=document.createElement('div'); btxt.className='date-banner-text';
    btxt.textContent=`⟦ ${MONTHS_EN[parseInt(sm)-1].toUpperCase()} ${parseInt(sd)}, ${sy} ⟧`;
    const hoyBtn=document.createElement('button'); hoyBtn.className='date-banner-btn'; hoyBtn.textContent='← TODAY';
    hoyBtn.addEventListener('click',()=>{ activeDate=today; renderAll(); });
    banner.appendChild(btxt); banner.appendChild(hoyBtn);
    panelContent.appendChild(banner);
  }

  const week=isoWeekKey(new Date(activeDate+'T12:00:00'));

  // DAILY section
  const dh=document.createElement('div'); dh.className='section-header';
  const dAddBtn=document.createElement('button'); dAddBtn.className='add-habit-btn'; dAddBtn.textContent='+'; dAddBtn.title='New daily habit';
  dAddBtn.addEventListener('click',()=>openHabitModal('add','habitos',null));
  dh.innerHTML=`<span class="section-label">⟦ DAILY ⟧</span><div class="section-line"></div><span class="section-meta">${state.habitos.filter(h=>h.done[activeDate]).length}/${state.habitos.length}</span>`;
  const dMarkBtn=document.createElement('button'); dMarkBtn.className='bulk-btn mark'; dMarkBtn.textContent='MARK ALL';
  dMarkBtn.addEventListener('click',()=>markAllHabits('habitos',activeDate));
  const dUnmarkBtn=document.createElement('button'); dUnmarkBtn.className='bulk-btn unmark'; dUnmarkBtn.textContent='UNMARK';
  dUnmarkBtn.addEventListener('click',()=>unmarkAllHabits('habitos',activeDate));
  dh.appendChild(dMarkBtn); dh.appendChild(dUnmarkBtn); dh.appendChild(dAddBtn);
  panelContent.appendChild(dh);
  panelContent.appendChild(renderQuestList(state.habitos,{listKey:'habitos',periodKey:activeDate,isWeekly:false,allowEdit:true,allowDelete:true,allowReorder:true}));

  // WEEKLY section
  const wh=document.createElement('div'); wh.className='section-header weekly';
  const wAddBtn=document.createElement('button'); wAddBtn.className='add-habit-btn gold'; wAddBtn.textContent='+'; wAddBtn.title='New weekly mission';
  wAddBtn.addEventListener('click',()=>openHabitModal('add','weekly',null));
  wh.innerHTML=`<span class="section-label gold">⟦ WEEKLY ⟧</span><div class="section-line gold"></div><span class="section-meta">${state.weekly.filter(w=>w.done[week]).length}/${state.weekly.length} this week</span>`;
  wh.appendChild(wAddBtn);
  panelContent.appendChild(wh);
  panelContent.appendChild(renderQuestList(state.weekly,{listKey:'weekly',periodKey:week,isWeekly:true,allowEdit:true,allowDelete:true,allowReorder:true}));

  panelContent.appendChild(renderFooter('habitos'));
}

function renderTrabajo() {
  panelTitle.textContent='WORK MISSIONS'; panelSubtitle.textContent='Tasks & Dungeon Exploration';
  panelContent.innerHTML='';
  // Dungeon section
  const dungeonWrap=document.createElement('div'); dungeonWrap.className='dungeon-section';
  dungeonWrap.appendChild(renderDungeon());
  panelContent.appendChild(dungeonWrap);
  // Practice Arena (only when no dungeon active)
  if (!state.dungeon) panelContent.appendChild(renderPracticeArena());
  // Divider
  const div=document.createElement('div'); div.className='dungeon-divider';
  div.innerHTML='<span>⟦ WORK QUESTS ⟧</span>'; panelContent.appendChild(div);
  const today=todayKey();
  if (state.trabajo.length===0) {
    const empty=document.createElement('div'); empty.className='empty-state';
    empty.innerHTML=`<div class="empty-icon">⚔</div><div class="empty-text">⟦ NO ACTIVE QUESTS ⟧</div><div class="empty-sub">Add work tasks to start your day.</div>`;
    panelContent.appendChild(empty);
  } else {
    panelContent.appendChild(renderQuestList(state.trabajo,{listKey:'trabajo',periodKey:today,isWeekly:false,allowDelete:true}));
  }
  const form=document.createElement('div'); form.className='add-task-form';
  form.innerHTML=`<input type="text" class="add-task-input" id="taskInput" placeholder="New mission... (e.g. Review PR #42)" maxlength="80"><button class="add-btn" id="addBtn">+ ADD</button>`;
  panelContent.appendChild(form);
  document.getElementById('addBtn').addEventListener('click',addTask);
  document.getElementById('taskInput').addEventListener('keydown',e=>{ if(e.key==='Enter') addTask(); });
  panelContent.appendChild(renderFooter('trabajo'));
}

function renderFooter(tabKey) {
  const today=todayKey(), week=isoWeekKey();
  let text='';
  if (tabKey==='habitos') { const dD=state.habitos.filter(t=>t.done[today]).length, wD=state.weekly.filter(t=>t.done[week]).length; text=`${dD}/${state.habitos.length} DAY · ${wD}/${state.weekly.length} WEEK`; }
  else { const done=state.trabajo.filter(t=>t.done[today]).length; text=`${done}/${state.trabajo.length} COMPLETE`; }
  const f=document.createElement('div'); f.className='footer-actions';
  f.innerHTML=`<div class="progress-text">${text}</div><button class="reset-btn" id="resetBtn">⟲ RESET DAY</button>`;
  f.querySelector('#resetBtn').addEventListener('click',()=>{
    if(!confirm("Reset today's progress? All checks will be cleared and stats gained today will be reversed.")) return;
    [...state.habitos,...state.trabajo].forEach(t=>{ if(t.done[today]){const c=getCompletion(t,today);if(c){applyGains(c.gains,-1);state.totalXp=Math.max(0,state.totalXp-(c.xp||0));}delete t.done[today];}});
    saveState(); renderAll();
  });
  return f;
}

function renderPersonaje() {
  panelTitle.textContent='CHARACTER STATUS'; panelSubtitle.textContent='Player attributes';
  const total=STAT_KEYS.reduce((s,k)=>s+state.stats[k],0);
  const sorted=STAT_KEYS.slice().sort((a,b)=>state.stats[b]-state.stats[a]);
  const top1=sorted[0], top2=sorted[1];
  const COMBO={'STR+CON':{name:'PALADIN',tag:'Offensive tank. Shield and sword'},'STR+DEX':{name:'DUELIST',tag:'Agile swordsman, Kirito style'},'STR+VOL':{name:'CRUSADER',tag:'Warrior with purpose'},'STR+INT':{name:'BATTLE MAGE',tag:'Spellsword of war'},'STR+CHA':{name:'WARLORD',tag:'Leader who commands fear'},'DEX+CON':{name:'RANGER',tag:'Resilient hunter, born explorer'},'DEX+INT':{name:'ASSASSIN',tag:'Poison and calculated precision'},'DEX+VOL':{name:'NINJA',tag:'Stealth and discipline'},'DEX+CHA':{name:'TRICKSTER',tag:'Charismatic rogue'},'CON+INT':{name:'ALCHEMIST',tag:'Body and mind in balance'},'CON+VOL':{name:'TEMPLAR',tag:'Unbreakable endurance'},'CON+CHA':{name:'KEEPER',tag:'Warm and steadfast guardian'},'INT+VOL':{name:'ARCHMAGE',tag:'Sharp mind with iron will'},'INT+CHA':{name:'LOREMASTER',tag:'Influential scholar'},'VOL+CHA':{name:'PROPHET',tag:'Disciplined leader who inspires others'}};
  const SOLO={STR:{name:'BERSERKER',tag:'Pure raw strength'},DEX:{name:'SCOUT',tag:'Speed, stealth, precision'},CON:{name:'GUARDIAN',tag:'Unbreakable endurance'},INT:{name:'MAGE',tag:'Deep knowledge'},VOL:{name:'MONK',tag:'Discipline and inner mastery'},CHA:{name:'BARD',tag:'A voice that moves hearts'}};
  let klass;
  if (total===0) klass={name:'BEGINNER',tag:'Your journey begins'};
  else if (state.stats[top2]===0||state.stats[top2]<state.stats[top1]*0.4) klass=SOLO[top1];
  else { const key=[top1,top2].sort().join('+'); klass=COMBO[key]||SOLO[top1]; }
  panelContent.innerHTML=`<div class="character-grid"><div class="radar-card"><div class="radar-title">⟦ STAT MATRIX ⟧</div><canvas id="radarCanvas"></canvas></div><div class="stats-list" id="statsList"></div></div><div class="character-summary"><div class="summary-class">⟦ ${klass.name} ⟧</div><div class="summary-tagline">${klass.tag}</div></div><div id="combatStatsEl"></div>`;
  const sl=document.getElementById('statsList');
  const SCOL = { STR:'#ff8a80', DEX:'#b9f6ca', CON:'#ffd180', INT:'#82b1ff', VOL:'#ce93d8', CHA:'#ffe082' };

  STAT_KEYS.forEach(k => {
    const pts = state.stats[k], t = tierFor(pts);
    const nextTier = TIERS[TIERS.findIndex(x => x.t === t.tier)+1];
    const isOpen = openStatKey === k;

    const wrap = document.createElement('div'); wrap.className = 'stat-row-wrap';

    const row = document.createElement('div');
    row.className = `stat-row ${k}${isOpen ? ' stat-row-open' : ''}`;
    row.innerHTML = `
      <div class="stat-row-top">
        <div class="stat-name-block"><span class="stat-code">${k}</span><span class="stat-full-name">${STAT_NAMES[k]}</span></div>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="stat-tier">RANK ${t.tier}</div>
          <span style="font-family:'Cinzel',serif;font-size:9px;color:var(--sao-text-dim)">${isOpen?'▲':'▼'}</span>
        </div>
      </div>
      <div class="stat-row-bar"><div class="stat-row-fill" style="width:${t.pctToNext}%"></div></div>
      <div class="stat-row-foot">
        <span class="stat-points">${pts} PTS</span>
        <span>${t.capped?'MAX RANK':`→ ${t.nextMin-pts} pts to Rank ${nextTier.t}`}</span>
      </div>`;
    row.addEventListener('click', () => { openStatKey = openStatKey===k ? null : k; renderPersonaje(); });
    wrap.appendChild(row);

    if (isOpen) {
      const gains = calcMaxDailyStatGain(k);
      const maxTotal = gains.total;
      const sc = SCOL[k];

      // ── Sources ──────────────────────────────
      const srcParts = [];
      state.habitos.forEach(h => {
        const g = h.tiers && h.tiers.length
          ? (h.tiers[h.tiers.length-1].gains||{})[k]||0
          : (h.gains||{})[k]||0;
        if (g > 0) srcParts.push(`${h.text.split(' ').slice(0,4).join(' ')}… <span style="color:${sc}">+${g}</span>`);
      });
      state.weekly.forEach(w => {
        const g = (w.gains||{})[k]||0;
        if (g > 0) srcParts.push(`${w.text.split(' ').slice(0,4).join(' ')}… <span style="color:var(--sao-gold-soft)">+${g}/wk</span>`);
      });

      const detail = document.createElement('div'); detail.className = 'stat-detail';

      const srcEl = document.createElement('div'); srcEl.className = 'stat-detail-sources';
      srcEl.innerHTML = `<strong>⟦ SOURCES ⟧</strong>${srcParts.length ? srcParts.join('  ·  ') : `<span style="color:rgba(255,100,100,0.6)">No active habit provides ${k}</span>`}`;
      detail.appendChild(srcEl);

      // ── Ranks table ──────────────────────────
      const currentRankIdx = TIERS.findIndex(x => x.t === t.tier);
      const table = document.createElement('table'); table.className = 'stat-detail-table';
      table.innerHTML = `<thead class="stat-detail-thead"><tr><th>RANK</th><th>TOTAL PTS</th><th>NEEDED</th><th>ETA</th></tr></thead>`;
      const tbody = document.createElement('tbody');

      TIERS.forEach((tier, i) => {
        const isPast    = i < currentRankIdx;
        const isCurrent = tier.t === t.tier;
        const tr = document.createElement('tr');
        tr.className = 'stat-detail-tr' + (isCurrent ? ' is-current' : '');

        const delta = tier.min - pts;
        const etaDays = (!isCurrent && !isPast && maxTotal > 0) ? Math.ceil(delta / maxTotal) : null;
        const etaColor = etaDays===null ? '' : etaDays<=30 ? 'var(--sao-green)' : etaDays<=90 ? '#fdd835' : etaDays<=180 ? 'var(--sao-gold-soft)' : 'var(--sao-text-dim)';

        let rankHtml, ptsHtml, deltaHtml, etaHtml;

        if (isPast) {
          rankHtml  = `<span style="color:${sc};opacity:0.35;font-weight:700">${tier.t}</span>`;
          ptsHtml   = `<span style="opacity:0.35">${tier.min.toLocaleString()}</span>`;
          deltaHtml = `<span style="color:var(--sao-green);font-size:10px">✓</span>`;
          etaHtml   = `<span style="color:var(--sao-green);font-size:10px">Done</span>`;
        } else if (isCurrent) {
          rankHtml  = `<span style="color:${sc};font-weight:700;text-shadow:0 0 8px ${sc}60">${tier.t} ◀</span>`;
          ptsHtml   = `<span style="color:#fff">${tier.min.toLocaleString()} — <span style="color:${sc}">${pts}</span></span>`;
          deltaHtml = `<span style="color:var(--sao-cyan-bright)">Current</span>`;
          etaHtml   = `<span style="color:var(--sao-cyan-bright)">—</span>`;
        } else {
          rankHtml  = `<span style="color:${sc};font-weight:700">${tier.t}</span>`;
          ptsHtml   = `<span style="color:var(--sao-text-dim)">${tier.min.toLocaleString()}</span>`;
          deltaHtml = `<span style="color:var(--sao-gold-soft)">+${delta.toLocaleString()}</span>`;
          etaHtml   = etaDays!==null
            ? `<span style="color:${etaColor}">~${etaDays} days</span>`
            : `<span style="color:var(--sao-text-dim)">—</span>`;
        }

        tr.innerHTML = `<td class="stat-detail-td">${rankHtml}</td><td class="stat-detail-td">${ptsHtml}</td><td class="stat-detail-td">${deltaHtml}</td><td class="stat-detail-td">${etaHtml}</td>`;
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      detail.appendChild(table);

      // ── Max gain footer ───────────────────────
      const gainEl = document.createElement('div'); gainEl.className = 'stat-detail-maxgain';
      const parts = [];
      if (gains.daily > 0) parts.push(`<span style="color:var(--sao-cyan-bright)">+${gains.daily} daily</span>`);
      if (gains.weeklyPerDay > 0) parts.push(`<span style="color:var(--sao-gold-soft)">+${gains.weeklyPerDay.toFixed(2)}/day (weekly)</span>`);
      if (maxTotal > 0) parts.push(`<span style="color:#fff">= <strong>+${maxTotal.toFixed(2)} max/day</strong></span>`);
      else parts.push(`<span style="color:rgba(255,100,100,0.6)">No habits with ${k}</span>`);
      gainEl.innerHTML = `<span>⚡</span>${parts.join('<span style="opacity:0.4"> · </span>')}`;
      detail.appendChild(gainEl);

      wrap.appendChild(detail);
    }
    sl.appendChild(wrap);
  });
  drawRadar();
  renderCombatStats();
}

function renderCombatStats() {
  const el = document.getElementById('combatStatsEl'); if (!el) return;
  const lv = calcLevel(state.totalXp), st = state.stats;
  const eq = getEquippedStats();
  const STR=(st.STR||0)+(eq.STR||0), DEX=(st.DEX||0)+(eq.DEX||0), CON=(st.CON||0)+(eq.CON||0);
  const INT=(st.INT||0)+(eq.INT||0), VOL=(st.VOL||0)+(eq.VOL||0), CHA=(st.CHA||0)+(eq.CHA||0);

  const pAtk        = 10 + STR*2 + (eq.ATK||0);
  const pDef        = 5  + CON   + (eq.DEF||0);
  const pMaxHP      = 100 + CON*3 + CHA*2 + lv.level*10 + (eq.HP||0);
  const pMaxMP      = 50  + INT*2 + VOL*2 + CHA + lv.level*3 + (eq.MP||0);
  const pCrit       = Math.min(50, DEX*1.5 + (eq.critBonus||0));
  const pCritDmg    = 150 + Math.floor(STR*0.5 + VOL*0.3);
  const pDblAtk     = Math.min(30, DEX*0.3);
  const pEvasion    = Math.min(35, DEX*0.4 + (eq.dodgeBonus||0));
  const pBlock      = Math.min(25, CON*0.2 + (eq.blockBonus||0));
  const pDmgReduc   = Math.floor(pDef / (pDef + 100) * 100);
  const pHealRate   = Math.floor(100 + CON*0.5 + CHA*0.5);
  const pMpRegen    = 6 + Math.floor(INT*0.05);
  const pSkillPow   = Math.floor((1 + VOL*0.005) * 100);
  const pMagicPow   = Math.floor((1 + INT*0.008) * 100);
  const pPetAtk     = Math.floor(CHA*1.5);

  function card(icon, name, value, unit, source, color, isZero) {
    return `<div class="cstat-card${isZero?' cstat-zero':''}" style="--cc:${color}">
      <div class="cstat-icon">${icon}</div>
      <div class="cstat-name">${name}</div>
      <div class="cstat-value">${value}<span class="cstat-unit">${unit}</span></div>
      <div class="cstat-source">${source}</div>
    </div>`;
  }
  function catHdr(label, lineColor) {
    return `<div class="cstat-cat-hdr"><span class="cstat-cat-label">⟦ ${label} ⟧</span><div class="cstat-cat-line" style="background:linear-gradient(90deg,${lineColor}50,transparent)"></div></div>`;
  }

  el.innerHTML = `<div class="combat-stats-section">
    <div class="cstat-category">
      ${catHdr('BASE COMBAT','#4dd0e1')}
      <div class="cstat-grid">
        ${card('⚔','ATK DAMAGE', pAtk, '', 'STR × 2 + equip', '#ff8a80', pAtk<=10)}
        ${card('🛡','DEFENSE',    pDef, '', 'CON + equip',      '#ffd180', pDef<=5)}
        ${card('❤','MAX HP',     pMaxHP, '', 'CON × 3 + CHA × 2 + LVL', '#76ff03', false)}
        ${card('💧','MAX MP',    pMaxMP, '', 'INT × 2 + VOL × 2 + CHA', '#4dd0e1', false)}
      </div>
    </div>
    <div class="cstat-category">
      ${catHdr('OFFENSIVE','#ff8a80')}
      <div class="cstat-grid">
        ${card('🎯','CRIT CHANCE',   pCrit.toFixed(1),   '%', 'DEX × 1.5 (cap 50%)', '#ff7043',  pCrit===0)}
        ${card('💥','CRIT DMG',      pCritDmg,           '%', 'STR × 0.5 + VOL × 0.3', '#ff5252', false)}
        ${card('⚡','DOUBLE STRIKE', pDblAtk.toFixed(1), '%', 'DEX × 0.3 (cap 30%)', '#ffab40',  pDblAtk===0)}
        ${card('✨','SKILL POWER',   pSkillPow,          '%', 'VOL × 0.5% bonus',    '#ce93d8',  pSkillPow===100)}
        ${card('🔮','MAGIC POWER',   pMagicPow,          '%', 'INT × 0.8% bonus',    '#82b1ff',  pMagicPow===100)}
      </div>
    </div>
    <div class="cstat-category">
      ${catHdr('DEFENSIVE','#ffd180')}
      <div class="cstat-grid">
        ${card('👁','EVASION RATE',  pEvasion.toFixed(1),'%', 'DEX × 0.4 (cap 35%)', '#b9f6ca',  pEvasion===0)}
        ${card('🔰','BLOCK RATE',    pBlock.toFixed(1),  '%', 'CON × 0.2 (cap 25%)', '#ffd180',  pBlock===0)}
        ${card('🧲','DMG REDUCTION', pDmgReduc,          '%', 'DEF ÷ (DEF+100)',      '#ffc107',  pDmgReduc===0)}
        ${card('💚','HEAL RATE',     pHealRate,          '%', 'CON × 0.5 + CHA × 0.5','#69f0ae', false)}
      </div>
    </div>
    <div class="cstat-category">
      ${catHdr('SUPPORT','#ce93d8')}
      <div class="cstat-grid">
        ${card('🔵','MP REGEN',   pMpRegen, '/turn', 'INT × 0.05 + base 6',  '#4dd0e1', false)}
        ${card('🐾','PET DAMAGE', pPetAtk,  '',      'CHA × 1.5',            '#ffe082',  pPetAtk===0)}
      </div>
    </div>
  </div>`;
}

function calcMaxDailyStatGain(statKey) {
  let daily = 0;
  state.habitos.forEach(h => {
    if (h.tiers && h.tiers.length) {
      daily += (h.tiers[h.tiers.length-1].gains || {})[statKey] || 0;
    } else {
      daily += (h.gains || {})[statKey] || 0;
    }
  });
  let weeklyTotal = 0;
  state.weekly.forEach(w => { weeklyTotal += (w.gains || {})[statKey] || 0; });
  const weeklyPerDay = weeklyTotal / 7;
  return { daily, weeklyPerDay, total: daily + weeklyPerDay };
}

function drawRadar() {
  const canvas=document.getElementById('radarCanvas'); if(!canvas) return;
  if(radarChart) radarChart.destroy();
  const rankIndex=k=>TIERS.findIndex(t=>t.t===tierFor(state.stats[k]).tier);
  const data=STAT_KEYS.map(k=>rankIndex(k)), maxData=TIERS.length-1;
  const rankPlugin={id:'radarRanks',afterDraw(chart){
    const ctx=chart.ctx, scale=chart.scales.r;
    if(!scale._pointLabelItems) return;
    ctx.save();
    ctx.font='700 11px "Cinzel",serif';
    ctx.fillStyle='#ffc107';
    ctx.textBaseline='top';
    scale._pointLabelItems.forEach((item,i)=>{
      const rank=tierFor(state.stats[STAT_KEYS[i]]).tier;
      ctx.textAlign=item.textAlign||'center';
      ctx.shadowColor='rgba(255,193,7,0.7)'; ctx.shadowBlur=6;
      ctx.fillText(rank, item.x, item.bottom+2);
    });
    ctx.restore();
  }};
  radarChart=new Chart(canvas,{type:'radar',plugins:[rankPlugin],data:{labels:STAT_KEYS,datasets:[{data,fill:true,backgroundColor:'rgba(77,208,225,0.25)',borderColor:'rgba(77,208,225,0.9)',borderWidth:2,pointBackgroundColor:'#ffc107',pointBorderColor:'#fff',pointHoverBackgroundColor:'#fff',pointHoverBorderColor:'#ffc107',pointRadius:4,pointHoverRadius:6}]},options:{responsive:true,maintainAspectRatio:false,layout:{padding:{bottom:22}},plugins:{legend:{display:false},tooltip:{backgroundColor:'rgba(6,26,43,0.95)',borderColor:'#4dd0e1',borderWidth:1,titleColor:'#ffc107',bodyColor:'#e0f7fa',titleFont:{family:'Cinzel',size:12},bodyFont:{family:'Rajdhani',size:13}}},scales:{r:{min:0,max:maxData,angleLines:{color:'rgba(77,208,225,0.25)'},grid:{color:'rgba(77,208,225,0.18)'},pointLabels:{color:'#80deea',font:{family:'Cinzel',size:12,weight:'700'},padding:14},ticks:{display:false,stepSize:maxData/4}}}}});
}

// ============================================================
// HISTORY TAB
// ============================================================
let historyPeriod = '7';
let historySelectedDay = null;
let historyCustomFrom = null;
let historyCustomTo = null;

function histFmt(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

function getHistRange() {
  const now = new Date(), t = histFmt(now);
  switch(historyPeriod) {
    case 'today': return [t, t];
    case 'yesterday': { const y=new Date(now); y.setDate(y.getDate()-1); const s=histFmt(y); return [s,s]; }
    case '7':  { const s=new Date(now); s.setDate(s.getDate()-6);  return [histFmt(s),t]; }
    case '14': { const s=new Date(now); s.setDate(s.getDate()-13); return [histFmt(s),t]; }
    case '30': { const s=new Date(now); s.setDate(s.getDate()-29); return [histFmt(s),t]; }
    case 'custom': return [historyCustomFrom||t, historyCustomTo||t];
    default: return [t,t];
  }
}

function getDaysInRange(from, to) {
  const days=[], d=new Date(from+'T12:00:00'), end=new Date(to+'T12:00:00');
  while(d<=end){ days.push(histFmt(d)); d.setDate(d.getDate()+1); }
  return days;
}

function getHabitPct(dateKey) {
  const t=state.habitos.length; if(!t) return null;
  const done=state.habitos.filter(h=>!!h.done[dateKey]).length;
  return { pct: Math.round((done/t)*100), done, total: t };
}

function toggleHistoryQuest(listKey, dateKey, taskId) {
  const task=state[listKey].find(t=>t.id===taskId); if(!task) return;
  const wasDone=!!task.done[dateKey];
  if(wasDone) {
    const c=getCompletion(task,dateKey);
    if(c){ applyGains(c.gains,-1); state.totalXp=Math.max(0,state.totalXp-(c.xp||0)); state.col=Math.max(0,state.col-(c.xp||0)); }
    delete task.done[dateKey];
    showNotif(`↩ -${task.xp||0} EXP reverted`);
  } else {
    task.done[dateKey]=true;
    const prevLv=calcLevel(state.totalXp).level;
    const _pt={}; STAT_KEYS.forEach(k=>{_pt[k]=tierFor(state.stats[k]).tier;});
    state.totalXp+=(task.xp||0); applyGains(task.gains,1);
    const hpmp=gainHpMpFromHabit(task.gains);
    const newLv=calcLevel(state.totalXp).level;
    const _hpmpStr=[hpmp.hp>0?`❤+${hpmp.hp}`:'',hpmp.mp>0?`💧+${hpmp.mp}`:''].filter(Boolean).join(' ');
    showNotif(`+${task.xp||0} EXP · ${Object.entries(task.gains||{}).map(([k,v])=>`${k}+${v}`).join(' ')}${_hpmpStr?' · '+_hpmpStr:''}`);
    if(newLv>prevLv) afterLevelUp(newLv); else checkStatRankUps(task.gains,_pt);
  }
  saveState(); renderHistory(); renderHeader();
}

function renderHistory() {
  panelTitle.textContent='HISTORY'; panelSubtitle.textContent='Past performance';
  panelContent.innerHTML='';

  // Period selector
  const PERIODS=[{k:'today',l:'TODAY'},{k:'yesterday',l:'YESTERDAY'},{k:'7',l:'7 DAYS'},{k:'14',l:'14 DAYS'},{k:'30',l:'30 DAYS'},{k:'custom',l:'CUSTOM'}];
  const sel=document.createElement('div'); sel.className='period-selector';
  PERIODS.forEach(p=>{
    const btn=document.createElement('button'); btn.className='period-btn'+(historyPeriod===p.k?' active':'');
    btn.textContent=p.l;
    btn.addEventListener('click',()=>{ historyPeriod=p.k; if(p.k!=='custom') historySelectedDay=null; renderHistory(); });
    sel.appendChild(btn);
  });
  panelContent.appendChild(sel);

  // Custom range inputs
  if(historyPeriod==='custom') {
    const cr=document.createElement('div'); cr.className='custom-range';
    cr.innerHTML=`<span class="m-label" style="margin:0;white-space:nowrap">DE</span><input type="date" class="m-input" id="histFrom" value="${historyCustomFrom||''}"><span class="m-label" style="margin:0;white-space:nowrap">A</span><input type="date" class="m-input" id="histTo" value="${historyCustomTo||''}">`;
    panelContent.appendChild(cr);
    document.getElementById('histFrom').addEventListener('change',e=>{ historyCustomFrom=e.target.value; if(historyCustomFrom&&historyCustomTo) renderHistory(); });
    document.getElementById('histTo').addEventListener('change',e=>{ historyCustomTo=e.target.value; if(historyCustomFrom&&historyCustomTo) renderHistory(); });
    if(!historyCustomFrom||!historyCustomTo) return;
  }

  const [fromDate,toDate]=getHistRange();
  const days=getDaysInRange(fromDate,toDate);
  const todayStr=todayKey();
  if(days.length===1&&!historySelectedDay) historySelectedDay=days[0];

  // Chart
  const MONTHS=['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
  const chartSec=document.createElement('div'); chartSec.className='chart-section';
  const chartTitle=document.createElement('div'); chartTitle.className='chart-title'; chartTitle.textContent='DAILY HABIT COMPLETION RATE';
  chartSec.appendChild(chartTitle);

  const scroll=document.createElement('div'); scroll.className='chart-scroll';
  const barsRow=document.createElement('div'); barsRow.className='chart-bars-row';
  const lblRow=document.createElement('div'); lblRow.className='chart-label-row';

  days.forEach(dateKey=>{
    const info=getHabitPct(dateKey);
    const pct=info?info.pct:0;
    const isSel=historySelectedDay===dateKey;
    const isToday=dateKey===todayStr;
    const clickFn=()=>{ historySelectedDay=(historySelectedDay===dateKey&&days.length>1)?null:dateKey; renderHistory(); };

    // Bar con % dentro (altura escalada al container de 90px)
    const bar=document.createElement('div');
    bar.className='chart-bar'+(isSel?' bar-sel':'');
    if(!info||info.total===0){ bar.classList.add('bar-empty'); bar.style.height='4px'; }
    else {
      const barH=Math.max(40, Math.round(pct*130/100));
      bar.style.height=barH+'px';
      bar.classList.add(pct>=70?'bar-good':pct>=30?'bar-mid':'bar-low');
      const pctSpan=document.createElement('span'); pctSpan.className='chart-bar-pct';
      pctSpan.textContent=pct+'%';
      bar.appendChild(pctSpan);
    }
    bar.addEventListener('click',clickFn);

    // Label
    const [y,m,d]=dateKey.split('-');
    const lbl=document.createElement('div'); lbl.className='chart-label-cell'+(isToday?' today':'');
    lbl.textContent=days.length<=14?`${parseInt(d)}/${MONTHS[parseInt(m)-1]}`:parseInt(d);
    lbl.addEventListener('click',clickFn);

    barsRow.appendChild(bar); lblRow.appendChild(lbl);
  });

  scroll.appendChild(barsRow); scroll.appendChild(lblRow);
  chartSec.appendChild(scroll);
  panelContent.appendChild(chartSec);

  // Resumen / promedio del período
  if(days.length>1){
    const activeDays=days.filter(dk=>{ const i=getHabitPct(dk); return i&&i.total>0; });
    if(activeDays.length>0){
      const avg=Math.round(activeDays.reduce((s,dk)=>s+getHabitPct(dk).pct,0)/activeDays.length);
      const totalDone=activeDays.reduce((s,dk)=>s+getHabitPct(dk).done,0);
      const totalPossible=activeDays.reduce((s,dk)=>s+getHabitPct(dk).total,0);
      const perfDays=activeDays.filter(dk=>getHabitPct(dk).pct===100).length;
      const avgClass=avg>=70?'good':avg>=30?'mid':'low';

      const summary=document.createElement('div'); summary.className='chart-summary';

      const mkItem=(label,value,cls='')=>{
        const item=document.createElement('div'); item.className='chart-summary-item';
        const lbl=document.createElement('div'); lbl.className='chart-summary-label'; lbl.textContent=label;
        const val=document.createElement('div'); val.className='chart-summary-value'+(cls?' '+cls:''); val.textContent=value;
        item.appendChild(val); item.appendChild(lbl); return item;
      };
      const div=()=>{ const d=document.createElement('div'); d.className='chart-summary-divider'; return d; };

      summary.appendChild(mkItem('AVERAGE', avg+'%', avgClass));
      summary.appendChild(div());
      summary.appendChild(mkItem('COMPLETED', `${totalDone}/${totalPossible}`));
      summary.appendChild(div());
      summary.appendChild(mkItem('PERFECT DAYS', `${perfDays}/${activeDays.length}`));

      panelContent.appendChild(summary);
    }
  }

  // Day detail — solo lectura
  if(historySelectedDay){
    const [sy,sm,sd]=historySelectedDay.split('-');
    const DAYS_EN=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const MONTHS_EN2=['January','February','March','April','May','June','July','August','September','October','November','December'];
    const dow=new Date(parseInt(sy),parseInt(sm)-1,parseInt(sd)).getDay();
    const dateLabel=`${DAYS_EN[dow]}, ${MONTHS_EN2[parseInt(sm)-1]} ${parseInt(sd)} ${sy}`;
    const info=getHabitPct(historySelectedDay);
    const pct=info?info.pct:0;

    const detail=document.createElement('div'); detail.className='day-detail';

    // Header con botón para ir a Habits
    const hdr=document.createElement('div'); hdr.className='day-detail-hdr';
    const hdrLeft=document.createElement('div');
    hdrLeft.innerHTML=`<div class="day-detail-date">${dateLabel.toUpperCase()}</div><div class="day-detail-score" style="margin-top:2px">${pct}% · ${info?info.done:0}/${info?info.total:0} completados</div>`;
    const gotoBtn=document.createElement('button'); gotoBtn.className='hist-goto-btn';
    gotoBtn.textContent='ANOTAR →';
    gotoBtn.addEventListener('click',()=>{
      activeDate=historySelectedDay;
      currentTab='habitos';
      document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
      document.querySelector('[data-tab="habits"]').classList.add('active');
      renderAll();
    });
    hdr.appendChild(hdrLeft); hdr.appendChild(gotoBtn);
    detail.appendChild(hdr);

    // Lista de hábitos — solo lectura
    if(!state.habitos.length){
      const empty=document.createElement('div'); empty.className='hist-empty'; empty.textContent='No habits configured.';
      detail.appendChild(empty);
    } else {
      const secLbl=document.createElement('div'); secLbl.className='day-detail-section'; secLbl.textContent='⟦ DAILY HABITS ⟧';
      detail.appendChild(secLbl);
      state.habitos.forEach(task=>{
        const done=!!task.done[historySelectedDay];
        const row=document.createElement('div'); row.className='hist-readonly-row';
        const check=document.createElement('div'); check.className='hist-check'+(done?' done':''); check.textContent=done?'✓':'';
        const txt=document.createElement('div'); txt.className='hist-quest-text'; txt.textContent=task.text;
        const xp=document.createElement('div'); xp.className='hist-xp'; xp.textContent=done?`+${task.xp||0} EXP`:'—';
        row.appendChild(check); row.appendChild(txt); row.appendChild(xp);
        detail.appendChild(row);
      });
    }
    panelContent.appendChild(detail);
  }
}

function renderAll() { renderHeader(); if(currentTab==='habits') renderHabitos(); else if(currentTab==='work') renderTrabajo(); else if(currentTab==='character') renderPersonaje(); else if(currentTab==='history') renderHistory(); else if(currentTab==='achievements') renderLogros(); else if(currentTab==='inventory') renderInventory(); }

// ============================================================
// ACTIONS
// ============================================================
function triggerStreak7Flash(taskId) {
  setTimeout(()=>{ const el=document.querySelector(`[data-task-id="${taskId}"]`); if(el&&!el.classList.contains('streak-milestone')){ el.classList.add('streak-7-flash'); setTimeout(()=>el.classList.remove('streak-7-flash'),1100); }},200);
}

function toggleQuest(listKey, periodKey, id) {
  const task=state[listKey].find(t=>t.id===id); if(!task) return;
  const wasDone=!!task.done[periodKey];
  if (wasDone) {
    const c=getCompletion(task,periodKey); if(c){ applyGains(c.gains,-1); state.totalXp=Math.max(0,state.totalXp-(c.xp||0)); state.col=Math.max(0,state.col-(c.xp||0)); }
    delete task.done[periodKey];
  } else {
    task.done[periodKey]=true;
    const prevLv=calcLevel(state.totalXp).level;
    const _pt={}; STAT_KEYS.forEach(k=>{_pt[k]=tierFor(state.stats[k]).tier;});
    state.totalXp+=(task.xp||0); state.col+=(task.xp||0); applyGains(task.gains,1);
    const newLv=calcLevel(state.totalXp).level;
    playSwordSlash();
    showNotif(`+${task.xp} EXP · ${Object.entries(task.gains||{}).map(([k,v])=>`${k}+${v}`).join(' ')}`);
    if(newLv>prevLv) afterLevelUp(newLv);
    else checkStatRankUps(task.gains,_pt);
    checkAllDone(listKey,periodKey);
    if(listKey!=='trabajo'){ const fs=getHabitStreak(task); if(fs>0&&fs%7===0){ triggerStreak7Flash(task.id); showNotif(fs%15===0?`🔥 ${fs} days in a row! GOLDEN MILESTONE`:`🔥 ${fs}-day streak!`); }}
    checkAchievements();
  }
  openTierFor=null; saveState(); renderAll();
}

function completeTiered(listKey, periodKey, id, tier) {
  const task=state[listKey].find(t=>t.id===id); if(!task||task.done[periodKey]) return;
  task.done[periodKey]={tierId:tier.id,label:tier.label,gains:{...tier.gains},xp:tier.xp};
  const prevLv=calcLevel(state.totalXp).level;
  const _pt={}; STAT_KEYS.forEach(k=>{_pt[k]=tierFor(state.stats[k]).tier;});
  state.totalXp+=tier.xp; applyGains(tier.gains,1);
  const hpmp2=gainHpMpFromHabit(tier.gains);
  const newLv=calcLevel(state.totalXp).level;
  playSwordSlash();
  const _hpmpStr2=[hpmp2.hp>0?`❤+${hpmp2.hp}`:'',hpmp2.mp>0?`💧+${hpmp2.mp}`:''].filter(Boolean).join(' ');
  showNotif(`${tier.label} · +${tier.xp} EXP · ${Object.entries(tier.gains).map(([k,v])=>`${k}+${v}`).join(' ')}${_hpmpStr2?' · '+_hpmpStr2:''}`);
  if(newLv>prevLv) afterLevelUp(newLv);
  else checkStatRankUps(tier.gains,_pt);
  checkAllDone(listKey,periodKey);
  if(listKey!=='trabajo'){ const fs=getHabitStreak(task); if(fs>0&&fs%7===0){ triggerStreak7Flash(task.id); showNotif(fs%15===0?`🔥 ${fs} days in a row! GOLDEN MILESTONE`:`🔥 ${fs}-day streak!`); }}
  checkAchievements();
  openTierFor=null; saveState(); renderAll();
}

function checkStatRankUps(gains, prevTiers) {
  const ups=STAT_KEYS.filter(k=>(gains||{})[k]&&tierFor(state.stats[k]).tier!==prevTiers[k]);
  if(ups.length) setTimeout(()=>{ playStatRankUp(); ups.forEach(k=>showNotif(`⟦ ${k} RANK UP → ${tierFor(state.stats[k]).tier} ⟧`)); },1900);
}

function afterLevelUp(lv) {
  state.hp = calcMaxHP();
  state.mp = calcMaxMP();
  saveState();
  setTimeout(()=>{ playLevelUp(); showNotif(`★ LEVEL UP! → LV.${lv}  ✦ HP & MP RESTORED`); document.getElementById('mainPanel').classList.add('level-up'); setTimeout(()=>document.getElementById('mainPanel').classList.remove('level-up'),2400); },700);
}

function checkAllDone(listKey, periodKey) {
  const list=state[listKey]; if(!list.length) return;
  if(list.every(t=>t.done[periodKey])){ const msg=listKey==='weekly'?'⟦ ALL WEEKLY QUESTS CLEARED ⟧':listKey==='habitos'?'⟦ ALL DAILY QUESTS CLEARED ⟧':'⟦ ALL MISSIONS CLEARED ⟧'; setTimeout(()=>{ if(listKey==='weekly') playWeeklyComplete(); else if(listKey==='habitos') playDailyComplete(); else playAllComplete(); showNotif(msg); },1300); }
}

function deleteTask(listKey, id) { state[listKey]=state[listKey].filter(t=>t.id!==id); saveState(); renderAll(); }

function applyMarkAll(simpleTasks, tieredSelections, listKey, periodKey) {
  simpleTasks.forEach(task=>{
    if(task.done[periodKey]) return;
    task.done[periodKey]=true;
    const prevLv=calcLevel(state.totalXp).level;
    const _pt={}; STAT_KEYS.forEach(k=>{_pt[k]=tierFor(state.stats[k]).tier;});
    state.totalXp+=(task.xp||0); applyGains(task.gains,1);
    gainHpMpFromHabit(task.gains);
    if(calcLevel(state.totalXp).level>prevLv) afterLevelUp(calcLevel(state.totalXp).level);
    else checkStatRankUps(task.gains,_pt);
  });
  tieredSelections.forEach(({task,tier})=>{
    if(task.done[periodKey]) return;
    task.done[periodKey]={tierId:tier.id,label:tier.label,gains:{...tier.gains},xp:tier.xp};
    const prevLv=calcLevel(state.totalXp).level;
    const _pt={}; STAT_KEYS.forEach(k=>{_pt[k]=tierFor(state.stats[k]).tier;});
    state.totalXp+=tier.xp; applyGains(tier.gains,1);
    gainHpMpFromHabit(tier.gains);
    if(calcLevel(state.totalXp).level>prevLv) afterLevelUp(calcLevel(state.totalXp).level);
    else checkStatRankUps(tier.gains,_pt);
  });
  saveState(); closeModal(); renderAll(); showNotif('⚔ All habits marked!');
}

function markAllHabits(listKey, periodKey) {
  const undone=state[listKey].filter(t=>!t.done[periodKey]);
  if(!undone.length) return;
  const simple=undone.filter(t=>!t.tiers||!t.tiers.length);
  const tiered=undone.filter(t=>t.tiers&&t.tiers.length);
  if(!tiered.length){ applyMarkAll(simple,[],listKey,periodKey); return; }

  // Modal para elegir tier de cada hábito de sesión
  document.getElementById('modalTitle').textContent='⟦ MARK ALL ⟧';
  const body=document.getElementById('modalBody'); body.innerHTML='';
  if(simple.length){
    const info=document.createElement('div'); info.className='mark-all-info';
    info.textContent=`✓ ${simple.length} habit${simple.length>1?'s':''} without session will be marked automatically.`;
    body.appendChild(info);
  }
  const selections={};
  tiered.forEach(task=>{
    selections[task.id]=task.tiers[0];
    const field=document.createElement('div'); field.className='m-field';
    const lbl=document.createElement('label'); lbl.className='m-label'; lbl.textContent=task.text;
    field.appendChild(lbl);
    const grid=document.createElement('div'); grid.className='tier-grid';
    task.tiers.forEach((tier,i)=>{
      const btn=document.createElement('button'); btn.type='button';
      btn.className='tier-btn'+(tier.elite?' elite':'')+(i===0?' sel-tier':'');
      const time=document.createElement('div'); time.className='tier-time'; time.textContent=tier.label; btn.appendChild(time);
      const sub=document.createElement('div'); sub.className='tier-gains-line'; sub.textContent=tier.sub||''; btn.appendChild(sub);
      const gl=document.createElement('div'); gl.className='tier-gains-line'; gl.style.color='var(--sao-cyan-bright)'; gl.textContent=Object.entries(tier.gains).map(([k,v])=>`${k}+${v}`).join(' '); btn.appendChild(gl);
      const xl=document.createElement('div'); xl.className='tier-gains-line'; xl.style.color='var(--sao-gold-soft)'; xl.textContent=`+${tier.xp} EXP`; btn.appendChild(xl);
      btn.addEventListener('click',()=>{
        selections[task.id]=tier;
        grid.querySelectorAll('.tier-btn').forEach(b=>b.classList.remove('sel-tier'));
        btn.classList.add('sel-tier');
      });
      grid.appendChild(btn);
    });
    field.appendChild(grid); body.appendChild(field);
  });
  _modalSaveHandler=()=>applyMarkAll(simple,tiered.map(t=>({task:t,tier:selections[t.id]})),listKey,periodKey);
  document.getElementById('habitModal').classList.add('open');
}

function unmarkAllHabits(listKey, periodKey) {
  state[listKey].forEach(task=>{
    if(task.done[periodKey]){
      const c=getCompletion(task,periodKey);
      if(c){ applyGains(c.gains,-1); state.totalXp=Math.max(0,state.totalXp-(c.xp||0)); state.col=Math.max(0,state.col-(c.xp||0)); }
      delete task.done[periodKey];
    }
  });
  saveState(); renderAll(); showNotif('↩ All habits cleared');
}

function addTask() {
  const input=document.getElementById('taskInput'); if(!input) return;
  const text=input.value.trim(); if(!text) return;
  state.trabajo.push({id:'t'+Date.now(),text,xp:15,gains:{INT:1},done:{}});
  input.value=''; saveState(); renderAll();
}

const _notifQ=[];
let _notifBusy=false;
function showNotif(msg) { _notifQ.push(msg); if(!_notifBusy) _flushNotif(); }
function _flushNotif() {
  if(!_notifQ.length){_notifBusy=false;return;}
  _notifBusy=true;
  notifMsg.textContent=_notifQ.shift();
  notification.classList.add('show');
  clearTimeout(notification._t);
  notification._t=setTimeout(()=>{ notification.classList.remove('show'); setTimeout(_flushNotif,300); },2200);
}

// ============================================================
// MODAL — HABIT CREATOR / EDITOR
// ============================================================
let modalData = { mode:'add', listKey:'habitos', editId:null, habitMode:'single', selectedList:'habitos', gains:{}, tiers:[] };
let _modalSaveHandler = null;
function handleSave() { if(_modalSaveHandler) _modalSaveHandler(); }

function openPlayerModal() {
  const titles = ['Beginner'];
  document.getElementById('modalTitle').textContent = '⟦ EDIT PROFILE ⟧';
  document.getElementById('modalBody').innerHTML = `
    <div class="m-field">
      <label class="m-label">NAME</label>
      <input class="m-input" id="editPlayerName" maxlength="20" value="${state.playerName}">
    </div>
    <div class="m-field">
      <label class="m-label">TITLE</label>
      <select class="m-input" id="editPlayerTitle">
        ${titles.map(t=>`<option value="${t}" ${state.playerTitle===t?'selected':''}>${t.toUpperCase()}</option>`).join('')}
      </select>
    </div>`;
  _modalSaveHandler = savePlayerInfo;
  document.getElementById('habitModal').classList.add('open');
}

function savePlayerInfo() {
  const name = document.getElementById('editPlayerName').value.trim();
  const title = document.getElementById('editPlayerTitle').value;
  if (!name) return;
  state.playerName = name;
  state.playerTitle = title;
  saveState(); closeModal(); renderAll();
}

function openHabitModal(mode, listKey, habitId) {
  const modal = document.getElementById('habitModal');
  const title = document.getElementById('modalTitle');
  modalData = { mode, listKey, editId: habitId, habitMode:'single', selectedList: listKey, gains:{}, tiers:[] };

  if (mode==='edit' && habitId) {
    const habit = state[listKey].find(h=>h.id===habitId);
    if (!habit) return;
    modalData.habitMode = habit.tiers ? 'tiered' : 'single';
    modalData.selectedList = listKey;
    modalData.gains = habit.tiers ? {} : {...(habit.gains||{})};
    modalData.tiers = habit.tiers ? habit.tiers.map(t=>({...t, gains:{...t.gains}})) : [];
    title.textContent = '⟦ EDIT HABIT ⟧';
  } else {
    title.textContent = '⟦ NEW HABIT ⟧';
  }

  renderModalBody(mode==='edit' && habitId ? state[listKey].find(h=>h.id===habitId) : null);
  _modalSaveHandler = saveHabit;
  modal.classList.add('open');
  setTimeout(()=>{ const ni=document.getElementById('mNameInput'); if(ni) ni.focus(); },100);
}

function closeModal() {
  document.getElementById('habitModal').classList.remove('open');
  document.getElementById('modalSaveBtn').style.display = '';
}

function renderModalBody(existingHabit) {
  const body = document.getElementById('modalBody');
  const name = existingHabit ? existingHabit.text : '';
  const xp   = existingHabit && !existingHabit.tiers ? (existingHabit.xp||10) : 10;
  const isTiered = modalData.habitMode === 'tiered';
  const isWeekly  = modalData.selectedList === 'weekly';

  body.innerHTML = `
    <div class="m-field">
      <label class="m-label">HABIT NAME</label>
      <input id="mNameInput" class="m-input" type="text" maxlength="80" placeholder="Ex: Meditate 10 minutes..." value="${name.replace(/"/g,'&quot;')}">
    </div>

    <div class="m-field">
      <label class="m-label">SECTION</label>
      <div class="m-toggle-row">
        <button class="m-toggle ${!isWeekly?'active':''}" id="togDaily" onclick="setModalList('habitos')">⟦ DAILY ⟧</button>
        <button class="m-toggle ${isWeekly?'gold-active':''}" id="togWeekly" onclick="setModalList('weekly')">⟦ WEEKLY ⟧</button>
      </div>
    </div>

    <div class="m-field">
      <label class="m-label">TYPE</label>
      <div class="m-toggle-row">
        <button class="m-toggle ${!isTiered?'active':''}" id="togSingle" onclick="setModalMode('single')">SINGLE</button>
        <button class="m-toggle ${isTiered?'active':''}" id="togTiered" onclick="setModalMode('tiered')">BY SESSION</button>
      </div>
    </div>

    <div class="m-divider"></div>

    <div id="mSingleSection" style="${isTiered?'display:none':''}">
      <div class="m-field">
        <label class="m-label">EXP ON COMPLETE</label>
        <input id="mXpInput" class="m-input narrow" type="number" min="1" max="200" value="${xp}">
      </div>
      <div class="m-field">
        <label class="m-label">STAT GAINS</label>
        <div class="stat-selector" id="mStatSelector"></div>
      </div>
    </div>

    <div id="mTieredSection" style="${isTiered?'':'display:none'}">
      <label class="m-label" style="margin-bottom:8px;display:block;">SESSIONS (at least 2)</label>
      <div class="tier-builder" id="mTierBuilder"></div>
      <button class="add-tier-btn" onclick="addModalTier()">+ ADD SESSION</button>
    </div>
  `;

  renderStatSelector();
  renderTierBuilder();
}

function renderStatSelector() {
  const sel = document.getElementById('mStatSelector'); if(!sel) return;
  sel.innerHTML='';
  STAT_KEYS.forEach(k=>{
    const amt = modalData.gains[k] || 0;
    const on  = amt > 0;
    const item = document.createElement('div');
    item.className = `stat-sel-item ${k}${on?' on':''}`;
    item.dataset.stat = k;
    item.innerHTML=`<div class="stat-sel-code">${k}</div><div class="stat-sel-amt"><button class="stat-sel-btn" onclick="adjustStat('${k}',-1)">-</button><input class="stat-sel-num" id="sn_${k}" type="number" min="0" max="99" value="${amt||''}" placeholder="0" onchange="setStatValue('${k}',this.value)" oninput="setStatValue('${k}',this.value)"><button class="stat-sel-btn" onclick="adjustStat('${k}',1)">+</button></div>`;
    item.addEventListener('click',(e)=>{ if(e.target.tagName==='BUTTON') return; toggleStat(k); });
    sel.appendChild(item);
  });
}

function toggleStat(k) {
  if (modalData.gains[k]) { delete modalData.gains[k]; }
  else { modalData.gains[k] = 1; }
  renderStatSelector();
}

function setStatValue(k, raw) {
  const nv = Math.max(0, Math.min(99, parseInt(raw) || 0));
  if (nv === 0) { delete modalData.gains[k]; } else { modalData.gains[k] = nv; }
  const item = document.querySelector(`.stat-sel-item[data-stat="${k}"]`);
  if (item) item.classList.toggle('on', nv > 0);
  const inp = document.getElementById(`sn_${k}`);
  if (inp && document.activeElement !== inp) inp.value = nv || '';
}

function adjustStat(k, delta) {
  const nv = Math.max(0, Math.min(99, (modalData.gains[k] || 0) + delta));
  if (nv===0) { delete modalData.gains[k]; } else { modalData.gains[k]=nv; }
  const item = document.querySelector(`.stat-sel-item[data-stat="${k}"]`);
  if (item) item.classList.toggle('on', nv > 0);
  const inp = document.getElementById(`sn_${k}`);
  if (inp) inp.value = nv || '';
}

function renderTierBuilder() {
  const builder = document.getElementById('mTierBuilder'); if(!builder) return;
  builder.innerHTML='';
  // Ensure at least 2 tiers
  while(modalData.tiers.length<2) modalData.tiers.push({id:'tier'+Date.now()+Math.random(),label:'',sub:'',xp:10,gains:{},elite:false});
  modalData.tiers.forEach((tier,idx)=>{
    const row=document.createElement('div'); row.className='tier-row'+(tier.elite?' elite-row':'');
    const gainsHTML = STAT_KEYS.map(k=>{
      const v=tier.gains[k]||0;
      return `<div class="mini-field"><label class="mini-label">${k}</label><input class="mini-input w55" type="number" min="0" max="99" value="${v}" onchange="updateTierGain(${idx},'${k}',this.value)"></div>`;
    }).join('');
    row.innerHTML=`
      ${idx>=2?`<button class="tier-row-remove" onclick="removeModalTier(${idx})">✕</button>`:''}
      <div class="tier-row-top">
        <div class="mini-field"><label class="mini-label">LABEL</label><input class="mini-input w80" type="text" maxlength="20" placeholder="30 min" value="${tier.label}" onchange="updateTierField(${idx},'label',this.value)"></div>
        <div class="mini-field"><label class="mini-label">DESCRIPTION</label><input class="mini-input w80" type="text" maxlength="20" placeholder="Standard" value="${tier.sub||''}" onchange="updateTierField(${idx},'sub',this.value)"></div>
        <div class="mini-field"><label class="mini-label">EXP</label><input class="mini-input w55" type="number" min="1" max="200" value="${tier.xp}" onchange="updateTierField(${idx},'xp',this.value)"></div>
      </div>
      <div class="tier-row-inputs">${gainsHTML}</div>
      <div class="elite-toggle" onclick="toggleTierElite(${idx})">
        <div class="elite-check${tier.elite?' on':''}" id="elChk_${idx}"></div>
        <div class="elite-label">ELITE (gold highlight)</div>
      </div>
    `;
    builder.appendChild(row);
  });
}

function updateTierField(idx, field, value) {
  if (!modalData.tiers[idx]) return;
  modalData.tiers[idx][field] = field==='xp' ? Math.max(1,parseInt(value)||1) : value;
}
function updateTierGain(idx, stat, value) {
  if (!modalData.tiers[idx]) return;
  const v=Math.max(0,Math.min(99,parseInt(value)||0));
  if(v===0) delete modalData.tiers[idx].gains[stat]; else modalData.tiers[idx].gains[stat]=v;
}
function toggleTierElite(idx) { if(modalData.tiers[idx]) modalData.tiers[idx].elite=!modalData.tiers[idx].elite; renderTierBuilder(); }
function addModalTier() { modalData.tiers.push({id:'tier'+Date.now(),label:'',sub:'',xp:10,gains:{},elite:false}); renderTierBuilder(); }
function removeModalTier(idx) { if(modalData.tiers.length<=2) return; modalData.tiers.splice(idx,1); renderTierBuilder(); }

function setModalList(listKey) {
  modalData.selectedList = listKey;
  document.getElementById('togDaily').className='m-toggle'+(listKey==='habitos'?' active':'');
  document.getElementById('togWeekly').className='m-toggle'+(listKey==='weekly'?' gold-active':'');
}

function setModalMode(mode) {
  modalData.habitMode = mode;
  const isTiered = mode==='tiered';
  document.getElementById('togSingle').className='m-toggle'+(!isTiered?' active':'');
  document.getElementById('togTiered').className='m-toggle'+(isTiered?' active':'');
  document.getElementById('mSingleSection').style.display=isTiered?'none':'';
  document.getElementById('mTieredSection').style.display=isTiered?'':'none';
  if(isTiered && modalData.tiers.length<2) { while(modalData.tiers.length<2) modalData.tiers.push({id:'tier'+Date.now()+Math.random(),label:'',sub:'',xp:10,gains:{},elite:false}); renderTierBuilder(); }
}

function saveHabit() {
  const nameEl=document.getElementById('mNameInput');
  if(!nameEl) return;
  const name=nameEl.value.trim();
  if(!name){ nameEl.focus(); nameEl.style.borderColor='#ff6464'; return; }
  nameEl.style.borderColor='';

  const targetList=modalData.selectedList;
  const isTiered=modalData.habitMode==='tiered';

  if (isTiered) {
    // Sync tier fields from DOM before saving
    document.querySelectorAll('#mTierBuilder .tier-row').forEach((row,idx)=>{
      if(!modalData.tiers[idx]) return;
      const inputs=row.querySelectorAll('input');
      const labelEl=row.querySelector('.mini-input.w80');
      if(labelEl) modalData.tiers[idx].label=labelEl.value;
      const allInputs=[...inputs];
      // label(0), sub(1), xp(2), then stat inputs
      if(allInputs[0]) modalData.tiers[idx].label=allInputs[0].value;
      if(allInputs[1]) modalData.tiers[idx].sub=allInputs[1].value;
      if(allInputs[2]) modalData.tiers[idx].xp=Math.max(1,parseInt(allInputs[2].value)||1);
      STAT_KEYS.forEach((k,si)=>{ if(allInputs[3+si]){ const v=Math.max(0,parseInt(allInputs[3+si].value)||0); if(v===0) delete modalData.tiers[idx].gains[k]; else modalData.tiers[idx].gains[k]=v; }});
    });

    if(modalData.tiers.some(t=>!t.label.trim())){ showNotif('⚠ Fill in the name of each session'); return; }
    const topTier=modalData.tiers[modalData.tiers.length-1];
    const baseGains=modalData.tiers[0].gains;
  }

  if (modalData.mode==='edit' && modalData.editId) {
    const oldList = modalData.listKey;
    const habit = state[oldList].find(h=>h.id===modalData.editId);
    if(!habit) return;

    const done = habit.done||{};
    // If list changed, move it
    if(oldList!==targetList) {
      state[oldList]=state[oldList].filter(h=>h.id!==modalData.editId);
      const newHabit = buildHabitObj(modalData.editId, name, isTiered, done);
      state[targetList].push(newHabit);
    } else {
      const updated = buildHabitObj(modalData.editId, name, isTiered, done);
      const idx=state[oldList].findIndex(h=>h.id===modalData.editId);
      state[oldList][idx]=updated;
    }
  } else {
    const newId=(targetList==='habitos'?'uh':'uw')+Date.now();
    const newHabit=buildHabitObj(newId, name, isTiered, {});
    state[targetList].push(newHabit);
  }

  saveState(); closeModal(); renderAll();
  showNotif(modalData.mode==='edit'?'⚔ Habit updated':'⚔ New habit created');
}

function buildHabitObj(id, name, isTiered, done) {
  if(isTiered) {
    // Sync from DOM one final time
    const tiers = modalData.tiers.map((t,idx)=>{
      const row=document.querySelectorAll('#mTierBuilder .tier-row')[idx];
      if(!row) return t;
      const inputs=[...row.querySelectorAll('input')];
      const label=inputs[0]?inputs[0].value.trim():t.label;
      const sub=inputs[1]?inputs[1].value.trim():t.sub;
      const xp=inputs[2]?Math.max(1,parseInt(inputs[2].value)||1):t.xp;
      const gains={};
      STAT_KEYS.forEach((k,si)=>{ if(inputs[3+si]){ const v=Math.max(0,parseInt(inputs[3+si].value)||0); if(v>0) gains[k]=v; }});
      return {id:t.id||'tier'+idx, label, sub, xp, gains, elite:t.elite||false};
    }).filter(t=>t.label.trim());
    const baseTier=tiers[0]||{};
    return {id, text:name, xp:baseTier.xp||10, gains:{...baseTier.gains}, tiers, done};
  } else {
    const xpEl=document.getElementById('mXpInput');
    const xp=xpEl?Math.max(1,parseInt(xpEl.value)||10):10;
    return {id, text:name, xp, gains:{...modalData.gains}, done};
  }
}

// ============================================================
// TABS
// ============================================================
document.querySelectorAll('.tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active'); currentTab=tab.dataset.tab; openTierFor=null; invSelected=null; renderAll();
  });
});

document.addEventListener('click',(e)=>{
  if(!openTierFor) return;
  if(e.target.closest('.quest')||e.target.closest('.tier-selector')) return;
  openTierFor=null; renderAll();
});

// Close modal on overlay click
document.getElementById('habitModal').addEventListener('click',(e)=>{ if(e.target===document.getElementById('habitModal')) closeModal(); });

// Keyboard ESC closes modal
document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') closeModal(); });

// ============================================================
// DUNGEON — TIMER ENGINE
// ============================================================
function getElapsedSeconds() {
  if (!state.dungeon) return 0;
  const d=state.dungeon, paused=d.pausedAt?(Date.now()-d.pausedAt):0;
  return Math.floor((Date.now()-d.startTime-d.totalPausedMs-paused)/1000);
}
function getPomodoroProgress() {
  if (!state.dungeon) return null;
  const d=state.dungeon, phaseMs=d.pomodoroPhase==='work'?POMODORO_WORK_MS:POMODORO_BREAK_MS;
  const elapsed=Date.now()-d.pomodoroPhaseStart;
  return {elapsed:Math.max(0,elapsed), total:phaseMs, remaining:Math.max(0,phaseMs-elapsed)};
}
function startDungeonTimer() { if(dungeonTimer) clearInterval(dungeonTimer); dungeonTimer=setInterval(tickDungeon,1000); }
function stopDungeonTimer()  { if(dungeonTimer){clearInterval(dungeonTimer);dungeonTimer=null;} }
function startCombatTimer()  { if(combatTimer)  clearInterval(combatTimer);  combatTimer =setInterval(processCombatTurn,1500); }
function stopCombatTimer()   { if(combatTimer) {clearInterval(combatTimer); combatTimer=null;} }

function tickDungeon() {
  if (!state.dungeon||state.dungeon.phase!=='exploring'||state.dungeon.pausedAt) return;
  let advanced=false, limit=50;
  while (limit-->0) {
    const phaseMs=state.dungeon.pomodoroPhase==='work'?POMODORO_WORK_MS:POMODORO_BREAK_MS;
    if ((Date.now()-state.dungeon.pomodoroPhaseStart)<phaseMs) break;
    advanced=true;
    state.dungeon.pomodoroPhaseStart+=phaseMs;
    if (state.dungeon.pomodoroPhase==='work') {
      state.dungeon.pomodoroCount++;
      const cfg=DUNGEON_CONFIG[state.dungeon.difficulty];
      state.dungeon.defeatedEnemies.push(cfg.enemies[state.dungeon.enemyWave%cfg.enemies.length].name);
      state.dungeon.enemyWave++;
      state.dungeon.pomodoroPhase='break';
    } else { state.dungeon.pomodoroPhase='work'; }
  }
  saveState();
  if (currentTab==='trabajo') { if(advanced) renderTrabajo(); else updateExploreDisplay(); }
}

function updateExploreDisplay() {
  const prog=getPomodoroProgress(); if (!prog) return;
  const mm=Math.floor(prog.remaining/60000).toString().padStart(2,'0');
  const ss=Math.floor((prog.remaining%60000)/1000).toString().padStart(2,'0');
  const tEl=document.querySelector('.dexp-pomo-timer');
  const pFill=document.querySelector('.dexp-pomo-fill');
  const oFill=document.querySelector('.dexp-overall-fill');
  const oLabel=document.querySelectorAll('.dexp-overall-label span');
  if (tEl) tEl.textContent=`${mm}:${ss}`;
  if (pFill) pFill.style.width=`${Math.min(100,(prog.elapsed/prog.total)*100)}%`;
  const elapsed=getElapsedSeconds(), cfg=DUNGEON_CONFIG[state.dungeon.difficulty];
  if (oFill) oFill.style.width=`${Math.min(100,(elapsed/3600/cfg.minHours)*100)}%`;
  if (oLabel[1]) { const h=Math.floor(elapsed/3600),m=Math.floor((elapsed%3600)/60); oLabel[1].textContent=`${h}h ${m.toString().padStart(2,'0')}m / ${cfg.minHours}h`; }
}

// ── Dungeon flow ──────────────────────────────────────────────
function startDungeon(diffId) {
  const now=Date.now();
  state.dungeon={difficulty:diffId,phase:'exploring',startTime:now,totalPausedMs:0,pausedAt:null,
    pomodoroPhase:'work',pomodoroPhaseStart:now,pomodoroCount:0,enemyWave:0,defeatedEnemies:[],combat:null};
  saveState(); startDungeonTimer(); renderAll();
}
function pauseDungeon() {
  if (!state.dungeon||state.dungeon.pausedAt) return;
  state.dungeon.pausedAt=Date.now(); stopDungeonTimer(); saveState(); renderAll();
}
function resumeDungeon() {
  if (!state.dungeon||!state.dungeon.pausedAt) return;
  const dur=Date.now()-state.dungeon.pausedAt;
  state.dungeon.totalPausedMs+=dur;
  state.dungeon.pomodoroPhaseStart+=dur;
  state.dungeon.pausedAt=null;
  saveState(); startDungeonTimer(); renderAll();
}
function abandonDungeon() { stopDungeonTimer(); stopCombatTimer(); state.dungeon=null; saveState(); renderAll(); }

function exitDungeon() {
  stopDungeonTimer(); stopCombatTimer();
  state.dungeon.phase='reward'; saveState(); renderAll();
}
function startPractice(difficulty) {
  stopCombatTimer();
  const cfg=DUNGEON_CONFIG[difficulty], lv=calcLevel(state.totalXp), st=state.stats;
  const eq=getEquippedStats();
  const STR=(st.STR||0)+(eq.STR||0), DEX=(st.DEX||0)+(eq.DEX||0), CON=(st.CON||0)+(eq.CON||0);
  const INT=(st.INT||0)+(eq.INT||0), VOL=(st.VOL||0)+(eq.VOL||0), CHA=(st.CHA||0)+(eq.CHA||0);
  const pMaxHP  = 100 + CON*3 + CHA*2 + lv.level*10 + (eq.HP||0);
  const pMaxMP  = 50  + INT*2 + VOL*2 + CHA + lv.level*3 + (eq.MP||0);
  const pAtk    = 10  + STR*2 + (eq.ATK||0);
  const pDef    = 5   + CON + (eq.DEF||0);
  const pCrit   = Math.min(50, DEX*1.5 + (eq.critBonus||0));
  const pDodge  = Math.min(35, DEX*0.4 + (eq.dodgeBonus||0));
  const pDblAtk = Math.min(30, DEX*0.3);
  const pBlock  = Math.min(25, CON*0.2 + (eq.blockBonus||0));
  const pMpRegen= 6 + Math.floor(INT*0.05);
  const pVolMult= 1 + VOL*0.005;
  const pIntMult= 1 + INT*0.008;
  const pPetAtk = Math.floor(CHA*1.5);
  const pPetSpd = CHA >= 50 ? 2 : 1;
  const statLine    = `HP:${pMaxHP} · MP:${pMaxMP} · ATK:${pAtk} · DEF:${pDef}`;
  const derivedLine = (pCrit>0||pDodge>0||pBlock>0) ? `CRIT:${pCrit.toFixed(0)}% · DODGE:${pDodge.toFixed(0)}% · BLOCK:${pBlock.toFixed(0)}%` : null;
  const petLine     = pPetAtk>0 ? `🐾 Pet: ${pPetAtk} dmg × ${pPetSpd}/turn` : null;
  state.dungeon = {
    difficulty, phase:'boss_fight', isPractice:true,
    combat:{
      playerHP:pMaxHP, playerMaxHP:pMaxHP, playerMP:pMaxMP, playerMaxMP:pMaxMP,
      playerAtk:pAtk, playerDef:pDef,
      critChance:pCrit, dodgeChance:pDodge, dblAtkChance:pDblAtk,
      passiveBlock:pBlock, mpRegen:pMpRegen, volMult:pVolMult, intMult:pIntMult,
      petAtk:pPetAtk, petSpd:pPetSpd,
      atkBonus:0, atkBonusTurns:0, blocking:false,
      enemyHP:cfg.boss.hp, enemyMaxHP:cfg.boss.hp, enemyAtk:cfg.boss.atk,
      turnCount:0,
      log:[`⟦ PRACTICE ARENA ⟧`, `${cfg.boss.emoji} ${cfg.boss.name} appears!`, statLine, derivedLine, petLine].filter(Boolean),
      skillCooldowns:{power_strike:0,shield_block:0,battle_cry:0,arcane_bolt:0},
      queuedSkill:null, outcome:null
    }
  };
  saveState(); startCombatTimer(); renderAll();
}

function endPractice() { stopCombatTimer(); state.dungeon=null; saveState(); renderAll(); }

function renderPracticeArena() {
  const w=document.createElement('div');
  w.className='practice-section';
  w.innerHTML=`
    <div class="practice-title">⟦ PRACTICE ARENA ⟧</div>
    <div class="practice-sub">Fight bosses directly — no XP, no rewards, just combat</div>
    <div class="practice-cards">
      ${Object.values(DUNGEON_CONFIG).map(c=>`
        <div class="practice-card" style="--pcolor:${c.color};--pglow:${c.glow}">
          <div class="pcard-emoji">${c.boss.emoji}</div>
          <div class="pcard-diff">${c.id==='xhard'?'EXTRA HARD':c.id.toUpperCase()}</div>
          <div class="pcard-name">${c.boss.name}</div>
          <div class="pcard-hp">💀 ${c.boss.hp} HP · ⚔ ${c.boss.atk} ATK</div>
          <button class="pcard-fight" onclick="startPractice('${c.id}')">⚔  FIGHT</button>
        </div>`).join('')}
    </div>`;
  return w;
}

function challengeBoss() {
  if (!state.dungeon) return;
  stopDungeonTimer();
  const cfg=DUNGEON_CONFIG[state.dungeon.difficulty], lv=calcLevel(state.totalXp), st=state.stats;
  const eq=getEquippedStats();
  const STR=(st.STR||0)+(eq.STR||0), DEX=(st.DEX||0)+(eq.DEX||0), CON=(st.CON||0)+(eq.CON||0);
  const INT=(st.INT||0)+(eq.INT||0), VOL=(st.VOL||0)+(eq.VOL||0), CHA=(st.CHA||0)+(eq.CHA||0);
  // Base stats (equipment adds direct HP/MP/ATK/DEF on top)
  const pMaxHP   = 100 + CON*3 + CHA*2 + lv.level*10 + (eq.HP||0);
  const pMaxMP   = 50  + INT*2 + VOL*2 + CHA + lv.level*3 + (eq.MP||0);
  const pAtk     = 10  + STR*2 + (eq.ATK||0);
  const pDef     = 5   + CON + (eq.DEF||0);
  // DEX: crit, dodge, double attack
  const pCrit    = Math.min(50, DEX*1.5 + (eq.critBonus||0));
  const pDodge   = Math.min(35, DEX*0.4 + (eq.dodgeBonus||0));
  const pDblAtk  = Math.min(30, DEX*0.3);
  // CON: passive damage reduction
  const pBlock   = Math.min(25, CON*0.2 + (eq.blockBonus||0));
  // INT: MP regen per turn
  const pMpRegen = 6 + Math.floor(INT*0.05);
  // VOL: global skill damage multiplier; INT: extra magic multiplier
  const pVolMult = 1 + VOL*0.005;
  const pIntMult = 1 + INT*0.008;
  // CHA: pet companion
  const pPetAtk  = Math.floor(CHA*1.5);
  const pPetSpd  = CHA >= 50 ? 2 : 1;
  const statLine = `HP:${pMaxHP} · MP:${pMaxMP} · ATK:${pAtk} · DEF:${pDef}`;
  const derivedLine = (pCrit>0||pDodge>0||pBlock>0) ? `CRIT:${pCrit.toFixed(0)}% · DODGE:${pDodge.toFixed(0)}% · BLOCK:${pBlock.toFixed(0)}%` : null;
  const petLine = pPetAtk>0 ? `🐾 Pet companion active: ${pPetAtk} dmg × ${pPetSpd}/turn` : null;
  state.dungeon.phase='boss_fight';
  state.dungeon.combat={
    playerHP:pMaxHP, playerMaxHP:pMaxHP,
    playerMP:pMaxMP, playerMaxMP:pMaxMP,
    playerAtk:pAtk, playerDef:pDef,
    critChance:pCrit, dodgeChance:pDodge, dblAtkChance:pDblAtk,
    passiveBlock:pBlock, mpRegen:pMpRegen,
    volMult:pVolMult, intMult:pIntMult,
    petAtk:pPetAtk, petSpd:pPetSpd,
    atkBonus:0, atkBonusTurns:0, blocking:false,
    enemyHP:cfg.boss.hp, enemyMaxHP:cfg.boss.hp, enemyAtk:cfg.boss.atk,
    turnCount:0,
    log:[`⟦ BOSS ENCOUNTER ⟧`, `${cfg.boss.emoji} ${cfg.boss.name} emerges!`, statLine, derivedLine, petLine].filter(Boolean),
    skillCooldowns:{power_strike:0, shield_block:0, battle_cry:0, arcane_bolt:0},
    queuedSkill:null, outcome:null
  };
  saveState(); startCombatTimer(); renderAll();
}
function claimRewards() {
  if (!state.dungeon) return;
  const cfg=DUNGEON_CONFIG[state.dungeon.difficulty], bossKill=state.dungeon.combat?.outcome==='win';
  const xp =bossKill?Math.floor(cfg.rewardXP *1.5):cfg.rewardXP;
  const col=bossKill?Math.floor(cfg.rewardCol*1.5):cfg.rewardCol;
  state.totalXp+=xp; state.col+=col;
  state.stats[cfg.rewardStat]=(state.stats[cfg.rewardStat]||0)+cfg.rewardStatAmt;
  grantItemDrop(state.dungeon.difficulty);
  const finalHP=state.dungeon.combat?.playerHP, finalMP=state.dungeon.combat?.playerMP;
  showNotif(`⟦ ${cfg.name.toUpperCase()} COMPLETE ⟧  +${xp} EXP · +${col} GOLD`);
  stopDungeonTimer(); stopCombatTimer(); state.dungeon=null;
  if (typeof finalHP==='number') state.hp=finalHP;
  if (typeof finalMP==='number') state.mp=finalMP;
  saveState(); renderAll();
}

// ── Combat ────────────────────────────────────────────────────
function queueSkill(skillId) {
  const c=state.dungeon?.combat; if (!c||c.outcome) return;
  const sk=DUNGEON_SKILLS.find(s=>s.id===skillId);
  if (!sk||c.skillCooldowns[skillId]>0||c.playerMP<sk.mpCost) return;
  c.queuedSkill=(c.queuedSkill===skillId)?null:skillId;
  saveState(); renderAll();
}
function processCombatTurn() {
  const c=state.dungeon?.combat; if (!c||c.outcome){stopCombatTimer();return;}
  const cfg=DUNGEON_CONFIG[state.dungeon.difficulty], boss=cfg.boss;
  c.turnCount++;
  Object.keys(c.skillCooldowns).forEach(k=>{if(c.skillCooldowns[k]>0)c.skillCooldowns[k]--;});
  if (c.atkBonusTurns>0&&--c.atkBonusTurns===0) c.atkBonus=0;
  // INT scales MP regen
  c.playerMP=Math.min(c.playerMaxMP, c.playerMP+(c.mpRegen||6));
  // ── Player turn
  let usedSkill=false;
  if (c.queuedSkill) {
    const sk=DUNGEON_SKILLS.find(s=>s.id===c.queuedSkill);
    if (sk&&c.skillCooldowns[sk.id]===0&&c.playerMP>=sk.mpCost) {
      c.playerMP-=sk.mpCost; c.skillCooldowns[sk.id]=sk.cooldown;
      const base=Math.floor(c.playerAtk*(1+c.atkBonus));
      const vm=c.volMult||1, im=c.intMult||1;
      if (sk.type==='attack') {
        const d=Math.floor(base*sk.multiplier*vm);
        c.enemyHP=Math.max(0,c.enemyHP-d); c.log.push(`${sk.emoji} ${sk.name} → ${d} dmg!`);
      } else if (sk.type==='magic') {
        // INT boosts magic damage, VOL boosts all skills
        const d=Math.floor((base*sk.multiplier+(state.stats.INT||0)*1.5)*vm*im);
        c.enemyHP=Math.max(0,c.enemyHP-d); c.log.push(`${sk.emoji} ${sk.name} → ${d} magic dmg!`);
      } else if (sk.type==='defense') {
        const d=Math.floor(base*vm);
        c.blocking=true; c.enemyHP=Math.max(0,c.enemyHP-d); c.log.push(`${sk.emoji} Shield up! Auto: ${d} dmg`);
      } else if (sk.type==='buff') {
        const d=Math.floor(base*vm);
        c.atkBonus=sk.atkBonus; c.atkBonusTurns=sk.duration;
        c.enemyHP=Math.max(0,c.enemyHP-d); c.log.push(`${sk.emoji} Battle Cry! ATK+50% × ${sk.duration}t. ${d} dmg`);
      }
      c.queuedSkill=null; usedSkill=true;
    } else { c.queuedSkill=null; }
  }
  if (!usedSkill) {
    // DEX: chance to double attack
    const attacks=Math.random()*100<(c.dblAtkChance||0)?2:1;
    if (attacks===2) c.log.push(`⚡ DOUBLE ATTACK!`);
    for (let i=0;i<attacks;i++) {
      const base=Math.floor(c.playerAtk*(1+c.atkBonus));
      // DEX: crit chance
      const crit=Math.random()*100<(c.critChance||0);
      const d=crit?Math.floor(base*1.5):base;
      c.enemyHP=Math.max(0,c.enemyHP-d);
      c.log.push(`🗡️ Attack → ${boss.name}: ${d} dmg${crit?' ⭐CRIT':''}`);
    }
  }
  // ── CHA: pet companion attacks
  if ((c.petAtk||0)>0 && c.enemyHP>0) {
    for (let i=0;i<(c.petSpd||1);i++) {
      if (c.enemyHP<=0) break;
      c.enemyHP=Math.max(0,c.enemyHP-c.petAtk);
      c.log.push(`🐾 Pet strikes: ${c.petAtk} dmg`);
    }
  }
  if (c.enemyHP<=0) {
    c.outcome='win'; c.log.push(`✨ ${boss.name} has fallen!`);
    c.log.push(state.dungeon.isPractice ? '⟦ PRACTICE COMPLETE ⟧' : '⟦ VICTORY ⟧ — Claim the treasure!');
    stopCombatTimer();
    if (!state.dungeon.isPractice) state.dungeon.phase='reward';
    saveState(); if(currentTab==='trabajo') renderAll(); return;
  }
  // ── Enemy turn
  const special=c.turnCount%boss.specialEvery===0;
  let ed=Math.max(1,c.enemyAtk+Math.floor(Math.random()*6)-3);
  if (special) { ed=Math.floor(ed*1.5); c.log.push(`💥 ${boss.name}: ${boss.special}! (${ed} dmg)`); }
  else { c.log.push(`👊 ${boss.name} strikes: ${ed} dmg`); }
  // DEX: dodge check (full miss)
  if (Math.random()*100<(c.dodgeChance||0)) {
    c.log.push(`💨 DODGED! — ${boss.name} misses!`);
  } else {
    // Shield Block (active)
    if (c.blocking) { ed=Math.max(1,Math.floor(ed*0.4)); c.log.push(`🛡️ Blocked! → ${ed} dmg`); c.blocking=false; }
    // CON: passive damage reduction
    if ((c.passiveBlock||0)>0) ed=Math.max(1,Math.floor(ed*(1-c.passiveBlock/100)));
    c.playerHP=Math.max(0,c.playerHP-Math.max(1,ed-c.playerDef));
  }
  if (c.playerHP<=0) {
    c.outcome='lose'; c.log.push('💀 You fall in battle...'); c.log.push('⟦ DEFEAT ⟧');
    stopCombatTimer(); saveState(); if(currentTab==='trabajo') renderAll(); return;
  }
  saveState();
  if (currentTab==='trabajo') updateCombatDisplay();
}
function updateCombatDisplay() {
  if (!state.dungeon?.combat) return;
  const c=state.dungeon.combat, g=id=>document.getElementById(id);
  const pHF=g('d-php-fill'),pMF=g('d-pmp-fill'),eHF=g('d-ehp-fill');
  const pHT=g('d-php-txt'), pMT=g('d-pmp-txt'), eHT=g('d-ehp-txt');
  if(pHF) pHF.style.width=`${(c.playerHP/c.playerMaxHP)*100}%`;
  if(pMF) pMF.style.width=`${(c.playerMP/c.playerMaxMP)*100}%`;
  if(eHF) eHF.style.width=`${(c.enemyHP/c.enemyMaxHP)*100}%`;
  if(pHT) pHT.textContent=`${c.playerHP}/${c.playerMaxHP}`;
  if(pMT) pMT.textContent=`${c.playerMP}/${c.playerMaxMP}`;
  if(eHT) eHT.textContent=`${c.enemyHP}/${c.enemyMaxHP}`;
  const log=g('d-combat-log');
  if(log){log.innerHTML=c.log.slice(-10).map(l=>`<div class="d-log-line">${l}</div>`).join('');log.scrollTop=log.scrollHeight;}
  DUNGEON_SKILLS.forEach(sk=>{
    const btn=g(`skill-${sk.id}`); if(!btn) return;
    const cd=c.skillCooldowns[sk.id]||0, noMP=c.playerMP<sk.mpCost;
    btn.disabled=cd>0||noMP; btn.classList.toggle('queued',c.queuedSkill===sk.id);
    const cdEl=btn.querySelector('.skill-cd');
    if(cdEl) cdEl.textContent=cd>0?`${cd}`:(sk.mpCost>0?`${sk.mpCost}MP`:'');
  });
  ['d-player-sprite','d-enemy-sprite'].forEach(id=>{
    const el=g(id); if(el){el.classList.add('d-hit');setTimeout(()=>el.classList.remove('d-hit'),280);}
  });
}

// ── Render ────────────────────────────────────────────────────
function renderDungeon() {
  const d=state.dungeon;
  if (!d) return renderDungeonSelect();
  if (d.phase==='exploring'||d.phase==='paused') return renderDungeonExplore();
  if (d.phase==='boss_fight') return renderDungeonBoss();
  if (d.phase==='reward')     return renderDungeonReward();
  return renderDungeonSelect();
}

function renderDungeonSelect() {
  const w=document.createElement('div');
  w.innerHTML=`
    <div class="dungeon-select-title">⟦ DUNGEON EXPLORER ⟧</div>
    <div class="dungeon-select-sub">Choose your challenge. Work hours = dungeon progress.</div>
    <div class="dungeon-cards">
      ${Object.values(DUNGEON_CONFIG).map(c=>`
        <div class="dungeon-card" data-diff="${c.id}" style="--dcolor:${c.color};--dglow:${c.glow}">
          <div class="dcard-emoji">${c.emoji}</div>
          <div class="dcard-diff">${c.id==='xhard'?'EXTRA HARD':c.id.toUpperCase()}</div>
          <div class="dcard-name">${c.name}</div>
          <div class="dcard-time">⏱ ${c.minHours}h minimum</div>
          <div class="dcard-rewards"><span class="dcard-xp">+${c.rewardXP} EXP</span><span class="dcard-col">+${c.rewardCol} GOLD</span></div>
          <div class="dcard-stat">+${c.rewardStatAmt} ${c.rewardStat}</div>
        </div>`).join('')}
    </div>`;
  w.querySelectorAll('.dungeon-card').forEach(card=>{
    card.addEventListener('click',()=>{
      w.querySelectorAll('.dungeon-card').forEach(c=>c.classList.remove('selected'));
      card.classList.add('selected');
      let btn=w.querySelector('.dungeon-enter-btn');
      if(!btn){btn=document.createElement('button');btn.className='dungeon-enter-btn';w.appendChild(btn);}
      const diff=card.dataset.diff;
      btn.textContent=`⚔  ENTER ${DUNGEON_CONFIG[diff].name.toUpperCase()}`;
      btn.onclick=()=>startDungeon(diff);
    });
  });
  return w;
}

function renderDungeonExplore() {
  const d=state.dungeon, cfg=DUNGEON_CONFIG[d.difficulty];
  const prog=getPomodoroProgress(), elapsed=getElapsedSeconds();
  const isComplete=elapsed/3600>=cfg.minHours, isPaused=!!d.pausedAt;
  const pomoRem=prog?prog.remaining:0, pomoPct=prog?(prog.elapsed/prog.total):0;
  const mm=Math.floor(pomoRem/60000).toString().padStart(2,'0');
  const ss=Math.floor((pomoRem%60000)/1000).toString().padStart(2,'0');
  const h=Math.floor(elapsed/3600), m=Math.floor((elapsed%3600)/60);
  const enemy=cfg.enemies[d.enemyWave%cfg.enemies.length];
  const pomoDots=Array.from({length:d.pomodoroCount},()=>'⚔').join('');
  const w=document.createElement('div');
  w.className='dungeon-explore';
  w.style.cssText=`--dcolor:${cfg.color};--dglow:${cfg.glow};--dbg:${cfg.bgColor}`;
  w.innerHTML=`
    <div class="dexp-header">
      <div class="dexp-title">${cfg.emoji} ${cfg.name}</div>
      <div class="dexp-diff-badge">${d.difficulty.toUpperCase()}</div>
    </div>
    <div class="dexp-overall">
      <div class="dexp-overall-label"><span>DUNGEON PROGRESS</span><span>${h}h ${m.toString().padStart(2,'0')}m / ${cfg.minHours}h</span></div>
      <div class="dexp-overall-track"><div class="dexp-overall-fill" style="width:${Math.min(100,(elapsed/3600/cfg.minHours)*100)}%"></div></div>
    </div>
    <div class="dexp-scene">
      <div class="dexp-bg ${isPaused?'paused':''}">
        <div class="dexp-layer dexp-layer-far"></div>
        <div class="dexp-layer dexp-layer-mid"></div>
        <div class="dexp-layer dexp-layer-near"></div>
      </div>
      <div class="dexp-hero ${isPaused?'':'running'}">🗡️</div>
      <div class="dexp-vs">VS</div>
      <div class="dexp-enemy ${isPaused?'paused':''}">${enemy.emoji}</div>
    </div>
    <div class="dexp-enemy-name">${enemy.name}</div>
    <div class="dexp-pomo-section">
      <div class="dexp-pomo-phase ${d.pomodoroPhase==='break'?'break-phase':''}">${d.pomodoroPhase==='work'?'⚔  WORK SESSION':'☕  BREAK TIME'}</div>
      <div class="dexp-pomo-timer ${isPaused?'paused':''}">${mm}:${ss}</div>
      <div class="dexp-pomo-track"><div class="dexp-pomo-fill ${d.pomodoroPhase==='break'?'break-fill':''}" style="width:${pomoPct*100}%"></div></div>
      <div class="dexp-pomo-count">${pomoDots||'—'} <span style="opacity:0.45">(${d.pomodoroCount} pomodoro${d.pomodoroCount!==1?'s':''} done)</span></div>
    </div>
    <div class="dexp-actions">
      ${isPaused?`<button class="dexp-btn dexp-btn-primary" onclick="resumeDungeon()">▶  RESUME</button>`:`<button class="dexp-btn dexp-btn-pause" onclick="pauseDungeon()">⏸  PAUSE</button>`}
      ${isComplete?`<button class="dexp-btn dexp-btn-exit" onclick="exitDungeon()">🏆  EXIT & CLAIM</button><button class="dexp-btn dexp-btn-boss" onclick="challengeBoss()">💀  FIGHT BOSS</button>`:''}
      <button class="dexp-btn dexp-btn-abandon" onclick="if(confirm('Abandon dungeon? All progress will be lost.'))abandonDungeon()">✗  ABANDON</button>
    </div>
    ${isComplete?`<div class="dexp-complete-badge">⟦ MINIMUM TIME REACHED — THE BOSS AWAITS ⟧</div>`:''}`;
  return w;
}

function renderDungeonBoss() {
  const d=state.dungeon, c=d.combat, cfg=DUNGEON_CONFIG[d.difficulty], boss=cfg.boss;
  const pHP=Math.max(0,(c.playerHP/c.playerMaxHP)*100);
  const pMP=Math.max(0,(c.playerMP/c.playerMaxMP)*100);
  const eHP=Math.max(0,(c.enemyHP/c.enemyMaxHP)*100);
  const w=document.createElement('div');
  w.className='dungeon-boss';
  w.style.cssText=`--dcolor:${cfg.color};--dglow:${cfg.glow}`;
  w.innerHTML=`
    <div class="dboss-header"><span>${cfg.emoji} ${boss.name}${d.isPractice?'<span class="practice-badge">PRACTICE</span>':''}</span><span class="dboss-turn">TURN ${c.turnCount}</span></div>
    ${d.isPractice?`<div class="dboss-practice-bar">⚔ PRACTICE ARENA — No XP · No rewards · Pure combat</div>`:''}
    <div class="dboss-arena">
      <div class="dboss-fighter">
        <div class="dboss-sprite ${c.outcome==='lose'?'d-dead':''}" id="d-player-sprite">🗡️</div>
        <div class="dboss-name">${state.playerName}</div>
        <div class="dboss-bar-wrap">
          <div class="dboss-bar-label"><span>HP</span><span id="d-php-txt">${c.playerHP}/${c.playerMaxHP}</span></div>
          <div class="dboss-track"><div class="dboss-fill hp-fill" id="d-php-fill" style="width:${pHP}%"></div></div>
        </div>
        <div class="dboss-bar-wrap">
          <div class="dboss-bar-label"><span>MP</span><span id="d-pmp-txt">${c.playerMP}/${c.playerMaxMP}</span></div>
          <div class="dboss-track"><div class="dboss-fill mp-fill" id="d-pmp-fill" style="width:${pMP}%"></div></div>
        </div>
        ${c.atkBonusTurns>0?`<div class="dboss-buff">⬆ ATK +50% (${c.atkBonusTurns}t)</div>`:''}
        ${c.blocking?`<div class="dboss-buff">🛡 Blocking next hit</div>`:''}
        <div class="dboss-derived-stats">
          ${(c.critChance||0)>0?`<span title="DEX: crit chance">⭐${c.critChance.toFixed(0)}%</span>`:''}
          ${(c.dodgeChance||0)>0?`<span title="DEX: dodge chance">💨${c.dodgeChance.toFixed(0)}%</span>`:''}
          ${(c.dblAtkChance||0)>0?`<span title="DEX: double attack">⚡${c.dblAtkChance.toFixed(0)}%</span>`:''}
          ${(c.passiveBlock||0)>0?`<span title="CON: damage reduction">🪨${c.passiveBlock.toFixed(0)}%</span>`:''}
          ${(c.mpRegen||6)>6?`<span title="INT: MP regen">💧+${c.mpRegen}/t</span>`:''}
          ${(c.petAtk||0)>0?`<span title="CHA: pet companion">🐾×${c.petSpd}</span>`:''}
        </div>
      </div>
      <div class="dboss-vs-divider">VS</div>
      <div class="dboss-fighter">
        <div class="dboss-sprite boss-sprite ${c.outcome==='win'?'d-dead':''}" id="d-enemy-sprite">${boss.emoji}</div>
        <div class="dboss-name">${boss.name}</div>
        <div class="dboss-bar-wrap">
          <div class="dboss-bar-label"><span>HP</span><span id="d-ehp-txt">${c.enemyHP}/${c.enemyMaxHP}</span></div>
          <div class="dboss-track"><div class="dboss-fill enemy-hp-fill" id="d-ehp-fill" style="width:${eHP}%"></div></div>
        </div>
      </div>
    </div>
    <div class="dboss-log" id="d-combat-log">${c.log.slice(-10).map(l=>`<div class="d-log-line">${l}</div>`).join('')}</div>
    ${c.outcome?`
      <div class="dboss-outcome ${c.outcome}">${c.outcome==='win'?(d.isPractice?'⟦ BOSS DEFEATED ⟧':'⟦ VICTORY ⟧'):'⟦ DEFEAT ⟧'}</div>
      <div style="display:flex;gap:8px;margin:8px 0">
        ${d.isPractice?`
          <button class="dexp-btn dexp-btn-boss" style="flex:2" onclick="startPractice('${d.difficulty}')">↩  RETRY</button>
          <button class="dexp-btn dexp-btn-abandon" style="flex:1" onclick="endPractice()">✗  END</button>
        `:`
          ${c.outcome==='win'?`<button class="dexp-btn dexp-btn-boss" style="flex:2" onclick="claimRewards()">🏆  CLAIM REWARDS</button>`:''}
          <button class="dexp-btn dexp-btn-abandon" style="flex:1" onclick="abandonDungeon()">← RETREAT</button>
        `}
      </div>`:`
      <div class="dboss-skills">${DUNGEON_SKILLS.map(sk=>{
        const cd=c.skillCooldowns[sk.id]||0, noMP=c.playerMP<sk.mpCost;
        return `<button class="skill-btn ${c.queuedSkill===sk.id?'queued':''}" id="skill-${sk.id}" onclick="queueSkill('${sk.id}')" ${cd>0||noMP?'disabled':''}>
          <span class="skill-emoji">${sk.emoji}</span>
          <span class="skill-name">${sk.name}</span>
          <span class="skill-desc">${sk.desc}</span>
          <span class="skill-cd">${cd>0?cd:(sk.mpCost>0?sk.mpCost+'MP':'')}</span>
        </button>`;
      }).join('')}</div>`}`;
  setTimeout(()=>{const l=document.getElementById('d-combat-log');if(l)l.scrollTop=l.scrollHeight;},50);
  return w;
}

function renderDungeonReward() {
  const d=state.dungeon, cfg=DUNGEON_CONFIG[d.difficulty], bossKill=d.combat?.outcome==='win';
  const xp=bossKill?Math.floor(cfg.rewardXP*1.5):cfg.rewardXP;
  const col=bossKill?Math.floor(cfg.rewardCol*1.5):cfg.rewardCol;
  const w=document.createElement('div');
  w.className='dungeon-reward';
  w.style.cssText=`--dcolor:${cfg.color};--dglow:${cfg.glow}`;
  w.innerHTML=`
    <div class="dreward-title">⟦ DUNGEON COMPLETE ⟧</div>
    <div class="dreward-subtitle">${cfg.emoji} ${cfg.name}${bossKill?' · Boss Defeated!':''}</div>
    <div class="dreward-items">
      <div class="dreward-item"><span class="dreward-icon">✨</span><span>+${xp} EXP${bossKill?' (×1.5 boss bonus)':''}</span></div>
      <div class="dreward-item"><span class="dreward-icon">💰</span><span>+${col} GOLD${bossKill?' (×1.5 boss bonus)':''}</span></div>
      <div class="dreward-item"><span class="dreward-icon">⬆</span><span>+${cfg.rewardStatAmt} ${STAT_NAMES[cfg.rewardStat]}</span></div>
      ${bossKill?`<div class="dreward-item boss-bonus"><span class="dreward-icon">👑</span><span>BOSS DEFEATED — All rewards ×1.5!</span></div>`:''}
    </div>
    <button class="dexp-btn dexp-btn-boss" style="display:block;width:100%;font-size:11px;padding:10px" onclick="claimRewards()">⟦ CLAIM REWARDS ⟧</button>`;
  return w;
}

// INIT
setDateLabel();
updateStreakOnLoad();
checkAchievements();
tickHpMp();
saveState();
renderAll();
initAvatar();
setInterval(()=>{ tickHpMp(); renderHeader(); saveState(); }, 60000);
// Restore dungeon timers if app was refreshed mid-session
if (state.dungeon?.phase==='exploring' && !state.dungeon.pausedAt) startDungeonTimer();
if (state.dungeon?.phase==='boss_fight' && state.dungeon.combat && !state.dungeon.combat.outcome) startCombatTimer();
