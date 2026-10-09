import Link from 'next/link';
import Image from 'next/image';
import { SiteNav } from '@/components/site-nav';

const HEADLINE = 'Effortless Delivery for a Faster Tomorrow';

/** Dark hero: nav, headline, photo with the live tracking panel, partners row. */
export function Hero() {
  return (
    <>
        <header className="hero on-dark" id="top">
        <div className="hero-dark">
          <div className="hero-grid" aria-hidden="true"></div>
          <div className="aurora" aria-hidden="true"></div>

          <SiteNav current="home" />

          <div className="hero-main wrap">
            <div>
              <h1 className="split">
                {HEADLINE.split(' ').map((word, i) => (
                  <span key={i}><span className="w">{word}</span>{' '}</span>
                ))}
              </h1>
              <p className="lede" data-in>Book pickups, follow every scan live, and get proof on every drop-off — fast, tracked parcel delivery in one platform.</p>
              <Link className="btn-arrow" href="/register" data-in>
                <span className="btn">Start for free</span>
                <span className="circle"><svg width="16" height="16"><use href="#i-arrow" /></svg></span>
              </Link>
            </div>

            <div className="hero-visual" aria-hidden="true">
              <div className="glow"></div>
              <div className="parallax">
                <div className="photo-shadow">
                  <div className="hero-photo">
                    <Image src="/hero_parcel.jpg" alt="" fill priority sizes="(min-width: 960px) 520px, 100vw" />
                  </div>
                </div>
                <div className="tracker">
                  <div className="tracker-head">
                    <div><small>Tracking ID</small><b>TRK-5789-2847</b></div>
                    <i><svg width="16" height="16"><use href="#i-box" /></svg></i>
                  </div>
                  <div className="tracker-bar">
                    <span className="done" style={{ left: '0' }}></span><span className="done" style={{ left: '50%' }}></span><span style={{ left: '100%' }}></span>
                    <div className="tracker-fill"><i className="knob"><svg width="11" height="11"><use href="#i-truck" /></svg></i></div>
                  </div>
                  <div className="tracker-steps"><span>Picked up</span><span className="on">In transit</span><span>Delivered</span></div>
                </div>
                <div className="chip dark"><span className="pulse"></span><span data-stage-label>Out for delivery</span></div>
                <div className="chip light"><span className="ok"><svg width="11" height="11"><use href="#i-check" /></svg></span>Delivered &amp; signed</div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-fade wrap">
          <h2 data-reveal>Meet Our Esteemed Partners &amp; Affiliates</h2>
          <div className="partners" data-stagger>
            <span className="wordmark"><svg width="16" height="16"><use href="#g-bars" /></svg>cartwell</span>
            <span className="wordmark"><svg width="16" height="16"><use href="#g-ring" /></svg>Kitepay</span>
            <span className="wordmark"><svg width="16" height="16"><use href="#g-diamond" /></svg>Mercato</span>
            <span className="wordmark"><svg width="16" height="16"><use href="#g-half" /></svg>Shopnest</span>
            <span className="wordmark"><svg width="16" height="16"><use href="#g-tri" /></svg>bloomly</span>
          </div>
        </div>
      </header>
    </>
  );
}
