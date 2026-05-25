// ── Daily motivational quotes (index = day-of-month - 1, wraps at 31) ──
const DAILY_QUOTES = [
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "You don't rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "The hero is not the one who never fails. It is the one who rises every time.", author: "Unknown" },
  { text: "The body achieves what the mind believes.", author: "Unknown" },
  { text: "Motivation gets you going, but discipline keeps you growing.", author: "John Maxwell" },
  { text: "Every master was once a beginner. Every pro was once an amateur.", author: "Robin Sharma" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "What you do every day matters more than what you do once in a while.", author: "Gretchen Rubin" },
  { text: "Don't count the days. Make the days count.", author: "Muhammad Ali" },
  { text: "It's not about perfect. It's about effort.", author: "Jillian Michaels" },
  { text: "A warrior does not give up what he loves. He finds the love in what he does.", author: "Unknown" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "The difference between who you are and who you want to be is what you do.", author: "Unknown" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "Endure and persist. This pain will turn to your advantage.", author: "Ovid" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { text: "The goal is not to be better than the other person, but your previous self.", author: "Dalai Lama" },
  { text: "Each day is a new chapter in your story. Write it worthy of a hero.", author: "Unknown" },
  { text: "The chains of habit are too light to be felt until they are too heavy to be broken.", author: "Warren Buffett" },
  { text: "Every step forward is a step away from who you used to be.", author: "Unknown" },
  { text: "Strength does not come from physical capacity. It comes from an indomitable will.", author: "Mahatma Gandhi" },
  { text: "You have power over your mind — not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
  { text: "The pain of discipline is far less than the pain of regret.", author: "Sarah Bombell" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Your future self is watching you right now through your memories.", author: "Aubrey de Grey" },
  { text: "The night is darkest just before the dawn. Keep going, adventurer.", author: "Unknown" },
];

function _getDailyQuote() {
  const idx = (new Date().getDate() - 1) % DAILY_QUOTES.length;
  return DAILY_QUOTES[idx];
}

function showDailyQuoteOverlay() {
  const q = _getDailyQuote();
  const ov = document.createElement('div');
  ov.className = 'dquote-overlay';
  ov.innerHTML = `
    <div class="dquote-label">⟦ MESSAGE OF THE DAY ⟧</div>
    <div class="dquote-text">"${q.text}"</div>
    <div class="dquote-author">— ${q.author}</div>
    <button class="dquote-dismiss" onclick="
      const ov=this.closest('.dquote-overlay');
      ov.style.animation='masteryFadeOut 0.4s ease forwards';
      setTimeout(()=>{ ov.remove(); const next=_pendingAnims.shift(); if(next) next(); },400);
    ">⟦ BEGIN ⟧</button>
  `;
  document.body.appendChild(ov);
}

// Animations queued during load (before first render) — shown after renderAll()
const _pendingAnims = [];

function _buildHarvestInfo(dateKey) {
  const gains = {}; STAT_KEYS.forEach(k => gains[k] = 0);
  let xp = 0, done = 0;
  state.habitos.forEach(h => {
    const c = getCompletion(h, dateKey);
    if (c) { done++; xp += c.xp || 0; STAT_KEYS.forEach(k => { gains[k] += (c.gains||{})[k]||0; }); }
  });
  return { gains, xp, done, total: state.habitos.length, dateKey };
}

