import React from 'react';
import { Link } from '../components/SimpleRouter';

export default function Home5() {
  return (
    <div style={{
      background: '#000',
      minHeight: '100vh',
      color: 'white',
      fontFamily: 'var(--font-sans)',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Pulse Background */}
      <div style={{
        position: 'absolute', width: '800px', height: '800px', 
        background: 'radial-gradient(circle, rgba(150, 221, 209, 0.15) 0%, transparent 70%)',
        animation: 'breathe 4s infinite ease-in-out'
      }}></div>
      <style>{`@keyframes breathe { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.2); opacity: 0.8; } }`}</style>

      <div style={{position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 20px'}}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', 
          borderRadius: '24px', border: '1px solid rgba(255,255,255,0.2)', marginBottom: 32,
          background: 'rgba(255,255,255,0.05)'
        }}>
          <div style={{width: 8, height: 8, background: '#ff4d4d', borderRadius: '50%', boxShadow: '0 0 10px #ff4d4d'}}></div>
          <span style={{fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase'}}>System Operational</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(48px, 6vw, 96px)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0,
          textShadow: '0 0 40px rgba(150, 221, 209, 0.3)'
        }}>
          Your AI Infrastructure<br/>
          <span style={{color: '#96ddd1'}}>Needs a Pulse.</span>
        </h1>

        <p style={{
          fontSize: '20px', color: '#888', maxWidth: '600px', margin: '32px auto', lineHeight: 1.6
        }}>
          Real-time evaluation, cost monitoring, and quality assurance for mission-critical AI applications.
        </p>

        <div style={{marginTop: 48}}>
          <form style={{display: 'flex', gap: 12, justifyContent: 'center'}}>
            <input type="email" placeholder="Enter email" style={{
              background: '#111', border: '1px solid #333', color: 'white', padding: '16px 24px', 
              borderRadius: '8px', width: '280px', fontSize: '16px',
              boxShadow: '0 0 20px rgba(0,0,0,0.5)'
            }}/>
            <button style={{
              background: '#96ddd1', color: '#000', border: 'none', padding: '16px 32px', 
              borderRadius: '8px', fontWeight: 700, fontSize: '16px', cursor: 'pointer',
              boxShadow: '0 0 20px rgba(150, 221, 209, 0.4)'
            }}>
              Start Monitoring
            </button>
          </form>
        </div>
      </div>

      <div style={{position: 'absolute', bottom: 40, display: 'flex', gap: 40, opacity: 0.5}}>
        <div style={{fontSize: 12, letterSpacing: '0.1em'}}>OPENAI</div>
        <div style={{fontSize: 12, letterSpacing: '0.1em'}}>ANTHROPIC</div>
        <div style={{fontSize: 12, letterSpacing: '0.1em'}}>MISTRAL</div>
        <div style={{fontSize: 12, letterSpacing: '0.1em'}}>LLAMA</div>
      </div>
    </div>
  );
}
