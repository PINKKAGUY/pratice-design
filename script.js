/* ============================================================
   Design Showcase — script.js
   ============================================================ */

/* --- Splash screen — typewriter with typos --- */
(() => {
  const splash = document.getElementById('splash');
  const splashText = document.querySelector('.splash__text');
  const splashCursor = document.querySelector('.splash__cursor');
  const hero = document.getElementById('hero');
  const body = document.body;

  // Sequence of actions: 'type' adds a char, 'delete' removes one, 'pause' waits
  const sequence = [
    { action: 'type', char: 'P' },
    { action: 'type', char: 'I' },
    { action: 'type', char: 'N' },
    { action: 'type', char: 'K' },
    { action: 'type', char: 'A' },       // typo: PINKA
    { action: 'pause', duration: 300 },
    { action: 'delete' },                 // PINK
    { action: 'pause', duration: 150 },
    { action: 'type', char: 'K' },        // PINKK
    { action: 'type', char: 'A' },
    { action: 'type', char: 'G' },
    { action: 'type', char: 'I' },        // typo: PINKAGI
    { action: 'pause', duration: 250 },
    { action: 'delete' },                 // PINKAG
    { action: 'pause', duration: 100 },
    { action: 'type', char: 'U' },
    { action: 'type', char: 'Y' },        // PINKKAGUY ✓
  ];

  let current = '';
  let stepIndex = 0;

  body.classList.add('splash-active');

  function updateDisplay() {
    splashText.textContent = current;
    splashText.style.width = 'auto';
    const width = splashText.offsetWidth;
    splashText.style.width = width + 'px';
  }

  function runStep() {
    if (stepIndex >= sequence.length) {
      // Typing complete — pause then exit
      setTimeout(() => {
        splashCursor.style.animation = 'none';
        splashCursor.style.opacity = '0';
        splash.classList.add('splash--exit');

        setTimeout(() => {
          splash.classList.add('splash--hidden');
          body.classList.remove('splash-active');
          if (hero) hero.classList.add('hero--loaded');
          document.querySelectorAll('.reveal').forEach((el) => {
            revealObserver.observe(el);
          });
        }, 1000);
      }, 1000);
      return;
    }

    const step = sequence[stepIndex];
    stepIndex++;

    if (step.action === 'type') {
      current += step.char;
      updateDisplay();
      setTimeout(runStep, 90 + Math.random() * 70);
    } else if (step.action === 'delete') {
      current = current.slice(0, -1);
      updateDisplay();
      setTimeout(runStep, 60);
    } else if (step.action === 'pause') {
      setTimeout(runStep, step.duration);
    }
  }

  setTimeout(runStep, 500);
})();

/* --- Scroll reveal (IntersectionObserver) --- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

/* --- Component tabs --- */
const tabBtns = document.querySelectorAll('.comp-tabs__btn');
const tabPanels = document.querySelectorAll('.comp-tabs__panel');

tabBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    // Deactivate all
    tabBtns.forEach((b) => {
      b.classList.remove('comp-tabs__btn--active');
      b.setAttribute('aria-selected', 'false');
    });
    tabPanels.forEach((p) => {
      p.classList.remove('comp-tabs__panel--active');
      p.hidden = true;
    });

    // Activate clicked
    btn.classList.add('comp-tabs__btn--active');
    btn.setAttribute('aria-selected', 'true');

    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (panel) {
      panel.hidden = false;
      // Trigger reflow then fade in
      requestAnimationFrame(() => {
        panel.classList.add('comp-tabs__panel--active');
      });
    }
  });
});

/* --- Footer year --- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* ============================================================
   Complex Component Interactions
   ============================================================ */

/* --- 1. Calendar — day selection & time slot randomization --- */
(() => {
  const calGrid = document.querySelector('.cal__grid');
  const slotsTitle = document.querySelector('.cal__slots-title');
  const slotsContainer = document.querySelector('.cal__slots');
  if (!calGrid || !slotsContainer) return;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const timePool = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
    '1:00 PM', '2:00 PM', '2:30 PM', '3:00 PM', '4:00 PM', '4:30 PM'
  ];

  // March 2026 starts on Sunday (day 0). First day shown in grid is Mon Feb 23.
  // The grid has 7 dow headers then days. Non-muted days 1-31 are March 2026.
  // March 1, 2026 = Sunday. So day N falls on: (N + 6) % 7 → 0=Sun..6=Sat
  // Actually let's compute: March 1 2026 is a Sunday.
  function getDayOfWeek(dayNum) {
    // March 1 2026 = Sunday (index 0)
    return (dayNum - 1) % 7; // 1→0(Sun), 2→1(Mon) ... but this is wrong for > 7
    // Use actual date
  }

  function getDayName(dayNum) {
    // March 2026
    const d = new Date(2026, 2, dayNum); // month is 0-indexed
    return dayNames[d.getDay()];
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function updateSlots(dayNum) {
    const dayName = getDayName(dayNum);
    slotsTitle.textContent = `${dayName}, Mar ${dayNum}`;

    // Remove old slot buttons
    const oldSlots = slotsContainer.querySelectorAll('.cal__slot');
    oldSlots.forEach((s) => s.remove());

    // Pick 3-5 random times
    const count = 3 + Math.floor(Math.random() * 3);
    const picked = shuffle(timePool).slice(0, count).sort((a, b) => {
      const toMin = (t) => {
        const [time, period] = t.split(' ');
        let [h, m] = time.split(':').map(Number);
        if (period === 'PM' && h !== 12) h += 12;
        return h * 60 + m;
      };
      return toMin(a) - toMin(b);
    });

    picked.forEach((time) => {
      const btn = document.createElement('button');
      btn.className = 'cal__slot';
      btn.textContent = time;
      slotsContainer.appendChild(btn);
    });
  }

  // Event delegation on the calendar grid
  calGrid.addEventListener('click', (e) => {
    const day = e.target.closest('.cal__day');
    if (!day || day.classList.contains('cal__day--muted')) return;

    // Deselect previous
    const prev = calGrid.querySelector('.cal__day--selected');
    if (prev) prev.classList.remove('cal__day--selected');

    // Select clicked
    day.classList.add('cal__day--selected');

    // Update time slots
    const dayNum = parseInt(day.textContent, 10);
    updateSlots(dayNum);
  });

  // Slot selection via delegation
  slotsContainer.addEventListener('click', (e) => {
    const slot = e.target.closest('.cal__slot');
    if (!slot) return;
    slot.classList.toggle('cal__slot--selected');
  });
})();


/* --- 2. Kanban — drag & drop cards between columns --- */
(() => {
  const kanban = document.querySelector('.kanban');
  if (!kanban) return;

  // Make all cards draggable
  kanban.querySelectorAll('.kanban__card').forEach((card) => {
    card.setAttribute('draggable', 'true');
  });

  let draggedCard = null;

  kanban.addEventListener('dragstart', (e) => {
    const card = e.target.closest('.kanban__card');
    if (!card) return;
    draggedCard = card;
    card.classList.add('kanban__card--dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  kanban.addEventListener('dragend', (e) => {
    if (draggedCard) {
      draggedCard.classList.remove('kanban__card--dragging');
      draggedCard = null;
    }
    kanban.querySelectorAll('.kanban__col--drop-target').forEach((col) => {
      col.classList.remove('kanban__col--drop-target');
    });
  });

  kanban.addEventListener('dragover', (e) => {
    const col = e.target.closest('.kanban__col');
    if (!col || !draggedCard) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    col.classList.add('kanban__col--drop-target');
  });

  kanban.addEventListener('dragleave', (e) => {
    const col = e.target.closest('.kanban__col');
    if (!col) return;
    // Only remove if we're actually leaving the column
    if (!col.contains(e.relatedTarget)) {
      col.classList.remove('kanban__col--drop-target');
    }
  });

  kanban.addEventListener('drop', (e) => {
    e.preventDefault();
    const col = e.target.closest('.kanban__col');
    if (!col || !draggedCard) return;

    col.classList.remove('kanban__col--drop-target');

    // Append card to the column (after the header)
    col.appendChild(draggedCard);

    // Update all column counts
    kanban.querySelectorAll('.kanban__col').forEach((c) => {
      const count = c.querySelectorAll('.kanban__card').length;
      const badge = c.querySelector('.kanban__count');
      if (badge) badge.textContent = count;
    });
  });
})();


/* --- 3. Dashboard — animated bars on visibility --- */
(() => {
  const dashPanel = document.getElementById('panel-dashboard');
  if (!dashPanel) return;

  const bars = dashPanel.querySelectorAll('.dash__bar');
  let animated = false;

  function animateBars() {
    if (animated) return;
    animated = true;
    bars.forEach((bar, i) => {
      const value = bar.getAttribute('data-value');
      setTimeout(() => {
        bar.style.height = value + '%';
        bar.classList.add('dash__bar--animated');
      }, i * 80);
    });
  }

  // Animate when the dashboard tab becomes visible
  const observer = new MutationObserver(() => {
    if (!dashPanel.hidden && !animated) {
      // Small delay to let the panel render
      requestAnimationFrame(() => {
        animateBars();
      });
    }
  });

  observer.observe(dashPanel, { attributes: true, attributeFilter: ['hidden'] });

  // Also check if it's already visible (in case it loads visible)
  if (!dashPanel.hidden) {
    animateBars();
  }
})();


/* --- 4. Chat — send messages & auto-reply --- */
(() => {
  const chat = document.querySelector('.chat');
  if (!chat) return;

  const messagesContainer = chat.querySelector('.chat__messages');
  const input = chat.querySelector('.chat__input');
  const sendBtn = chat.querySelector('.chat__send');
  const typingIndicator = messagesContainer.querySelector('.chat__msg:last-child');

  const autoReplies = [
    'That sounds great!',
    "I'll look into it.",
    'Let me check and get back to you.',
    "Good point, let's discuss further.",
    "Noted! I'll update the designs."
  ];

  function getTimeString() {
    const now = new Date();
    let h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, '0');
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${period}`;
  }

  function createMessage(text, type) {
    const msg = document.createElement('div');
    msg.className = `chat__msg chat__msg--${type} chat__msg--new`;
    msg.innerHTML = `<p>${text}</p><span class="chat__msg-time">${getTimeString()}</span>`;
    return msg;
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    // Insert sent message before the typing indicator
    const sentMsg = createMessage(text, 'sent');
    messagesContainer.insertBefore(sentMsg, typingIndicator);
    input.value = '';
    scrollToBottom();

    // Auto-reply after 1-2 seconds
    const delay = 1000 + Math.random() * 1000;
    setTimeout(() => {
      const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
      const receivedMsg = createMessage(reply, 'received');
      messagesContainer.insertBefore(receivedMsg, typingIndicator);
      scrollToBottom();
    }, delay);
  }

  sendBtn.addEventListener('click', sendMessage);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
})();
