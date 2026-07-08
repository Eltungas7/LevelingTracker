// NOTE: slot id 'belt' is the internal id for the GAUNTLETS slot (kept to avoid
// migration of saved equipment/equipmentGrades/equipmentMods). UI label says Gauntlets.
// Display order: Sword - Armor - Helmet - Gauntlets - Boots - Shield - Necklace - Earrings - Bracelet
const EQUIP_SLOTS = [
  { id:'weapon',    name:'Weapon',    emoji:'⚔️', area:'wpn'  },
  { id:'armor',     name:'Armor',     emoji:'🥋', area:'armor'},
  { id:'helmet',    name:'Helmet',    emoji:'⛑️',  area:'helm' },
  { id:'belt',      name:'Gauntlets', emoji:'🥊', area:'gaunt' },
  { id:'boots',     name:'Boots',     emoji:'👟', area:'boot' },
  { id:'shield',    name:'Shield',    emoji:'🛡️', area:'shld' },
  { id:'necklace',  name:'Necklace',  emoji:'📿', area:'neck' },
  { id:'earring_l', name:'Earring',   emoji:'💎', area:'earL' },
  { id:'earring_r', name:'Earring',   emoji:'💎', area:'earR' },
  { id:'bracelet',  name:'Bracelet',  emoji:'💍', area:'brace'},
];

// ── Crafted-instance RARITY + AFFIXES ───────────────────────────────
// This is the rolled "quality" of a CRAFTED INSTANCE (stored on the inventory
// entry as entry.quality/qualityMult/qualityLabel + entry.affixes). It is
// SEPARATE from the fixed `item.rarity` definition field used to colour recipe
// cards. Rarity gates a flat-stat multiplier AND the number of random % affix
// slots; both flat stats and affix magnitude also scale with refine grade.
const RARITY_TIERS = [
  { id:'common',    label:'COMMON',    icon:'',   color:'#b0bec5', chance:0.50, statMult:1.00, slotBonus:0 },
  { id:'uncommon',  label:'UNCOMMON',  icon:'✦',  color:'#81c784', chance:0.27, statMult:1.12, slotBonus:0 },
  { id:'rare',      label:'RARE',      icon:'★',  color:'#64b5f6', chance:0.15, statMult:1.28, slotBonus:0 },
  { id:'epic',      label:'EPIC',      icon:'✷',  color:'#ce93d8', chance:0.06, statMult:1.50, slotBonus:1 },
  { id:'legendary', label:'LEGENDARY', icon:'👑', color:'#ffb300', chance:0.02, statMult:1.75, slotBonus:2 },
];
const RARITY_BY_ID = Object.fromEntries(RARITY_TIERS.map(r => [r.id, r]));
// affix-magnitude multiplier per rarity (bigger rolls on rarer gear)
const RARITY_AFFIX_MULT = { common:1.00, uncommon:1.15, rare:1.30, epic:1.50, legendary:1.70 };

// Affix pool — rolled on T4+ gear. kind 'pct' = % combat multiplier, 'pts' = flat points.
// Affix base min/max are BEFORE rarity×grade scaling (legendary G5 multiplies by ×2.516).
// Calibrated so a full T9 G5 legendary 10-slot loadout (40 affix slots, ~6-7 rolling atkPct)
// accumulates ≥35% total atkPct → raw gear CP > 70% of base CP → display cap binds.
// Individual max per legendary G5 slot: atkPct/hpPct 3×2.516=7.55%, crit 0.6×2.516=1.51%.
const AFFIX_POOL = [
  { stat:'atkPct',   label:'ATK',   suffix:'%', kind:'pct', min:1,   max:3,   color:'#ff8a80' },
  { stat:'hpPct',    label:'HP',    suffix:'%', kind:'pct', min:1,   max:3,   color:'#69f0ae' },
  { stat:'defPct',   label:'DEF',   suffix:'%', kind:'pct', min:1,   max:3,   color:'#90caf9' },
  { stat:'mpPct',    label:'MP',    suffix:'%', kind:'pct', min:1,   max:3,   color:'#b39ddb' },
  { stat:'critPts',  label:'CRIT',  suffix:'%', kind:'pts', min:0.2, max:0.6, color:'#ffd54f' },
  { stat:'dodgePts', label:'DODGE', suffix:'%', kind:'pts', min:0.1, max:0.5, color:'#4dd0e1' },
];
const AFFIX_BY_STAT = Object.fromEntries(AFFIX_POOL.map(a => [a.stat, a]));

// Affix SLOT count = base-by-tier (T1-3:0 · T4-7:1 · T8-9:2) + rarity slotBonus.
function affixBaseSlotsForTier(tier) { if (!tier || tier < 4) return 0; return tier < 8 ? 1 : 2; }
function affixSlots(tier, rarityId) { return affixBaseSlotsForTier(tier) + (RARITY_BY_ID[rarityId]?.slotBonus || 0); }
// Refine-grade scaling for affix magnitude (G1..G5): +12% per grade above 1.
function affixGradeMult(grade) { return 1 + 0.12 * ((grade || 1) - 1); }
// Display helpers (single source of truth for instance-rarity look).
function rarityMeta(id) { return RARITY_BY_ID[id] || RARITY_BY_ID.common; }
function affixLabel(a) { const m = AFFIX_BY_STAT[a.stat]; return m ? `+${a.val}${m.suffix} ${m.label}` : `+${a.val} ${a.stat}`; }


const ITEMS_DB = {
  // ── DUNGEON DROP WEAPONS ─────────────────────────────────────
  iron_sword:       {id:'iron_sword',       name:'Iron Sword',       slot:'weapon',   rarity:'common',    emoji:'🗡️', stats:{STR:3,ATK:8},                           desc:'A reliable iron sword for beginners.'},
  steel_blade:      {id:'steel_blade',      name:'Steel Blade',      slot:'weapon',   rarity:'rare',      emoji:'⚔️', stats:{STR:8,ATK:18,DEX:3},                    desc:'A well-balanced steel blade.'},
  shadow_edge:      {id:'shadow_edge',      name:'Shadow Edge',      slot:'weapon',   rarity:'epic',      emoji:'🗡️', stats:{STR:18,ATK:35,DEX:8,critBonus:5},        desc:'Forged in shadow essence.'},
  void_blade:       {id:'void_blade',       name:'Void Blade',       slot:'weapon',   rarity:'legendary', emoji:'⚔️', stats:{STR:30,ATK:60,DEX:15,critBonus:10},      desc:'A blade that cuts through reality itself.'},
  // ── DUNGEON DROP ARMOR ───────────────────────────────────────
  leather_armor:    {id:'leather_armor',    name:'Leather Armor',    slot:'armor',    rarity:'common',    emoji:'🥋', stats:{CON:3,DEF:5},                            desc:'Basic leather protection.'},
  chain_mail:       {id:'chain_mail',       name:'Chain Mail',       slot:'armor',    rarity:'rare',      emoji:'🪖', stats:{CON:8,DEF:15,HP:30},                     desc:'Interlocked metal rings.'},
  guardian_plate:   {id:'guardian_plate',   name:'Guardian Plate',   slot:'armor',    rarity:'epic',      emoji:'🛡️', stats:{CON:18,DEF:32,HP:80,blockBonus:5},        desc:'Blessed by ancient guardians.'},
  dragon_armor:     {id:'dragon_armor',     name:'Dragon Armor',     slot:'armor',    rarity:'legendary', emoji:'🐉', stats:{CON:30,DEF:55,HP:150,blockBonus:10},      desc:'Scales of an ancient dragon.'},
  // ── DUNGEON DROP HELMET ──────────────────────────────────────
  iron_helm:        {id:'iron_helm',        name:'Iron Helm',        slot:'helmet',   rarity:'common',    emoji:'⛑️',  stats:{CON:2,DEF:3},                            desc:'Simple iron helmet.'},
  mage_hat:         {id:'mage_hat',         name:'Mage Hat',         slot:'helmet',   rarity:'rare',      emoji:'🎩', stats:{INT:8,VOL:3,MP:20},                      desc:'Enhances magical affinity.'},
  void_crown:       {id:'void_crown',       name:'Void Crown',       slot:'helmet',   rarity:'epic',      emoji:'👑', stats:{INT:18,VOL:10,MP:60,CHA:5},               desc:'Crown radiating void energy.'},
  // ── DUNGEON DROP NECKLACE ────────────────────────────────────
  health_amulet:    {id:'health_amulet',    name:'Health Amulet',    slot:'necklace', rarity:'common',    emoji:'📿', stats:{CON:3,HP:25},                            desc:'Grants minor vitality.'},
  wisdom_pendant:   {id:'wisdom_pendant',   name:'Wisdom Pendant',   slot:'necklace', rarity:'rare',      emoji:'🔮', stats:{INT:6,VOL:6,MP:35},                      desc:'Enhances mental clarity.'},
  chaos_pendant:    {id:'chaos_pendant',    name:'Chaos Pendant',    slot:'necklace', rarity:'epic',      emoji:'💎', stats:{STR:8,INT:8,VOL:8,CHA:8},                 desc:'Swirling with chaotic energy.'},
  // ── DUNGEON DROP EARRINGS ────────────────────────────────────
  copper_earring:   {id:'copper_earring',   name:'Copper Earring',   slot:'earring',  rarity:'common',    emoji:'💎', stats:{DEX:2},                                  desc:'Simple copper earrings.'},
  swift_earring:    {id:'swift_earring',    name:'Swift Earring',    slot:'earring',  rarity:'rare',      emoji:'💎', stats:{DEX:7,dodgeBonus:3},                      desc:'Grants swifter reactions.'},
  void_earring:     {id:'void_earring',     name:'Void Earring',     slot:'earring',  rarity:'epic',      emoji:'💎', stats:{DEX:15,VOL:8,dodgeBonus:7},               desc:'Resonates with the void.'},
  // ── DUNGEON DROP SHIELD ──────────────────────────────────────
  wooden_shield:    {id:'wooden_shield',    name:'Wooden Shield',    slot:'shield',   rarity:'common',    emoji:'🛡️', stats:{CON:2,DEF:6},                            desc:'A sturdy wooden shield.'},
  iron_shield:      {id:'iron_shield',      name:'Iron Shield',      slot:'shield',   rarity:'rare',      emoji:'🛡️', stats:{CON:6,DEF:14,blockBonus:5},               desc:'Solid iron defense.'},
  // ── DUNGEON DROP BRACELET ────────────────────────────────────
  power_bracelet:   {id:'power_bracelet',   name:'Power Bracelet',   slot:'bracelet', rarity:'rare',      emoji:'💍', stats:{STR:5,INT:3},                             desc:'Channels inner power.'},
  arcane_cuff:      {id:'arcane_cuff',      name:'Arcane Cuff',      slot:'bracelet', rarity:'epic',      emoji:'💍', stats:{INT:14,VOL:9,MP:45},                      desc:'Resonates with arcane frequencies.'},
  // ── DUNGEON DROP BELT ────────────────────────────────────────
  leather_belt:     {id:'leather_belt',     name:'Leather Belt',     slot:'belt',     rarity:'common',    emoji:'🏷️', stats:{CON:2,HP:20},                            desc:'Holds everything in place.'},
  warrior_belt:     {id:'warrior_belt',     name:'Warrior Belt',     slot:'belt',     rarity:'rare',      emoji:'🏷️', stats:{STR:4,CON:5,HP:40},                      desc:'Worn by hardened warriors.'},
  // ── DUNGEON DROP BOOTS ───────────────────────────────────────
  leather_boots:    {id:'leather_boots',    name:'Leather Boots',    slot:'boots',    rarity:'common',    emoji:'👟', stats:{DEX:2},                                  desc:'Light and comfortable.'},
  swift_boots:      {id:'swift_boots',      name:'Swift Boots',      slot:'boots',    rarity:'rare',      emoji:'👢', stats:{DEX:8,dodgeBonus:4},                      desc:'Enchanted for quick movement.'},
  shadow_boots:     {id:'shadow_boots',     name:'Shadow Boots',     slot:'boots',    rarity:'epic',      emoji:'👢', stats:{DEX:16,dodgeBonus:9},                     desc:'Leave no trace.'},
  // ── POTIONS ──────────────────────────────────────────────────
  hp_pot_s:         {id:'hp_pot_s',         name:'HP Potion (S)',     slot:null, rarity:'common', emoji:'🧪', healHP:50,  stackable:true, stats:{}, desc:'Restores 50 HP in combat.'},
  hp_pot_m:         {id:'hp_pot_m',         name:'HP Potion (M)',     slot:null, rarity:'rare',   emoji:'⚗️', healHP:150, stackable:true, stats:{}, desc:'Restores 150 HP in combat.'},
  hp_pot_l:         {id:'hp_pot_l',         name:'HP Potion (L)',     slot:null, rarity:'epic',   emoji:'🍶', healHP:350, stackable:true, stats:{}, desc:'Restores 350 HP in combat.'},
  mp_pot_s:         {id:'mp_pot_s',         name:'MP Potion (S)',     slot:null, rarity:'common', emoji:'💧', healMP:30,  stackable:true, stats:{}, desc:'Restores 30 MP in combat.'},
  mp_pot_m:         {id:'mp_pot_m',         name:'MP Potion (M)',     slot:null, rarity:'rare',   emoji:'💦', healMP:80,  stackable:true, stats:{}, desc:'Restores 80 MP in combat.'},
  // ── DUNGEON MATERIALS ─────────────────────────────────────────
  monster_gem:      {id:'monster_gem',      name:'Monster Gem',       slot:null, rarity:'common', emoji:'💠', stackable:true, stats:{}, desc:'Dropped by monsters.'},
  dragon_scale:     {id:'dragon_scale',     name:'Dragon Scale',      slot:null, rarity:'rare',   emoji:'🐉', stackable:true, stats:{}, desc:'Rare scale from a dragon.'},
  void_crystal:     {id:'void_crystal',     name:'Void Crystal',      slot:null, rarity:'epic',   emoji:'🔮', stackable:true, stats:{}, desc:'Fragment of void energy.'},
  // ── WEEKLY BOSS EXCLUSIVE ────────────────────────────────────
  champions_ring:   {id:'champions_ring',   name:"Champion's Ring",   slot:'bracelet', rarity:'legendary', emoji:'💍', stats:{STR:12,INT:12,VOL:12,CON:12,DEX:12,CHA:12}, desc:'Forged from a perfect week. All disciplines in harmony.'},

  // ── LEGACY FORGE ITEMS (kept for backwards compat, no longer craftable) ──────
  work_iron_bracers:    {id:'work_iron_bracers',    name:'Iron Bracers',        slot:'bracelet', rarity:'common',    emoji:'🥊', crafted:true, legacy:true, stats:{STR:4,CON:2},                          desc:'Hammered from solid timber.'},
  work_war_hammer:      {id:'work_war_hammer',      name:'War Hammer',          slot:'weapon',   rarity:'uncommon',  emoji:'🔨', crafted:true, legacy:true, stats:{STR:12,ATK:18,CON:3},                  desc:'Heavy and brutal.'},
  work_great_axe:       {id:'work_great_axe',       name:'Great Axe',           slot:'weapon',   rarity:'rare',      emoji:'🪓', crafted:true, legacy:true, stats:{STR:25,ATK:35,CON:5},                  desc:'Demands discipline to wield.'},
  work_warlord_helm:    {id:'work_warlord_helm',    name:"Warlord's Helm",      slot:'helmet',   rarity:'rare',      emoji:'⚔️', crafted:true, legacy:true, stats:{STR:15,CON:12},                         desc:'Worn by those who lead from the front.'},
  work_champions_blade: {id:'work_champions_blade', name:"Champion's Blade",    slot:'weapon',   rarity:'epic',      emoji:'⚔️', crafted:true, legacy:true, stats:{STR:32,ATK:50,DEX:10,CON:8},            desc:'The mark of someone who shows up every day.'},
  work_scholar_ring:    {id:'work_scholar_ring',    name:"Scholar's Ring",      slot:'bracelet', rarity:'common',    emoji:'💍', crafted:true, legacy:true, stats:{INT:4,VOL:2},                           desc:'Focuses the mind.'},
  work_sage_circlet:    {id:'work_sage_circlet',    name:"Sage's Circlet",      slot:'helmet',   rarity:'uncommon',  emoji:'🔮', crafted:true, legacy:true, stats:{INT:10,VOL:6,MP:20},                    desc:'Worn by those who think deeply.'},
  work_arcane_pendant:  {id:'work_arcane_pendant',  name:'Arcane Pendant',      slot:'necklace', rarity:'rare',      emoji:'📿', crafted:true, legacy:true, stats:{INT:18,VOL:10,MP:40},                   desc:'Crystallized thought.'},
  work_archmage_robe:   {id:'work_archmage_robe',   name:"Archmage's Robe",     slot:'armor',    rarity:'rare',      emoji:'🌌', crafted:true, legacy:true, stats:{INT:20,VOL:12,CHA:6,MP:50},             desc:'Layers of arcane knowledge.'},
  work_eternal_crown:   {id:'work_eternal_crown',   name:'Eternal Crown',       slot:'helmet',   rarity:'epic',      emoji:'👑', crafted:true, legacy:true, stats:{INT:28,VOL:18,CHA:10,MP:80},            desc:'Reserved for those who never stop learning.'},
  work_crystal_earring: {id:'work_crystal_earring', name:'Crystal Earring',     slot:'earring',  rarity:'common',    emoji:'💎', crafted:true, legacy:true, stats:{CHA:4,DEX:2},                           desc:'Carries the spark of creative energy.'},
  work_prism_amulet:    {id:'work_prism_amulet',    name:'Prism Amulet',        slot:'necklace', rarity:'uncommon',  emoji:'🌈', crafted:true, legacy:true, stats:{CHA:10,DEX:6},                          desc:'Bends light. Bends perception.'},
  work_phantom_boots:   {id:'work_phantom_boots',   name:'Phantom Boots',       slot:'boots',    rarity:'rare',      emoji:'👢', crafted:true, legacy:true, stats:{CHA:8,DEX:16,dodgeBonus:5},             desc:'Light as inspiration.'},
  work_artists_vestment:{id:'work_artists_vestment',name:"Artist's Vestment",   slot:'armor',    rarity:'rare',      emoji:'🎨', crafted:true, legacy:true, stats:{CHA:20,DEX:12},                         desc:'Woven from creative output.'},
  work_prismatic_garb:  {id:'work_prismatic_garb',  name:'Prismatic Garb',      slot:'armor',    rarity:'epic',      emoji:'✨', crafted:true, legacy:true, stats:{CHA:30,DEX:22,dodgeBonus:8},            desc:'Shifts like light.'},
  work_steel_barrier:   {id:'work_steel_barrier',   name:'Steel Barrier',       slot:'shield',   rarity:'common',    emoji:'🛡', crafted:true, legacy:true, stats:{CON:4,DEF:8},                           desc:'Simple. Solid. Reliable.'},
  work_iron_fortress:   {id:'work_iron_fortress',   name:'Iron Fortress',       slot:'armor',    rarity:'uncommon',  emoji:'🦾', crafted:true, legacy:true, stats:{CON:12,DEF:18,HP:30},                   desc:'Heavy protection.'},
  work_guardian_helm:   {id:'work_guardian_helm',   name:'Guardian Helm',       slot:'helmet',   rarity:'uncommon',  emoji:'⛑️',  crafted:true, legacy:true, stats:{CON:10,DEF:12,HP:25},                   desc:'Keeps the head clear.'},
  work_engineers_belt:  {id:'work_engineers_belt',  name:"Engineer's Belt",     slot:'belt',     rarity:'uncommon',  emoji:'⚙️', crafted:true, legacy:true, stats:{CON:10,HP:45},                          desc:'Every loop tightened.'},
  work_celestial_plate: {id:'work_celestial_plate', name:'Celestial Plate',     slot:'armor',    rarity:'epic',      emoji:'🔩', crafted:true, legacy:true, stats:{CON:28,INT:14,DEF:38,HP:90},            desc:'Engineered to last.'},
  work_dragonbone_greaves:{id:'work_dragonbone_greaves',name:'Dragonbone Greaves',slot:'boots',  rarity:'legendary', emoji:'🐉', crafted:true, legacy:true, stats:{STR:48,CON:20,DEX:15,ATK:25},           desc:'Forged from ancient bones.'},
  work_eternal_codex:   {id:'work_eternal_codex',   name:'Eternal Codex',       slot:'belt',     rarity:'legendary', emoji:'📖', crafted:true, legacy:true, stats:{INT:42,VOL:28,CHA:12,MP:100},           desc:'Every clause written through relentless study.'},
  work_aurora_cuffs:    {id:'work_aurora_cuffs',    name:'Aurora Cuffs',        slot:'bracelet', rarity:'legendary', emoji:'🌌', crafted:true, legacy:true, stats:{CHA:42,DEX:28,VOL:15,dodgeBonus:10},    desc:'Woven from creative mastery.'},
  work_fortress_shield: {id:'work_fortress_shield', name:'Fortress Shield',     slot:'shield',   rarity:'legendary', emoji:'🔱', crafted:true, legacy:true, stats:{CON:42,DEF:58,HP:140,STR:10},           desc:'Engineered through operational excellence.'},

  // ── FORGE TREE ITEMS ──────────────────────────────────────────
  // tree: item progression tree id
  // tier: 1 (common) → 9 (legendary)
  // Unlocked via CRAFT_RECIPES reqCraft + reqWorkerLevel + reqPlayerLevel

  // ⚔️ SWORD TREE — weapon — timber primary, gear secondary, crystal T7+
  // img: Raven Fantasy Icons (16x16), path relative to project root
  f_swrd_1: {id:'f_swrd_1', name:'Bronze Sword',      slot:'weapon',   rarity:'common',    emoji:'🗡️', img:'Assets/Free - Raven Fantasy Icons/Free - Raven Fantasy Icons/Separated Files/16x16/fa1585.png', sprite:{col:3,row:2}, crafted:true, tree:'swrd', tier:1, stats:{STR:2,ATK:5},                        desc:'Hold it wrong, swing it worse. Everyone starts here.'},
  f_swrd_2: {id:'f_swrd_2', name:'Iron Sword',         slot:'weapon',   rarity:'common',    emoji:'🗡️', img:'Assets/Free - Raven Fantasy Icons/Free - Raven Fantasy Icons/Separated Files/16x16/fa1588.png', sprite:{col:5,row:4}, crafted:true, tree:'swrd', tier:2, stats:{STR:4,ATK:10},                       desc:"Doesn't miss because you haven't earned misses yet."},
  f_swrd_3: {id:'f_swrd_3', name:'Steel Blade',        slot:'weapon',   rarity:'uncommon',  emoji:'⚔️', img:'Assets/Free - Raven Fantasy Icons/Free - Raven Fantasy Icons/Separated Files/16x16/fa1601.png', sprite:{col:3,row:0}, crafted:true, tree:'swrd', tier:3, stats:{STR:7,ATK:17,DEX:2},                 desc:'Sharp because you stopped putting it down.'},
  f_swrd_4: {id:'f_swrd_4', name:'Bastard Sword',      slot:'weapon',   rarity:'uncommon',  emoji:'⚔️', img:'Assets/Free - Raven Fantasy Icons/Free - Raven Fantasy Icons/Separated Files/16x16/fa1665.png', sprite:{col:1,row:1}, crafted:true, tree:'swrd', tier:4, stats:{STR:11,ATK:26,DEX:4},                desc:"Too much sword for someone who almost quit last week."},
  f_swrd_5: {id:'f_swrd_5', name:'Crusader Claymore',  slot:'weapon',   rarity:'rare',      emoji:'⚔️', img:'Assets/Free - Raven Fantasy Icons/Free - Raven Fantasy Icons/Separated Files/16x16/fa1703.png', sprite:{col:4,row:2}, crafted:true, tree:'swrd', tier:5, stats:{STR:17,ATK:38,DEX:7},                desc:"Heavy enough to remind you, every swing, how many days it took."},
  f_swrd_6: {id:'f_swrd_6', name:'Obsidian Blade',     slot:'weapon',   rarity:'rare',      emoji:'🗡️', img:'Assets/Free - Raven Fantasy Icons/Free - Raven Fantasy Icons/Separated Files/16x16/fa1743.png', sprite:{col:5,row:2}, crafted:true, tree:'swrd', tier:6, stats:{STR:24,ATK:52,DEX:11,critBonus:2},   desc:"Cuts quiet. Doesn't need the reputation you gave it."},
  f_swrd_7: {id:'f_swrd_7', name:'Runic Greatsword',   slot:'weapon',   rarity:'epic',      emoji:'⚔️', img:'Assets/Free - Raven Fantasy Icons/Free - Raven Fantasy Icons/Separated Files/16x16/fa1715.png', sprite:{col:4,row:1}, crafted:true, tree:'swrd', tier:7, stats:{STR:33,ATK:70,DEX:16,critBonus:5},   desc:"Every rune is a day you didn't talk yourself out of it."},
  f_swrd_8: {id:'f_swrd_8', name:'Dragonfang',         slot:'weapon',   rarity:'epic',      emoji:'🔥', img:'Assets/Free - Raven Fantasy Icons/Free - Raven Fantasy Icons/Separated Files/16x16/fa1735.png', sprite:{col:4,row:0}, crafted:true, tree:'swrd', tier:8, stats:{STR:44,ATK:92,DEX:22,critBonus:8},   desc:'Only one of these gets made a year. This year, yours.'},
  f_swrd_9: {id:'f_swrd_9', name:"Godslayer's Edge",   slot:'weapon',   rarity:'legendary', emoji:'⚔️', img:'Assets/Free - Raven Fantasy Icons/Free - Raven Fantasy Icons/Separated Files/16x16/fa1754.png', sprite:{col:0,row:2}, crafted:true, tree:'swrd', tier:9, stats:{STR:58,ATK:120,DEX:30,critBonus:12}, desc:"Nothing left to forge past this. Just keep swinging it."},

  // 🥋 ARMOR TREE — armor — gear primary, timber secondary, scroll T7+
  // img: one transparent PNG per tier (armor1.png..armor9.png) — no sprite cropping.
  f_armr_1: {id:'f_armr_1', name:'Cloth Robe',          slot:'armor',    rarity:'common',    emoji:'👕', img:'img/forge/armor1.png', crafted:true, tree:'armr', tier:1, stats:{CON:2,DEF:3},                         desc:'Stops nothing. Starts everything.'},
  f_armr_2: {id:'f_armr_2', name:'Leather Tunic',        slot:'armor',    rarity:'common',    emoji:'🥋', img:'img/forge/armor2.png', crafted:true, tree:'armr', tier:2, stats:{CON:3,DEF:6},                         desc:'Held together by stitches and stubbornness.'},
  f_armr_3: {id:'f_armr_3', name:'Studded Leather',      slot:'armor',    rarity:'uncommon',  emoji:'🥋', img:'img/forge/armor3.png', crafted:true, tree:'armr', tier:3, stats:{CON:6,DEF:11,HP:15},                  desc:"Every stud's a rep you didn't skip."},
  f_armr_4: {id:'f_armr_4', name:'Chain Mail',           slot:'armor',    rarity:'uncommon',  emoji:'🪖', img:'img/forge/armor4.png', crafted:true, tree:'armr', tier:4, stats:{CON:10,DEF:18,HP:30},                 desc:'Interlinked like the days you stacked without breaking.'},
  f_armr_5: {id:'f_armr_5', name:'Scale Mail',           slot:'armor',    rarity:'rare',      emoji:'🦾', img:'img/forge/armor5.png', crafted:true, tree:'armr', tier:5, stats:{CON:16,DEF:28,HP:55},                 desc:'Each scale is a session that could have been skipped. None were.'},
  f_armr_6: {id:'f_armr_6', name:'Steel Plate',          slot:'armor',    rarity:'rare',      emoji:'🔩', img:'img/forge/armor6.png', crafted:true, tree:'armr', tier:6, stats:{CON:22,DEF:38,HP:80,blockBonus:2},    desc:"Heavier than your excuses. That's rather the point."},
  f_armr_7: {id:'f_armr_7', name:'Guardian Plate',       slot:'armor',    rarity:'epic',      emoji:'⚙️', img:'img/forge/armor7.png', crafted:true, tree:'armr', tier:7, stats:{CON:30,DEF:52,HP:120,blockBonus:4},   desc:'Blessed by nobody. Earned by everyone who kept going.'},
  f_armr_8: {id:'f_armr_8', name:'Dragon Scale Armor',   slot:'armor',    rarity:'epic',      emoji:'🐉', img:'img/forge/armor8.png', crafted:true, tree:'armr', tier:8, stats:{CON:40,DEF:68,HP:170,blockBonus:7},   desc:"Layered over months you'll forget you survived."},
  f_armr_9: {id:'f_armr_9', name:'Celestial Regalia',    slot:'armor',    rarity:'legendary', emoji:'✨', img:'img/forge/armor9.png', crafted:true, tree:'armr', tier:9, stats:{CON:54,DEF:90,HP:240,blockBonus:10},  desc:"Doesn't protect you from failure. You handled that part already."},

  // ⛑️ HELMET TREE — helmet — gear primary, scroll secondary, crystal T7+
  // img: one transparent PNG per tier (helmet1.png..helmet9.png) — no sprite cropping.
  f_helm_1: {id:'f_helm_1', name:'Padded Coif',       slot:'helmet',   rarity:'common',    emoji:'🪖', img:'img/forge/helmet1.png', crafted:true, tree:'helm', tier:1, stats:{CON:1,DEF:2},                          desc:'Protects the part of you that keeps almost quitting.'},
  f_helm_2: {id:'f_helm_2', name:'Iron Helm',          slot:'helmet',   rarity:'common',    emoji:'⛑️',  img:'img/forge/helmet2.png', crafted:true, tree:'helm', tier:2, stats:{CON:2,DEF:4},                          desc:'No frills. Neither is showing up on a Tuesday.'},
  f_helm_3: {id:'f_helm_3', name:"Soldier's Helm",     slot:'helmet',   rarity:'uncommon',  emoji:'⛑️',  img:'img/forge/helmet3.png', crafted:true, tree:'helm', tier:3, stats:{CON:5,DEF:8,STR:2},                   desc:'Worn by people who stopped negotiating with themselves.'},
  f_helm_4: {id:'f_helm_4', name:"Knight's Visor",     slot:'helmet',   rarity:'uncommon',  emoji:'🛡️', img:'img/forge/helmet4.png', crafted:true, tree:'helm', tier:4, stats:{CON:8,DEF:12,STR:5,INT:3},             desc:'Half plate, half spite. Both load-bearing.'},
  f_helm_5: {id:'f_helm_5', name:'Mage Hat',           slot:'helmet',   rarity:'rare',      emoji:'🎩', img:'img/forge/helmet5.png', crafted:true, tree:'helm', tier:5, stats:{INT:12,VOL:6,MP:22,CHA:3},             desc:'Focus, concentrated into felt and thread.'},
  f_helm_6: {id:'f_helm_6', name:'War Crown',          slot:'helmet',   rarity:'rare',      emoji:'👑', img:'img/forge/helmet6.png', crafted:true, tree:'helm', tier:6, stats:{CON:12,INT:14,DEF:14,MP:30},           desc:'Leads by outlasting everyone who doubted the streak.'},
  f_helm_7: {id:'f_helm_7', name:'Arcane Visage',      slot:'helmet',   rarity:'epic',      emoji:'🔮', img:'img/forge/helmet7.png', crafted:true, tree:'helm', tier:7, stats:{INT:22,VOL:15,MP:60,CHA:8},            desc:'Discipline, crystallized until it stopped looking optional.'},
  f_helm_8: {id:'f_helm_8', name:'Void Visor',         slot:'helmet',   rarity:'epic',      emoji:'🌌', img:'img/forge/helmet8.png', crafted:true, tree:'helm', tier:8, stats:{INT:30,VOL:22,MP:85,CHA:12},           desc:'Sees straight through the "tomorrow will be better" lie.'},
  f_helm_9: {id:'f_helm_9', name:'Eternal Crown',      slot:'helmet',   rarity:'legendary', emoji:'👑', img:'img/forge/helmet9.png', crafted:true, tree:'helm', tier:9, stats:{INT:42,VOL:30,MP:115,CHA:18},          desc:'For the ones who never once called themselves finished.'},

  // 🛡️ SHIELD TREE — shield — gear primary, timber secondary, scroll T7+
  // img: one PNG per tier (shield1.png..shield9.png), no sprite cropping needed.
  f_shld_1: {id:'f_shld_1', name:'Wooden Buckler',   slot:'shield',   rarity:'common',    emoji:'🛡️', img:'img/forge/shield1.png', crafted:true, tree:'shld', tier:1, stats:{CON:1,DEF:4},                          desc:'Rough wood, no plan. Holds anyway.'},
  f_shld_2: {id:'f_shld_2', name:'Iron Targe',        slot:'shield',   rarity:'common',    emoji:'🛡️', img:'img/forge/shield2.png', crafted:true, tree:'shld', tier:2, stats:{CON:2,DEF:7},                          desc:"Small and reliable, like a habit you finally kept."},
  f_shld_3: {id:'f_shld_3', name:'Steel Shield',      slot:'shield',   rarity:'uncommon',  emoji:'🛡️', img:'img/forge/shield3.png', crafted:true, tree:'shld', tier:3, stats:{CON:5,DEF:12,blockBonus:1},            desc:'Hammered flat, same as your excuses.'},
  f_shld_4: {id:'f_shld_4', name:"Knight's Shield",   slot:'shield',   rarity:'uncommon',  emoji:'🛡️', img:'img/forge/shield4.png', crafted:true, tree:'shld', tier:4, stats:{CON:8,DEF:18,HP:15,blockBonus:2},     desc:'Crest-emblazoned for someone who finally committed.'},
  f_shld_5: {id:'f_shld_5', name:'Tower Shield',      slot:'shield',   rarity:'rare',      emoji:'🛡️', img:'img/forge/shield5.png', crafted:true, tree:'shld', tier:5, stats:{CON:14,DEF:27,HP:35,blockBonus:3},    desc:'Unwieldy. So is everything actually worth carrying.'},
  f_shld_6: {id:'f_shld_6', name:'Bulwark',           slot:'shield',   rarity:'rare',      emoji:'🔱', img:'img/forge/shield6.png', crafted:true, tree:'shld', tier:6, stats:{CON:20,DEF:37,HP:60,blockBonus:5},    desc:'A fortress you built by not flinching.'},
  f_shld_7: {id:'f_shld_7', name:'Guardian Aegis',    slot:'shield',   rarity:'epic',      emoji:'🛡️', img:'img/forge/shield7.png', crafted:true, tree:'shld', tier:7, stats:{CON:28,DEF:50,HP:95,blockBonus:7},    desc:'Every name inscribed is a day you protected the streak.'},
  f_shld_8: {id:'f_shld_8', name:'Divine Barrier',    slot:'shield',   rarity:'epic',      emoji:'🔷', img:'img/forge/shield8.png', crafted:true, tree:'shld', tier:8, stats:{CON:38,DEF:65,HP:135,blockBonus:9},   desc:"Absorbs the hit. You've absorbed worse."},
  f_shld_9: {id:'f_shld_9', name:'Fortress Wall',     slot:'shield',   rarity:'legendary', emoji:'🔱', img:'img/forge/shield9.png', crafted:true, tree:'shld', tier:9, stats:{CON:50,DEF:85,HP:185,blockBonus:12},  desc:'Nothing gets through. Neither do you, in reverse.'},

  // 📿 NECKLACE TREE — necklace — scroll primary, crystal secondary, gear T7+
  f_neck_1: {id:'f_neck_1', name:'Copper Chain',        slot:'necklace', rarity:'common',    emoji:'📿', img:'img/forge/necklace1.png', crafted:true, tree:'neck', tier:1, stats:{INT:1,HP:8},                           desc:'Simple. Functional. Somewhere to start thinking clearly.'},
  f_neck_2: {id:'f_neck_2', name:'Jade Pendant',         slot:'necklace', rarity:'common',    emoji:'💚', img:'img/forge/necklace2.png', crafted:true, tree:'neck', tier:2, stats:{INT:2,VOL:1,HP:14},                   desc:'Carved from whatever calm you managed to find.'},
  f_neck_3: {id:'f_neck_3', name:'Mana Bead',            slot:'necklace', rarity:'uncommon',  emoji:'🔵', img:'img/forge/necklace3.png', crafted:true, tree:'neck', tier:3, stats:{INT:5,VOL:3,MP:12},                   desc:"Amplifies a focus you're only now learning to hold."},
  f_neck_4: {id:'f_neck_4', name:'Arcane Pendant',       slot:'necklace', rarity:'uncommon',  emoji:'📿', img:'img/forge/necklace4.png', crafted:true, tree:'neck', tier:4, stats:{INT:9,VOL:6,MP:25},                   desc:'Thought, crystallized until it stopped slipping away.'},
  f_neck_5: {id:'f_neck_5', name:"Scholar's Pendant",    slot:'necklace', rarity:'rare',      emoji:'🔮', img:'img/forge/necklace5.png', crafted:true, tree:'neck', tier:5, stats:{INT:14,VOL:9,MP:40,CHA:3},            desc:'For the studying you actually finished.'},
  f_neck_6: {id:'f_neck_6', name:'Void Chain',           slot:'necklace', rarity:'rare',      emoji:'💎', img:'img/forge/necklace6.png', crafted:true, tree:'neck', tier:6, stats:{INT:20,VOL:13,MP:60,CHA:6},           desc:'Tethered to whatever quiet you built for yourself.'},
  f_neck_7: {id:'f_neck_7', name:"Sage's Necklace",      slot:'necklace', rarity:'epic',      emoji:'📿', img:'img/forge/necklace7.png', crafted:true, tree:'neck', tier:7, stats:{INT:27,VOL:18,MP:85,CHA:10},          desc:"Worn by people who see past today's excuse."},
  f_neck_8: {id:'f_neck_8', name:'Elemental Seal',       slot:'necklace', rarity:'epic',      emoji:'🌀', img:'img/forge/necklace8.png', crafted:true, tree:'neck', tier:8, stats:{INT:36,VOL:24,MP:115,CHA:15},         desc:'Sealed shut by discipline, not luck.'},
  f_neck_9: {id:'f_neck_9', name:"Sage's Relic",         slot:'necklace', rarity:'legendary', emoji:'🔮', img:'img/forge/necklace9.png', crafted:true, tree:'neck', tier:9, stats:{INT:48,VOL:32,MP:155,CHA:22},         desc:'Wisdom, and proof you stuck around long enough to earn it.'},

  // 💎 EARRING TREE — earring — crystal primary, scroll secondary, timber T7+
  // (f_earr_2 has no img: the source sheet's hoop art has a hammered/stippled texture that
  // defeats background cleanup — every crop came out moth-eaten. Emoji fallback for that one.)
  f_earr_1: {id:'f_earr_1', name:'Copper Stud',      slot:'earring',  rarity:'common',    emoji:'💎', img:'img/forge/earring1.png', crafted:true, tree:'earr', tier:1, stats:{DEX:1,CHA:1},                           desc:'Easy to make, easier to almost skip.'},
  f_earr_2: {id:'f_earr_2', name:'Silver Hoop',       slot:'earring',  rarity:'common',    emoji:'💍', crafted:true, tree:'earr', tier:2, stats:{DEX:2,CHA:2},                           desc:"A classic shape, forged on a day you almost didn't."},
  f_earr_3: {id:'f_earr_3', name:'Gem Earring',       slot:'earring',  rarity:'uncommon',  emoji:'💠', img:'img/forge/earring3.png', crafted:true, tree:'earr', tier:3, stats:{DEX:5,CHA:4},                           desc:'Set with more precision than your excuses.'},
  f_earr_4: {id:'f_earr_4', name:'Wind Earring',      slot:'earring',  rarity:'uncommon',  emoji:'💨', img:'img/forge/earring4.png', crafted:true, tree:'earr', tier:4, stats:{DEX:8,CHA:6,dodgeBonus:1},              desc:"Whispers of speed you didn't have last month."},
  f_earr_5: {id:'f_earr_5', name:'Shadow Earring',    slot:'earring',  rarity:'rare',      emoji:'🌑', img:'img/forge/earring5.png', crafted:true, tree:'earr', tier:5, stats:{DEX:12,CHA:9,dodgeBonus:2},             desc:'Subtlety you had to practice like everything else.'},
  f_earr_6: {id:'f_earr_6', name:'Crystal Earring',   slot:'earring',  rarity:'rare',      emoji:'💎', img:'img/forge/earring6.png', crafted:true, tree:'earr', tier:6, stats:{DEX:17,CHA:13,dodgeBonus:4},            desc:'Carries a spark you almost let go out.'},
  f_earr_7: {id:'f_earr_7', name:'Arcane Earring',    slot:'earring',  rarity:'epic',      emoji:'✨', img:'img/forge/earring7.png', crafted:true, tree:'earr', tier:7, stats:{DEX:23,CHA:18,VOL:5,dodgeBonus:5},      desc:'Resonant frequency: showing up, on purpose, again.'},
  f_earr_8: {id:'f_earr_8', name:'Phoenix Jewel',     slot:'earring',  rarity:'epic',      emoji:'🔥', img:'img/forge/earring8.png', crafted:true, tree:'earr', tier:8, stats:{DEX:30,CHA:24,VOL:9,dodgeBonus:7},      desc:'Burns from every restart you refused to make permanent.'},
  f_earr_9: {id:'f_earr_9', name:'Star Fragment',     slot:'earring',  rarity:'legendary', emoji:'⭐', img:'img/forge/earring9.png', crafted:true, tree:'earr', tier:9, stats:{DEX:40,CHA:32,VOL:14,dodgeBonus:10},    desc:"A piece of something vast. You're closer to it than you think."},

  // 💍 BRACELET TREE — bracelet — timber primary, scroll secondary, crystal T7+
  f_brac_1: {id:'f_brac_1', name:'Leather Cuff',      slot:'bracelet', rarity:'common',    emoji:'🥊', img:'img/forge/bracelet1.png', crafted:true, tree:'brac', tier:1, stats:{STR:1,CON:1},                           desc:'A wrist wrap and a decision to keep going.'},
  f_brac_2: {id:'f_brac_2', name:'Iron Bracers',       slot:'bracelet', rarity:'common',    emoji:'🥊', img:'img/forge/bracelet2.png', crafted:true, tree:'brac', tier:2, stats:{STR:3,CON:2},                           desc:'Hammered for a grip that stopped shaking.'},
  f_brac_3: {id:'f_brac_3', name:'Steel Wristguard',   slot:'bracelet', rarity:'uncommon',  emoji:'🦾', img:'img/forge/bracelet3.png', crafted:true, tree:'brac', tier:3, stats:{STR:6,CON:4,DEX:2},                    desc:'Full coverage for someone done half-committing.'},
  f_brac_4: {id:'f_brac_4', name:"Scholar's Ring",     slot:'bracelet', rarity:'uncommon',  emoji:'💍', img:'img/forge/bracelet4.png', crafted:true, tree:'brac', tier:4, stats:{INT:7,VOL:4,DEX:3},                    desc:'Focuses a mind that used to scatter by 10am.'},
  f_brac_5: {id:'f_brac_5', name:'War Band',           slot:'bracelet', rarity:'rare',      emoji:'⚔️', img:'img/forge/bracelet5.png', crafted:true, tree:'brac', tier:5, stats:{STR:12,CON:6,DEX:5,ATK:8},             desc:"For hands that learned strength and patience don't compete."},
  f_brac_6: {id:'f_brac_6', name:'Power Bracelet',     slot:'bracelet', rarity:'rare',      emoji:'💪', img:'img/forge/bracelet6.png', crafted:true, tree:'brac', tier:6, stats:{STR:17,INT:8,CON:8,ATK:12},            desc:'Channels force you built one rep at a time.'},
  f_brac_7: {id:'f_brac_7', name:'Arcane Cuff',        slot:'bracelet', rarity:'epic',      emoji:'🔮', img:'img/forge/bracelet7.png', crafted:true, tree:'brac', tier:7, stats:{INT:20,VOL:14,MP:48,DEX:8},            desc:'Resonates at the frequency of someone done starting over.'},
  f_brac_8: {id:'f_brac_8', name:"Titan's Grip",       slot:'bracelet', rarity:'epic',      emoji:'🏆', img:'img/forge/bracelet8.png', crafted:true, tree:'brac', tier:8, stats:{STR:28,INT:16,CON:14,DEX:10,ATK:18},   desc:'Grips the future because you stopped letting go of today.'},
  f_brac_9: {id:'f_brac_9', name:'Ouroboros Band',     slot:'bracelet', rarity:'legendary', emoji:'🐍', img:'img/forge/bracelet9.png', crafted:true, tree:'brac', tier:9, stats:{STR:38,INT:28,CON:20,DEX:15,VOL:12},   desc:'The loop closes and starts again. Same as tomorrow.'},

  // 🥊 GAUNTLETS TREE — slot id 'belt' kept internally (save-data compat) — gear primary, timber secondary, scroll T7+
  // img: one transparent PNG per tier (gauntlets1.png..gauntlets9.png) — no sprite cropping.
  f_belt_1: {id:'f_belt_1', name:'Cloth Wraps',         slot:'belt',     rarity:'common',    emoji:'🥊', img:'img/forge/gauntlets1.png', crafted:true, tree:'belt', tier:1, stats:{CON:1,HP:8},                           desc:'Barely armor. Barely counts. You wore it anyway.'},
  f_belt_2: {id:'f_belt_2', name:'Leather Gauntlets',   slot:'belt',     rarity:'common',    emoji:'🥊', img:'img/forge/gauntlets2.png', crafted:true, tree:'belt', tier:2, stats:{CON:2,HP:18},                          desc:'Tanned hide for hands that keep showing up.'},
  f_belt_3: {id:'f_belt_3', name:'Reinforced Gauntlets',slot:'belt',     rarity:'uncommon',  emoji:'🥊', img:'img/forge/gauntlets3.png', crafted:true, tree:'belt', tier:3, stats:{CON:4,HP:32,DEF:3},                   desc:'Plated where you used to flinch.'},
  f_belt_4: {id:'f_belt_4', name:"Warrior's Gauntlets", slot:'belt',     rarity:'uncommon',  emoji:'🥊', img:'img/forge/gauntlets4.png', crafted:true, tree:'belt', tier:4, stats:{CON:7,HP:52,STR:4,DEF:5},             desc:'Thick leather, thicker resolve.'},
  f_belt_5: {id:'f_belt_5', name:'Battle Gauntlets',    slot:'belt',     rarity:'rare',      emoji:'🥊', img:'img/forge/gauntlets5.png', crafted:true, tree:'belt', tier:5, stats:{CON:11,HP:80,STR:7,DEF:8},            desc:'Made for hands that stopped settling for "good enough."'},
  f_belt_6: {id:'f_belt_6', name:"Engineer's Gauntlets",slot:'belt',     rarity:'rare',      emoji:'🔧', img:'img/forge/gauntlets6.png', crafted:true, tree:'belt', tier:6, stats:{CON:16,HP:115,STR:11,DEF:12},         desc:'Every joint tightened by someone who checks twice.'},
  f_belt_7: {id:'f_belt_7', name:"Titan's Grasp",       slot:'belt',     rarity:'epic',      emoji:'🏺', img:'img/forge/gauntlets7.png', crafted:true, tree:'belt', tier:7, stats:{CON:22,HP:160,STR:16,DEF:17},         desc:"A grip that isn't letting go of the routine."},
  f_belt_8: {id:'f_belt_8', name:"Champion's Gauntlets",slot:'belt',     rarity:'epic',      emoji:'🏆', img:'img/forge/gauntlets8.png', crafted:true, tree:'belt', tier:8, stats:{CON:30,HP:215,STR:21,DEF:23},         desc:"Earned across months you didn't post about."},
  f_belt_9: {id:'f_belt_9', name:'Eternal Gauntlets',   slot:'belt',     rarity:'legendary', emoji:'♾️', img:'img/forge/gauntlets9.png', crafted:true, tree:'belt', tier:9, stats:{CON:40,HP:280,STR:28,DEF:30},         desc:'Endurance, stitched until it became something you could wear.'},

  // 👢 BOOTS TREE — boots — crystal primary, timber secondary, gear T7+
  // img: one transparent PNG per tier (boots1.png..boots9.png) — no sprite cropping.
  f_boot_1: {id:'f_boot_1', name:'Sandals',            slot:'boots',    rarity:'common',    emoji:'👟', img:'img/forge/boots1.png', crafted:true, tree:'boot', tier:1, stats:{DEX:1,HP:5},                           desc:'The first step counts. This is it.'},
  f_boot_2: {id:'f_boot_2', name:'Leather Boots',       slot:'boots',    rarity:'common',    emoji:'👢', img:'img/forge/boots2.png', crafted:true, tree:'boot', tier:2, stats:{DEX:2,HP:10},                          desc:'Built for distance, not applause.'},
  f_boot_3: {id:'f_boot_3', name:"Ranger's Boots",      slot:'boots',    rarity:'uncommon',  emoji:'👢', img:'img/forge/boots3.png', crafted:true, tree:'boot', tier:3, stats:{DEX:5,HP:15,dodgeBonus:1},             desc:'For the days you showed up before you felt like it.'},
  f_boot_4: {id:'f_boot_4', name:"Scout's Greaves",     slot:'boots',    rarity:'uncommon',  emoji:'🥾', img:'img/forge/boots4.png', crafted:true, tree:'boot', tier:4, stats:{DEX:8,CON:3,dodgeBonus:2},             desc:'Terrain fights back. You keep walking anyway.'},
  f_boot_5: {id:'f_boot_5', name:'Swift Boots',         slot:'boots',    rarity:'rare',      emoji:'💨', img:'img/forge/boots5.png', crafted:true, tree:'boot', tier:5, stats:{DEX:13,CON:5,dodgeBonus:3},            desc:'Quiet steps for someone done announcing their plans.'},
  f_boot_6: {id:'f_boot_6', name:'Shadow Boots',        slot:'boots',    rarity:'rare',      emoji:'🌑', img:'img/forge/boots6.png', crafted:true, tree:'boot', tier:6, stats:{DEX:19,CON:8,dodgeBonus:5},            desc:'Leave no trace. Leave the excuses behind too.'},
  f_boot_7: {id:'f_boot_7', name:'Storm Treads',        slot:'boots',    rarity:'epic',      emoji:'⚡', img:'img/forge/boots7.png', crafted:true, tree:'boot', tier:7, stats:{DEX:26,CON:12,dodgeBonus:7},           desc:'Speed that only comes from the rep, never the pep talk.'},
  f_boot_8: {id:'f_boot_8', name:'Phantom Steps',       slot:'boots',    rarity:'epic',      emoji:'👻', img:'img/forge/boots8.png', crafted:true, tree:'boot', tier:8, stats:{DEX:34,CON:16,dodgeBonus:9},          desc:'React before the doubt finishes its sentence.'},
  f_boot_9: {id:'f_boot_9', name:'Void Walker',         slot:'boots',    rarity:'legendary', emoji:'🌌', img:'img/forge/boots9.png', crafted:true, tree:'boot', tier:9, stats:{DEX:45,CON:22,dodgeBonus:12},         desc:'Walks like stopping was never actually an option.'},
};

const SELL_PRICES = { common: 2, uncommon: 5, rare: 8, epic: 25, legendary: 80 };

// ── Craft durations by rarity (ms) ─────────────────────────────
// Common <1h · Uncommon 3h · Rare 8h · Epic 16h · Legendary 24h
const CRAFT_DURATION_MS = {
  common:    45 * 60 * 1000,
  uncommon:   3 * 60 * 60 * 1000,
  rare:       8 * 60 * 60 * 1000,
  epic:      16 * 60 * 60 * 1000,
  legendary: 24 * 60 * 60 * 1000,
};
