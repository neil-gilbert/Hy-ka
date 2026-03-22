import React from 'react';
import { Link } from '../components/SimpleRouter';

export default function HomeVariation4() {
  // Variation of Home5: "Minimal Focus" - Single glowing orb
  return (
    <div style={{
      background: '#0a0a0a',
      minHeight: '100vh',
      color: 'white',
      fontFamily: 'var(--font-sans)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      <div style={{
        width: '200px', height: '200px', borderRadius: '50%',
        background: 'radial-gradient(circle, #ff4d4d 0%, transparent 70%)',
        filter: 'blur(40px)',
        animation: 'pulse 3s infinite ease-in-out'
      }}></div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.1); } }`}</style>

      <div style={{position: 'absolute', textAlign: 'center', zIndex: 2}}>
         <h1 style={{fontSize: '64px', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 16}}>Focus on Quality.</h1>
         <p style={{fontSize: '20px', color: '#666', marginBottom: 40}}>The AI evaluation platform for perfectionists.</p>
         <button style={{
           background: 'rgba(255, 77, 77, 0.1)', 
           color: '#ff4d4d', 
           border: '1px solid #ff4d4d', 
           padding: '12px 32px', 
           borderRadius: '24px', 
           cursor: 'pointer',
           fontSize: '16px',
           transition: 'all 0.2s'
         }}>Request Access</button>
      </div>
    </div>
  );
}