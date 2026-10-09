/* Parcel Payout — sign in / sign up behaviour. Loaded after site.js.
   Design preview only: forms validate and show their states, but nothing is sent. */
(() => {
  const { motionOn, $, $$, EASE, SPRING } = PP;
  const animate = motionOn ? Motion.animate : null;
  const stagger = motionOn ? Motion.stagger : null;

  /* ---------- Entrance ---------- */
  if (animate) {
    animate('.auth-side', { opacity: [0, 1], scale: [0.98, 1] }, { duration: 0.9, ease: EASE });
    animate('.auth-side [data-side]', { opacity: [0, 1], y: [20, 0], filter: ['blur(8px)', 'blur(0px)'] },
      { duration: 0.9, ease: EASE, delay: stagger(0.12, { startDelay: 0.25 }) });
    animate('.auth-main [data-in]', { opacity: [0, 1], y: [16, 0] },
      { duration: 0.7, ease: EASE, delay: stagger(0.06, { startDelay: 0.15 }) });
    animate('.auth-side .aurora', { x: [0, 70, 10, 0], y: [0, -40, 30, 0] }, { duration: 16, ease: 'easeInOut', repeat: Infinity });

    // Brand-side tracker: the parcel travels along the bar on a loop
    const fill = $('.side-fill');
    if (fill) animate(fill, { width: ['8%', '66%', '66%', '100%', '100%'] },
      { duration: 7, times: [0, 0.35, 0.55, 0.9, 1], ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.6 });
  }

  /* ---------- Show / hide password ---------- */
  $$('[data-toggle-password]').forEach((btn) => {
    const input = btn.parentElement.querySelector('input');
    btn.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      btn.setAttribute('aria-pressed', String(show));
      $('use', btn).setAttribute('href', show ? '#i-eye-off' : '#i-eye');
    });
  });

  /* ---------- Sign up: role picker ---------- */
  const phone = $('#phone');
  const phoneHint = $('[data-phone-hint]');
  const courierNote = $('[data-courier-note]');
  $$('input[name="role"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const courier = radio.value === 'DELIVERY_PERSONNEL' && radio.checked;
      phone.required = courier;
      phoneHint.hidden = courier;
      courierNote.hidden = !courier;
      if (courier && animate) animate(courierNote, { opacity: [0, 1], y: [-8, 0] }, { duration: 0.4, ease: EASE });
    });
  });

  /* ---------- Sign up: password strength ---------- */
  const meter = $('[data-strength]');
  if (meter) {
    const bar = $('i', meter);
    const label = $('span', meter);
    const LEVELS = [
      { text: 'Use 8 or more characters', color: '#c0392b', width: 0 },
      { text: 'Weak', color: '#c0392b', width: 25 },
      { text: 'Fair', color: '#d68910', width: 50 },
      { text: 'Good', color: '#7a9b1f', width: 75 },
      { text: 'Strong', color: '#2f5a2a', width: 100 },
    ];
    $('#password').addEventListener('input', (e) => {
      const v = e.target.value;
      let score = 0;
      if (v.length >= 8) score += 1;
      if (v.length >= 12) score += 1;
      if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score += 1;
      if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) score += 1;
      if (v.length > 0 && score === 0) score = 1;
      const level = LEVELS[v.length ? score : 0];
      label.textContent = level.text;
      bar.style.setProperty('--c', level.color);
      if (animate) animate(bar, { width: `${level.width}%` }, { type: 'spring', stiffness: 220, damping: 26 });
      else bar.style.width = `${level.width}%`;
    });
  }

  /* ---------- Submit: shake on invalid, then loading → success ---------- */
  const form = $('[data-auth-form]');
  const done = $('.auth-done');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const invalid = $$('input', form).filter((i) => !i.checkValidity());
    if (invalid.length) {
      invalid[0].focus();
      if (animate) invalid.forEach((i) => animate(i, { x: [0, -8, 8, -5, 5, 0] }, { duration: 0.4 }));
      else invalid[0].reportValidity();
      return;
    }
    const btn = $('button[type="submit"]', form);
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span>${btn.dataset.loading}`;
    setTimeout(() => {
      $('[data-auth-intro]').hidden = true;
      form.hidden = true;
      $$('[data-auth-extra]').forEach((el) => { el.hidden = true; });
      done.hidden = false;
      if (animate) {
        animate(done, { opacity: [0, 1], y: [16, 0] }, { duration: 0.6, ease: EASE });
        animate($('i', done), { scale: [0, 1], rotate: [-45, 0] }, { type: 'spring', stiffness: 260, damping: 16, delay: 0.1 });
      }
    }, 1300);
  });
  // The forms use novalidate so the shake can run; keep native rules on the inputs themselves.
})();
