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
const CLASS_MASTERY_REWARD = { 1:25, 2:40, 3:60, 4:100, 5:999 };
// XP bonus awarded alongside the stat reward on mastery
const CLASS_MASTERY_XP = { 1:250, 2:800, 3:1800, 4:4000, 5:99999 };

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

// ── Mastery point thresholds (replaces masteryDays for completion check) ────
// Mastery points = total class-stat gains accumulated while class is equipped
// + bonus MP from class quest completions.
// Estimated completion with active questing:
//   T1 ~2wk · T2 ~3-4wk · T3 ~5-6wk · T4 ~7-9wk · T5 ~12-14wk
const CLASS_MASTERY_THRESHOLD = {
  knight:100,  rogue:100,  guardian:100,  mage:100,  monk:100,  bard:100,
  paladin:250, duelist:250, sentinel:250, archmage:250, crusader:250, enchanter:250,
  templar:500, assassin:500, iron_warden:500, loremaster:500, warlord:500, herald:500,
  godslayer:1000, void_hunter:1000, colossus:1000, arcane_sovereign:1000, iron_saint:1000, divine_prophet:1000,
  true_hero:10000,
};

// Bonus mastery point rewards per quest type, by class tier
const CQ_MP = {
  1:{ daily:5,  weekly:25,  onetime:50   },
  2:{ daily:10, weekly:50,  onetime:100  },
  3:{ daily:15, weekly:75,  onetime:150  },
  4:{ daily:20, weekly:150, onetime:300  },
  5:{ daily:50, weekly:900, onetime:5000 },
};

// Completion targets for weekly (sessions this week) and onetime (total sessions)
// When the player logs +1 progress and hits the target, the quest auto-claims.
const CQ_TARGETS = {
  knight:          { weekly:3, onetime:1  }, rogue:          { weekly:4, onetime:1  },
  guardian:        { weekly:3, onetime:1  }, mage:           { weekly:5, onetime:1  },
  monk:            { weekly:4, onetime:1  }, bard:           { weekly:3, onetime:1  },
  paladin:         { weekly:3, onetime:1  }, duelist:        { weekly:4, onetime:1  },
  sentinel:        { weekly:3, onetime:1  }, archmage:       { weekly:5, onetime:1  },
  crusader:        { weekly:4, onetime:1  }, enchanter:      { weekly:3, onetime:1  },
  templar:         { weekly:4, onetime:7  }, assassin:       { weekly:4, onetime:1  },
  iron_warden:     { weekly:3, onetime:1  }, loremaster:     { weekly:4, onetime:1  },
  warlord:         { weekly:4, onetime:1  }, herald:         { weekly:3, onetime:1  },
  godslayer:       { weekly:5, onetime:30 }, void_hunter:    { weekly:5, onetime:1  },
  colossus:        { weekly:5, onetime:1  }, arcane_sovereign:{ weekly:5, onetime:1 },
  iron_saint:      { weekly:5, onetime:30 }, divine_prophet: { weekly:5, onetime:1  },
  true_hero:       { weekly:6, onetime:60 },
};

// ── Class Quests definition ─────────────────────────────────────────────────
// Each class has 3 quests: daily (resets each day), weekly (resets each week),
// onetime (claimed once forever). All are manual self-report checkoffs.
const CLASS_QUESTS = {
  // ── TIER 1 — NOVICE ──────────────────────────────────────────────────────
  knight: {
    daily:   { title:'Iron Ignition',           desc:'Complete 15 push-ups before your first meal of the day. No warm-up excuses — cold start, every day.', stats:{ STR:3 } },
    weekly:  { title:'The Proving Ground',      desc:'Complete 3 strength-based training sessions this week. Any format counts: gym, bodyweight, sport.', stats:{ STR:12 } },
    onetime: { title:'The First Oath',          desc:'Do a single continuous push-up set to absolute muscular failure. Record your rep count — this is your baseline.', stats:{ STR:20 } },
  },
  rogue: {
    daily:   { title:'Phantom Footwork',        desc:'Spend 5 minutes on a coordination or balance drill: jump rope, single-leg holds, lateral shuffles, or any footwork pattern.', stats:{ DEX:3 } },
    weekly:  { title:'The Precision Circuit',   desc:'Practice any sport, skill, or technique requiring hand-eye coordination or body control at least 4 times this week.', stats:{ DEX:12 } },
    onetime: { title:"Apprentice's Mark",       desc:'Learn a physical trick or technique you\'ve never done before. Execute it successfully 5 times in a row to claim this quest.', stats:{ DEX:20 } },
  },
  guardian: {
    daily:   { title:'Cold Initiation',         desc:'End today\'s shower with 30 seconds of cold water. No ramp — switch directly to cold. Brief, uncomfortable, non-negotiable.', stats:{ CON:3 } },
    weekly:  { title:'Endurance Ledger',         desc:'Complete 3 cardio sessions of at least 20 continuous minutes each this week. Running, cycling, swimming, rowing — any sustained aerobic effort counts.',  stats:{ CON:12 } },
    onetime: { title:'The Unbroken Mile',       desc:'Run (or row, or cycle) for 20 continuous minutes without stopping or walking. Pace is irrelevant — only the unbroken effort counts.', stats:{ CON:20 } },
  },
  mage: {
    daily:   { title:'Arcane Intake',           desc:'Read at least 10 pages of a book or spend 15 minutes actively studying a concept. Audiobooks only count if you take notes.', stats:{ INT:3 } },
    weekly:  { title:'The Knowledge Circuit',   desc:'Log 5 focused learning sessions this week (15 minutes minimum each). Passive consumption doesn\'t count — active engagement only.', stats:{ INT:12 } },
    onetime: { title:'First Tome Sealed',       desc:'Finish one complete book — non-fiction preferred, but any work that genuinely challenged your thinking counts.', stats:{ INT:20 } },
  },
  monk: {
    daily:   { title:'Zero Hour',               desc:'Do not touch your phone or open any app for the first 30 minutes after waking. Use that time for anything analog: stretch, breathe, eat, think.', stats:{ VOL:3 } },
    weekly:  { title:'The Quiet Siege',         desc:'On at least 4 days this week, do not open social media or video platforms before noon. Morning hours are fortified territory.', stats:{ VOL:12 } },
    onetime: { title:'The Iron Fast',           desc:'Spend one full waking day — from the moment you open your eyes to the moment you sleep — with zero social media or entertainment apps.', stats:{ VOL:20 } },
  },
  bard: {
    daily:   { title:'The Open Question',       desc:'Ask one person in your life a genuine question about something meaningful to them — their work, a goal, a feeling. Actually listen to the answer.', stats:{ CHA:3 } },
    weekly:  { title:'Social Cartography',      desc:'Have 3 real conversations this week — voice or face-to-face, not text threads. Each must last at least 10 minutes and go beyond surface small talk.', stats:{ CHA:12 } },
    onetime: { title:'The Stage Debut',         desc:'Speak in front of a group of at least 5 people. A toast, a class comment, a team check-in, a short presentation — anything where your voice carries the room.', stats:{ CHA:20 } },
  },
  // ── TIER 2 — ADEPT ───────────────────────────────────────────────────────
  paladin: {
    daily:   { title:'The Righteous Rep',       desc:'During your strength session today, identify the one set you want to skip — and do it anyway. Log only if you finished without cutting reps, reducing weight mid-set, or checking your phone between sets.', stats:{ STR:4, VOL:3 } },
    weekly:  { title:'Iron Vigil',              desc:'Complete 3 strength sessions this week that were also fully focused: set a clear intention before each one, no phone between sets, no abandoned reps. Body and will must both show up.', stats:{ STR:15, VOL:10 } },
    onetime: { title:'Trial by Burden',         desc:'In a single session, reach genuine muscular failure on at least 2 different exercises without resting more than 90 seconds between sets. Your will carries you past the point your body quit. Document the session.', stats:{ STR:25, VOL:18 } },
  },
  duelist: {
    daily:   { title:'Strike and Flow',         desc:'Train a session combining explosive power and technical precision — martial arts, sport drills, sprint intervals with form work. Power without precision is brawling. Both must be present.', stats:{ DEX:4, STR:3 } },
    weekly:  { title:'The Blade Circuit',       desc:'Complete 4 sessions this week combining explosive strength with precision skill. Each session must tax both your force output and your coordination — not two separate workouts, one compound effort.', stats:{ DEX:12, STR:12 } },
    onetime: { title:'The Gauntlet',            desc:'Design a timed personal circuit of 5+ exercises combining explosive power and technical precision — runnable at home or outdoors. Record your time and performance on Day 1 of holding this class. Train across the mastery period. Run the same circuit again on Day 14+ and beat your opening benchmark. The Duelist needs no opponent. They build their own arena.', stats:{ DEX:20, STR:20 } },
  },
  sentinel: {
    daily:   { title:'Loaded March',            desc:'Add physical resistance to your endurance effort today — weighted walk, resistance bands on a run, a circuit mixing cardio and strength without full rest. Endurance under load is the Sentinel\'s domain.', stats:{ CON:4, STR:3 } },
    weekly:  { title:'The Fortress Circuit',    desc:'Complete 3 sessions this week where muscles and lungs both burn simultaneously: rucksack cardio, HIIT with loaded movements, swim intervals, or any format where strength is embedded inside endurance.', stats:{ CON:12, STR:12 } },
    onetime: { title:'The Long Carry',          desc:'Complete 30 continuous minutes of effort demanding both endurance and strength at the same time — no separating them into phases. Rucksack march, loaded circuit, or rowing intervals. No full rest breaks.', stats:{ CON:20, STR:20 } },
  },
  archmage: {
    daily:   { title:'The Deep Work Hour',      desc:'Block 45 uninterrupted minutes of focused study or skill work. Phone face-down, notifications off. Log only if you completed the block without a single distraction break — willpower is what keeps you in the chair.', stats:{ INT:4, VOL:3 } },
    weekly:  { title:'The Sealed Library',      desc:'Complete 5 deep work sessions this week (45 minutes each, zero interruptions). Track your start and end times. Any session where you broke focus does not count toward the total.', stats:{ INT:12, VOL:12 } },
    onetime: { title:'The Grand Thesis',        desc:'Complete a self-directed learning project from start to finish: a course module, a written analysis, a research summary, a technical breakdown. The output must be produced — not just consumed — and must have cost you real effort.', stats:{ INT:20, VOL:20 } },
  },
  crusader: {
    daily:   { title:'The Unmoved Stand',       desc:'Do something physically uncomfortable on purpose today: train when tired, finish a set after your mind says stop, go harder than planned. Will is the force that completes it — not momentum.', stats:{ VOL:4, STR:3 } },
    weekly:  { title:'The March of Will',       desc:'Log 4 sessions this week where you did something physically harder than your default instinct — more reps, heavier load, longer duration. Log only if willpower, not habit, was what pushed you past the line.', stats:{ VOL:12, STR:12 } },
    onetime: { title:'The Crucible',            desc:'Design your own hard day: stack at least 2 physical challenges in a single day (early workout, hard evening session, no comfort food, cold exposure). Write down what your will overcame. This is your proof of dominion.', stats:{ VOL:20, STR:20 } },
  },
  enchanter: {
    daily:   { title:'The Embodied Word',       desc:'Have a meaningful conversation today where you were deliberately aware of your posture, voice tone, and physical presence the whole time. The body must match the message — presence is a physical skill.', stats:{ CHA:4, DEX:3 } },
    weekly:  { title:'Stage and Motion',        desc:'Have 3 social interactions this week that also required physical expressiveness: a presentation, a performance, leading a group activity, dancing, or any moment where your body was part of the communication.', stats:{ CHA:12, DEX:12 } },
    onetime: { title:'The Embodied Performance', desc:'Perform a physically expressive skill in front of a live group of at least 5 people: a choreographed movement sequence, a martial arts or dance demonstration, a sport skill showcase, or any display where your body is the medium. It cannot just be a speech — the Enchanter\'s presence is physical and kinetic. Document it.', stats:{ CHA:20, DEX:20 } },
  },
  // ── TIER 3 — EXPERT ──────────────────────────────────────────────────────
  templar: {
    daily:   { title:'The Triple Standard',     desc:'Today\'s session must meet three simultaneous standards: push hardest in the last 20% of your workout (STR), refuse to cut any planned set (VOL), and include one intentional recovery action — cold shower, sleep tracking, or structured rest (CON). One session. Three non-negotiables.', stats:{ STR:4, VOL:4, CON:3 } },
    weekly:  { title:'The Unbroken Fortress',   desc:'Log 4 days this week where all three pillars were present: a strength session, a recovery action, and a moment where your will overrode your comfort. Partial days don\'t count. The Templar holds all three or holds none.', stats:{ STR:15, VOL:15, CON:12 } },
    onetime: { title:'The Iron Week',           desc:'Accumulate 7 logged trifecta days — strength session + recovery action + willpower moment. They don\'t need to be consecutive, but they must all be honest. This is the initiation. The Templar doesn\'t graduate without this proof.', stats:{ STR:25, VOL:25, CON:20 } },
  },
  assassin: {
    daily:   { title:'The Intel Strike',        desc:'Before training today, write three lines: what you\'re targeting, why, and what the optimal method is. Train it. After, write one line on what you\'d change. The mind must lead the body — improvised sessions don\'t count.', stats:{ DEX:4, STR:3, INT:3 } },
    weekly:  { title:'The Shadow Protocol',     desc:'Complete 4 sessions this week that include pre-session planning AND a post-session reflection (even one sentence). Explosive training without analysis is just noise. Log only sessions where thought and movement were both present.', stats:{ DEX:15, STR:12, INT:12 } },
    onetime: { title:'The Perfect Target',      desc:'Record yourself performing a physical skill. Identify 3 specific weaknesses from the footage. Design a correction micro-plan and execute it for 2 weeks. Document the before and after. One full research-to-execution cycle. The Assassin never strikes blind.', stats:{ DEX:25, STR:20, INT:20 } },
  },
  iron_warden: {
    daily:   { title:'All Terrain',             desc:'Today\'s training must tax at least two physical systems simultaneously: endurance + strength, strength + agility, or all three at once. Single-domain sessions — only cardio, only lifting, only drills — don\'t count for the Warden.', stats:{ CON:4, STR:3, DEX:3 } },
    weekly:  { title:"The Warden's Round",      desc:'This week, complete one session per domain: a dedicated strength session, a dedicated endurance session, and a dedicated agility or skill session. Three different physical demands, seven days to fit them all. The Warden has no weak terrain.', stats:{ CON:15, STR:12, DEX:12 } },
    onetime: { title:"The Warden's Benchmark",  desc:'Design a 3-event physical test doable at home or outdoors: a strength test (max reps or load on a compound movement), an endurance test (timed distance or sustained cardio), and an agility test (coordination circuit or skill drill). Complete all three back-to-back as your baseline on Day 1. Train each domain across the mastery period. Run all three again at the end — every single event must show measurable improvement.', stats:{ CON:25, STR:20, DEX:20 } },
  },
  loremaster: {
    daily:   { title:'The Living Lecture',      desc:'Study something deeply for 30+ focused minutes today (no distractions), then teach it or explain it to someone before the day ends — in conversation, in writing, in a message. Knowledge that stays in your head is just storage. The Loremaster moves it.', stats:{ INT:4, VOL:3, CHA:3 } },
    weekly:  { title:"The Scholar's Circle",    desc:'Log 4 days this week where the full loop closed: deep study session (30+ min, no distractions) AND the knowledge shared or applied socially before the day ended. Study without sharing, or talking without depth — neither half counts.', stats:{ INT:15, VOL:12, CHA:12 } },
    onetime: { title:'The Magnum Opus',         desc:'Create and deliver a substantial piece of knowledge work to a real audience: a detailed essay, a workshop you facilitate, a course module you teach, a public guide you publish. Research + creation + delivery. All three stats embodied in one artifact.', stats:{ INT:25, VOL:20, CHA:20 } },
  },
  warlord: {
    daily:   { title:'Command and Conquer',     desc:'Complete a physically demanding session today AND make one deliberate strategic decision about your training or goals: cut something that\'s not working, optimize a variable, change a plan based on evidence. Raw force guided by thought. Both required.', stats:{ VOL:4, STR:3, INT:3 } },
    weekly:  { title:"The General's Campaign",  desc:'Log 4 sessions this week that combined physical intensity with a strategic element — pre-session planning, post-session review, or applying a concept you researched. Sessions done on pure instinct, with no thought behind them, do not count.', stats:{ VOL:15, STR:12, INT:12 } },
    onetime: { title:'Field Command',           desc:'Organize and lead a group physical challenge — a team workout, a sport event, a fitness challenge for friends. You planned it (INT), ran it without folding under pressure (VOL), and competed at full intensity yourself (STR). All three in one event you made happen.', stats:{ VOL:25, STR:20, INT:20 } },
  },
  herald: {
    daily:   { title:'The Living Display',      desc:'Your physical training today must have a social dimension: train alongside someone, teach a movement to another person, or perform your skill for a group. Solo sessions logged in private don\'t count. Excellence is only the Herald\'s when it\'s witnessed.', stats:{ CHA:4, DEX:3, CON:3 } },
    weekly:  { title:'The Circuit of Presence', desc:'Complete 3 sessions this week with both a physical AND a social-performance component: a group class, a team sport, a workout you led, a skill you demonstrated publicly. The Warden trains alone. The Herald never does.', stats:{ CHA:15, DEX:12, CON:12 } },
    onetime: { title:'The Open Floor',          desc:'Announce and host an open physical training session — posted in advance to a neighborhood group, WhatsApp, or social media. Show up, design the session, lead it from the front at full intensity, and sustain the group\'s energy for the whole thing. It doesn\'t matter if 3 people show or 30. The Herald opened the floor and led. Document it.', stats:{ CHA:25, DEX:20, CON:20 } },
  },
  // ── TIER 4 — LEGEND ──────────────────────────────────────────────────────
  godslayer: {
    daily:   { title:'The God Trial',           desc:'Complete a session that simultaneously demands all four: explosive compound power (STR), a precision or agility skill component (DEX), a sustained cardio block of 20+ minutes (CON), AND end with the set you planned to cut — no exceptions (VOL). Any session missing one of the four is not a God Trial. Log only what holds the full standard.', stats:{ STR:5, VOL:4, CON:4, DEX:4 } },
    weekly:  { title:'The Divine Campaign',     desc:'Hit the God Trial on at least 5 out of 7 days this week. Two missed days maximum. Five full God Trials or the week didn\'t happen. The Divine Campaign isn\'t about streaks — it\'s about what you do when you don\'t feel like it.', stats:{ STR:20, VOL:18, CON:15, DEX:15 } },
    onetime: { title:'Ascension Protocol',      desc:'Accumulate 30 logged God Trial days while equipped as Godslayer. They don\'t need to be consecutive — but every one must be honest. This is not completed in a weekend. This is the lifestyle. The Godslayer doesn\'t claim the title until thirty days of proof exist.', stats:{ STR:35, VOL:30, CON:25, DEX:25 } },
  },
  void_hunter: {
    daily:   { title:"The Hunter's Ledger",     desc:'Write a 3-line pre-session plan: target, method, reason (INT). Execute a session with explosive power and precision elements (DEX + STR). Write one post-session optimization line (INT). Log one non-training discipline win — a completed focus block, a rejected distraction, a held commitment (VOL). All four must be documented. No documentation, no log.', stats:{ DEX:5, STR:4, INT:4, VOL:4 } },
    weekly:  { title:'Eyes in the Dark',        desc:'Complete 5 full Ledger days this week — pre-plan, explosive session, post-review, and discipline win, all four documented. Partial entries don\'t count. Five out of seven, no rounding. The Void Hunter doesn\'t lower their standards because the week got hard.', stats:{ DEX:20, STR:15, INT:15, VOL:15 } },
    onetime: { title:'The Perfect Protocol',    desc:'Before Day 1 of holding this class, write a complete 28-day self-improvement protocol covering all four domains: a week-by-week training progression (DEX + STR), a daily learning target (INT), and a daily willpower challenge (VOL). Execute all 28 days while equipped. Produce a written after-action report: what improved, what failed, and what the next protocol would look like. The Void Hunter plans the kill before drawing the bow. The report is the proof.', stats:{ DEX:35, STR:25, INT:25, VOL:25 } },
  },
  colossus: {
    daily:   { title:'The Colossus Protocol',   desc:'Train today in a session that is physically exhausting with 20+ minutes of sustained effort (CON), includes at least one heavy or maximal strength movement (STR), includes a technical precision or agility element (DEX), AND is witnessed — train with someone, lead a session, share it publicly, or demonstrate it to a group (CHA). The Colossus is not invisible. Every single day.', stats:{ CON:5, STR:4, DEX:4, CHA:4 } },
    weekly:  { title:'Undeniable',              desc:'Hit the full Colossus Protocol on at least 5 days this week. Every logged day must be exhausting, strong, technical, AND witnessed. The Colossus doesn\'t train in public Monday through Friday and disappear on weekends. Five complete days. Every one must be real and witnessed.', stats:{ CON:20, STR:15, DEX:15, CHA:15 } },
    onetime: { title:'The Colossus Record',     desc:'Choose one compound physical benchmark you can test at home or outdoors: max push-up set, fastest mile, max pull-ups, heaviest loaded carry, or equivalent. Document your starting performance on Day 1. Train across the mastery period. Complete a final max-effort attempt and share the result — video or written record — with at least 3 people. The Colossus doesn\'t quietly improve. They put the number on the record.', stats:{ CON:35, STR:25, DEX:25, CHA:25 } },
  },
  arcane_sovereign: {
    daily:   { title:"The Sovereign's Regime",  desc:'Every day must contain all three: a 60-minute uninterrupted deep work block tracked with start and end times, phone off, zero distractions (INT + VOL); a meaningful knowledge exchange where you brought real insight to someone — not small talk but something that shifted their thinking (CHA + INT); and one physical resilience habit — cold exposure, structured sleep tracking, or 20+ minutes of intentional physical activity (CON). The Sovereign rules all three domains every day or reigns over none.', stats:{ INT:5, VOL:4, CHA:4, CON:4 } },
    weekly:  { title:'The Court of Mastery',    desc:'Complete 5 Sovereign\'s Regime days this week. Deep work block + knowledge exchange + physical resilience — all three, five times. This is not a flexible standard. Five days minimum. The Sovereign doesn\'t crown themselves with a partial record.', stats:{ INT:20, VOL:15, CHA:15, CON:15 } },
    onetime: { title:"The Sovereign's Decree",  desc:'Build and publicly deliver a complete knowledge system to a real audience: a structured multi-session course (3+ sessions), a published series of 5+ essays or guides, or a mentorship program you ran for at least 4 weeks with documented participants and outcomes. This is not a single post or talk. It is a body of work. Research it, structure it, deliver it, and prove it reached someone.', stats:{ INT:35, VOL:25, CHA:25, CON:25 } },
  },
  iron_saint: {
    daily:   { title:"The Saint's Covenant",    desc:'Every day must hold three things without exception: a physically demanding session where you overcame a moment of genuine resistance — the rep you wanted to skip, the distance you wanted to cut (VOL + STR); a focused intellectual block of 30+ minutes producing something tangible (INT); and one act of leadership or mentorship — real advice given, a person genuinely inspired, a team or situation moved forward (CHA). The Iron Saint doesn\'t lead on good days only. Every day is the covenant.', stats:{ VOL:5, STR:4, INT:4, CHA:4 } },
    weekly:  { title:'The Iron Covenant',       desc:'Log 5 Saint\'s Covenant days this week. Physical resistance overcome + intellectual output + leadership action — all three, five times. Two days maximum of absence. The Iron Saint who misses more than that isn\'t leading. They\'re resting.', stats:{ VOL:20, STR:15, INT:15, CHA:15 } },
    onetime: { title:'The Canonization',        desc:'Accumulate 30 logged Saint\'s Covenant days while equipped as Iron Saint. Thirty days of physical dominance, intellectual work, and leadership impact — all documented, all honest. This is not passed in a burst. It is earned over the month you hold this class. The canon is written slowly, by those who show up every single day.', stats:{ VOL:35, STR:25, INT:25, CHA:25 } },
  },
  divine_prophet: {
    daily:   { title:"The Prophet's Declaration", desc:'Your day must contain all three: a physical session that is both technically demanding and aerobically sustained — agility within endurance, not just a run (DEX + CON); a focused intellectual or creative block of 30+ minutes that produces a tangible output — a written note, a plan, a piece of content (INT); and a social moment of genuine impact where you inspired, led, taught, or visibly moved someone (CHA). The Prophet doesn\'t drift through days. Every day is a declaration.', stats:{ CHA:5, DEX:4, CON:4, INT:4 } },
    weekly:  { title:'The Vision Protocol',     desc:'Complete 5 Prophet\'s Declaration days this week. Agile endurance session + intellectual output + social impact — all three, five times. Five out of seven. The Prophet who speaks inconsistently is not a Prophet. They are a rumor.', stats:{ CHA:20, DEX:15, CON:15, INT:15 } },
    onetime: { title:'The Revelation',          desc:'Conceive, develop, and publicly launch a project that embodies all four stat domains: physical performance or competition (DEX + CON), research-backed intellectual content (INT), and builds or leads a community around it (CHA). A public fitness challenge you ran and documented, an educational program with a live audience, an athletic performance paired with a published reflection — all valid. It must go public, involve others, and be documented. The Prophet doesn\'t whisper. They reveal.', stats:{ CHA:35, DEX:25, CON:25, INT:25 } },
  },
  // ── TIER 5 — TRUE HERO ───────────────────────────────────────────────────
  true_hero: {
    daily:   { title:'The Standard',            desc:'Today must be lived at the True Hero standard — all six domains present, no shortcuts, no passive completions: a training session taxing both power and coordination (STR + DEX); a sustained cardio effort or deliberate recovery habit (CON); a 30+ minute focused block that produces something tangible — something that didn\'t exist before you sat down (INT); one moment where the lesser version of you wanted to stop, and you didn\'t (VOL); and one genuine social impact — a person you moved, taught, led, or inspired (CHA). Not a checklist. A way of being. The day either holds this standard or it doesn\'t.', stats:{ STR:5, DEX:5, CON:5, INT:5, VOL:5, CHA:5 } },
    weekly:  { title:'The Unbroken Standard',   desc:'Hit The Standard on 6 out of 7 days this week. One day of rest or failure allowed — no more. Six complete days across all six domains, six times. The True Hero\'s week is not measured by what they did on their best days. It is measured by what they refused to skip on their worst.', stats:{ STR:20, DEX:20, CON:20, INT:20, VOL:20, CHA:20 } },
    onetime: { title:'The True Chronicle',      desc:'Accumulate 60 logged Standard days while equipped as True Hero. Sixty days of living at the full six-domain standard — spread across the entire mastery period, built one honest day at a time. This is the highest accumulation target in the game. It cannot be rushed, cannot be faked, and cannot be completed in a burst of motivation. By the time the Chronicle is sealed, the standard is no longer a quest. It is who you are.', stats:{ STR:60, DEX:60, CON:60, INT:60, VOL:60, CHA:60 } },
  },
};
