// ── Yami's daily line — one stoic quote per day-of-month, wraps at 31. Shown as a
// full overlay right after the harvest briefing on the first open of a new day
// (see updateStreakOnLoad()), then minimized to a strip at the top of QUESTS.
const DAILY_QUOTES = [
  { text: "You have power over your mind — not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
  { text: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius" },
  { text: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius" },
  { text: "If it is not right, do not do it; if it is not true, do not say it.", author: "Marcus Aurelius" },
  { text: "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.", author: "Marcus Aurelius" },
  { text: "Confine yourself to the present.", author: "Marcus Aurelius" },
  { text: "The best revenge is to be unlike him who performed the injury.", author: "Marcus Aurelius" },
  { text: "It is not death that a man should fear; he should fear never beginning to live.", author: "Marcus Aurelius" },
  { text: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius" },
  { text: "When you arise in the morning, think of what a precious privilege it is to be alive — to breathe, to think, to enjoy, to love.", author: "Marcus Aurelius" },
  { text: "The soul becomes dyed with the color of its thoughts.", author: "Marcus Aurelius" },
  { text: "Accept the things to which fate binds you, and love the people with whom fate brings you together, but do so with all your heart.", author: "Marcus Aurelius" },
  { text: "Dwell on the beauty of life. Watch the stars, and see yourself running with them.", author: "Marcus Aurelius" },
  { text: "How much more grievous are the consequences of anger than the causes of it.", author: "Marcus Aurelius" },
  { text: "Difficulties strengthen the mind, as labor does the body.", author: "Seneca" },
  { text: "He who is brave is free.", author: "Seneca" },
  { text: "We suffer more often in imagination than in reality.", author: "Seneca" },
  { text: "Every new beginning comes from some other beginning's end.", author: "Seneca" },
  { text: "It is not that we have a short time to live, but that we waste a lot of it.", author: "Seneca" },
  { text: "While we wait for life, life passes.", author: "Seneca" },
  { text: "As is a tale, so is life: not how long it is, but how good it is, is what matters.", author: "Seneca" },
  { text: "He suffers more than necessary who suffers before it is necessary.", author: "Seneca" },
  { text: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus" },
  { text: "It's not what happens to you, but how you react to it that matters.", author: "Epictetus" },
  { text: "No man is free who is not master of himself.", author: "Epictetus" },
  { text: "Wealth consists not in having great possessions, but in having few wants.", author: "Epictetus" },
  { text: "Make the best use of what is in your power, and take the rest as it happens.", author: "Epictetus" },
  { text: "He is a wise man who does not grieve for the things which he has not, but rejoices for those which he has.", author: "Epictetus" },
  { text: "Only the educated are free.", author: "Epictetus" },
  { text: "Circumstances do not make the man, they only reveal him to himself.", author: "Epictetus" },
  { text: "Man is disturbed not by things, but by the views he takes of them.", author: "Epictetus" },
];

function _getDailyQuote() {
  const idx = (new Date().getDate() - 1) % DAILY_QUOTES.length;
  return DAILY_QUOTES[idx];
}

// ── Manin's daily line — one 1%-improvement / compound-interest quote per
// day-of-month, same index as DAILY_QUOTES so both flip over together. Shown
// as a small strip at the top of FORGE and WORKSHOP, no popup, same text in both.
const FORGE_QUOTES = [
  { text: "Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it.", author: "Albert Einstein" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "Habits are the compound interest of self-improvement.", author: "James Clear" },
  { text: "Success is the product of daily habits — not once-in-a-lifetime transformations.", author: "James Clear" },
  { text: "Time magnifies the margin between success and failure. It will multiply whatever you feed it.", author: "James Clear" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Someone's sitting in the shade today because someone planted a tree a long time ago.", author: "Warren Buffett" },
  { text: "The chains of habit are too light to be felt until they are too heavy to be broken.", author: "Warren Buffett" },
  { text: "Little strokes fell great oaks.", author: "Benjamin Franklin" },
  { text: "It's the little details that are vital. Little things make big things happen.", author: "John Wooden" },
  { text: "A small daily task, if it be really daily, will beat the labours of a spasmodic Hercules.", author: "Anthony Trollope" },
  { text: "Little hinges swing big doors.", author: "W. Clement Stone" },
  { text: "Success is nothing more than a few simple disciplines, practiced every day.", author: "Jim Rohn" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "The man who moves a mountain begins by carrying away small stones.", author: "Confucius" },
  { text: "You'll never change your life until you change something you do daily. The secret of your success is found in your daily routine.", author: "John C. Maxwell" },
  { text: "Your life today is essentially the sum of your habits.", author: "Darren Hardy" },
  { text: "Small, smart choices, plus consistency and time, equal a radical difference.", author: "Darren Hardy" },
  { text: "It's not what we do once in a while that shapes our lives, but what we do consistently.", author: "Tony Robbins" },
  { text: "What you do every day matters more than what you do once in a while.", author: "Gretchen Rubin" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "Every master was once a beginner. Every pro was once an amateur.", author: "Robin Sharma" },
  { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "Success is the progressive realization of a worthy goal.", author: "Earl Nightingale" },
  { text: "Genius is eternal patience.", author: "Michelangelo" },
  { text: "What gets measured gets improved.", author: "Peter Drucker" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Don't count the days. Make the days count.", author: "Muhammad Ali" },
  { text: "Greatness is not a function of circumstance. It is, in large part, a matter of conscious choice and discipline.", author: "Jim Collins" },
];

function _getForgeQuote() {
  const idx = (new Date().getDate() - 1) % FORGE_QUOTES.length;
  return FORGE_QUOTES[idx];
}

// ── Leah's old contextual dialogue system was removed — replaced by a single
// work/productivity quote per day-of-month, same index pattern as DAILY_QUOTES
// and FORGE_QUOTES. Shown as a small strip at the top of WORK and CITY, no popup.
const WORK_QUOTES = [
  { text: "Amateurs sit and wait for inspiration; the rest of us just get up and go to work.", author: "Stephen King" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "There is no substitute for hard work.", author: "Thomas Edison" },
  { text: "Do the hard jobs first. The easy jobs will take care of themselves.", author: "Dale Carnegie" },
  { text: "Well done is better than well said.", author: "Benjamin Franklin" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It is not enough to be busy. The question is: what are we busy about?", author: "Henry David Thoreau" },
  { text: "Nothing will work unless you do.", author: "Maya Angelou" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "You may delay, but time will not.", author: "Benjamin Franklin" },
  { text: "Work spares us from three evils: boredom, vice, and need.", author: "Voltaire" },
  { text: "Diligence is the mother of good fortune.", author: "Benjamin Franklin" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Either you run the day, or the day runs you.", author: "Jim Rohn" },
  { text: "Do the one thing you think you cannot do. Fail at it. Try again.", author: "Eleanor Roosevelt" },
  { text: "Not finishing is worse than not starting.", author: "Marissa Mayer" },
  { text: "If you spend too much time thinking about a thing, you'll never get it done.", author: "Bruce Lee" },
  { text: "The expert in anything was once a beginner who kept working.", author: "Helen Hayes" },
  { text: "Never mistake motion for action.", author: "Ernest Hemingway" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "The best way out is always through.", author: "Robert Frost" },
  { text: "Whatever you do, work at it with all your heart.", author: "Colossians 3:23" },
  { text: "Ordinary people think merely of spending time. Great people think of using it.", author: "Arthur Schopenhauer" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Efficiency is doing things right. Effectiveness is doing the right things.", author: "Peter Drucker" },
  { text: "Someone is sitting in the shade today because someone planted a tree a long time ago.", author: "Warren Buffett" },
  { text: "Vision without execution is just hallucination.", author: "Thomas Edison" },
  { text: "Well begun is half done.", author: "Aristotle" },
];

function _getWorkQuote() {
  const idx = (new Date().getDate() - 1) % WORK_QUOTES.length;
  return WORK_QUOTES[idx];
}

function showDailyQuoteOverlay() {
  const q = _getDailyQuote();
  const ov = document.createElement('div');
  ov.className = 'dquote-overlay';
  ov.innerHTML = `
    <div class="dquote-label">⟦ YAMI ⟧</div>
    <div class="dquote-text">"${q.text}"</div>
    <div class="dquote-author">— ${q.author}</div>
    <button class="dquote-dismiss" onclick="
      const ov=this.closest('.dquote-overlay');
      ov.style.animation='masteryFadeOut 0.4s ease forwards';
      setTimeout(()=>{ ov.remove(); const next=_pendingAnims.shift(); if(next) next(); },400);
    ">⟦ SURPASS YOUR LIMITS ⟧</button>
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
  // Work tasks completed that day + gold earned from them
  let workDone = 0, workGold = 0;
  (state.trabajo || []).forEach(t => {
    const c = t.done && t.done[dateKey];
    if (c) { workDone++; workGold += (c.drops && c.drops.gold) || 0; }
  });
  // Avoid habits: clean if none logged a relapse that day
  const avoidTotal = (state.negativos || []).length;
  const avoidClean = avoidTotal > 0 && !(state.negativos || []).some(n => !!(n.done && n.done[dateKey]));
  const total = state.habitos.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return { gains, xp, done, total, pct, perfect: total > 0 && done === total, workDone, workGold, avoidTotal, avoidClean, dateKey };
}

