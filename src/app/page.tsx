import Link from 'next/link';
import { 
  IconBox, IconArrowRight, IconCircleCheck, IconClock, 
  IconCurrencyDollar, IconShieldCheck, IconReceipt, IconBuildingStore,
  IconDots, IconLayoutDashboard, IconPackage
} from '@tabler/icons-react';

export default function LandingPage() {
  return (
    <div id="landing" style={{ position: 'relative', overflow: 'hidden', background: '#ffffff', minHeight: '100vh' }}>
      <div className="hero-blob"></div>

      <nav className="nav-bar-sp" style={{ background: 'transparent', borderBottom: 'none' }}>
        <Link className="nav-logo" href="/" style={{ color: '#000', fontSize: '18px' }}>
          <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            <div style={{ width: '12px', height: '12px', background: '#14B8A6', borderRadius: '2px' }}></div>
            <div style={{ width: '12px', height: '12px', background: '#F97316', borderRadius: '2px' }}></div>
            <div style={{ width: '12px', height: '12px', background: '#3B82F6', borderRadius: '2px' }}></div>
          </div>
          <span style={{ color: '#000', marginLeft: '6px' }}>Parcel Payout</span>
        </Link>
        <div className="nav-links" style={{ margin: '0 auto', gap: '40px' }}>
          <Link href="#features">Features</Link>
          <Link href="#pricing">Pricing</Link>
          <Link href="#about-us">About Us</Link>
          <Link href="#use-cases">Use Cases</Link>
        </div>
        <div>
          <Link href="/dashboard" className="btn-black-pill">
            Get started
          </Link>
        </div>
      </nav>

      <section style={{ paddingTop: '160px', paddingBottom: '40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div className="hero-badge-redesign">
          <IconReceipt size={16} color="#14B8A6" /> Courier claims platform
        </div>
        
        <h1 className="hero-title" style={{ maxWidth: '800px', margin: '0 auto 24px', letterSpacing: '-1px', color: '#000', fontSize: '56px' }}>
          The easy way to claim for <span style={{ color: '#14B8A6' }}>lost and missing parcels</span>
        </h1>
        
        <p className="hero-sub" style={{ margin: '0 auto 40px', maxWidth: '520px' }}>
          Parcel Payout works with all major carriers to reclaim funds from lost and damaged shipments.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard" className="btn-black-pill" style={{ padding: '12px 28px', fontSize: '15px' }}>
            Get started
          </Link>
          <form action="/track" method="GET" style={{ display: 'flex', background: '#fff', border: '1px solid var(--surface3)', borderRadius: '50px', padding: '4px 4px 4px 20px', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <IconPackage size={18} color="var(--ink3)" />
            <input type="text" name="id" required placeholder="Tracking number..." style={{ border: 'none', outline: 'none', background: 'transparent', padding: '8px 12px', width: '200px', fontSize: '15px', color: '#000' }} />
            <button type="submit" className="btn-black-pill" style={{ padding: '8px 20px', fontSize: '14px', background: '#14B8A6' }}>Track</button>
          </form>
        </div>
      </section>

      {/* Dashboard Mockup */}
      <section style={{ padding: '0 48px', position: 'relative', zIndex: 1 }}>
        <div className="mockup-3d-container">
          <div className="mockup-3d-wrapper">
            <div className="mockup-dashboard-inner">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                <div style={{ fontWeight: '700', fontSize: '14px', display: 'flex', gap:'6px', alignItems:'center' }}>
                   <div style={{ width: '10px', height: '10px', background: '#14B8A6', borderRadius: '2px' }}></div>
                   Parcel Payout
                </div>
                <div style={{ fontSize: '13px', fontWeight: '500', display:'flex', gap:'8px', alignItems:'center' }}>
                  Hey, Tarun! <div style={{width:'24px',height:'24px',borderRadius:'50%',background:'#f1f1f1',display:'flex',alignItems:'center',justifyContent:'center'}}>T</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ border: '1px solid var(--surface3)', borderRadius: '8px', padding: '16px' }}>
                   <div style={{ fontSize: '11px', color: 'var(--ink3)' }}>Claims paid</div>
                   <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>478</div>
                   <div style={{ fontSize: '10px', color: 'var(--green)' }}>+12.5% vs last month</div>
                </div>
                <div style={{ border: '1px solid var(--surface3)', borderRadius: '8px', padding: '16px' }}>
                   <div style={{ fontSize: '11px', color: 'var(--ink3)' }}>Credit received</div>
                   <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>$1465.00</div>
                   <div style={{ fontSize: '10px', color: 'var(--green)' }}>+8.1% vs last month</div>
                </div>
                <div style={{ border: '1px solid var(--surface3)', borderRadius: '8px', padding: '16px' }}>
                   <div style={{ fontSize: '11px', color: 'var(--ink3)' }}>Claims in progress</div>
                   <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>164</div>
                   <div style={{ fontSize: '10px', color: 'var(--ink3)' }}>-2.4% vs last month</div>
                </div>
              </div>

              <table className="shipments-table" style={{ background: '#fff' }}>
                <thead>
                  <tr>
                    <th>Tracking No.</th>
                    <th>Date updated</th>
                    <th>Carrier</th>
                    <th>Claim amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><div className="pkg-id">PC 678930576</div></td>
                    <td>01/01/2025</td>
                    <td><span style={{background:'#FEE8E8', color:'#A32D2D', padding:'3px 8px', borderRadius:'4px', fontSize:'11px', fontWeight:'600'}}>Royal Mail</span></td>
                    <td>$12.45</td>
                    <td><span style={{background:'#E6F4ED', color:'#1A7A4A', padding:'4px 10px', borderRadius:'50px', fontSize:'11px', fontWeight:'500'}}>Accepted</span></td>
                  </tr>
                  <tr>
                    <td><div className="pkg-id">PC 678930575</div></td>
                    <td>01/01/2025</td>
                    <td><span style={{background:'#FEE8E8', color:'#A32D2D', padding:'3px 8px', borderRadius:'4px', fontSize:'11px', fontWeight:'600'}}>Royal Mail</span></td>
                    <td>$8.90</td>
                    <td><span style={{background:'#E6F4ED', color:'#1A7A4A', padding:'4px 10px', borderRadius:'50px', fontSize:'11px', fontWeight:'500'}}>Accepted</span></td>
                  </tr>
                  <tr>
                    <td><div className="pkg-id">PC 678930574</div></td>
                    <td>01/01/2025</td>
                    <td><span style={{background:'#E8EEFB', color:'#1A4FA0', padding:'3px 8px', borderRadius:'4px', fontSize:'11px', fontWeight:'600'}}>FedEx</span></td>
                    <td>$45.00</td>
                    <td><span style={{background:'#FFF5E0', color:'#B86C00', padding:'4px 10px', borderRadius:'50px', fontSize:'11px', fontWeight:'500'}}>Pending</span></td>
                  </tr>
                  <tr>
                    <td><div className="pkg-id">PC 678930573</div></td>
                    <td>01/01/2025</td>
                    <td><span style={{background:'#FEE8E8', color:'#A32D2D', padding:'3px 8px', borderRadius:'4px', fontSize:'11px', fontWeight:'600'}}>DHL</span></td>
                    <td>$120.00</td>
                    <td><span style={{background:'#FFF5E0', color:'#B86C00', padding:'4px 10px', borderRadius:'50px', fontSize:'11px', fontWeight:'500'}}>Pending</span></td>
                  </tr>
                </tbody>
              </table>

            </div>
          </div>
        </div>

        <div className="inline-features">
          <div className="inline-feature"><IconCircleCheck size={18} color="#14B8A6" /> No upfront costs</div>
          <div className="inline-feature"><IconCircleCheck size={18} color="#14B8A6" /> 100% commission based</div>
          <div className="inline-feature"><IconCircleCheck size={18} color="#14B8A6" /> Zero integrations</div>
        </div>
      </section>

      {/* Feature Cards */}
      <section id="features" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px 120px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
          
          <div className="redesign-feature-card">
            <div className="icon-circle-yellow"><IconClock size={18} color="#CA8A04" /></div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>Saving Time</h3>
            <p style={{ fontSize: '14px', color: 'var(--ink2)', lineHeight: '1.6' }}>
              Courier claims are time-consuming and tedious. We take care of the entire process for you — no forms, no follow-ups, no wasted time.
            </p>
          </div>

          <div className="redesign-feature-card">
            <div className="icon-square-pink"><IconCurrencyDollar size={18} /></div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>Increase Profits</h3>
            <p style={{ fontSize: '14px', color: 'var(--ink2)', lineHeight: '1.6' }}>
              Up to 3% of parcels are lost — and that&apos;s money you shouldn&apos;t lose. We track and claim every refund, so nothing slips through the cracks.
            </p>
          </div>

          <div className="redesign-feature-card">
            <div className="icon-shield-blue"><IconShieldCheck size={28} /></div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>Never Miss a Claim</h3>
            <p style={{ fontSize: '14px', color: 'var(--ink2)', lineHeight: '1.6' }}>
              We automatically monitor your shipments and file claims the moment an issue is detected, so you never have to recover lost revenue.
            </p>
          </div>

        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: '100px 48px', background: '#F8FAFC', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>Simple, transparent pricing</h2>
        <p style={{ color: 'var(--ink2)', marginBottom: '48px', maxWidth: '500px', margin: '0 auto 48px' }}>Start recovering your lost revenue today. Only pay a percentage of the claims we successfully win for you.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px', maxWidth: '800px', margin: '0 auto' }}>
          <div className="redesign-feature-card" style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Standard</h3>
            <p style={{ color: 'var(--ink2)', marginBottom: '24px' }}>For small to medium sellers</p>
            <div style={{ fontSize: '48px', fontWeight: '800', marginBottom: '24px' }}>20% <span style={{ fontSize: '16px', color: 'var(--ink3)', fontWeight: '500' }}>/ successful claim</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', gap: '12px', display: 'flex', flexDirection: 'column' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IconCircleCheck size={18} color="#14B8A6" /> No upfront costs</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IconCircleCheck size={18} color="#14B8A6" /> Automated tracking</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IconCircleCheck size={18} color="#14B8A6" /> Email support</li>
            </ul>
            <Link href="/dashboard" className="btn-black-pill" style={{ width: '100%', justifyContent: 'center' }}>Get started</Link>
          </div>
          <div className="redesign-feature-card" style={{ textAlign: 'left', border: '2px solid #14B8A6', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', right: '24px', background: '#14B8A6', color: '#fff', fontSize: '12px', fontWeight: '600', padding: '4px 12px', borderRadius: '50px' }}>Most Popular</div>
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Enterprise</h3>
            <p style={{ color: 'var(--ink2)', marginBottom: '24px' }}>For high volume shippers</p>
            <div style={{ fontSize: '48px', fontWeight: '800', marginBottom: '24px' }}>15% <span style={{ fontSize: '16px', color: 'var(--ink3)', fontWeight: '500' }}>/ successful claim</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', gap: '12px', display: 'flex', flexDirection: 'column' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IconCircleCheck size={18} color="#14B8A6" /> Everything in Standard</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IconCircleCheck size={18} color="#14B8A6" /> Dedicated account manager</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IconCircleCheck size={18} color="#14B8A6" /> API integrations</li>
            </ul>
            <Link href="/dashboard" className="btn-black-pill" style={{ width: '100%', justifyContent: 'center' }}>Contact Sales</Link>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about-us" style={{ padding: '120px 48px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '36px', fontWeight: '700', marginBottom: '24px' }}>About Us</h2>
        <p style={{ fontSize: '18px', color: 'var(--ink2)', lineHeight: '1.8', marginBottom: '40px' }}>
          We built Parcel Payout because we saw firsthand how much money e-commerce businesses lose to carrier mistakes. The claims process is deliberately complex and time-consuming, meaning billions of dollars are left unclaimed every year. Our mission is to level the playing field by automating the entire claims process, putting money back where it belongs—in your pocket.
        </p>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" style={{ padding: '100px 48px', background: '#111827', color: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '36px', fontWeight: '700', marginBottom: '48px', textAlign: 'center' }}>Who is Parcel Payout for?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            <div style={{ padding: '32px', background: '#1F2937', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: '#14B8A6' }}>E-Commerce Brands</h3>
              <p style={{ color: '#9CA3AF', lineHeight: '1.6' }}>Protect your margins. If you ship hundreds or thousands of packages a month, a percentage will inevitably get lost or damaged. We automatically claim those losses so you don&apos;t have to.</p>
            </div>
            <div style={{ padding: '32px', background: '#1F2937', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: '#F97316' }}>3PLs & Fulfillment Centers</h3>
              <p style={{ color: '#9CA3AF', lineHeight: '1.6' }}>Offer claims resolution as a value-add service to your merchants. Connect your carrier accounts and let our platform handle the heavy lifting for all your clients.</p>
            </div>
            <div style={{ padding: '32px', background: '#1F2937', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: '#3B82F6' }}>High-Value Shippers</h3>
              <p style={{ color: '#9CA3AF', lineHeight: '1.6' }}>Shipping electronics, jewelry, or luxury goods? A single lost parcel is a significant hit. We ensure you get maximum compensation without the headache of endless carrier calls.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ textAlign: 'center', padding: '120px 48px' }}>
        <div className="hero-badge-redesign" style={{ background: '#F0FDFA', color: '#14B8A6', borderColor: '#CCFBF1' }}>
          <IconBuildingStore size={16} /> Get Started
        </div>
        <h2 style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '42px', fontWeight: '700', letterSpacing: '-1px', marginBottom: '32px' }}>
          Recover more money<br/>with Parcel Payout
        </h2>
        <Link href="/dashboard" className="btn-black-pill" style={{ padding: '12px 32px', fontSize: '16px' }}>
          Claim your lost revenue →
        </Link>
      </section>

    </div>
  );
}
