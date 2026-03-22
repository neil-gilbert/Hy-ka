import React from 'react';
import { Link } from '../components/SimpleRouter';

export default function HomeVariation2() {
  // Variation of Home5: "The Neon Grid" - Perspective Grid Animation
  return (
    <div style={{
      background: '#050505',
      minHeight: '100vh',
      color: 'white',
      fontFamily: 'var(--font-sans)',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      perspective: '1000px'
    }}>
       {/* Grid Floor */}
       <div style={{
         position: 'absolute', bottom: '-50%', left: '-50%', right: '-50%', height: '100%',
         background: 'linear-gradient(transparent 0%, rgba(150, 221, 209, 0.2) 100%)',
         transform: 'rotateX(60deg)',
         backgroundSize: '100px 100px',
         backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(150, 221, 209, .3) 25%, rgba(150, 221, 209, .3) 26%, transparent 27%, transparent 74%, rgba(150, 221, 209, .3) 75%, rgba(150, 221, 209, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(150, 221, 209, .3) 25%, rgba(150, 221, 209, .3) 26%, transparent 27%, transparent 74%, rgba(150, 221, 209, .3) 75%, rgba(150, 221, 209, .3) 76%, transparent 77%, transparent)',
         animation: 'gridMove 20s linear infinite'
       }}></div>
       <style>{`@keyframes gridMove { 0% { transform: rotateX(60deg) translateY(0); } 100% { transform: rotateX(60deg) translateY(100px); } }`}</style>

       <nav style={{padding: '40px', display: 'flex', justifyContent: 'space-between', zIndex: 10}}>
         <div style={{fontWeight: 700, letterSpacing: '0.1em'}}>HYOKA_OS</div>
         <div style={{fontSize: 12, opacity: 0.7}}>V.1.0.4</div>
       </nav>

       <main style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, textAlign: 'center'}}>
          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 80px)', 
            fontWeight: 300, 
            letterSpacing: '-0.02em', 
            marginBottom: 24,
            textShadow: '0 0 20px rgba(255,255,255,0.5)'
          }}>
            Evaluate at the <span style={{fontWeight: 800, color: '#96ddd1'}}>Speed of Light.</span>
          </h1>
          <p style={{maxWidth: '600px', lineHeight: 1.6, color: '#aaa', marginBottom: 48}}>
            High-velocity model evaluation infrastructure for the next generation of AI products.
          </p>
          
          <button style={{
            background: 'transparent',
            border: '1px solid #96ddd1',
            color: '#96ddd1',
            padding: '16px 48px',
            fontSize: '14px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 0 20px rgba(150, 221, 209, 0.2)'
          }}>
            Initialize System
          </button>
       </main>
    </div>
  );
}