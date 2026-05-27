// ── Craft Recipes ─────────────────────────────────────────────
// cost keys match state.shopMaterials: timber, scroll, crystal, gear
// reqCraft: { [itemId]: N } — must have crafted N of that item before unlocking
// reqWorkerLevel: minimum Worker Level to unlock
// reqPlayerLevel: minimum Player Level to unlock (T8+ only)
// legacy: true — old recipes kept for queue/rush compat only, hidden from forge UI

const CRAFT_RECIPES = [
  // ── LEGACY (kept for craft-queue backwards compat, hidden from UI) ──────────
  { id:'rc_iron_bracers',       itemId:'work_iron_bracers',    legacy:true, cost:{ timber:10 } },
  { id:'rc_scholar_ring',       itemId:'work_scholar_ring',    legacy:true, cost:{ scroll:10 } },
  { id:'rc_crystal_earring',    itemId:'work_crystal_earring', legacy:true, cost:{ crystal:10 } },
  { id:'rc_steel_barrier',      itemId:'work_steel_barrier',   legacy:true, cost:{ gear:10 } },
  { id:'rc_war_hammer',         itemId:'work_war_hammer',      legacy:true, cost:{ timber:20, gear:6 } },
  { id:'rc_sage_circlet',       itemId:'work_sage_circlet',    legacy:true, cost:{ scroll:20, crystal:6 } },
  { id:'rc_prism_amulet',       itemId:'work_prism_amulet',    legacy:true, cost:{ crystal:20, scroll:6 } },
  { id:'rc_iron_fortress',      itemId:'work_iron_fortress',   legacy:true, cost:{ gear:20, timber:8 } },
  { id:'rc_guardian_helm',      itemId:'work_guardian_helm',   legacy:true, cost:{ gear:16, crystal:8 } },
  { id:'rc_engineers_belt',     itemId:'work_engineers_belt',  legacy:true, cost:{ gear:16, timber:8 } },
  { id:'rc_great_axe',          itemId:'work_great_axe',       legacy:true, cost:{ timber:40, gear:16 } },
  { id:'rc_warlord_helm',       itemId:'work_warlord_helm',    legacy:true, cost:{ timber:36, scroll:12 } },
  { id:'rc_arcane_pendant',     itemId:'work_arcane_pendant',  legacy:true, cost:{ scroll:40, crystal:16 } },
  { id:'rc_archmage_robe',      itemId:'work_archmage_robe',   legacy:true, cost:{ scroll:36, gear:12 } },
  { id:'rc_phantom_boots',      itemId:'work_phantom_boots',   legacy:true, cost:{ crystal:40, timber:12 } },
  { id:'rc_artists_vestment',   itemId:'work_artists_vestment',legacy:true, cost:{ crystal:36, scroll:10 } },
  { id:'rc_champions_blade',    itemId:'work_champions_blade', legacy:true, cost:{ timber:70, gear:40, crystal:20 } },
  { id:'rc_eternal_crown',      itemId:'work_eternal_crown',   legacy:true, cost:{ scroll:60, crystal:40, gear:16 } },
  { id:'rc_prismatic_garb',     itemId:'work_prismatic_garb',  legacy:true, cost:{ crystal:60, scroll:30, gear:20 } },
  { id:'rc_celestial_plate',    itemId:'work_celestial_plate', legacy:true, cost:{ gear:60, scroll:36, timber:24 } },
  { id:'rc_dragonbone_greaves', itemId:'work_dragonbone_greaves', legacy:true, cost:{ timber:120, gear:80, crystal:30, scroll:20 } },
  { id:'rc_eternal_codex',      itemId:'work_eternal_codex',   legacy:true, cost:{ scroll:120, crystal:80, gear:30, timber:20 } },
  { id:'rc_aurora_cuffs',       itemId:'work_aurora_cuffs',    legacy:true, cost:{ crystal:120, scroll:80, timber:30, gear:20 } },
  { id:'rc_fortress_shield',    itemId:'work_fortress_shield', legacy:true, cost:{ gear:120, timber:80, scroll:30, crystal:20 } },

  // ── FORGE PROGRESSION TREES ───────────────────────────────────────────────────
  // Tier costs follow a consistent ramp per tree type.
  // Primary (P) · Secondary (S) · Tertiary (T, from T7+)
  //
  // T1: 8P          T2: 14P         T3: 22P+6S      T4: 35P+12S
  // T5: 55P+20S     T6: 82P+30S     T7: 120P+44S+14T
  // T8: 170P+62S+22T  (+ reqPlayerLevel:25)
  // T9: 245P+90S+36T  (+ reqPlayerLevel:35)
  //
  // Prerequisites:
  //   T2: 2×T1           T3: 2×T2 WLv5     T4: 2×T3 WLv10
  //   T5: 1×T4 WLv15     T6: 1×T5 WLv20    T7: 1×T6 WLv28
  //   T8: 1×T7 WLv38 PLv25                 T9: 1×T8 WLv50 PLv35

  // ⚔️ SWORD PATH — timber(P), gear(S), crystal(T7+)
  { id:'r_swrd_1', itemId:'f_swrd_1', tree:'swrd', tier:1, cost:{ timber:8 } },
  { id:'r_swrd_2', itemId:'f_swrd_2', tree:'swrd', tier:2, cost:{ timber:14 },                        reqCraft:{ f_swrd_1:2 } },
  { id:'r_swrd_3', itemId:'f_swrd_3', tree:'swrd', tier:3, cost:{ timber:22, gear:6 },                reqCraft:{ f_swrd_2:2 }, reqWorkerLevel:5  },
  { id:'r_swrd_4', itemId:'f_swrd_4', tree:'swrd', tier:4, cost:{ timber:35, gear:12 },               reqCraft:{ f_swrd_3:2 }, reqWorkerLevel:10 },
  { id:'r_swrd_5', itemId:'f_swrd_5', tree:'swrd', tier:5, cost:{ timber:55, gear:20 },               reqCraft:{ f_swrd_4:1 }, reqWorkerLevel:15 },
  { id:'r_swrd_6', itemId:'f_swrd_6', tree:'swrd', tier:6, cost:{ timber:82, gear:30 },               reqCraft:{ f_swrd_5:1 }, reqWorkerLevel:20 },
  { id:'r_swrd_7', itemId:'f_swrd_7', tree:'swrd', tier:7, cost:{ timber:120, gear:44, crystal:14 },  reqCraft:{ f_swrd_6:1 }, reqWorkerLevel:28 },
  { id:'r_swrd_8', itemId:'f_swrd_8', tree:'swrd', tier:8, cost:{ timber:170, gear:62, crystal:22 },  reqCraft:{ f_swrd_7:1 }, reqWorkerLevel:38, reqPlayerLevel:25 },
  { id:'r_swrd_9', itemId:'f_swrd_9', tree:'swrd', tier:9, cost:{ timber:245, gear:90, crystal:36 },  reqCraft:{ f_swrd_8:1 }, reqWorkerLevel:50, reqPlayerLevel:35 },

  // 🥋 ARMOR PATH — gear(P), timber(S), scroll(T7+)
  { id:'r_armr_1', itemId:'f_armr_1', tree:'armr', tier:1, cost:{ gear:8 } },
  { id:'r_armr_2', itemId:'f_armr_2', tree:'armr', tier:2, cost:{ gear:14 },                          reqCraft:{ f_armr_1:2 } },
  { id:'r_armr_3', itemId:'f_armr_3', tree:'armr', tier:3, cost:{ gear:22, timber:6 },                reqCraft:{ f_armr_2:2 }, reqWorkerLevel:5  },
  { id:'r_armr_4', itemId:'f_armr_4', tree:'armr', tier:4, cost:{ gear:35, timber:12 },               reqCraft:{ f_armr_3:2 }, reqWorkerLevel:10 },
  { id:'r_armr_5', itemId:'f_armr_5', tree:'armr', tier:5, cost:{ gear:55, timber:20 },               reqCraft:{ f_armr_4:1 }, reqWorkerLevel:15 },
  { id:'r_armr_6', itemId:'f_armr_6', tree:'armr', tier:6, cost:{ gear:82, timber:30 },               reqCraft:{ f_armr_5:1 }, reqWorkerLevel:20 },
  { id:'r_armr_7', itemId:'f_armr_7', tree:'armr', tier:7, cost:{ gear:120, timber:44, scroll:14 },   reqCraft:{ f_armr_6:1 }, reqWorkerLevel:28 },
  { id:'r_armr_8', itemId:'f_armr_8', tree:'armr', tier:8, cost:{ gear:170, timber:62, scroll:22 },   reqCraft:{ f_armr_7:1 }, reqWorkerLevel:38, reqPlayerLevel:25 },
  { id:'r_armr_9', itemId:'f_armr_9', tree:'armr', tier:9, cost:{ gear:245, timber:90, scroll:36 },   reqCraft:{ f_armr_8:1 }, reqWorkerLevel:50, reqPlayerLevel:35 },

  // ⛑️ HELMET PATH — gear(P), scroll(S), crystal(T7+)
  { id:'r_helm_1', itemId:'f_helm_1', tree:'helm', tier:1, cost:{ gear:8 } },
  { id:'r_helm_2', itemId:'f_helm_2', tree:'helm', tier:2, cost:{ gear:14 },                          reqCraft:{ f_helm_1:2 } },
  { id:'r_helm_3', itemId:'f_helm_3', tree:'helm', tier:3, cost:{ gear:22, scroll:6 },                reqCraft:{ f_helm_2:2 }, reqWorkerLevel:5  },
  { id:'r_helm_4', itemId:'f_helm_4', tree:'helm', tier:4, cost:{ gear:35, scroll:12 },               reqCraft:{ f_helm_3:2 }, reqWorkerLevel:10 },
  { id:'r_helm_5', itemId:'f_helm_5', tree:'helm', tier:5, cost:{ gear:55, scroll:20 },               reqCraft:{ f_helm_4:1 }, reqWorkerLevel:15 },
  { id:'r_helm_6', itemId:'f_helm_6', tree:'helm', tier:6, cost:{ gear:82, scroll:30 },               reqCraft:{ f_helm_5:1 }, reqWorkerLevel:20 },
  { id:'r_helm_7', itemId:'f_helm_7', tree:'helm', tier:7, cost:{ gear:120, scroll:44, crystal:14 },  reqCraft:{ f_helm_6:1 }, reqWorkerLevel:28 },
  { id:'r_helm_8', itemId:'f_helm_8', tree:'helm', tier:8, cost:{ gear:170, scroll:62, crystal:22 },  reqCraft:{ f_helm_7:1 }, reqWorkerLevel:38, reqPlayerLevel:25 },
  { id:'r_helm_9', itemId:'f_helm_9', tree:'helm', tier:9, cost:{ gear:245, scroll:90, crystal:36 },  reqCraft:{ f_helm_8:1 }, reqWorkerLevel:50, reqPlayerLevel:35 },

  // 🛡️ SHIELD PATH — gear(P), timber(S), scroll(T7+)
  { id:'r_shld_1', itemId:'f_shld_1', tree:'shld', tier:1, cost:{ gear:8 } },
  { id:'r_shld_2', itemId:'f_shld_2', tree:'shld', tier:2, cost:{ gear:14 },                          reqCraft:{ f_shld_1:2 } },
  { id:'r_shld_3', itemId:'f_shld_3', tree:'shld', tier:3, cost:{ gear:22, timber:6 },                reqCraft:{ f_shld_2:2 }, reqWorkerLevel:5  },
  { id:'r_shld_4', itemId:'f_shld_4', tree:'shld', tier:4, cost:{ gear:35, timber:12 },               reqCraft:{ f_shld_3:2 }, reqWorkerLevel:10 },
  { id:'r_shld_5', itemId:'f_shld_5', tree:'shld', tier:5, cost:{ gear:55, timber:20 },               reqCraft:{ f_shld_4:1 }, reqWorkerLevel:15 },
  { id:'r_shld_6', itemId:'f_shld_6', tree:'shld', tier:6, cost:{ gear:82, timber:30 },               reqCraft:{ f_shld_5:1 }, reqWorkerLevel:20 },
  { id:'r_shld_7', itemId:'f_shld_7', tree:'shld', tier:7, cost:{ gear:120, timber:44, scroll:14 },   reqCraft:{ f_shld_6:1 }, reqWorkerLevel:28 },
  { id:'r_shld_8', itemId:'f_shld_8', tree:'shld', tier:8, cost:{ gear:170, timber:62, scroll:22 },   reqCraft:{ f_shld_7:1 }, reqWorkerLevel:38, reqPlayerLevel:25 },
  { id:'r_shld_9', itemId:'f_shld_9', tree:'shld', tier:9, cost:{ gear:245, timber:90, scroll:36 },   reqCraft:{ f_shld_8:1 }, reqWorkerLevel:50, reqPlayerLevel:35 },

  // 📿 NECKLACE PATH — scroll(P), crystal(S), gear(T7+)
  { id:'r_neck_1', itemId:'f_neck_1', tree:'neck', tier:1, cost:{ scroll:8 } },
  { id:'r_neck_2', itemId:'f_neck_2', tree:'neck', tier:2, cost:{ scroll:14 },                        reqCraft:{ f_neck_1:2 } },
  { id:'r_neck_3', itemId:'f_neck_3', tree:'neck', tier:3, cost:{ scroll:22, crystal:6 },             reqCraft:{ f_neck_2:2 }, reqWorkerLevel:5  },
  { id:'r_neck_4', itemId:'f_neck_4', tree:'neck', tier:4, cost:{ scroll:35, crystal:12 },            reqCraft:{ f_neck_3:2 }, reqWorkerLevel:10 },
  { id:'r_neck_5', itemId:'f_neck_5', tree:'neck', tier:5, cost:{ scroll:55, crystal:20 },            reqCraft:{ f_neck_4:1 }, reqWorkerLevel:15 },
  { id:'r_neck_6', itemId:'f_neck_6', tree:'neck', tier:6, cost:{ scroll:82, crystal:30 },            reqCraft:{ f_neck_5:1 }, reqWorkerLevel:20 },
  { id:'r_neck_7', itemId:'f_neck_7', tree:'neck', tier:7, cost:{ scroll:120, crystal:44, gear:14 },  reqCraft:{ f_neck_6:1 }, reqWorkerLevel:28 },
  { id:'r_neck_8', itemId:'f_neck_8', tree:'neck', tier:8, cost:{ scroll:170, crystal:62, gear:22 },  reqCraft:{ f_neck_7:1 }, reqWorkerLevel:38, reqPlayerLevel:25 },
  { id:'r_neck_9', itemId:'f_neck_9', tree:'neck', tier:9, cost:{ scroll:245, crystal:90, gear:36 },  reqCraft:{ f_neck_8:1 }, reqWorkerLevel:50, reqPlayerLevel:35 },

  // 💎 EARRING PATH — crystal(P), scroll(S), timber(T7+)
  { id:'r_earr_1', itemId:'f_earr_1', tree:'earr', tier:1, cost:{ crystal:8 } },
  { id:'r_earr_2', itemId:'f_earr_2', tree:'earr', tier:2, cost:{ crystal:14 },                       reqCraft:{ f_earr_1:2 } },
  { id:'r_earr_3', itemId:'f_earr_3', tree:'earr', tier:3, cost:{ crystal:22, scroll:6 },             reqCraft:{ f_earr_2:2 }, reqWorkerLevel:5  },
  { id:'r_earr_4', itemId:'f_earr_4', tree:'earr', tier:4, cost:{ crystal:35, scroll:12 },            reqCraft:{ f_earr_3:2 }, reqWorkerLevel:10 },
  { id:'r_earr_5', itemId:'f_earr_5', tree:'earr', tier:5, cost:{ crystal:55, scroll:20 },            reqCraft:{ f_earr_4:1 }, reqWorkerLevel:15 },
  { id:'r_earr_6', itemId:'f_earr_6', tree:'earr', tier:6, cost:{ crystal:82, scroll:30 },            reqCraft:{ f_earr_5:1 }, reqWorkerLevel:20 },
  { id:'r_earr_7', itemId:'f_earr_7', tree:'earr', tier:7, cost:{ crystal:120, scroll:44, timber:14 },reqCraft:{ f_earr_6:1 }, reqWorkerLevel:28 },
  { id:'r_earr_8', itemId:'f_earr_8', tree:'earr', tier:8, cost:{ crystal:170, scroll:62, timber:22 },reqCraft:{ f_earr_7:1 }, reqWorkerLevel:38, reqPlayerLevel:25 },
  { id:'r_earr_9', itemId:'f_earr_9', tree:'earr', tier:9, cost:{ crystal:245, scroll:90, timber:36 },reqCraft:{ f_earr_8:1 }, reqWorkerLevel:50, reqPlayerLevel:35 },

  // 💍 BRACELET PATH — timber(P), scroll(S), crystal(T7+)
  { id:'r_brac_1', itemId:'f_brac_1', tree:'brac', tier:1, cost:{ timber:8 } },
  { id:'r_brac_2', itemId:'f_brac_2', tree:'brac', tier:2, cost:{ timber:14 },                        reqCraft:{ f_brac_1:2 } },
  { id:'r_brac_3', itemId:'f_brac_3', tree:'brac', tier:3, cost:{ timber:22, scroll:6 },              reqCraft:{ f_brac_2:2 }, reqWorkerLevel:5  },
  { id:'r_brac_4', itemId:'f_brac_4', tree:'brac', tier:4, cost:{ timber:35, scroll:12 },             reqCraft:{ f_brac_3:2 }, reqWorkerLevel:10 },
  { id:'r_brac_5', itemId:'f_brac_5', tree:'brac', tier:5, cost:{ timber:55, scroll:20 },             reqCraft:{ f_brac_4:1 }, reqWorkerLevel:15 },
  { id:'r_brac_6', itemId:'f_brac_6', tree:'brac', tier:6, cost:{ timber:82, scroll:30 },             reqCraft:{ f_brac_5:1 }, reqWorkerLevel:20 },
  { id:'r_brac_7', itemId:'f_brac_7', tree:'brac', tier:7, cost:{ timber:120, scroll:44, crystal:14 },reqCraft:{ f_brac_6:1 }, reqWorkerLevel:28 },
  { id:'r_brac_8', itemId:'f_brac_8', tree:'brac', tier:8, cost:{ timber:170, scroll:62, crystal:22 },reqCraft:{ f_brac_7:1 }, reqWorkerLevel:38, reqPlayerLevel:25 },
  { id:'r_brac_9', itemId:'f_brac_9', tree:'brac', tier:9, cost:{ timber:245, scroll:90, crystal:36 },reqCraft:{ f_brac_8:1 }, reqWorkerLevel:50, reqPlayerLevel:35 },

  // ⚙️ BELT PATH — gear(P), timber(S), scroll(T7+)
  { id:'r_belt_1', itemId:'f_belt_1', tree:'belt', tier:1, cost:{ gear:8 } },
  { id:'r_belt_2', itemId:'f_belt_2', tree:'belt', tier:2, cost:{ gear:14 },                          reqCraft:{ f_belt_1:2 } },
  { id:'r_belt_3', itemId:'f_belt_3', tree:'belt', tier:3, cost:{ gear:22, timber:6 },                reqCraft:{ f_belt_2:2 }, reqWorkerLevel:5  },
  { id:'r_belt_4', itemId:'f_belt_4', tree:'belt', tier:4, cost:{ gear:35, timber:12 },               reqCraft:{ f_belt_3:2 }, reqWorkerLevel:10 },
  { id:'r_belt_5', itemId:'f_belt_5', tree:'belt', tier:5, cost:{ gear:55, timber:20 },               reqCraft:{ f_belt_4:1 }, reqWorkerLevel:15 },
  { id:'r_belt_6', itemId:'f_belt_6', tree:'belt', tier:6, cost:{ gear:82, timber:30 },               reqCraft:{ f_belt_5:1 }, reqWorkerLevel:20 },
  { id:'r_belt_7', itemId:'f_belt_7', tree:'belt', tier:7, cost:{ gear:120, timber:44, scroll:14 },   reqCraft:{ f_belt_6:1 }, reqWorkerLevel:28 },
  { id:'r_belt_8', itemId:'f_belt_8', tree:'belt', tier:8, cost:{ gear:170, timber:62, scroll:22 },   reqCraft:{ f_belt_7:1 }, reqWorkerLevel:38, reqPlayerLevel:25 },
  { id:'r_belt_9', itemId:'f_belt_9', tree:'belt', tier:9, cost:{ gear:245, timber:90, scroll:36 },   reqCraft:{ f_belt_8:1 }, reqWorkerLevel:50, reqPlayerLevel:35 },

  // 👢 BOOTS PATH — crystal(P), timber(S), gear(T7+)
  { id:'r_boot_1', itemId:'f_boot_1', tree:'boot', tier:1, cost:{ crystal:8 } },
  { id:'r_boot_2', itemId:'f_boot_2', tree:'boot', tier:2, cost:{ crystal:14 },                       reqCraft:{ f_boot_1:2 } },
  { id:'r_boot_3', itemId:'f_boot_3', tree:'boot', tier:3, cost:{ crystal:22, timber:6 },             reqCraft:{ f_boot_2:2 }, reqWorkerLevel:5  },
  { id:'r_boot_4', itemId:'f_boot_4', tree:'boot', tier:4, cost:{ crystal:35, timber:12 },            reqCraft:{ f_boot_3:2 }, reqWorkerLevel:10 },
  { id:'r_boot_5', itemId:'f_boot_5', tree:'boot', tier:5, cost:{ crystal:55, timber:20 },            reqCraft:{ f_boot_4:1 }, reqWorkerLevel:15 },
  { id:'r_boot_6', itemId:'f_boot_6', tree:'boot', tier:6, cost:{ crystal:82, timber:30 },            reqCraft:{ f_boot_5:1 }, reqWorkerLevel:20 },
  { id:'r_boot_7', itemId:'f_boot_7', tree:'boot', tier:7, cost:{ crystal:120, timber:44, gear:14 },  reqCraft:{ f_boot_6:1 }, reqWorkerLevel:28 },
  { id:'r_boot_8', itemId:'f_boot_8', tree:'boot', tier:8, cost:{ crystal:170, timber:62, gear:22 },  reqCraft:{ f_boot_7:1 }, reqWorkerLevel:38, reqPlayerLevel:25 },
  { id:'r_boot_9', itemId:'f_boot_9', tree:'boot', tier:9, cost:{ crystal:245, timber:90, gear:36 },  reqCraft:{ f_boot_8:1 }, reqWorkerLevel:50, reqPlayerLevel:35 },
];

// ── Item Refinement ────────────────────────────────────────────
// Stat multipliers at each grade (index 0 = Grade I)
const GRADE_MULT = [1.0, 1.35, 1.80, 2.40, 3.20];
// Cost multipliers per refinement step (G1→G2, G2→G3, G3→G4, G4→G5)
const REFINE_STEP_MULT = [1.0, 1.5, 2.0, 3.0];
const GRADE_LABELS = ['I', 'II', 'III', 'IV', 'V'];
const GRADE_COLORS = ['#9e9e9e', '#4dd0e1', '#82b1ff', '#ff8a65', '#ea80fc'];

// ── Guild Upgrades ─────────────────────────────────────────────────────────────
// Cost formula: baseCost × 1.7^(level-1), rounded to nearest 5
// Upgrades with customLevelCosts[] use those values directly.
// Total gold to max ALL upgrades ≈ 165,000g — roughly 7-9 months of heavy daily work.
// Grand Guild Hall uses 2× baseCost (most expensive single upgrade, ~45,000g total).
// minWorkerLevel: Worker Level required to purchase first level.
const GUILD_UPGRADES = [
  // ── GROWTH tier (habits, economy, XP) ─────────────────────────────────────
  { id:'hall',         name:'Grand Guild Hall',   emoji:'🏛️', maxLevel:10, baseCost:400, minWorkerLevel:1,
    effect:'habitAura',       perLevel:'+0.5% habit stat gains',
    desc:'Permanently boosts stat gains from all daily habits. Each level stacks.' },
  { id:'trade',        name:'Trade Post',         emoji:'🪙', maxLevel:6,  baseCost:300, minWorkerLevel:5,
    effect:'goldBonus',       perLevel:'+12% gold from work tasks',
    desc:'Increases gold earned from completing work tasks.' },
  { id:'scriptorium',  name:'Scriptorium',        emoji:'📜', maxLevel:6,  baseCost:375, minWorkerLevel:10,
    effect:'commissionBonus', perLevel:'+15% gold from commissions',
    desc:'Increases bonus gold awarded by completed commissions.' },
  { id:'patron_vault', name:"Patron's Vault",     emoji:'⚗️', maxLevel:5,  baseCost:450, minWorkerLevel:20,
    effect:'wxpBonus',        perLevel:'+10% Work XP earned',
    desc:'Increases Work XP gained from completing tasks and crafting.' },
  // ── FORGE tier (crafting, timing, queue) ──────────────────────────────────
  { id:'anvil',        name:'Forge Mastery',      emoji:'⚒️', maxLevel:7,  baseCost:225, minWorkerLevel:10,
    effect:'craftDiscount',   perLevel:'-8% craft material cost',
    desc:'Reduces the material cost of all forge recipes.' },
  { id:'warehouse',    name:'Material Cache',     emoji:'📦', maxLevel:5,  baseCost:240, minWorkerLevel:15,
    effect:'bonusMat',        perLevel:'+1 mat per dungeon stage',
    desc:'Adds bonus materials to every dungeon stage cleared.' },
  { id:'chronoforge',  name:'Chronoforge',        emoji:'⏱️', maxLevel:5,  baseCost:750, minWorkerLevel:25,
    effect:'forgeTime',       perLevel:'-10% forge craft time',
    desc:'Reduces the time required to complete all forge crafts. Stacks with Worker rank bonuses.' },
  { id:'forge_hall',   name:'Grand Forge Hall',   emoji:'🔥', maxLevel:2,  baseCost:4500, minWorkerLevel:35,
    effect:'forgeSlot',       perLevel:'+1 forge queue slot',
    customLevelCosts:[4500, 13500],
    desc:'Expands the forge queue — run more crafts simultaneously. +1 slot at Lv.1, +2 total at Lv.2.' },
  // ── POWER tier (gear stats, combat) ───────────────────────────────────────
  { id:'barracks',     name:'Barracks',           emoji:'⚔️', maxLevel:7,  baseCost:225, minWorkerLevel:20,
    effect:'strengthAura',    perLevel:'+5% STR & CON from gear',
    desc:'Increases STR and CON granted by equipped gear.' },
  { id:'sanctum',      name:'Enchanting Sanctum', emoji:'✨', maxLevel:7,  baseCost:390, minWorkerLevel:30,
    effect:'gearAura',        perLevel:'+4% all stats from gear',
    desc:'Increases all stat bonuses from equipped gear.' },
  { id:'alchemy',      name:"Alchemist's Lab",    emoji:'🧪', maxLevel:5,  baseCost:225, minWorkerLevel:5,
    effect:'potionBoost',     perLevel:'+15% HP/MP from potions',
    desc:'Increases HP and MP restored by all consumable potions.' },
];
