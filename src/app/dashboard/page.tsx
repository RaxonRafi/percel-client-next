import React from 'react';
import Link from 'next/link';
import { 
  IconPackages, IconCheck, IconClock, IconCurrencyTaka, 
  IconDots, IconTruckDelivery, IconPackage, IconAlertCircle, 
  IconCash, IconUserPlus
} from '@tabler/icons-react';

export default function DashboardPage() {
  return (
    <>
      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon mc-orange"><IconPackages size={22} color="var(--accent)" /></div>
            <div className="kpi-change up">↑ 12%</div>
          </div>
          <div className="kpi-val">2,847</div>
          <div className="kpi-lbl">Total shipments today</div>
          <svg className="kpi-sparkline" viewBox="0 0 100 40" preserveAspectRatio="none">
            <polyline points="0,30 15,22 30,28 45,15 60,18 75,10 90,14 100,8" fill="none" stroke="var(--accent)" strokeWidth="2.5" />
          </svg>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon mc-green"><IconCheck size={22} color="var(--green)" /></div>
            <div className="kpi-change up">↑ 3%</div>
          </div>
          <div className="kpi-val">98.2%</div>
          <div className="kpi-lbl">Delivery success rate</div>
          <svg className="kpi-sparkline" viewBox="0 0 100 40" preserveAspectRatio="none">
            <polyline points="0,25 15,20 30,22 45,18 60,15 75,12 90,10 100,9" fill="none" stroke="var(--green)" strokeWidth="2.5" />
          </svg>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon mc-blue"><IconClock size={22} color="var(--blue)" /></div>
            <div className="kpi-change up">↑ 8%</div>
          </div>
          <div className="kpi-val">42 min</div>
          <div className="kpi-lbl">Avg. delivery time</div>
          <svg className="kpi-sparkline" viewBox="0 0 100 40" preserveAspectRatio="none">
            <polyline points="0,35 15,28 30,32 45,22 60,25 75,18 90,20 100,15" fill="none" stroke="var(--blue)" strokeWidth="2.5" />
          </svg>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon mc-amber"><IconCurrencyTaka size={22} color="var(--amber)" /></div>
            <div className="kpi-change up">↑ 19%</div>
          </div>
          <div className="kpi-val">৳ 1.84M</div>
          <div className="kpi-lbl">Revenue this month</div>
          <svg className="kpi-sparkline" viewBox="0 0 100 40" preserveAspectRatio="none">
            <polyline points="0,32 15,26 30,20 45,22 60,14 75,10 90,8 100,5" fill="none" stroke="var(--amber)" strokeWidth="2.5" />
          </svg>
        </div>
      </div>

      {/* Chart row */}
      <div className="chart-row">
        <div className="sp-card">
          <div className="card-header">
            <div className="card-title">Shipment volume</div>
            <div className="card-actions">
              <button className="pill-btn active">Week</button>
              <button className="pill-btn">Month</button>
              <button className="pill-btn">Year</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--ink2)' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--accent)' }}></div>Delivered
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--ink2)' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--surface2)' }}></div>Pending
            </div>
          </div>
          <div className="bar-chart">
            <div className="bar-col"><div className="bar-wrap"><div className="bar" style={{ height: '62%', background: 'var(--accent)' }}></div></div><div className="bar-lbl">Mon</div></div>
            <div className="bar-col"><div className="bar-wrap"><div className="bar" style={{ height: '81%', background: 'var(--accent)' }}></div></div><div className="bar-lbl">Tue</div></div>
            <div className="bar-col"><div className="bar-wrap"><div className="bar" style={{ height: '55%', background: 'var(--accent)' }}></div></div><div className="bar-lbl">Wed</div></div>
            <div className="bar-col"><div className="bar-wrap"><div className="bar" style={{ height: '94%', background: 'var(--accent)' }}></div></div><div className="bar-lbl">Thu</div></div>
            <div className="bar-col"><div className="bar-wrap"><div className="bar" style={{ height: '70%', background: 'var(--accent)' }}></div></div><div className="bar-lbl">Fri</div></div>
            <div className="bar-col"><div className="bar-wrap"><div className="bar" style={{ height: '40%', background: 'var(--surface2)' }}></div></div><div className="bar-lbl">Sat</div></div>
            <div className="bar-col"><div className="bar-wrap"><div className="bar" style={{ height: '28%', background: 'var(--surface2)' }}></div></div><div className="bar-lbl">Sun</div></div>
          </div>
        </div>

        <div className="sp-card">
          <div className="card-header">
            <div className="card-title">Status breakdown</div>
          </div>
          <div className="donut-wrap">
            <svg className="donut" viewBox="0 0 100 100">
              <circle className="donut-track" cx="50" cy="50" r="38" />
              <circle className="donut-seg" cx="50" cy="50" r="38" stroke="#E84C1E" strokeDasharray="148 240" strokeDashoffset="0" />
              <circle className="donut-seg" cx="50" cy="50" r="38" stroke="#1A7A4A" strokeDasharray="57 240" strokeDashoffset="-148" />
              <circle className="donut-seg" cx="50" cy="50" r="38" stroke="#B86C00" strokeDasharray="24 240" strokeDashoffset="-205" />
              <circle className="donut-seg" cx="50" cy="50" r="38" stroke="#A32D2D" strokeDasharray="11 240" strokeDashoffset="-229" />
            </svg>
            <div className="donut-legend">
              <div className="legend-row"><div className="legend-dot" style={{ background: 'var(--accent)' }}></div><div className="legend-lbl">In Transit</div><div className="legend-val">61.7%</div></div>
              <div className="legend-row"><div className="legend-dot" style={{ background: 'var(--green)' }}></div><div className="legend-lbl">Delivered</div><div className="legend-val">23.8%</div></div>
              <div className="legend-row"><div className="legend-dot" style={{ background: 'var(--amber)' }}></div><div className="legend-lbl">Pending</div><div className="legend-val">10.0%</div></div>
              <div className="legend-row"><div className="legend-dot" style={{ background: '#A32D2D' }}></div><div className="legend-lbl">Failed</div><div className="legend-val">4.5%</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Map + Activity */}
      <div className="table-row">
        <div>
          {/* Shipments table */}
          <div className="sp-card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <div className="card-title">Recent shipments</div>
              <Link href="#" className="view-all-link">View all →</Link>
            </div>
            <table className="shipments-table">
              <thead>
                <tr>
                  <th>Package</th>
                  <th>Recipient</th>
                  <th>Status</th>
                  <th>ETA</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><div className="pkg-id">#SWP-98741</div><div className="pkg-route">Dhaka → Ctg</div></td>
                  <td>Rahim A.</td>
                  <td><span className="status-pill s-transit">In Transit</span></td>
                  <td>3:00 PM</td>
                  <td><IconDots size={16} style={{ color: 'var(--ink3)', cursor: 'pointer' }} /></td>
                </tr>
                <tr>
                  <td><div className="pkg-id">#SWP-98640</div><div className="pkg-route">Sylhet → Ctg</div></td>
                  <td>Nadia K.</td>
                  <td><span className="status-pill s-delivered">Delivered</span></td>
                  <td>11:45 AM</td>
                  <td><IconDots size={16} style={{ color: 'var(--ink3)', cursor: 'pointer' }} /></td>
                </tr>
                <tr>
                  <td><div className="pkg-id">#SWP-98612</div><div className="pkg-route">Ctg → Comilla</div></td>
                  <td>Taslima B.</td>
                  <td><span className="status-pill s-pending">Pending</span></td>
                  <td>5:30 PM</td>
                  <td><IconDots size={16} style={{ color: 'var(--ink3)', cursor: 'pointer' }} /></td>
                </tr>
                <tr>
                  <td><div className="pkg-id">#SWP-98588</div><div className="pkg-route">Dhaka → Sylhet</div></td>
                  <td>Karim R.</td>
                  <td><span className="status-pill s-delivered">Delivered</span></td>
                  <td>10:00 AM</td>
                  <td><IconDots size={16} style={{ color: 'var(--ink3)', cursor: 'pointer' }} /></td>
                </tr>
                <tr>
                  <td><div className="pkg-id">#SWP-98520</div><div className="pkg-route">Ctg → Dhaka</div></td>
                  <td>Farhan H.</td>
                  <td><span className="status-pill s-failed">Failed</span></td>
                  <td>—</td>
                  <td><IconDots size={16} style={{ color: 'var(--ink3)', cursor: 'pointer' }} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity feed */}
        <div className="sp-card">
          <div className="card-header">
            <div className="card-title">Live activity</div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', animation: 'pulse 2s infinite' }}></div>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon mc-green"><IconCheck size={16} color="var(--green)" /></div>
              <div>
                <div className="activity-text"><strong>#SWP-98640</strong> delivered successfully to Nadia K.</div>
                <div className="activity-time">Just now</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon mc-orange"><IconTruckDelivery size={16} color="var(--accent)" /></div>
              <div>
                <div className="activity-text">Driver <strong>Karim R.</strong> started route to GEC Circle</div>
                <div className="activity-time">4 min ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon mc-blue"><IconPackage size={16} color="var(--blue)" /></div>
              <div>
                <div className="activity-text"><strong>14 new packages</strong> scanned at Agrabad Hub</div>
                <div className="activity-time">11 min ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon" style={{ background: '#FEE8E8' }}><IconAlertCircle size={16} color="#A32D2D" /></div>
              <div>
                <div className="activity-text"><strong>#SWP-98520</strong> failed — recipient unreachable</div>
                <div className="activity-time">28 min ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon mc-amber"><IconCash size={16} color="var(--amber)" /></div>
              <div>
                <div className="activity-text">COD collected <strong>৳ 4,200</strong> from Halishahar zone</div>
                <div className="activity-time">42 min ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon mc-green"><IconUserPlus size={16} color="var(--green)" /></div>
              <div>
                <div className="activity-text">New merchant <strong>Ahsan Traders</strong> onboarded</div>
                <div className="activity-time">1 hr ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Driver performance strip */}
      <div className="sp-card">
        <div className="card-header">
          <div className="card-title">Top drivers today</div>
          <Link href="#" className="view-all-link">Manage drivers →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '16px' }}>
          <div style={{ textAlign: 'center', padding: '16px 8px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '15px', margin: '0 auto 10px' }}>KR</div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>Karim R.</div>
            <div style={{ fontSize: '11px', color: 'var(--ink3)', margin: '2px 0' }}>48 deliveries</div>
            <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: '500' }}>99% ✓</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px 8px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '15px', margin: '0 auto 10px' }}>RA</div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>Rafiq A.</div>
            <div style={{ fontSize: '11px', color: 'var(--ink3)', margin: '2px 0' }}>44 deliveries</div>
            <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: '500' }}>98% ✓</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px 8px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '15px', margin: '0 auto 10px' }}>MH</div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>Mizan H.</div>
            <div style={{ fontSize: '11px', color: 'var(--ink3)', margin: '2px 0' }}>39 deliveries</div>
            <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: '500' }}>97% ✓</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px 8px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--amber)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '15px', margin: '0 auto 10px' }}>SB</div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>Shafiq B.</div>
            <div style={{ fontSize: '11px', color: 'var(--ink3)', margin: '2px 0' }}>37 deliveries</div>
            <div style={{ fontSize: '12px', color: 'var(--amber)', fontWeight: '500' }}>95% ✓</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px 8px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#7C3AED', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '15px', margin: '0 auto 10px' }}>JI</div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>Jalal I.</div>
            <div style={{ fontSize: '11px', color: 'var(--ink3)', margin: '2px 0' }}>35 deliveries</div>
            <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: '500' }}>96% ✓</div>
          </div>
        </div>
      </div>
    </>
  );
}
