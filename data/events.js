// ============================================================
// DUNGEON EXPLORATION EVENTS — Phase 1 (48 events)
// slot: 'mid' = fires ~12 min into work session (toast, non-blocking)
//       'end' = fires when work session completes (modal, blocks break start)
//       'both' = eligible for either slot
// minRank: 0=E 1=D 2=C 3=B 4=A 5=S
// weight: relative probability (higher = more common)
// outcome arrays: [E, D, C, B, A, S] — resolved at runtime by rank
// ============================================================

const DUNGEON_EVENTS = [

  // ── DISCOVERY · MID ──────────────────────────────────────────
  {
    id:'disc_glinting_seam', category:'discovery', slot:'mid', minRank:0, archetypes:null, weight:3,
    title:'Glinting Seam',
    body:'A hairline crack in the dungeon wall catches the light. Something glitters inside.',
    choices:[{label:'Collect', outcome:{mats:1, matType:'archetype'}, auto:true}]
  },
  {
    id:'disc_slain_adventurer', category:'discovery', slot:'mid', minRank:0, archetypes:null, weight:3,
    title:'Fallen Adventurer',
    body:"A previous explorer. Their pack is still intact. You take what you can use.",
    choices:[{label:'Loot', outcome:{gold:[8,10,12,18,25,35]}, auto:true}]
  },
  {
    id:'disc_wild_herb', category:'discovery', slot:'mid', minRank:0, archetypes:['mage','monk'], weight:2,
    title:'Bioluminescent Cluster',
    body:'Rare growth along the path. Scholars would pay well for this. You pocket a handful.',
    choices:[{label:'Collect', outcome:{mats:1, matType:'scroll', hp:[5,6,7,8,9,10]}, auto:true}]
  },
  {
    id:'disc_soldier_cache', category:'discovery', slot:'mid', minRank:0, archetypes:null, weight:2,
    title:"Scout's Cache",
    body:"A supply cache marked with a soldier's rune. Whoever left it isn't coming back.",
    choices:[{label:'Take it', outcome:{gold:[5,7,10,14,18,25], mats:1, matType:'archetype'}, auto:true}]
  },
  {
    id:'disc_thermal_vent', category:'discovery', slot:'mid', minRank:0, archetypes:['warrior'], weight:2,
    title:'Thermal Vent',
    body:'A crack in the stone breathes heat. The warmth cuts through dungeon cold. You feel stronger.',
    choices:[{label:'Rest a moment', outcome:{hp:[8,10,12,15,18,22]}, auto:true}]
  },
  {
    id:'disc_inkwell_vein', category:'discovery', slot:'mid', minRank:0, archetypes:['mage'], weight:2,
    title:'Inkwell Vein',
    body:'Arcane residue pools in a floor crack. Rare. You extract what you can.',
    choices:[{label:'Extract', outcome:{mats:1, matType:'scroll', gold:[5,6,8,10,12,15]}, auto:true}]
  },

  // ── DISCOVERY · END ──────────────────────────────────────────
  {
    id:'disc_abandoned_station', category:'discovery', slot:'end', minRank:0, archetypes:null, weight:2,
    title:'Abandoned Station',
    body:'A work post, cold but intact. Supplies left behind by someone who did not return.',
    choices:[
      {label:'Take the metal',   outcome:{mats:2, matType:'gear'}},
      {label:'Take the fuel',    outcome:{mats:1, matType:'crystal', gold:[5,6,8,10,12,15]}},
      {label:'Leave it',         outcome:{}},
    ]
  },
  {
    id:'disc_supply_drop', category:'discovery', slot:'end', minRank:0, archetypes:null, weight:2,
    title:'Unclaimed Supply Drop',
    body:"A sealed crate. Guild markings. Someone's resupply that never got collected.",
    choices:[
      {label:'Take materials', outcome:{mats:[2,2,3,3,4,5], matType:'archetype'}},
      {label:'Take gold',      outcome:{gold:[12,16,22,30,42,60]}},
    ]
  },
  {
    id:'disc_hidden_shrine', category:'discovery', slot:'end', minRank:0, archetypes:['mage','monk'], weight:2,
    title:'Hidden Shrine',
    body:'A small alcove. Candles burning. The air is unusually still. The dungeon does not touch this place.',
    choices:[
      {label:'Kneel and rest',       outcome:{hp:[20,25,30,38,45,55], mats:1, matType:'scroll'}},
      {label:'Take the offerings',   outcome:{mats:2, matType:'crystal'}},
    ]
  },
  {
    id:'disc_shattered_vault', category:'discovery', slot:'end', minRank:1, archetypes:null, weight:2,
    title:'Shattered Vault',
    body:'A vault with a broken lock. Whatever broke it is long gone. The contents remain untouched.',
    choices:[
      {label:'Take everything',   outcome:{gold:[15,20,28,40,55,75], mats:1, matType:'archetype'}},
      {label:'Take only the gold', outcome:{gold:[22,30,42,58,80,105]}},
    ]
  },

  // ── HAZARD · MID ─────────────────────────────────────────────
  {
    id:'haz_cave_in', category:'hazard', slot:'mid', minRank:2, archetypes:null, weight:1,
    title:'Cave-In',
    body:'The ceiling gives way. No warning. Stone falls. You move — but not fast enough.',
    choices:[{label:'Take the hit', outcome:{hp:[-10,-12,-15,-20,-25,-30]}, auto:true}]
  },

  // ── HAZARD · END ─────────────────────────────────────────────
  {
    id:'haz_spiked_corridor', category:'hazard', slot:'end', minRank:0, archetypes:null, weight:2,
    title:'Spiked Corridor',
    body:'Pressure plates line the floor. You see the pattern — but crossing safely costs something.',
    choices:[
      {label:'Rush — pay the toll',       outcome:{gold:[-8,-10,-12,-18,-25,-35]}},
      {label:'Move carefully — take damage', outcome:{hp:[-12,-15,-18,-22,-28,-35]}},
    ]
  },
  {
    id:'haz_poison_mist', category:'hazard', slot:'end', minRank:1, archetypes:null, weight:2,
    title:'Poison Mist Chamber',
    body:'Sweet-smelling fog hangs in the air. The exit is through it. There is no other route.',
    choices:[
      {label:'Hold breath and sprint', outcome:{hp:[-15,-18,-22,-28,-35,-45]}},
      {label:'Burn a scroll to neutralize it', outcome:{mats:-1, matType:'scroll'}},
      {label:'Seal the door — skip this floor', outcome:{stageSkip:true}},
    ]
  },
  {
    id:'haz_unstable_bridge', category:'hazard', slot:'end', minRank:2, archetypes:null, weight:2,
    title:'Unstable Bridge',
    body:'Rope and rot. The gap is thirty feet. The bridge might hold. It might not.',
    choices:[
      {label:'Cross carefully — risk the fall',
        roll:{chance:0.5},
        successOutcome:{},
        failOutcome:{hp:[-20,-22,-25,-30,-38,-45]}},
      {label:'Reinforce with timber first', outcome:{mats:-1, matType:'timber'}},
      {label:'Find anchor and rappel — costs gold', outcome:{gold:[-15,-18,-22,-30,-40,-55]}},
    ]
  },
  {
    id:'haz_collapsing_floor', category:'hazard', slot:'end', minRank:0, archetypes:null, weight:2,
    title:'Collapsing Floor',
    body:'The stone shifts under your weight. A deep crack spreads beneath your feet.',
    choices:[
      {label:'Evade — take the tumble',  outcome:{hp:[-10,-12,-15,-18,-22,-28]}},
      {label:'Brace and pay for it',     outcome:{gold:[-6,-8,-10,-14,-18,-25]}},
    ]
  },
  {
    id:'haz_alarm_trap', category:'hazard', slot:'end', minRank:1, archetypes:['rogue'], weight:2,
    title:'Alarm Trap',
    body:'A pressure-wire at ankle height. The whole floor might be laced with them. You pause.',
    choices:[
      {label:'Disarm it — spend a scroll', outcome:{mats:-1, matType:'scroll', gold:[5,8,10,12,15,20]}},
      {label:'Sprint through',             outcome:{hp:[-10,-12,-15,-18,-22,-28]}},
    ]
  },

  // ── ENCOUNTER · MID ──────────────────────────────────────────
  {
    id:'enc_creature_cage', category:'encounter', slot:'mid', minRank:0, archetypes:null, weight:2,
    title:'Creature in a Cage',
    body:'Something small. Fanged. Watching you with too much intelligence.',
    choices:[
      {label:'Free it',  outcome:{mats:1, matType:'archetype'}},
      {label:'Leave it', outcome:{}},
    ]
  },

  // ── ENCOUNTER · END ──────────────────────────────────────────
  {
    id:'enc_traveling_merchant', category:'encounter', slot:'end', minRank:0, archetypes:null, weight:3,
    title:'Traveling Merchant',
    body:'"I have what you need. For a price." A hooded figure. Improbably calm given the surroundings.',
    choices:[
      {label:'Buy materials (20g)', outcome:{gold:-20, mats:[2,2,3,3,4,5], matType:'archetype'}},
      {label:'Buy healing (15g)',   outcome:{gold:-15, hp:[30,35,40,48,55,70]}},
      {label:'Nothing today',       outcome:{}},
    ]
  },
  {
    id:'enc_wounded_knight', category:'encounter', slot:'end', minRank:0, archetypes:null, weight:2,
    title:'Wounded Knight',
    body:'Cracked armor. A soldier who went too deep. They look up. "Supplies. Anything."',
    choices:[
      {label:'Give 2 timber',        outcome:{mats:-2, matType:'timber', gold:[20,25,32,42,55,70]}},
      {label:'Give a material — receive intel', outcome:{mats:-1, matType:'archetype', xpBonus:10}},
      {label:'Leave them',           outcome:{}},
    ]
  },
  {
    id:'enc_rival_adventurer', category:'encounter', slot:'end', minRank:2, archetypes:null, weight:2,
    title:'Rival Adventurer',
    body:'Fast footsteps. A solo fighter, eyes on the same boss. They nod — a challenge.',
    choices:[
      {label:'Race them — bet 15g (you win)', outcome:{gold:[10,12,15,20,25,35]}},
      {label:'Share intel',                   outcome:{mats:1, matType:'archetype', gold:[5,6,8,10,12,15]}},
      {label:'Ignore them',                   outcome:{}},
    ]
  },
  {
    id:'enc_wandering_scholar', category:'encounter', slot:'end', minRank:0, archetypes:['mage','monk'], weight:2,
    title:'Wandering Scholar',
    body:'An old figure with too many books. They stop you. "Trade knowledge for knowledge?"',
    choices:[
      {label:'Give a scroll — gain insight', outcome:{mats:-1, matType:'scroll', xpBonus:15}},
      {label:'Share nothing',                outcome:{}},
    ]
  },
  {
    id:'enc_cornered_beast', category:'encounter', slot:'end', minRank:1, archetypes:null, weight:2,
    title:'Cornered Beast',
    body:'Something wounded and dangerous blocks the path. It does not want to move.',
    choices:[
      {label:'Fight it',
        roll:{chance:0.65},
        successOutcome:{gold:[12,16,20,28,36,50]},
        failOutcome:{hp:[-15,-18,-22,-28,-35,-45]}},
      {label:'Wait it out — take some damage', outcome:{hp:[-5,-6,-8,-10,-12,-15]}},
    ]
  },

  // ── REST · END ───────────────────────────────────────────────
  {
    id:'rest_dungeon_waypoint', category:'rest', slot:'end', minRank:0, archetypes:null, weight:4,
    title:'Dungeon Waypoint',
    body:'A carved stone pillar. The inscription reads: "Those who persist shall not fall forgotten." Your focus held. The dungeon acknowledges it.',
    choices:[{label:'Rest here', outcome:{hp:[20,25,30,38,45,55]}, auto:true}]
  },
  {
    id:'rest_hidden_campfire', category:'rest', slot:'end', minRank:0, archetypes:null, weight:3,
    title:'Hidden Campfire',
    body:'Someone left a fire burning. Rations beside it. You sit — just for a moment.',
    choices:[
      {label:'Rest fully',            outcome:{hp:[35,40,45,55,65,80]}},
      {label:'Rest and study maps',   outcome:{hp:[20,24,28,35,42,52], mats:1, matType:'scroll'}},
      {label:'Keep moving — earn the speed', outcome:{gold:[5,6,8,10,12,15]}},
    ]
  },
  {
    id:'rest_sanctum_alcove', category:'rest', slot:'end', minRank:0, archetypes:['mage','monk'], weight:2,
    title:'Sanctum Alcove',
    body:'A shrine. The floor is clean. The air does not smell like dungeon. Something still protects this place.',
    choices:[{label:'Rest', outcome:{hp:[25,30,35,42,50,60], removePoison:true}, auto:true}]
  },
  {
    id:'rest_forge_cache_warrior', category:'rest', slot:'end', minRank:2, archetypes:['warrior'], weight:2,
    title:'Field Forge Cache',
    body:'A working station — stocked. Someone planned to return here. They did not.',
    choices:[
      {label:'Work the metal',  outcome:{mats:2, matType:'gear', gold:[10,12,15,18,22,28]}},
      {label:'Take the stock',  outcome:{mats:3, matType:'gear'}},
    ]
  },
  {
    id:'rest_ancient_pool', category:'rest', slot:'end', minRank:1, archetypes:null, weight:2,
    title:'Ancient Pool',
    body:'Clear water. Cold. Ancient inscriptions ring the edge. The healing properties are obvious.',
    choices:[
      {label:'Drink deeply',       outcome:{hp:[40,48,55,68,80,100]}},
      {label:'Drink and fill a flask', outcome:{hp:[20,24,28,35,42,52], gold:[5,6,8,10,12,15]}},
    ]
  },

  // ── OMEN / LORE · MID ────────────────────────────────────────
  {
    id:'omen_dungeon_shifts', category:'omen', slot:'mid', minRank:0, archetypes:null, weight:2,
    title:'The Dungeon Shifts',
    body:'The walls reconfigure. A passage closes. Another opens. Not hostile. Just watching.',
    choices:[{label:'Continue', outcome:{}, auto:true}]
  },
  {
    id:'omen_voice_static', category:'omen', slot:'mid', minRank:4, archetypes:null, weight:1,
    title:'A Voice in the Static',
    body:'Your focus is sharp. The dungeon responds in kind. Something ahead is afraid of you.',
    choices:[{label:'Press on', outcome:{xpBonus:5, omen:'focus_sharp'}, auto:true}]
  },
  {
    id:'omen_cold_wind', category:'omen', slot:'mid', minRank:0, archetypes:null, weight:2,
    title:'Cold Wind',
    body:'A draft from deeper floors. It carries no smell you recognize. The dungeon breathes.',
    choices:[{label:'Continue', outcome:{gold:[5,6,8,10,12,15]}, auto:true}]
  },
  {
    id:'omen_distant_sound', category:'omen', slot:'mid', minRank:0, archetypes:null, weight:2,
    title:'Distant Sound',
    body:'Something large. Far away. Moving. The echo gives no direction. You note it and keep going.',
    choices:[{label:'Continue', outcome:{}, auto:true}]
  },

  // ── OMEN / LORE · END ────────────────────────────────────────
  {
    id:'omen_boss_stirs', category:'omen', slot:'end', minRank:0, archetypes:null, weight:2,
    title:'The Boss Stirs',
    body:'You feel it before you hear it. A low resonance. Closer now. The final floor is not far.',
    choices:[
      {label:'Press on — accept the dread', outcome:{hp:[-5,-6,-8,-10,-12,-15], xpBonus:10}},
      {label:'Steady yourself',             outcome:{hp:[10,12,15,18,22,28]}},
    ]
  },
  {
    id:'omen_echoed_memory', category:'omen', slot:'end', minRank:0, archetypes:null, weight:2,
    title:'Echoed Memory',
    body:"Carved into stone: \"We made it to floor 8. The fog cost us everything. Do not stop here.\"",
    choices:[{label:'Read it', outcome:{gold:[5,6,8,10,12,15]}, auto:true}]
  },
  {
    id:'omen_warning_sign', category:'omen', slot:'end', minRank:0, archetypes:null, weight:2,
    title:'Warning Sign',
    body:"Scratched deep into the wall: something dangerous ahead. You recognize the mark. You prepare accordingly.",
    choices:[{label:'Heed the warning', outcome:{hp:[10,12,15,18,22,28]}}]
  },
  {
    id:'omen_ancient_inscription', category:'omen', slot:'end', minRank:1, archetypes:null, weight:2,
    title:'Ancient Inscription',
    body:'Old text. A language you half-recognize. The dungeon is speaking, if you choose to listen.',
    choices:[
      {label:'Study it',  outcome:{mats:1, matType:'scroll', xpBonus:5}},
      {label:'Move on',   outcome:{gold:[5,6,8,10,12,15]}},
    ]
  },

  // ── CACHE · MID ──────────────────────────────────────────────
  {
    id:'cache_map_fragment', category:'cache', slot:'mid', minRank:0, archetypes:null, weight:3,
    title:'Map Fragment',
    body:'Pinned to the wall. You recognize part of it. Useful to someone — the guild will pay.',
    choices:[{label:'Take it', outcome:{gold:[12,15,18,25,32,42]}, auto:true}]
  },

  // ── CACHE · END ──────────────────────────────────────────────
  {
    id:'cache_locked_iron_chest', category:'cache', slot:'end', minRank:0, archetypes:null, weight:2,
    title:'Locked Iron Chest',
    body:'Solid. Rusted. The lock is simple if you have the right tool — or the gold to bribe it open.',
    choices:[
      {label:'Force it open (−20g)',
        outcome:{gold:[-5,-5,-5,-7,-10,-15], mats:[2,2,3,3,4,5], matType:'archetype'}},
      {label:'Pick the lock — risk it',
        roll:{chance:0.65},
        successOutcome:{gold:[25,30,38,50,65,85], mats:[3,3,4,4,5,6], matType:'archetype'},
        failOutcome:{hp:[-10,-12,-15,-18,-22,-28]}},
      {label:'Leave it', outcome:{}},
    ]
  },
  {
    id:'cache_submerged_cache', category:'cache', slot:'end', minRank:0, archetypes:null, weight:2,
    title:'Submerged Cache',
    body:'A flooded side chamber. Something glints below the surface. Worth getting wet?',
    choices:[
      {label:'Dive in',             outcome:{hp:[-8,-10,-12,-15,-18,-22], mats:2, matType:'crystal', gold:[10,12,15,20,25,32]}},
      {label:'Reach with a stick — get part of it', outcome:{mats:1, matType:'crystal'}},
      {label:'Not worth it',        outcome:{}},
    ]
  },
  {
    id:'cache_sealed_reliquary', category:'cache', slot:'end', minRank:4, archetypes:null, weight:1,
    title:'Sealed Reliquary',
    body:'Old. Very old. The seal is a guild marking you do not recognize. Breaking it might anger someone. Somewhere.',
    choices:[
      {label:'Break the seal', outcome:{mats:[3,3,4,4,5,6], matType:'archetype', gold:[30,35,42,55,70,90], crossSession:'reliquaryBreached'}},
      {label:'Leave it sealed — take the offering', outcome:{mats:1, matType:'scroll', gold:[5,6,8,10,12,15]}},
    ]
  },
  {
    id:'cache_strange_rune', category:'cache', slot:'end', minRank:2, archetypes:null, weight:2,
    title:'Strange Rune',
    body:'Pulsing with residual energy. Could be stored power. Could be a ward about to discharge.',
    choices:[
      {label:'Channel it — risk it',
        roll:{chance:0.6},
        successOutcome:{xpBonus:15, mats:1, matType:'archetype'},
        failOutcome:{hp:[-15,-18,-22,-28,-35,-45]}},
      {label:'Drain it safely',  outcome:{gold:[10,12,15,20,25,32]}},
    ]
  },
  {
    id:'cache_supply_stash', category:'cache', slot:'end', minRank:0, archetypes:null, weight:2,
    title:'Supply Stash',
    body:'A reinforced alcove. Standard adventurer kit. Pick what you need most.',
    choices:[
      {label:'Take the gold',      outcome:{gold:[15,18,22,28,36,48]}},
      {label:'Take the materials', outcome:{mats:[2,2,3,3,4,5], matType:'archetype'}},
    ]
  },

  // ── CHALLENGE · END (C+ rank) ─────────────────────────────────
  {
    id:'chal_riddle_door', category:'challenge', slot:'end', minRank:2, archetypes:null, weight:2,
    title:'The Riddle Door',
    body:'Three glyphs. One combination opens it. The wrong one fires a trap. You study the pattern.',
    choices:[
      {label:'⚡ Glyph I',   outcome:{gold:[30,35,42,55,70,90], mats:1, matType:'archetype'}},
      {label:'◈ Glyph II',  outcome:{gold:[30,35,42,55,70,90], mats:1, matType:'archetype'}},
      {label:'✦ Glyph III', outcome:{gold:[30,35,42,55,70,90], mats:1, matType:'archetype'}},
    ],
    riddleDoor:true
  },
  {
    id:'chal_endurance_trial', category:'challenge', slot:'end', minRank:0, archetypes:null, weight:2,
    title:'Endurance Trial',
    body:'A gauntlet section. Spikes. Timing. Weight-bearing walls. You have faced worse — in the real world, at least.',
    choices:[
      {label:'Run the gauntlet',       outcome:{hp:[-20,-22,-25,-30,-38,-45], gold:[40,48,58,75,95,120], mats:2, matType:'archetype'}},
      {label:'Bribe the mechanism',    outcome:{gold:[-15,-18,-22,-28,-35,-45], mats:1, matType:'archetype', xpBonus:5}},
    ]
  },
  {
    id:'chal_worthy_gate', category:'challenge', slot:'end', minRank:3, archetypes:null, weight:1,
    title:'The Worthy Gate',
    body:'Sealed by a class rune. It reads your stats. "Only those of sufficient mastery may pass."',
    choices:[{label:'Approach the gate', outcome:{}, worthyGate:true}],
    worthyGate:true
  },
  {
    id:'chal_unstable_relic', category:'challenge', slot:'end', minRank:2, archetypes:null, weight:1,
    title:'Unstable Relic',
    body:'Radiating energy. Ancient. Could be power. Could be a grenade. You feel it humming.',
    choices:[
      {label:'Absorb it',
        roll:{chance:0.6},
        successOutcome:{xpBonus:20, mats:1, matType:'archetype'},
        failOutcome:{hp:[-25,-28,-32,-40,-50,-65]}},
      {label:'Sell it later — leave safely', outcome:{gold:[30,35,42,55,70,90]}},
      {label:'Leave it',                     outcome:{gold:[5,6,8,10,12,15]}},
    ]
  },

  // ── ECHO · MID ───────────────────────────────────────────────
  {
    id:'echo_focus_holds', category:'echo', slot:'mid', minRank:0, archetypes:null, weight:2,
    title:'Focus Holds',
    body:"Your mind is clear. The dungeon's traps feel obvious. You sidestep one before it fires.",
    choices:[{label:'Continue', outcome:{gold:[10,12,15,18,22,28]}, auto:true}]
  },
  {
    id:'echo_flow_state', category:'echo', slot:'mid', minRank:0, archetypes:null, weight:2,
    title:'The Flow State',
    body:'Time moved differently in that corridor. You covered more ground than you realized.',
    choices:[{label:'Continue', outcome:{mats:1, matType:'archetype'}, auto:true}]
  },
  {
    id:'echo_dungeon_watches', category:'echo', slot:'mid', minRank:2, archetypes:null, weight:1,
    title:'Something Watches',
    body:'The dungeon registers your effort. Something shifts — not hostile. Approving.',
    choices:[{label:'Continue', outcome:{xpBonus:5, omen:'watched'}, auto:true}]
  },

  // ── ECHO · END ───────────────────────────────────────────────
  {
    id:'echo_session_mark', category:'echo', slot:'end', minRank:0, archetypes:null, weight:2,
    title:'The Session Leaves a Mark',
    body:'The deeper you go, the more the dungeon reflects what you bring. This floor remembers your last one.',
    choices:[
      {label:'Accept what the dungeon offers', outcome:{gold:[15,18,22,28,35,45], mats:2, matType:'archetype'}},
      {label:'Press on without pause',         outcome:{xpBonus:12, omen:'driven'}},
    ]
  },


  // ── ARCHETYPE-SPECIFIC · Phase 2 ──────────────────────────────
  {
    id:'arch_warrior_instinct', category:'discovery', slot:'mid', minRank:0, archetypes:['warrior'], weight:2,
    title:'Combat Instinct',
    body:"Your body moves before your mind decides. A trip-wire you didn't see — your foot stops an inch short.",
    choices:[{label:'Press on', outcome:{hp:[8,10,12,15,18,22], gold:[5,6,8,10,12,15]}, auto:true}]
  },
  {
    id:'arch_rogue_shadow_step', category:'discovery', slot:'end', minRank:0, archetypes:['rogue'], weight:2,
    title:'Shadow Step',
    body:"A patrol. Heavy armor. Torches. You dissolve into the dark and slip between them without breathing.",
    choices:[
      {label:'Take what they guard',   outcome:{gold:[15,18,22,28,35,45], mats:1, matType:'gear'}},
      {label:'Slip past — stay clean', outcome:{mats:2, matType:'archetype'}},
    ]
  },
  {
    id:'arch_mage_ley_surge', category:'cache', slot:'end', minRank:0, archetypes:['mage'], weight:2,
    title:'Ley Line Surge',
    body:'The floor cracks and raw dungeon energy pools upward. This is dangerous. This is also opportunity.',
    choices:[
      {label:'Channel it fully',
        roll:{chance:0.55},
        successOutcome:{xpBonus:20, mats:2, matType:'scroll'},
        failOutcome:{hp:[-20,-24,-28,-35,-42,-52]}},
      {label:'Skim the surface — take a little', outcome:{xpBonus:8, mats:1, matType:'scroll'}},
    ]
  },
  {
    id:'arch_monk_breath', category:'rest', slot:'mid', minRank:0, archetypes:['monk'], weight:2,
    title:'Breath Work',
    body:'Chaos around you. You find the still center of it. Ten breaths. The dungeon recedes.',
    choices:[{label:'Breathe', outcome:{hp:[15,18,22,28,32,40], xpBonus:5}, auto:true}]
  },
  {
    id:'arch_rogue_warrior_ambush', category:'encounter', slot:'end', minRank:1, archetypes:['warrior','rogue'], weight:2,
    title:'Ambush Coordinates',
    body:'Markings on the wall — a grid, a timing pattern. Someone planned this attack. You can still execute it.',
    choices:[
      {label:'Spring the trap',   outcome:{gold:[20,25,32,42,55,70], mats:1, matType:'gear'}},
      {label:'Sell the intel',    outcome:{gold:[30,36,45,58,75,95]}},
    ]
  },

  // ── HIGH-RANK ONLY · A/S RANK · Phase 2 ───────────────────────
  {
    id:'high_rank_temporal_echo', category:'echo', slot:'end', minRank:4, archetypes:null, weight:1,
    title:'Temporal Echo',
    body:'You have been here before. Not in memory — in something older. The dungeon is looping a moment you lived.',
    choices:[
      {label:'Step into the echo', outcome:{xpBonus:25, omen:'watched'}},
      {label:'Reject it',          outcome:{gold:[30,35,42,55,70,90]}},
    ]
  },
  {
    id:'high_rank_rift_walker', category:'discovery', slot:'mid', minRank:4, archetypes:null, weight:1,
    title:'Rift Walker',
    body:'A tear in the dungeon fabric. 4 seconds wide. Enough to reach through. Something on the other side reaches back.',
    choices:[{label:'Reach in', outcome:{mats:[3,3,4,4,5,6], matType:'archetype', hp:[-10,-12,-15,-18,-22,-28]}, auto:true}]
  },
  {
    id:'high_rank_dungeon_core', category:'cache', slot:'end', minRank:5, archetypes:null, weight:1,
    title:'Dungeon Core Exposed',
    body:"The dungeon's power source. Pulsing. Defensive systems offline. This happens maybe once in a hundred runs.",
    choices:[
      {label:'Extract core energy',
        roll:{chance:0.5},
        successOutcome:{xpBonus:30, gold:[60,70,85,105,130,160], mats:3, matType:'archetype'},
        failOutcome:{hp:[-35,-40,-48,-58,-70,-85]}},
      {label:'Siphon carefully',      outcome:{xpBonus:15, gold:[30,35,42,55,70,90]}},
    ]
  },
  {
    id:'high_rank_elder_presence', category:'omen', slot:'end', minRank:4, archetypes:null, weight:1,
    title:'Elder Presence',
    body:'Something ancient regards you. Not hostile. Not friendly. Evaluating. It has seen thousands come through here.',
    choices:[
      {label:'Stand your ground',  outcome:{omen:'focus_sharp', gold:[20,25,32,42,55,70]}},
      {label:'Lower your weapon',  outcome:{omen:'watched', hp:[20,25,30,38,45,55]}},
    ]
  },
  {
    id:'high_rank_void_touch', category:'hazard', slot:'mid', minRank:5, archetypes:null, weight:1,
    title:'Void Touch',
    body:'A hand of nothing brushes your shoulder. It does not hurt. It takes something else.',
    choices:[{label:'Endure', outcome:{hp:[-15,-18,-22,-28,-35,-45], xpBonus:20, omen:'driven'}, auto:true}]
  },

  // ── PURE-FLAVOR OMENS · Phase 2 ───────────────────────────────
  {
    id:'flv_ravens', category:'omen', slot:'mid', minRank:0, archetypes:null, weight:2,
    title:'Ravens',
    body:'Three ravens on a ledge above. They watch you pass. They do not fly away.',
    choices:[{label:'Continue', outcome:{}, auto:true}]
  },
  {
    id:'flv_dungeon_bleeds', category:'omen', slot:'mid', minRank:0, archetypes:null, weight:2,
    title:'The Dungeon Bleeds',
    body:'The walls seep red mineral water. Old iron deposits. Nothing to fear. Everything to notice.',
    choices:[{label:'Continue', outcome:{}, auto:true}]
  },
  {
    id:'flv_perfect_silence', category:'omen', slot:'mid', minRank:0, archetypes:null, weight:2,
    title:'Perfect Silence',
    body:'All sound stops. Your footsteps. Your breathing. The ambient hum. Thirty seconds of absolute nothing.',
    choices:[{label:'Continue', outcome:{}, auto:true}]
  },
  {
    id:'flv_last_words', category:'omen', slot:'end', minRank:0, archetypes:null, weight:2,
    title:'Last Words',
    body:'"Day 47. Still here. Ran out of candles on day 31. Writing by touch now. Whoever finds this — keep going."',
    choices:[{label:'Remember it', outcome:{}, auto:true}]
  },
  {
    id:'flv_mirror_wall', category:'omen', slot:'end', minRank:0, archetypes:null, weight:2,
    title:'The Mirror Wall',
    body:'A polished section of dungeon wall reflects you perfectly. You blink. Your reflection does not.',
    choices:[
      {label:'Look away',        outcome:{}},
      {label:'Hold its gaze',    outcome:{omen:'watched'}},
    ]
  },

  // ── BOSS-FORESHADOWING · Phase 2 (bossProximity) ─────────────
  {
    id:'boss_fore_tremors', category:'hazard', slot:'end', minRank:0, archetypes:null, weight:3, bossProximity:true,
    title:'The Floor Trembles',
    body:'A deep resonance from below. Regular. Rhythmic. The boss knows something is close. So do you.',
    choices:[
      {label:'Press on — accept the dread', outcome:{hp:[-8,-10,-12,-15,-18,-22], xpBonus:10}},
      {label:'Brace yourself',              outcome:{hp:[10,12,15,18,22,28]}},
    ]
  },
  {
    id:'boss_fore_broken_expedition', category:'discovery', slot:'mid', minRank:0, archetypes:null, weight:3, bossProximity:true,
    title:'Broken Expedition',
    body:'Four bodies. Full kit. A party that made it this far and no further. Their gear is still good.',
    choices:[{label:'Take what you need', outcome:{mats:[2,2,3,3,4,5], matType:'archetype', hp:[10,12,15,18,22,28]}, auto:true}]
  },
  {
    id:'boss_fore_kill_marks', category:'omen', slot:'end', minRank:1, archetypes:null, weight:2, bossProximity:true,
    title:'Scorched Kill Marks',
    body:'Burn patterns on the stone. Impact craters. Whatever made these marks is still somewhere ahead of you.',
    choices:[
      {label:'Study the patterns — prepare', outcome:{xpBonus:8, omen:'focus_sharp'}},
      {label:'Keep moving',                  outcome:{}},
    ]
  },
  {
    id:'boss_fore_power_buildup', category:'echo', slot:'mid', minRank:0, archetypes:null, weight:3, bossProximity:true,
    title:'Power Buildup',
    body:'The air is thick with it. Your skin prickles. Something ahead is generating this field continuously.',
    choices:[{label:'Channel it', outcome:{xpBonus:5, omen:'driven'}, auto:true}]
  },
  {
    id:'boss_fore_last_gate', category:'discovery', slot:'end', minRank:0, archetypes:null, weight:3, bossProximity:true,
    title:'The Last Gate',
    body:"The final door is visible from here. There's a lock cache beside it — adventurers left offerings before going through.",
    choices:[
      {label:'Take the offerings', outcome:{gold:[10,12,15,20,25,32], mats:1, matType:'archetype'}},
      {label:'Add your own offering — gain focus', outcome:{gold:[-5,-5,-5,-7,-10,-15], xpBonus:15, omen:'focus_sharp'}},
    ]
  },

  // ── CHAIN EVENTS · Phase 2 ────────────────────────────────────
  {
    id:'chain_pact_start', category:'encounter', slot:'end', minRank:0, archetypes:null, weight:1,
    title:'The Pact',
    body:'A dungeon creature — wounded, intelligent, watching you without aggression. It holds out a claw. An offer.',
    choices:[
      {label:'Accept the pact',   outcome:{hp:[-5,-6,-8,-10,-12,-15], mats:1, matType:'archetype', setChain:'chain_pact'}},
      {label:'Walk away',         outcome:{gold:[5,6,8,10,12,15]}},
    ]
  },
  {
    id:'chain_pact_follow', category:'encounter', slot:'end', minRank:0, archetypes:null, weight:1, chainFollowId:'chain_pact',
    title:'The Pact Fulfilled',
    body:'It was waiting for you. Whatever it promised, it delivers — and more. Pacts in dungeons run deeper than words.',
    choices:[{label:'Receive the gift', outcome:{mats:[3,3,4,4,5,6], matType:'archetype', gold:[15,18,22,28,35,45]}, auto:true}]
  },
  {
    id:'chain_soldier_start', category:'encounter', slot:'end', minRank:1, archetypes:null, weight:1,
    title:"Deserter's Plea",
    body:"They pulled off their guild insignia. \"I'm done with the contract. Help me find the side exit — I'll make it worth your while.\"",
    choices:[
      {label:'Help them',       outcome:{gold:[-10,-12,-15,-18,-22,-28], setChain:'chain_soldier'}},
      {label:'Report them',     outcome:{gold:[10,12,15,18,22,28]}},
      {label:'Ignore them',     outcome:{}},
    ]
  },
  {
    id:'chain_soldier_follow', category:'discovery', slot:'mid', minRank:1, archetypes:null, weight:1, chainFollowId:'chain_soldier',
    title:"The Soldier's Cache",
    body:"They left something at the waypoint — a sealed supply bag with your name scratched on the side.",
    choices:[{label:'Open it', outcome:{gold:[25,30,38,50,65,85], mats:2, matType:'archetype'}, auto:true}]
  },
  {
    id:'chain_compass_start', category:'cache', slot:'end', minRank:2, archetypes:null, weight:1,
    title:'Broken Compass',
    body:'Half of an old compass. The needle still moves. You have the feeling the other half is in this dungeon somewhere.',
    choices:[
      {label:'Keep it',    outcome:{mats:1, matType:'gear', setChain:'chain_compass'}},
      {label:'Leave it',   outcome:{gold:[5,6,8,10,12,15]}},
    ]
  },

];
