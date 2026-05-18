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

function exportSave() {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `sao_save_${todayKey()}.json`; a.click();
  URL.revokeObjectURL(url);
  showNotif('💾 Save exported!');
}
function importSave() {
  const input = document.createElement('input');
  input.type='file'; input.accept='.json,application/json';
  input.onchange = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const imp = JSON.parse(ev.target.result);
        if (!imp.stats || !imp.habitos) throw new Error('bad save');
        Object.assign(state, imp);
        saveState(); renderAll();
        showNotif('✅ Save imported!');
      } catch { showNotif('❌ Invalid save file'); }
    };
    reader.readAsText(file);
  };
  input.click();
}

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

// Rising heroic chord — first habit of the day call-to-arms
function playFirstHabit() {
  if (!soundEnabled || !_ACtx) return;
  try {
    const ctx = _getCtx(), t = ctx.currentTime;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value=-10; comp.knee.value=4; comp.ratio.value=3;
    comp.attack.value=0.001; comp.release.value=0.14; comp.connect(ctx.destination);
    // C4→E4→G4→C5 ascending arpeggio
    [[261.63,0.00,0.45],[329.63,0.11,0.45],[392.00,0.22,0.45],[523.25,0.33,0.80]].forEach(([f,s,d])=>{
      const o=ctx.createOscillator(),g=ctx.createGain(); o.type='triangle'; o.frequency.value=f;
      g.gain.setValueAtTime(0,t+s); g.gain.linearRampToValueAtTime(0.20,t+s+0.014);
      g.gain.setValueAtTime(0.20,t+s+d*0.42); g.gain.exponentialRampToValueAtTime(0.001,t+s+d+0.06);
      o.connect(g); g.connect(comp); o.start(t+s); o.stop(t+s+d+0.09);
      const o2=ctx.createOscillator(),g2=ctx.createGain(); o2.type='sine'; o2.frequency.value=f;
      g2.gain.setValueAtTime(0,t+s); g2.gain.linearRampToValueAtTime(0.13,t+s+0.014);
      g2.gain.exponentialRampToValueAtTime(0.001,t+s+d+0.09);
      o2.connect(g2); g2.connect(comp); o2.start(t+s); o2.stop(t+s+d+0.11);
    });
    // High shimmer
    [1046.50,1318.51,1567.98].forEach((f,i)=>{
      const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=f;
      const st=t+0.38+i*0.07;
      g.gain.setValueAtTime(0,st); g.gain.linearRampToValueAtTime(0.052-i*0.013,st+0.011);
      g.gain.exponentialRampToValueAtTime(0.001,st+0.55);
      o.connect(g); g.connect(comp); o.start(st); o.stop(st+0.60);
    });
  } catch(e) {}
}

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
// Tier-up — sawtooth sweep → power chord → crystal cascade (unlike any other sound here)
function playStatRankUp() {
  if (!soundEnabled || !_ACtx) return;
  try {
    const ctx = _getCtx(), t = ctx.currentTime;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value=-5; comp.knee.value=3; comp.ratio.value=4; comp.attack.value=0.001; comp.release.value=0.12;
    comp.connect(ctx.destination);
    // Rising sawtooth sweep through bandpass — the "power-up whoosh"
    const sw=ctx.createOscillator(), swG=ctx.createGain(), bp=ctx.createBiquadFilter();
    sw.type='sawtooth';
    sw.frequency.setValueAtTime(110,t); sw.frequency.exponentialRampToValueAtTime(880,t+0.30);
    bp.type='bandpass'; bp.Q.value=1.8;
    bp.frequency.setValueAtTime(220,t); bp.frequency.exponentialRampToValueAtTime(1760,t+0.30);
    swG.gain.setValueAtTime(0,t); swG.gain.linearRampToValueAtTime(0.20,t+0.04);
    swG.gain.setValueAtTime(0.20,t+0.22); swG.gain.exponentialRampToValueAtTime(0.001,t+0.33);
    sw.connect(bp); bp.connect(swG); swG.connect(comp); sw.start(t); sw.stop(t+0.36);
    // G major power chord burst at t+0.26
    [[196.00,0.20],[293.66,0.17],[392.00,0.14],[493.88,0.11],[587.33,0.08]].forEach(([f,v])=>{
      const o=ctx.createOscillator(),g=ctx.createGain(); o.type='triangle'; o.frequency.value=f;
      g.gain.setValueAtTime(0,t+0.24); g.gain.linearRampToValueAtTime(v,t+0.27);
      g.gain.exponentialRampToValueAtTime(0.001,t+1.10);
      o.connect(g); g.connect(comp); o.start(t+0.24); o.stop(t+1.14);
      const o2=ctx.createOscillator(),g2=ctx.createGain(); o2.type='sine'; o2.frequency.value=f;
      g2.gain.setValueAtTime(0,t+0.24); g2.gain.linearRampToValueAtTime(v*0.7,t+0.27);
      g2.gain.exponentialRampToValueAtTime(0.001,t+0.92);
      o2.connect(g2); g2.connect(comp); o2.start(t+0.24); o2.stop(t+0.96);
    });
    // Crystal sparkle cascade
    [1174.66,1567.98,2093.00,2637.02,3135.96].forEach((f,i)=>{
      const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=f;
      const st=t+0.28+i*0.050;
      g.gain.setValueAtTime(0,st); g.gain.linearRampToValueAtTime(0.055-i*0.009,st+0.010);
      g.gain.exponentialRampToValueAtTime(0.001,st+0.40);
      o.connect(g); g.connect(comp); o.start(st); o.stop(st+0.44);
    });
  } catch(e) {}
}


// Class Unlock — discovery shimmer: rising pentatonic arpeggio + sustained chord + sparkle cascade
function playClassUnlock() {
  if (!soundEnabled || !_ACtx) return;
  try {
    const ctx = _getCtx(), t = ctx.currentTime;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value=-6; comp.knee.value=4; comp.ratio.value=3; comp.attack.value=0.001; comp.release.value=0.14; comp.connect(ctx.destination);
    // Rising pentatonic run: D4 F#4 A4 C#5 D5
    [[293.66,0.00],[369.99,0.08],[440.00,0.16],[554.37,0.24],[587.33,0.32]].forEach(([f,s])=>{
      const o=ctx.createOscillator(),g=ctx.createGain(); o.type='triangle'; o.frequency.value=f;
      g.gain.setValueAtTime(0,t+s); g.gain.linearRampToValueAtTime(0.14,t+s+0.006); g.gain.exponentialRampToValueAtTime(0.001,t+s+0.22);
      o.connect(g); g.connect(comp); o.start(t+s); o.stop(t+s+0.26);
    });
    // Sustained pad chord at t+0.40
    [293.66,440.00,587.33,734.16].forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=f; const st=t+0.40; g.gain.setValueAtTime(0,st); g.gain.linearRampToValueAtTime(0.10-i*0.018,st+0.025); g.gain.exponentialRampToValueAtTime(0.001,st+1.10); o.connect(g); g.connect(comp); o.start(st); o.stop(st+1.15); });
    // Crystal sparkle
    [1174.66,1567.98,2093.00,2637.02,3135.96].forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=f; const st=t+0.44+i*0.055; g.gain.setValueAtTime(0,st); g.gain.linearRampToValueAtTime(0.045-i*0.007,st+0.010); g.gain.exponentialRampToValueAtTime(0.001,st+0.50); o.connect(g); g.connect(comp); o.start(st); o.stop(st+0.54); });
  } catch(e) {}
}

// Class Mastery achieved — crystalline 7-note ascending arpeggio + big chord + shimmer burst
function playMastery() {
  if (!soundEnabled || !_ACtx) return;
  try {
    const ctx = _getCtx(), t = ctx.currentTime;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value=-6; comp.knee.value=4; comp.ratio.value=3; comp.attack.value=0.001; comp.release.value=0.12; comp.connect(ctx.destination);
    [[261.63,0.00,0.10],[329.63,0.09,0.10],[392.00,0.18,0.10],[523.25,0.27,0.10],[659.25,0.36,0.10],[783.99,0.45,0.10],[1046.50,0.54,1.00]].forEach(([f,s,d])=>{
      const o=ctx.createOscillator(),g=ctx.createGain(); o.type='triangle'; o.frequency.value=f;
      g.gain.setValueAtTime(0,t+s); g.gain.linearRampToValueAtTime(0.18,t+s+0.008); g.gain.setValueAtTime(0.18,t+s+d*0.55); g.gain.exponentialRampToValueAtTime(0.001,t+s+d+0.06);
      o.connect(g); g.connect(comp); o.start(t+s); o.stop(t+s+d+0.10);
    });
    [523.25,659.25,783.99,1046.50].forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=f; const st=t+0.60; g.gain.setValueAtTime(0,st); g.gain.linearRampToValueAtTime(0.11-i*0.022,st+0.015); g.gain.exponentialRampToValueAtTime(0.001,st+1.30); o.connect(g); g.connect(comp); o.start(st); o.stop(st+1.35); });
    [2093.00,2637.02,3135.96,4186.01].forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=f; const st=t+0.65+i*0.065; g.gain.setValueAtTime(0,st); g.gain.linearRampToValueAtTime(0.042-i*0.008,st+0.010); g.gain.exponentialRampToValueAtTime(0.001,st+0.60); o.connect(g); g.connect(comp); o.start(st); o.stop(st+0.65); });
  } catch(e) {}
}

// Tier Complete — royal fanfare: ascending run + big multi-layer chord + crystal cascade
function playTierComplete() {
  if (!soundEnabled || !_ACtx) return;
  try {
    const ctx = _getCtx(), t = ctx.currentTime;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value=-4; comp.knee.value=3; comp.ratio.value=4; comp.attack.value=0.001; comp.release.value=0.10; comp.connect(ctx.destination);
    [[261.63,0.00,0.11],[329.63,0.10,0.11],[392.00,0.20,0.11],[493.88,0.30,0.11],[587.33,0.40,0.11],[783.99,0.50,0.11],[1046.50,0.60,1.30]].forEach(([f,s,d])=>{
      const o=ctx.createOscillator(),g=ctx.createGain(); o.type='square'; o.frequency.value=f;
      g.gain.setValueAtTime(0,t+s); g.gain.linearRampToValueAtTime(0.05,t+s+0.006); g.gain.setValueAtTime(0.05,t+s+d*0.70); g.gain.exponentialRampToValueAtTime(0.001,t+s+d+0.04);
      o.connect(g); g.connect(comp); o.start(t+s); o.stop(t+s+d+0.06);
      const o2=ctx.createOscillator(),g2=ctx.createGain(); o2.type='sine'; o2.frequency.value=f;
      g2.gain.setValueAtTime(0,t+s); g2.gain.linearRampToValueAtTime(0.06,t+s+0.006); g2.gain.exponentialRampToValueAtTime(0.001,t+s+d+0.06);
      o2.connect(g2); g2.connect(comp); o2.start(t+s); o2.stop(t+s+d+0.08);
    });
    [523.25,659.25,783.99,987.77,1046.50].forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.type='triangle'; o.frequency.value=f; const st=t+0.70; g.gain.setValueAtTime(0,st); g.gain.linearRampToValueAtTime(0.12-i*0.018,st+0.020); g.gain.exponentialRampToValueAtTime(0.001,st+1.80); o.connect(g); g.connect(comp); o.start(st); o.stop(st+1.85); });
    [1567.98,2093.00,2637.02,3135.96,4186.01].forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=f; const st=t+0.74+i*0.07; g.gain.setValueAtTime(0,st); g.gain.linearRampToValueAtTime(0.048-i*0.008,st+0.012); g.gain.exponentialRampToValueAtTime(0.001,st+1.10); o.connect(g); g.connect(comp); o.start(st); o.stop(st+1.15); });
  } catch(e) {}
}

// ============================================================
// STATS / TIERS
// ============================================================
const STAT_KEYS = ['STR','DEX','CON','INT','VOL','CHA'];
const STAT_NAMES = { STR:'Strength', DEX:'Dexterity', CON:'Constitution', INT:'Intelligence', VOL:'Volition', CHA:'Charisma' };
const STAT_EMOJI = { STR:'⚔', DEX:'🌿', CON:'🛡', INT:'📚', VOL:'🔥', CHA:'✨' };
const TIERS = [{t:'F',min:0},{t:'E',min:80},{t:'D',min:270},{t:'C',min:600},{t:'B',min:1500},{t:'A',min:2800},{t:'S',min:5000},{t:'SS',min:7000},{t:'SSS',min:8750}];
const TIER_COLORS = { F:'#9e9e9e', E:'#66bb6a', D:'#42a5f5', C:'#ab47bc', B:'#ffc107', A:'#ff9800', S:'#ef5350', SS:'#e91e63', SSS:'#ffd700' };

// ── Level progression ────────────────────────────────────────
const MAX_LEVEL = 100;
const LEVEL_BANDS = [
  // statReq = average stat value required (across all 6 stats) to display this rank
  // Each rank requires the previous tier's stat threshold — keeps XP and stat growth in sync
  { rank:'E',   from:1,  to:10,  xpPerLevel:1200,  statReq:0    },  // No req — start of journey
  { rank:'D',   from:11, to:20,  xpPerLevel:1800,  statReq:80   },  // E-tier stats (≈ 0.5 months)
  { rank:'C',   from:21, to:35,  xpPerLevel:2400,  statReq:270  },  // D-tier stats (≈ 1.2 months)
  { rank:'B',   from:36, to:50,  xpPerLevel:3200,  statReq:600  },  // C-tier stats (≈ 2.5 months)
  { rank:'A',   from:51, to:69,  xpPerLevel:3200,  statReq:1500 },  // B-tier stats (≈ 4.4 months)
  { rank:'S',   from:70, to:84,  xpPerLevel:9200,  statReq:2800 },  // A-tier stats (≈ 6.7 months)
  { rank:'SS',  from:85, to:94,  xpPerLevel:12600, statReq:5000 },  // S-tier stats (≈ 12 months)
  { rank:'SSS', from:95, to:100, xpPerLevel:26000, statReq:7000 },  // SS-tier stats (≈ 17 months)
];
// LEVEL_XP_TABLE[n] = total XP needed to reach level n
const LEVEL_XP_TABLE = (() => {
  const t = { 1:0 };
  for (let lv = 1; lv < MAX_LEVEL; lv++) {
    const band = LEVEL_BANDS.find(b => lv >= b.from && lv <= b.to);
    t[lv+1] = t[lv] + (band ? band.xpPerLevel : 21000);
  }
  return t;
})();
function xpForLevel(lv) {
  const band = LEVEL_BANDS.find(b => lv >= b.from && lv <= b.to);
  return band ? band.xpPerLevel : 21000;
}
function levelRank(lv) {
  return LEVEL_BANDS.find(b => lv >= b.from && lv <= b.to)?.rank || 'SSS';
}
function getLevelUpStatBonus(lv) {
  if (lv === 100) return 100;
  if (lv % 10 === 0) return 10;
  return 1;
}
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
// Shared milestone definitions — reused for migration of old saves
const DEFAULT_NEG_MILESTONES = [
  { days:7,   xp:75,   gains:{ VOL:8 },                          label:'7 días limpio',    icon:'🥉' },
  { days:14,  xp:150,  gains:{ VOL:12, INT:5 },                   label:'2 semanas limpio', icon:'🥈' },
  { days:30,  xp:350,  gains:{ VOL:20, INT:10, CHA:8 },           label:'1 mes limpio',     icon:'🥇' },
  { days:60,  xp:700,  gains:{ VOL:30, INT:15, CHA:12, STR:5 },   label:'2 meses limpio',   icon:'💎' },
  { days:90,  xp:1200, gains:{ VOL:40, INT:20, CHA:18, STR:10 },  label:'3 meses limpio',   icon:'👑' },
];
const DEFAULT_NEGATIVOS = [
  { id:'neg0', text:'NO RECAER EN ADICCIONES', hp:30,
    createdDate: null,          // set on first load
    lastBreakDate: null,        // date string of last relapse, null if never
    awardedMilestones: {},      // { 7:true, 14:true, … }
    milestones: DEFAULT_NEG_MILESTONES,
  }
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
// Returns last N day keys, oldest first, today last
function getLastNDayKeys(n=7) {
  const keys=[]; const base=new Date();
  for(let i=n-1;i>=0;i--){ const d=new Date(base); d.setDate(base.getDate()-i); keys.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`); }
  return keys;
}
const STAT_DOT_COLORS = { STR:'#ff8a80', DEX:'#b9f6ca', INT:'#80deea', CHA:'#f48fb1', VOL:'#ce93d8', VIT:'#a5d6a7', WIS:'#fff9c4' };
function getStatDotColor(gains) { const k=Object.keys(gains||{})[0]; return STAT_DOT_COLORS[k]||'#4DD0E1'; }
// D=Sunday,L=Monday,M=Tue,X=Wed,J=Thu,V=Fri,S=Sat
const _DAY_LTRS = ['D','L','M','X','J','V','S'];
function isoWeekKey(date) {
  const d=new Date(date||new Date()); d.setHours(0,0,0,0); d.setDate(d.getDate()+3-((d.getDay()+6)%7));
  const w1=new Date(d.getFullYear(),0,4);
  const wn=1+Math.round(((d-w1)/86400000-3+(w1.getDay()+6)%7)/7);
  return `${d.getFullYear()}-W${String(wn).padStart(2,'0')}`;
}

// ============================================================
// CLASS SYSTEM
// ============================================================
const CLASS_TIERS = { NOVICE:1, ADEPT:2, EXPERT:3, LEGEND:4, TRUE_HERO:5 };

// 6 paths (one per primary stat) × 4 tiers = 24 classes
// Each stat appears exactly 3× as a secondary — perfectly balanced distribution
const CLASSES = {
  // ── TIER 1 · NOVICE — one primary stat each ──────────────────
  knight:           { id:'knight',           name:'KNIGHT',           tier:1, stats:['STR'],                       passive:0.05, multiplier:0.10, masteryDays:7,  color:'#ef5350' },
  rogue:            { id:'rogue',            name:'ROGUE',            tier:1, stats:['DEX'],                       passive:0.05, multiplier:0.10, masteryDays:7,  color:'#66bb6a' },
  guardian:         { id:'guardian',         name:'GUARDIAN',         tier:1, stats:['CON'],                       passive:0.05, multiplier:0.10, masteryDays:7,  color:'#ffa726' },
  mage:             { id:'mage',             name:'MAGE',             tier:1, stats:['INT'],                       passive:0.05, multiplier:0.10, masteryDays:7,  color:'#42a5f5' },
  monk:             { id:'monk',             name:'MONK',             tier:1, stats:['VOL'],                       passive:0.05, multiplier:0.10, masteryDays:7,  color:'#ab47bc' },
  bard:             { id:'bard',             name:'BARD',             tier:1, stats:['CHA'],                       passive:0.05, multiplier:0.10, masteryDays:7,  color:'#ffca28' },
  // ── TIER 2 · ADEPT — primary + 1 secondary ───────────────────
  paladin:          { id:'paladin',          name:'PALADIN',          tier:2, stats:['STR','VOL'],                 passive:0.07, multiplier:0.12, masteryDays:14, color:'#ef5350' },
  duelist:          { id:'duelist',          name:'DUELIST',          tier:2, stats:['DEX','STR'],                 passive:0.07, multiplier:0.12, masteryDays:14, color:'#66bb6a' },
  sentinel:         { id:'sentinel',         name:'SENTINEL',         tier:2, stats:['CON','STR'],                 passive:0.07, multiplier:0.12, masteryDays:14, color:'#ffa726' },
  archmage:         { id:'archmage',         name:'ARCHMAGE',         tier:2, stats:['INT','VOL'],                 passive:0.07, multiplier:0.12, masteryDays:14, color:'#42a5f5' },
  crusader:         { id:'crusader',         name:'CRUSADER',         tier:2, stats:['VOL','STR'],                 passive:0.07, multiplier:0.12, masteryDays:14, color:'#ab47bc' },
  enchanter:        { id:'enchanter',        name:'ENCHANTER',        tier:2, stats:['CHA','DEX'],                 passive:0.07, multiplier:0.12, masteryDays:14, color:'#ffca28' },
  // ── TIER 3 · EXPERT — primary + 2 secondaries ────────────────
  templar:          { id:'templar',          name:'TEMPLAR',          tier:3, stats:['STR','VOL','CON'],           passive:0.10, multiplier:0.15, masteryDays:21, color:'#ef5350' },
  assassin:         { id:'assassin',         name:'ASSASSIN',         tier:3, stats:['DEX','STR','INT'],           passive:0.10, multiplier:0.15, masteryDays:21, color:'#66bb6a' },
  iron_warden:      { id:'iron_warden',      name:'IRON WARDEN',      tier:3, stats:['CON','STR','DEX'],           passive:0.10, multiplier:0.15, masteryDays:21, color:'#ffa726' },
  loremaster:       { id:'loremaster',       name:'LOREMASTER',       tier:3, stats:['INT','VOL','CHA'],           passive:0.10, multiplier:0.15, masteryDays:21, color:'#42a5f5' },
  warlord:          { id:'warlord',          name:'WARLORD',          tier:3, stats:['VOL','STR','INT'],           passive:0.10, multiplier:0.15, masteryDays:21, color:'#ab47bc' },
  herald:           { id:'herald',           name:'HERALD',           tier:3, stats:['CHA','DEX','CON'],           passive:0.10, multiplier:0.15, masteryDays:21, color:'#ffca28' },
  // ── TIER 4 · LEGEND — primary + 3 secondaries ────────────────
  godslayer:        { id:'godslayer',        name:'GODSLAYER',        tier:4, stats:['STR','VOL','CON','DEX'],     passive:0.13, multiplier:0.18, masteryDays:30, color:'#ffd700' },
  void_hunter:      { id:'void_hunter',      name:'VOID HUNTER',      tier:4, stats:['DEX','STR','INT','VOL'],     passive:0.13, multiplier:0.18, masteryDays:30, color:'#ffd700' },
  colossus:         { id:'colossus',         name:'COLOSSUS',         tier:4, stats:['CON','STR','DEX','CHA'],     passive:0.13, multiplier:0.18, masteryDays:30, color:'#ffd700' },
  arcane_sovereign: { id:'arcane_sovereign', name:'ARCANE SOVEREIGN', tier:4, stats:['INT','VOL','CHA','CON'],     passive:0.13, multiplier:0.18, masteryDays:30, color:'#ffd700' },
  iron_saint:       { id:'iron_saint',       name:'IRON SAINT',       tier:4, stats:['VOL','STR','INT','CHA'],     passive:0.13, multiplier:0.18, masteryDays:30, color:'#ffd700' },
  divine_prophet:   { id:'divine_prophet',   name:'DIVINE PROPHET',   tier:4, stats:['CHA','DEX','CON','INT'],     passive:0.13, multiplier:0.18, masteryDays:30, color:'#ffd700' },
  // ── TIER 5 · ??? (hidden) ────────────────────────────────────
  true_hero:        { id:'true_hero',        name:'TRUE HERO',        tier:5, stats:['STR','DEX','CON','INT','VOL','CHA'], passive:0.20, multiplier:0.20, masteryDays:90, color:'#ffffff', hidden:true },
};

// ── Class flavor descriptions ─────────────────────────────────
const CLASS_DESCS = {
  // Tier 1 — Novice
  knight:            "Forged in steel and discipline — STR is the foundation of all power",
  rogue:             "Speed over strength — those who strike first rarely need to strike twice",
  guardian:          "Immovable. The one who endures outlasts all who oppose them",
  mage:              "Knowledge is the most dangerous weapon — the mind shapes reality",
  monk:              "Will bends what strength cannot break — inner fire transcends all limits",
  bard:              "Presence is power — to be seen and remembered is its own kind of strength",
  // Tier 2 — Adept
  paladin:           "Righteous force guided by iron will — strength in service of something greater",
  duelist:           "Precision married to power — strikes that are lightning-fast and devastating",
  sentinel:          "The unmovable guardian — power channeled into absolute defense",
  archmage:          "Intellect fueled by unbreakable focus — knowledge becomes unstoppable force",
  crusader:          "Will made manifest through raw strength — a force of nature with purpose",
  enchanter:         "Elegance in motion — charm backed by reflexes others cannot follow",
  // Tier 3 — Expert
  templar:           "Strength, will and endurance unified — a weapon that never dulls and never falls",
  assassin:          "Speed, power and cunning in perfect alignment — no target is unreachable",
  iron_warden:       "Body as fortress, movement as weapon — the eternal immovable defender",
  loremaster:        "Mind, will and presence — the scholar who commands the room as easily as reality",
  warlord:           "Willpower forged through strength and strategy — commands armies, breaks limits",
  herald:            "The voice that moves masses — presence amplified by body and conviction",
  // Tier 4 — Legend
  godslayer:         "Strength, will, endurance and speed transcended — forged to fell the divine",
  void_hunter:       "Moves through shadow, strikes with precision, sees what others cannot",
  colossus:          "An immovable force with presence that reshapes the battlefield — nothing breaks what cannot be moved",
  arcane_sovereign:  "The apex of mind and soul — commands knowledge, will, presence and endurance as one",
  iron_saint:        "Will beyond mortal limits, strength without equal, intellect that cuts, presence that inspires",
  divine_prophet:    "Presence, speed, endurance and intellect merged — a living legend who shapes fate itself",
  // Tier 5
  true_hero:         "Beyond all limits — every facet of being honed to absolute perfection",
};

// Mastery flat reward per class (added permanently to base stats on mastery)
const CLASS_MASTERY_REWARD = { 1:15, 2:20, 3:30, 4:50, 5:80 };

// Tier completion rewards (permanent passive % on ALL stats)
const TIER_COMPLETE_REWARD = {
  1: { passiveAll:0.02, skill:'veteran_edge'  },
  2: { passiveAll:0.03, skill:'battle_hardened' },
  3: { passiveAll:0.04, skill:'iron_resolve'  },
  4: { passiveAll:0.05, skill:'transcendence' },
  5: { passiveAll:0.10, skill:'limitless'     },
};

// Classes grouped by tier (for completion checks)
const CLASSES_BY_TIER = [1,2,3,4,5].reduce((acc,t) => {
  acc[t] = Object.values(CLASSES).filter(c => c.tier === t).map(c => c.id);
  return acc;
}, {});

function defaultClassState() {
  return {
    equipped: null,           // class id currently equipped
    mastery: {},              // { classId: daysAccumulated }
    masteredClasses: {},      // { classId: true } — permanently mastered
    completedTiers: {},       // { tier: true } — tier completion bonus claimed
    tierPassiveBonus: 0,      // sum of all tier completion passiveAll bonuses
    unlockedSkills: [],       // skill ids unlocked via tier completion
    history: [],              // [ classId, ... ] in order equipped
    lastMasteryTick: null,    // date string of last daily tick
    notifiedUnlocks: {},      // { classId: true } — popup already shown for this unlock
  };
}

// ============================================================
// CLASS UNLOCK LOGIC  (Paso 2)
// ============================================================

// Level + minimum stat value required to access each tier
// Aligned with tier progression table:
//   NOVICE  → lv 1-19  / Rank E-D  / no stat req    — from the start
//   ADEPT   → lv 20-39 / Rank D-C-B / D stats (270) — ~mes 1
//   EXPERT  → lv 40-69 / Rank B-A  / B stats (1500) — ~mes 3
//   LEGEND  → lv 70-94 / Rank S-SS  / S stats (5000) — ~mes 14
//   HERO    → lv 95-100/ Rank SSS  / SSS stats (8750) + all Tier-4 mastered
const CLASS_TIER_REQ = {
  1: { level: 1,  statMin: 0    },   // NOVICE  — disponible desde el inicio
  2: { level: 20, statMin: 270  },   // ADEPT   — Rank D
  3: { level: 40, statMin: 1500 },   // EXPERT  — Rank B
  4: { level: 70, statMin: 5000 },   // LEGEND  — Rank S
  5: { level: 95, statMin: 8750 },   // HERO    — Rank SSS (hidden)
};

// Returns { available:bool, locked:bool, reasons:string[] }
// reasons is non-empty when locked — use to show unlock hints in UI
function getClassUnlockStatus(classId, state) {
  const cls = CLASSES[classId];
  if (!cls) return { available: false, locked: true, reasons: ['Unknown class'], met: [] };

  const req   = CLASS_TIER_REQ[cls.tier];
  const level = (state.totalXp !== undefined) ? calcLevel(state.totalXp).level : 1;
  const reasons = [];
  const met = [];

  // ── Rank check (Tier 1 requires rank E) ──────────────────
  if (req.rank) {
    if (rankIdx(getPlayerRank()) < rankIdx(req.rank)) {
      reasons.push(`Rango ${req.rank} requerido (actual: ${getPlayerRank()})`);
    } else {
      met.push(`Rango ${req.rank} ✓`);
    }
  }

  // ── Level check ──────────────────────────────────────────
  if (level < req.level) {
    reasons.push(`Nivel ${req.level} requerido (actual: ${level})`);
  } else {
    met.push(`Nivel ${req.level} ✓`);
  }

  // ── Stat check ───────────────────────────────────────────
  if (req.statMin > 0) {
    cls.stats.forEach(s => {
      const val = (state.stats && state.stats[s]) || 0;
      if (val < req.statMin) {
        reasons.push(`${STAT_NAMES[s]} ≥ ${req.statMin} (actual: ${fmtStat(val)})`);
      } else {
        met.push(`${STAT_NAMES[s]} ≥ ${req.statMin} ✓`);
      }
    });
  }

  // ── Mastery prerequisite (Tier 2 needs mastered Tier-1 with shared stat, etc.) ──
  if (cls.tier >= 2) {
    const mastered = state.classData ? state.classData.masteredClasses || {} : {};
    const hasMasteredPrereq = Object.values(CLASSES).some(c =>
      c.tier === cls.tier - 1 &&
      mastered[c.id] &&
      c.stats.some(s => cls.stats.includes(s))
    );
    const tierNames = { 1:'Novice', 2:'Adept', 3:'Expert', 4:'Legend' };
    const prevName  = tierNames[cls.tier - 1] || 'anterior';
    const statsStr  = cls.stats.map(s => STAT_NAMES[s]).join('/');
    if (!hasMasteredPrereq) {
      reasons.push(`Dominá una clase ${prevName} de ${statsStr} primero`);
    } else {
      met.push(`Clase ${prevName} de ${statsStr} ✓`);
    }
  }

  // ── TRUE HERO: only unlocks when all Tier-4 are mastered ─
  if (cls.tier === 5) {
    const mastered  = state.classData ? state.classData.masteredClasses || {} : {};
    const allTier4  = CLASSES_BY_TIER[4].every(id => mastered[id]);
    if (!allTier4) {
      reasons.push('???');
    } else {
      met.push('??? ✓');
    }
  }

  return { available: reasons.length === 0, locked: reasons.length > 0, reasons, met };
}

// Returns array of class IDs the player can currently equip
// Hidden classes (TRUE HERO) are excluded until truly unlocked
function getAvailableClasses(state) {
  return Object.keys(CLASSES).filter(id => {
    const cls = CLASSES[id];
    if (cls.hidden) {
      // Only expose TRUE HERO when fully unlocked
      const mastered = state.classData ? state.classData.masteredClasses || {} : {};
      return CLASSES_BY_TIER[4].every(cid => mastered[cid]);
    }
    return getClassUnlockStatus(id, state).available;
  });
}

// Returns all classes of a given tier with their unlock status
function getClassesByTier(tier, state) {
  return Object.values(CLASSES)
    .filter(c => c.tier === tier && !c.hidden)
    .map(c => ({ ...c, ...getClassUnlockStatus(c.id, state) }));
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
      if (!s.negativos) s.negativos = DEFAULT_NEGATIVOS.map(n=>({...n, done:{}, createdDate:todayKey(), lastBreakDate:null, awardedMilestones:{}, milestones:DEFAULT_NEG_MILESTONES.map(m=>({...m}))}));
      if (typeof s.totalXp !== 'number') s.totalXp = 0;
      if (typeof s.streak  !== 'number') s.streak  = 0;
      if (!s.lastActiveDay) s.lastActiveDay = todayKey();
      if (typeof s.col !== 'number') s.col = 0;
      if (!s.playerName) s.playerName = 'Tuni';
      if (!s.playerTitle) s.playerTitle = 'Beginner';
      if (!s.achievements) s.achievements = {};
      if (!s.logros) s.logros = { perfectWeekCount:0, phoenixCount:0, lastPerfectWeekDay:null, lastPhoenixDay:null, perfectDayCount:0, lastPerfectDay:null };
      if (s.logros.perfectDayCount === undefined) { s.logros.perfectDayCount = 0; s.logros.lastPerfectDay = null; }
      if (!s.inventory) s.inventory = [{itemId:'iron_sword',quantity:1},{itemId:'leather_armor',quantity:1},{itemId:'iron_helm',quantity:1},{itemId:'leather_boots',quantity:1},{itemId:'hp_pot_s',quantity:5},{itemId:'mp_pot_s',quantity:2}];
      if (!s.equipment) s.equipment = {earring_l:null,helmet:null,earring_r:null,weapon:null,armor:null,shield:null,necklace:null,bracelet:null,belt:null,boots:null};
      if (!s.hasOwnProperty('hp') || s.hp === undefined) s.hp = null;
      if (!s.hasOwnProperty('mp') || s.mp === undefined) s.mp = null;
      if (!s.hasOwnProperty('lastHpMpTick')) s.lastHpMpTick = null;
      if (!s.classData) s.classData = defaultClassState();
      if (!s.classData.equipped) s.classData.equipped = null;
      if (!s.classData.mastery) s.classData.mastery = {};
      if (!s.classData.masteredClasses) s.classData.masteredClasses = {};
      if (!s.classData.completedTiers) s.classData.completedTiers = {};
      if (typeof s.classData.tierPassiveBonus !== 'number') s.classData.tierPassiveBonus = 0;
      if (!s.classData.unlockedSkills) s.classData.unlockedSkills = [];
      if (!s.classData.history) s.classData.history = [];
      if (!s.classData.lastMasteryTick) s.classData.lastMasteryTick = null;
      if (!s.classData.notifiedUnlocks) {
        // Seed with already-available classes so existing users don't get spam on first load
        const seed = {}; getAvailableClasses(s).forEach(id => { seed[id] = true; });
        s.classData.notifiedUnlocks = seed;
      }
      if (!s.lastWeeklyReport) s.lastWeeklyReport = null;
      // Migrate old dungeon difficulty keys (easy/medium/hard/xhard → null)
      if (s.dungeon && ['easy','medium','hard','xhard'].includes(s.dungeon.difficulty)) s.dungeon = null;
      // Add missing idle fields to in-progress dungeons
      if (s.dungeon && s.dungeon.phase==='exploring' && s.dungeon.idleEnemyHP===undefined) {
        const _cfg = DUNGEON_CONFIG[s.dungeon.difficulty];
        if (_cfg) {
          s.dungeon.idleEnemyIndex = 0;
          s.dungeon.idleEnemyHP    = _cfg.enemies[0].hp;
          s.dungeon.idleEnemyMaxHP = _cfg.enemies[0].hp;
          s.dungeon.idleTotalKills = 0;
          s.dungeon.idleLastDmgTick = Date.now();
        } else { s.dungeon = null; }
      }
      // ensure done exists on all habits
      s.habitos.forEach(h=>{ if(!h.done) h.done={}; });
      s.weekly.forEach(w=>{ if(!w.done) w.done={}; });
      s.trabajo.forEach(t=>{ if(!t.done) t.done={}; });
      s.negativos.forEach(n=>{ if(!n.done) n.done={}; });
      // ── Migrate avoid habits to new streak format ──────────────
      s.negativos.forEach(n => {
        // Upgrade old neg0 ("Más de 3hs de celular") to the new avoid habit
        if (n.id === 'neg0' && (n.text === 'Más de 3hs de celular' || !n.milestones)) {
          n.text = 'NO RECAER EN ADICCIONES';
          n.hp   = 30;
          if (!n.milestones) n.milestones = DEFAULT_NEG_MILESTONES.map(m=>({...m}));
        }
        if (!n.milestones)         n.milestones         = [];
        if (!n.awardedMilestones)  n.awardedMilestones  = {};
        if (!n.createdDate)        n.createdDate        = todayKey();
        // Derive lastBreakDate from done history if not present
        if (!n.hasOwnProperty('lastBreakDate')) {
          const breaks = Object.keys(n.done||{}).sort();
          n.lastBreakDate = breaks.length ? breaks[breaks.length-1] : null;
        }
      });
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
  return { habitos: DEFAULT_HABITOS.map(h=>({...h,done:{}})), weekly: DEFAULT_WEEKLY.map(w=>({...w,done:{}})), negativos: DEFAULT_NEGATIVOS.map(n=>({...n,done:{}})), trabajo: [], stats: defaultStats(), totalXp:0, streak:0, lastActiveDay:todayKey(), col:0, playerName:'Tuni', playerTitle:'Beginner', achievements:{}, logros:{perfectWeekCount:0,phoenixCount:0,lastPerfectWeekDay:null,lastPhoenixDay:null}, dungeon:null, inventory:[{itemId:'iron_sword',quantity:1},{itemId:'leather_armor',quantity:1},{itemId:'iron_helm',quantity:1},{itemId:'leather_boots',quantity:1},{itemId:'hp_pot_s',quantity:5},{itemId:'mp_pot_s',quantity:2}], equipment:{earring_l:null,helmet:null,earring_r:null,weapon:null,armor:null,shield:null,necklace:null,bracelet:null,belt:null,boots:null}, classData: defaultClassState(), lastWeeklyReport:null };
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

const DUNGEON_RANK_UNLOCK = { E:1, D:15, C:25, B:35, A:50, S:65 };
const DUNGEON_CLASS_DEFS = [
  { key:'warrior', label:'Guerrero', emoji:'⚔️' },
  { key:'rogue',   label:'Rogue',    emoji:'🗡️' },
  { key:'mage',    label:'Mago',     emoji:'🔮' },
];

const DUNGEON_CONFIG = {
  // ══ E RANK ══
  e_warrior:{id:'e_warrior',rank:'E',dungeonClass:'warrior',unlockLevel:1,
    name:'Forja del Caballero Oscuro',emoji:'⚔️',color:'#ef5350',glow:'rgba(239,83,80,0.4)',bgColor:'rgba(20,3,3,0.97)',
    minHours:1,rewardXP:200,rewardCol:50,rewardStat:'STR',rewardStatAmt:2,
    enemies:[{name:'Zombie Armado',emoji:'🧟',hp:30,atk:8},{name:'Golem de Hierro',emoji:'🤖',hp:45,atk:10},{name:'Guardia Oscuro',emoji:'🛡️',hp:55,atk:12},{name:'Caballero Roto',emoji:'⚔️',hp:70,atk:15}],
    boss:{name:'El Herrero Maldito',emoji:'🔨',hp:400,atk:18,special:'Golpe Forjado',specialEvery:4}},
  e_rogue:{id:'e_rogue',rank:'E',dungeonClass:'rogue',unlockLevel:1,
    name:'Bosque Tenebroso',emoji:'🌲',color:'#66bb6a',glow:'rgba(102,187,106,0.4)',bgColor:'rgba(3,12,3,0.97)',
    minHours:1,rewardXP:200,rewardCol:50,rewardStat:'DEX',rewardStatAmt:2,
    enemies:[{name:'Araña Sombría',emoji:'🕷️',hp:25,atk:7},{name:'Lobo Oscuro',emoji:'🐺',hp:40,atk:10},{name:'Elfo Proscrito',emoji:'🧝',hp:55,atk:13},{name:'Arquero Maldito',emoji:'🏹',hp:65,atk:16}],
    boss:{name:'El Cazador de Sombras',emoji:'🌑',hp:380,atk:20,special:'Trampa Mortal',specialEvery:3}},
  e_mage:{id:'e_mage',rank:'E',dungeonClass:'mage',unlockLevel:1,
    name:'Librería Maldita',emoji:'📚',color:'#7e57c2',glow:'rgba(126,87,194,0.4)',bgColor:'rgba(8,3,18,0.97)',
    minHours:1,rewardXP:200,rewardCol:50,rewardStat:'INT',rewardStatAmt:2,
    enemies:[{name:'Erudito Maldito',emoji:'📖',hp:25,atk:8},{name:'Espectro de Tinta',emoji:'✒️',hp:40,atk:12},{name:'Golem de Papel',emoji:'📜',hp:50,atk:14},{name:'Duende Arcano',emoji:'👻',hp:65,atk:17}],
    boss:{name:'El Archivista Corrupto',emoji:'📚',hp:360,atk:22,special:'Maldición Literaria',specialEvery:4}},

  // ══ D RANK ══
  d_warrior:{id:'d_warrior',rank:'D',dungeonClass:'warrior',unlockLevel:15,
    name:'Minas del Hierro Maldito',emoji:'⛏️',color:'#ff7043',glow:'rgba(255,112,67,0.4)',bgColor:'rgba(20,8,3,0.97)',
    minHours:2,rewardXP:400,rewardCol:100,rewardStat:'CON',rewardStatAmt:3,
    enemies:[{name:'Trol de Caverna',emoji:'🧌',hp:70,atk:18},{name:'Guardián de Piedra',emoji:'🪨',hp:100,atk:22},{name:'Elemental de Hierro',emoji:'⚙️',hp:130,atk:28},{name:'Gigante de Roca',emoji:'💎',hp:160,atk:33}],
    boss:{name:'El Señor de las Minas',emoji:'⛏️',hp:750,atk:30,special:'Derrumbe',specialEvery:4}},
  d_rogue:{id:'d_rogue',rank:'D',dungeonClass:'rogue',unlockLevel:15,
    name:'Templo de las Sombras',emoji:'🕌',color:'#29b6f6',glow:'rgba(41,182,246,0.4)',bgColor:'rgba(0,10,20,0.97)',
    minHours:2,rewardXP:400,rewardCol:100,rewardStat:'DEX',rewardStatAmt:3,
    enemies:[{name:'Monje Umbral',emoji:'🥷',hp:65,atk:20},{name:'Ninja Maldito',emoji:'💨',hp:90,atk:25},{name:'Guardián del Templo',emoji:'🏛️',hp:115,atk:30},{name:'Asesino Fantasma',emoji:'🗡️',hp:145,atk:36}],
    boss:{name:'El Monje de las Sombras',emoji:'🥷',hp:700,atk:35,special:'Golpe Fantasma',specialEvery:3}},
  d_mage:{id:'d_mage',rank:'D',dungeonClass:'mage',unlockLevel:15,
    name:'Torre del Caos Arcano',emoji:'🌀',color:'#ab47bc',glow:'rgba(171,71,188,0.4)',bgColor:'rgba(10,0,18,0.97)',
    minHours:2,rewardXP:400,rewardCol:100,rewardStat:'INT',rewardStatAmt:3,
    enemies:[{name:'Sprite del Caos',emoji:'🌀',hp:60,atk:20},{name:'Constructo Arcano',emoji:'🔮',hp:90,atk:25},{name:'Fantasma Temporal',emoji:'⏳',hp:115,atk:30},{name:'Eco del Vacío',emoji:'👁️',hp:145,atk:36}],
    boss:{name:'El Maestro del Caos',emoji:'🌀',hp:720,atk:38,special:'Tormenta Arcana',specialEvery:3}},

  // ══ C RANK ══
  c_warrior:{id:'c_warrior',rank:'C',dungeonClass:'warrior',unlockLevel:25,
    name:'Ciudadela en Ruinas',emoji:'🏰',color:'#f44336',glow:'rgba(244,67,54,0.4)',bgColor:'rgba(25,3,3,0.97)',
    minHours:3,rewardXP:800,rewardCol:200,rewardStat:'STR',rewardStatAmt:5,
    enemies:[{name:'Caballero Caído',emoji:'⚔️',hp:130,atk:35},{name:'Golem de Batalla',emoji:'🤖',hp:180,atk:42},{name:'Espectro del Sitio',emoji:'💀',hp:230,atk:50},{name:'Paladín Oscuro',emoji:'🛡️',hp:290,atk:58}],
    boss:{name:'El General Caído',emoji:'🗡️',hp:1300,atk:55,special:'Carga Mortal',specialEvery:4}},
  c_rogue:{id:'c_rogue',rank:'C',dungeonClass:'rogue',unlockLevel:25,
    name:'Bahía de los Corsarios',emoji:'🌊',color:'#26c6da',glow:'rgba(38,198,218,0.4)',bgColor:'rgba(0,10,18,0.97)',
    minHours:3,rewardXP:800,rewardCol:200,rewardStat:'CHA',rewardStatAmt:5,
    enemies:[{name:'Espectro Marino',emoji:'🌊',hp:120,atk:35},{name:'Pirata Fantasma',emoji:'💀',hp:165,atk:43},{name:'Sirena Tormentosa',emoji:'🧜',hp:210,atk:50},{name:'Corsario Espectral',emoji:'⚓',hp:265,atk:58}],
    boss:{name:'El Capitán Espectral',emoji:'🏴‍☠️',hp:1200,atk:60,special:'Borda Mortal',specialEvery:3}},
  c_mage:{id:'c_mage',rank:'C',dungeonClass:'mage',unlockLevel:25,
    name:'Volcán de Magma Arcano',emoji:'🌋',color:'#ff5722',glow:'rgba(255,87,34,0.4)',bgColor:'rgba(22,5,0,0.97)',
    minHours:3,rewardXP:800,rewardCol:200,rewardStat:'VOL',rewardStatAmt:5,
    enemies:[{name:'Sprite de Magma',emoji:'🔥',hp:115,atk:35},{name:'Elemental Ígneo',emoji:'🌋',hp:160,atk:42},{name:'Sabio del Fuego',emoji:'🧙',hp:210,atk:50},{name:'Erudito Infernal',emoji:'👿',hp:265,atk:58}],
    boss:{name:'El Mago del Abismo Ígneo',emoji:'🌋',hp:1400,atk:62,special:'Lluvia de Magma',specialEvery:4}},

  // ══ B RANK ══
  b_warrior:{id:'b_warrior',rank:'B',dungeonClass:'warrior',unlockLevel:35,
    name:'Fortaleza del Infierno',emoji:'🔥',color:'#d32f2f',glow:'rgba(211,47,47,0.5)',bgColor:'rgba(25,0,0,0.99)',
    minHours:4,rewardXP:1500,rewardCol:350,rewardStat:'STR',rewardStatAmt:8,
    enemies:[{name:'Guardián Infernal',emoji:'😈',hp:260,atk:60},{name:'Caballero Demonio',emoji:'👹',hp:360,atk:72},{name:'Paladín Infernal',emoji:'🔥',hp:460,atk:85},{name:'Campeón del Pecado',emoji:'💢',hp:580,atk:100}],
    boss:{name:'El Señor Infernal',emoji:'👿',hp:2200,atk:90,special:'Tormenta de Fuego',specialEvery:3}},
  b_rogue:{id:'b_rogue',rank:'B',dungeonClass:'rogue',unlockLevel:35,
    name:'Teatro de las Almas',emoji:'🎭',color:'#9c27b0',glow:'rgba(156,39,176,0.45)',bgColor:'rgba(10,0,18,0.99)',
    minHours:4,rewardXP:1500,rewardCol:350,rewardStat:'DEX',rewardStatAmt:8,
    enemies:[{name:'Titiritero de Almas',emoji:'🎭',hp:250,atk:60},{name:'Espectro de Máscaras',emoji:'😷',hp:340,atk:72},{name:'Danza de la Muerte',emoji:'💃',hp:440,atk:85},{name:'Bufón Maldito',emoji:'🃏',hp:560,atk:100}],
    boss:{name:'El Director de Almas',emoji:'🎭',hp:2000,atk:95,special:'Danza Mortal',specialEvery:3}},
  b_mage:{id:'b_mage',rank:'B',dungeonClass:'mage',unlockLevel:35,
    name:'Cripta Estelar',emoji:'🌌',color:'#3949ab',glow:'rgba(57,73,171,0.5)',bgColor:'rgba(0,0,15,0.99)',
    minHours:4,rewardXP:1500,rewardCol:350,rewardStat:'VOL',rewardStatAmt:8,
    enemies:[{name:'Liche Estelar',emoji:'💫',hp:240,atk:60},{name:'Fantasma Astral',emoji:'🌟',hp:330,atk:72},{name:'Erudito del Vacío',emoji:'🔭',hp:430,atk:85},{name:'Espectro Cósmico',emoji:'✨',hp:540,atk:100}],
    boss:{name:'El Nigromante Estelar',emoji:'🌌',hp:2100,atk:88,special:'Nova Estelar',specialEvery:4}},

  // ══ A RANK ══
  a_warrior:{id:'a_warrior',rank:'A',dungeonClass:'warrior',unlockLevel:50,
    name:'Pico del Rey Eterno',emoji:'🏔️',color:'#ffa000',glow:'rgba(255,160,0,0.5)',bgColor:'rgba(15,8,0,0.99)',
    minHours:5,rewardXP:2500,rewardCol:600,rewardStat:'STR',rewardStatAmt:12,
    enemies:[{name:'Titán de Montaña',emoji:'🏔️',hp:520,atk:110},{name:'Guardián Eterno',emoji:'⚙️',hp:710,atk:135},{name:'Rey de Piedra',emoji:'👑',hp:910,atk:160},{name:'Custodio Ancestral',emoji:'🗿',hp:1150,atk:190}],
    boss:{name:'El Rey de la Montaña Eterna',emoji:'🏔️',hp:4500,atk:145,special:'Avalancha Eterna',specialEvery:3}},
  a_rogue:{id:'a_rogue',rank:'A',dungeonClass:'rogue',unlockLevel:50,
    name:'Santuario de la Luna Negra',emoji:'🌙',color:'#5c6bc0',glow:'rgba(92,107,192,0.5)',bgColor:'rgba(0,0,12,0.99)',
    minHours:5,rewardXP:2500,rewardCol:600,rewardStat:'DEX',rewardStatAmt:12,
    enemies:[{name:'Asesino Lunar',emoji:'🌙',hp:500,atk:112},{name:'Celestial Oscuro',emoji:'🌑',hp:690,atk:138},{name:'Fantasma Lunar',emoji:'💜',hp:880,atk:163},{name:'Estrella Oscura',emoji:'⭐',hp:1100,atk:192}],
    boss:{name:'La Sombra de la Luna',emoji:'🌕',hp:4200,atk:150,special:'Eclipse Mortal',specialEvery:3}},
  a_mage:{id:'a_mage',rank:'A',dungeonClass:'mage',unlockLevel:50,
    name:'Nexo Arcano',emoji:'⚡',color:'#00bcd4',glow:'rgba(0,188,212,0.5)',bgColor:'rgba(0,5,15,0.99)',
    minHours:5,rewardXP:2500,rewardCol:600,rewardStat:'INT',rewardStatAmt:12,
    enemies:[{name:'Núcleo Arcano',emoji:'⚡',hp:480,atk:110},{name:'Leviatán de Runas',emoji:'🌊',hp:660,atk:135},{name:'Titán de Hechizos',emoji:'🔮',hp:850,atk:162},{name:'Arquitecto del Vacío',emoji:'🌀',hp:1080,atk:192}],
    boss:{name:'El Tejedor del Nexo',emoji:'⚡',hp:4800,atk:140,special:'Sobrecarga Arcana',specialEvery:4}},

  // ══ S RANK ══
  s_warrior:{id:'s_warrior',rank:'S',dungeonClass:'warrior',unlockLevel:65,
    name:'Salón del Señor de la Guerra',emoji:'👑',color:'#ffd700',glow:'rgba(255,215,0,0.55)',bgColor:'rgba(15,10,0,0.99)',
    minHours:6,rewardXP:4000,rewardCol:1000,rewardStat:'STR',rewardStatAmt:18,
    enemies:[{name:'Sombra del Señor',emoji:'👑',hp:1050,atk:210},{name:'Campeón Eterno',emoji:'⚔️',hp:1450,atk:260},{name:'Remanente del Dios',emoji:'🌟',hp:1850,atk:310},{name:'Fantasma Legendario',emoji:'💀',hp:2300,atk:370}],
    boss:{name:'El Señor de la Guerra Eterno',emoji:'👑',hp:9000,atk:260,special:'Cólera Eterna',specialEvery:3}},
  s_rogue:{id:'s_rogue',rank:'S',dungeonClass:'rogue',unlockLevel:65,
    name:'Vacío del Asesino Supremo',emoji:'🌑',color:'#e040fb',glow:'rgba(224,64,251,0.5)',bgColor:'rgba(5,0,12,0.99)',
    minHours:6,rewardXP:4000,rewardCol:1000,rewardStat:'DEX',rewardStatAmt:18,
    enemies:[{name:'Asesino del Vacío',emoji:'🌑',hp:1000,atk:215},{name:'Rey Fantasma',emoji:'👁️',hp:1380,atk:265},{name:'Dios de las Sombras',emoji:'🌚',hp:1780,atk:315},{name:'Entidad Nula',emoji:'⚫',hp:2200,atk:375}],
    boss:{name:'El Asesino del Vacío',emoji:'🌑',hp:8500,atk:280,special:'Aniquilación',specialEvery:3}},
  s_mage:{id:'s_mage',rank:'S',dungeonClass:'mage',unlockLevel:65,
    name:'Esfera del Arcano Primordial',emoji:'🌟',color:'#e8eaf6',glow:'rgba(232,234,246,0.45)',bgColor:'rgba(5,5,15,0.99)',
    minHours:6,rewardXP:4000,rewardCol:1000,rewardStat:'INT',rewardStatAmt:18,
    enemies:[{name:'Destello Primordial',emoji:'🌟',hp:980,atk:212},{name:'Hechizo Ancestral',emoji:'✨',hp:1350,atk:262},{name:'Horror Cósmico',emoji:'👾',hp:1740,atk:312},{name:'Dios del Vacío',emoji:'🌌',hp:2150,atk:372}],
    boss:{name:'El Arcano Primordial',emoji:'🌟',hp:10000,atk:250,special:'Extinción Arcana',specialEvery:4}},
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
  warrior:{
    E:['iron_sword','leather_armor','iron_helm','wooden_shield','leather_belt','hp_pot_s','monster_gem'],
    D:['steel_blade','chain_mail','iron_helm','iron_shield','warrior_belt','hp_pot_s','hp_pot_m'],
    C:['steel_blade','chain_mail','guardian_plate','iron_shield','warrior_belt','hp_pot_m','dragon_scale'],
    B:['shadow_edge','guardian_plate','warrior_belt','hp_pot_m','hp_pot_l','dragon_scale'],
    A:['void_blade','dragon_armor','guardian_plate','chaos_pendant','hp_pot_l','dragon_scale'],
    S:['void_blade','dragon_armor','void_earring','chaos_pendant','hp_pot_l','void_crystal'],
  },
  rogue:{
    E:['copper_earring','leather_boots','leather_armor','hp_pot_s','monster_gem'],
    D:['swift_earring','swift_boots','leather_belt','hp_pot_s','hp_pot_m','monster_gem'],
    C:['swift_earring','swift_boots','shadow_boots','hp_pot_m','dragon_scale'],
    B:['shadow_boots','shadow_edge','swift_earring','hp_pot_m','hp_pot_l','dragon_scale'],
    A:['shadow_boots','void_earring','shadow_edge','hp_pot_l','dragon_scale'],
    S:['void_earring','void_blade','shadow_boots','chaos_pendant','hp_pot_l','void_crystal'],
  },
  mage:{
    E:['mage_hat','wisdom_pendant','mp_pot_s','monster_gem'],
    D:['mage_hat','wisdom_pendant','arcane_cuff','mp_pot_s','mp_pot_m'],
    C:['mage_hat','void_crown','arcane_cuff','mp_pot_m','dragon_scale'],
    B:['void_crown','arcane_cuff','wisdom_pendant','mp_pot_m','void_crystal'],
    A:['void_crown','arcane_cuff','chaos_pendant','mp_pot_m','void_crystal'],
    S:['void_crown','arcane_cuff','chaos_pendant','void_crystal'],
  },
};
const DUNGEON_DROP_CHANCE = {E:0.40,D:0.50,C:0.60,B:0.70,A:0.80,S:0.90};

let dungeonTimer = null;
let combatTimer  = null;
let selectedDungeonRank = 'E';
let selectedDungeonId   = null;

function getPlayerDPS() {
  const st = state.stats, eq = getEquippedStats();
  const physDmg  = 5 + st.STR * 1.8 + st.DEX * 0.8 + (eq.ATK || 0) * 0.6;
  const magicDmg = 3 + st.INT * 1.2 + st.VOL * 0.6;
  const atkInterval = Math.max(2, 4 - st.DEX * 0.02);
  return Math.max(1, Math.round((physDmg + magicDmg * 0.5) / atkInterval * 10) / 10);
}

function defeatIdleEnemy(d, cfg) {
  const old = cfg.enemies[(d.idleEnemyIndex || 0) % cfg.enemies.length];
  d.defeatedEnemies.push(old.name);
  d.idleTotalKills = (d.idleTotalKills || 0) + 1;
  d.idleEnemyIndex = (d.idleEnemyIndex || 0) + 1;
  const next = cfg.enemies[d.idleEnemyIndex % cfg.enemies.length];
  const scale = 1 + Math.floor(d.idleTotalKills / 20) * 0.15;
  d.idleEnemyMaxHP = Math.round(next.hp * scale);
  d.idleEnemyHP    = d.idleEnemyMaxHP;
}

// ============================================================
// ACHIEVEMENTS (LOGROS)
// ============================================================
// Achievement reward design: ALL rewards use statAll:true — every tier's reward is added to
// ALL 6 stats equally. Sum of all reward values across every tier = 700, so each stat gains
// exactly 700 points from achievements (700 × 6 × 10 = 42,000 XP total).
//
// Budget: daily(324) + weekly(110) + ranks(32) + classes(19) +
//   stat_mastery(90) + balance(11) + streak(21) + perf_week(40) +
//   perf_day(13) + phoenix(19) + avoid(21) = 700
const ACHIEVEMENTS = [
  // ── PROGRESIÓN — 12 hábitos diarios  (each: 1/2/4/7/13 = 27 × 12 = 324) ──
  { id:'wake7am',    name:'Early Riser',      icon:'🌅', category:'progresion', desc:'Wake up at 7am',                              textMatch:'7am',           stat:'CON', statAll:true,
    tiers:[{count:10,label:'The Sleeper Defeated',reward:1,title:null},{count:30,label:'Dawn Guardian',reward:2,title:null},{count:100,label:'Dawn Hunter',reward:4,title:'Dawn Hunter'},{count:200,label:'Lord of Time',reward:7,title:'Lord of Time'},{count:365,label:'ASCENDED',reward:13,title:'ASCENDED'}]},
  { id:'hydration',  name:'Hydrated',         icon:'💧', category:'progresion', desc:'Drink 2L of water',                           textMatch:'agua',          stat:'CON', statAll:true,
    tiers:[{count:10,label:'Steady',reward:1,title:null},{count:30,label:'Steady Flow',reward:2,title:null},{count:100,label:'Fountain of Life',reward:4,title:'Fountain of Life'},{count:200,label:'Pure Torrent',reward:7,title:'Pure Torrent'},{count:365,label:'INNER SEA',reward:13,title:'INNER SEA'}]},
  { id:'walk',       name:'Walker',           icon:'🚶', category:'progresion', desc:'Walk to the park',                            textMatch:'parque',        stat:'DEX', statAll:true,
    tiers:[{count:10,label:'Stroller',reward:1,title:null},{count:30,label:'Explorer',reward:2,title:null},{count:100,label:'Ranger',reward:4,title:'Ranger'},{count:200,label:'Dawn Nomad',reward:7,title:'Dawn Nomad'},{count:365,label:'LORD OF THE PATH',reward:13,title:'LORD OF THE PATH'}]},
  { id:'meditation', name:'Calm Mind',        icon:'🧘', category:'progresion', desc:'Meditation (10 min)',                         textMatch:'meditac',       stat:'VOL', statAll:true,
    tiers:[{count:10,label:'Zen Apprentice',reward:1,title:null},{count:30,label:'Meditator',reward:2,title:null},{count:100,label:'Crystal Mind',reward:4,title:'Crystal Mind'},{count:200,label:'Contemplative',reward:7,title:'Contemplative'},{count:365,label:'SACRED VOID',reward:13,title:'SACRED VOID'}]},
  { id:'training',   name:'Warrior',          icon:'💪', category:'progresion', desc:'Physical training',                           textMatch:'entrenamiento', stat:'STR', statAll:true,
    tiers:[{count:10,label:'Novice',reward:1,title:null},{count:30,label:'Soldier',reward:2,title:null},{count:100,label:'Iron Veteran',reward:4,title:'Iron Veteran'},{count:200,label:'Champion',reward:7,title:'Champion'},{count:365,label:'LIVING LEGEND',reward:13,title:'LIVING LEGEND'}]},
  { id:'journal',    name:'Strategist',       icon:'📝', category:'progresion', desc:'Log wins of the day and task #1 for tomorrow', textMatch:'logros del',   stat:'INT', statAll:true,
    tiers:[{count:10,label:'Note Taker',reward:1,title:null},{count:30,label:'Planner',reward:2,title:null},{count:100,label:'Strategist',reward:4,title:'Strategist'},{count:200,label:'Visionary',reward:7,title:'Visionary'},{count:365,label:'MASTER OF TIME',reward:13,title:'MASTER OF TIME'}]},
  { id:'gratitude',  name:'Grateful',         icon:'🙏', category:'progresion', desc:'Write 3 things you are grateful for',         textMatch:'agradecido',    stat:'CHA', statAll:true,
    tiers:[{count:10,label:'Mindful',reward:1,title:null},{count:30,label:'Generous',reward:2,title:null},{count:100,label:'Open Heart',reward:4,title:'Open Heart'},{count:200,label:'Light of the Group',reward:7,title:'Light of the Group'},{count:365,label:'PURE SOUL',reward:13,title:'PURE SOUL'}]},
  { id:'dishes',     name:'Order',            icon:'🍽️', category:'progresion', desc:'Wash dishes',                                 textMatch:'platos',        stat:'VOL', statAll:true,
    tiers:[{count:10,label:'The Washer',reward:1,title:null},{count:30,label:'Disciplined',reward:2,title:null},{count:100,label:'Master of Order',reward:4,title:'Master of Order'},{count:200,label:'Home Guardian',reward:7,title:'Home Guardian'},{count:365,label:'DOMESTIC MONK',reward:13,title:'DOMESTIC MONK'}]},
  { id:'bed',        name:'Solid Foundation', icon:'🛏️', category:'progresion', desc:'Make your bed',                               textMatch:'cama',          stat:'CHA', statAll:true,
    tiers:[{count:10,label:'The Methodical',reward:1,title:null},{count:30,label:'The Consistent',reward:2,title:null},{count:100,label:'Home Artisan',reward:4,title:'Home Artisan'},{count:200,label:'Day Architect',reward:7,title:'Day Architect'},{count:365,label:'RITUAL FORGER',reward:13,title:'RITUAL FORGER'}]},
  { id:'reading',    name:'Bibliophile',      icon:'📖', category:'progresion', desc:'Read',                                        textMatch:'leer',          stat:'INT', statAll:true,
    tiers:[{count:10,label:'Curious',reward:1,title:null},{count:30,label:'Studious',reward:2,title:null},{count:100,label:'Scholar',reward:4,title:'Scholar'},{count:200,label:'Sage',reward:7,title:'Sage'},{count:365,label:'MASTER OF KNOWLEDGE',reward:13,title:'MASTER OF KNOWLEDGE'}]},
  { id:'stretching', name:'Agile',            icon:'🤸', category:'progresion', desc:'Stretching',                                  textMatch:'estiramiento',  stat:'DEX', statAll:true,
    tiers:[{count:10,label:'Stiffness Overcome',reward:1,title:null},{count:30,label:'Flexible',reward:2,title:null},{count:100,label:'Agile',reward:4,title:'Agile'},{count:200,label:'Acrobat',reward:7,title:'Acrobat'},{count:365,label:'SPIRIT OF THE WIND',reward:13,title:'SPIRIT OF THE WIND'}]},
  { id:'phone',      name:'Focused',          icon:'📵', category:'progresion', desc:'Mindful phone use',                           textMatch:'celular',       stat:'VOL', statAll:true,
    tiers:[{count:10,label:'Mindful',reward:1,title:null},{count:30,label:'Unplugged',reward:2,title:null},{count:100,label:'Free Mind',reward:4,title:'Free Mind'},{count:200,label:'Unchained',reward:7,title:'Unchained'},{count:365,label:'DIGITAL SOVEREIGN',reward:13,title:'DIGITAL SOVEREIGN'}]},

  // ── PROGRESIÓN — 5 hábitos semanales  (each: 1/2/3/5/11 = 22 × 5 = 110) ──
  { id:'weekly_futbol',   name:'Football',      icon:'⚽', category:'progresion', desc:'Play football',            weeklyId:'w0', stat:'STR', statAll:true,
    tiers:[{count:1,label:'First Match',reward:1,title:null},{count:3,label:'Regular',reward:2,title:null},{count:10,label:'Seasoned Player',reward:3,title:'Seasoned Player'},{count:25,label:'Field General',reward:5,title:'Field General'},{count:50,label:'LIVING BALL',reward:11,title:'LIVING BALL'}]},
  { id:'weekly_padel',    name:'Padel',         icon:'🎾', category:'progresion', desc:'Play padel',               weeklyId:'w1', stat:'DEX', statAll:true,
    tiers:[{count:1,label:'First Rally',reward:1,title:null},{count:3,label:'Regular',reward:2,title:null},{count:10,label:'Court Regular',reward:3,title:'Court Regular'},{count:25,label:'Net Master',reward:5,title:'Net Master'},{count:50,label:'PADEL KING',reward:11,title:'PADEL KING'}]},
  { id:'weekly_cleaning', name:'Home Guardian', icon:'🧹', category:'progresion', desc:'Deep clean the house',     weeklyId:'w2', stat:'VOL', statAll:true,
    tiers:[{count:1,label:'Swept',reward:1,title:null},{count:3,label:'Consistent',reward:2,title:null},{count:10,label:'Order Keeper',reward:3,title:'Order Keeper'},{count:25,label:'Sanctuary Builder',reward:5,title:'Sanctuary Builder'},{count:50,label:'DOMAIN SOVEREIGN',reward:11,title:'DOMAIN SOVEREIGN'}]},
  { id:'weekly_cooking',  name:'Chef',          icon:'🍳', category:'progresion', desc:'Cook a complex dish',      weeklyId:'w3', stat:'INT', statAll:true,
    tiers:[{count:1,label:'First Dish',reward:1,title:null},{count:3,label:'Home Cook',reward:2,title:null},{count:10,label:'Culinary Student',reward:3,title:'Culinary Student'},{count:25,label:'Master Chef',reward:5,title:'Master Chef'},{count:50,label:'GASTRONOMIC LEGEND',reward:11,title:'GASTRONOMIC LEGEND'}]},
  { id:'weekly_grooming', name:'Polished',      icon:'💈', category:'progresion', desc:'Deep grooming session',    weeklyId:'w4', stat:'CHA', statAll:true,
    tiers:[{count:1,label:'First Polish',reward:1,title:null},{count:3,label:'Presentable',reward:2,title:null},{count:10,label:'Sharp',reward:3,title:'Sharp'},{count:25,label:'Immaculate',reward:5,title:'Immaculate'},{count:50,label:'SOVEREIGN IMAGE',reward:11,title:'SOVEREIGN IMAGE'}]},

  // ── HITOS DE RANGO  (1+1+2+3+4+5+7+9 = 32) ─────────────────
  { id:'rank_e',   name:'Rank E',   icon:'🟢', category:'hitos', desc:'Reach Rank E',   rankMinLevel:1,  statAll:true, tiers:[{count:1,label:'The Journey Begins',  reward:1, title:null}]},
  { id:'rank_d',   name:'Rank D',   icon:'🔵', category:'hitos', desc:'Reach Rank D',   rankMinLevel:11, statAll:true, tiers:[{count:1,label:'Growing Stronger',    reward:1, title:null}]},
  { id:'rank_c',   name:'Rank C',   icon:'🟣', category:'hitos', desc:'Reach Rank C',   rankMinLevel:21, statAll:true, tiers:[{count:1,label:'Above Average',       reward:2, title:null}]},
  { id:'rank_b',   name:'Rank B',   icon:'🟡', category:'hitos', desc:'Reach Rank B',   rankMinLevel:36, statAll:true, tiers:[{count:1,label:'Elite Territory',      reward:3, title:null}]},
  { id:'rank_a',   name:'Rank A',   icon:'🟠', category:'hitos', desc:'Reach Rank A',   rankMinLevel:51, statAll:true, tiers:[{count:1,label:'Peak Human',          reward:4, title:'Peak Human'}]},
  { id:'rank_s',   name:'Rank S',   icon:'🔴', category:'hitos', desc:'Reach Rank S',   rankMinLevel:70, statAll:true, tiers:[{count:1,label:'National Hunter',     reward:5, title:'National Hunter'}]},
  { id:'rank_ss',  name:'Rank SS',  icon:'💜', category:'hitos', desc:'Reach Rank SS',  rankMinLevel:85, statAll:true, tiers:[{count:1,label:'Legendary Hunter',    reward:7, title:'Legendary Hunter'}]},
  { id:'rank_sss', name:'Rank SSS', icon:'👑', category:'hitos', desc:'Reach Rank SSS', rankMinLevel:95, statAll:true, tiers:[{count:1,label:'MONARCH',             reward:9, title:'MONARCH'}]},

  // ── HITOS DE MAESTRÍA DE CLASE  (1+2+3+5+8 = 19) ───────────
  { id:'class_tier_1', name:'NOVICE Mastered',   icon:'🎖️', category:'hitos', desc:'Complete mastery of a NOVICE class',   classTierMastery:1, statAll:true, tiers:[{count:1,label:'Class Forged',   reward:1, title:null}]},
  { id:'class_tier_2', name:'ADEPT Mastered',    icon:'⚔️', category:'hitos', desc:'Complete mastery of an ADEPT class',  classTierMastery:2, statAll:true, tiers:[{count:1,label:'Adept Forged',   reward:2, title:null}]},
  { id:'class_tier_3', name:'EXPERT Mastered',   icon:'🗡️', category:'hitos', desc:'Complete mastery of an EXPERT class', classTierMastery:3, statAll:true, tiers:[{count:1,label:'Expert Crowned', reward:3, title:null}]},
  { id:'class_tier_4', name:'LEGEND Mastered',   icon:'🏅', category:'hitos', desc:'Complete mastery of a LEGEND class',  classTierMastery:4, statAll:true, tiers:[{count:1,label:'Legend Born',    reward:5, title:'Legend Born'}]},
  { id:'class_tier_5', name:'TRUE HERO Mastered',icon:'⭐', category:'hitos', desc:'Complete mastery of the TRUE HERO',   classTierMastery:5, statAll:true, tiers:[{count:1,label:'BEYOND LIMITS',  reward:8, title:'BEYOND LIMITS'}]},

  // ── MAESTRÍA DE STAT  (each: 1/2/3/4/5 = 15 × 6 = 90) ──────
  { id:'stat_STR', name:'Strength Mastery',     icon:'⚔',  category:'maestria', desc:'Accumulate STR points', stat:'STR', statAll:true,
    tiers:[{count:100,label:'Iron Fists',reward:1,title:null},{count:300,label:'Berserker',reward:2,title:null},{count:500,label:'Titan',reward:3,title:'Titan'},{count:1000,label:'Warlord',reward:4,title:'Warlord'},{count:2000,label:'GOD OF WAR',reward:5,title:'GOD OF WAR'}]},
  { id:'stat_DEX', name:'Dexterity Mastery',    icon:'🌿', category:'maestria', desc:'Accumulate DEX points', stat:'DEX', statAll:true,
    tiers:[{count:100,label:'Swift',reward:1,title:null},{count:300,label:'Ranger',reward:2,title:null},{count:500,label:'Shadow',reward:3,title:'Shadow'},{count:1000,label:'Phantom',reward:4,title:'Phantom'},{count:2000,label:'WIND INCARNATE',reward:5,title:'WIND INCARNATE'}]},
  { id:'stat_CON', name:'Constitution Mastery', icon:'🛡', category:'maestria', desc:'Accumulate CON points', stat:'CON', statAll:true,
    tiers:[{count:100,label:'Resilient',reward:1,title:null},{count:300,label:'Fortified',reward:2,title:null},{count:500,label:'Unbreakable',reward:3,title:'Unbreakable'},{count:1000,label:'Iron Wall',reward:4,title:'Iron Wall'},{count:2000,label:'IMMORTAL BODY',reward:5,title:'IMMORTAL BODY'}]},
  { id:'stat_INT', name:'Intelligence Mastery', icon:'📚', category:'maestria', desc:'Accumulate INT points', stat:'INT', statAll:true,
    tiers:[{count:100,label:'Sharp',reward:1,title:null},{count:300,label:'Scholar',reward:2,title:null},{count:500,label:'Sage',reward:3,title:'Sage'},{count:1000,label:'Archmage',reward:4,title:'Archmage'},{count:2000,label:'OMNISCIENT',reward:5,title:'OMNISCIENT'}]},
  { id:'stat_VOL', name:'Volition Mastery',     icon:'🔥', category:'maestria', desc:'Accumulate VOL points', stat:'VOL', statAll:true,
    tiers:[{count:100,label:'Focused',reward:1,title:null},{count:300,label:'Disciplined',reward:2,title:null},{count:500,label:'Iron Will',reward:3,title:'Iron Will'},{count:1000,label:'Transcendent',reward:4,title:'Transcendent'},{count:2000,label:'ABSOLUTE WILL',reward:5,title:'ABSOLUTE WILL'}]},
  { id:'stat_CHA', name:'Charisma Mastery',     icon:'✨', category:'maestria', desc:'Accumulate CHA points', stat:'CHA', statAll:true,
    tiers:[{count:100,label:'Likeable',reward:1,title:null},{count:300,label:'Magnetic',reward:2,title:null},{count:500,label:'Inspiring',reward:3,title:'Inspiring'},{count:1000,label:'Commander',reward:4,title:'Commander'},{count:2000,label:'SOVEREIGN AURA',reward:5,title:'SOVEREIGN AURA'}]},

  // ── EQUILIBRIO  (1+3+7 = 11) ────────────────────────────────
  { id:'balance_100',  name:'Well-Rounded',   icon:'⚖️', category:'maestria', desc:'All stats above 100',  balanceThreshold:100,  statAll:true, tiers:[{count:1,label:'Balanced Fighter',  reward:1, title:null}]},
  { id:'balance_500',  name:'Balanced Elite', icon:'🌟', category:'maestria', desc:'All stats above 500',  balanceThreshold:500,  statAll:true, tiers:[{count:1,label:'True Generalist',   reward:3, title:'True Generalist'}]},
  { id:'balance_2000', name:'True Sovereign', icon:'💫', category:'maestria', desc:'All stats above 2000', balanceThreshold:2000, statAll:true, tiers:[{count:1,label:'SOVEREIGN BALANCE', reward:7, title:'SOVEREIGN BALANCE'}]},

  // ── RACHA  (1+2+4+6+8 = 21) ─────────────────────────────────
  { id:'streak_gen', name:'On Fire', icon:'🔥', category:'racha', desc:'Consecutive days with ≥70% habits complete', statAll:true,
    tiers:[{count:3,label:'Ignited',reward:1,title:null},{count:7,label:'Iron Week',reward:2,title:null},{count:14,label:'Unstoppable Fortnight',reward:4,title:null},{count:30,label:'Unbreakable Month',reward:6,title:'Unbreakable Month'},{count:100,label:'CENTURION',reward:8,title:'CENTURION'}]},

  // ── CONSISTENCIA  perf_week: 2+5+8+10+15=40 / perf_day: 1+1+2+4+5=13 ──
  { id:'perf_week', name:'Perfect Week', icon:'⭐', category:'consistencia', desc:'7 consecutive days at 100% of habits', statAll:true,
    tiers:[{count:1,label:'First Perfection',reward:2,title:null},{count:3,label:'Triple Crown',reward:5,title:null},{count:5,label:'Weekly Elite',reward:8,title:'Weekly Elite'},{count:10,label:'Weekly Master',reward:10,title:'Weekly Master'},{count:20,label:'PERPETUAL PERFECTION',reward:15,title:'PERPETUAL PERFECTION'}]},
  { id:'perf_day', name:'Flawless', icon:'💯', category:'consistencia', desc:'Complete 100% of daily habits in a day', statAll:true,
    tiers:[{count:1,label:'First Flawless',reward:1,title:null},{count:10,label:'Disciplined',reward:1,title:null},{count:30,label:'Iron Routine',reward:2,title:null},{count:100,label:'Flawless Machine',reward:4,title:'Flawless Machine'},{count:365,label:'ASCENDED DISCIPLINE',reward:5,title:'ASCENDED DISCIPLINE'}]},

  // ── RESILIENCIA  phoenix: 1+2+4+5+7=19 / avoid: 1+2+4+6+8=21 ──
  { id:'phoenix', name:'Phoenix', icon:'🦅', category:'resiliencia', desc:'100% day after a 0% day', statAll:true,
    tiers:[{count:1,label:'Risen',reward:1,title:null},{count:3,label:'Fire Bird',reward:2,title:null},{count:5,label:'Indestructible',reward:4,title:'Indestructible'},{count:10,label:'No Surrender',reward:5,title:'No Surrender'},{count:20,label:'ETERNAL PHOENIX',reward:7,title:'ETERNAL PHOENIX'}]},
  { id:'avoid_clean', name:'Iron Will', icon:'🛡️', category:'resiliencia', desc:'Consecutive days clean from addiction', stat:'VOL', statAll:true,
    tiers:[{count:7,label:'First Week',reward:1,title:null},{count:30,label:'Month of Clarity',reward:2,title:null},{count:90,label:'Iron Mind',reward:4,title:'Iron Mind'},{count:180,label:'Liberated',reward:6,title:'Liberated'},{count:365,label:'UNBREAKABLE',reward:8,title:'UNBREAKABLE'}]},
];

const TIER_LABELS  = ['🥉 BRONZE','🥈 SILVER','🥇 GOLD','💎 LEGENDARY','👑 UNIQUE'];
const TIER_ICONS   = ['🥉','🥈','🥇','💎','👑'];
const STAT_COLORS  = { STR:'#ff6b6b', DEX:'#40e0ff', CON:'#81c784', INT:'#7b9dff', VOL:'#e060f5', CHA:'#ffe57f' };

// Derive class colors from stat colors (blends for multi-stat; Legend/True Hero stay hardcoded)
(function() {
  const h2r = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  const r2h = (r,g,b) => '#'+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
  Object.values(CLASSES).forEach(cls => {
    if (cls.tier >= 4) return;
    const rgbs = cls.stats.map(s => h2r(STAT_COLORS[s]));
    const avg  = [0,1,2].map(i => rgbs.reduce((s,c)=>s+c[i],0) / rgbs.length);
    cls.color  = r2h(...avg);
  });
})();

function getAchievementCount(ach) {
  if (ach.id === 'streak_gen') return state.streak;
  if (ach.id === 'perf_week')  return state.logros.perfectWeekCount || 0;
  if (ach.id === 'phoenix')    return state.logros.phoenixCount || 0;
  if (ach.id === 'perf_day')   return state.logros.perfectDayCount || 0;
  if (ach.id === 'avoid_clean') {
    const neg = (state.negativos||[]).find(n => n.id === 'neg0');
    return neg ? getAvoidStreak(neg) : 0;
  }
  // Rank milestone (one-time: returns 1 if level >= threshold)
  if (ach.rankMinLevel !== undefined) {
    return calcLevel(state.totalXp).level >= ach.rankMinLevel ? 1 : 0;
  }
  // Class tier mastery (one-time: returns 1 if any class of that tier mastered)
  if (ach.classTierMastery !== undefined) {
    const ids = CLASSES_BY_TIER[ach.classTierMastery] || [];
    return ids.some(id => state.classData?.masteredClasses?.[id]) ? 1 : 0;
  }
  // Balance threshold (one-time: returns 1 if ALL stats >= threshold)
  if (ach.balanceThreshold !== undefined) {
    return STAT_KEYS.every(k => (state.stats[k]||0) >= ach.balanceThreshold) ? 1 : 0;
  }
  // Stat mastery (count = current stat total)
  if (ach.id.startsWith('stat_')) {
    const key = ach.id.split('_')[1];
    return state.stats[key] || 0;
  }
  // Weekly habit by id
  if (ach.weeklyId) {
    const w = (state.weekly||[]).find(x => x.id === ach.weeklyId);
    return w ? Object.keys(w.done || {}).length : 0;
  }
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
  if (tier.reward) {
    if (ach.statAll) {
      STAT_KEYS.forEach(k => { state.stats[k] = (state.stats[k]||0) + tier.reward; });
      const xpGain = tier.reward * STAT_KEYS.length * 10;
      state.totalXp += xpGain; state.col += xpGain;
    } else if (ach.statKeys && ach.statKeys.length > 0) {
      const share = Math.max(1, Math.round(tier.reward / ach.statKeys.length));
      ach.statKeys.forEach(k => { state.stats[k] = (state.stats[k]||0) + share; });
      const xpGain = share * ach.statKeys.length * 10;
      state.totalXp += xpGain; state.col += xpGain;
    } else if (ach.stat) {
      state.stats[ach.stat] = (state.stats[ach.stat]||0) + tier.reward;
      const xpGain = tier.reward * 10;
      state.totalXp += xpGain; state.col += xpGain;
    }
  }
  setTimeout(() => {
    playStatRankUp();
    showNotif(`${TIER_ICONS[tierIndex]||'🏆'} ACHIEVEMENT: ${ach.name} · ${tier.label}`);
  }, 1600);
}

function checkAchievements() {
  const today = todayKey();
  // ─ Perfect-day check (today 100%)
  const todayInf = getHabitPct(today);
  if (todayInf && todayInf.pct === 100 && todayInf.total > 0) {
    if (state.logros.lastPerfectDay !== today) {
      state.logros.perfectDayCount = (state.logros.perfectDayCount||0) + 1;
      state.logros.lastPerfectDay  = today;
    }
  }
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
  const yInf = getHabitPct(yKey);
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
  // ─ Avoid milestone rewards (XP + stat gains at streak thresholds)
  checkAvoidMilestones();
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

function grantItemDrop(dungeonId) {
  const cfg = DUNGEON_CONFIG[dungeonId]; if (!cfg) return;
  const table = (DUNGEON_DROP_TABLES[cfg.dungeonClass]||{})[cfg.rank]; if (!table) return;
  if (Math.random() >= (DUNGEON_DROP_CHANCE[cfg.rank]||0.4)) return;
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
    { key:'hitos',        label:'⟦ MILESTONES ⟧'    },
    { key:'maestria',     label:'⟦ MASTERY ⟧'       },
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

// ── Class passive & multiplier helpers (Paso 3) ──────────────

// Flat bonus added to a stat by: equipped class passive % + tier completion bonuses
function getClassPassiveBonus(statKey, st) {
  const base = (st.stats && st.stats[statKey]) || 0;
  if (!base) return 0;
  let pct = (st.classData && st.classData.tierPassiveBonus) || 0;
  const eqId = st.classData && st.classData.equipped;
  if (eqId) {
    const cls = CLASSES[eqId];
    if (cls && cls.stats.includes(statKey)) pct += cls.passive;
  }
  return Math.floor(base * pct);
}

// Effective stat value (used for display, HP/MP, dungeon calcs)
function getEffectiveStat(statKey, st) {
  return ((st.stats && st.stats[statKey]) || 0) + getClassPassiveBonus(statKey, st);
}

// Format a stat number: integer if whole, 1 decimal if fractional
function fmtStat(n) {
  if (typeof n !== 'number' || isNaN(n)) return String(n);
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

// Notification string for gains — highlights boosted stats with ↑ when class multiplier applied
function _gainsStr(applied, original) {
  return Object.entries(applied).map(([k,v]) => {
    const orig = (original||{})[k] || v;
    return v > orig ? `${k}+${fmtStat(v)}↑` : `${k}+${fmtStat(v)}`;
  }).join(' ');
}

// Apply gains with equipped class multiplier on matching stats.
// Returns the actually-applied gains object (stored in task.done for correct undo).
function applyGainsWithClass(gains) {
  const eqId = state.classData && state.classData.equipped;
  const cls   = eqId ? CLASSES[eqId] : null;
  const applied = {};
  Object.entries(gains || {}).forEach(([k, v]) => {
    const amt = (cls && cls.stats.includes(k))
      ? parseFloat((v * (1 + cls.multiplier)).toFixed(1))
      : v;
    applied[k] = amt;
    state.stats[k] = parseFloat((Math.max(0, (state.stats[k] || 0) + amt)).toFixed(1));
  });
  return applied;
}

// Returns display-only preview of gains with class bonus breakdown.
// Does NOT modify state. Used to preview chips on pending habits.
// Returns { stat: { base, bonus, total, isBoosted, clsColor } }
function previewGainsWithClass(gains) {
  const eqId = state.classData && state.classData.equipped;
  const cls  = eqId ? CLASSES[eqId] : null;
  const result = {};
  Object.entries(gains || {}).forEach(([k, v]) => {
    if (cls && cls.stats.includes(k) && cls.multiplier > 0) {
      const bonus = parseFloat((v * cls.multiplier).toFixed(1));
      const total = parseFloat((v + bonus).toFixed(1));
      result[k] = { base: v, bonus, total, isBoosted: true, clsColor: cls.color || '#ffd700' };
    } else {
      result[k] = { base: v, bonus: 0, total: v, isBoosted: false };
    }
  });
  return result;
}

function calcLevel(totalXp) {
  let level = 1;
  while (level < MAX_LEVEL && totalXp >= (LEVEL_XP_TABLE[level+1]||Infinity)) level++;
  return { level, currentLevelXp: totalXp - (LEVEL_XP_TABLE[level]||0), neededForNext: xpForLevel(level) };
}
function calcHpPct() { const t=state.habitos.length; if(!t) return 100; const done=state.habitos.filter(h=>h.done[todayKey()]).length; return Math.round(60+(done/t)*40); }
function calcMpPct() { const week=isoWeekKey(); const t=state.weekly.length; if(!t) return 100; const done=state.weekly.filter(w=>w.done[week]).length; return Math.round((done/t)*100); }

function calcMaxHP() {
  const lv=calcLevel(state.totalXp), eq=getEquippedStats();
  return 100 + (getEffectiveStat('CON',state)+(eq.CON||0))*3 + (getEffectiveStat('CHA',state)+(eq.CHA||0))*2 + lv.level*10 + (eq.HP||0);
}
function calcMaxMP() {
  const lv=calcLevel(state.totalXp), eq=getEquippedStats();
  return 50 + (getEffectiveStat('INT',state)+(eq.INT||0))*2 + (getEffectiveStat('VOL',state)+(eq.VOL||0))*2 + (getEffectiveStat('CHA',state)+(eq.CHA||0)) + lv.level*3 + (eq.MP||0);
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
    // Queue harvest overlay — shown after renderAll()
    const harvestInfo = _buildHarvestInfo(y);
    if (harvestInfo.done > 0) _pendingAnims.push(() => showHarvestOverlay(harvestInfo));
    // Auto weekly report on Mondays (queued after harvest so it shows on dismiss)
    if (new Date().getDay() === 1 && state.lastWeeklyReport !== today) {
      state.lastWeeklyReport = today;
      _pendingAnims.push(() => showWeeklyReport());
    }
    state.lastActiveDay=today; saveState();
  }
}

// ============================================================
// MASTERY SYSTEM  (Pasos 7 + 8 + 9 + 10)
// ============================================================

// Animations queued during load (before first render) — shown after renderAll()
const _pendingAnims = [];

function _buildHarvestInfo(dateKey) {
  const gains = {}; STAT_KEYS.forEach(k => gains[k] = 0);
  let xp = 0, done = 0;
  state.habitos.forEach(h => {
    const c = getCompletion(h, dateKey);
    if (c) { done++; xp += c.xp || 0; STAT_KEYS.forEach(k => { gains[k] += (c.gains||{})[k]||0; }); }
  });
  return { gains, xp, done, total: state.habitos.length, dateKey };
}

function showHarvestOverlay(info) {
  if (soundEnabled) playDailyComplete();
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const [y,m,d] = info.dateKey.split('-');
  const dateStr = `${months[parseInt(m)-1]} ${d}, ${y}`;
  const gainRows = STAT_KEYS
    .filter(k => info.gains[k] > 0)
    .map(k => `<div class="harvest-stat-row"><span class="harvest-stat-key">${k}</span><span class="harvest-stat-val">+${info.gains[k]}</span></div>`)
    .join('');
  const ov = document.createElement('div');
  ov.className = 'harvest-overlay';
  ov.innerHTML = `
    <div class="harvest-badge">⟦ HARVEST OF YESTERDAY ⟧</div>
    <div class="harvest-date">${dateStr}</div>
    <div class="harvest-quests">${info.done} / ${info.total} QUESTS COMPLETED</div>
    ${info.xp > 0 ? `<div class="harvest-xp">+${info.xp} EXP GAINED</div>` : ''}
    ${gainRows ? `<div class="harvest-gains">${gainRows}</div>` : '<div class="harvest-no-gains">No stat gains recorded</div>'}
    <button class="harvest-dismiss-btn" onclick="const ov=this.closest('.harvest-overlay');ov.style.animation='masteryFadeOut 0.4s ease forwards';setTimeout(()=>{ov.remove();const next=_pendingAnims.shift();if(next)next();},400)">⟦ CONTINUE ⟧</button>
  `;
  document.body.appendChild(ov);
  setTimeout(() => {
    if (ov.isConnected) {
      ov.style.animation = 'masteryFadeOut 0.4s ease forwards';
      setTimeout(() => ov.remove(), 400);
    }
  }, 12000);
}

function tickMasteryOnLoad() {
  const today = todayKey();
  if (state.classData.lastMasteryTick === today) return; // already ticked today
  state.classData.lastMasteryTick = today;

  const classId = state.classData.equipped;
  if (!classId) { saveState(); return; }

  const cls = CLASSES[classId];
  if (!cls || state.classData.masteredClasses[classId]) { saveState(); return; }

  state.classData.mastery[classId] = (state.classData.mastery[classId] || 0) + 1;

  if (state.classData.mastery[classId] >= cls.masteryDays) {
    applyMasteryReward(classId);
  }
  saveState();
}

function applyMasteryReward(classId) {
  if (state.classData.masteredClasses[classId]) return;
  const cls    = CLASSES[classId];
  const reward = CLASS_MASTERY_REWARD[cls.tier];
  cls.stats.forEach(s => { state.stats[s] = (state.stats[s] || 0) + reward; });
  state.classData.masteredClasses[classId] = true;

  _pendingAnims.push(() => showMasteryOverlay(classId, reward));

  checkTierComplete(cls.tier);
}

function checkTierComplete(tier) {
  if (state.classData.completedTiers[tier]) return;
  const allMastered = CLASSES_BY_TIER[tier].every(id => state.classData.masteredClasses[id]);
  if (!allMastered) return;

  const reward = TIER_COMPLETE_REWARD[tier];
  state.classData.tierPassiveBonus = +(state.classData.tierPassiveBonus + reward.passiveAll).toFixed(4);
  state.classData.completedTiers[tier] = true;
  if (!state.classData.unlockedSkills.includes(reward.skill))
    state.classData.unlockedSkills.push(reward.skill);

  if (tier === 4) {
    _pendingAnims.push(() => showTierCompleteOverlay(tier));
    // Queue TRUE HERO reveal after the tier-complete overlay
    _pendingAnims.push(() => setTimeout(() => showTrueHeroReveal(), 200));
  } else {
    _pendingAnims.push(() => showTierCompleteOverlay(tier));
  }
}

// ── Mastery Overlay ──────────────────────────────────────────
function showMasteryOverlay(classId, reward) {
  const cls  = CLASSES[classId];
  const tier = TIER_NAMES[cls.tier] || '';
  playMastery();

  const ov = document.createElement('div');
  ov.className = 'mastery-overlay';
  ov.style.setProperty('--mc', cls.color);
  ov.innerHTML = `
    <div class="mastery-badge">⟦ CLASS MASTERY ⟧</div>
    <div class="mastery-class-name">${cls.name}</div>
    <div class="mastery-tier-label">${tier}</div>
    <div class="mastery-reward-box">
      <div class="mastery-reward-title">PERMANENT REWARD</div>
      ${cls.stats.map(s=>`<div class="mastery-reward-line">${STAT_NAMES[s]} <span class="mastery-reward-val">+${reward}</span></div>`).join('')}
    </div>
    <div class="mastery-dismiss">tap to continue</div>`;

  document.body.appendChild(ov);
  const _masteryDismiss = () => {
    ov.style.animation = 'masteryFadeOut 0.4s ease forwards';
    setTimeout(() => { ov.remove(); renderAll(); checkAndShowClassUnlocks(400); }, 400);
  };
  ov.addEventListener('click', _masteryDismiss);
  // Auto-dismiss after 8s
  setTimeout(() => { if (ov.isConnected) _masteryDismiss(); }, 8000);
}

// ── Tier Complete Overlay ────────────────────────────────────
function showTierCompleteOverlay(tier) {
  const reward   = TIER_COMPLETE_REWARD[tier];
  const tierName = TIER_NAMES[tier];
  const tierColors= { 1:'#66bb6a', 2:'#42a5f5', 3:'#ffa726', 4:'#ffd700', 5:'#ffffff' };
  const color    = tierColors[tier] || '#ffd700';
  playTierComplete();

  const ov = document.createElement('div');
  ov.className = 'mastery-overlay tier-complete-overlay';
  ov.style.setProperty('--mc', color);
  ov.innerHTML = `
    <div class="mastery-badge" style="color:${color}">⟦ TIER COMPLETE ⟧</div>
    <div class="mastery-class-name" style="font-size:22px;letter-spacing:5px">${tierName}</div>
    <div class="mastery-tier-label">ALL CLASSES MASTERED</div>
    <div class="mastery-reward-box">
      <div class="mastery-reward-title">PERMANENT BONUS</div>
      <div class="mastery-reward-line">All Stats <span class="mastery-reward-val">+${Math.round(reward.passiveAll*100)}% passive</span></div>
      <div class="mastery-reward-line" style="color:var(--sao-gold-soft);margin-top:6px">Skill unlocked: ${reward.skill.replace(/_/g,' ').toUpperCase()}</div>
    </div>
    <div class="mastery-dismiss">tap to continue</div>`;

  document.body.appendChild(ov);
  ov.addEventListener('click', () => {
    ov.style.animation = 'masteryFadeOut 0.4s ease forwards';
    setTimeout(() => { ov.remove(); renderAll(); }, 400);
  });
  setTimeout(() => { if (ov.isConnected) { ov.style.animation='masteryFadeOut 0.4s ease forwards'; setTimeout(()=>{ ov.remove(); renderAll(); },400); } }, 10000);
}

// ── TRUE HERO Reveal ─────────────────────────────────────────
function showTrueHeroReveal() {
  playTierComplete();
  setTimeout(() => playMastery(), 1800);

  const ov = document.createElement('div');
  ov.className = 'mastery-overlay true-hero-overlay';
  ov.innerHTML = `
    <div class="th-stars" id="thStars"></div>
    <div class="mastery-badge" style="color:#aaa;letter-spacing:6px">⟦ BEYOND LEGEND ⟧</div>
    <div class="th-question-wrap">
      <div class="th-question" id="thQuestion">???</div>
      <div class="th-reveal" id="thReveal">TRUE HERO</div>
    </div>
    <div class="mastery-tier-label" style="color:rgba(255,255,255,0.5);margin-top:8px">A class beyond all limits has awakened</div>
    <div class="mastery-reward-box" style="border-color:rgba(255,255,255,0.2)">
      <div class="mastery-reward-title" style="color:#fff">All Stats · +20% passive · ×1.20 gains</div>
      <div class="mastery-reward-line" style="color:rgba(255,255,255,0.6);margin-top:4px">90 days to master</div>
    </div>
    <div class="mastery-dismiss" style="color:rgba(255,255,255,0.3)">tap to continue</div>`;

  document.body.appendChild(ov);

  // Animate: ??? fades out → TRUE HERO fades in
  setTimeout(() => {
    const q = document.getElementById('thQuestion');
    const r = document.getElementById('thReveal');
    if (q) q.style.animation = 'masteryFadeOut 0.6s ease forwards';
    setTimeout(() => { if (r) r.style.animation = 'thRevealIn 1.2s ease forwards'; }, 600);
  }, 1200);

  ov.addEventListener('click', () => {
    ov.style.animation = 'masteryFadeOut 0.4s ease forwards';
    setTimeout(() => { ov.remove(); renderAll(); }, 400);
  });
  setTimeout(() => { if (ov.isConnected) { ov.style.animation='masteryFadeOut 0.4s ease forwards'; setTimeout(()=>{ ov.remove(); renderAll(); },400); } }, 14000);
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
  const xpPctHdr = lv.neededForNext > 0 ? Math.round((lv.currentLevelXp/lv.neededForNext)*100) : 100;
  xpText.textContent=`${lv.currentLevelXp}/${lv.neededForNext} · ${xpPctHdr}%`;
  xpFill.style.width=`${xpPctHdr}%`;
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
  const eqCls = (() => { const id=state.classData&&state.classData.equipped; return id?CLASSES[id]:null; })();
  // Class synergy — habit grants at least one stat the equipped class boosts
  const isSynergy = !opts.isWeekly && eqCls && Object.keys(task.gains||{}).some(k => eqCls.stats.includes(k));
  if (isSynergy) {
    el.classList.add('cls-synergy');
    el.style.setProperty('--cls-color', eqCls.color);
    el.style.setProperty('--cls-glow',  eqCls.color + '28'); // ~16% opacity
    el.style.setProperty('--cls-tint',  eqCls.color + '14'); // ~8% opacity
  }
  if (done && completion) {
    // Done: show actual applied gains; mark class-boosted stats with ✦
    Object.entries(completion.gains||{}).forEach(([stat,val]) => {
      const isBoosted = eqCls && eqCls.stats.includes(stat);
      const chip=document.createElement('span');
      chip.className=`gain-chip gain-${stat}${isBoosted?' cls-boosted':''}`;
      chip.textContent=`${stat}+${fmtStat(val)}${isBoosted?'✦':''}`;
      if (isBoosted) chip.title=`Clase ${eqCls.name}: ×${(1+eqCls.multiplier).toFixed(2)}`;
      gains.appendChild(chip);
    });
  } else {
    // Pending: preview with class bonus breakdown
    const preview = previewGainsWithClass(task.gains);
    Object.entries(preview).forEach(([stat, info]) => {
      const chip=document.createElement('span');
      chip.className=`gain-chip gain-${stat}`;
      chip.textContent=`${stat}+${info.total}`;
      gains.appendChild(chip);
      if (info.isBoosted) {
        const bChip=document.createElement('span');
        bChip.className='gain-chip-bonus';
        bChip.style.color=info.clsColor;
        bChip.style.borderColor=info.clsColor;
        bChip.style.background=`${info.clsColor}18`;
        bChip.textContent=`✦+${info.bonus}`;
        bChip.title=`Class bonus: +${info.bonus} de ${eqCls.name}`;
        gains.appendChild(bChip);
      }
    });
  }

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
    else if(!done){ el.classList.add('quest-completing'); setTimeout(()=>toggleQuest(opts.listKey,opts.periodKey,task.id),250); }
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
      const gl=document.createElement('div'); gl.className='tier-gains-line'; gl.style.color='var(--sao-cyan-bright)';
      const _tp=previewGainsWithClass(tier.gains);
      gl.innerHTML=Object.entries(_tp).map(([k,info])=>
        info.isBoosted
          ? `${k}+${info.total}<span style="color:${info.clsColor};font-size:9px">✦+${info.bonus}</span>`
          : `${k}+${info.base}`
      ).join(' ');
      btn.appendChild(gl);
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

function renderNegativeItem(task, periodKey) {
  const failed   = task.lastBreakDate === periodKey;
  const streak   = getAvoidStreak(task);
  const milestones = task.milestones || [];
  const awarded    = task.awardedMilestones || {};

  // Next milestone to hit
  const nextMs = milestones.find(ms => !awarded[ms.days]) || null;
  const prevMs = milestones.slice().reverse().find(ms => awarded[ms.days]) || null;

  // Progress bar: between last awarded and next milestone
  let barPct = 0;
  if (nextMs) {
    const from = prevMs ? prevMs.days : 0;
    barPct = Math.min(100, Math.round(((streak - from) / (nextMs.days - from)) * 100));
  } else {
    barPct = 100; // all milestones awarded
  }

  // Streak milestone glow (every 7 days)
  const isMilestone = streak > 0 && streak % 7 === 0;

  const wrap = document.createElement('div'); wrap.dataset.wrapId = task.id;

  const el = document.createElement('div');
  el.className = 'quest negative avoid-card' + (failed ? ' failed' : '') + (isMilestone ? ' avoid-milestone-glow' : '');
  el.dataset.taskId = task.id;

  // ── Header row ──
  const header = document.createElement('div'); header.className = 'avoid-header';

  const nameBlock = document.createElement('div'); nameBlock.className = 'avoid-name-block';
  const titleEl = document.createElement('div'); titleEl.className = 'avoid-title'; titleEl.textContent = task.text;
  const penEl   = document.createElement('div'); penEl.className = 'avoid-penalty'; penEl.textContent = `-${task.hp||30} HP si recaés`;
  nameBlock.appendChild(titleEl); nameBlock.appendChild(penEl);

  // Streak badge + adjust link
  const badgeWrap = document.createElement('div'); badgeWrap.className = 'avoid-badge-wrap';

  const badgeEl = document.createElement('div');
  badgeEl.className = 'avoid-streak-badge' + (isMilestone ? ' milestone' : '') + (streak === 0 ? ' zero' : '');
  badgeEl.innerHTML = `<span class="avoid-streak-icon">🛡️</span><span class="avoid-streak-num">${streak}</span>`;

  // Only show adjust link when there's no active relapse (lastBreakDate is null or not today)
  const adjustBtn = document.createElement('button'); adjustBtn.className = 'avoid-adjust-btn';
  adjustBtn.textContent = '📅 ajustar';
  adjustBtn.title = 'Ajustar fecha de inicio de racha';
  adjustBtn.addEventListener('click', e => { e.stopPropagation(); openAvoidDatePicker(task.id); });

  badgeWrap.appendChild(badgeEl);
  badgeWrap.appendChild(adjustBtn);

  // Edit/delete actions
  const actions = document.createElement('div'); actions.className = 'quest-actions';
  const editBtn = document.createElement('button'); editBtn.className = 'quest-action-btn edit'; editBtn.title = 'Edit'; editBtn.textContent = '✎';
  editBtn.addEventListener('click', e => { e.stopPropagation(); openHabitModal('edit','negativos',task.id); });
  const delBtn = document.createElement('button'); delBtn.className = 'quest-action-btn del'; delBtn.title = 'Delete'; delBtn.textContent = '✕';
  delBtn.addEventListener('click', e => { e.stopPropagation(); if(confirm(`Delete "${task.text}"?`)) deleteTask('negativos',task.id); });
  actions.appendChild(editBtn); actions.appendChild(delBtn);

  header.appendChild(nameBlock); header.appendChild(badgeWrap); header.appendChild(actions);
  el.appendChild(header);

  // ── Milestone progress bar ──
  const msWrap = document.createElement('div'); msWrap.className = 'avoid-ms-wrap';
  const msHdr  = document.createElement('div'); msHdr.className  = 'avoid-ms-hdr';

  const msLabel = document.createElement('span'); msLabel.className = 'avoid-ms-label';
  msLabel.textContent = 'RACHA LIMPIA';

  const msNext = document.createElement('span'); msNext.className = 'avoid-ms-next';
  if (nextMs) {
    msNext.innerHTML = `Próximo: <strong>${nextMs.days}d</strong> → ${nextMs.icon} +${nextMs.xp} EXP`;
  } else {
    msNext.textContent = '✦ TODOS LOS HITOS DESBLOQUEADOS';
    msNext.style.color = 'var(--sao-gold-soft)';
  }

  msHdr.appendChild(msLabel); msHdr.appendChild(msNext);

  const msTrack = document.createElement('div'); msTrack.className = 'avoid-ms-track';
  const msFill  = document.createElement('div'); msFill.className  = 'avoid-ms-fill';
  msFill.style.width = barPct + '%';
  msTrack.appendChild(msFill);

  msWrap.appendChild(msHdr); msWrap.appendChild(msTrack);
  el.appendChild(msWrap);

  // ── Awarded milestones chips ──
  if (milestones.some(ms => awarded[ms.days])) {
    const chips = document.createElement('div'); chips.className = 'avoid-awarded-chips';
    milestones.forEach(ms => {
      if (!awarded[ms.days]) return;
      const chip = document.createElement('span'); chip.className = 'avoid-awarded-chip';
      chip.textContent = `${ms.icon} ${ms.days}d`;
      chip.title = ms.label;
      chips.appendChild(chip);
    });
    el.appendChild(chips);
  }

  // ── Relapse button ──
  const btnRow = document.createElement('div'); btnRow.className = 'avoid-btn-row';
  if (!failed) {
    const relBtn = document.createElement('button'); relBtn.className = 'avoid-relapse-btn';
    relBtn.innerHTML = '⚠ REPORTAR RECAÍDA';
    relBtn.addEventListener('click', e => {
      e.stopPropagation();
      if (streak > 0) {
        if (!confirm(`¿Reportar recaída? Perderás la racha de ${streak} día${streak!==1?'s':''}.`)) return;
      }
      el.classList.add('neg-failing');
      setTimeout(() => toggleNegativo(task.id, periodKey), 250);
    });
    btnRow.appendChild(relBtn);
  } else {
    const undoBtn = document.createElement('button'); undoBtn.className = 'avoid-undo-btn';
    undoBtn.innerHTML = '↩ DESHACER RECAÍDA';
    undoBtn.addEventListener('click', e => { e.stopPropagation(); toggleNegativo(task.id, periodKey); });
    const failedLbl = document.createElement('span'); failedLbl.className = 'avoid-failed-label';
    failedLbl.textContent = '⚠ RECAÍDA REPORTADA HOY';
    btnRow.appendChild(failedLbl); btnRow.appendChild(undoBtn);
  }
  el.appendChild(btnRow);

  wrap.appendChild(el);
  return wrap;
}

function renderQuestList(list, opts) {
  const wrap=document.createElement('div'); wrap.className='quest-list';
  const pending=list.filter(t=>!t.done[opts.periodKey]);
  const done=list.filter(t=>!!t.done[opts.periodKey]);
  pending.forEach(task=>wrap.appendChild(renderQuestItem(task,opts)));
  if(pending.length>0 && done.length>0){
    const sep=document.createElement('div'); sep.className='quest-done-separator';
    const lbl=document.createElement('span'); lbl.className='quest-done-separator-label';
    lbl.textContent='✓ COMPLETED';
    sep.appendChild(lbl); wrap.appendChild(sep);
  }
  done.forEach(task=>wrap.appendChild(renderQuestItem(task,opts)));
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
  const dTotal=state.habitos.length, dDone=state.habitos.filter(h=>h.done[activeDate]).length;
  const dPct=dTotal>0?Math.round((dDone/dTotal)*100):0;
  const dBar=document.createElement('div'); dBar.className='progress-bar-wrap';
  const dHdr=document.createElement('div'); dHdr.className='progress-bar-header';
  const dLbl=document.createElement('span'); dLbl.className='progress-bar-label'; dLbl.textContent='DAILY PROGRESS';
  const dPctTxt=document.createElement('span'); dPctTxt.className='progress-bar-pct'+(dPct===100?' complete':''); dPctTxt.textContent=dPct+'%';
  dHdr.appendChild(dLbl); dHdr.appendChild(dPctTxt);
  const dTrack=document.createElement('div'); dTrack.className='progress-bar-track';
  const dFill=document.createElement('div'); dFill.className='progress-bar-fill'+(dPct===100?' complete':'');
  dFill.style.width=dPct+'%'; dTrack.appendChild(dFill);
  dBar.appendChild(dHdr); dBar.appendChild(dTrack);
  const dBanner=document.createElement('div'); dBanner.className='quests-complete-banner'+(dPct===100?' active':'');
  if(dPct===100) dBanner.textContent='⟦ ALL QUESTS COMPLETE ⟧';
  dBar.appendChild(dBanner); panelContent.appendChild(dBar);
  panelContent.appendChild(renderQuestList(state.habitos,{listKey:'habitos',periodKey:activeDate,isWeekly:false,allowEdit:true,allowDelete:true,allowReorder:true}));

  // WEEKLY section
  const wh=document.createElement('div'); wh.className='section-header weekly';
  const wAddBtn=document.createElement('button'); wAddBtn.className='add-habit-btn gold'; wAddBtn.textContent='+'; wAddBtn.title='New weekly mission';
  wAddBtn.addEventListener('click',()=>openHabitModal('add','weekly',null));
  wh.innerHTML=`<span class="section-label gold">⟦ WEEKLY ⟧</span><div class="section-line gold"></div><span class="section-meta">${state.weekly.filter(w=>w.done[week]).length}/${state.weekly.length} this week</span>`;
  wh.appendChild(wAddBtn);
  panelContent.appendChild(wh);
  const wTotal=state.weekly.length, wDone=state.weekly.filter(w=>w.done[week]).length;
  const wPct=wTotal>0?Math.round((wDone/wTotal)*100):0;
  const wBar=document.createElement('div'); wBar.className='progress-bar-wrap weekly';
  const wHdr=document.createElement('div'); wHdr.className='progress-bar-header';
  const wLbl=document.createElement('span'); wLbl.className='progress-bar-label weekly'; wLbl.textContent='WEEKLY PROGRESS';
  const wPctTxt=document.createElement('span'); wPctTxt.className='progress-bar-pct weekly'+(wPct===100?' complete':''); wPctTxt.textContent=wPct+'%';
  wHdr.appendChild(wLbl); wHdr.appendChild(wPctTxt);
  const wTrack=document.createElement('div'); wTrack.className='progress-bar-track weekly';
  const wFill=document.createElement('div'); wFill.className='progress-bar-fill weekly'+(wPct===100?' complete':'');
  wFill.style.width=wPct+'%'; wTrack.appendChild(wFill);
  wBar.appendChild(wHdr); wBar.appendChild(wTrack);
  const wBanner=document.createElement('div'); wBanner.className='quests-complete-banner weekly'+(wPct===100?' active':'');
  if(wPct===100) wBanner.textContent='⟦ WEEKLY MISSIONS COMPLETE ⟧';
  wBar.appendChild(wBanner); panelContent.appendChild(wBar);
  panelContent.appendChild(renderQuestList(state.weekly,{listKey:'weekly',periodKey:week,isWeekly:true,allowEdit:true,allowDelete:true,allowReorder:true}));

  // AVOID section
  const negs=state.negativos||[];
  const nh=document.createElement('div'); nh.className='section-header';
  const nAddBtn=document.createElement('button'); nAddBtn.className='add-habit-btn neg'; nAddBtn.textContent='+'; nAddBtn.title='New negative habit';
  nAddBtn.addEventListener('click',()=>openHabitModal('add','negativos',null));
  const nBroken = negs.filter(n=>n.lastBreakDate===activeDate).length;
  const bestStreak = negs.length ? Math.max(...negs.map(n=>getAvoidStreak(n))) : 0;
  const streakMeta = nBroken > 0 ? `⚠ ${nBroken} recaída hoy` : (bestStreak > 0 ? `🛡️ ${bestStreak}d limpio` : 'sin recaídas');
  nh.innerHTML=`<span class="section-label neg">⟦ AVOID ⟧</span><div class="section-line neg"></div><span class="section-meta">${streakMeta}</span>`;
  nh.appendChild(nAddBtn); panelContent.appendChild(nh);
  const negList=document.createElement('div'); negList.className='quest-list';
  negs.forEach(task=>negList.appendChild(renderNegativeItem(task,activeDate)));
  panelContent.appendChild(negList);

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
  const rightHtml = tabKey==='habitos'
    ? `<div style="display:flex;gap:8px;align-items:center"><button class="wr-report-btn" id="weeklyReportBtn">📊 WEEKLY</button><button class="reset-btn" id="resetBtn">⟲ RESET DAY</button></div>`
    : `<button class="reset-btn" id="resetBtn">⟲ RESET DAY</button>`;
  f.innerHTML=`<div class="progress-text">${text}</div>${rightHtml}`;
  if (tabKey==='habitos') f.querySelector('#weeklyReportBtn').addEventListener('click', showWeeklyReport);
  f.querySelector('#resetBtn').addEventListener('click',()=>{
    if(!confirm("Reset today's progress? All checks will be cleared and stats gained today will be reversed.")) return;
    [...state.habitos,...state.trabajo].forEach(t=>{ if(t.done[today]){const c=getCompletion(t,today);if(c){applyGains(c.gains,-1);state.totalXp=Math.max(0,state.totalXp-(c.xp||0));}delete t.done[today];}});
    saveState(); renderAll();
  });
  return f;
}

function renderCharStatusHeader() {
  const el = document.getElementById('charStatusHeader'); if (!el) return;
  const { level, currentLevelXp, neededForNext } = calcLevel(state.totalXp);
  const rank     = getPlayerRank();
  const rankColor = TIER_COLORS[rank] || '#9e9e9e';
  const pct      = Math.min(100, Math.round((currentLevelXp / neededForNext) * 100));
  const remaining = neededForNext - currentLevelXp;
  const isMaxLevel = level >= MAX_LEVEL;

  el.style.setProperty('--rank-color', rankColor);
  el.innerHTML = `
    <div class="char-status-rank" style="color:${rankColor}">RANK ${rank}</div>
    <div class="char-status-level">
      <span class="char-status-lv-label">LEVEL</span>
      <span class="char-status-lv-num">${level}</span>
    </div>
    <div class="char-status-xp">
      <div class="char-status-xp-bar">
        <div class="char-status-xp-fill" style="width:${pct}%;background:${rankColor};color:${rankColor}"></div>
      </div>
      <div class="char-status-xp-text">
        <span>${currentLevelXp.toLocaleString()} / ${neededForNext.toLocaleString()} XP</span>
        <span>${isMaxLevel ? 'MAX LEVEL' : `→ ${remaining.toLocaleString()} to Lv ${level + 1}`}</span>
      </div>
    </div>`;
}

function renderPersonaje() {
  panelTitle.textContent='CHARACTER STATUS'; panelSubtitle.textContent='Player attributes';
  panelContent.innerHTML=`<div id="charStatusHeader" class="char-status-header"></div><div id="classPanelEl"></div><div class="character-grid"><div class="radar-card"><div class="radar-title">⟦ STAT MATRIX ⟧</div><canvas id="radarCanvas"></canvas></div><div class="stats-list" id="statsList"></div></div><div id="combatStatsEl"></div>`;
  renderCharStatusHeader();
  renderClassPanel();
  const sl=document.getElementById('statsList');
  const SCOL = STAT_COLORS;

  STAT_KEYS.forEach(k => {
    const pts = state.stats[k], passive = getClassPassiveBonus(k, state), t = tierFor(pts);
    const nextTier = TIERS[TIERS.findIndex(x => x.t === t.tier)+1];
    const isOpen = openStatKey === k;

    const wrap = document.createElement('div'); wrap.className = 'stat-row-wrap';

    const row = document.createElement('div');
    row.className = `stat-row ${k}${isOpen ? ' stat-row-open' : ''}`;
    row.innerHTML = `
      <div class="stat-row-top">
        <div class="stat-name-block"><span class="stat-code">${k}</span><span class="stat-full-name">${STAT_NAMES[k]}</span></div>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="stat-tier" style="color:${TIER_COLORS[t.tier]||'#9e9e9e'};border-color:${TIER_COLORS[t.tier]||'#9e9e9e'}44;text-shadow:0 0 8px ${TIER_COLORS[t.tier]||'#9e9e9e'}60">RANK ${t.tier}</div>
          <span style="font-family:'Cinzel',serif;font-size:9px;color:var(--sao-text-dim)">${isOpen?'▲':'▼'}</span>
        </div>
      </div>
      <div class="stat-row-bar"><div class="stat-row-fill" style="width:${t.pctToNext}%;background:linear-gradient(90deg,${SCOL[k]}aa,${SCOL[k]})"></div></div>
      <div class="stat-row-foot">
        <span class="stat-points">${fmtStat(pts)} PTS${passive>0?`<span class="stat-passive-bonus">+${passive}⚡</span>`:''}</span>
        <span>${t.capped?'MAX RANK':`→ ${fmtStat(parseFloat((t.nextMin-pts).toFixed(1)))} pts to Rank ${nextTier.t}`}</span>
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

        const tc = TIER_COLORS[tier.t] || sc;
        if (isPast) {
          rankHtml  = `<span style="color:${tc};opacity:0.35;font-weight:700">${tier.t}</span>`;
          ptsHtml   = `<span style="opacity:0.35">${tier.min.toLocaleString()}</span>`;
          deltaHtml = `<span style="color:var(--sao-green);font-size:10px">✓</span>`;
          etaHtml   = `<span style="color:var(--sao-green);font-size:10px">Done</span>`;
        } else if (isCurrent) {
          rankHtml  = `<span style="color:${tc};font-weight:700;text-shadow:0 0 10px ${tc}80">${tier.t} ◀</span>`;
          ptsHtml   = `<span style="color:#fff">${tier.min.toLocaleString()} — <span style="color:${tc}">${fmtStat(pts)}</span></span>`;
          deltaHtml = `<span style="color:var(--sao-cyan-bright)">Current</span>`;
          etaHtml   = `<span style="color:var(--sao-cyan-bright)">—</span>`;
        } else {
          rankHtml  = `<span style="color:${tc};font-weight:700">${tier.t}</span>`;
          ptsHtml   = `<span style="color:var(--sao-text-dim)">${tier.min.toLocaleString()}</span>`;
          deltaHtml = `<span style="color:var(--sao-gold-soft)">+${fmtStat(parseFloat(delta.toFixed(1)))}</span>`;
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

// ============================================================
// CLASS SYSTEM — ACTIONS & UI  (Pasos 4 + 5)
// ============================================================

const TIER_NAMES = { 1:'NOVICE', 2:'ADEPT', 3:'EXPERT', 4:'LEGEND', 5:'???' };

// Returns Tier N-1 classes that share at least one stat with this class
function getClassPrerequisites(classId) {
  const cls = CLASSES[classId];
  if (cls.tier === 1) return [];
  return Object.values(CLASSES).filter(c =>
    c.tier === cls.tier - 1 && c.stats.some(s => cls.stats.includes(s))
  );
}

// Returns Tier N+1 classes this class helps unlock
function getClassUnlocks(classId) {
  const cls = CLASSES[classId];
  if (cls.tier >= 4) return [];
  return Object.values(CLASSES).filter(c =>
    !c.hidden && c.tier === cls.tier + 1 && c.stats.some(s => cls.stats.includes(s))
  );
}

function confirmEquipClass(classId) {
  try {
    const cls = CLASSES[classId];
    if (!cls) return;

    // Remove any existing confirm overlay
    document.getElementById('equipConfirmOverlay')?.remove();

    const currentId  = state.classData.equipped;
    const currentCls = (currentId && CLASSES[currentId]) ? CLASSES[currentId] : null;
    const color      = cls.color || '#4dd0e1';
    const chipsHtml  = (cls.stats || []).map(s => {
      const c = (STAT_COLORS && STAT_COLORS[s]) || '#fff';
      return `<span class="cls-stat-chip" style="--chip-c:${c}">${s}</span>`;
    }).join('');
    const bodyText = currentCls
      ? `Reemplazás <strong style="color:${currentCls.color}">${currentCls.name}</strong> por esta clase.`
      : `Equipás tu primera clase.`;

    // ── Build overlay using createElement (avoids innerHTML parsing issues) ──
    const overlay = document.createElement('div');
    overlay.id = 'equipConfirmOverlay';
    // Use both CSS class AND inline styles to guarantee visibility
    overlay.className = 'equip-confirm-overlay';
    overlay.style.cssText = [
      'position:fixed', 'top:0', 'left:0', 'right:0', 'bottom:0',
      'background:rgba(0,4,12,0.88)', 'z-index:9998',
      'display:flex', 'align-items:center', 'justify-content:center', 'padding:20px'
    ].join(';');

    const box = document.createElement('div');
    box.className = 'equip-confirm-box';
    box.style.setProperty('--confirm-color', color);

    // Label
    const lbl = document.createElement('div');
    lbl.className = 'equip-confirm-label';
    lbl.textContent = '⟦ EQUIPAR CLASE ⟧';

    // Name
    const nameEl = document.createElement('div');
    nameEl.className = 'equip-confirm-name';
    nameEl.style.color = color;
    nameEl.textContent = cls.name;

    // Chips
    const chipsEl = document.createElement('div');
    chipsEl.className = 'equip-confirm-chips';
    chipsEl.innerHTML = chipsHtml;

    // Body text
    const bodyEl = document.createElement('div');
    bodyEl.className = 'equip-confirm-body';
    bodyEl.innerHTML = bodyText + '<br>¿Confirmás?';

    // Buttons row
    const btns = document.createElement('div');
    btns.className = 'equip-confirm-btns';

    const yesBtn = document.createElement('button');
    yesBtn.className = 'equip-confirm-yes';
    yesBtn.textContent = 'EQUIPAR';
    yesBtn.onclick = (e) => {
      e.stopPropagation();
      overlay.remove();
      equipClass(classId);
      document.getElementById('classSelectPopup')?.remove();
    };

    const noBtn = document.createElement('button');
    noBtn.className = 'equip-confirm-no';
    noBtn.textContent = 'CANCELAR';
    noBtn.onclick = (e) => { e.stopPropagation(); overlay.remove(); };

    btns.appendChild(yesBtn);
    btns.appendChild(noBtn);
    box.appendChild(lbl);
    box.appendChild(nameEl);
    box.appendChild(chipsEl);
    box.appendChild(bodyEl);
    box.appendChild(btns);
    overlay.appendChild(box);

    // Dismiss on backdrop tap
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    // Append inside the class popup if it exists — avoids backdrop-filter stacking context issues
    const parent = document.getElementById('classSelectPopup') || document.body;
    parent.appendChild(overlay);

  } catch(err) {
    console.error('confirmEquipClass error:', err);
    // Fallback: native confirm dialog
    if (window.confirm(`¿Equipar clase ${CLASSES[classId]?.name || classId}?`)) {
      equipClass(classId);
      document.getElementById('classSelectPopup')?.remove();
    }
  }
}

function equipClass(classId) {
  if (classId && !getClassUnlockStatus(classId, state).available) return;
  state.classData.equipped = classId || null;
  if (classId && !state.classData.history.includes(classId)) state.classData.history.push(classId);
  saveState(); renderAll();
  if (classId) showNotif(`⟦ CLASS EQUIPPED: ${CLASSES[classId].name} ⟧`);
}

let _classPopupTier = 1;

function renderClassPanel() {
  const el = document.getElementById('classPanelEl'); if (!el) return;
  const eqId    = state.classData.equipped;
  const cls     = eqId ? CLASSES[eqId] : null;
  const avail   = getAvailableClasses(state);
  const hasNew  = avail.length > 0;

  const panel = document.createElement('div');
  panel.className = 'class-panel';
  if (cls) panel.style.setProperty('--cls-accent', cls.color);
  panel.innerHTML = `<div class="class-panel-hdr">⟦ CLASS ⟧</div>`;

  if (cls) {
    const tierName   = TIER_NAMES[cls.tier] || '';
    const days       = state.classData.mastery[eqId] || 0;
    const mastPct    = Math.min(100, Math.round((days / cls.masteryDays) * 100));
    const isMastered = state.classData.masteredClasses[eqId];
    const passiveStr = `+${Math.round(cls.passive*100)}% passive · ×${(1+cls.multiplier).toFixed(2)} gains`;
    const chipsHtml  = cls.stats.map(s =>
      `<span class="cls-stat-chip" style="--chip-c:${STAT_COLORS[s]}">${s}</span>`
    ).join('');
    const mastLabel  = isMastered
      ? `<span style="color:var(--sao-gold-soft)">✦ MASTERED</span>`
      : `${days}/${cls.masteryDays} days`;

    panel.innerHTML += `
      <div class="class-equipped-display">
        <div class="class-name-row">
          <span class="class-name-big" style="color:${cls.color}">${cls.name}</span>
          <span class="class-tier-badge" style="color:${cls.color}">${tierName}</span>
        </div>
        <div class="class-stats-chips">${chipsHtml}</div>
        <div class="class-passive-row">${passiveStr}</div>
        ${CLASS_DESCS[eqId] ? `<div class="class-panel-desc">${CLASS_DESCS[eqId]}</div>` : ''}
        <div class="class-mastery-row">
          <div class="class-mastery-bar">
            <div class="class-mastery-fill" style="width:${mastPct}%;background:${cls.color};box-shadow:0 0 8px ${cls.color}"></div>
          </div>
          <span class="class-mastery-label">${mastLabel}</span>
        </div>
      </div>`;
  } else {
    panel.innerHTML += `
      <div class="class-equipped-display">
        <div class="class-name-row">
          <span class="class-name-big" style="color:var(--sao-text-dim)">BEGINNER</span>
        </div>
        <div class="class-passive-row">Your journey begins. No class equipped.</div>
        ${hasNew ? '<div class="class-unlock-alert">▶ CLASS UNLOCK AVAILABLE ◀</div>' : ''}
      </div>`;
  }

  const btn = document.createElement('button');
  btn.className = 'class-change-btn';
  btn.textContent = cls ? 'CHANGE CLASS' : 'VIEW CLASSES';
  btn.addEventListener('click', () => showClassSelectPopup());
  panel.appendChild(btn);
  el.appendChild(panel);
}

function showClassSelectPopup() {
  document.getElementById('classSelectPopup')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'classSelectPopup';
  overlay.className = 'class-popup-overlay';

  const allTiers = [1,2,3,4,5];
  const tierTabsHtml = allTiers.map(t => {
    const classes = CLASSES_BY_TIER[t];
    if (!classes || !classes.length) return '';
    const anyAvail = classes.some(id => !CLASSES[id].hidden && getClassUnlockStatus(id, state).available);
    const isActive = _classPopupTier === t;
    const isLocked = !anyAvail;
    // Tier 5 (???) — always shown without lock icon, mystery is the point
    if (t === 5) {
      return `<button class="class-tier-tab mystery-tab${isActive?' active':''}" data-tier="5">???</button>`;
    }
    return `<button class="class-tier-tab${isActive?' active':''}${isLocked?' locked-tab':''}" data-tier="${t}">${TIER_NAMES[t]}${isLocked?' 🔒':''}</button>`;
  }).join('');

  // ── Progression tree overview ────────────────────────────────
  const treeHtml = buildClassTreeHtml();

  overlay.innerHTML = `
    <div class="class-popup-header">
      <span class="class-popup-title">⟦ SELECT CLASS ⟧</span>
      <button class="class-popup-close">✕</button>
    </div>
    ${treeHtml}
    <div class="class-tier-tabs">${tierTabsHtml}</div>
    <div class="class-popup-body" id="classPopupBody"></div>`;

  document.body.appendChild(overlay);
  overlay.querySelector('.class-popup-close').addEventListener('click', () => overlay.remove());
  overlay.querySelectorAll('.class-tier-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      _classPopupTier = parseInt(tab.dataset.tier);
      renderClassPopupBody();
      overlay.querySelectorAll('.class-tier-tab').forEach(t2 => t2.classList.toggle('active', t2===tab));
    });
  });
  renderClassPopupBody();
}

function buildClassTreeHtml() {
  const tierColors = { 1:'#66bb6a', 2:'#42a5f5', 3:'#ffa726', 4:'#ffd700', 5:'#ffffff' };
  const tierReq    = { 1:'Rank E · Lv 15 · E stats', 2:'Lv 40 · B stats', 3:'Lv 60 · A stats', 4:'Lv 80 · S stats', 5:'Lv 95 · SSS' };

  const nodes = [1,2,3,4,5].map(t => {
    const ids       = (CLASSES_BY_TIER[t] || []).filter(id => !CLASSES[id].hidden);
    const total     = ids.length;
    const mastered  = ids.filter(id => state.classData.masteredClasses[id]).length;
    const anyAvail  = ids.some(id => getClassUnlockStatus(id, state).available);
    const equipped  = ids.includes(state.classData.equipped);
    const allDone   = total > 0 && mastered === total;
    const color     = tierColors[t];

    let status, statusClass;
    if (allDone)       { status = '✦ COMPLETE'; statusClass = 'tree-complete'; }
    else if (anyAvail) { status = `${mastered}/${total} mastered`; statusClass = 'tree-active'; }
    else               { status = '🔒 LOCKED';   statusClass = 'tree-locked'; }

    const equippedDot = equipped ? `<span class="tree-eq-dot">●</span>` : '';
    const tierLabel   = TIER_NAMES[t];

    return `<div class="tree-node ${statusClass}" data-tier="${t}">
      <div class="tree-node-name" style="color:${allDone||anyAvail?color:'rgba(255,255,255,0.2)'}">${equippedDot}${tierLabel}</div>
      <div class="tree-node-req">${anyAvail||allDone ? tierReq[t] : '???'}</div>
      <div class="tree-node-status">${status}</div>
    </div>`;
  });

  const arrows = ['→','→','→','→'].map(a => `<div class="tree-arrow">${a}</div>`).join('');
  const nodesWithArrows = nodes.map((n,i) => i < nodes.length-1 ? n + arrows.split('</div>')[i]+'</div>' : n).join('');

  // Simpler: interleave
  let html = '<div class="class-tree-row">';
  nodes.forEach((n, i) => {
    html += n;
    if (i < nodes.length - 1) html += `<div class="tree-arrow">→</div>`;
  });
  html += '</div>';
  return html;
}

function renderClassPopupBody() {
  const body = document.getElementById('classPopupBody'); if (!body) return;
  const tier  = _classPopupTier;

  // ── Tier 5: mystery panel ─────────────────────────────────
  if (tier === 5) {
    body.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 24px;text-align:center;gap:24px">
        <div style="font-size:52px;letter-spacing:16px;color:rgba(255,255,255,0.15);font-weight:900;text-shadow:0 0 40px rgba(255,255,255,0.1)">???</div>
        <div style="font-size:13px;letter-spacing:3px;color:rgba(255,255,255,0.25);font-style:italic;max-width:340px;line-height:1.9">
          "A true hero does not arise from strength alone —<br>
          he is forged in the mastery of all things.<br>
          Only when every limit has been conquered<br>
          will the path reveal itself."
        </div>
        <div style="font-size:10px;letter-spacing:4px;color:rgba(255,255,255,0.1);margin-top:8px">⟦ BEYOND LEGEND ⟧</div>
      </div>`;
    return;
  }

  const ids   = (CLASSES_BY_TIER[tier] || []).filter(id => !CLASSES[id].hidden);
  body.innerHTML = '';
  const grid = document.createElement('div'); grid.className = 'class-cards-grid';

  ids.forEach(id => {
    const cls    = CLASSES[id];
    const status = getClassUnlockStatus(id, state);
    const isEq   = state.classData.equipped === id;
    const isMast = state.classData.masteredClasses[id];
    const days   = state.classData.mastery[id] || 0;

    const card = document.createElement('div');
    card.className = `class-card ${status.available?'available':'locked'}${isEq?' equipped-cls':''}`;
    card.style.setProperty('--cls-color', cls.color);

    const chipsHtml  = cls.stats.map(s =>
      `<span class="class-card-chip" style="--chip-c:${STAT_COLORS[s]}">${s}</span>`
    ).join('');
    const passiveStr = `+${Math.round(cls.passive*100)}% passive · ×${(1+cls.multiplier).toFixed(2)} gains`;
    const lockStr    = status.reasons.map(r=>`<span>• ${r}</span>`).join('<br>');
    const metStr     = status.met.map(r=>`<span style="color:#66bb6a">• ${r}</span>`).join('<br>');
    const prereqs    = getClassPrerequisites(id);
    const unlocks    = getClassUnlocks(id);
    const prereqStr  = prereqs.length ? prereqs.map(c => `<span style="color:${c.color}">${c.name}</span>`).join(' / ') : '';
    const unlockStr  = unlocks.length ? unlocks.map(c => `<span style="color:${c.color}">${c.name}</span>`).join(' ') : '';

    // Mastery bar
    const mastPct   = isMast ? 100 : Math.min(100, Math.round((days / cls.masteryDays) * 100));
    const barColor  = isMast ? 'var(--sao-gold)' : cls.color;
    const mastLabel = isMast
      ? '✦ MASTERED'
      : (days > 0 ? `${days} / ${cls.masteryDays} días` : `0 / ${cls.masteryDays} días`);
    const mastBarHtml = `
      <div class="class-card-mastery">
        <div class="class-card-mastery-hdr">
          <span class="class-card-mastery-label${isMast?' mastered':''}">MAESTRÍA</span>
          <span class="class-card-mastery-val${isMast?' mastered':''}">${mastLabel}</span>
        </div>
        <div class="class-card-mastery-track">
          <div class="class-card-mastery-fill" style="width:${mastPct}%;background:${barColor};box-shadow:0 0 6px ${barColor}"></div>
        </div>
      </div>`;

    const descStr = CLASS_DESCS[id] || '';
    card.innerHTML = `
      ${isEq ? '<div class="class-card-eq-badge">EQUIPPED</div>' : ''}
      <div class="class-card-name" style="color:${cls.color}">${cls.name}</div>
      ${descStr ? `<div class="class-card-desc">${descStr}</div>` : ''}
      <div class="class-card-chips">${chipsHtml}</div>
      <div class="class-card-passive">${passiveStr}</div>
      ${prereqStr ? `<div class="class-card-prereq">← ${prereqStr}</div>` : ''}
      ${unlockStr ? `<div class="class-card-unlock">→ ${unlockStr}</div>` : ''}
      ${(metStr || lockStr) ? `<div class="class-card-lock">${[metStr, lockStr].filter(Boolean).join('<br>')}</div>` : ''}
      ${mastBarHtml}`;

    if (status.available && !isEq) {
      card.style.cursor = 'pointer';
      card.onclick = (e) => { e.stopPropagation(); confirmEquipClass(id); };
    }
    grid.appendChild(card);
  });

  body.appendChild(grid);
}

function renderCombatStats() {
  const el = document.getElementById('combatStatsEl'); if (!el) return;
  const lv = calcLevel(state.totalXp), eq = getEquippedStats();
  const STR=getEffectiveStat('STR',state)+(eq.STR||0), DEX=getEffectiveStat('DEX',state)+(eq.DEX||0), CON=getEffectiveStat('CON',state)+(eq.CON||0);
  const INT=getEffectiveStat('INT',state)+(eq.INT||0), VOL=getEffectiveStat('VOL',state)+(eq.VOL||0), CHA=getEffectiveStat('CHA',state)+(eq.CHA||0);

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
  const rankIndex=k=>TIERS.findIndex(t=>t.t===tierFor(getEffectiveStat(k,state)).tier);
  const data=STAT_KEYS.map(k=>rankIndex(k)), maxData=TIERS.length-1;
  const rankPlugin={id:'radarRanks',afterDraw(chart){
    const ctx=chart.ctx, scale=chart.scales.r;
    if(!scale._pointLabelItems) return;
    ctx.save();
    ctx.font='700 11px "Cinzel",serif';
    ctx.fillStyle='#ffc107';
    ctx.textBaseline='top';
    scale._pointLabelItems.forEach((item,i)=>{
      const rank=tierFor(getEffectiveStat(STAT_KEYS[i],state)).tier;
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
    if(!info||info.total===0){ bar.classList.add('bar-empty'); bar.style.height='12px'; }
    else {
      const barH=Math.max(48, Math.round(pct*160/100));
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
      currentTab='habits';
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

function renderAll() { renderHeader(); if(currentTab==='habits') renderHabitos(); else if(currentTab==='work') renderTrabajo(); else if(currentTab==='character') renderPersonaje(); else if(currentTab==='history') renderHistory(); else if(currentTab==='achievements') renderLogros(); else if(currentTab==='inventory') renderInventory(); else if(currentTab==='party') renderParty(); }

// ============================================================
// PARTY TAB
// ============================================================
// ── Rank helpers ─────────────────────────────────────────────
const RANK_ORDER = ['F','E','D','C','B','A','S','SS','SSS'];
function getPlayerRank() {
  const lv = calcLevel(state.totalXp).level;
  const statAvg = STAT_KEYS.reduce((s,k) => s + (getEffectiveStat(k,state)||0), 0) / STAT_KEYS.length;
  // Advance rank only when BOTH the level band AND the stat average are met.
  // If stats lag behind XP, the displayed rank is capped at the last fully-met tier.
  let rank = 'E';
  for (const b of LEVEL_BANDS) {
    if (lv < b.from) break;
    if (statAvg >= (b.statReq ?? 0)) rank = b.rank;
  }
  return rank;
}
function rankIdx(r) { return RANK_ORDER.indexOf(r); }
function playerMeetsRank(r) { return !r || rankIdx(getPlayerRank()) >= rankIdx(r); }

// ── Party character roster ────────────────────────────────────
// requirementRank: null = always available, 'E' = needs player rank E, etc.
const PARTY_CHARACTERS = [
  // RANK F — base classes, free, max level 10
  { id:'gareth',    name:'Gareth',    class:'Paladin',   role:'Tank',         rank:'F', sprite:'🛡️', maxLevel:10, recruitCost:0,   stats:{HP:150,MP:50,ATK:28,DEF:70,SPD:25},  color:'#4dd0e1', requirementRank:null, lore:'Stalwart and unyielding. Slow to move, impossible to break.' },
  { id:'lyra',      name:'Lyra',      class:'Mage',      role:'DPS Magic',    rank:'F', sprite:'🔮', maxLevel:10, recruitCost:0,   stats:{HP:70,MP:140,ATK:85,DEF:15,SPD:55},  color:'#82b1ff', requirementRank:null, lore:'Raw arcane output. Hits hard, survives poorly without cover.' },
  { id:'kael',      name:'Kael',      class:'Warrior',   role:'DPS Physical', rank:'F', sprite:'⚔️', maxLevel:10, recruitCost:0,   stats:{HP:140,MP:30,ATK:90,DEF:40,SPD:65},  color:'#ff8a80', requirementRank:null, lore:'Built for the front line. Hits hard and takes hits harder.' },
  { id:'aria',      name:'Aria',      class:'Cleric',    role:'Healer',       rank:'F', sprite:'✨', maxLevel:10, recruitCost:0,   stats:{HP:100,MP:130,ATK:18,DEF:45,SPD:40},  color:'#ffd54f', requirementRank:null, lore:'The glue that holds any party together. Never optional.' },
  { id:'zeth',      name:'Zeth',      class:'Rogue',     role:'Support',      rank:'F', sprite:'🎭', maxLevel:10, recruitCost:0,   stats:{HP:90,MP:110,ATK:45,DEF:30,SPD:95},  color:'#ce93d8', requirementRank:null, lore:'First to act, last to be noticed. Buffs allies, debuffs enemies.' },
  // RANK E — unlock at player rank E (level 10), cost 150g, max level 20
  { id:'thornwall', name:'Thornwall', class:'Knight',    role:'Tank',         rank:'E', sprite:'🏰', maxLevel:20, recruitCost:150, stats:{HP:200,MP:60,ATK:35,DEF:100,SPD:22}, color:'#4dd0e1', requirementRank:'E',  lore:'Defensive mastery elevated. Built to absorb punishment for the party.' },
  { id:'grimoire',  name:'Grimoire',  class:'Archmage',  role:'DPS Magic',    rank:'E', sprite:'📖', maxLevel:20, recruitCost:150, stats:{HP:80,MP:200,ATK:120,DEF:18,SPD:60}, color:'#82b1ff', requirementRank:'E',  lore:'Focused thought crystallized into pure destructive potential.' },
  { id:'ferrus',    name:'Ferrus',    class:'Berserker', role:'DPS Physical', rank:'E', sprite:'🪓', maxLevel:20, recruitCost:150, stats:{HP:180,MP:35,ATK:130,DEF:45,SPD:80}, color:'#ff8a80', requirementRank:'E',  lore:'Rages without limit. Trades stability for unmatched burst damage.' },
  { id:'helio',     name:'Helio',     class:'Bishop',    role:'Healer+',      rank:'E', sprite:'⚜️', maxLevel:20, recruitCost:150, stats:{HP:120,MP:190,ATK:22,DEF:60,SPD:50}, color:'#ffd54f', requirementRank:'E',  lore:'Heals and buffs simultaneously. A cornerstone of any serious party.' },
  { id:'velara',    name:'Velara',    class:'Bard',      role:'Support+',     rank:'E', sprite:'🎵', maxLevel:20, recruitCost:150, stats:{HP:110,MP:160,ATK:50,DEF:38,SPD:110},color:'#ce93d8', requirementRank:'E',  lore:'Controls the tempo of every fight. Unpredictable and highly effective.' },
];

// Locked rank previews shown in tavern (D, C, B, A)
const PARTY_RANK_PREVIEWS = [
  { rank:'D', hint:'Rank D (Level 20)', note:'5 advanced companions',   maxLevel:30 },
  { rank:'C', hint:'Rank C (Level 30)', note:'5 elite companions',       maxLevel:40 },
  { rank:'B', hint:'Rank B (Level 40)', note:'5 veteran companions',     maxLevel:50 },
  { rank:'A', hint:'Rank A (Level 50)', note:'Player class tree unlocked — same classes as you', maxLevel:65 },
];

// game-icons.net icon paths per character (author/icon-name)
const CHAR_ICONS = {
  gareth:    'lorc/shield',
  lyra:      'lorc/magic-swirl',
  kael:      'lorc/broadsword',
  aria:      'lorc/caduceus',
  zeth:      'lorc/daggers',
  thornwall: 'lorc/visored-helm',
  grimoire:  'lorc/spell-book',
  ferrus:    'lorc/war-axe',
  helio:     'lorc/angel-wings',
  velara:    'lorc/harp',
};

function giUrl(hexColor, path) {
  return `https://game-icons.net/icons/${hexColor}/transparent/1x1/${path}.svg`;
}
function charIconUrl(ch) {
  const path = CHAR_ICONS[ch.id];
  if (!path) return null;
  return giUrl(ch.color.replace('#',''), path);
}
function giImg(url, cls, alt, size) {
  return `<img src="${url}" class="${cls}" alt="${alt}" width="${size}" height="${size}" onerror="this.style.opacity='0'">`;
}

// Shared UI icons
const PI = {
  swords: giUrl('4dd0e1','lorc/crossed-swords'),
  tavern: giUrl('ffc107','lorc/beer-stein'),
  lock:   giUrl('666688','lorc/padlock'),
  person: giUrl('4dd0e1','delapouite/person'),
};

let activePartySubTab = 'party';

function isCharUnlocked(char) { return playerMeetsRank(char.requirementRank); }
function isCharInParty(charId) { return (state.party || []).includes(charId); }

function recruitChar(charId) {
  const char = PARTY_CHARACTERS.find(c => c.id === charId);
  if (!char) return;
  if (!state.party) state.party = [];
  if (state.party.includes(charId)) return;
  if (state.party.length >= 3) { showNotif('⚠ Party is full — remove a member first'); return; }
  if (char.recruitCost > 0) {
    if ((state.col || 0) < char.recruitCost) { showNotif(`⚠ Need ${char.recruitCost}G to recruit ${char.name}`); return; }
    state.col -= char.recruitCost;
  }
  state.party.push(charId);
  saveState(); renderParty();
  showNotif(`⟦ ${char.name.toUpperCase()} JOINED THE PARTY ⟧`);
}

function removeChar(charId) {
  if (!state.party) return;
  state.party = state.party.filter(id => id !== charId);
  saveState(); renderParty();
}

function renderParty() {
  panelTitle.textContent = 'PARTY'; panelSubtitle.textContent = 'Companions & Guild';
  panelContent.innerHTML = '';
  const subTabs = document.createElement('div');
  subTabs.className = 'party-subtabs';
  subTabs.innerHTML = `
    <button class="party-subtab ${activePartySubTab==='party'?'active':''}" onclick="activePartySubTab='party';renderParty()">${giImg(PI.swords,'ptab-icon','party',14)} PARTY</button>
    <button class="party-subtab ${activePartySubTab==='tavern'?'active':''}" onclick="activePartySubTab='tavern';renderParty()">${giImg(PI.tavern,'ptab-icon','tavern',14)} TAVERN</button>
  `;
  panelContent.appendChild(subTabs);
  if (activePartySubTab === 'party') _renderPartySlots();
  else _renderTavern();
}

function _renderPartySlots() {
  const wrap = document.createElement('div');
  const lv = calcLevel(state.totalXp).level;
  const party = state.party || [];
  const grid = document.createElement('div');
  grid.className = 'party-grid';

  // Slot 0 — Player
  const hpPct = Math.round((state.hp || 100) / (state.maxHp || 100) * 100);
  const mpPct = Math.round((state.mp || 100) / (state.maxMp || 100) * 100);
  const avatarHtml = state.avatarDataUrl
    ? `<img class="pslot-avatar" src="${state.avatarDataUrl}">`
    : `<div class="pslot-sprite">${giImg(PI.person,'pslot-icon','player',40)}</div>`;
  const p0 = document.createElement('div');
  p0.className = 'party-slot is-player';
  p0.innerHTML = `
    <div class="pslot-badge leader">LEADER</div>
    ${avatarHtml}
    <div class="pslot-name">${state.playerName || 'Tuni'}</div>
    <div class="pslot-class">${(state.currentClass || 'ADVENTURER').toUpperCase()}</div>
    <div class="pslot-lv">LV ${lv}</div>
    <div class="pslot-bars">
      <div class="pslot-bar-row"><span class="pslot-bar-lbl">HP</span><div class="pslot-bar-track"><div class="pslot-bar-fill hp" style="width:${hpPct}%"></div></div></div>
      <div class="pslot-bar-row"><span class="pslot-bar-lbl">MP</span><div class="pslot-bar-track"><div class="pslot-bar-fill mp" style="width:${mpPct}%"></div></div></div>
    </div>
  `;
  grid.appendChild(p0);

  // Slots 1–3
  for (let i = 0; i < 3; i++) {
    const charId = party[i];
    const slot = document.createElement('div');
    if (charId) {
      const ch = PARTY_CHARACTERS.find(c => c.id === charId);
      if (ch) {
        const rc = TIER_COLORS[ch.rank] || '#4dd0e1';
        const charLv = (state.partyLevels || {})[ch.id] || 1;
        slot.className = 'party-slot';
        slot.style.borderColor = ch.color + '55';
        slot.style.boxShadow = `0 0 10px ${ch.color}15`;
        slot.innerHTML = `
          <button class="pslot-remove" onclick="removeChar('${ch.id}')" title="Remove">✕</button>
          <div class="pslot-badge member" style="border-color:${ch.color}44;color:${ch.color}">${ch.role.toUpperCase()}</div>
          <div class="pslot-sprite">${giImg(charIconUrl(ch),'pslot-icon',ch.name,40)}</div>
          <div class="pslot-name">${ch.name}</div>
          <div class="pslot-class-row">
            <span class="pslot-class">${ch.class.toUpperCase()}</span>
            <span class="pslot-rank-badge" style="color:${rc};border-color:${rc}44">${ch.rank}</span>
          </div>
          <div class="pslot-lv">LV ${charLv} <span style="color:var(--sao-text-dim);font-size:8px">/ ${ch.maxLevel}</span></div>
          <div class="pslot-bars">
            <div class="pslot-bar-row"><span class="pslot-bar-lbl">HP</span><div class="pslot-bar-track"><div class="pslot-bar-fill hp" style="width:${Math.round(ch.stats.HP/220*100)}%"></div></div></div>
            <div class="pslot-bar-row"><span class="pslot-bar-lbl">MP</span><div class="pslot-bar-track"><div class="pslot-bar-fill mp" style="width:${Math.round(ch.stats.MP/220*100)}%"></div></div></div>
          </div>
        `;
      }
    } else {
      const isLocked = i === 2 && !playerMeetsRank('E');
      slot.className = `party-slot ${isLocked ? 'is-locked' : 'is-empty'}`;
      if (isLocked) {
        slot.innerHTML = `<div class="pslot-lock-icon">${giImg(PI.lock,'pslot-icon','locked',32)}</div><div class="pslot-lock-req">Unlocks at<br>Rank E (Lv 10)</div>`;
      } else {
        slot.innerHTML = `<div class="pslot-empty-icon">${giImg(PI.swords,'pslot-icon pslot-icon--dim','empty',28)}</div><div class="pslot-empty-text">EMPTY SLOT<br><span style="font-size:7px;opacity:0.6">Recruit from Tavern</span></div>`;
        slot.onclick = () => { activePartySubTab = 'tavern'; renderParty(); };
      }
    }
    grid.appendChild(slot);
  }
  wrap.appendChild(grid);

  // Party Power
  const totalAtk = party.reduce((s,id)=>{ const c=PARTY_CHARACTERS.find(x=>x.id===id); return s+(c?c.stats.ATK:0); }, Math.round((state.stats?.STR||10)*1.5));
  const totalDef = party.reduce((s,id)=>{ const c=PARTY_CHARACTERS.find(x=>x.id===id); return s+(c?c.stats.DEF:0); }, Math.round((state.stats?.CON||10)*1.5));
  const summary = document.createElement('div');
  summary.className = 'party-summary';
  summary.innerHTML = `
    <div class="party-summary-title">⟦ PARTY POWER ⟧</div>
    <div class="party-stats-row">
      <div class="party-stat"><div class="party-stat-val">${1+party.length}<span style="font-size:10px;color:var(--sao-text-dim)">/4</span></div><div class="party-stat-lbl">MEMBERS</div></div>
      <div class="party-stat"><div class="party-stat-val">${totalAtk}</div><div class="party-stat-lbl">TOTAL ATK</div></div>
      <div class="party-stat"><div class="party-stat-val">${totalDef}</div><div class="party-stat-lbl">TOTAL DEF</div></div>
    </div>
  `;
  wrap.appendChild(summary);
  const hint = document.createElement('div');
  hint.className = 'party-tactics-hint';
  hint.innerHTML = `<div class="party-tactics-hint-label">⟦ TACTICS ⟧</div><div class="party-tactics-hint-text">Pre-set battle gambits per member — coming soon</div>`;
  wrap.appendChild(hint);
  panelContent.appendChild(wrap);
}

function _renderTavern() {
  const wrap = document.createElement('div');
  const hdr = document.createElement('div');
  hdr.className = 'tavern-hdr';
  hdr.innerHTML = `<div class="tavern-hdr-title">⟦ ADVENTURER'S GUILD ⟧</div><div class="tavern-hdr-sub">Recruit companions · Your rank: <strong style="color:${TIER_COLORS[getPlayerRank()]||'#9e9e9e'}">${getPlayerRank()}</strong></div>`;
  wrap.appendChild(hdr);

  // Group by rank
  const ranks = [...new Set(PARTY_CHARACTERS.map(c => c.rank))]; // F, E
  ranks.forEach(rank => {
    const chars = PARTY_CHARACTERS.filter(c => c.rank === rank);
    const rankUnlocked = playerMeetsRank(rank === 'F' ? null : rank);
    const rc = TIER_COLORS[rank] || '#9e9e9e';
    const lbl = document.createElement('div');
    lbl.className = 'tav-rank-header';
    lbl.innerHTML = `
      <span class="tav-rank-pill" style="color:${rc};border-color:${rc}55">RANK ${rank}</span>
      <span class="tav-rank-cap">MAX LV ${chars[0].maxLevel}</span>
      ${!rankUnlocked ? `<span class="tav-rank-lock">🔒 Rank ${rank} required</span>` : (rank==='F'?`<span class="tav-rank-free">FREE</span>`:`<span class="tav-rank-cost" style="color:var(--sao-gold)">150G each</span>`)}
    `;
    wrap.appendChild(lbl);
    chars.forEach(c => wrap.appendChild(_buildTavCard(c)));
  });

  // Locked rank previews
  PARTY_RANK_PREVIEWS.forEach(p => {
    if (playerMeetsRank(p.rank)) return; // already unlocked, skip
    const rc = TIER_COLORS[p.rank] || '#9e9e9e';
    const lbl = document.createElement('div');
    lbl.className = 'tav-rank-header';
    lbl.innerHTML = `<span class="tav-rank-pill" style="color:${rc};border-color:${rc}55">RANK ${p.rank}</span><span class="tav-rank-cap">MAX LV ${p.maxLevel}</span><span class="tav-rank-lock">🔒 ${p.hint}</span>`;
    wrap.appendChild(lbl);
    const preview = document.createElement('div');
    preview.className = 'tav-rank-preview';
    preview.innerHTML = `${giImg(PI.lock,'','lock',16)} ${p.note}`;
    wrap.appendChild(preview);
  });

  panelContent.appendChild(wrap);
}

function _buildTavCard(char) {
  const inParty  = isCharInParty(char.id);
  const unlocked = isCharUnlocked(char);
  const partyFull = (state.party || []).length >= 3;
  const rc = TIER_COLORS[char.rank] || '#9e9e9e';

  const card = document.createElement('div');
  card.className = `tav-card${inParty?' in-party':''}${!unlocked?' is-locked':''}`;

  let btnHtml;
  if (inParty) {
    btnHtml = `<button class="tav-btn in-party" onclick="removeChar('${char.id}')">✓ IN<br>PARTY</button>`;
  } else if (unlocked) {
    if (partyFull) {
      btnHtml = `<button class="tav-btn locked" disabled>PARTY<br>FULL</button>`;
    } else if (char.recruitCost === 0) {
      btnHtml = `<button class="tav-btn recruit" onclick="recruitChar('${char.id}')">FREE<br>RECRUIT</button>`;
    } else {
      const canAfford = (state.col || 0) >= char.recruitCost;
      btnHtml = `<button class="tav-btn recruit${canAfford?'':' locked'}" ${canAfford?`onclick="recruitChar('${char.id}')"`:'disabled'}>${char.recruitCost}G<br>RECRUIT</button>`;
    }
  } else {
    btnHtml = `<button class="tav-btn locked" disabled>🔒<br>LOCKED</button>`;
  }

  const pills = Object.entries(char.stats).map(([k,v])=>`<span class="tav-stat-pill">${k} ${v}</span>`).join('');

  card.innerHTML = `
    <div class="tav-sprite">${giImg(charIconUrl(char),'tav-icon',char.name,44)}</div>
    <div class="tav-info">
      <div class="tav-name-row">
        <span class="tav-name">${char.name}</span>
        <span class="tav-rank-badge-sm" style="color:${rc};border-color:${rc}55">${char.rank}</span>
      </div>
      <div class="tav-class">${char.class.toUpperCase()} · ${char.role} · <span style="color:var(--sao-text-dim)">MAX LV ${char.maxLevel}</span></div>
      <div class="tav-lore">${char.lore}</div>
      <div class="tav-stats">${pills}</div>
      ${!unlocked ? `<div class="tav-req unmet">🔒 Reach Rank ${char.requirementRank}</div>` : char.recruitCost===0 ? `<div class="tav-req met">✓ Free to recruit</div>` : `<div class="tav-req ${(state.col||0)>=char.recruitCost?'met':'unmet'}">${(state.col||0)>=char.recruitCost?'✓':'⚠'} Cost: ${char.recruitCost} gold</div>`}
    </div>
    <div class="tav-actions">${btnHtml}</div>
  `;
  return card;
}

// ============================================================
// ACTIONS
// ============================================================
function triggerStreak7Flash(taskId) {
  setTimeout(()=>{ const el=document.querySelector(`[data-task-id="${taskId}"]`); if(el&&!el.classList.contains('streak-milestone')){ el.classList.add('streak-7-flash'); setTimeout(()=>el.classList.remove('streak-7-flash'),1100); }},200);
}

function showNegFloat(hp) {
  const el=document.createElement('div'); el.className='xp-float neg-float';
  const line=document.createElement('div'); line.className='xp-float-xp neg'; line.textContent=`-${hp} HP`;
  el.appendChild(line); document.body.appendChild(el);
  setTimeout(()=>el.remove(),1400);
}

// ── AVOID STREAK ─────────────────────────────────────────────
// Returns consecutive clean days since the last break (or cleanSinceDate / createdDate).
function getAvoidStreak(habit) {
  const today = new Date(); today.setHours(12,0,0,0);
  let start;
  if (habit.lastBreakDate) {
    start = new Date(habit.lastBreakDate + 'T12:00:00');
    start.setDate(start.getDate() + 1); // day AFTER the break
  } else if (habit.cleanSinceDate) {
    start = new Date(habit.cleanSinceDate + 'T12:00:00');
  } else {
    const origin = habit.createdDate || '2025-01-01';
    start = new Date(origin + 'T12:00:00');
  }
  return Math.max(0, Math.floor((today - start) / 86400000) + 1);
}

// Open a date picker overlay to retroactively set the clean-since date.
function openAvoidDatePicker(habitId) {
  const task = (state.negativos || []).find(t => t.id === habitId);
  if (!task) return;

  document.getElementById('avoidDatePickerOverlay')?.remove();

  const today = todayKey();
  const current = (!task.lastBreakDate && task.cleanSinceDate) ? task.cleanSinceDate
                : (!task.lastBreakDate ? (task.createdDate || today) : null);

  const ov = document.createElement('div'); ov.id = 'avoidDatePickerOverlay';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(4,17,29,0.82);z-index:9000;display:flex;align-items:center;justify-content:center;padding:20px;';

  const box = document.createElement('div');
  box.style.cssText = 'background:#04111d;border:1px solid rgba(239,83,80,0.45);border-radius:6px;padding:22px 24px;max-width:320px;width:100%;display:flex;flex-direction:column;gap:14px;box-shadow:0 0 32px rgba(239,83,80,0.2);';

  const ttl = document.createElement('div');
  ttl.style.cssText = 'font-family:Cinzel,serif;font-size:11px;letter-spacing:2px;color:#ef9a9a;';
  ttl.textContent = '⟦ LIMPIO DESDE ⟧';

  const sub = document.createElement('div');
  sub.style.cssText = 'font-size:11px;color:rgba(255,255,255,0.4);line-height:1.5;';
  sub.textContent = 'Elegí la fecha desde la que mantuviste la racha. Solo aplica si no hubo recaídas desde entonces.';

  const inp = document.createElement('input'); inp.type = 'date';
  inp.value = current || today;
  inp.max   = today;
  inp.style.cssText = 'background:#000a14;border:1px solid rgba(239,83,80,0.35);color:#ef9a9a;font-family:Cinzel,serif;font-size:13px;padding:8px 10px;border-radius:4px;width:100%;box-sizing:border-box;';

  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancelar';
  cancelBtn.style.cssText = 'font-family:Cinzel,serif;font-size:9px;letter-spacing:1px;padding:7px 14px;border-radius:3px;cursor:pointer;background:transparent;border:1px solid rgba(77,208,225,0.25);color:rgba(255,255,255,0.4);';
  cancelBtn.onclick = () => ov.remove();

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = '✓ APLICAR';
  confirmBtn.style.cssText = 'font-family:Cinzel,serif;font-size:9px;letter-spacing:1.5px;padding:7px 14px;border-radius:3px;cursor:pointer;background:rgba(239,83,80,0.12);border:1px solid rgba(239,83,80,0.5);color:#ef9a9a;';
  confirmBtn.onclick = () => {
    const picked = inp.value;
    if (!picked || picked > today) return;
    task.cleanSinceDate = picked;
    saveState();
    ov.remove();
    renderAll();
    checkAvoidMilestones();
    const streak = getAvoidStreak(task);
    showNotif(`🛡️ Racha ajustada · ${streak} día${streak !== 1 ? 's' : ''} limpio`);
  };

  btnRow.appendChild(cancelBtn); btnRow.appendChild(confirmBtn);
  box.appendChild(ttl); box.appendChild(sub); box.appendChild(inp); box.appendChild(btnRow);
  ov.appendChild(box);
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
  document.body.appendChild(ov);
  setTimeout(() => inp.focus(), 80);
}

// Award milestone rewards that haven't been given yet.
// Milestones are lifetime — awarded once even if the streak later resets.
function checkAvoidMilestones() {
  (state.negativos || []).forEach(habit => {
    if (!habit.milestones || !habit.milestones.length) return;
    if (!habit.awardedMilestones) habit.awardedMilestones = {};
    const streak = getAvoidStreak(habit);
    habit.milestones.forEach(ms => {
      if (streak >= ms.days && !habit.awardedMilestones[ms.days]) {
        habit.awardedMilestones[ms.days] = true;
        const prevLv = calcLevel(state.totalXp).level;
        const _pt = {}; STAT_KEYS.forEach(k => { _pt[k] = tierFor(state.stats[k]).tier; });
        state.totalXp += ms.xp;
        const _ag = applyGainsWithClass(ms.gains);
        saveState();
        if (calcLevel(state.totalXp).level > prevLv) afterLevelUp(calcLevel(state.totalXp).level);
        else checkStatRankUps(_ag, _pt);
        setTimeout(() => {
          showNotif(`🛡️ ${ms.icon} ${ms.label} · +${ms.xp} EXP · ${_gainsStr(_ag, ms.gains)}`);
        }, 600);
      }
    });
  });
}

function toggleNegativo(id, periodKey) {
  const task=(state.negativos||[]).find(t=>t.id===id); if(!task) return;
  const wasFailed = task.lastBreakDate === periodKey;
  tickHpMp();
  const maxHP=calcMaxHP();
  if(wasFailed){
    // Undo the relapse
    state.hp=Math.min(maxHP,(state.hp||maxHP)+(task.hp||30));
    delete task.done[periodKey];
    // Restore lastBreakDate to previous break (scan done history)
    const breaks = Object.keys(task.done||{}).sort();
    task.lastBreakDate = breaks.length > 0 ? breaks[breaks.length-1] : null;
  } else {
    // Record relapse — clear manual start date, new streak begins from tomorrow
    state.hp=Math.max(0,(state.hp||maxHP)-(task.hp||30));
    task.done[periodKey]=true;
    task.lastBreakDate = periodKey;
    task.cleanSinceDate = null;
    if(navigator.vibrate) navigator.vibrate([30,50,30]);
    showNegFloat(task.hp||30);
  }
  saveState(); renderAll();
}

function showXpFloat(xp, gains) {
  const el=document.createElement('div'); el.className='xp-float';
  const lv=calcLevel(state.totalXp);
  const pct = lv.neededForNext > 0 ? (xp / lv.neededForNext * 100) : 0;
  const pctStr = pct > 0 ? ` <span class="xp-float-pct">(${pct < 0.1 ? '<0.1' : pct.toFixed(1)}%)</span>` : '';
  const xpLine=document.createElement('div'); xpLine.className='xp-float-xp'; xpLine.innerHTML=`+${xp} EXP${pctStr}`;
  el.appendChild(xpLine);
  const gs=Object.entries(gains||{}).filter(([,v])=>v>0);
  if(gs.length){
    const gl=document.createElement('div'); gl.className='xp-float-gains';
    gs.forEach(([k,v])=>{ const c=document.createElement('span'); c.className=`xp-float-chip xf-${k}`; c.textContent=`${k}+${v}`; gl.appendChild(c); });
    el.appendChild(gl);
  }
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),1400);
}

function toggleQuest(listKey, periodKey, id) {
  const task=state[listKey].find(t=>t.id===id); if(!task) return;
  const wasDone=!!task.done[periodKey];
  if (wasDone) {
    const c=getCompletion(task,periodKey); if(c){ applyGains(c.gains,-1); state.totalXp=Math.max(0,state.totalXp-(c.xp||0)); state.col=Math.max(0,state.col-(c.xp||0)); }
    delete task.done[periodKey];
  } else {
    const prevLv=calcLevel(state.totalXp).level;
    const _pt={}; STAT_KEYS.forEach(k=>{_pt[k]=tierFor(state.stats[k]).tier;});
    state.totalXp+=(task.xp||0); state.col+=(task.xp||0);
    const _ag=applyGainsWithClass(task.gains);
    const isFirst = listKey==='habitos' && state.habitos.filter(t=>!!t.done[periodKey]).length===0;
    task.done[periodKey]={gains:_ag,xp:task.xp};
    const newLv=calcLevel(state.totalXp).level;
    if(isFirst) { setTimeout(()=>showFirstHabitOverlay(), 320); }
    else { playSwordSlash(); if(navigator.vibrate) navigator.vibrate(40); }
    showNotif(`+${task.xp} EXP · ${_gainsStr(_ag,task.gains)}`);
    showXpFloat(task.xp, _ag);
    if(newLv>prevLv) afterLevelUp(newLv);
    else checkStatRankUps(_ag,_pt);
    checkAllDone(listKey,periodKey);
    if(listKey!=='trabajo'){ const fs=getHabitStreak(task); if(fs>0&&fs%7===0){ triggerStreak7Flash(task.id); showNotif(fs%15===0?`🔥 ${fs} days in a row! GOLDEN MILESTONE`:`🔥 ${fs}-day streak!`); }}
    checkAchievements();
    checkAndShowClassUnlocks();
  }
  openTierFor=null; saveState(); renderAll();
}

function completeTiered(listKey, periodKey, id, tier) {
  const task=state[listKey].find(t=>t.id===id); if(!task||task.done[periodKey]) return;
  const prevLv=calcLevel(state.totalXp).level;
  const _pt={}; STAT_KEYS.forEach(k=>{_pt[k]=tierFor(state.stats[k]).tier;});
  state.totalXp+=tier.xp;
  const _ag=applyGainsWithClass(tier.gains);
  const isFirstT = listKey==='habitos' && state.habitos.filter(t=>!!t.done[periodKey]).length===0;
  task.done[periodKey]={tierId:tier.id,label:tier.label,gains:_ag,xp:tier.xp};
  const hpmp2=gainHpMpFromHabit(tier.gains);
  const newLv=calcLevel(state.totalXp).level;
  if(isFirstT) { setTimeout(()=>showFirstHabitOverlay(), 320); }
  else if(tier.elite) { setTimeout(()=>showEliteCompleteOverlay(task, tier, _ag), 280); }
  else { playSwordSlash(); if(navigator.vibrate) navigator.vibrate(40); }
  const _hpmpStr2=[hpmp2.hp>0?`❤+${hpmp2.hp}`:'',hpmp2.mp>0?`💧+${hpmp2.mp}`:''].filter(Boolean).join(' ');
  if(!tier.elite) showNotif(`${tier.label} · +${tier.xp} EXP · ${_gainsStr(_ag,tier.gains)}${_hpmpStr2?' · '+_hpmpStr2:''}`);
  showXpFloat(tier.xp, _ag);
  if(newLv>prevLv) afterLevelUp(newLv);
  else checkStatRankUps(_ag,_pt);
  checkAllDone(listKey,periodKey);
  if(listKey!=='trabajo'){ const fs=getHabitStreak(task); if(fs>0&&fs%7===0){ triggerStreak7Flash(task.id); showNotif(fs%15===0?`🔥 ${fs} days in a row! GOLDEN MILESTONE`:`🔥 ${fs}-day streak!`); }}
  checkAchievements();
  checkAndShowClassUnlocks();
  openTierFor=null; saveState(); renderAll();
}

function showEliteCompleteOverlay(task, tier, gains) {
  playTierComplete();
  if (navigator.vibrate) navigator.vibrate([40, 60, 120, 60, 40]);

  const eqId  = state.classData && state.classData.equipped;
  const cls   = eqId ? CLASSES[eqId] : null;
  const isSyn = cls && Object.keys(task.gains || {}).some(k => cls.stats.includes(k));
  const accentColor = isSyn ? cls.color : '#ffd700';
  const accentGlow  = isSyn ? cls.color : '#ffd700';

  const gainsHtml = Object.entries(gains || {})
    .filter(([,v]) => v > 0)
    .map(([k,v]) => `<span class="ec-gain-chip gain-${k}">${k}+${fmtStat(v)}</span>`)
    .join('');

  const ov = document.createElement('div'); ov.className = 'elite-complete-overlay';
  ov.style.setProperty('--ec-accent', accentColor);
  ov.style.setProperty('--ec-glow',   accentGlow + '50');

  ov.innerHTML = `
    <div class="ec-inner">
      <div class="ec-scan"></div>
      <div class="ec-eyebrow">⟦ ELITE CLEARED ⟧</div>
      <div class="ec-stars">★ ★ ★</div>
      <div class="ec-label">${tier.label.toUpperCase()}</div>
      <div class="ec-gains">${gainsHtml}</div>
      <div class="ec-xp">+${tier.xp} EXP</div>
      <div class="ec-tap">TAP TO CONTINUE</div>
    </div>`;

  document.body.appendChild(ov);
  const dismiss = () => {
    if (ov._dismissed) return; ov._dismissed = true;
    ov.classList.add('ec-leaving');
    setTimeout(() => ov.remove(), 380);
  };
  ov.addEventListener('click', dismiss);
  setTimeout(dismiss, 2600);
}

function showFirstHabitOverlay() {
  playFirstHabit();
  if (navigator.vibrate) navigator.vibrate([30, 60, 100]);
  const el = document.createElement('div');
  el.className = 'first-habit-overlay';
  el.innerHTML = `
    <div class="fh-scan"></div>
    <div class="fh-glow-ring"><span class="fh-ring-icon">⚔️</span></div>
    <div class="fh-eyebrow">⟦ SYSTEM ⟧</div>
    <div class="fh-title">FIRST HABIT<br>OF THE DAY</div>
    <div class="fh-line"></div>
    <div class="fh-sub">LET'S START</div>
    <div class="fh-tap">TAP TO CONTINUE</div>
  `;
  document.body.appendChild(el);
  const dismiss = () => { el.classList.add('leaving'); setTimeout(() => el.remove(), 460); };
  el.addEventListener('click', dismiss);
  setTimeout(dismiss, 2800);
}

function showPerfectDayOverlay() {
  if (navigator.vibrate) navigator.vibrate([40, 80, 40, 80, 160]);
  const el = document.createElement('div');
  el.className = 'perfect-day-overlay';
  const stars = Array.from({length: 14}, () => {
    const left  = (Math.random() * 86 + 5).toFixed(1);
    const top   = (Math.random() * 60 + 15).toFixed(1);
    const delay = (Math.random() * 1.8).toFixed(2);
    const dur   = (1.4 + Math.random() * 1.2).toFixed(2);
    const size  = Math.random() > 0.5 ? '✦' : '★';
    return `<span class="pd-star" style="left:${left}%;top:${top}%;font-size:${10+Math.random()*10|0}px;animation-delay:${delay}s;animation-duration:${dur}s">${size}</span>`;
  }).join('');
  el.innerHTML = `
    <div class="pd-bg-glow"></div>
    <div class="pd-scan"></div>
    <div class="pd-stars">${stars}</div>
    <div class="pd-crown">👑</div>
    <div class="pd-eyebrow">⟦ ACHIEVEMENT ⟧</div>
    <div class="pd-title">PERFECT<br>DAY</div>
    <div class="pd-divider"></div>
    <div class="pd-sub">ALL DAILY QUESTS CLEARED<br>STREAK PROTECTED</div>
    <div class="pd-bonus">✦ BONUS GOLD AWARDED ✦</div>
    <div class="pd-tap">TAP TO CONTINUE</div>
  `;
  document.body.appendChild(el);
  // bonus gold
  state.col = (state.col || 0) + 50;
  saveState();
  const dismiss = () => { el.classList.add('leaving'); setTimeout(() => el.remove(), 620); };
  el.addEventListener('click', dismiss);
  setTimeout(dismiss, 4000);
}

function showTierUpBanner(statKey, oldTier, newTier) {
  const color = TIER_COLORS[newTier] || '#ffd700';
  const el = document.createElement('div');
  el.className = 'tierup-banner';
  el.style.setProperty('--tu-color', color);
  el.innerHTML = `
    <div class="tierup-label">TIER UP</div>
    <div class="tierup-stat">${STAT_EMOJI[statKey] || ''} ${STAT_NAMES[statKey] || statKey}</div>
    <div class="tierup-tiers">
      <span class="tierup-old">${oldTier}</span>
      <span class="tierup-arrow">▶</span>
      <span class="tierup-new">${newTier}</span>
    </div>`;
  document.body.appendChild(el);
  const dismiss = () => { el.classList.add('leaving'); setTimeout(() => el.remove(), 360); };
  el.addEventListener('click', dismiss);
  setTimeout(dismiss, 3400);
}

function checkAndShowClassUnlocks(delayMs) {
  const notified = state.classData.notifiedUnlocks || {};
  const newlyUnlocked = getAvailableClasses(state).filter(id => !notified[id]);
  if (!newlyUnlocked.length) return;
  newlyUnlocked.forEach(id => { notified[id] = true; });
  state.classData.notifiedUnlocks = notified;
  saveState();
  setTimeout(() => showClassUnlockOverlay(newlyUnlocked), delayMs || 2000);
}

function showClassUnlockOverlay(classIds) {
  if (navigator.vibrate) navigator.vibrate([30, 50, 80, 50, 120]);
  playClassUnlock();
  const isMulti = classIds.length > 1;
  const firstCls = CLASSES[classIds[0]];
  const color = isMulti ? 'var(--sao-cyan)' : (firstCls.color || 'var(--sao-cyan)');
  const glowRgb = isMulti ? '77,208,225' : _hexToRgb(firstCls.color || '#4dd0e1');
  const tierLabel = (id) => (TIER_NAMES[CLASSES[id].tier] || '');

  const el = document.createElement('div');
  el.className = 'class-unlock-overlay';
  el.style.setProperty('--cu-color', color);
  el.style.setProperty('--cu-glow', `rgba(${glowRgb},0.09)`);
  el.style.setProperty('--cu-glow-str', `rgba(${glowRgb},0.5)`);

  let bodyHtml;
  if (!isMulti) {
    const cls = firstCls;
    const statsStr = cls.stats.map(s => (STAT_EMOJI[s] || '') + ' ' + (STAT_NAMES[s] || s)).join('  ·  ');
    const tierIcon = { 1:'⚔️', 2:'🔱', 3:'🌟', 4:'👑', 5:'✦' }[cls.tier] || '⚔️';
    bodyHtml = `
      <div class="cu-ring"><span class="cu-ring-icon">${tierIcon}</span></div>
      <div class="cu-tier-badge">TIER ${cls.tier} · ${tierLabel(cls.id)}</div>
      <div class="cu-class-name">${cls.name}</div>
      <div class="cu-class-stats">${statsStr}</div>`;
  } else {
    const items = classIds.map((id, i) => {
      const cls = CLASSES[id];
      const statsStr = cls.stats.map(s => STAT_EMOJI[s] || '').join('');
      const tierIcon = { 1:'⚔️', 2:'🔱', 3:'🌟', 4:'👑', 5:'✦' }[cls.tier] || '⚔️';
      return `<div class="cu-multi-item">
        <span class="cu-multi-icon">${tierIcon}</span>
        <span class="cu-multi-name">${cls.name}</span>
        <span class="cu-multi-tier">${tierLabel(id)}</span>
        <span class="cu-multi-stats">${statsStr}</span>
      </div>`;
    }).join('');
    bodyHtml = `<div class="cu-multi-list">${items}</div>`;
  }

  el.innerHTML = `
    <div class="cu-bg-glow"></div>
    <div class="cu-scan"></div>
    <div class="cu-eyebrow">⟦ ${isMulti ? 'CLASSES UNLOCKED' : 'CLASS UNLOCKED'} ⟧</div>
    <div class="cu-title">${isMulti ? classIds.length + ' NEW CLASSES AVAILABLE' : 'NEW CLASS AVAILABLE'}</div>
    ${bodyHtml}
    <div class="cu-divider"></div>
    <div class="cu-sub">VISIT THE CLASS PANEL<br>TO EQUIP YOUR NEW CLASS</div>
    <div class="cu-tap">TAP TO CONTINUE</div>
  `;
  document.body.appendChild(el);
  const dismiss = () => { el.classList.add('leaving'); setTimeout(() => el.remove(), 500); };
  el.addEventListener('click', dismiss);
  setTimeout(dismiss, 5000);
}

function _hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

function checkStatRankUps(gains, prevTiers) {
  const ups = STAT_KEYS.filter(k => (gains||{})[k] && tierFor(state.stats[k]).tier !== prevTiers[k]);
  if (!ups.length) return;
  setTimeout(() => {
    playStatRankUp();
    ups.forEach((k, i) => setTimeout(() => showTierUpBanner(k, prevTiers[k], tierFor(state.stats[k]).tier), i * 900));
  }, 500);
}

function calcCombatSnapshot() {
  const lv=calcLevel(state.totalXp), eq=getEquippedStats();
  const STR=getEffectiveStat('STR',state)+(eq.STR||0), DEX=getEffectiveStat('DEX',state)+(eq.DEX||0), CON=getEffectiveStat('CON',state)+(eq.CON||0);
  const INT=getEffectiveStat('INT',state)+(eq.INT||0), VOL=getEffectiveStat('VOL',state)+(eq.VOL||0), CHA=getEffectiveStat('CHA',state)+(eq.CHA||0);
  return {
    hp:    Math.round(100 + CON*3 + CHA*2 + lv.level*10),
    mp:    Math.round(50  + INT*2 + VOL*2 + CHA + lv.level*3),
    atk:   Math.round(10  + STR*2),
    def:   Math.round(5   + CON),
    crit:  Math.round(Math.min(50, DEX*1.5)*10)/10,
    eva:   Math.round(Math.min(35, DEX*0.4)*10)/10,
    block: Math.round(Math.min(25, CON*0.2)*10)/10,
  };
}

function showLevelUpPopup(lv, bonus, prevStats, prevCombat, newCombat) {
  document.getElementById('lvupOverlay')?.remove();
  const isMilestone = lv===99 || lv%10===0;
  const rank = levelRank(lv);
  const RANK_COLORS = { F:'#9e9e9e',E:'#66bb6a',D:'#42a5f5',C:'#ab47bc',B:'#ffa726',A:'#ef5350',S:'#ffd700',SS:'#00e5ff',SSS:'#ff80ab' };
  const rc = RANK_COLORS[rank]||'#4dd0e1';
  const SCOL = STAT_COLORS;

  const statsHtml = STAT_KEYS.map(k=>`
    <div class="lvup-stat">
      <span class="lvup-stat-key" style="color:${SCOL[k]}">${k}</span>
      <span class="lvup-stat-arrow">+${bonus}</span>
      <span class="lvup-stat-new" style="color:${SCOL[k]}">${(prevStats[k]||0)+bonus}</span>
    </div>`).join('');

  const combatRows = [
    {n:'HP',   p:prevCombat.hp,    q:newCombat.hp,    u:''},
    {n:'MP',   p:prevCombat.mp,    q:newCombat.mp,    u:''},
    {n:'ATK',  p:prevCombat.atk,   q:newCombat.atk,   u:''},
    {n:'DEF',  p:prevCombat.def,   q:newCombat.def,   u:''},
    {n:'CRIT', p:prevCombat.crit,  q:newCombat.crit,  u:'%'},
    {n:'EVA',  p:prevCombat.eva,   q:newCombat.eva,   u:'%'},
    {n:'BLOCK',p:prevCombat.block, q:newCombat.block, u:'%'},
  ].filter(r=>r.p!==r.q);

  const combatHtml = combatRows.map(r=>`
    <div class="lvup-cstat">
      <span class="lvup-cstat-name">${r.n}</span>
      <span class="lvup-cstat-change">${r.p}${r.u} → <strong style="color:#4dd0e1">${r.q}${r.u}</strong></span>
    </div>`).join('');

  const milestoneTag = isMilestone
    ? `<div class="lvup-milestone" style="color:${rc}">${lv===99?'✦ MAXIMUM LEVEL ✦':'⟦ MILESTONE ×'+bonus+' ⟧'}</div>` : '';

  const ol = document.createElement('div');
  ol.id = 'lvupOverlay';
  ol.className = 'lvup-overlay';
  ol.innerHTML = `
    <div class="lvup-panel" style="--lvup-rc:${rc}">
      <div class="lvup-header">
        <div class="lvup-sparkles">✦ ✦ ✦</div>
        <div class="lvup-title">LEVEL UP</div>
        <div class="lvup-level">LV.<span class="lvup-lv-num">${lv}</span></div>
        <div class="lvup-rank-badge" style="border-color:${rc};color:${rc}">RANK ${rank}</div>
        ${milestoneTag}
      </div>
      <div class="lvup-section">
        <div class="lvup-section-label">BASE STATS${isMilestone?' <span class="lvup-x">×'+bonus+'</span>':''}</div>
        <div class="lvup-stats-grid">${statsHtml}</div>
      </div>
      ${combatHtml?`<div class="lvup-section">
        <div class="lvup-section-label">COMBAT RATES</div>
        <div class="lvup-combat-grid">${combatHtml}</div>
      </div>`:''}
      <button class="lvup-btn" onclick="document.getElementById('lvupOverlay').remove();renderAll();">CONTINUE</button>
    </div>`;
  document.body.appendChild(ol);
}

function afterLevelUp(lv) {
  const bonus       = getLevelUpStatBonus(lv);
  const prevStats   = { ...state.stats };
  const prevCombat  = calcCombatSnapshot();
  STAT_KEYS.forEach(k => { state.stats[k] = (state.stats[k]||0) + bonus; });
  state.hp = calcMaxHP();
  state.mp = calcMaxMP();
  saveState();
  const newCombat = calcCombatSnapshot();
  setTimeout(() => {
    playLevelUp();
    document.getElementById('mainPanel').classList.add('level-up');
    setTimeout(() => document.getElementById('mainPanel').classList.remove('level-up'), 2400);
    showLevelUpPopup(lv, bonus, prevStats, prevCombat, newCombat);
  }, 700);
}

function checkAllDone(listKey, periodKey) {
  const list=state[listKey]; if(!list.length) return;
  if(list.every(t=>t.done[periodKey])){
    if(listKey==='habitos'){
      setTimeout(()=>{ playDailyComplete(); }, 1300);
      setTimeout(()=>{ showPerfectDayOverlay(); }, 1800);
    } else {
      const msg=listKey==='weekly'?'⟦ ALL WEEKLY QUESTS CLEARED ⟧':'⟦ ALL MISSIONS CLEARED ⟧';
      setTimeout(()=>{ if(listKey==='weekly') playWeeklyComplete(); else playAllComplete(); showNotif(msg); },1300);
    }
  }
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
  checkAllDone(listKey, periodKey);
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

  if (listKey==='negativos') {
    title.textContent = mode==='edit' ? '⟦ EDIT AVOID HABIT ⟧' : '⟦ NEW AVOID HABIT ⟧';
    const existing = mode==='edit' && habitId ? (state.negativos||[]).find(h=>h.id===habitId) : null;
    renderModalBody(existing);
    _modalSaveHandler = saveHabit;
    modal.classList.add('open');
    setTimeout(()=>{ const ni=document.getElementById('mNameInput'); if(ni) ni.focus(); },100);
    return;
  }

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

  if (modalData.selectedList === 'negativos') {
    const name = existingHabit ? existingHabit.text : '';
    const hp   = existingHabit ? (existingHabit.hp||20) : 20;
    body.innerHTML = `
      <div class="m-field">
        <label class="m-label">HABIT TO AVOID</label>
        <input id="mNameInput" class="m-input" type="text" maxlength="80" placeholder="Ex: Más de 3hs de celular..." value="${name.replace(/"/g,'&quot;')}">
      </div>
      <div class="m-field">
        <label class="m-label">HP PENALTY ON FAIL</label>
        <input id="mHpInput" class="m-input narrow" type="number" min="1" max="100" value="${hp}">
      </div>`;
    return;
  }

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

  if (modalData.selectedList==='negativos') {
    const hp=Math.max(1,parseInt(document.getElementById('mHpInput')?.value)||20);
    if (modalData.mode==='edit' && modalData.editId) {
      const idx=(state.negativos||[]).findIndex(n=>n.id===modalData.editId);
      if(idx>=0){ state.negativos[idx].text=name; state.negativos[idx].hp=hp; }
    } else {
      if(!state.negativos) state.negativos=[];
      state.negativos.push({id:'neg'+Date.now(),text:name,hp,done:{}});
    }
    saveState(); closeModal(); renderAll();
    showNotif('⚠ Avoid habit saved');
    return;
  }

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
  const d=state.dungeon, cfg=DUNGEON_CONFIG[d.difficulty];
  let advanced=false;

  // ── Idle DPS tick (work phase only) ──────────────────────────
  if (d.pomodoroPhase==='work' && cfg) {
    const now=Date.now();
    const lastTick=d.idleLastDmgTick||d.pomodoroPhaseStart;
    const dtSec=Math.min((now-lastTick)/1000, 5);
    d.idleLastDmgTick=now;
    let dmgLeft=getPlayerDPS()*dtSec;
    let safety=200;
    while (dmgLeft>0 && safety-->0) {
      const curHP=d.idleEnemyHP||d.idleEnemyMaxHP||(cfg.enemies[0]?.hp||50);
      if (dmgLeft>=curHP) { dmgLeft-=curHP; defeatIdleEnemy(d,cfg); }
      else { d.idleEnemyHP=curHP-dmgLeft; dmgLeft=0; }
    }
  }

  // ── Pomodoro phase advance ────────────────────────────────────
  let limit=50;
  while (limit-->0) {
    const phaseMs=d.pomodoroPhase==='work'?POMODORO_WORK_MS:POMODORO_BREAK_MS;
    if ((Date.now()-d.pomodoroPhaseStart)<phaseMs) break;
    advanced=true;
    d.pomodoroPhaseStart+=phaseMs;
    if (d.pomodoroPhase==='work') {
      d.pomodoroCount++; d.enemyWave++;
      d.pomodoroPhase='break';
    } else {
      d.pomodoroPhase='work';
      d.idleLastDmgTick=Date.now();
    }
  }

  saveState();
  if (currentTab==='trabajo') { if(advanced) renderTrabajo(); else updateExploreDisplay(); }
}

function updateExploreDisplay() {
  const d=state.dungeon; if (!d) return;
  const prog=getPomodoroProgress(); if (!prog) return;
  const mm=Math.floor(prog.remaining/60000).toString().padStart(2,'0');
  const ss=Math.floor((prog.remaining%60000)/1000).toString().padStart(2,'0');
  const tEl=document.querySelector('.dexp-pomo-timer');
  const pFill=document.querySelector('.dexp-pomo-fill');
  const oFill=document.querySelector('.dexp-overall-fill');
  const oLabel=document.querySelectorAll('.dexp-overall-label span');
  const eHpFill=document.querySelector('.dexp-idle-hpfill');
  const eHpTxt=document.querySelector('.dexp-idle-hptxt');
  const killTxt=document.querySelector('.dexp-kill-count');
  if (tEl) tEl.textContent=`${mm}:${ss}`;
  if (pFill) pFill.style.width=`${Math.min(100,(prog.elapsed/prog.total)*100)}%`;
  const elapsed=getElapsedSeconds(), cfg=DUNGEON_CONFIG[d.difficulty];
  if (cfg) {
    if (oFill) oFill.style.width=`${Math.min(100,(elapsed/3600/cfg.minHours)*100)}%`;
    if (oLabel[1]) { const h=Math.floor(elapsed/3600),m=Math.floor((elapsed%3600)/60); oLabel[1].textContent=`${h}h ${m.toString().padStart(2,'0')}m / ${cfg.minHours}h`; }
    if (eHpFill||eHpTxt) {
      const maxHP=d.idleEnemyMaxHP||(cfg.enemies[0]?.hp||50);
      const curHP=Math.max(0,d.idleEnemyHP||0);
      if (eHpFill) eHpFill.style.width=`${(curHP/maxHP)*100}%`;
      if (eHpTxt) eHpTxt.textContent=`${Math.ceil(curHP)} / ${maxHP}`;
    }
  }
  if (killTxt) killTxt.textContent=`⚔ ${d.idleTotalKills||0}`;
}

// ── Dungeon flow ──────────────────────────────────────────────
function startDungeon(diffId) {
  const now=Date.now(), cfg=DUNGEON_CONFIG[diffId];
  if (!cfg) return;
  state.dungeon={
    difficulty:diffId, phase:'exploring', startTime:now, totalPausedMs:0, pausedAt:null,
    pomodoroPhase:'work', pomodoroPhaseStart:now, pomodoroCount:0, enemyWave:0,
    defeatedEnemies:[], combat:null,
    idleEnemyIndex:0, idleEnemyHP:cfg.enemies[0].hp, idleEnemyMaxHP:cfg.enemies[0].hp,
    idleTotalKills:0, idleLastDmgTick:now,
  };
  selectedDungeonId=null; saveState(); startDungeonTimer(); renderAll();
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
  const playerLevel=calcLevel(state.totalXp).level;
  // Only show dungeons the player has unlocked
  const unlocked=Object.values(DUNGEON_CONFIG).filter(c=>playerLevel>=(c.unlockLevel||1));
  w.innerHTML=`
    <div class="practice-title">⟦ PRACTICE ARENA ⟧</div>
    <div class="practice-sub">Pelea contra bosses directamente — sin XP, sin rewards, solo combate</div>
    <div class="practice-cards">
      ${unlocked.map(c=>`
        <div class="practice-card" style="--pcolor:${c.color};--pglow:${c.glow}">
          <div class="pcard-emoji">${c.boss.emoji}</div>
          <div class="pcard-diff">${c.rank}</div>
          <div class="pcard-name">${c.boss.name}</div>
          <div class="pcard-hp">💀 ${c.boss.hp} HP · ⚔ ${c.boss.atk} ATK</div>
          <button class="pcard-fight" onclick="startPractice('${c.id}')">⚔  PELEAR</button>
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
  const playerLevel=calcLevel(state.totalXp).level;
  const RANKS=['E','D','C','B','A','S'];

  // Title
  const title=document.createElement('div'); title.className='dungeon-select-title'; title.textContent='⟦ DUNGEON EXPLORER ⟧'; w.appendChild(title);
  const sub=document.createElement('div'); sub.className='dungeon-select-sub'; sub.textContent='Seleccioná rango y clase. El progreso es automático mientras trabajás.'; w.appendChild(sub);

  // Rank tabs
  const tabs=document.createElement('div'); tabs.className='dungeon-rank-tabs';
  RANKS.forEach(rank=>{
    const unlocked=playerLevel>=(DUNGEON_RANK_UNLOCK[rank]||1);
    const btn=document.createElement('button');
    btn.className=`dungeon-rank-tab rank-${rank}${selectedDungeonRank===rank?' active':''}${!unlocked?' locked':''}`;
    btn.textContent=rank+(unlocked?'':' 🔒');
    btn.title=unlocked?`Rango ${rank}`:`Desbloquea en nivel ${DUNGEON_RANK_UNLOCK[rank]}`;
    if (unlocked) btn.addEventListener('click',()=>{ selectedDungeonRank=rank; selectedDungeonId=null; renderAll(); });
    tabs.appendChild(btn);
  });
  w.appendChild(tabs);

  // 3-column class grid
  const grid=document.createElement('div'); grid.className='dungeon-class-grid';
  DUNGEON_CLASS_DEFS.forEach(cls=>{
    const col=document.createElement('div'); col.className='dungeon-class-col';
    const hdr=document.createElement('div'); hdr.className='dungeon-class-header';
    hdr.innerHTML=`${cls.emoji} ${cls.label.toUpperCase()}`; col.appendChild(hdr);

    const dungeonId=`${selectedDungeonRank.toLowerCase()}_${cls.key}`;
    const cfg=DUNGEON_CONFIG[dungeonId];
    if (!cfg){ grid.appendChild(col); return; }

    const isUnlocked=playerLevel>=(cfg.unlockLevel||1);
    const isSelected=selectedDungeonId===dungeonId;
    const card=document.createElement('div');
    card.className=`dungeon-class-card${isUnlocked?'':' locked'}${isSelected?' selected':''}`;
    card.style.cssText=`--dcolor:${cfg.color};--dglow:${cfg.glow}`;
    card.innerHTML=`
      <div class="dcc-emoji">${cfg.emoji}</div>
      <div class="dcc-name">${cfg.name}</div>
      <div class="dcc-meta">
        <span class="dcc-stat">+${cfg.rewardStatAmt} ${cfg.rewardStat}</span>
        <span class="dcc-time">⏱ ${cfg.minHours}h</span>
      </div>
      <div class="dcc-rewards">
        <span class="dcc-xp">✨ ${cfg.rewardXP}</span>
        <span class="dcc-col">💰 ${cfg.rewardCol}</span>
      </div>
      ${!isUnlocked?`<div class="dcc-lock-overlay"><span>🔒</span><span>Lv ${cfg.unlockLevel}</span></div>`:''}`;
    if (isUnlocked) card.addEventListener('click',()=>{ selectedDungeonId=(isSelected?null:dungeonId); renderAll(); });
    col.appendChild(card);
    grid.appendChild(col);
  });
  w.appendChild(grid);

  // Enter button
  if (selectedDungeonId) {
    const cfg=DUNGEON_CONFIG[selectedDungeonId];
    const btn=document.createElement('button'); btn.className='dungeon-enter-btn'; btn.style.marginTop='10px';
    btn.textContent=`⚔  ENTRAR — ${cfg.name.toUpperCase()}`;
    btn.addEventListener('click',()=>startDungeon(selectedDungeonId));
    w.appendChild(btn);
  }
  return w;
}

function renderDungeonExplore() {
  const d=state.dungeon, cfg=DUNGEON_CONFIG[d.difficulty];
  if (!cfg) { abandonDungeon(); return document.createElement('div'); }
  const prog=getPomodoroProgress(), elapsed=getElapsedSeconds();
  const isComplete=elapsed/3600>=cfg.minHours, isPaused=!!d.pausedAt;
  const isBreak=d.pomodoroPhase==='break';
  const pomoRem=prog?prog.remaining:0, pomoPct=prog?(prog.elapsed/prog.total):0;
  const mm=Math.floor(pomoRem/60000).toString().padStart(2,'0');
  const ss=Math.floor((pomoRem%60000)/1000).toString().padStart(2,'0');
  const h=Math.floor(elapsed/3600), m=Math.floor((elapsed%3600)/60);
  const enemy=cfg.enemies[(d.idleEnemyIndex||0)%cfg.enemies.length];
  const enemyHP=Math.max(0,d.idleEnemyHP??enemy.hp);
  const enemyMaxHP=d.idleEnemyMaxHP||enemy.hp;
  const hpPct=Math.max(0,(enemyHP/enemyMaxHP)*100);
  const dps=getPlayerDPS();
  const kills=d.idleTotalKills||0;
  const pomoDots=Array.from({length:d.pomodoroCount},()=>'⚔').join('');
  const w=document.createElement('div');
  w.className='dungeon-explore';
  w.style.cssText=`--dcolor:${cfg.color};--dglow:${cfg.glow};--dbg:${cfg.bgColor}`;
  w.innerHTML=`
    <div class="dexp-header">
      <div class="dexp-title">${cfg.emoji} ${cfg.name}</div>
      <div style="display:flex;gap:6px;align-items:center">
        <span class="dexp-kill-count">⚔ ${kills}</span>
        <div class="dexp-diff-badge">${cfg.rank}</div>
      </div>
    </div>
    <div class="dexp-overall">
      <div class="dexp-overall-label"><span>PROGRESO DEL DUNGEON</span><span>${h}h ${m.toString().padStart(2,'0')}m / ${cfg.minHours}h</span></div>
      <div class="dexp-overall-track"><div class="dexp-overall-fill" style="width:${Math.min(100,(elapsed/3600/cfg.minHours)*100)}%"></div></div>
    </div>
    <div class="dexp-scene">
      <div class="dexp-bg ${isPaused?'paused':''}">
        <div class="dexp-layer dexp-layer-far"></div>
        <div class="dexp-layer dexp-layer-mid"></div>
        <div class="dexp-layer dexp-layer-near"></div>
      </div>
      <div class="dexp-hero ${isPaused||isBreak?'':'running'}">🗡️</div>
      <div class="dexp-vs">VS</div>
      <div class="dexp-enemy ${isPaused||isBreak?'paused':''}">${enemy.emoji}</div>
    </div>
    <div class="dexp-idle-combat ${isBreak?'break-mode':''}">
      <div class="dexp-idle-enemy">
        <div class="dexp-idle-info">
          <div class="dexp-idle-name">
            <span>${enemy.name} <span class="dexp-floor-num">#${kills+1}</span></span>
            <span class="dexp-idle-dps">⚡ ${dps} DPS${isBreak?' — descansando':''}</span>
          </div>
          <div class="dexp-idle-hpbar"><div class="dexp-idle-hpfill" style="width:${hpPct}%;transition:width ${isBreak?'0':'0.9'}s ease"></div></div>
          <div class="dexp-idle-hptxt">${Math.ceil(enemyHP)} / ${enemyMaxHP} HP</div>
        </div>
      </div>
    </div>
    <div class="dexp-pomo-section">
      <div class="dexp-pomo-phase ${isBreak?'break-phase':''}">${isBreak?'☕  BREAK TIME':'⚔  WORK SESSION'}</div>
      <div class="dexp-pomo-timer ${isPaused?'paused':''}">${mm}:${ss}</div>
      <div class="dexp-pomo-track"><div class="dexp-pomo-fill ${isBreak?'break-fill':''}" style="width:${pomoPct*100}%"></div></div>
      <div class="dexp-pomo-count">${pomoDots||'—'} <span style="opacity:0.45">(${d.pomodoroCount} pomodoro${d.pomodoroCount!==1?'s':''} completo${d.pomodoroCount!==1?'s':''})</span></div>
    </div>
    <div class="dexp-actions">
      ${isPaused?`<button class="dexp-btn dexp-btn-primary" onclick="resumeDungeon()">▶  REANUDAR</button>`:`<button class="dexp-btn dexp-btn-pause" onclick="pauseDungeon()">⏸  PAUSAR</button>`}
      ${isComplete?`<button class="dexp-btn dexp-btn-exit" onclick="exitDungeon()">🏆  SALIR Y COBRAR</button><button class="dexp-btn dexp-btn-boss" onclick="challengeBoss()">💀  PELEAR BOSS</button>`:''}
      <button class="dexp-btn dexp-btn-abandon" onclick="if(confirm('¿Abandonar el dungeon? Se perderá todo el progreso.'))abandonDungeon()">✗  ABANDONAR</button>
    </div>
    ${isComplete?`<div class="dexp-complete-badge">⟦ TIEMPO MÍNIMO ALCANZADO — EL BOSS TE ESPERA ⟧</div>`:''}`;
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

// ============================================================
// WEEKLY REPORT
// ============================================================
function getWeekDates(weekKey) {
  const [yearStr, wStr] = weekKey.split('-W');
  const year = parseInt(yearStr), week = parseInt(wStr);
  const jan4 = new Date(year, 0, 4);
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7) + (week - 1) * 7);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    dates.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
  }
  return dates;
}

function prevWeekKey(weekKey) {
  const dates = getWeekDates(weekKey);
  const mon = new Date(dates[0] + 'T12:00:00');
  mon.setDate(mon.getDate() - 7);
  return isoWeekKey(mon);
}

function getWeekStats(weekKey) {
  const dates = getWeekDates(weekKey);
  const perHabit = {};
  let xp = 0;
  const statGains = {}; STAT_KEYS.forEach(k => statGains[k] = 0);
  let bestDayCount = 0, bestDay = null, perfectDays = 0;
  state.habitos.forEach(h => {
    let count = 0;
    dates.forEach(d => { if (h.done[d]) count++; });
    perHabit[h.id] = { text: h.text, count };
  });
  dates.forEach(date => {
    let dayXp = 0, dayCount = 0;
    state.habitos.forEach(h => {
      const c = getCompletion(h, date);
      if (c) { dayCount++; dayXp += c.xp || 0; STAT_KEYS.forEach(k => { statGains[k] += (c.gains||{})[k] || 0; }); }
    });
    xp += dayXp;
    if (state.habitos.length > 0 && dayCount === state.habitos.length) perfectDays++;
    if (dayCount > bestDayCount) { bestDayCount = dayCount; bestDay = date; }
  });
  return { dates, perHabit, xp, statGains, perfectDays, bestDay, bestDayCount };
}

function showWeeklyReport() {
  const reportWeek = prevWeekKey(isoWeekKey());
  const thisStats  = getWeekStats(reportWeek);
  const prevStats  = getWeekStats(prevWeekKey(reportWeek));
  const dates = thisStats.dates;
  const DAY_NAMES = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
  const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

  const [y,m,d] = dates[0].split('-'), [,m2,d2] = dates[6].split('-');
  const weekLabel = `${MONTHS[parseInt(m)-1]} ${parseInt(d)} – ${MONTHS[parseInt(m2)-1]} ${parseInt(d2)}, ${y}`;
  const [,wNum] = reportWeek.split('-W');

  const perH   = Object.values(thisStats.perHabit);
  const sorted = [...perH].sort((a,b) => b.count - a.count);
  const mostDone  = sorted[0];
  const leastDone = sorted.filter(h => h.count < 7).pop() || sorted[sorted.length-1];

  const totalDone = perH.reduce((s,h) => s+h.count, 0);
  const totalPossible = perH.length * 7;
  const totalPct = totalPossible > 0 ? Math.round((totalDone/totalPossible)*100) : 0;

  const prevTotalDone = Object.values(prevStats.perHabit).reduce((s,h) => s+h.count, 0);
  const habitVarPct = prevTotalDone > 0 ? Math.round(((totalDone-prevTotalDone)/prevTotalDone)*100) : (totalDone>0?100:0);

  const xpDiff = thisStats.xp - prevStats.xp;
  const xpPct  = prevStats.xp > 0 ? Math.round((xpDiff/prevStats.xp)*100) : (thisStats.xp>0?100:0);

  const topStatKey = STAT_KEYS.reduce((best,k) => thisStats.statGains[k] > thisStats.statGains[best] ? k : best, STAT_KEYS[0]);

  const bestDayIdx  = thisStats.bestDay ? dates.indexOf(thisStats.bestDay) : -1;
  const bestDayName = bestDayIdx >= 0 ? DAY_NAMES[bestDayIdx] : '—';

  const isLevelUpWeek = xpDiff > 0 && xpPct >= 20 && prevStats.xp > 0;
  const perfLabel = thisStats.perfectDays===7 ? '🏆 FLAWLESS WEEK' : thisStats.perfectDays>=5 ? '⭐ EXCELLENT' : thisStats.perfectDays>=3 ? '✓ SOLID' : 'keep going';

  if (soundEnabled) playDailyComplete();

  const ov = document.createElement('div');
  ov.className = 'weekly-report-overlay';
  ov.innerHTML = `
    <div class="wr-inner">
      <div class="wr-badge">⟦ WEEKLY REPORT ⟧</div>
      <div class="wr-week">WEEK ${wNum} · ${weekLabel}</div>
      ${isLevelUpWeek ? '<div class="wr-levelup-banner">⚡ LEVEL UP WEEK ⚡</div>' : ''}
      <div class="wr-grid">
        <div class="wr-card wr-card-main">
          <div class="wr-card-label">OVERALL COMPLETION</div>
          <div class="wr-card-value">${totalPct}%</div>
          <div class="wr-card-sub">${totalDone} / ${totalPossible} habits · <span class="${habitVarPct>=0?'wr-up':'wr-down'}">${habitVarPct>=0?'▲':'▼'} ${Math.abs(habitVarPct)}% vs prev week</span></div>
        </div>
        <div class="wr-card">
          <div class="wr-card-label">XP EARNED</div>
          <div class="wr-card-value" style="font-size:22px">${thisStats.xp}</div>
          <div class="wr-card-sub"><span class="${xpDiff>=0?'wr-up':'wr-down'}">${xpDiff>=0?'▲':'▼'} ${Math.abs(xpPct)}%</span> vs prev</div>
        </div>
        <div class="wr-card">
          <div class="wr-card-label">PERFECT DAYS</div>
          <div class="wr-card-value" style="font-size:22px">${thisStats.perfectDays}<span style="font-size:13px;opacity:0.4"> /7</span></div>
          <div class="wr-card-sub">${perfLabel}</div>
        </div>
        <div class="wr-card">
          <div class="wr-card-label">TOP STAT GAIN</div>
          <div class="wr-card-value" style="font-size:18px">${STAT_EMOJI[topStatKey]} ${topStatKey}</div>
          <div class="wr-card-sub">+${thisStats.statGains[topStatKey]} pts</div>
        </div>
        <div class="wr-card">
          <div class="wr-card-label">BEST DAY</div>
          <div class="wr-card-value" style="font-size:22px">${bestDayName}</div>
          <div class="wr-card-sub">${thisStats.bestDayCount} habits done</div>
        </div>
        <div class="wr-card">
          <div class="wr-card-label">STREAK</div>
          <div class="wr-card-value" style="font-size:22px">${state.streak}</div>
          <div class="wr-card-sub">days active 🔥</div>
        </div>
      </div>
      <div class="wr-section-title">⟦ HABIT BREAKDOWN ⟧</div>
      <div class="wr-habits">
        ${sorted.map(h => `<div class="wr-habit-row">
          <div class="wr-habit-name">${h.text}</div>
          <div class="wr-habit-bar-wrap"><div class="wr-habit-bar" style="width:${Math.round((h.count/7)*100)}%"></div></div>
          <div class="wr-habit-count">${h.count}/7</div>
        </div>`).join('')}
      </div>
      ${mostDone ? `<div class="wr-highlights">
        <div class="wr-highlight best">🏆 Most consistent: <strong>${mostDone.text.split(' ').slice(0,5).join(' ')}</strong> — ${mostDone.count}/7 days</div>
        ${leastDone && leastDone.text!==mostDone.text ? `<div class="wr-highlight worst">⚡ Room to grow: <strong>${leastDone.text.split(' ').slice(0,5).join(' ')}</strong> — ${leastDone.count}/7 days</div>` : ''}
      </div>` : ''}
      <button class="wr-dismiss-btn" onclick="const ov=this.closest('.weekly-report-overlay');ov.style.animation='masteryFadeOut 0.4s ease forwards';setTimeout(()=>ov.remove(),400)">⟦ CLOSE REPORT ⟧</button>
    </div>`;
  document.body.appendChild(ov);
  setTimeout(() => {
    if (ov.isConnected) { ov.style.animation='masteryFadeOut 0.4s ease forwards'; setTimeout(()=>ov.remove(),400); }
  }, 60000);
}

// INIT
setDateLabel();
updateStreakOnLoad();
tickMasteryOnLoad();
checkAchievements();
tickHpMp();
saveState();
renderAll();
if (_pendingAnims.length) setTimeout(() => { const fn = _pendingAnims.shift(); if (fn) fn(); }, 600);
initAvatar();
setInterval(()=>{ tickHpMp(); renderHeader(); saveState(); }, 60000);
// Restore dungeon timers if app was refreshed mid-session
if (state.dungeon?.phase==='exploring' && !state.dungeon.pausedAt) startDungeonTimer();
if (state.dungeon?.phase==='boss_fight' && state.dungeon.combat && !state.dungeon.combat.outcome) startCombatTimer();
