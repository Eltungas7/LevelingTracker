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

  // ── REBALANCED RECIPE COSTS ─────────────────────────────────────────────────
  // Lifetime mat demand equalized across all 4 families (±6%, T1+T2+T3 incl.
  // refining cascade). Every tree carries Primary + Secondary + 2 Tertiaries
  // (T7+ only). Timber stops being co-primary — it's the universal secondary
  // in sword/shield/jewelry and a tertiary splash in armor/helm/gaunt/boots.
  // Scroll primary curve trimmed (was overweight from being primary in 4 trees).
  // T2/T3 split across all 4 mats at T7-T9 so refined-mat demand balances too.
  //
  // Curves used (P = primary slot, S = secondary, T1 = tertiary 1 at T7+, T2 = tertiary 2 at T7+):
  //   Scroll-P  : 5/8/13/22/33/50/60/70/85
  //   Gear-P    : 8/14/16/27/42/62/70/80/100
  //   Crystal-P : 8/14/16/27/42/62/70/80/100
  //   Timber-S  :      10/17/28/42/42/50/63    (at T3-T9)
  //   Gear-S    :       7/11/19/28/28/34/43    (at T3-T9)
  //   Tert1     :                12/15/18      (at T7-T9)
  //   Tert2     :                 8/10/11      (at T7-T9)
  //   T2 split  : T7 P:3 S:2 T1:1 T2:1 · T8 P:5 S:3 T1:3 T2:2 · T9 P:6 S:6 T1:5 T2:5
  //   T3 split  : T8 P:1 · T9 P:1 S:1

  // ⚔️ SWORD PATH — Gear primary · Timber secondary · Scroll T1 · Crystal T2
  { id:'r_swrd_1', itemId:'f_swrd_1', tree:'swrd', tier:1, cost:{ gear:8 } },
  { id:'r_swrd_2', itemId:'f_swrd_2', tree:'swrd', tier:2, cost:{ gear:14 },                                                                       reqCraft:{ f_swrd_1:2 } },
  { id:'r_swrd_3', itemId:'f_swrd_3', tree:'swrd', tier:3, cost:{ gear:16, timber:10 },                                                            reqCraft:{ f_swrd_2:2 }, reqWorkerLevel:5  },
  { id:'r_swrd_4', itemId:'f_swrd_4', tree:'swrd', tier:4, cost:{ gear:27, timber:17 },                                                            reqCraft:{ f_swrd_3:2 }, reqWorkerLevel:10 },
  { id:'r_swrd_5', itemId:'f_swrd_5', tree:'swrd', tier:5, cost:{ gear:42, timber:28 },                                                            reqCraft:{ f_swrd_4:1 }, reqWorkerLevel:15 },
  { id:'r_swrd_6', itemId:'f_swrd_6', tree:'swrd', tier:6, cost:{ gear:62, timber:42 },                                                            reqCraft:{ f_swrd_5:1 }, reqWorkerLevel:20 },
  { id:'r_swrd_7', itemId:'f_swrd_7', tree:'swrd', tier:7, cost:{ gear:70,  timber:42, scroll:12, crystal:8 },  costT2:{ gear:3, timber:2, scroll:1, crystal:1 },                                  reqCraft:{ f_swrd_6:1 }, reqWorkerLevel:28 },
  { id:'r_swrd_8', itemId:'f_swrd_8', tree:'swrd', tier:8, cost:{ gear:80,  timber:50, scroll:15, crystal:10 }, costT2:{ gear:5, timber:3, scroll:3, crystal:2 }, costT3:{ gear:1 },              reqCraft:{ f_swrd_7:1 }, reqWorkerLevel:38, reqPlayerLevel:25 },
  { id:'r_swrd_9', itemId:'f_swrd_9', tree:'swrd', tier:9, cost:{ gear:100, timber:63, scroll:18, crystal:11 }, costT2:{ gear:6, timber:6, scroll:5, crystal:5 }, costT3:{ gear:1, timber:1 },    reqCraft:{ f_swrd_8:1 }, reqWorkerLevel:50, reqPlayerLevel:35 },

  // 🛡️ SHIELD PATH — Gear primary · Timber secondary · Scroll T1 · Crystal T2
  { id:'r_shld_1', itemId:'f_shld_1', tree:'shld', tier:1, cost:{ gear:8 } },
  { id:'r_shld_2', itemId:'f_shld_2', tree:'shld', tier:2, cost:{ gear:14 },                                                                       reqCraft:{ f_shld_1:2 } },
  { id:'r_shld_3', itemId:'f_shld_3', tree:'shld', tier:3, cost:{ gear:16, timber:10 },                                                            reqCraft:{ f_shld_2:2 }, reqWorkerLevel:5  },
  { id:'r_shld_4', itemId:'f_shld_4', tree:'shld', tier:4, cost:{ gear:27, timber:17 },                                                            reqCraft:{ f_shld_3:2 }, reqWorkerLevel:10 },
  { id:'r_shld_5', itemId:'f_shld_5', tree:'shld', tier:5, cost:{ gear:42, timber:28 },                                                            reqCraft:{ f_shld_4:1 }, reqWorkerLevel:15 },
  { id:'r_shld_6', itemId:'f_shld_6', tree:'shld', tier:6, cost:{ gear:62, timber:42 },                                                            reqCraft:{ f_shld_5:1 }, reqWorkerLevel:20 },
  { id:'r_shld_7', itemId:'f_shld_7', tree:'shld', tier:7, cost:{ gear:70,  timber:42, scroll:12, crystal:8 },  costT2:{ gear:3, timber:2, scroll:1, crystal:1 },                                  reqCraft:{ f_shld_6:1 }, reqWorkerLevel:28 },
  { id:'r_shld_8', itemId:'f_shld_8', tree:'shld', tier:8, cost:{ gear:80,  timber:50, scroll:15, crystal:10 }, costT2:{ gear:5, timber:3, scroll:3, crystal:2 }, costT3:{ gear:1 },              reqCraft:{ f_shld_7:1 }, reqWorkerLevel:38, reqPlayerLevel:25 },
  { id:'r_shld_9', itemId:'f_shld_9', tree:'shld', tier:9, cost:{ gear:100, timber:63, scroll:18, crystal:11 }, costT2:{ gear:6, timber:6, scroll:5, crystal:5 }, costT3:{ gear:1, timber:1 },    reqCraft:{ f_shld_8:1 }, reqWorkerLevel:50, reqPlayerLevel:35 },

  // 🥋 ARMOR PATH — Scroll primary · Gear secondary · Timber T1 · Crystal T2
  { id:'r_armr_1', itemId:'f_armr_1', tree:'armr', tier:1, cost:{ scroll:5 } },
  { id:'r_armr_2', itemId:'f_armr_2', tree:'armr', tier:2, cost:{ scroll:8 },                                                                      reqCraft:{ f_armr_1:2 } },
  { id:'r_armr_3', itemId:'f_armr_3', tree:'armr', tier:3, cost:{ scroll:13, gear:7 },                                                             reqCraft:{ f_armr_2:2 }, reqWorkerLevel:5  },
  { id:'r_armr_4', itemId:'f_armr_4', tree:'armr', tier:4, cost:{ scroll:22, gear:11 },                                                            reqCraft:{ f_armr_3:2 }, reqWorkerLevel:10 },
  { id:'r_armr_5', itemId:'f_armr_5', tree:'armr', tier:5, cost:{ scroll:33, gear:19 },                                                            reqCraft:{ f_armr_4:1 }, reqWorkerLevel:15 },
  { id:'r_armr_6', itemId:'f_armr_6', tree:'armr', tier:6, cost:{ scroll:50, gear:28 },                                                            reqCraft:{ f_armr_5:1 }, reqWorkerLevel:20 },
  { id:'r_armr_7', itemId:'f_armr_7', tree:'armr', tier:7, cost:{ scroll:60, gear:28, timber:12, crystal:8 },  costT2:{ scroll:3, gear:2, timber:1, crystal:1 },                                    reqCraft:{ f_armr_6:1 }, reqWorkerLevel:28 },
  { id:'r_armr_8', itemId:'f_armr_8', tree:'armr', tier:8, cost:{ scroll:70, gear:34, timber:15, crystal:10 }, costT2:{ scroll:5, gear:3, timber:3, crystal:2 }, costT3:{ scroll:1 },              reqCraft:{ f_armr_7:1 }, reqWorkerLevel:38, reqPlayerLevel:25 },
  { id:'r_armr_9', itemId:'f_armr_9', tree:'armr', tier:9, cost:{ scroll:85, gear:43, timber:18, crystal:11 }, costT2:{ scroll:6, gear:6, timber:5, crystal:5 }, costT3:{ scroll:1, gear:1 },      reqCraft:{ f_armr_8:1 }, reqWorkerLevel:50, reqPlayerLevel:35 },

  // ⛑️ HELMET PATH — Scroll primary · Gear secondary · Timber T1 · Crystal T2
  { id:'r_helm_1', itemId:'f_helm_1', tree:'helm', tier:1, cost:{ scroll:5 } },
  { id:'r_helm_2', itemId:'f_helm_2', tree:'helm', tier:2, cost:{ scroll:8 },                                                                      reqCraft:{ f_helm_1:2 } },
  { id:'r_helm_3', itemId:'f_helm_3', tree:'helm', tier:3, cost:{ scroll:13, gear:7 },                                                             reqCraft:{ f_helm_2:2 }, reqWorkerLevel:5  },
  { id:'r_helm_4', itemId:'f_helm_4', tree:'helm', tier:4, cost:{ scroll:22, gear:11 },                                                            reqCraft:{ f_helm_3:2 }, reqWorkerLevel:10 },
  { id:'r_helm_5', itemId:'f_helm_5', tree:'helm', tier:5, cost:{ scroll:33, gear:19 },                                                            reqCraft:{ f_helm_4:1 }, reqWorkerLevel:15 },
  { id:'r_helm_6', itemId:'f_helm_6', tree:'helm', tier:6, cost:{ scroll:50, gear:28 },                                                            reqCraft:{ f_helm_5:1 }, reqWorkerLevel:20 },
  { id:'r_helm_7', itemId:'f_helm_7', tree:'helm', tier:7, cost:{ scroll:60, gear:28, timber:12, crystal:8 },  costT2:{ scroll:3, gear:2, timber:1, crystal:1 },                                    reqCraft:{ f_helm_6:1 }, reqWorkerLevel:28 },
  { id:'r_helm_8', itemId:'f_helm_8', tree:'helm', tier:8, cost:{ scroll:70, gear:34, timber:15, crystal:10 }, costT2:{ scroll:5, gear:3, timber:3, crystal:2 }, costT3:{ scroll:1 },              reqCraft:{ f_helm_7:1 }, reqWorkerLevel:38, reqPlayerLevel:25 },
  { id:'r_helm_9', itemId:'f_helm_9', tree:'helm', tier:9, cost:{ scroll:85, gear:43, timber:18, crystal:11 }, costT2:{ scroll:6, gear:6, timber:5, crystal:5 }, costT3:{ scroll:1, gear:1 },      reqCraft:{ f_helm_8:1 }, reqWorkerLevel:50, reqPlayerLevel:35 },

  // 📿 NECKLACE PATH — Crystal primary · Timber secondary · Scroll T1 · Gear T2
  { id:'r_neck_1', itemId:'f_neck_1', tree:'neck', tier:1, cost:{ crystal:8 } },
  { id:'r_neck_2', itemId:'f_neck_2', tree:'neck', tier:2, cost:{ crystal:14 },                                                                    reqCraft:{ f_neck_1:2 } },
  { id:'r_neck_3', itemId:'f_neck_3', tree:'neck', tier:3, cost:{ crystal:16, timber:10 },                                                         reqCraft:{ f_neck_2:2 }, reqWorkerLevel:5  },
  { id:'r_neck_4', itemId:'f_neck_4', tree:'neck', tier:4, cost:{ crystal:27, timber:17 },                                                         reqCraft:{ f_neck_3:2 }, reqWorkerLevel:10 },
  { id:'r_neck_5', itemId:'f_neck_5', tree:'neck', tier:5, cost:{ crystal:42, timber:28 },                                                         reqCraft:{ f_neck_4:1 }, reqWorkerLevel:15 },
  { id:'r_neck_6', itemId:'f_neck_6', tree:'neck', tier:6, cost:{ crystal:62, timber:42 },                                                         reqCraft:{ f_neck_5:1 }, reqWorkerLevel:20 },
  { id:'r_neck_7', itemId:'f_neck_7', tree:'neck', tier:7, cost:{ crystal:70,  timber:42, scroll:12, gear:8 },  costT2:{ crystal:3, timber:2, scroll:1, gear:1 },                                  reqCraft:{ f_neck_6:1 }, reqWorkerLevel:28 },
  { id:'r_neck_8', itemId:'f_neck_8', tree:'neck', tier:8, cost:{ crystal:80,  timber:50, scroll:15, gear:10 }, costT2:{ crystal:5, timber:3, scroll:3, gear:2 }, costT3:{ crystal:1 },            reqCraft:{ f_neck_7:1 }, reqWorkerLevel:38, reqPlayerLevel:25 },
  { id:'r_neck_9', itemId:'f_neck_9', tree:'neck', tier:9, cost:{ crystal:100, timber:63, scroll:18, gear:11 }, costT2:{ crystal:6, timber:6, scroll:5, gear:5 }, costT3:{ crystal:1, timber:1 },  reqCraft:{ f_neck_8:1 }, reqWorkerLevel:50, reqPlayerLevel:35 },

  // 💎 EARRING PATH — Crystal primary · Timber secondary · Scroll T1 · Gear T2
  { id:'r_earr_1', itemId:'f_earr_1', tree:'earr', tier:1, cost:{ crystal:8 } },
  { id:'r_earr_2', itemId:'f_earr_2', tree:'earr', tier:2, cost:{ crystal:14 },                                                                    reqCraft:{ f_earr_1:2 } },
  { id:'r_earr_3', itemId:'f_earr_3', tree:'earr', tier:3, cost:{ crystal:16, timber:10 },                                                         reqCraft:{ f_earr_2:2 }, reqWorkerLevel:5  },
  { id:'r_earr_4', itemId:'f_earr_4', tree:'earr', tier:4, cost:{ crystal:27, timber:17 },                                                         reqCraft:{ f_earr_3:2 }, reqWorkerLevel:10 },
  { id:'r_earr_5', itemId:'f_earr_5', tree:'earr', tier:5, cost:{ crystal:42, timber:28 },                                                         reqCraft:{ f_earr_4:1 }, reqWorkerLevel:15 },
  { id:'r_earr_6', itemId:'f_earr_6', tree:'earr', tier:6, cost:{ crystal:62, timber:42 },                                                         reqCraft:{ f_earr_5:1 }, reqWorkerLevel:20 },
  { id:'r_earr_7', itemId:'f_earr_7', tree:'earr', tier:7, cost:{ crystal:70,  timber:42, scroll:12, gear:8 },  costT2:{ crystal:3, timber:2, scroll:1, gear:1 },                                  reqCraft:{ f_earr_6:1 }, reqWorkerLevel:28 },
  { id:'r_earr_8', itemId:'f_earr_8', tree:'earr', tier:8, cost:{ crystal:80,  timber:50, scroll:15, gear:10 }, costT2:{ crystal:5, timber:3, scroll:3, gear:2 }, costT3:{ crystal:1 },            reqCraft:{ f_earr_7:1 }, reqWorkerLevel:38, reqPlayerLevel:25 },
  { id:'r_earr_9', itemId:'f_earr_9', tree:'earr', tier:9, cost:{ crystal:100, timber:63, scroll:18, gear:11 }, costT2:{ crystal:6, timber:6, scroll:5, gear:5 }, costT3:{ crystal:1, timber:1 },  reqCraft:{ f_earr_8:1 }, reqWorkerLevel:50, reqPlayerLevel:35 },

  // 💍 BRACELET PATH — Crystal primary · Timber secondary · Scroll T1 · Gear T2
  { id:'r_brac_1', itemId:'f_brac_1', tree:'brac', tier:1, cost:{ crystal:8 } },
  { id:'r_brac_2', itemId:'f_brac_2', tree:'brac', tier:2, cost:{ crystal:14 },                                                                    reqCraft:{ f_brac_1:2 } },
  { id:'r_brac_3', itemId:'f_brac_3', tree:'brac', tier:3, cost:{ crystal:16, timber:10 },                                                         reqCraft:{ f_brac_2:2 }, reqWorkerLevel:5  },
  { id:'r_brac_4', itemId:'f_brac_4', tree:'brac', tier:4, cost:{ crystal:27, timber:17 },                                                         reqCraft:{ f_brac_3:2 }, reqWorkerLevel:10 },
  { id:'r_brac_5', itemId:'f_brac_5', tree:'brac', tier:5, cost:{ crystal:42, timber:28 },                                                         reqCraft:{ f_brac_4:1 }, reqWorkerLevel:15 },
  { id:'r_brac_6', itemId:'f_brac_6', tree:'brac', tier:6, cost:{ crystal:62, timber:42 },                                                         reqCraft:{ f_brac_5:1 }, reqWorkerLevel:20 },
  { id:'r_brac_7', itemId:'f_brac_7', tree:'brac', tier:7, cost:{ crystal:70,  timber:42, scroll:12, gear:8 },  costT2:{ crystal:3, timber:2, scroll:1, gear:1 },                                  reqCraft:{ f_brac_6:1 }, reqWorkerLevel:28 },
  { id:'r_brac_8', itemId:'f_brac_8', tree:'brac', tier:8, cost:{ crystal:80,  timber:50, scroll:15, gear:10 }, costT2:{ crystal:5, timber:3, scroll:3, gear:2 }, costT3:{ crystal:1 },            reqCraft:{ f_brac_7:1 }, reqWorkerLevel:38, reqPlayerLevel:25 },
  { id:'r_brac_9', itemId:'f_brac_9', tree:'brac', tier:9, cost:{ crystal:100, timber:63, scroll:18, gear:11 }, costT2:{ crystal:6, timber:6, scroll:5, gear:5 }, costT3:{ crystal:1, timber:1 },  reqCraft:{ f_brac_8:1 }, reqWorkerLevel:50, reqPlayerLevel:35 },

  // 🥊 GAUNTLETS PATH — Scroll primary · Gear secondary · Timber T1 · Crystal T2
  // (tree id 'belt' kept internally for save-data compat)
  { id:'r_belt_1', itemId:'f_belt_1', tree:'belt', tier:1, cost:{ scroll:5 } },
  { id:'r_belt_2', itemId:'f_belt_2', tree:'belt', tier:2, cost:{ scroll:8 },                                                                      reqCraft:{ f_belt_1:2 } },
  { id:'r_belt_3', itemId:'f_belt_3', tree:'belt', tier:3, cost:{ scroll:13, gear:7 },                                                             reqCraft:{ f_belt_2:2 }, reqWorkerLevel:5  },
  { id:'r_belt_4', itemId:'f_belt_4', tree:'belt', tier:4, cost:{ scroll:22, gear:11 },                                                            reqCraft:{ f_belt_3:2 }, reqWorkerLevel:10 },
  { id:'r_belt_5', itemId:'f_belt_5', tree:'belt', tier:5, cost:{ scroll:33, gear:19 },                                                            reqCraft:{ f_belt_4:1 }, reqWorkerLevel:15 },
  { id:'r_belt_6', itemId:'f_belt_6', tree:'belt', tier:6, cost:{ scroll:50, gear:28 },                                                            reqCraft:{ f_belt_5:1 }, reqWorkerLevel:20 },
  { id:'r_belt_7', itemId:'f_belt_7', tree:'belt', tier:7, cost:{ scroll:60, gear:28, timber:12, crystal:8 },  costT2:{ scroll:3, gear:2, timber:1, crystal:1 },                                    reqCraft:{ f_belt_6:1 }, reqWorkerLevel:28 },
  { id:'r_belt_8', itemId:'f_belt_8', tree:'belt', tier:8, cost:{ scroll:70, gear:34, timber:15, crystal:10 }, costT2:{ scroll:5, gear:3, timber:3, crystal:2 }, costT3:{ scroll:1 },              reqCraft:{ f_belt_7:1 }, reqWorkerLevel:38, reqPlayerLevel:25 },
  { id:'r_belt_9', itemId:'f_belt_9', tree:'belt', tier:9, cost:{ scroll:85, gear:43, timber:18, crystal:11 }, costT2:{ scroll:6, gear:6, timber:5, crystal:5 }, costT3:{ scroll:1, gear:1 },      reqCraft:{ f_belt_8:1 }, reqWorkerLevel:50, reqPlayerLevel:35 },

  // 👢 BOOTS PATH — Scroll primary · Gear secondary · Timber T1 · Crystal T2
  { id:'r_boot_1', itemId:'f_boot_1', tree:'boot', tier:1, cost:{ scroll:5 } },
  { id:'r_boot_2', itemId:'f_boot_2', tree:'boot', tier:2, cost:{ scroll:8 },                                                                      reqCraft:{ f_boot_1:2 } },
  { id:'r_boot_3', itemId:'f_boot_3', tree:'boot', tier:3, cost:{ scroll:13, gear:7 },                                                             reqCraft:{ f_boot_2:2 }, reqWorkerLevel:5  },
  { id:'r_boot_4', itemId:'f_boot_4', tree:'boot', tier:4, cost:{ scroll:22, gear:11 },                                                            reqCraft:{ f_boot_3:2 }, reqWorkerLevel:10 },
  { id:'r_boot_5', itemId:'f_boot_5', tree:'boot', tier:5, cost:{ scroll:33, gear:19 },                                                            reqCraft:{ f_boot_4:1 }, reqWorkerLevel:15 },
  { id:'r_boot_6', itemId:'f_boot_6', tree:'boot', tier:6, cost:{ scroll:50, gear:28 },                                                            reqCraft:{ f_boot_5:1 }, reqWorkerLevel:20 },
  { id:'r_boot_7', itemId:'f_boot_7', tree:'boot', tier:7, cost:{ scroll:60, gear:28, timber:12, crystal:8 },  costT2:{ scroll:3, gear:2, timber:1, crystal:1 },                                    reqCraft:{ f_boot_6:1 }, reqWorkerLevel:28 },
  { id:'r_boot_8', itemId:'f_boot_8', tree:'boot', tier:8, cost:{ scroll:70, gear:34, timber:15, crystal:10 }, costT2:{ scroll:5, gear:3, timber:3, crystal:2 }, costT3:{ scroll:1 },              reqCraft:{ f_boot_7:1 }, reqWorkerLevel:38, reqPlayerLevel:25 },
  { id:'r_boot_9', itemId:'f_boot_9', tree:'boot', tier:9, cost:{ scroll:85, gear:43, timber:18, crystal:11 }, costT2:{ scroll:6, gear:6, timber:5, crystal:5 }, costT3:{ scroll:1, gear:1 },      reqCraft:{ f_boot_8:1 }, reqWorkerLevel:50, reqPlayerLevel:35 },
];

// ── Item Mastery ───────────────────────────────────────────────
// Per-tier mastery thresholds — designed so total all-mastery fits ~1 year for
// a committed user (8h × 5 days/week). Higher tiers need fewer crafts because
// each craft costs vastly more mats; the time-to-master grows naturally.
//
// Rewards (universal, applied in mobile.html):
//   Apprentice (1) → -15% mat cost + +2% rarity-upgrade chance + WXP
//   Journeyman (2) → -25% mat cost + UNLOCKS NEXT-TIER RECIPE + +5% rarity + WXP
//   MASTERED   (3) → -40% mat cost + +10% rarity + 10% DOUBLE-CRAFT chance + shards + WXP
//
// Discounts stack MULTIPLICATIVELY with Anvil (never additive — keeps floor).
const MASTERY_BY_TIER = {
  1: { apprentice:5,  journeyman:12, mastered:20 },
  2: { apprentice:4,  journeyman:10, mastered:18 },
  3: { apprentice:4,  journeyman:9,  mastered:16 },
  4: { apprentice:3,  journeyman:8,  mastered:14 },
  5: { apprentice:3,  journeyman:7,  mastered:12 },
  6: { apprentice:2,  journeyman:6,  mastered:10 },
  7: { apprentice:2,  journeyman:5,  mastered:8  },
  8: { apprentice:2,  journeyman:4,  mastered:7  },
  9: { apprentice:1,  journeyman:3,  mastered:6  },
};
const MASTERY_META = {
  1: { tier:1, matDisc:0.15, rarityBonus:0.02, label:'Apprentice', emoji:'🔧' },
  2: { tier:2, matDisc:0.25, rarityBonus:0.05, label:'Journeyman', emoji:'⚒️' },
  3: { tier:3, matDisc:0.40, rarityBonus:0.10, label:'MASTERED',   emoji:'👑' },
};
// Per-tier ALL-MASTERED bonuses (mastering all 9 items at MASTERED tier in a tier).
// Each is a graduation event that unlocks a permanent systemic upgrade + shards.
const TIER_ALL_BONUSES = {
  1: { id:'goldBonus5pct',  shards:50,  label:'GUILD CHARTER',     desc:'+5% gold from all sources' },
  2: { id:'matBonus1Stage', shards:100, label:'GUILD MEMBERSHIP',  desc:'+1 mat per stage drop (stacks with Warehouse)' },
  3: { id:'rarity5pct',     shards:150, label:'ARTISAN',           desc:'+5% global rarity upgrade chance' },
  4: { id:'affixSlot1',     shards:200, label:'EXPERT FORGER',     desc:'+1 free affix slot on all future crafts' },
  5: { id:'bossMat15',      shards:250, label:'MASTER CRAFTSMAN',  desc:'+15 material per boss kill (any rank)' },
  6: { id:'freeRerolls5',   shards:300, label:'LEGENDARY SMITH',   desc:'5 free affix rerolls (skips the per-affix gold cost)' },
  7: { id:'gearStat10pct',  shards:350, label:'ANCIENT FORGEMASTER', desc:'+10% stat gain from all equipped GEAR' },
  8: { id:'gradeVI',        shards:400, label:'MYTHIC SMITH',      desc:'Unlocks Grade VI refinement (new max)' },
  9: { id:'forgeGod',       shards:500, label:'FORGE GOD',         desc:'Unlocks Mythic recipes + permanent title' },
};
// Legacy table — kept for any code that still references it; new logic uses MASTERY_BY_TIER.
const MASTERY_TIERS = [
  { at:5,  tier:1, matDisc:0.15, label:'Apprentice', emoji:'🔧' },
  { at:12, tier:2, matDisc:0.25, label:'Journeyman', emoji:'⚒️' },
  { at:20, tier:3, matDisc:0.40, label:'MASTERED',   emoji:'👑', shards:3 },
];

// ── Item Refinement ────────────────────────────────────────────
// Stat multipliers at each grade (index 0 = Grade I). Grade VI is gated behind
// the T8 ALL MASTERED milestone — when locked, refineItem caps at grade 5.
const GRADE_MULT = [1.0, 1.35, 1.80, 2.40, 3.20, 4.20];
// Cost multipliers per refinement step (G1→G2, G2→G3, G3→G4, G4→G5, G5→G6)
// Refinement material cost multipliers per step (G1→G2 … G5→G6). The recipe's
// base mat cost is multiplied by these per refine. Sum = 2.5 across all 5 steps,
// so a full G1→G6 max uses ~2.5× the base recipe in materials — tuned so that
// at T9 the mat farm is ~6 days of S-rank dungeon clears (vs gold's ~9 days),
// keeping mats slightly under gold as the lighter wall.
const REFINE_STEP_MULT = [0.2, 0.3, 0.4, 0.6, 1.0];
const GRADE_LABELS = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const GRADE_COLORS = ['#9e9e9e', '#4dd0e1', '#82b1ff', '#ff8a65', '#ea80fc', '#ffd700'];

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
  { id:'trade',        name:'Trade Post',         emoji:'<img src="img/gold.png" style="height:1em;width:auto;object-fit:contain;vertical-align:middle;display:inline-block">', maxLevel:6,  baseCost:300, minWorkerLevel:5,
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
  { id:'refinery',     name:'Transmuter',         emoji:'♻️', maxLevel:3,  baseCost:300, minWorkerLevel:12,
    effect:'matRefine',       perLevel:'better material conversion ratio',
    desc:'Unlocks the Transmuter — convert surplus materials into the type you need. Higher levels improve the ratio (Lv1 3→1 · Lv2 2→1 · Lv3 3→2).' },
  { id:'quality_forge', name:'Quality Forge',      emoji:'💠', maxLevel:5,  baseCost:600, minWorkerLevel:18,
    effect:'qualityRoll',     perLevel:'+4% chance to forge one rarity tier higher',
    desc:'Tunes the forge to roll above its station — each level adds a chance for a craft to come out one rarity tier higher (the forge chase).' },
  // (Retired: Chronoforge / Grand Forge Hall — crafting is instant now, so forge-time and
  //  queue-slot upgrades had no effect. Quality Forge replaces them in the FORGE tier.)
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
