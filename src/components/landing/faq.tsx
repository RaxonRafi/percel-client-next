'use client';

import { useRef, useState } from 'react';
import { animate } from 'motion';
import { EASE, motionEnabled } from '@/lib/motion';
import { Icon } from '@/components/icon-sprite';

const QUESTIONS = [
  {
    q: 'How do I book a pickup?',
    a: 'Create a free account, choose New shipment, and enter the pickup and drop-off details along with the parcel weight. You get a tracking ID as soon as the booking is confirmed.',
  },
  {
    q: 'How can I track my parcel?',
    a: 'Enter your tracking ID on the Track page. No account is needed. You will see the current status and the full journey, from pickup through to delivery.',
  },
  {
    q: 'How is the delivery price worked out?',
    a: 'The price is calculated automatically from the parcel weight and any cash-on-delivery amount, and you see it before you confirm the booking.',
  },
  {
    q: 'How does proof of delivery work?',
    a: 'The courier confirms each drop-off before the parcel is marked as delivered, so there is a record of every handover that you can check from your dashboard.',
  },
  {
    q: 'How do I become a courier?',
    a: 'Sign up and choose Deliver parcels. You can sign in right away, and deliveries unlock once an admin has reviewed and approved your application.',
  },
];

export function Faq() {
  const [open, setOpen] = useState(0);
  const panels = useRef<(HTMLDivElement | null)[]>([]);

  function toggle(index: number) {
    const next = open === index ? -1 : index;
    if (motionEnabled()) {
      const closing = panels.current[open];
      const opening = panels.current[next];
      if (closing) {
        animate(closing, { height: [closing.offsetHeight, 0], opacity: [1, 0] }, { duration: 0.35, ease: EASE })
          .then(() => { closing.style.height = ''; });
      }
      if (opening) {
        animate(opening, { height: [0, opening.scrollHeight], opacity: [0, 1] }, { duration: 0.45, ease: EASE })
          .then(() => { opening.style.height = 'auto'; });
      }
    }
    setOpen(next);
  }

  return (
    <section className="section wrap" id="faq" style={{ paddingTop: 0 }}>
      <div className="faq js-faq">
        <div className="faq-intro" data-reveal>
          <span className="eyebrow"><i><Icon name="i-help" size={10} /></i>FAQ</span>
          <h2 className="h2">Questions, answered</h2>
          <p>Everything you need to know about sending, tracking, and delivering with Parcel Payout.</p>
          <div className="faq-help">
            <i><Icon name="i-chat" size={20} /></i>
            <div><b>Still stuck?</b><span>Ask Copilot, any time.</span></div>
            <button type="button" className="btn dark" data-open-chat>Open chat</button>
          </div>
        </div>

        <div className="faq-list" data-reveal>
          {QUESTIONS.map((item, i) => (
            <div className={`faq-item${open === i ? ' open' : ''}`} key={item.q}>
              <h3>
                <button
                  className="faq-q"
                  type="button"
                  aria-expanded={open === i}
                  aria-controls={`faq-${i}`}
                  onClick={() => toggle(i)}
                >
                  {item.q}<i />
                </button>
              </h3>
              <div className="faq-a" id={`faq-${i}`} ref={(el) => { panels.current[i] = el; }}>
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
