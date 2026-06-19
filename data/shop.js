// ============================================================
// SHOP — Premium currency (Shards) + chests, consumables, rotation
// Loaded before mobile.html main script. DATA ONLY — no logic.
// ------------------------------------------------------------
// Design: Shards (✦) are a PRESTIGE currency. They drop only from
// discipline-gated milestones (perfect days, streaks, bosses,
// achievements) — never from grindable work tasks. Tuned for a
// committed user to net ~40-60 ✦/week (moderate scarcity).
// Shards/Shop items buy convenience, boosts, mercy and cosmetics —
// NEVER raw permanent stats.
// ============================================================

// ── Shard faucet amounts (milestone-gated) ──────────────────
const SHARD_REWARDS = {
  perfectDay:   2,        // every perfect (100%) day
  ironDisc7:    5,        // each time the consecutive-perfect-day streak hits a multiple of 7
  phoenix:      1,        // perfect day after a sub-70% day (comeback)
  weeklyBoss:   8,        // weekly boss defeated
  dungeonClear: 1,        // normal dungeon expedition completed
  commissionSweep: 1,     // all daily commissions complete (incl. client requests)
  classQuest:   5,        // class quest completed (reserved hook)
  achTier:      [1, 2, 3, 5, 8],  // by tier index (0-based); clamps to last for higher tiers
};

// Shared material definitions (mirror of WORK_MATERIALS) for chest payloads.
const SHOP_MAT_IDS = ['timber', 'scroll', 'crystal', 'gear'];
// Internal IDs (timber/scroll/crystal/gear) kept stable for save-data compat.
// Display labels remapped to the gear-themed naming:
//   timber → Wood   ·   gear → Iron   ·   scroll → Hide   ·   crystal → Crystal
const SHOP_MAT_META = {
  timber:  { emoji: '🪵', label: 'Wood',    color: '#a5d6a7', img: 'img/materials/timber_1.png'  },
  scroll:  { emoji: '📜', label: 'Hide',    color: '#c9a37a', img: 'img/materials/scroll_1.png'  },
  crystal: { emoji: '💎', label: 'Crystal', color: '#ea80fc', img: 'img/materials/crystal_1.png' },
  gear:    { emoji: '⚙️', label: 'Iron',    color: '#b0bec5', img: 'img/materials/gear_1.png'    },
};

// ── Step A — Tiered materials ────────────────────────────────
// T1 lives in SHOP_MAT_META above (timber/scroll/crystal/gear). T2/T3 are
// REFINED UP from lower tiers (manual, gold-gated) and DROP from higher
// dungeons (Step B). State buckets: shopMaterials (T1), shopMatsT2, shopMatsT3.
const MAT_TIER_META = {
  2: {
    timber:  { emoji: '🟤', label: 'Ironbark',     color: '#8d6e63', img: 'img/materials/timber_2.png'  },
    scroll:  { emoji: '📃', label: 'Leather',      color: '#a1887f', img: 'img/materials/scroll_2.png'  },
    crystal: { emoji: '🌙', label: 'Moonstone',    color: '#90caf9', img: 'img/materials/crystal_2.png' },
    gear:    { emoji: '🔩', label: 'Steel',        color: '#b0bec5', img: 'img/materials/gear_2.png'    },
  },
  3: {
    timber:  { emoji: '🩸', label: 'Bloodwood',    color: '#c62828', img: 'img/materials/timber_3.png'  },
    scroll:  { emoji: '📕', label: 'Dragonleather',color: '#6d4c41', img: 'img/materials/scroll_3.png'  },
    crystal: { emoji: '⭐', label: 'Starstone',    color: '#ffd54f', img: 'img/materials/crystal_3.png' },
    gear:    { emoji: '🪙', label: 'Mythril',      color: '#80cbc4', img: 'img/materials/gear_3.png'    },
  },
};

// Refine recipes (manual, lossy-by-design progression — never an idle loop).
//   costT1 → consumed from shopMaterials   ·   costT2 → consumed from shopMatsT2
//   gold   → gold sink (T3 is deliberately gold-hungry)
//   Cross-family costs create demand for ALL four material lines (Shop-Heroes feel).
const MAT_REFINE = [
  // T2 = 5 same-family T1 + a gold fee
  { out: 'timber',  tier: 2, costT1: { timber: 5 },  gold: 40 },
  { out: 'scroll',  tier: 2, costT1: { scroll: 5 },  gold: 40 },
  { out: 'crystal', tier: 2, costT1: { crystal: 5 }, gold: 40 },
  { out: 'gear',    tier: 2, costT1: { gear: 5 },    gold: 40 },
  // T3 = 5 same-family T2 + cross-family T1 catalyst + a heavy gold fee
  { out: 'timber',  tier: 3, costT2: { timber: 5 },  costT1: { crystal: 4 }, gold: 300 },
  { out: 'scroll',  tier: 3, costT2: { scroll: 5 },  costT1: { gear: 4 },    gold: 300 },
  { out: 'crystal', tier: 3, costT2: { crystal: 5 }, costT1: { scroll: 4 },  gold: 300 },
  { out: 'gear',    tier: 3, costT2: { gear: 5 },    costT1: { timber: 4 },  gold: 300 },
];

// Rarity → accent color (chest reveal tiers)
const SHOP_TIER_COLOR = {
  common:    '#4dd0e1',
  uncommon:  '#80deea',
  rare:      '#ffd54f',
  epic:      '#ce93d8',
  legendary: '#ffab40',
};

// ── Step 4 — Free timed chests (the retention spine) ─────────
// Each chest is gated by a period timer. Shard-flavored: every roll
// pays at least some ✦. `gold` is a [min,max] range; `mats` = how many
// random materials; `cosmetic` = chance to also drop a cosmetic token.
const SHOP_FREE_CHESTS = [
  {
    id: 'daily', label: 'Daily Cache', emoji: '📦', period: 'daily',
    accent: '#4dd0e1', desc: 'Resets every day',
    rolls: [
      { w: 60, tier: 'common',   shards: 2, gold: [10, 25], mats: 0 },
      { w: 30, tier: 'uncommon', shards: 3, gold: [20, 40], mats: 1 },
      { w: 10, tier: 'rare',     shards: 5, gold: [40, 70], mats: 2 },
    ],
  },
  {
    id: 'weekly', label: 'Weekly Vault', emoji: '🗃️', period: 'weekly',
    accent: '#ffd54f', desc: 'Resets every week',
    rolls: [
      { w: 55, tier: 'uncommon', shards: 8,  gold: [80, 140],  mats: 3 },
      { w: 35, tier: 'rare',     shards: 12, gold: [140, 220], mats: 4 },
      { w: 10, tier: 'epic',     shards: 18, gold: [220, 320], mats: 6 },
    ],
  },
  {
    id: 'monthly', label: 'Monthly Relic', emoji: '🏆', period: 'monthly',
    accent: '#ce93d8', desc: 'Resets every month · guaranteed cosmetic chance',
    rolls: [
      { w: 60, tier: 'rare', shards: 30, gold: [300, 500], mats: 8,  cosmetic: 0.15 },
      { w: 40, tier: 'epic', shards: 45, gold: [500, 800], mats: 12, cosmetic: 0.35 },
    ],
  },
];

// ── Step 5 — Currency chests ─────────────────────────────────
// Gold chests: renewable GOLD SINK (fixes the late-game gold hole).
// Escalating cost per purchase that day; daily-capped.
const SHOP_GOLD_CHEST = {
  id: 'gold_chest', label: 'Supply Crate', emoji: '🧰', accent: '#ffc107',
  desc: 'Trade surplus gold for materials',
  dailyLimit: 3,
  costs: [50, 100, 200],   // cost for buy #1, #2, #3 of the day
  rolls: [
    { w: 55, tier: 'common',   mats: 2, gold: [0, 15],  shards: 0 },
    { w: 35, tier: 'uncommon', mats: 3, gold: [15, 35], shards: 0 },
    { w: 10, tier: 'rare',     mats: 5, gold: [35, 70], shards: 1 },
  ],
};

// (Retired) The purchasable shard "Lockbox" gamble was removed — it paid
// materials + gold (the same category gold already covers), giving shards no
// exclusive value, and a slot-machine is tonally wrong here. Shards now buy a
// short, deliberate, deterministic menu instead. Free timed caches remain the
// only shard-paying chests (they're discipline-gated by their timers, not grind).

// ── Step 6 — Consumables, boosts & mercy ─────────────────────
// kind:
//   'shield'   → increments state.streakShields (respects existing cap)
//   'boost'    → pushes a timed multiplier to state.activeBoosts
//   'token'    → increments a counter in state.consumables (consumed elsewhere)
//   'action'   → fires an immediate one-shot effect (handled in code)
const SHOP_CONSUMABLES = [
  { id: 'streak_shield', emoji: '🛡', name: 'Streak Shield', cur: 'shards', cost: 10,
    kind: 'shield', cap: 2, capField: 'streakShields', accent: '#4dd0e1',
    desc: 'Absorbs one missed day so your streak survives. Max 2 held.' },
  { id: 'streak_repair', emoji: '⚡', name: 'Streak Repair', cur: 'shards', cost: 25,
    kind: 'action', action: 'repairStreak', accent: '#ff7043',
    desc: 'Restore a streak you broke. Only available right after a break.' },
  { id: 'xp_tonic', emoji: '⚡', name: 'EXP Tonic', cur: 'gold', cost: 120,
    kind: 'boost', boost: { type: 'xp', mult: 1.25, hours: 24 }, accent: '#82b1ff',
    desc: '+25% habit EXP for 24 hours.' },
  { id: 'focus_draught', emoji: '⚔', name: 'Focus Draught', cur: 'shards', cost: 6,
    kind: 'boost', boost: { type: 'dungeon', mult: 1.30, hours: 8 }, accent: '#ce93d8',
    desc: '+30% expedition rewards (gold/mats/WXP) for 8 hours.' },
  { id: 'forge_token', emoji: '🔨', name: 'Forge Token', cur: 'gold', cost: 150,
    kind: 'token', tokenField: 'forgeToken', cap: 5, accent: '#ffc107',
    desc: 'Next craft costs 50% fewer materials. Stacks up to 5.' },
  { id: 'reroll_token', emoji: '🔄', name: 'Commission Reroll', cur: 'gold', cost: 80,
    kind: 'action', action: 'rerollCommissions', accent: '#80deea',
    desc: "Reroll today's commission board immediately." },
];

// Material exchange (lossy by design — smooths imbalance, never an infinite loop).
const SHOP_EXCHANGE = {
  matToMat:  { give: 5, get: 1 },   // 5 of a source material → 1 of any chosen material
  matToGold: { perMat: 6 },         // sell 1 material → 6 gold
  goldToMat: { cost: 25 },          // 25 gold → 1 chosen material (deliberately lossy QoL)
};

// ── Step 6 (scaffold) — Cosmetics (zero-asset, CSS only) ─────
// Pure status, no gameplay impact. Adding art later is data-only.
const SHOP_COSMETICS = [
  { id: 'ascendant', name: 'ASCENDANT', flair: '✦', cur: 'shards', cost: 60,
    cssClass: 'cosmetic-ascendant', accent: '#b388ff',
    desc: 'Violet prestige nameplate. Earned only by the disciplined.' },
  { id: 'sovereign', name: 'SOVEREIGN', flair: '♛', cur: 'shards', cost: 120,
    cssClass: 'cosmetic-sovereign', accent: '#ffd54f',
    desc: 'Gold sovereign nameplate flair.' },
];

// ── Step 7 — Daily rotation pool ─────────────────────────────
// One slot per entry is rotated in daily (deterministic by date). Offers
// reference existing chests/consumables at a discount, or bundle deals.
const SHOP_ROTATION_POOL = [
  { id: 'rot_gold_disc',  type: 'goldChestDiscount', label: 'Discounted Supply Crate', emoji: '🧰',
    discount: 0.30, desc: 'Today: next Supply Crate is 30% off.' },
  { id: 'rot_tonic',      type: 'consumableDiscount', ref: 'xp_tonic', emoji: '⚡',
    discount: 0.35, label: 'EXP Tonic — Flash Sale', desc: 'EXP Tonic 35% off today.' },
  { id: 'rot_draught',    type: 'consumableDiscount', ref: 'focus_draught', emoji: '⚔',
    discount: 0.35, label: 'Focus Draught — Flash Sale', desc: 'Focus Draught 35% off today.' },
  { id: 'rot_mat_bundle', type: 'bundle', label: 'Quartermaster Bundle', emoji: '📦',
    cur: 'gold', cost: 120, grant: { mats: { timber: 3, scroll: 3, crystal: 3, gear: 3 } },
    desc: '+3 of every material.' },
  { id: 'rot_shield_deal', type: 'consumableDiscount', ref: 'streak_shield', emoji: '🛡',
    discount: 0.30, label: 'Streak Shield — Discount', desc: 'Streak Shield 30% off today.' },
];
