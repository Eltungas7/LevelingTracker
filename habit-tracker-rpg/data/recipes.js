// ── Craft Recipes ─────────────────────────────────────────────
// cost keys match state.shopMaterials: timber, scroll, crystal, gear
const CRAFT_RECIPES = [
  // ── TIER 1 · COMMON (10 mats · ~1–2 days) ─────────────
  { id:'rc_iron_bracers',    itemId:'work_iron_bracers',    cost:{ timber:10 } },
  { id:'rc_scholar_ring',    itemId:'work_scholar_ring',    cost:{ scroll:10 } },
  { id:'rc_crystal_earring', itemId:'work_crystal_earring', cost:{ crystal:10 } },
  { id:'rc_steel_barrier',   itemId:'work_steel_barrier',   cost:{ gear:10 } },
  // ── TIER 2 · UNCOMMON (20–30 mats · ~3–5 days) ────────
  { id:'rc_war_hammer',      itemId:'work_war_hammer',      cost:{ timber:20, gear:6 } },
  { id:'rc_sage_circlet',    itemId:'work_sage_circlet',    cost:{ scroll:20, crystal:6 } },
  { id:'rc_prism_amulet',    itemId:'work_prism_amulet',    cost:{ crystal:20, scroll:6 } },
  { id:'rc_iron_fortress',   itemId:'work_iron_fortress',   cost:{ gear:20, timber:8 } },
  { id:'rc_guardian_helm',   itemId:'work_guardian_helm',   cost:{ gear:16, crystal:8 } },
  { id:'rc_engineers_belt',  itemId:'work_engineers_belt',  cost:{ gear:16, timber:8 } },
  // ── TIER 3 · RARE (36–50 mats · ~1–2 weeks) ──────────
  { id:'rc_great_axe',       itemId:'work_great_axe',       cost:{ timber:40, gear:16 } },
  { id:'rc_warlord_helm',    itemId:'work_warlord_helm',    cost:{ timber:36, scroll:12 } },
  { id:'rc_arcane_pendant',  itemId:'work_arcane_pendant',  cost:{ scroll:40, crystal:16 } },
  { id:'rc_archmage_robe',   itemId:'work_archmage_robe',   cost:{ scroll:36, gear:12 } },
  { id:'rc_phantom_boots',   itemId:'work_phantom_boots',   cost:{ crystal:40, timber:12 } },
  { id:'rc_artists_vestment',itemId:'work_artists_vestment',cost:{ crystal:36, scroll:10 } },
  // ── TIER 4 · EPIC (70–120 mats · ~3–5 weeks) ─────────
  { id:'rc_champions_blade', itemId:'work_champions_blade', cost:{ timber:70, gear:40, crystal:20 } },
  { id:'rc_eternal_crown',   itemId:'work_eternal_crown',   cost:{ scroll:60, crystal:40, gear:16 } },
  { id:'rc_prismatic_garb',  itemId:'work_prismatic_garb',  cost:{ crystal:60, scroll:30, gear:20 } },
  { id:'rc_celestial_plate', itemId:'work_celestial_plate', cost:{ gear:60, scroll:36, timber:24 } },
  // ── TIER 5 · MASTERWORK (250 mats · ~2–4 months) ─────
  { id:'rc_dragonbone_greaves', itemId:'work_dragonbone_greaves', cost:{ timber:120, gear:80, crystal:30, scroll:20 } },
  { id:'rc_eternal_codex',      itemId:'work_eternal_codex',      cost:{ scroll:120, crystal:80, gear:30, timber:20 } },
  { id:'rc_aurora_cuffs',       itemId:'work_aurora_cuffs',       cost:{ crystal:120, scroll:80, timber:30, gear:20 } },
  { id:'rc_fortress_shield',    itemId:'work_fortress_shield',    cost:{ gear:120, timber:80, scroll:30, crystal:20 } },
];

// ── Item Refinement ────────────────────────────────────────────
// Stat multipliers at each grade (index 0 = Grade I)
const GRADE_MULT = [1.0, 1.35, 1.80, 2.40, 3.20];
// Cost multipliers per refinement step (G1→G2, G2→G3, G3→G4, G4→G5)
const REFINE_STEP_MULT = [1.0, 1.5, 2.0, 3.0];
const GRADE_LABELS = ['I', 'II', 'III', 'IV', 'V'];
const GRADE_COLORS = ['#9e9e9e', '#4dd0e1', '#82b1ff', '#ff8a65', '#ea80fc'];

// ── Guild Upgrades — cost(level) = baseCost × 1.7^(level-1), rounded to nearest 5
// minWorkerLevel: Worker Level required to unlock the upgrade slot
// Ordered by utility: Growth → Forge → Power
const GUILD_UPGRADES = [
  // ── GROWTH tier (habit & economy) ─────────────────────────────────────────
  { id:'hall',        name:'Grand Guild Hall',   emoji:'🏛️', maxLevel:10, baseCost:200, minWorkerLevel:1,
    effect:'habitAura',       perLevel:'+0.5% habit stat gains',
    desc:'Permanently boosts stat gains from all daily habits.' },
  { id:'trade',       name:'Trade Post',         emoji:'🪙', maxLevel:5,  baseCost:150, minWorkerLevel:5,
    effect:'goldBonus',       perLevel:'+10% gold from work tasks',
    desc:'Increases gold earned from completing work tasks.' },
  { id:'scriptorium', name:'Scriptorium',        emoji:'📜', maxLevel:5,  baseCost:250, minWorkerLevel:10,
    effect:'commissionBonus', perLevel:'+15% gold from commissions',
    desc:'Increases bonus gold awarded by completed commissions.' },
  // ── FORGE tier (crafting & supply) ────────────────────────────────────────
  { id:'anvil',       name:'Forge Mastery',      emoji:'⚒️', maxLevel:5,  baseCost:300, minWorkerLevel:10,
    effect:'craftDiscount',   perLevel:'-8% craft material cost',
    desc:'Reduces the material cost of all forge recipes.' },
  { id:'warehouse',   name:'Material Cache',     emoji:'📦', maxLevel:5,  baseCost:100, minWorkerLevel:15,
    effect:'bonusMat',        perLevel:'+1 mat per dungeon stage',
    desc:'Adds bonus materials to every dungeon stage cleared.' },
  // ── POWER tier (combat) ───────────────────────────────────────────────────
  { id:'barracks',    name:'Barracks',           emoji:'⚔️', maxLevel:5,  baseCost:400, minWorkerLevel:20,
    effect:'strengthAura',    perLevel:'+5% STR & CON from gear',
    desc:'Increases STR and CON granted by equipped gear.' },
  { id:'sanctum',     name:'Enchanting Sanctum', emoji:'✨', maxLevel:5,  baseCost:600, minWorkerLevel:30,
    effect:'gearAura',        perLevel:'+4% all stats from gear',
    desc:'Increases all stat bonuses from equipped gear.' },
  { id:'alchemy',     name:'Alchemist\'s Lab',   emoji:'🧪', maxLevel:5,  baseCost:120, minWorkerLevel:5,
    effect:'potionBoost',     perLevel:'+15% HP/MP from potions',
    desc:'Increases HP and MP restored by all consumable potions.' },
];
