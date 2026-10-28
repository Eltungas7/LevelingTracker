# SAO // Daily Quests — Habit Tracker

## What this app is

A personal habit tracker with an RPG skin. Daily habits, weekly missions and avoid
habits are the whole product. Completing them awards XP, levels and six character
stats, which feed a Hunter Grade — the long-term north star.

**It does not track work.** The WORK tab (hunts, gates, red gates, gacha, worker
rank, side quests) was retired on 2026-10-28. Work ethic is downstream of a life
that already runs; measuring it inside this app turned a habit tracker into a
second to-do list and a daily reminder of debt. Do not re-add a work tab, a work
currency, or a "productivity" metric unless the user explicitly asks for one.

## Design rules (these override convenience)

- **Fill-only progress.** Bars and counters go up and never down. No streak that
  can break, no "you lost it", no red.
- **No perfection framing.** 75–90% consistency is the win. 100% is a bonus, not
  the bar.
- **No decision tax.** The app chooses what to surface (CURRENT QUEST, SYSTEM
  SUGGESTION). The user should never face a "which one do I pick" screen.
- **Nothing permanently unreachable.** A row that can never be completed is
  visible debt — filter it out rather than showing it greyed forever.
- The user has ADHD. Every feature is judged against the four rules above.

## Project basics

- **Primary file: `index.html`** — all logic, UI and CSS live here. Edit this file.
- Data tables live in `data/*.js`, loaded before the main script.
- All UI text in English. Respond to the user in English.
- Stack: vanilla JS + HTML/CSS, localStorage persistence, Chart.js for the radar.
- Fonts: Cinzel (serif headers), Rajdhani (body). Primary colour `--sao-cyan` (#4dd0e1).
- Local preview: `.claude/launch.json` → `habit-tracker-rpg` on port 3333.

---

## Architecture

### Navigation
Bottom nav, three tabs: **QUESTS | CHAR | LOG**. The app always opens on QUESTS.
- **QUESTS** — Current Quest hero · catch-up card · daily stoic quote · Hunter
  Grade block · class quests · DAILY (morning/anytime/night) · WEEKLY · AVOID ·
  Social quick-log.
- **CHAR** — stats/identity screen only (`renderPersonaje`). No sub-tabs.
- **LOG** — sub-tabs **🏆 Achievements** | **📊 History**.

`currentTab` values `'work'` and `'shop'` are legacy; `renderAll()` routes both
back to QUESTS so an old save cannot strand the user on a dead tab.

### State shape (live fields)
```js
state = {
  habitos: [],          // daily habits  { id, text, xp, gains:{}, timeOfDay, done:{ [dateKey]: {...} } }
  weekly: [],           // weekly habits (keyed by ISO week)
  negativos: [],        // avoid habits
  stats: {},            // STR/DEX/CON/INT/VOL/CHA
  totalXp, hp, mp,
  streak, lastStreakPeak,
  logros: { perfectDayCount, ... },
  classData: {},        // equipped class + class-quest progress
  achievements: {},     // per-achievement awarded/claimable tiers
  dayReflections: {},   // keyed by dateKey — Close the Day
  socialActsRecent: [], // Social quick-log
  habitsPaused, vacationDays,
  // ── dormant: written by the retired WORK layer, read by nothing ──
  trabajo, workXp, workToday, gold, shards, guildUpgrades, redGates, hunts, …
}
```

### Key functions
| Function | Purpose |
|---|---|
| `renderAll()` | Tab dispatcher + global milestone check |
| `renderHabitos()` | QUESTS tab |
| `renderCurrentQuest()` | The one-habit hero at the top of QUESTS |
| `renderRankBlock()` | Hunter Grade progress block |
| `renderCharTab()` / `renderPersonaje()` | CHAR tab |
| `renderLog()` / `renderLogros()` / `renderHistory()` | LOG tab and its sub-tabs |
| `toggleQuest(listKey, periodKey, id, anchorY)` | Check/uncheck a habit |
| `applyGainsWithClass(gains)` | Award stat gains with the class multiplier |
| `getHunterGrade()` | Average of the six stats → grade tier |
| `checkAchievements()` | Scans `ACTIVE_ACHIEVEMENTS`, marks tiers claimable |
| `_checkMilestoneBanners()` | Streak / record / balanced / anniversary / centurion / chronicle |
| `loadState()` / `saveState()` | localStorage persistence + migrations |

### The day ends at 18:00, not midnight
`WIND_DOWN_HOUR = 18`. The phone goes away in the evening, so anything that waits
for late hours never happens: the evening nudge, Close the Day, the social-log
review and the evening notification (18:30) all run off this constant. Don't
re-introduce a hard-coded 20:00/21:00/22:00 gate.

The knock-on effect is that **the night block is normally logged the next
morning** — a habit done at 22:00 with the phone already down is not a miss, it's
an unrecorded win. `renderCatchUpCard()` on QUESTS covers the last
`CATCH_UP_DAYS` (3) days: last night expanded, older days folded. Tapping a row
calls `toggleQuest('habitos', <pastDateKey>, id)`, so XP, stats and history land
on the day it actually happened.

Three exclusions keep it from manufacturing debt — days before `systemStartDay`,
vacation days, and habits whose `createdAt` is later than the day. Its copy never
says late, missed, or streak.

### Achievements
`data/achievements.js` holds 54 entries. The six with `category:'trabajo'` belong
to the retired WORK layer and can never be earned again, so `ACTIVE_ACHIEVEMENTS`
(defined in `index.html`) filters them out of every live view, the claim scan and
the LOG badge count. `ACHIEVEMENTS` itself stays whole so lookups by id still
resolve for already-claimed records. **Use `ACTIVE_ACHIEVEMENTS` for anything the
user sees.**

Categories shown: `progresion` · `hitos` · `maestria` · `racha`.

---

## Dead code — pending deletion

Retiring WORK removed it from the nav and the render path; the code itself is
still in the file and unreachable. Roughly 5,000 lines across:

- **WORK layer** — `renderTrabajo`, hunts, gates, red gates, gacha/vault,
  worker rank + dossier, side quests, commissions, quick capture stubs.
- **RPG layer** (already dead before this, since the 2026-09 pivot) — forge,
  workshop, city/guild, dungeons, gear/inventory, merchant, party/tavern.
- **Data files** — `dungeons.js`, `items.js`, `recipes.js`, `events.js`,
  `shop.js` are loaded by `<script>` tags but only feed dead code.
  `classes.js`, `achievements.js` and `content.js` are live.

When deleting: `state` still carries the dormant fields listed above. Leaving them
is harmless; removing them needs a `loadState()` migration so existing saves do
not throw.
