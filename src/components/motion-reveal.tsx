'use client';

import { useEffect } from 'react';
import { $, $$, EASE, VIEW, createMotionScope, motionEnabled, stagger } from '@/lib/motion';

/**
 * Wires up the page-wide scroll effects driven by data attributes:
 * `data-reveal` (fade up), `data-stagger` (children fade up in turn),
 * `data-count` (number counts up) — plus the footer's truck and wordmark.
 * Render once per page, after the content it should animate.
 */
export function MotionReveal() {
  useEffect(() => {
    if (!motionEnabled()) return;
    const scope = createMotionScope();
    const { animate } = scope;

    $$('[data-reveal]').forEach((el) => {
      scope.inView(el, () => {
        animate(el, { opacity: [0, 1], y: [28, 0] }, { duration: 0.9, ease: EASE });
      }, VIEW);
    });

    $$('[data-stagger]').forEach((group) => {
      scope.inView(group, () => {
        animate([...group.children], { opacity: [0, 1], y: [26, 0], scale: [0.97, 1] },
          { duration: 0.8, ease: EASE, delay: stagger(0.09) });
      }, VIEW);
    });

    $$('[data-count]').forEach((el) => {
      const to = Number(el.dataset.count);
      const suffix = el.dataset.suffix ?? '';
      scope.inView(el, () => {
        animate(0, to, {
          duration: 1.6,
          ease: EASE,
          onUpdate: (v) => { el.textContent = Math.round(v).toLocaleString('en-US') + suffix; },
        });
      }, { amount: 1 });
    });

    const footerWord = $('.footer-word');
    if (footerWord) {
      const letters = $$('span', footerWord);
      letters.forEach((l) => { l.style.opacity = '0'; });
      scope.inView(footerWord, () => {
        animate(letters, { opacity: [0, 1], y: ['45%', '0%'] }, { duration: 0.9, ease: EASE, delay: stagger(0.045) });
      }, { amount: 0.3 });
      animate('.footer-truck', { left: ['-6%', '104%'] }, { duration: 16, ease: 'linear', repeat: Infinity });
    }

    return () => scope.stop();
  }, []);

  return null;
}
