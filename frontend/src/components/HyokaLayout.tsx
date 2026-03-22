import React from 'react';
import { Link } from '../components/SimpleRouter';
import '../styles/hyoka.css';

export const HyokaLayout = ({ children, title }: { children: React.ReactNode; title: string }) => {
  const path = window.location.pathname;
  
  return (
    <div className="hyoka-layout">
      <nav className="hyoka-sidebar">
        <div className="hyoka-logo">
          <div className="hyoka-logo-icon">H</div>
          Hyoka
        </div>
        <div className="hyoka-nav">
          <Link href="/" className={`hyoka-nav-item ${path === '/' ? 'active' : ''}`}>Legacy Home</Link>
          <Link href="/1" className={`hyoka-nav-item ${path === '/1' ? 'active' : ''}`}>Overview</Link>
          <Link href="/2" className={`hyoka-nav-item ${path === '/2' ? 'active' : ''}`}>Experiments</Link>
          <Link href="/3" className={`hyoka-nav-item ${path === '/3' ? 'active' : ''}`}>Comparison</Link>
          <Link href="/4" className={`hyoka-nav-item ${path === '/4' ? 'active' : ''}`}>Data Grid</Link>
          <Link href="/5" className={`hyoka-nav-item ${path === '/5' ? 'active' : ''}`}>Live Pulse</Link>
          <Link href="/6" className={`hyoka-nav-item ${path === '/6' ? 'active' : ''}`}>UI Kit</Link>
          <Link href="/7" className={`hyoka-nav-item ${path === '/7' ? 'active' : ''}`}>Insights Clone</Link>
        </div>
      </nav>
      <main className="hyoka-main animate-enter">
        <header className="hyoka-header">
          <h1 className="hyoka-title">{title}</h1>
          <div style={{display: 'flex', gap: '16px'}}>
            <div className="hyoka-card" style={{padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px'}}>
              <div className="pulse-indicator" style={{width: 8, height: 8}}/>
              <span style={{fontSize: 14, fontWeight: 500}}>System Online</span>
            </div>
            <button className="hyoka-button">New Experiment</button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};
