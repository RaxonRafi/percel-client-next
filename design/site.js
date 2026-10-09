/* Parcel Payout — behaviour shared by every page in /design:
   scroll reveals, number count-ups and the chat assistant. */
(() => {
  const motionOn = document.documentElement.classList.contains('js-motion');
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const EASE = [0.16, 1, 0.3, 1];
  const SPRING = { type: 'spring', stiffness: 260, damping: 22 };
  const VIEW = { amount: 0.25, margin: '0px 0px -8% 0px' };

  window.PP = { motionOn, $, $$, EASE, SPRING, VIEW };

  /* ---------- Scroll reveals + count-ups ---------- */
  if (motionOn) {
    const { animate, inView, stagger } = Motion;

    $$('[data-reveal]').forEach((el) => {
      inView(el, () => {
        animate(el, { opacity: [0, 1], y: [28, 0] }, { duration: 0.9, ease: EASE });
      }, VIEW);
    });

    $$('[data-stagger]').forEach((group) => {
      inView(group, () => {
        animate([...group.children], { opacity: [0, 1], y: [26, 0], scale: [0.97, 1] },
          { duration: 0.8, ease: EASE, delay: stagger(0.09) });
      }, VIEW);
    });

    $$('[data-count]').forEach((el) => {
      const to = Number(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      inView(el, () => {
        animate(0, to, {
          duration: 1.6, ease: EASE,
          onUpdate: (v) => { el.textContent = Math.round(v).toLocaleString('en-US') + suffix; },
        });
      }, { amount: 1 });
    });
  }

  /* ---------- Footer: truck drives along the road, wordmark rises letter by letter ---------- */
  const footerWord = $('.footer-word');
  if (motionOn && footerWord) {
    const { animate, inView, stagger } = Motion;
    footerWord.innerHTML = [...footerWord.textContent].map((c) => (c === ' ' ? ' ' : `<span>${c}</span>`)).join('');
    const letters = $$('span', footerWord);
    letters.forEach((l) => { l.style.opacity = 0; });
    inView(footerWord, () => {
      animate(letters, { opacity: [0, 1], y: ['45%', '0%'] }, { duration: 0.9, ease: EASE, delay: stagger(0.045) });
    }, { amount: 0.3 });
    animate('.footer-truck', { left: ['-6%', '104%'] }, { duration: 16, ease: 'linear', repeat: Infinity });
  }

  /* ---------- Chat assistant ---------- */
  // Pages that should stay distraction-free (sign in / sign up) opt out with <body data-no-chat>
  if (document.body.hasAttribute('data-no-chat')) return;

  const ICON = {
    // Speech bubble holding a parcel — the Copilot mark
    chat: '<svg class="icon-chat" width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3.500c6.100 0 11 4.300 11 9.700s-4.900 9.700-11 9.700c-1.200 0-2.400-.2-3.500-.5L5 24.500l1.300-4.400C4.300 18.300 3 15.900 3 13.200c0-5.400 4.900-9.700 11-9.700Z"/><path d="m14 8.600 4.200 2.300v4.600L14 17.800l-4.200-2.300v-4.600L14 8.600Z"/><path d="m9.800 10.900 4.200 2.300 4.200-2.300M14 13.200v4.600"/></svg>',
    close: '<svg class="icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    box: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>',
    boxLg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>',
    minimize: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>',
    send: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5.500 11.500 12 5l6.500 6.500"/></svg>',
    x: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    doc: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6v18h12V7l-4-4Z"/><path d="M14 3v4h4"/></svg>',
  };

  // Design-only canned answers. In the app these come from the Copilot API.
  const REPLIES = {
    'Where is my parcel?': { text: 'Share your tracking ID (it looks like TRK-5789-2847) and I\'ll pull up the latest scan. You can also open the Track page any time.', source: 'Tracking guide' },
    'How do I book a pickup?': { text: 'Sign in, choose <b>New parcel</b>, add the pickup and drop-off details, then confirm. You get a tracking ID straight away.', source: 'Booking a pickup' },
    'Become a courier': { text: 'Create an account and pick <b>Deliver parcels</b>. An admin reviews your application before deliveries unlock.', source: 'Courier applications' },
    'Raise a claim': { text: 'Open the parcel in your dashboard and choose <b>Raise a claim</b>. You can follow it there until it is resolved.', source: 'Claims' },
  };
  const FALLBACK = { text: 'Thanks! This is a design preview, so I can only answer the suggested questions for now.' };

  const root = document.createElement('div');
  root.innerHTML = `
    <div class="chat-teaser" hidden>
      <span>Need a hand? Ask Copilot 👋</span>
      <button type="button" aria-label="Dismiss">${ICON.x}</button>
    </div>
    <section class="chat-panel" id="chat-panel" role="dialog" aria-label="Parcel Payout Copilot" hidden>
      <header class="chat-head">
        <span class="chat-avatar">${ICON.boxLg}</span>
        <div><b>Parcel Payout Copilot</b><small>Always active · replies in seconds</small></div>
        <button type="button" data-chat-close aria-label="Minimise chat">${ICON.minimize}</button>
      </header>
      <div class="chat-body" aria-live="polite">
        <span class="chat-day">Today</span>
        <div class="msg"><span class="mini">${ICON.box}</span><div class="bubble">Hi! I'm Copilot 👋 I can help you track a parcel, book a pickup, or answer delivery questions.</div></div>
      </div>
      <div class="chat-suggest">
        ${Object.keys(REPLIES).map((q) => `<button type="button">${q}</button>`).join('')}
      </div>
      <form class="chat-form">
        <input type="text" placeholder="Type your question..." aria-label="Message" autocomplete="off">
        <button type="submit" aria-label="Send">${ICON.send}</button>
      </form>
      <p class="chat-note">Copilot can make mistakes. Check important details.</p>
    </section>
    <button type="button" class="chat-launcher" aria-label="Toggle chat assistant" aria-expanded="false" aria-controls="chat-panel">
      ${ICON.chat}${ICON.close}
      <span class="chat-badge">1</span>
    </button>`;
  document.body.append(...root.children);

  const launcher = $('.chat-launcher');
  const panel = $('.chat-panel');
  const teaser = $('.chat-teaser');
  const body = $('.chat-body');
  const suggest = $('.chat-suggest');
  const form = $('.chat-form');
  const input = $('input', form);
  const animate = motionOn ? Motion.animate : null;

  const setOpen = (open) => {
    launcher.setAttribute('aria-expanded', String(open));
    teaser.hidden = true;
    if (open) {
      panel.hidden = false;
      $('.chat-badge')?.remove();
      if (animate) animate(panel, { opacity: [0, 1], scale: [0.9, 1], y: [24, 0] }, { type: 'spring', stiffness: 320, damping: 26 });
      input.focus({ preventScroll: true });
    } else if (animate) {
      animate(panel, { opacity: 0, scale: 0.94, y: 16 }, { duration: 0.2, ease: 'easeIn' })
        .then(() => { panel.hidden = true; });
    } else {
      panel.hidden = true;
    }
  };

  const addMessage = (html, who = 'bot') => {
    const msg = document.createElement('div');
    msg.className = `msg ${who === 'user' ? 'user' : ''}`;
    msg.innerHTML = `${who === 'user' ? '' : `<span class="mini">${ICON.box}</span>`}<div class="bubble">${html}</div>`;
    body.append(msg);
    body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' });
    if (animate) animate(msg, { opacity: [0, 1], y: [12, 0], scale: [0.96, 1] }, { type: 'spring', stiffness: 380, damping: 28 });
    return msg;
  };

  const ask = (question) => {
    const text = question.trim();
    if (!text) return;
    const safe = text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    addMessage(safe, 'user');
    suggest.hidden = true;
    const typing = addMessage('<span class="typing"><i></i><i></i><i></i></span>');
    setTimeout(() => {
      const reply = REPLIES[text] || FALLBACK;
      typing.remove();
      addMessage(reply.text + (reply.source ? `<br><span class="source">${ICON.doc}${reply.source}</span>` : ''));
    }, 1100);
  };

  launcher.addEventListener('click', () => setOpen(launcher.getAttribute('aria-expanded') !== 'true'));
  $('[data-chat-close]').addEventListener('click', () => { setOpen(false); launcher.focus(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { setOpen(false); launcher.focus(); } });
  suggest.addEventListener('click', (e) => { if (e.target.closest('button')) ask(e.target.closest('button').textContent); });
  form.addEventListener('submit', (e) => { e.preventDefault(); ask(input.value); input.value = ''; });
  $('button', teaser).addEventListener('click', () => { teaser.hidden = true; });
  // Any element with data-open-chat (e.g. the Contact section) opens the assistant
  $$('[data-open-chat]').forEach((el) => el.addEventListener('click', (e) => { e.preventDefault(); setOpen(true); }));

  if (animate) {
    animate(launcher, { opacity: [0, 1], scale: [0.4, 1] }, { type: 'spring', stiffness: 260, damping: 18, delay: 1.2 });
    setTimeout(() => {
      if (launcher.getAttribute('aria-expanded') === 'true') return;
      teaser.hidden = false;
      animate(teaser, { opacity: [0, 1], x: [12, 0], scale: [0.94, 1] }, SPRING);
    }, 3500);
  }
})();
