import Link from 'next/link';

/** Dark closing panel: call to action, tracking box, links and the wordmark. */
export function SiteFooter() {
  return (
    <>
      <footer className="site-footer on-dark">
        <div className="hero-grid" aria-hidden="true"></div>
        <div className="footer-road" aria-hidden="true">
          <svg className="footer-truck" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6h11v10H2zM13 9h4l4 4v3h-8z" /><circle cx="6.5" cy="17.5" r="1.8" fill="#0c110b" /><circle cx="17" cy="17.5" r="1.8" fill="#0c110b" /></svg>
        </div>

        <div className="wrap footer-cta">
          <div data-reveal>
            <h2>Ready to send your <em>first parcel?</em></h2>
            <p>Create an account in a minute, or check on a parcel that is already on its way.</p>
            <Link className="btn-arrow" href="/register">
              <span className="btn">Start for free</span>
              <span className="circle"><svg width="16" height="16"><use href="#i-arrow" /></svg></span>
            </Link>
          </div>
          <div data-reveal>
            <label className="footer-track-label" htmlFor="footer-track-id">Already shipped? Track it here.</label>
            <form className="footer-track" action="track.html">
              <input id="footer-track-id" name="id" placeholder="Enter tracking ID" required />
              <button className="btn" type="submit">Track</button>
            </form>
          </div>
        </div>

        <div className="wrap footer-top">
          <div className="footer-brand">
            <Link className="brand" href="/"><svg width="22" height="22"><use href="#i-box" /></svg>Parcel Payout</Link>
            <p>Fast, tracked parcel delivery with proof on every drop-off, from pickup to doorstep.</p>
            <div className="socials">
              <a href="#" aria-label="X"><svg width="16" height="16"><use href="#s-x" /></svg></a>
              <a href="#" aria-label="LinkedIn"><svg width="17" height="17"><use href="#s-in" /></svg></a>
              <a href="#" aria-label="Instagram"><svg width="17" height="17"><use href="#s-ig" /></svg></a>
              <a href="#" aria-label="Facebook"><svg width="17" height="17"><use href="#s-fb" /></svg></a>
            </div>
          </div>
          <nav className="footer-col" aria-label="Product">
            <h3>Product</h3>
            <Link href="/#features">Features</Link>
            <Link href="/#how">How it works</Link>
            <Link href="/track">Track a parcel</Link>
            <Link href="/#reviews">Reviews</Link>
          </nav>
          <nav className="footer-col" aria-label="Support">
            <h3>Support</h3>
            <Link href="/#faq">FAQ</Link>
            <Link href="/#contact">Contact us</Link>
            <a href="#" data-open-chat>Chat with Copilot</a>
            <Link href="/register">Become a courier</Link>
          </nav>
          <nav className="footer-col" aria-label="Account">
            <h3>Account</h3>
            <Link href="/login">Log in</Link>
            <Link href="/register">Create account</Link>
            <Link href="/dashboard">Dashboard</Link>
          </nav>
        </div>

        <div className="footer-word" aria-hidden="true">
          {[...'Parcel Payout'].map((char, i) => (char === ' ' ? ' ' : <span key={i}>{char}</span>))}
        </div>

        <div className="wrap footer-bottom">
          <span>© 2026 Parcel Payout. All rights reserved.</span>
          <nav aria-label="Legal"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a></nav>
          <a className="to-top" href="#top">Back to top <i><svg width="15" height="15"><use href="#i-arrow" /></svg></i></a>
        </div>
      </footer>
    </>
  );
}
