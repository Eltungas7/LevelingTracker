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
  // ── CRAFTABLE GEAR (Work Forge) ─────────────────────────────
  // Physical / Timber → STR + CON
  work_iron_bracers:   {id:'work_iron_bracers',   name:'Iron Bracers',       slot:'bracelet', rarity:'common',   emoji:'🥊', crafted:true, stats:{STR:4,CON:2},                         desc:'Hammered from solid timber. Strengthens the grip.'},
  work_war_hammer:     {id:'work_war_hammer',     name:'War Hammer',         slot:'weapon',   rarity:'uncommon', emoji:'🔨', crafted:true, stats:{STR:12,ATK:18,CON:3},                  desc:'Heavy and brutal. Built for serious work.'},
  work_great_axe:      {id:'work_great_axe',      name:'Great Axe',          slot:'weapon',   rarity:'rare',     emoji:'🪓', crafted:true, stats:{STR:25,ATK:35,CON:5},                  desc:'Demands discipline to wield. Rewards power.'},
  work_warlord_helm:   {id:'work_warlord_helm',   name:'Warlord\'s Helm',    slot:'helmet',   rarity:'rare',     emoji:'⚔️', crafted:true, stats:{STR:15,CON:12},                         desc:'Worn by those who lead from the front.'},
  work_champions_blade:{id:'work_champions_blade',name:'Champion\'s Blade',  slot:'weapon',   rarity:'epic',     emoji:'⚔️', crafted:true, stats:{STR:32,ATK:50,DEX:10,CON:8},            desc:'The mark of someone who shows up every day.'},
  // Mental / Scroll → INT + VOL
  work_scholar_ring:   {id:'work_scholar_ring',   name:'Scholar\'s Ring',    slot:'bracelet', rarity:'common',   emoji:'💍', crafted:true, stats:{INT:4,VOL:2},                           desc:'Focuses the mind. A small but steady edge.'},
  work_sage_circlet:   {id:'work_sage_circlet',   name:'Sage\'s Circlet',    slot:'helmet',   rarity:'uncommon', emoji:'🔮', crafted:true, stats:{INT:10,VOL:6,MP:20},                    desc:'Worn by those who think deeply and clearly.'},
  work_arcane_pendant: {id:'work_arcane_pendant', name:'Arcane Pendant',     slot:'necklace', rarity:'rare',     emoji:'📿', crafted:true, stats:{INT:18,VOL:10,MP:40},                   desc:'Crystallized thought. Knowledge made tangible.'},
  work_archmage_robe:  {id:'work_archmage_robe',  name:'Archmage\'s Robe',   slot:'armor',    rarity:'rare',     emoji:'🌌', crafted:true, stats:{INT:20,VOL:12,CHA:6,MP:50},             desc:'Layers of arcane knowledge woven into fabric.'},
  work_eternal_crown:  {id:'work_eternal_crown',  name:'Eternal Crown',      slot:'helmet',   rarity:'epic',     emoji:'👑', crafted:true, stats:{INT:28,VOL:18,CHA:10,MP:80},            desc:'Reserved for those who never stop learning.'},
  // Creative / Crystal → CHA + DEX
  work_crystal_earring:{id:'work_crystal_earring',name:'Crystal Earring',    slot:'earring',  rarity:'common',   emoji:'💎', crafted:true, stats:{CHA:4,DEX:2},                           desc:'Carries the spark of creative energy.'},
  work_prism_amulet:   {id:'work_prism_amulet',   name:'Prism Amulet',       slot:'necklace', rarity:'uncommon', emoji:'🌈', crafted:true, stats:{CHA:10,DEX:6},                          desc:'Bends light. Bends perception.'},
  work_phantom_boots:  {id:'work_phantom_boots',  name:'Phantom Boots',      slot:'boots',    rarity:'rare',     emoji:'👢', crafted:true, stats:{CHA:8,DEX:16,dodgeBonus:5},             desc:'Light as inspiration. Fast as a new idea.'},
  work_artists_vestment:{id:'work_artists_vestment',name:'Artist\'s Vestment',slot:'armor',   rarity:'rare',     emoji:'🎨', crafted:true, stats:{CHA:20,DEX:12},                         desc:'Woven from creative output and focused intent.'},
  work_prismatic_garb: {id:'work_prismatic_garb', name:'Prismatic Garb',     slot:'armor',    rarity:'epic',     emoji:'✨', crafted:true, stats:{CHA:30,DEX:22,dodgeBonus:8},            desc:'Shifts like light. A masterwork of craft.'},
  // Operational / Gear → CON + DEF + HP
  work_steel_barrier:  {id:'work_steel_barrier',  name:'Steel Barrier',      slot:'shield',   rarity:'common',   emoji:'🛡', crafted:true, stats:{CON:4,DEF:8},                           desc:'Simple. Solid. Reliable.'},
  work_iron_fortress:  {id:'work_iron_fortress',  name:'Iron Fortress',      slot:'armor',    rarity:'uncommon', emoji:'🦾', crafted:true, stats:{CON:12,DEF:18,HP:30},                   desc:'Heavy protection for those who keep systems running.'},
  work_guardian_helm:  {id:'work_guardian_helm',  name:'Guardian Helm',      slot:'helmet',   rarity:'uncommon', emoji:'⛑️',  crafted:true, stats:{CON:10,DEF:12,HP:25},                   desc:'Keeps the head clear. Keeps the team safe.'},
  work_engineers_belt: {id:'work_engineers_belt', name:'Engineer\'s Belt',   slot:'belt',     rarity:'uncommon', emoji:'⚙️', crafted:true, stats:{CON:10,HP:45},                          desc:'Every loop tightened. Every system accounted for.'},
  work_celestial_plate:{id:'work_celestial_plate',name:'Celestial Plate',    slot:'armor',    rarity:'epic',     emoji:'🔩', crafted:true, stats:{CON:28,INT:14,DEF:38,HP:90},            desc:'Engineered to last. Reinforced by relentless iteration.'},
  // ── TIER 5 · MASTERWORK (250+ mats, mixed materials) ────────
  // Physical: boots slot (Champion's Blade is weapon; Masterwork fills boots)
  work_dragonbone_greaves: {id:'work_dragonbone_greaves', name:"Dragonbone Greaves",  slot:'boots',    rarity:'legendary', emoji:'🐉', crafted:true, stats:{STR:48,CON:20,DEX:15,ATK:25},         desc:'Forged from ancient bones. Demands months of physical devotion.'},
  // Mental: belt slot (Eternal Crown is helmet; Masterwork fills belt)
  work_eternal_codex:      {id:'work_eternal_codex',      name:"Eternal Codex",       slot:'belt',     rarity:'legendary', emoji:'📖', crafted:true, stats:{INT:42,VOL:28,CHA:12,MP:100},         desc:'Every clause written through relentless study and mental discipline.'},
  // Creative: earring slot (Prismatic Garb is armor; Masterwork fills earring)
  work_aurora_cuffs:       {id:'work_aurora_cuffs',       name:"Aurora Cuffs",        slot:'bracelet', rarity:'legendary', emoji:'🌌', crafted:true, stats:{CHA:42,DEX:28,VOL:15,dodgeBonus:10},  desc:'Woven from creative mastery. Impossible to replicate.'},
  // Operational: shield slot (Celestial Plate is armor; Masterwork fills shield)
  work_fortress_shield:    {id:'work_fortress_shield',    name:"Fortress Shield",      slot:'shield',   rarity:'legendary', emoji:'🔱', crafted:true, stats:{CON:42,DEF:58,HP:140,STR:10},         desc:'Engineered through months of operational excellence. Unbreakable.'},
  // Weekly Boss exclusive
  champions_ring:      {id:'champions_ring',      name:"Champion's Ring",   slot:'bracelet', rarity:'legendary', emoji:'💍', stats:{STR:12,INT:12,VOL:12,CON:12,DEX:12,CHA:12}, desc:'Forged from a perfect week. All disciplines in harmony.'},
};

const SELL_PRICES = { common: 2, uncommon: 5, rare: 8, epic: 25, legendary: 80 };

// ── Craft durations by rarity (ms) ───────────────────────────
const CRAFT_DURATION_MS = {
  common:    1 * 60 * 60 * 1000,
  uncommon:  4 * 60 * 60 * 1000,
  rare:     12 * 60 * 60 * 1000,
  epic:     24 * 60 * 60 * 1000,
  legendary: 48 * 60 * 60 * 1000,
};
