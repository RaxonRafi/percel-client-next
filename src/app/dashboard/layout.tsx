'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  IconPackage, IconLayoutDashboard, IconPackages, 
  IconTruckDelivery, IconMapRoute, IconMapPin, 
  IconUsers, IconReceipt, IconCash, IconChartBar, 
  IconSettings, IconApi, IconDotsVertical, IconSearch, 
  IconBell, IconArrowLeft 
} from '@tabler/icons-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  type NavItem = {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: number;
  };

  const navItems: NavItem[] = [
    { label: 'Overview', href: '/dashboard', icon: IconLayoutDashboard },
    { label: 'Shipments', href: '/dashboard/shipments', icon: IconPackages, badge: 12 },
    { label: 'Drivers', href: '/dashboard/drivers', icon: IconTruckDelivery },
    { label: 'Routes', href: '/dashboard/routes', icon: IconMapRoute },
    { label: 'Live Map', href: '/dashboard/map', icon: IconMapPin },
  ];

  const managementItems: NavItem[] = [
    { label: 'Customers', href: '/dashboard/customers', icon: IconUsers },
    { label: 'Invoices', href: '/dashboard/invoices', icon: IconReceipt, badge: 3 },
    { label: 'Payments', href: '/dashboard/payments', icon: IconCash },
    { label: 'Analytics', href: '/dashboard/analytics', icon: IconChartBar },
  ];

  const settingsItems: NavItem[] = [
    { label: 'Settings', href: '/dashboard/settings', icon: IconSettings },
    { label: 'API & Webhooks', href: '/dashboard/api', icon: IconApi },
  ];

  return (
    <div id="app" style={{ display: 'block' }}>
      <div className="app-layout">
        
        {/* Sidebar */}
        <aside className="sidebar">
          <Link href="/dashboard" className="sidebar-brand">
            <div className="sidebar-brand-icon"><IconPackage size={18} color="var(--white)" /></div>
            Parcel<span>Payout</span>
          </Link>
          <nav className="sidebar-nav">
            <div className="nav-section-label">Main</div>
            {navItems.map((item) => (
              <Link 
                key={item.label}
                href={item.href} 
                className={`nav-item ${pathname === item.href ? 'active' : ''}`}
              >
                <item.icon size={20} /> {item.label}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </Link>
            ))}

            <div className="nav-section-label">Management</div>
            {managementItems.map((item) => (
              <Link 
                key={item.label}
                href={item.href} 
                className={`nav-item ${pathname === item.href ? 'active' : ''}`}
              >
                <item.icon size={20} /> {item.label}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </Link>
            ))}

            <div className="nav-section-label">Settings</div>
            {settingsItems.map((item) => (
              <Link 
                key={item.label}
                href={item.href} 
                className={`nav-item ${pathname === item.href ? 'active' : ''}`}
              >
                <item.icon size={20} /> {item.label}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </Link>
            ))}
          </nav>
          
          <div className="sidebar-footer">
            <div className="sidebar-user">
              <div className="user-avatar">MR</div>
              <div>
                <div className="user-name">Muhammad Rafi</div>
                <div className="user-role">Admin · Chittagong</div>
              </div>
              <IconDotsVertical size={16} style={{ color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }} />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="main-content">
          <div className="topbar">
            <div>
              <div className="topbar-title">Overview</div>
              <div style={{ fontSize: '12px', color: 'var(--ink3)', marginTop: '1px' }}>Friday, May 22, 2024</div>
            </div>
            <div className="topbar-right">
              <div className="search-box">
                <IconSearch size={18} /> Search packages, drivers...
              </div>
              <div className="topbar-icon-btn notif-dot">
                <IconBell size={18} />
              </div>
              <div className="topbar-icon-btn">
                <IconSettings size={18} />
              </div>
              <Link href="/" className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                <IconArrowLeft size={16} /> Back to site
              </Link>
            </div>
          </div>

          <div className="dash-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
