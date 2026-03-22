import React from 'react';
import '../styles/insights-dashboard.css';

function ChevronRightIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={style}>
      <path d="m9.5 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{width: 20, height: 20}}>
      <path d="M7 10a5 5 0 0 1 10 0v4l2 2H5l2-2v-4Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10.5 18a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{width: 20, height: 20}}>
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function UiKit() {
  return (
    <div className="insights-dashboard" style={{minHeight: '100vh', padding: '32px'}}>
      
      <div className="insights-header-left" style={{marginBottom: 40}}>
        <h1 style={{fontSize: 48}}>Insights UI Kit</h1>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: 48, maxWidth: 1200}}>
        
        {/* Colors Section */}
        <section>
          <div className="insights-section-heading">
            <h3 style={{fontSize: 24, paddingBottom: 16, borderBottom: '1px solid var(--ins-border)', width: '100%', marginBottom: 24}}>Colors & Design Tokens</h3>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 24}}>
            {[
              { name: 'Background', var: 'var(--ins-bg)' },
              { name: 'Panel', var: 'var(--ins-panel)' },
              { name: 'Text', var: 'var(--ins-text)' },
              { name: 'Muted', var: 'var(--ins-muted)' },
              { name: 'Blue', var: 'var(--ins-blue)' },
              { name: 'Sky', var: 'var(--ins-sky)' },
              { name: 'Salmon', var: 'var(--ins-salmon)' },
              { name: 'Green', var: 'var(--ins-green)' },
              { name: 'Red', var: 'var(--ins-red)' },
              { name: 'Line', var: 'var(--ins-line)' },
            ].map((c) => (
              <div key={c.name} style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                <div style={{height: 64, borderRadius: 12, background: c.var, border: '1px solid var(--ins-border)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'}} />
                <div>
                  <div style={{fontSize: 14, fontWeight: 600, color: 'var(--ins-text)'}}>{c.name}</div>
                  <div style={{fontSize: 12, color: 'var(--ins-muted)', fontFamily: 'monospace'}}>{c.var}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography Section */}
        <section>
          <div className="insights-section-heading">
            <h3 style={{fontSize: 24, paddingBottom: 16, borderBottom: '1px solid var(--ins-border)', width: '100%', marginBottom: 24}}>Typography</h3>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
            <div className="insights-card" style={{padding: 24}}>
              <div className="insights-hero-copy" style={{maxWidth: '100%'}}>
                <h2>Hero Headline (56px)</h2>
              </div>
            </div>
            <div className="insights-card" style={{padding: 24}}>
              <div className="insights-header-left">
                <h1>Page Title (32px Bold)</h1>
              </div>
            </div>
            <div className="insights-card" style={{padding: 24}}>
              <div className="insights-section-heading" style={{margin: 0}}>
                <h3>Card Heading (20px)</h3>
              </div>
            </div>
            <div className="insights-card" style={{padding: 24}}>
              <div className="insights-row-project">
                <strong>List Item Strong (18px)</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Elements */}
        <section>
          <div className="insights-section-heading">
            <h3 style={{fontSize: 24, paddingBottom: 16, borderBottom: '1px solid var(--ins-border)', width: '100%', marginBottom: 24}}>Interactive & Form Elements</h3>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24}}>
            
            <div className="insights-card" style={{padding: 24}}>
              <div className="insights-section-heading">
                <h3>Primary Buttons</h3>
              </div>
              <div style={{display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap'}}>
                <button type="button" className="insights-hero-cta">
                  View earning
                  <ChevronRightIcon />
                </button>
                <div style={{background: 'var(--ins-bg)', padding: 12, borderRadius: 12}}>
                  <button type="button" className="insights-hero-cta">
                    Submit action
                  </button>
                </div>
              </div>
            </div>

            <div className="insights-card" style={{padding: 24}}>
              <div className="insights-section-heading">
                <h3>Ghost & Icon Buttons</h3>
              </div>
              <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
                <button type="button" className="insights-header-icon" style={{background: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 12}}>
                  <BellIcon />
                </button>
                <button type="button" className="insights-header-icon" style={{background: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 12}}>
                  <SearchIcon />
                </button>
                <button type="button" className="insights-header-ghost" style={{padding: 12}}>
                  <ChevronRightIcon style={{width: 20, height: 20}} />
                </button>
              </div>
            </div>

            <div className="insights-card" style={{padding: 24}}>
              <div className="insights-section-heading">
                <h3>Toggle Timeframes</h3>
              </div>
              <div className="insights-timeframes">
                  {['1D', '1W', '1M', '1Y', 'All time'].map((frame, index) => (
                    <button key={frame} type="button" className={index === 1 ? 'is-selected' : ''}>
                      {frame}
                    </button>
                  ))}
              </div>
            </div>
            
          </div>
        </section>

        {/* Status & Metrics */}
        <section>
          <div className="insights-section-heading">
            <h3 style={{fontSize: 24, paddingBottom: 16, borderBottom: '1px solid var(--ins-border)', width: '100%', marginBottom: 24}}>Metrics & Stats</h3>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24}}>
            
            {/* Stat block */}
            <div className="insights-card" style={{padding: 0, overflow: 'hidden'}}>
               <div className="insights-hero-metrics" style={{gridTemplateColumns: '1fr 1fr', borderRadius: 0, border: 'none', margin: 0}}>
                <div>
                  <p>Active user</p>
                  <div className="metric-group">
                    <strong>16k</strong>
                    <span className="insights-delta">▲ 32%</span>
                  </div>
                </div>
                <div>
                  <p>Cancelled</p>
                  <div className="metric-group">
                    <strong>80</strong>
                    <span className="insights-delta is-down">▼ 12%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress track */}
            <div className="insights-card" style={{padding: 24}}>
               <div className="insights-section-heading">
                <h3>Storage Usage Widget</h3>
               </div>
               <div className="insights-storage-cell">
                  <div className="insights-storage-track" style={{flex: 1}}>
                    <div className="insights-storage-fill" style={{ width: `65%` }} />
                  </div>
                  <span>
                    128<span>/512 Gb</span>
                  </span>
                </div>
            </div>

            {/* List Item */}
            <div className="insights-card" style={{padding: 24}}>
              <div className="insights-section-heading">
                <h3>Entity Row</h3>
              </div>
               <div className="insights-row-project">
                  <div className={`insights-row-avatar blue`}>
                    <div className="eye" />
                    <div className="eye" />
                  </div>
                  <div>
                    <strong>EchoBot</strong>
                    <span>GPT4-based</span>
                  </div>
                </div>
            </div>

          </div>
        </section>

        {/* Data Visualization */}
        <section>
          <div className="insights-section-heading">
            <h3 style={{fontSize: 24, paddingBottom: 16, borderBottom: '1px solid var(--ins-border)', width: '100%', marginBottom: 24}}>Data Visualization Components</h3>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24}}>
            
            {/* Donut Chart Component */}
            <div className="insights-card insights-audiences-card">
              <h3>Audiences Component</h3>
              <div className="insights-audience-main" style={{marginTop: 32}}>
                <div className="insights-donut" aria-hidden="true" style={{width: 140, height: 140}}>
                  <div className="insights-donut-hole" style={{width: 50, height: 50}} />
                </div>
                <div className="insights-audience-details">
                  <strong style={{fontSize: 56}}>68%</strong>
                  <ul>
                    <li><span className="dot dot-blue" />New <em>▲ 8%</em></li>
                    <li><span className="dot dot-sky" />Subscribed <em>▲ 2%</em></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bar Chart Component */}
            <div className="insights-card insights-membership-card" style={{minHeight: 280}}>
              <div className="insights-section-heading">
                <h3>Traffic Bars</h3>
                <span>1000</span>
              </div>
              <div className="insights-membership-bars" aria-hidden="true">
                <div className="insights-membership-gridline" style={{bottom: '40px'}} />
                {[
                  { label: 'Mon', value: 45, tone: 'sky' },
                  { label: 'Tue', value: 65, tone: 'blue' },
                  { label: 'Wed', value: 90, tone: 'sky' },
                  { label: 'Thu', value: 55, tone: 'blue' },
                  { label: 'Fri', value: 80, tone: 'sky' },
                ].map((bar) => (
                  <div key={bar.label} className="insights-membership-bar">
                    <div className={`insights-membership-column ${bar.tone}`} style={{ height: `${bar.value}%` }} />
                    <small>{bar.label}</small>
                  </div>
                ))}
                <small className="insights-membership-zero" style={{right: -16}}>0</small>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
