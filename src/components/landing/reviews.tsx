import type { CSSProperties } from 'react';

/** Featured review plus two auto-scrolling columns. */
export function Reviews() {
  return (
    <>
          <section className="section wrap" id="reviews" style={{ paddingTop: '0' }}>
        <div className="section-head" data-reveal>
          <span className="eyebrow"><i><svg width="10" height="10"><use href="#i-star" /></svg></i>Reviews</span>
          <h2>Join <span data-count="16" data-suffix="M+">16M+</span> Parcels Delivered Smarter with Us</h2>
          <p>Senders, shop owners, and couriers on why they stay.</p>
        </div>

        <div className="reviews">
          <figure className="quote featured" data-reveal>
            <div className="hero-grid" aria-hidden="true"></div>
            <div>
              <svg className="mark" width="44" height="44"><use href="#i-quote" /></svg>
              <blockquote>Booking a pickup takes under a minute, and I can see every scan until the parcel reaches my customer. I recommend it to anyone who ships regularly.</blockquote>
            </div>
            <div>
              <div className="stars" aria-label="Rated 5 out of 5"><svg width="16" height="16"><use href="#i-star" /></svg><svg width="16" height="16"><use href="#i-star" /></svg><svg width="16" height="16"><use href="#i-star" /></svg><svg width="16" height="16"><use href="#i-star" /></svg><svg width="16" height="16"><use href="#i-star" /></svg></div>
              <figcaption className="who"><span className="avatar">ZM</span><div><b>Zain Malik</b><span>Online store owner</span></div></figcaption>
            </div>
          </figure>

          <div className="review-cols" data-reveal>
            <div className="review-col">
              <div className="review-track" data-marquee="up">
                <div className="review-set">
                  <figure className="quote card">
                    <div className="stars" aria-label="Rated 5 out of 5"><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg></div>
                    <blockquote>Having all my pickups, deliveries, and proof photos in one app saves me so much time and takes the stress out of the day.</blockquote>
                    <figcaption className="who"><span className="avatar" style={{ '--c': '#b33a3a' } as CSSProperties}>RK</span><div><b>Rami Kadir</b><span>Courier</span></div></figcaption>
                  </figure>
                  <figure className="quote card">
                    <div className="stars" aria-label="Rated 5 out of 5"><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg></div>
                    <blockquote>I&apos;ve tried several delivery services, but this one truly shines. The live status updates mean my customers stop asking where their order is.</blockquote>
                    <figcaption className="who"><span className="avatar" style={{ '--c': '#2f5a2a' } as CSSProperties}>KA</span><div><b>Khalid Amir</b><span>Operations lead</span></div></figcaption>
                  </figure>
                  <figure className="quote card">
                    <div className="stars" aria-label="Rated 5 out of 5"><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg></div>
                    <blockquote>A parcel arrived damaged once, and the claim was sorted from the dashboard without a single phone call.</blockquote>
                    <figcaption className="who"><span className="avatar" style={{ '--c': '#6b4fd8' } as CSSProperties}>NS</span><div><b>Nadia Sultana</b><span>Boutique founder</span></div></figcaption>
                  </figure>
                </div>
                <div className="review-set" aria-hidden="true">
                  <figure className="quote card">
                    <div className="stars"><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg></div>
                    <blockquote>Having all my pickups, deliveries, and proof photos in one app saves me so much time and takes the stress out of the day.</blockquote>
                    <figcaption className="who"><span className="avatar" style={{ '--c': '#b33a3a' } as CSSProperties}>RK</span><div><b>Rami Kadir</b><span>Courier</span></div></figcaption>
                  </figure>
                  <figure className="quote card">
                    <div className="stars"><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg></div>
                    <blockquote>I&apos;ve tried several delivery services, but this one truly shines. The live status updates mean my customers stop asking where their order is.</blockquote>
                    <figcaption className="who"><span className="avatar" style={{ '--c': '#2f5a2a' } as CSSProperties}>KA</span><div><b>Khalid Amir</b><span>Operations lead</span></div></figcaption>
                  </figure>
                  <figure className="quote card">
                    <div className="stars"><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg></div>
                    <blockquote>A parcel arrived damaged once, and the claim was sorted from the dashboard without a single phone call.</blockquote>
                    <figcaption className="who"><span className="avatar" style={{ '--c': '#6b4fd8' } as CSSProperties}>NS</span><div><b>Nadia Sultana</b><span>Boutique founder</span></div></figcaption>
                  </figure>
                </div>
              </div>
            </div>
            <div className="review-col">
              <div className="review-track" data-marquee="down">
                <div className="review-set">
                  <figure className="quote card">
                    <div className="stars" aria-label="Rated 5 out of 5"><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg></div>
                    <blockquote>Managing shipments used to mean juggling different apps and spreadsheets. Now every parcel and delivery receipt lives in one place.</blockquote>
                    <figcaption className="who"><span className="avatar" style={{ '--c': '#1f7a8c' } as CSSProperties}>TZ</span><div><b>Tariq Zahir</b><span>Warehouse manager</span></div></figcaption>
                  </figure>
                  <figure className="quote card">
                    <div className="stars" aria-label="Rated 5 out of 5"><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg></div>
                    <blockquote>As a small business owner I was searching for a reliable way to send orders across the city. Same-day delivery changed how we sell.</blockquote>
                    <figcaption className="who"><span className="avatar" style={{ '--c': '#c2417a' } as CSSProperties}>FN</span><div><b>Faris Nabil</b><span>Bakery owner</span></div></figcaption>
                  </figure>
                  <figure className="quote card">
                    <div className="stars" aria-label="Rated 5 out of 5"><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg></div>
                    <blockquote>My receivers get a clear arrival time and a photo when it lands. Fewer missed deliveries, fewer messages for me.</blockquote>
                    <figcaption className="who"><span className="avatar" style={{ '--c': '#c9772e' } as CSSProperties}>SR</span><div><b>Sara Rahman</b><span>Marketplace seller</span></div></figcaption>
                  </figure>
                </div>
                <div className="review-set" aria-hidden="true">
                  <figure className="quote card">
                    <div className="stars"><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg></div>
                    <blockquote>Managing shipments used to mean juggling different apps and spreadsheets. Now every parcel and delivery receipt lives in one place.</blockquote>
                    <figcaption className="who"><span className="avatar" style={{ '--c': '#1f7a8c' } as CSSProperties}>TZ</span><div><b>Tariq Zahir</b><span>Warehouse manager</span></div></figcaption>
                  </figure>
                  <figure className="quote card">
                    <div className="stars"><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg></div>
                    <blockquote>As a small business owner I was searching for a reliable way to send orders across the city. Same-day delivery changed how we sell.</blockquote>
                    <figcaption className="who"><span className="avatar" style={{ '--c': '#c2417a' } as CSSProperties}>FN</span><div><b>Faris Nabil</b><span>Bakery owner</span></div></figcaption>
                  </figure>
                  <figure className="quote card">
                    <div className="stars"><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg><svg width="14" height="14"><use href="#i-star" /></svg></div>
                    <blockquote>My receivers get a clear arrival time and a photo when it lands. Fewer missed deliveries, fewer messages for me.</blockquote>
                    <figcaption className="who"><span className="avatar" style={{ '--c': '#c9772e' } as CSSProperties}>SR</span><div><b>Sara Rahman</b><span>Marketplace seller</span></div></figcaption>
                  </figure>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
