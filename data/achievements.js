// ============================================================
// ACHIEVEMENTS (LOGROS)
// ============================================================
// Achievement reward design: ALL rewards use statAll:true — every tier's reward is added to
// ALL 6 stats equally.
//
// Habit-linked achievements track 1:1 with the actual habits:
//   daily = 10 (one per daily habit, each 1/1/2/4/7/13 = 28)
//   weekly = 8 (one per weekly habit, each 1/2/3/5/11 = 22)
// The rest (ranks, classes, stat mastery, balance, streak, perfection, resilience, work)
// are progress/milestone achievements unrelated to specific habits.
const ACHIEVEMENTS = [
  // ── ONBOARDING — pre-claimable on first load ─────────────────
  { id:'system_online', name:'System Online', icon:'⚡', category:'hitos',
    desc:'Connected to the Hunter System for the first time.',
    statAll:true, tiers:[{count:1, label:'The Awakening', reward:1, title:'The Awakened'}] },

  // ── PROGRESIÓN — 10 hábitos diarios  (one achievement per daily habit; each: 1/1/2/4/7/13) ──
  { id:'wake7am',    name:'Early Riser',      icon:'🌅', category:'progresion', desc:'Wake up early',                               textMatch:'wake up',       stat:'CON', statAll:true,
    tiers:[{count:1,label:'First Dawn',reward:1,title:null},{count:10,label:'The Sleeper Defeated',reward:1,title:null},{count:30,label:'Dawn Guardian',reward:2,title:null},{count:100,label:'Dawn Hunter',reward:4,title:'Dawn Hunter'},{count:200,label:'Lord of Time',reward:7,title:'Lord of Time'},{count:365,label:'ASCENDED',reward:13,title:'ASCENDED'}]},
  { id:'bed',        name:'Solid Foundation', icon:'🛏️', category:'progresion', desc:'Make your bed',                               textMatch:'your bed',      stat:'CHA', statAll:true,
    tiers:[{count:1,label:'First Made',reward:1,title:null},{count:10,label:'The Methodical',reward:1,title:null},{count:30,label:'The Consistent',reward:2,title:null},{count:100,label:'Home Artisan',reward:4,title:'Home Artisan'},{count:200,label:'Day Architect',reward:7,title:'Day Architect'},{count:365,label:'RITUAL FORGER',reward:13,title:'RITUAL FORGER'}]},
  { id:'stretching', name:'Agile',            icon:'🤸', category:'progresion', desc:'Stretching',                                  textMatch:'stretching',    stat:'DEX', statAll:true,
    tiers:[{count:1,label:'First Stretch',reward:1,title:null},{count:10,label:'Stiffness Overcome',reward:1,title:null},{count:30,label:'Flexible',reward:2,title:null},{count:100,label:'Agile',reward:4,title:'Agile'},{count:200,label:'Acrobat',reward:7,title:'Acrobat'},{count:365,label:'SPIRIT OF THE WIND',reward:13,title:'SPIRIT OF THE WIND'}]},
  { id:'reading',    name:'Bibliophile',      icon:'📖', category:'progresion', desc:'Read',                                        textMatch:'read',          stat:'INT', statAll:true,
    tiers:[{count:1,label:'First Page',reward:1,title:null},{count:10,label:'Curious',reward:1,title:null},{count:30,label:'Studious',reward:2,title:null},{count:100,label:'Scholar',reward:4,title:'Scholar'},{count:200,label:'Sage',reward:7,title:'Sage'},{count:365,label:'MASTER OF KNOWLEDGE',reward:13,title:'MASTER OF KNOWLEDGE'}]},
  { id:'gratitude',  name:'Grateful',         icon:'🙏', category:'progresion', desc:'Write 3 things you are grateful for',         textMatch:'grateful',      stat:'CHA', statAll:true,
    tiers:[{count:1,label:'First Thanks',reward:1,title:null},{count:10,label:'Mindful',reward:1,title:null},{count:30,label:'Generous',reward:2,title:null},{count:100,label:'Open Heart',reward:4,title:'Open Heart'},{count:200,label:'Light of the Group',reward:7,title:'Light of the Group'},{count:365,label:'PURE SOUL',reward:13,title:'PURE SOUL'}]},
  { id:'training',   name:'Warrior',          icon:'💪', category:'progresion', desc:'Physical training',                           textMatch:'training',      stat:'STR', statAll:true,
    tiers:[{count:1,label:'First Rep',reward:1,title:null},{count:10,label:'Novice',reward:1,title:null},{count:30,label:'Soldier',reward:2,title:null},{count:100,label:'Iron Veteran',reward:4,title:'Iron Veteran'},{count:200,label:'Champion',reward:7,title:'Champion'},{count:365,label:'LIVING LEGEND',reward:13,title:'LIVING LEGEND'}]},
  { id:'hydration',  name:'Hydrated',         icon:'💧', category:'progresion', desc:'Drink 2L of water',                           textMatch:'water',         stat:'CON', statAll:true,
    tiers:[{count:1,label:'First Drop',reward:1,title:null},{count:10,label:'Steady',reward:1,title:null},{count:30,label:'Steady Flow',reward:2,title:null},{count:100,label:'Fountain of Life',reward:4,title:'Fountain of Life'},{count:200,label:'Pure Torrent',reward:7,title:'Pure Torrent'},{count:365,label:'INNER SEA',reward:13,title:'INNER SEA'}]},
  { id:'dishes',     name:'Order',            icon:'🍽️', category:'progresion', desc:'Wash dishes / clean room',                    textMatch:'dishes',        stat:'VOL', statAll:true,
    tiers:[{count:1,label:'First Wash',reward:1,title:null},{count:10,label:'The Washer',reward:1,title:null},{count:30,label:'Disciplined',reward:2,title:null},{count:100,label:'Master of Order',reward:4,title:'Master of Order'},{count:200,label:'Home Guardian',reward:7,title:'Home Guardian'},{count:365,label:'DOMESTIC MONK',reward:13,title:'DOMESTIC MONK'}]},
  { id:'meditation', name:'Calm Mind',        icon:'🧘', category:'progresion', desc:'Meditation (10 min)',                         textMatch:'meditation',    stat:'VOL', statAll:true,
    tiers:[{count:1,label:'First Breath',reward:1,title:null},{count:10,label:'Zen Apprentice',reward:1,title:null},{count:30,label:'Meditator',reward:2,title:null},{count:100,label:'Crystal Mind',reward:4,title:'Crystal Mind'},{count:200,label:'Contemplative',reward:7,title:'Contemplative'},{count:365,label:'SACRED VOID',reward:13,title:'SACRED VOID'}]},
  { id:'brush_teeth',name:'Pristine Smile',   icon:'🦷', category:'progresion', desc:'Brush your teeth',                            textMatch:'brush teeth',   stat:'CON', statAll:true,
    tiers:[{count:1,label:'First Brush',reward:1,title:null},{count:10,label:'Fresh',reward:1,title:null},{count:30,label:'Spotless',reward:2,title:null},{count:100,label:'Pristine',reward:4,title:'Pristine'},{count:200,label:'Enamel Guardian',reward:7,title:'Enamel Guardian'},{count:365,label:'IVORY SOVEREIGN',reward:13,title:'IVORY SOVEREIGN'}]},

  // ── PROGRESIÓN — 8 hábitos semanales  (one achievement per weekly habit; each: 1/2/3/5/11) ──
  { id:'weekly_futbol',   name:'Football',      icon:'⚽', category:'progresion', desc:'Play football',            weeklyId:'w0', weeklyTextMatch:'fútbol', stat:'STR', statAll:true,
    tiers:[{count:1,label:'First Match',reward:1,title:null},{count:3,label:'Regular',reward:2,title:null},{count:10,label:'Seasoned Player',reward:3,title:'Seasoned Player'},{count:25,label:'Field General',reward:5,title:'Field General'},{count:50,label:'LIVING BALL',reward:11,title:'LIVING BALL'}]},
  { id:'weekly_padel',    name:'Padel',         icon:'🎾', category:'progresion', desc:'Play padel',               weeklyId:'w1', weeklyTextMatch:'pádel', stat:'DEX', statAll:true,
    tiers:[{count:1,label:'First Rally',reward:1,title:null},{count:3,label:'Regular',reward:2,title:null},{count:10,label:'Court Regular',reward:3,title:'Court Regular'},{count:25,label:'Net Master',reward:5,title:'Net Master'},{count:50,label:'PADEL KING',reward:11,title:'PADEL KING'}]},
  { id:'weekly_cleaning', name:'Home Guardian', icon:'🏠', category:'progresion', desc:'Deep clean the house',     weeklyId:'w2', weeklyTextMatch:'home cleaning', stat:'VOL', statAll:true,
    tiers:[{count:1,label:'Swept',reward:1,title:null},{count:3,label:'Consistent',reward:2,title:null},{count:10,label:'Order Keeper',reward:3,title:'Order Keeper'},{count:25,label:'Sanctuary Builder',reward:5,title:'Sanctuary Builder'},{count:50,label:'DOMAIN SOVEREIGN',reward:11,title:'DOMAIN SOVEREIGN'}]},
  { id:'weekly_cooking',  name:'Chef',          icon:'🍳', category:'progresion', desc:'Cook a complex meal',      weeklyId:'w3', weeklyTextMatch:'cook', stat:'INT', statAll:true,
    tiers:[{count:1,label:'First Dish',reward:1,title:null},{count:3,label:'Home Cook',reward:2,title:null},{count:10,label:'Culinary Student',reward:3,title:'Culinary Student'},{count:25,label:'Master Chef',reward:5,title:'Master Chef'},{count:50,label:'GASTRONOMIC LEGEND',reward:11,title:'GASTRONOMIC LEGEND'}]},
  { id:'weekly_grooming', name:'Polished',      icon:'🪒', category:'progresion', desc:'Deep grooming session',    weeklyId:'w4', weeklyTextMatch:'shaving', stat:'CHA', statAll:true,
    tiers:[{count:1,label:'First Polish',reward:1,title:null},{count:3,label:'Presentable',reward:2,title:null},{count:10,label:'Sharp',reward:3,title:'Sharp'},{count:25,label:'Immaculate',reward:5,title:'Immaculate'},{count:50,label:'SOVEREIGN IMAGE',reward:11,title:'SOVEREIGN IMAGE'}]},
  { id:'weekly_plants',   name:'Gardener',      icon:'🪴', category:'progresion', desc:'Water the plants',         weeklyId:'w5', weeklyTextMatch:'plants', stat:'CHA', statAll:true,
    tiers:[{count:1,label:'First Sprout',reward:1,title:null},{count:3,label:'Green Thumb',reward:2,title:null},{count:10,label:'Cultivator',reward:3,title:'Cultivator'},{count:25,label:'Garden Keeper',reward:5,title:'Garden Keeper'},{count:50,label:'LIFE GIVER',reward:11,title:'LIFE GIVER'}]},
  { id:'weekly_expenses', name:'Treasurer',     icon:'📊', category:'progresion', desc:"Log the week's expenses",  weeklyId:'w6', weeklyTextMatch:'expenses', stat:'INT', statAll:true,
    tiers:[{count:1,label:'First Ledger',reward:1,title:null},{count:3,label:'Bookkeeper',reward:2,title:null},{count:10,label:'Accountant',reward:3,title:'Accountant'},{count:25,label:'Treasurer',reward:5,title:'Treasurer'},{count:50,label:'COIN SOVEREIGN',reward:11,title:'COIN SOVEREIGN'}]},
  { id:'weekly_review',   name:'Analyst',       icon:'🔍', category:'progresion', desc:"Analyze the week's results", weeklyId:'w7', weeklyTextMatch:'analyze', stat:'INT', statAll:true,
    tiers:[{count:1,label:'First Review',reward:1,title:null},{count:3,label:'Reflective',reward:2,title:null},{count:10,label:'Strategist',reward:3,title:'Strategist'},{count:25,label:'Visionary',reward:5,title:'Visionary'},{count:50,label:'GRAND ANALYST',reward:11,title:'GRAND ANALYST'}]},

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

  // ── IRON DISCIPLINE (consecutive 100% days — very hard, massive rewards) ─
  { id:'iron_discipline', name:'Iron Discipline', icon:'⚔️', category:'racha', desc:'Consecutive days completing 100% of habits', statAll:true,
    tiers:[{count:3,label:'Iron Spark',reward:5,title:null},{count:7,label:'Iron Week',reward:10,title:'Iron Disciplined'},{count:14,label:'Iron Fortnight',reward:20,title:'Iron Forged'},{count:30,label:'Iron Month',reward:35,title:'Iron Knight'},{count:60,label:'IRON ABSOLUTE',reward:50,title:'IRON ABSOLUTE'}]},

  // ── HABIT FORGED (total daily habit completions) ─────────────
  { id:'habit_forged', name:'Habit Forged', icon:'🔨', category:'hitos', desc:'Total daily habit completions across all habits', statAll:true,
    tiers:[{count:50,label:'First Forge',reward:1,title:null},{count:200,label:'Hardened',reward:3,title:null},{count:500,label:'Tempered',reward:6,title:'Tempered'},{count:1000,label:'Forged Steel',reward:10,title:'Forged Steel'},{count:2500,label:'MYTHRIL SOUL',reward:15,title:'MYTHRIL SOUL'}]},

  // ── CONSISTENCIA  perf_week: 2+5+8+10+15=40 / perf_day: 1+1+2+4+5=13 ──
  { id:'perf_week', name:'Perfect Week', icon:'⭐', category:'racha', desc:'7 consecutive days at 100% of habits', statAll:true,
    tiers:[{count:1,label:'First Perfection',reward:2,title:null},{count:3,label:'Triple Crown',reward:5,title:null},{count:5,label:'Weekly Elite',reward:8,title:'Weekly Elite'},{count:10,label:'Weekly Master',reward:10,title:'Weekly Master'},{count:20,label:'PERPETUAL PERFECTION',reward:15,title:'PERPETUAL PERFECTION'}]},
  { id:'perf_day', name:'Flawless', icon:'💯', category:'racha', desc:'Complete 100% of daily habits in a day', statAll:true,
    tiers:[{count:1,label:'First Flawless',reward:1,title:null},{count:10,label:'Disciplined',reward:1,title:null},{count:30,label:'Iron Routine',reward:2,title:null},{count:100,label:'Flawless Machine',reward:4,title:'Flawless Machine'},{count:365,label:'ASCENDED DISCIPLINE',reward:5,title:'ASCENDED DISCIPLINE'}]},

  // ── RESILIENCIA  phoenix: 1+2+4+5+7=19 / avoid: 1+2+4+6+8=21 ──
  { id:'phoenix', name:'Phoenix', icon:'🦅', category:'racha', desc:'100% day after a day below 70%', statAll:true,
    tiers:[{count:1,label:'Risen',reward:1,title:null},{count:3,label:'Fire Bird',reward:2,title:null},{count:5,label:'Indestructible',reward:4,title:'Indestructible'},{count:10,label:'No Surrender',reward:5,title:'No Surrender'},{count:20,label:'ETERNAL PHOENIX',reward:7,title:'ETERNAL PHOENIX'}]},
  { id:'avoid_clean', name:'Iron Will', icon:'🛡️', category:'racha', desc:'Consecutive days clean from addiction', stat:'VOL', statAll:true,
    tiers:[{count:7,label:'First Week',reward:1,title:null},{count:30,label:'Month of Clarity',reward:2,title:null},{count:90,label:'Iron Mind',reward:4,title:'Iron Mind'},{count:180,label:'Liberated',reward:6,title:'Liberated'},{count:365,label:'UNBREAKABLE',reward:8,title:'UNBREAKABLE'}]},

  // ── WORK — QUESTS  (1+2+4+7+11 = 25) ───────────────────────
  { id:'quest_runner', name:'Quest Runner', icon:'⚒', category:'trabajo', desc:'Complete work tasks across all days', statAll:true,
    tiers:[{count:5,label:'First Contracts',reward:1,title:null},{count:25,label:'Field Agent',reward:2,title:null},{count:75,label:'Veteran Contractor',reward:4,title:'Veteran Contractor'},{count:200,label:'Elite Operative',reward:7,title:'Elite Operative'},{count:500,label:'SHADOW LEGEND',reward:11,title:'SHADOW LEGEND'}]},

  // ── WORK — GOLD  (1+3+5+8+12 = 29) ─────────────────────────
  { id:'gold_earner', name:'Gold Hunter', icon:'<img src="img/gold.png" style="height:1em;width:auto;object-fit:contain;vertical-align:middle;display:inline-block">', category:'trabajo', desc:'Accumulate lifetime gold earned', statAll:true,
    tiers:[{count:100,label:'First Pouch',reward:1,title:null},{count:500,label:'Prospector',reward:3,title:null},{count:2000,label:'Merchant Lord',reward:5,title:'Merchant Lord'},{count:5000,label:'Tycoon',reward:8,title:'Tycoon'},{count:10000,label:'GOLD SOVEREIGN',reward:12,title:'GOLD SOVEREIGN'}]},

  // ── WORK — COMMISSIONS  (1+2+4+7+11 = 25) ──────────────────
  { id:'commission_ace', name:'Commission Ace', icon:'📋', category:'trabajo', desc:'Fulfill commissions from the board', statAll:true,
    tiers:[{count:1,label:'First Brief',reward:1,title:null},{count:10,label:'Regular Client',reward:2,title:null},{count:30,label:'Trusted Agent',reward:4,title:'Trusted Agent'},{count:75,label:'Commission Master',reward:7,title:'Commission Master'},{count:150,label:'SOVEREIGN CONTRACTOR',reward:11,title:'SOVEREIGN CONTRACTOR'}]},

  // ── WORK — FORGE  (1+2+4+7+11 = 25) ────────────────────────
  { id:'master_forger', name:'Master Forger', icon:'🔨', category:'trabajo', desc:'Craft items in the Forge', statAll:true,
    tiers:[{count:1,label:'First Craft',reward:1,title:null},{count:5,label:'Apprentice Smith',reward:2,title:null},{count:15,label:'Journeyman',reward:4,title:'Journeyman'},{count:40,label:'Master Smith',reward:7,title:'Master Smith'},{count:100,label:'LEGENDARY ARTISAN',reward:11,title:'LEGENDARY ARTISAN'}]},

  // ── WORK — POMODORO  (1+2+4+7+11 = 25) ─────────────────────
  { id:'pomo_warrior', name:'Pomo Warrior', icon:'🍅', category:'trabajo', desc:'Complete forge sessions (25-min work blocks)', statAll:true,
    tiers:[{count:1,label:'First Session',reward:1,title:null},{count:10,label:'Focused',reward:2,title:null},{count:50,label:'Iron Focus',reward:4,title:'Iron Focus'},{count:150,label:'Flow State',reward:7,title:'Flow State'},{count:300,label:'ETERNAL GRINDER',reward:11,title:'ETERNAL GRINDER'}]},

  // ── WORK — GUILD  (2+5+10 = 17) ─────────────────────────────
  { id:'guild_patron', name:'Guild Patron', icon:'🏛', category:'trabajo', desc:'Purchase upgrades in the Guild', statAll:true,
    tiers:[{count:1,label:'Initiate',reward:2,title:null},{count:3,label:'Benefactor',reward:5,title:'Benefactor'},{count:5,label:'GUILD SOVEREIGN',reward:10,title:'GUILD SOVEREIGN'}]},

  // ── WORK — STREAK  (1+2+4+6+8 = 21) ────────────────────────
  { id:'work_streak', name:'Iron Contractor', icon:'🔩', category:'trabajo', desc:'Consecutive days completing at least 1 work task', statAll:true,
    tiers:[{count:3,label:'On the Clock',reward:1,title:null},{count:7,label:'Weekly Grind',reward:2,title:null},{count:14,label:'Relentless',reward:4,title:'Relentless'},{count:30,label:'Iron Month',reward:6,title:'Iron Month'},{count:100,label:'UNBREAKABLE GRINDER',reward:8,title:'UNBREAKABLE GRINDER'}]},

  // ── WORK — FORGE CHASE: Legendary rarity rolls  (2+5+10 = 17) ─
  { id:'lucky_strike', name:'Lucky Strike', icon:'👑', category:'trabajo', desc:'Craft items that roll Legendary rarity', statAll:true,
    tiers:[{count:1,label:'First Legend',reward:2,title:null},{count:5,label:'Fortune Favored',reward:5,title:'Fortune Favored'},{count:25,label:'GOLDEN HAND',reward:10,title:'GOLDEN HAND'}]},

  // ── WORK — REFINEMENT mastery: items pushed to max grade (G5)  (2+5+9 = 16) ─
  { id:'refined_steel', name:'Refined Steel', icon:'✦', category:'trabajo', desc:'Refine crafted items to maximum grade (G5)', statAll:true,
    tiers:[{count:1,label:'First Edge',reward:2,title:null},{count:5,label:'Master Refiner',reward:5,title:'Master Refiner'},{count:15,label:'ETERNAL EDGE',reward:9,title:'ETERNAL EDGE'}]},

  // ── WORK — TIER CLIMBER: deepest recipe tier crafted  (2+5+10 = 17) ─
  { id:'tier_climber', name:'Tier Climber', icon:'🗻', category:'trabajo', desc:'Craft items from deeper forge tiers', statAll:true,
    tiers:[{count:3,label:'Tier III Smith',reward:2,title:null},{count:6,label:'Tier VI Artisan',reward:5,title:'Tier VI Artisan'},{count:9,label:'TIER IX MASTER',reward:10,title:'TIER IX MASTER'}]},

  // ── WORK — FULL SET: all 10 slots filled with crafted gear at tier ≥ N  (2+6+12 = 20) ─
  // count = current highest tier N such that every equipped slot holds a crafted item with recipe.tier >= N.
  { id:'full_set', name:'Full Set', icon:'🛡️', category:'trabajo', desc:'Equip a complete (10/10) crafted set — every slot at least Tier N', statAll:true,
    tiers:[{count:1,label:'Tier I Loadout',reward:2,title:null},{count:5,label:'Tier V Loadout',reward:6,title:'Tier V Loadout'},{count:9,label:'TIER IX LOADOUT',reward:12,title:'PARAGON LOADOUT'}]},

  // ── WORK — REFORGED FORTUNE: affix rerolls (gold sink chase)  (2+5 = 7) ─
  { id:'reforged_fortune', name:'Reforged Fortune', icon:'🎲', category:'trabajo', desc:'Reroll affix values on crafted gear', statAll:true,
    tiers:[{count:10,label:'Tinkerer',reward:2,title:null},{count:50,label:'OBSESSED ROLLER',reward:5,title:'OBSESSED ROLLER'}]},

  // ── WORK — GUILD MAXED: total levels across all guild upgrades  (2+5+10 = 17) ─
  { id:'guild_maxed', name:'Guild Maxed', icon:'🏛️', category:'trabajo', desc:'Total levels across all Guild upgrades', statAll:true,
    tiers:[{count:10,label:'Builder',reward:2,title:null},{count:30,label:'Architect',reward:5,title:'Guild Architect'},{count:60,label:'GUILD PARAGON',reward:10,title:'GUILD PARAGON'}]},

  // ── WORK — MASTER WORKER: Worker rank ladder  (1+2+5+10 = 18) ──────
  { id:'master_worker', name:'Master Worker', icon:'⚒', category:'trabajo', desc:'Reach worker level milestones', statAll:true,
    tiers:[{count:5,label:'Journeyman',reward:1,title:null},{count:20,label:'Veteran Hand',reward:2,title:null},{count:50,label:'Foreman',reward:5,title:'Foreman'},{count:99,label:'GUILD GRANDMASTER',reward:10,title:'GUILD GRANDMASTER'}]},

  // ── DUNGEON — CONQUEROR: total boss kills  (1+3+6+10 = 20) ─────────
  { id:'dungeon_conqueror', name:'Dungeon Conqueror', icon:'⚔️', category:'hitos', desc:'Defeat dungeon bosses (bossKill expeditions)', statAll:true,
    tiers:[{count:5,label:'Boss Hunter',reward:1,title:null},{count:25,label:'Slayer',reward:3,title:'Slayer'},{count:100,label:'Boss Reaper',reward:6,title:'Boss Reaper'},{count:300,label:'DEATHLESS KING',reward:10,title:'DEATHLESS KING'}]},

  // ── DUNGEON — CARTOGRAPHER: distinct dungeons cleared (variety)  (1+3+8 = 12) ─
  { id:'cartographer', name:'Cartographer', icon:'🗺️', category:'hitos', desc:'Defeat the boss of distinct dungeons (one of each)', statAll:true,
    tiers:[{count:5,label:'Pathfinder',reward:1,title:null},{count:15,label:'Trailblazer',reward:3,title:'Trailblazer'},{count:24,label:'WORLD WALKER',reward:8,title:'WORLD WALKER'}]},
];
