import Image from 'next/image';
import type { CSSProperties } from 'react';

/** Features bento grid. */
export function Features() {
  return (
    <>
          <section className="section wrap" id="features">
        <div className="feat-head" data-reveal>
          <div>
            <span className="eyebrow"><i><svg width="10" height="10"><use href="#i-box" /></svg></i>Features</span>
            <h2 className="h2">Modern Delivery Demands Flawless Execution</h2>
          </div>
          <div>
            <p>Getting a parcel from pickup to doorstep takes live data, accountable couriers, and a clear answer when something goes wrong.</p>
            <a className="more" href="#how">See how it works <svg width="16" height="16"><use href="#i-chevron" /></svg></a>
          </div>
        </div>

        <div className="bento" data-stagger>
          <article className="panel b-track on-dark" data-hover>
            <span className="tag"><i><svg width="12" height="12"><use href="#i-pin" /></svg></i>Live tracking</span>
            <h3>Know where every parcel is, every minute.</h3>
            <p>Each scan is logged door to door, so you and your receiver can follow the whole journey as it happens.</p>
            <div className="live-map" aria-hidden="true">
              <div className="dots"></div>
              <svg viewBox="0 0 600 320" preserveAspectRatio="xMidYMid slice">
                <path id="live-route" d="M70 250 C 190 250, 200 130, 300 140 S 430 60, 540 74" fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="2" strokeDasharray="5 7" strokeLinecap="round" />
                <path id="live-trail" d="M70 250 C 190 250, 200 130, 300 140 S 430 60, 540 74" fill="none" stroke="#d3f65b" strokeWidth="2.5" strokeLinecap="round" pathLength="1" strokeDasharray="0.55 1" />
                <circle cx="70" cy="250" r="6" fill="#0c110b" stroke="#d3f65b" strokeWidth="2.5" />
                <circle cx="540" cy="74" r="8" fill="#d3f65b" /><circle cx="540" cy="74" r="3" fill="#0b0f0b" />
                <g id="live-courier" transform="translate(315 137)">
                  <circle r="18" fill="#d3f65b" opacity=".25" />
                  <circle r="11" fill="#d3f65b" stroke="#0c110b" strokeWidth="2.5" />
                  <path d="M-5 -3h5.5v5.500H-5zM.5 -1.300h2.300l2.200 2.200v1.600H.5z" fill="none" stroke="#0b0f0b" strokeWidth="1.300" strokeLinejoin="round" />
                </g>
              </svg>
              <div className="map-toast one"><i><svg width="15" height="15"><use href="#i-box" /></svg></i><div><b>Picked up</b><span>12 Lake Road · 9:12 AM</span></div></div>
              <div className="map-toast two"><i><svg width="15" height="15"><use href="#i-truck" /></svg></i><div><b>Out for delivery</b><span>Courier is on the way</span></div></div>
            </div>
          </article>

          <article className="panel b-proof" data-hover>
            <span className="tag"><i><svg width="12" height="12"><use href="#i-camera" /></svg></i>Proof of delivery</span>
            <h3>Proof on every drop-off.</h3>
            <p>Couriers confirm each handover before a parcel is marked delivered.</p>
            <div className="inset-card proof" aria-hidden="true">
              <Image src="/hero_parcel.jpg" alt="" width={164} height={164} />
              <div>
                <b>Delivered to Sanzida A.</b>
                <small>Photo and signature captured</small>
                <svg className="signature" width="96" height="26" viewBox="0 0 90 26" fill="none"><path className="draw" pathLength="1" d="M3 19c7-13 11-15 12-9s-5 12-2 12 8-14 12-12-2 10 2 10 6-9 10-8 0 7 4 7 8-5 14-5 12 3 30-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="1" /></svg>
              </div>
              <span className="verified"><i><svg width="9" height="9"><use href="#i-check" /></svg></i>Verified</span>
            </div>
          </article>

          <article className="panel b-claims" data-hover>
            <span className="tag"><i><svg width="12" height="12"><use href="#i-shield" /></svg></i>Claims</span>
            <h3>Claims without the back-and-forth.</h3>
            <p>If something goes wrong, raise a claim and follow it from your dashboard.</p>
            <div className="inset-card" aria-hidden="true">
              <div className="claim-head"><b>Damaged parcel</b><span>In review</span></div>
              <div className="claim-steps">
                <div className="claim-line"><i></i></div>
                <span className="done">Raised</span><span className="now">In review</span><span>Resolved</span>
              </div>
            </div>
          </article>

          <article className="panel b-notify" data-hover>
            <span className="tag"><i><svg width="12" height="12"><use href="#i-bolt" /></svg></i>Notifications</span>
            <h3>Updates the moment they happen.</h3>
            <p>Status changes reach you in real time, without refreshing.</p>
            <div className="note-stack" aria-hidden="true">
              <div className="note"><i><svg width="16" height="16"><use href="#i-truck" /></svg></i><div><b>Out for delivery</b><span>TRK-5789-2847 is on its way</span></div></div>
              <div className="note"><i><svg width="16" height="16"><use href="#i-box" /></svg></i><div><b>Parcel picked up</b><span>Collected from the sender</span></div></div>
              <div className="note"><i><svg width="16" height="16"><use href="#i-check" /></svg></i><div><b>Delivered</b><span>Signed by the receiver</span></div></div>
            </div>
          </article>

          <article className="panel b-copilot" data-hover>
            <span className="tag"><i><svg width="12" height="12"><use href="#i-chat" /></svg></i>Copilot</span>
            <h3>Answers on call, day or night.</h3>
            <p>Ask about a parcel, a booking, or a claim.</p>
            <div className="bubbles" aria-hidden="true">
              <div className="bub me">Where is my parcel?</div>
              <div className="bub">Out for delivery. Want the full journey?</div>
            </div>
            <button type="button" className="btn dark" data-open-chat>Ask Copilot</button>
          </article>

          <article className="panel b-insight" data-hover>
            <span className="tag"><i><svg width="12" height="12"><use href="#i-clock" /></svg></i>Dashboard</span>
            <h3>Every shipment in one view.</h3>
            <p>See your parcels and how deliveries are moving at a glance.</p>
            <div aria-hidden="true" style={{ marginTop: 'auto' }}>
              <div className="bars">
                <i style={{ '--h': '38%' } as CSSProperties}></i><i style={{ '--h': '56%' } as CSSProperties}></i><i style={{ '--h': '44%' } as CSSProperties}></i><i className="hi" style={{ '--h': '72%' } as CSSProperties}></i><i style={{ '--h': '60%' } as CSSProperties}></i><i className="top" style={{ '--h': '100%' } as CSSProperties}></i><i className="hi" style={{ '--h': '80%' } as CSSProperties}></i>
              </div>
              <div className="bar-days"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
