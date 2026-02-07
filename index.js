const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const response = document.getElementById("response");
const heartsContainer = document.querySelector('.hearts');

function moveNoButton() {
  const container = document.querySelector('.container');
  const cRect = container.getBoundingClientRect();
  const bRect = noBtn.getBoundingClientRect();

  const maxX = Math.max(0, cRect.width - bRect.width - 8);
  const maxY = Math.max(0, cRect.height - bRect.height - 8);

  const randomX = Math.random() * maxX;
  const randomY = Math.random() * maxY;

  // make the button absolutely positioned inside the container for smooth movement
  noBtn.style.position = 'absolute';
  noBtn.style.left = `${randomX}px`;
  noBtn.style.top = `${randomY}px`;
  noBtn.style.transform = 'scale(1.02)';
  setTimeout(() => (noBtn.style.transform = ''), 200);
}

// Use pointer events and touch support so it works on mobile
['pointerenter', 'touchstart', 'focus'].forEach((ev) => {
  noBtn.addEventListener(ev, (e) => {
    // On small screens, don't be too aggressive
    if (window.matchMedia('(max-width: 420px)').matches) {
      // small nudge instead of full escape
      noBtn.style.transform = 'translateY(-6px)';
      setTimeout(() => (noBtn.style.transform = ''), 220);
      return;
    }
    moveNoButton();
  });
});

yesBtn.addEventListener('click', () => {
  response.textContent = 'Yayyy! 💕 I knew it 😘';
  // playful finish: spawn hearts and confetti
  spawnHearts(180);
  spawnConfetti(280);

  // initialize week state: set Valentine's week start (Feb 7, 2026)
  const st = ensureInitialState();
  st.statuses = Array(days.length).fill('');
  // Set the start date of Valentine's week (Rose Day = Feb 7, 2026)
  st.weekStartDate = new Date(2026, 1, 7).toISOString();
  st.confirmedAt = new Date().toISOString();
  saveState(st);

  // reveal the week with animation
  const wrap = document.querySelector('.week-wrap');
  if(wrap){ wrap.classList.remove('hidden'); wrap.classList.add('revealed'); wrap.setAttribute('aria-hidden','false'); }
  renderWeek();
  // add celebration visuals
  showCelebration();

  // hide buttons after a short delay so user sees effects
  setTimeout(() => {
    noBtn.style.display = 'none';
    yesBtn.style.display = 'none';
  }, 700);
});

function spawnHearts(count = 12) {
  if (!heartsContainer) return;
  for (let i = 0; i < count; i++) {
    const h = document.createElement('div');
    h.className = 'heart';
    // random start position across width
    const startX = Math.random() * 100; // vw percent
    const left = startX + '%';
    const size = 8 + Math.random() * 28;
    h.style.left = left;
    h.style.width = `${size}px`;
    h.style.height = `${size}px`;
    h.style.opacity = Math.random() * 0.9 + 0.2;
    const duration = 3500 + Math.random() * 2600;
    h.style.animationDuration = duration + 'ms';
    h.style.animationDelay = (Math.random() * 400) + 'ms';
    heartsContainer.appendChild(h);

    // remove after animation
    setTimeout(() => {
      h.remove();
    }, duration + 800);
  }
}

// confetti: small colorful rectangles
function spawnConfetti(count = 30) {
  if (!heartsContainer) return;
  const colors = ['#ff5d7a','#ffd166','#ffd6e0','#ff7aa2','#ffb3c6','#ffd1dc'];
  for (let i=0;i<count;i++){
    const c = document.createElement('div');
    c.className = 'confetti';
    const left = Math.random()*100 + '%';
    c.style.left = left;
    c.style.background = colors[Math.floor(Math.random()*colors.length)];
    c.style.width = (6 + Math.random()*10) + 'px';
    c.style.height = (8 + Math.random()*18) + 'px';
    const dur = 1500 + Math.random()*2000;
    c.style.animationDuration = dur + 'ms';
    c.style.animationDelay = (Math.random()*200) + 'ms';
    heartsContainer.appendChild(c);
    setTimeout(()=>c.remove(), dur+500);
  }
}

// keyboard accessibility: move button when navigating
noBtn.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') moveNoButton();
});

// initial setup: center buttons for small screens
function ensureInitialPlacement() {
  if (window.matchMedia('(max-width: 420px)').matches) {
    // keep normal flow (buttons are flex items) so they stack
    noBtn.style.position = '';
    noBtn.style.left = '';
    noBtn.style.top = '';
  } else {
    // place buttons symmetrically if not already absolute
    const b = yesBtn.getBoundingClientRect();
    yesBtn.style.position = 'relative';
  }
}

window.addEventListener('resize', ensureInitialPlacement);
ensureInitialPlacement();

/* --- Valentine week: interactive 7 cards --- */
const days = [
  'Rose Day',
  'Propose Day',
  'Chocolate Day',
  'Teddy Day',
  'Promise Day',
  'Hug Day',
  "Valentine's Day"
];

const WEEK_KEY = 'valWeekState_v2';
const weekEl = document.getElementById('valWeek');

function loadState(){
  try { return JSON.parse(localStorage.getItem(WEEK_KEY)) || {} } catch(e){ return {} }
}
function saveState(st){ localStorage.setItem(WEEK_KEY, JSON.stringify(st)) }

// tasteful romantic quotes per day (PG)
const quotes = [
  "Tonight, this rose isn’t the only thing That your lips are gonna kiss🌹",
  "You make my heart skip beats in the sweetest way.",
  "Sweet like chocolate, warmer than a summer hug.",
  "Cuddles, laughter, and a soft teddy — all with you.",
  "Promises kept hand-in-hand, today and every day.",
  "Your hugs are my favorite place to be.",
  "Every little thing about you makes today perfect."
];

function ensureInitialState(){
  const st = loadState();
  if(!st.statuses) st.statuses = Array(days.length).fill('');
  if(typeof st.currentIndex !== 'number') st.currentIndex = 0;
  saveState(st);
  return st;
}

function shiftStatusesIfNeeded(){
  // This function is no longer needed with day-based unlocking
  // Status is now calculated dynamically based on current date vs card date
  return;
}

function getCardStatus(dayIndex){
  const st = loadState();
  if(!st.weekStartDate) return ''; // week not started
  
  const weekStart = new Date(st.weekStartDate);
  weekStart.setHours(0, 0, 0, 0); // start of day
  
  const cardDate = new Date(weekStart);
  cardDate.setDate(cardDate.getDate() + dayIndex);
  
  const now = new Date();
  now.setHours(0, 0, 0, 0); // start of today
  
  const timeDiff = now - cardDate;
  
  if(timeDiff < 0) return 'locked'; // card's day hasn't arrived
  if(timeDiff === 0) return 'today'; // it's the card's day
  return 'done'; // card's day has passed
}

function renderWeek(){
  const st = ensureInitialState();
  const {weekStartDate} = loadState();
  weekEl.innerHTML = '';
  const icons = ['🌹','💍','🍫','🧸','🤝','🤗','💘'];
  days.forEach((name, i)=>{
    const card = document.createElement('button');
    card.className = 'card pop-in';
    card.setAttribute('data-i', i);
    card.style.animationDelay = (i * 70) + 'ms';
    card.innerHTML = `
      <div class="icon">${icons[i] || '💝'}</div>
      <div class="day-index">Day ${i+1}</div>
      <div class="day-name">${name}</div>
      <div class="hint">Tap for details</div>
    `;

    const status = getCardStatus(i);
    if(status){
      const b = document.createElement('div');
      if(status === 'locked'){
        b.className = 'badge locked';
        b.textContent = 'Locked';
        card.classList.add('locked');
        // Calculate when this card unlocks
        if(weekStartDate){
          const cardDate = new Date(weekStartDate);
          cardDate.setDate(cardDate.getDate() + i);
          b.title = `Unlocks on ${cardDate.toLocaleDateString()}`;
        }
      } else {
        b.className = 'badge ' + status;
        b.textContent = status === 'today' ? 'Today' : status === 'done' ? 'Done' : status;
      }
      card.appendChild(b);
    }

    card.addEventListener('click', ()=>{
      const cardStatus = getCardStatus(i);
      // if locked, show unlock info
      if(cardStatus === 'locked'){
        if(weekStartDate){
          const cardDate = new Date(weekStartDate);
          cardDate.setDate(cardDate.getDate() + i);
          showToast(`${name} unlocks on ${cardDate.toLocaleDateString()} 💕`);
        }
        return;
      }
      // show detail card with quote when clicked (today or any day)
      showDetailCard(i);
    });
    weekEl.appendChild(card);
  });
}

/* simple toast */
function showToast(text, ms=2500){
  let t = document.querySelector('.val-toast');
  if(!t){
    t = document.createElement('div');
    t.className = 'val-toast';
    document.body.appendChild(t);
  }
  t.textContent = text;
  t.classList.add('visible');
  clearTimeout(t._hide);
  t._hide = setTimeout(()=> t.classList.remove('visible'), ms);
}

/* detail modal for a day */
function showDetailCard(i){
  const name = days[i];
  const q = quotes[i] || '';
  // create overlay
  const overlay = document.createElement('div');
  overlay.className = 'detail-overlay';
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');

  const card = document.createElement('div');
  card.className = 'detail-card';

  const sparkle = document.createElement('div');
  sparkle.className = 'detail-sparkle';
  card.appendChild(sparkle);

  const emoji = document.createElement('div');
  emoji.className = 'detail-emoji';
  const icons = ['🌹','💍','🍫','🧸','🤝','🤗','💘'];
  emoji.textContent = icons[i] || '💝';
  card.appendChild(emoji);

  const title = document.createElement('div');
  title.className = 'detail-title';
  title.textContent = name;
  card.appendChild(title);

  const quoteEl = document.createElement('div');
  quoteEl.className = 'detail-quote';
  quoteEl.textContent = q;
  card.appendChild(quoteEl);

  const msgInput = document.createElement('textarea');
  msgInput.className = 'detail-input';
  msgInput.placeholder = 'Write Your naughty thought about me ... 💝';
  msgInput.rows = 3;
  card.appendChild(msgInput);

  const actions = document.createElement('div');
  actions.className = 'detail-actions';

  const send = document.createElement('button');
  send.className = 'btn primary';
  send.textContent = 'Send 💌';
  send.addEventListener('click', ()=>{
    const customMsg = msgInput.value.trim();
    const finalMsg = customMsg || q;
    spawnHearts(12);
    spawnConfetti(26);
    // show private message screen
    showPrivateMessage(i, name, finalMsg, overlay);
  });

  const close = document.createElement('button');
  close.className = 'btn playful';
  close.textContent = 'Close';
  close.addEventListener('click', removeOverlay);

  actions.appendChild(send);
  actions.appendChild(close);
  card.appendChild(actions);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'detail-close';
  closeBtn.innerHTML = '✕';
  closeBtn.addEventListener('click', removeOverlay);
  card.appendChild(closeBtn);

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  function removeOverlay(){
    overlay.remove();
    document.removeEventListener('keydown', onKey);
  }

  function onKey(e){
    if(e.key === 'Escape') removeOverlay();
  }
  document.addEventListener('keydown', onKey);
}

/* show private message screen */
function showPrivateMessage(i, name, msg, oldOverlay){
  // hide old card
  oldOverlay.style.opacity = '0';
  oldOverlay.style.pointerEvents = 'none';

  // create new overlay with private message
  const overlay = document.createElement('div');
  overlay.className = 'detail-overlay';
  overlay.setAttribute('role','dialog');

  const card = document.createElement('div');
  card.className = 'private-message-screen';

  const label = document.createElement('div');
  label.className = 'private-label';
  label.textContent = '🔒 Private Message';
  card.appendChild(label);

  const icon = document.createElement('div');
  icon.className = 'private-icon';
  const icons = ['🌹','💍','🍫','🧸','🤝','🤗','💘'];
  icon.textContent = icons[i] || '💝';
  card.appendChild(icon);

  const title = document.createElement('div');
  title.className = 'detail-title';
  title.textContent = 'Only Your True Lover Can See This';
  card.appendChild(title);

  const msgText = document.createElement('div');
  msgText.className = 'private-message-text';
  msgText.textContent = msg;
  card.appendChild(msgText);

  const back = document.createElement('button');
  back.className = 'private-back';
  back.textContent = 'Back';
  back.addEventListener('click', ()=>{
    overlay.remove();
    oldOverlay.style.opacity = '1';
    oldOverlay.style.pointerEvents = 'auto';
  });
  card.appendChild(back);

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  showToast('Message sent & locked! 💕');
}

/* celebration banner and ribbon */
function showBanner(text, duration = 4200){
  let b = document.querySelector('.celebrate-banner');
  if(!b){
    b = document.createElement('div');
    b.className = 'celebrate-banner';
    document.body.appendChild(b);
  }
  b.textContent = text;
  // force reflow so transition runs
  void b.offsetWidth;
  b.classList.add('show');
  clearTimeout(b._hide);
  b._hide = setTimeout(()=>{
    b.classList.remove('show');
  }, duration);
}

function showCelebration(){
  // container glow
  const container = document.querySelector('.container');
  if(container) container.classList.add('celebrate');

  // banner
  showBanner("Happy Valentine's Week! 🎉");

  // add ribbon to today's card (if present)
  setTimeout(()=>{
    const todayCard = document.querySelector('.card .badge.today')?.closest('.card') || document.querySelector('.card[data-i="0"]');
    if(todayCard && !todayCard.querySelector('.ribbon')){
      const r = document.createElement('div');
      r.className = 'ribbon';
      r.textContent = 'Today';
      todayCard.appendChild(r);
      // brief pulse
      todayCard.classList.add('unlock-glow');
      setTimeout(()=> todayCard.classList.remove('unlock-glow'), 2200);
    }
  }, 280);

  // remove celebration class after a while
  setTimeout(()=>{
    if(container) container.classList.remove('celebrate');
  }, 5200);
}

// ensure week container exists; only render when revealed by user
if(weekEl){
  // do not auto-reveal the week on load. rendering will happen after the user clicks Yes.
  setInterval(()=>{ if(!document.querySelector('.week-wrap.hidden')) renderWeek(); }, 60*1000);
}
