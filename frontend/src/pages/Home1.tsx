import React from 'react';
import { Link } from '../components/SimpleRouter';

export default function Home1() {
  return (
    <div style={{
      background: 'var(--hyoka-navy)',
      minHeight: '100vh',
      color: 'var(--hyoka-text)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-sans)'
    }}>
      <nav style={{padding: '40px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', display: 'flex', gap: 12, alignItems: 'center'}}>
           <div style={{width: 32, height: 32, background: 'var(--hyoka-orange)', borderRadius: 8}}></div>
           Hyoka
        </div>
        <div style={{display: 'flex', gap: 32}}>
          <Link href="/login" className="hyoka-nav-item">Sign In</Link>
          <button className="hyoka-button">Join Waitlist</button>
        </div>
      </nav>

      <main style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 60px', position: 'relative', overflow: 'hidden'}}>
        <div style={{
          position: 'absolute', top: '10%', right: '-10%', width: '600px', height: '600px', 
          background: 'radial-gradient(circle, var(--hyoka-navy-light) 0%, transparent 70%)', 
          opacity: 0.5, borderRadius: '50%', zIndex: 0
        }}></div>

        <div style={{zIndex: 1, maxWidth: '1200px'}}>
          <h1 style={{
            fontSize: 'clamp(64px, 8vw, 120px)', 
            fontWeight: 900, 
            lineHeight: 0.9, 
            margin: '0 0 40px 0',
            letterSpacing: '-0.04em'
          }}>
            <span style={{color: 'var(--hyoka-text-muted)', display: 'block'}}>STOP</span>
            <span style={{color: 'var(--hyoka-orange)', display: 'block'}}>GUESSING.</span>
          </h1>
          
          <p style={{
            fontSize: '24px', 
            color: 'var(--hyoka-text-muted)', 
            maxWidth: '600px', 
            lineHeight: 1.5,
            marginBottom: '60px'
          }}>
            Engineering teams are flying blind. Hyoka provides the rigorous, objective evaluation platform you need to compare AI models, measure quality, and control costs.
          </p>

          <div style={{display: 'flex', gap: 16}}>
            <input type="email" placeholder="Enter your work email" style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '16px 24px',
              borderRadius: '12px',
              color: 'white',
              width: '300px',
              fontSize: '16px'
            }}/>
            <button className="hyoka-button" style={{padding: '16px 32px', fontSize: '16px'}}>Get Early Access</button>
          </div>
        </div>
      </main>

      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.05)', 
        padding: '60px', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 40
      }}>
        <div>
          <h3 style={{color: 'var(--hyoka-teal)', marginBottom: 16}}>Objective Scores</h3>
          <p style={{color: 'var(--hyoka-text-muted)', fontSize: 14}}>Standardized metrics for every model run. Compare apples to apples.</p>
        </div>
        <div>
          <h3 style={{color: 'var(--hyoka-blue)', marginBottom: 16}}>Reproducible</h3>
          <p style={{color: 'var(--hyoka-text-muted)', fontSize: 14}}> deterministic execution environments. Never lose context again.</p>
        </div>
        <div>
          <h3 style={{color: 'var(--hyoka-orange)', marginBottom: 16}}>Cost Control</h3>
          <p style={{color: 'var(--hyoka-text-muted)', fontSize: 14}}>Real-time budget tracking and token usage analytics.</p>
        </div>
        <div>
          <h3 style={{color: 'white', marginBottom: 16}}>Provider Agnostic</h3>
          <p style={{color: 'var(--hyoka-text-muted)', fontSize: 14}}>Switch between OpenAI, Anthropic, and open source with one config.</p>
        </div>
      </div>
    </div>
  );
}
