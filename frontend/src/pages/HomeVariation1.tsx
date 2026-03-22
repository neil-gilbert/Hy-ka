import React from 'react';
import { Link } from '../components/SimpleRouter';

export default function HomeVariation1() {
  // Variation of Home1: Inverted "Bold Statement" (White/Navy)
  return (
    <div style={{
      background: '#ffffff',
      minHeight: '100vh',
      color: 'var(--hyoka-navy)',
      fontFamily: 'var(--font-sans)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <nav style={{padding: '40px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', display: 'flex', gap: 12, alignItems: 'center'}}>
           <div style={{width: 32, height: 32, background: 'var(--hyoka-navy)', borderRadius: 8}}></div>
           Hyoka
        </div>
        <div style={{display: 'flex', gap: 32, alignItems: 'center'}}>
          <Link href="/login" style={{color: 'var(--hyoka-navy)', textDecoration: 'none', fontWeight: 600}}>Sign In</Link>
          <button style={{
            background: 'var(--hyoka-navy)', 
            color: 'white', 
            border: 'none', 
            padding: '12px 24px', 
            borderRadius: '8px', 
            fontWeight: 700, 
            cursor: 'pointer'
          }}>Join Waitlist</button>
        </div>
      </nav>

      <main style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 60px'}}>
        <div style={{maxWidth: '1400px'}}>
          <h1 style={{
            fontSize: 'clamp(80px, 12vw, 180px)', 
            fontWeight: 900, 
            lineHeight: 0.85, 
            margin: '0 0 40px 0',
            letterSpacing: '-0.05em',
            color: 'var(--hyoka-navy)'
          }}>
            DATA<br/>
            DRIVEN<br/>
            <span style={{color: 'var(--hyoka-orange)'}}>TRUTH.</span>
          </h1>
          
          <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 40}}>
            <p style={{
              fontSize: '24px', 
              color: '#666', 
              maxWidth: '500px', 
              lineHeight: 1.4,
              fontWeight: 500
            }}>
              Stop relying on "vibes". Use Hyoka to mathematically prove your AI model's performance and cost-efficiency.
            </p>

            <div style={{display: 'flex', gap: 16, width: '100%', maxWidth: '500px'}}>
               <input type="email" placeholder="Email Address" style={{
                 flex: 1, border: '2px solid var(--hyoka-navy)', padding: '20px', fontSize: '18px', borderRadius: 0, outline: 'none'
               }}/>
               <button style={{
                 background: 'var(--hyoka-orange)', color: 'white', border: 'none', padding: '0 40px', fontSize: '18px', fontWeight: 700, cursor: 'pointer'
               }}>→</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}