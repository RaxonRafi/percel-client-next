import Link from 'next/link';
import type { CSSProperties } from 'react';

/** Three steps: book, track, deliver. */
export function HowItWorks() {
  return (
    <>
          <section className="section wrap how" id="how" style={{ paddingTop: '0' }}>
        <div className="section-head" data-reveal>
          <h2>Simple, Fast &amp; Hassle-Free</h2>
          <p>Sign up, book a pickup, and manage every parcel effortlessly with smart tracking and delivery proof.</p>
        </div>

        <div className="grid-2" data-stagger>
          <article className="panel" data-hover>
            <span className="step"><b>01</b>Book</span>
            <h3>Book a pickup in seconds.</h3>
            <p>Enter where it&apos;s going, choose a parcel size and a delivery speed, and get a tracking ID right away.</p>
            <div className="mock" data-mock="book" aria-hidden="true">
              <div className="stops">
                <div className="stop"><i></i><div><small>Pickup</small><b>12 Lake Road, Block C</b></div></div>
                <div className="stop end"><i><svg width="12" height="12"><use href="#i-pin" /></svg></i><div><small>Drop-off</small><b>48 Garden Street, Apt 5</b></div></div>
              </div>
              <div className="mock-label">Parcel size</div>
              <div className="sizes">
                <div className="size"><svg width="18" height="18"><use href="#i-box" /></svg>Small<small>Up to 1 kg</small></div>
                <div className="size on"><svg width="24" height="24"><use href="#i-box" /></svg>Medium<small>Up to 5 kg</small></div>
                <div className="size"><svg width="30" height="30"><use href="#i-box" /></svg>Large<small>Up to 15 kg</small></div>
              </div>
              <div className="mock-label">Delivery speed</div>
              <div className="speeds">
                <div className="thumb"></div>
                <span>Standard</span><span className="on">Express</span><span>Same-day</span>
              </div>
              <div className="mock-btn">Book pickup <svg width="14" height="14"><use href="#i-arrow" /></svg></div>
            </div>
          </article>

          <article className="panel" data-hover>
            <span className="step"><b>02</b>Track</span>
            <h3>Follow every scan, live.</h3>
            <p>From the first pickup scan to the doorstep, each status is logged with a time, so you and your receiver always know where the parcel is.</p>
            <div className="mock" data-mock="track" aria-hidden="true">
              <div className="mock-head">
                <div><small>Tracking ID</small><b>TRK-5789-2847</b></div>
                <span className="status"><span className="pulse"></span>Out for delivery</span>
              </div>
              <div className="timeline">
                <div className="tl-track"><div className="tl-fill"></div></div>
                <div className="tl-row"><i><svg width="11" height="11"><use href="#i-check" /></svg></i><div><b>Picked up</b><small>Collected from sender</small></div><time>09:12 AM</time></div>
                <div className="tl-row"><i><svg width="11" height="11"><use href="#i-check" /></svg></i><div><b>Arrived at sorting hub</b><small>Scanned and sorted for its route</small></div><time>11:40 AM</time></div>
                <div className="tl-row now"><i><svg width="12" height="12"><use href="#i-truck" /></svg></i><div><b>Out for delivery</b><small>Courier is on the way</small></div><time>02:05 PM</time></div>
                <div className="tl-row todo"><i></i><div><b>Delivered</b><small>Photo and signature on arrival</small></div><time>By 4:30 PM</time></div>
              </div>
            </div>
          </article>
        </div>

        <article className="panel coverage" data-reveal>
          <div className="copy">
            <span className="step"><b>03</b>Deliver</span>
            <h3>Delivered to every doorstep, with proof.</h3>
            <p>The right courier takes each route and confirms every drop-off with a photo and signature. Ship often? Set a recurring pickup once.</p>
            <Link className="btn-arrow sm" href="/register">
              <span className="btn">Create an account</span>
              <span className="circle"><svg width="13" height="13"><use href="#i-arrow" /></svg></span>
            </Link>
          </div>
          <div className="map" aria-hidden="true">
            <div className="dotfield"></div>
            <svg viewBox="0 0 400 220" preserveAspectRatio="none">
              <path className="route" pathLength="1" d="M200 110 C 250 40, 300 40, 332 62" />
              <path className="route" pathLength="1" d="M200 110 C 260 120, 290 130, 312 124" />
              <path className="route" pathLength="1" d="M200 110 C 270 170, 330 180, 372 160" />
            </svg>
            <span className="pin hub" style={{ left: '50%', top: '50%' }}><svg width="15" height="15"><use href="#i-box" /></svg></span>
            <span className="pin" style={{ left: '83%', top: '28%', '--c': '#e23b3b' } as CSSProperties}></span>
            <span className="pin" style={{ left: '78%', top: '56.500%', '--c': '#2f5a2a' } as CSSProperties}></span>
            <span className="pin" style={{ left: '93%', top: '72.700%', '--c': '#e0a400' } as CSSProperties}></span>
            <div className="ticket">
              <div className="ticket-row"><i><svg width="12" height="12"><use href="#i-repeat" /></svg></i><div><b>Recurring pickup</b><span>Every weekday, 10:00</span></div></div>
              <div className="ticket-row"><i><svg width="12" height="12"><use href="#i-truck" /></svg></i><div><b>Courier assigned</b><span>3 parcels on this route</span></div></div>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
