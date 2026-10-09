'use client';

import { useEffect } from 'react';
import {
  $, $$, EASE, SPRING, VIEW, createMotionScope, motionEnabled, stagger, wait,
  type MotionScope,
} from '@/lib/motion';

/** Headline focuses in word by word, the photo wipes up, then the parcel "story" loops. */
function hero(scope: MotionScope) {
  const { animate } = scope;
  const SHOWN_CLIP = 'inset(0% 0% 0% 0% round 28px)';
  const HIDDEN_CLIP = 'inset(100% 0% 0% 0% round 28px)';

  animate('.pg-landing .nav', { opacity: [0, 1], y: [-12, 0] }, { duration: 0.8, ease: EASE });
  animate('.split .w', { opacity: [0, 1], y: [22, 0], filter: ['blur(12px)', 'blur(0px)'] },
    { duration: 1, ease: EASE, delay: stagger(0.06, { startDelay: 0.1 }) });
  animate('.hero-main [data-in]', { opacity: [0, 1], y: [16, 0], filter: ['blur(8px)', 'blur(0px)'] },
    { duration: 0.9, ease: EASE, delay: stagger(0.12, { startDelay: 0.6 }) });

  animate('.hero-photo', { clipPath: [HIDDEN_CLIP, SHOWN_CLIP] }, { duration: 1.3, ease: EASE, delay: 0.3 });
  animate('.hero-photo img', { scale: [1.25, 1] }, { duration: 1.9, ease: EASE, delay: 0.3 });
  animate('.hero-visual .glow', { opacity: [0, 1] }, { duration: 1.6, delay: 0.5 });
  animate('.tracker', { opacity: [0, 1], y: [20, 0] }, { duration: 0.8, ease: EASE, delay: 1.2 });
  animate('.chip.dark', { opacity: [0, 1], y: [-10, 0] }, { duration: 0.7, ease: EASE, delay: 1.4 });

  // Slow drifting light behind the headline
  animate('.aurora', { x: [0, 90, 20, 0], y: [0, -50, 40, 0], scale: [1, 1.15, 0.95, 1] },
    { duration: 18, ease: 'easeInOut', repeat: Infinity });

  // The photo drifts a little slower than the page on scroll
  const heroDark = $('.hero-dark');
  if (heroDark) {
    scope.scroll(animate('.parallax', { y: [0, -50] }, { ease: 'linear' }),
      { target: heroDark, offset: ['start start', 'end start'] });
  }

  // Story loop: Picked up → In transit → Delivered, then the "signed" chip appears
  const fill = $('.tracker-fill');
  const signed = $('.chip.light');
  const stageLabel = $('[data-stage-label]');
  if (!fill || !signed || !stageLabel) return;
  const dots = $$('.tracker-bar > span');
  const stepLabels = $$('.tracker-steps span');
  const STAGES = ['Picked up', 'Out for delivery', 'Delivered'];

  const setStage = (i: number) => {
    dots.forEach((d, j) => d.classList.toggle('done', j <= i));
    stepLabels.forEach((l, j) => l.classList.toggle('on', j === i));
    stageLabel.textContent = STAGES[i];
    animate(stageLabel, { opacity: [0, 1], y: [6, 0] }, { duration: 0.4, ease: EASE });
  };
  const travel = (from: number, to: number) =>
    scope.done(animate(fill, { width: [`${from}%`, `${to}%`] }, { duration: 1.8, ease: 'easeInOut' }));

  (async () => {
    await wait(2.4);
    while (scope.alive) {
      fill.style.width = '0%';
      setStage(0);
      await scope.done(animate(fill, { opacity: [0, 1] }, { duration: 0.3 }));
      await wait(1.1);
      await travel(0, 50);
      setStage(1);
      await wait(1.5);
      await travel(50, 100);
      setStage(2);
      animate(signed, { opacity: [0, 1], scale: [0.8, 1], y: [10, 0] }, SPRING);
      await wait(3.2);
      animate(signed, { opacity: 0, y: 6 }, { duration: 0.35 });
      await scope.done(animate(fill, { opacity: 0 }, { duration: 0.35 }));
    }
  })();
}

function features(scope: MotionScope) {
  const { animate } = scope;

  // Live tracking: the courier drives the route on a loop, leaving a lime trail
  const route = $<SVGPathElement>('#live-route');
  const trail = $<SVGPathElement>('#live-trail');
  const courier = $<SVGGElement>('#live-courier');
  if (route && trail && courier) {
    const length = route.getTotalLength();
    animate(0, 1, {
      duration: 9, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.2,
      onUpdate: (p) => {
        const point = route.getPointAtLength(length * p);
        courier.setAttribute('transform', `translate(${point.x} ${point.y})`);
        trail.setAttribute('stroke-dasharray', `${p} 1`);
      },
    });
  }
  const toasts = $$('.map-toast');
  toasts.forEach((t) => { t.style.opacity = '0'; });
  scope.inView($('.live-map'), () => {
    animate(toasts, { opacity: [0, 1], y: [14, 0], scale: [0.92, 1] }, { ...SPRING, delay: stagger(0.5, { startDelay: 0.5 }) });
  }, VIEW);

  // Claims: progress line fills to the current step
  const claimFill = $('.claim-line i');
  if (claimFill) {
    claimFill.style.width = '0%';
    scope.inView($('.b-claims'), () => {
      animate(claimFill, { width: ['0%', '50%'] }, { duration: 1.1, ease: 'easeInOut', delay: 0.5 });
    }, VIEW);
  }

  // Notifications: the front card drops to the back of the stack every few seconds
  const notes = $$('.note');
  const SLOTS = [{ y: 0, scale: 1, opacity: 1 }, { y: 14, scale: 0.94, opacity: 0.75 }, { y: 28, scale: 0.88, opacity: 0.45 }];
  const order = notes.map((_, i) => i);
  scope.interval(() => {
    order.push(order.shift()!);
    order.forEach((n, slot) => {
      notes[n].style.zIndex = String(notes.length - slot);
      animate(notes[n], SLOTS[slot], { type: 'spring', stiffness: 240, damping: 24 });
    });
  }, 2600);

  // Copilot bubbles pop in like a real exchange; dashboard bars grow from the baseline
  const bubbles = $$('.bub');
  bubbles.forEach((b) => { b.style.opacity = '0'; });
  scope.inView($('.b-copilot'), () => {
    animate(bubbles, { opacity: [0, 1], y: [10, 0], scale: [0.9, 1] }, { ...SPRING, delay: stagger(0.7, { startDelay: 0.5 }) });
  }, VIEW);
  const bars = $$('.bars i');
  bars.forEach((b) => { b.style.transform = 'scaleY(0)'; });
  scope.inView($('.b-insight'), () => {
    animate(bars, { scaleY: [0, 1] }, { type: 'spring', stiffness: 160, damping: 18, delay: stagger(0.07, { startDelay: 0.4 }) });
  }, VIEW);
}

function howItWorks(scope: MotionScope) {
  const { animate } = scope;

  // Signature + map routes draw themselves in
  $$<SVGPathElement>('.draw, .route').forEach((path) => {
    path.style.strokeDashoffset = '1';
    scope.inView(path.closest('.panel'), () => {
      animate(path, { strokeDashoffset: [1, 0] }, { duration: 1.5, ease: 'easeInOut', delay: 0.4 });
    }, VIEW);
  });
  $$('.pin').forEach((pin, i) => {
    pin.style.opacity = '0';
    scope.inView(pin.closest('.panel'), () => {
      animate(pin, { opacity: [0, 1], scale: [0, 1] }, { ...SPRING, delay: 0.3 + i * 0.35 });
    }, VIEW);
  });
  animate('.ticket', { y: ['-50%', '-54%'] }, { duration: 3, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' });

  // Speed selector cycles through the three options
  const speeds = $$('.speeds span');
  const thumb = $('.speeds .thumb');
  if (thumb) {
    let speed = 1;
    scope.interval(() => {
      const from = speed;
      speed = (speed + 1) % speeds.length;
      speeds.forEach((s, i) => s.classList.toggle('on', i === speed));
      animate(thumb, { x: [`${from * 100}%`, `${speed * 100}%`] }, { type: 'spring', stiffness: 320, damping: 28 });
    }, 2200);
  }

  // Timeline fills up to the current scan, then each step pops in
  const timelineFill = $('.tl-fill');
  const steps = $$('.tl-row i');
  if (timelineFill) {
    timelineFill.style.height = '0%';
    steps.forEach((s) => { s.style.opacity = '0'; });
    scope.inView($('[data-mock="track"]'), () => {
      animate(timelineFill, { height: ['0%', '66.67%'] }, { duration: 1.4, ease: 'easeInOut', delay: 0.5 });
      animate(steps, { opacity: [0, 1], scale: [0, 1] }, { ...SPRING, delay: stagger(0.4, { startDelay: 0.4 }) });
    }, VIEW);
  }
}

/** All of the landing page's motion. Renders nothing; mount it after the sections. */
export function LandingMotion() {
  useEffect(() => {
    if (!motionEnabled()) return;
    const scope = createMotionScope();
    const { animate } = scope;

    hero(scope);
    features(scope);
    howItWorks(scope);

    // Cards lift with a spring on hover
    $$('[data-hover]').forEach((card) => {
      scope.hover(card, () => {
        animate(card, { y: -6 }, SPRING);
        return () => { animate(card, { y: 0 }, SPRING); };
      });
    });

    // Reviews: two columns scroll in opposite directions and pause on hover
    $$('[data-marquee]').forEach((track) => {
      const up = track.dataset.marquee === 'up';
      const loop = animate(track, { y: up ? ['0%', '-50%'] : ['-50%', '0%'] }, { duration: 32, ease: 'linear', repeat: Infinity });
      const pause = () => loop.pause();
      const play = () => loop.play();
      track.addEventListener('pointerenter', pause);
      track.addEventListener('pointerleave', play);
    });

    return () => scope.stop();
  }, []);

  return null;
}
