# SAO // Daily Quests — Habit Tracker RPG

## Project basics
- **Primary file: `index.html`** — all logic, UI, and CSS live here. Edit this file.
- Data tables live in `data/*.js` (loaded before the main script) — edit those files for data-only changes
- All UI text in English
- Respond to the user in English
- Stack: vanilla JS + HTML/CSS, localStorage persistence, Chart.js for radar
- Fonts: Cinzel (serif headers), Rajdhani (body)
- Color palette: `--sao-cyan` (#4dd0e1) for habits/stats, amber (#ffc107) for work/shop, `--sao-shard` (#b388ff) for premium currency

---

## Architecture overview

### Navigation
Bottom nav: **QUESTS | CHAR | WORK | LOG** (4 tabs, no SHOP — it was deleted).
- **CHAR** sub-tabs: **👤 STATS** | **🎒 GEAR**
- **WORK** has a 4-way toggle: **⚒ QUESTS** | **🔥 FORGE** | **🛠 WORKSHOP** | **🏛 CITY** (`workShopView` global: `'workbench'|'forge'|'workshop'|'guild'`). Note the global key `'guild'` is for the CITY view — legacy naming, do not rename without searching all uses.
- **LOG** sub-tabs: **🏆 Achievements** | **📊 History** | **⚔ Dungeons**

### NPC ownership
| NPC | Tabs |  Voice |
|---|---|---|
| **Yami** | QUESTS | Yami Sukehiro from Black Clover. Profanity, tough love, treats Tuni like a lazy fuck. Anchor catchphrase: "Surpass your limits." ~32% absentee gags (he's offscreen — at HQ, eating, hiding from Charlotte, etc). |
| **Leah** | WORK + CITY | Rise from Persona 4 baseline, but adult/+18 honest. Funny, motivational, openly flirty. Brand-specific work references (orders queue, DMs, content calendar, ads dashboard). Addresses Tuni as "Tuni" — pet names "Muns"/"Tungas" reserved for high-emotion peaks only (3-5 lines total). Less commanding, more partner-energy. |
| **Manin** | FORGE + WORKSHOP | Deadpool, but a blacksmith. Fourth-wall-breaking, chaotic, fun-as-hell. Aware he's an NPC in a habit tracker. Profanity allowed. |

### State shape (key fields)
```js
state = {
  habitos: [],          // daily habits
  weekly: [],           // weekly habits
  trabajo: [],          // work tasks (shop economy)
  negativos: [],        // avoid habits
  stats: {},            // STR/DEX/CON/INT/VOL/CHA
  totalXp: 0,
  gold: 0,              // spendable gold (guild purchases)
  totalGoldEarned: 0,   // lifetime gold — drives shop level
  shards: 0,            // PREMIUM currency — earned only from discipline milestones
  totalShardsEarned: 0,
  shopMaterials: { timber:0, scroll:0, crystal:0, gear:0 },  // T1 — forge mat storage (name is legacy, still used by FORGE/WORKSHOP)
  shopMatsT2: { timber:0, scroll:0, crystal:0, gear:0 },     // T2 refined
  shopMatsT3: { timber:0, scroll:0, crystal:0, gear:0 },     // T3 refined
  consumables: { forgeToken:0 },                              // earned from achievements / boss drops
  activeBoosts: [ { type, mult, expires } ],                  // xp/dungeon boosts (from chests, events, etc.)
  shardLog: [ { t, n, reason } ],
  guildUpgrades: { anvil:0, warehouse:0, refinery:0, hall:0, trade:0, scriptorium:0,
                   patron_vault:0, quality_forge:0, barracks:0, sanctum:0, alchemy:0 },
  forgeLog: [ { itemId, date } ],
  commissions: { dateKey, list: [...] } | null,
  dungeon: { ...dungeonFields, activeWorkTaskId, forgeTaskPomoCount } | null,
  treasury: { level:0, invested:0 },
  treasuryClaim: { dateKey, claimed:false },
  focusTask: null,
  honestyNudgeDay: null,
  merchant: null,
  dailyCache: { dateKey, claimed:false },
  lastComboJackpotDay: null,
  dayReflections: {},   // keyed by dateKey
  // ... achievements, classData, inventory, equipment, equipmentMods, equipmentGrades, etc.
}
```

### Work task shape
```js
{
  id, text, xp,
  gains: {},
  drops: { gold, matId, matEmoji, matLabel, matQty },
  category: 'mental'|'creative'|'operational'|'physical'|null,
  difficulty: 'easy'|'normal'|'hard'|'legendary',
  done: { [dateKey]: { gains:{}, xp, drops } }
}
```

---

## Data files
| File | Contents |
|---|---|
| `data/classes.js` | `CLASS_TIERS`, `CLASSES` (25 classes, T1–T5), `CLASS_DESCS`, `CLASS_MASTERY_REWARD`, `CLASS_MASTERY_XP`, `TIER_COMPLETE_REWARD`, `CLASS_MASTERY_THRESHOLD`, `CQ_MP`, `CQ_TARGETS`, `CLASS_QUESTS` (all 25 class quest definitions) |
| `data/dungeons.js` | `DUNGEON_CONFIG` (18 dungeons + weekly boss, E/D/C/B/A/S ranks × warrior/rogue/mage/engineer), `BOSS_TELLS` |
| `data/items.js` | `EQUIP_SLOTS` (10 slots), `RARITY_TIERS`/`RARITY_BY_ID`/`RARITY_AFFIX_MULT`, `AFFIX_POOL`/`AFFIX_BY_STAT`, `affixSlots`/`affixGradeMult`/`rarityMeta`/`affixLabel`, `ITEMS_DB` (dungeon drops + legacy forge items + 8 forge trees × 9 tiers), `SELL_PRICES`, `CRAFT_DURATION_MS` |
| `data/recipes.js` | `CRAFT_RECIPES` (legacy + 8 trees × 9 tiers = 72 active recipes), `MASTERY_BY_TIER`, `MASTERY_META`, `TIER_ALL_BONUSES`, `GRADE_MULT`/`GRADE_LABELS`/`GRADE_COLORS`/`REFINE_STEP_MULT`, `GUILD_UPGRADES` (11 upgrades across Growth/Forge/Power tiers) |
| `data/achievements.js` | `ACHIEVEMENTS` (54+ entries — habits, ranks, class mastery, stats, streaks, work, dungeon) |
| `data/content.js` | `DAILY_QUOTES` (31 entries), `showDailyQuoteOverlay`, `_buildHarvestInfo`, `_pendingAnims` |
| `data/events.js` | `DUNGEON_EVENTS` (48+ exploration events — discovery/hazard/encounter/rest/omen/cache/challenge/echo/chain) |
| `data/shop.js` | `SHARD_REWARDS`, `SHOP_MAT_IDS`/`SHOP_MAT_META`, `MAT_TIER_META` (T2/T3), `MAT_REFINE`, `SHOP_TIER_COLOR`. The legacy SHOP UI (`SHOP_FREE_CHESTS`, `SHOP_GOLD_CHEST`, `SHOP_CONSUMABLES`, `SHOP_EXCHANGE`, `SHOP_COSMETICS`, `SHOP_ROTATION_POOL`) was deleted — anything still referencing those constants is dead. |

---

## Forge trees (data/items.js + data/recipes.js)
8 equipment trees, each with 9 tiers (T1 common → T9 legendary):
| Tree | Slot | Primary mat | Secondary | T7+ tertiary |
|---|---|---|---|---|
| `swrd` | weapon | timber | gear | crystal |
| `armr` | armor | gear | timber | scroll |
| `helm` | helmet | gear | scroll | crystal |
| `shld` | shield | gear | timber | scroll |
| `neck` | necklace | scroll | crystal | gear |
| `earr` | earring | crystal | scroll | timber |
| `brac` | bracelet | timber | scroll | crystal |
| `belt` | gauntlets* | gear | timber | scroll |
| `boot` | boots | crystal | timber | gear |

*`belt` is the internal id for the gauntlets slot (save-data compat). UI says "Gauntlets".

Unlock prerequisites: T2: 2×T1 · T3: 2×T2 + WLv5 · T4: 2×T3 + WLv10 · T5: WLv15 · T6: WLv20 · T7: WLv28 · T8: WLv38 + PLv25 · T9: WLv50 + PLv35

---

## Guild upgrades (data/recipes.js — GUILD_UPGRADES)
11 upgrades across 3 tiers. All are leveled (not boolean):
- **Growth**: Grand Guild Hall (habitAura, max10), Trade Post (goldBonus, max6), Scriptorium (commissionBonus, max6), Patron's Vault (wxpBonus, max5)
- **Forge**: Forge Mastery/anvil (craftDiscount, max7), Material Cache/warehouse (bonusMat, max5), Transmuter/refinery (matRefine, max3), Quality Forge (qualityRoll, max5)
- **Power**: Barracks (strengthAura, max7), Enchanting Sanctum (gearAura, max7), Alchemist's Lab (potionBoost, max5)

`state.guildUpgrades` stores the current level (integer) for each upgrade id.

---

## Economy summary
- **Gold**: earned from work tasks and commissions; spent on crafting, guild upgrades, guild treasury, item refine/reforge
- **Shards (✦)**: prestige currency — earned only from perfect days, streaks, boss kills, achievements, commission sweeps; spent on streak repair and affix rerolls
- **Materials (T1/T2/T3)**: timber/scroll/crystal/gear; dropped from work tasks and dungeons; consumed by forge recipes; T2/T3 refined from lower tiers via MAT_REFINE

---

## Key functions reference (index.html)
| Function | Purpose |
|---|---|
| `applyWorkDrops(drops, mul)` | Awards/reverses gold + materials for work tasks |
| `applyGainsWithClass(gains, mul)` | Awards stat gains with class + guild hall multiplier |
| `getWorkTaskDrops(categoryId, difficultyId)` | Returns drop payload for a work task |
| `toggleQuest(id, listKey, periodKey)` | Task check/uncheck — branches for trabajo vs habitos |
| `generateCommissions(dateKey)` | Creates today's 3 commissions + 1 client request |
| `updateCommissionProgress(periodKey)` | Checks and awards commission rewards |
| `fulfillCommission(idx)` | Manually fulfill a client-kind commission |
| `craftItem(recipeId, silent?)` | Forge a gear item — instant, gold+mat cost, rolls rarity+affixes |
| `craftItemBatch(recipeId)` | Forge up to 5 at once (×5 button) |
| `getEffectiveCraftCost(recipe)` | Cost after anvil discount + forge token + mastery discount |
| `getCraftGoldCost(item)` | Gold cost for crafting (by tier or rarity fallback) |
| `refineItem(invIdx)` | Grade up an item (G1→G6 max, gold+mat cost) |
| `reforgeQuality(invIdx)` | Re-roll instance rarity (gold cost) |
| `rerollAffixes(invIdx)` | Re-roll affix values (shard cost) |
| `purchaseGuildUpgrade(id)` | Buy a guild upgrade level with gold |
| `investTreasury(amount)` | Invest gold into guild treasury for daily dividend |
| `claimTreasury()` | Claim today's treasury dividend |
| `renderForge()` | 🔥 FORGE sub-view (Manin lives here) |
| `renderGuild()` | 🏛 CITY sub-view (city tier + guild upgrades) |
| `renderWorkshop()` | 🛠 WORKSHOP sub-view (gear refine + reroll, Manin alt context) |
| `renderCommissionBoard()` | Commission board widget |
| `renderMerchantPanel()` | Traveling merchant panel in QUESTS |
| `renderChar()` | CHAR tab render (STATS + GEAR sub-tabs) |
| `renderHabitos()` | QUESTS tab render (Yami lives here) |
| `renderTrabajo()` | WORK tab dispatcher (workbench / forge / workshop / city) |
| `renderLog()` | LOG tab render (Achievements / History / Dungeons sub-tabs) |
| `getEquippedStats()` | Total gear stats (incl. guild barracks/sanctum auras) |
| `calcPlayerCombatStats(includeGear?)` | Full combat stats used in dungeon fights |
| `calcPowerLevel(cs)` | CP from base stats only (no gear) |
| `calcGearCP(baseCP)` | Gear CP contribution (capped at 30% of base) |
| `setForgeTask(taskId)` | Links/unlinks dungeon to a work task (pomodoro) |
| `grantShards(n, reason)` / `spendShards(n)` | Award/deduct premium currency |
| `getActiveBoostMult(type)` | Product of timed boosts (`xp`/`dungeon`) |
| `repairStreak()` / `canRepairStreak()` | Restore a just-broken streak (25✦) |
| `showLeahIntimateBanner(mood)` | Full-screen Leah modal — `'tender'` / `'bold'` / `'milestone'` / `'night'` |
| `pickLeahLine(ctx)` / `pickLeahCityLine(ctx)` / `pickYamiLine(ctx)` / `pickManinLine(ctx)` | Cached dialogue pickers (10 min TTL per contextKey) |
| `loadState()` / `saveState()` | localStorage persistence + migration |

---

## CSS color conventions
- Habit stat chips: per-stat colors (STR=#ff8a80, DEX=#69f0ae, CON=#80deea, INT=#82b1ff, VOL=#ab47bc, CHA=#ffca28)
- Work gold chip: `.gain-gold` → #ffc107
- Work material chip: `.gain-mat` → #80deea
- Shard / premium: `--sao-shard` (#b388ff), `--sao-shard-bright` (#d1b3ff)
- Gear bonus on stat screen: `.stat-gear-bonus` → #ffc107
- Grade colors: G1 #9e9e9e · G2 #4dd0e1 · G3 #82b1ff · G4 #ff8a65 · G5 #ea80fc · G6 #ffd700

---

## Rarity system (crafted instances)
5 tiers rolled on craft: Common 50% · Uncommon 27% · Rare 15% · Epic 6% · Legendary 2%  
Each tier gates a stat multiplier (1.00→1.75) and extra affix slots (Epic +1, Legendary +2).  
Affix slots by tier: T1-3: 0 · T4-7: 1 · T8-9: 2 (+ rarity bonus).  
Affix pool: atkPct / hpPct / defPct / mpPct (% combat) + critPts / dodgePts (flat).

---

## Item mastery system
Each recipe has 3 mastery tiers (Apprentice/Journeyman/MASTERED) tracked by craft count.  
Rewards: mat discounts, rarity bonuses, double-craft chance, shards.  
All-mastered in a tier unlocks a permanent systemic bonus + shards (`TIER_ALL_BONUSES` in recipes.js).

---

## Grade refinement
G1→G6 (G6 locked behind T8 ALL MASTERED milestone).  
`GRADE_MULT`: [1.0, 1.35, 1.80, 2.40, 3.20, 4.20]  
Refine costs: mat portion of recipe × `REFINE_STEP_MULT` + gold via `getRefineGoldCost(grade)`.

---

## Shard faucets (SHARD_REWARDS in data/shop.js)
- Perfect day: +2 · Iron discipline ×7: +5 · Phoenix comeback: +1
- Weekly boss: +8 · Dungeon clear: +1 · Commission sweep: +1
- Achievement tier: [1, 2, 3, 5, 8] by tier index

Shard sinks after SHOP delete: streak repair (25✦), affix reroll (`rerollAffixes`). Other sinks (Focus Draught, cosmetics) went away with SHOP.
