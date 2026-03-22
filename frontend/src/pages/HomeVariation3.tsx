import React from 'react';
import { Link } from '../components/SimpleRouter';

export default function HomeVariation3() {
  // Variation of Home1: "Split Bold" - Orange/Navy Split
  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: 'var(--font-sans)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr'
    }}>
      {/* Left: Navy */}
      <div style={{background: 'var(--hyoka-navy)', color: 'white', padding: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
         <h1 style={{fontSize: '80px', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.04em', marginBottom: 40}}>
           MODEL<br/>EVALUATION<br/>SOLVED.
         </h1>
         <div style={{width: '100px', height: '8px', background: 'var(--hyoka-orange)', marginBottom: 40}}></div>
      </div>

      {/* Right: Orange */}
      <div style={{background: 'var(--hyoka-orange)', color: 'var(--hyoka-navy)', padding: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
         <p style={{fontSize: '32px', fontWeight: 700, lineHeight: 1.3, marginBottom: 40}}>
           "The most important infrastructure piece we didn't know we needed."
         </p>
         <div style={{display: 'flex', gap: 16, flexDirection: 'column'}}>
           <p style={{fontSize: '18px', fontWeight: 500}}>Join the waiting list for early access.</p>
           <div style={{display: 'flex', background: 'var(--hyoka-navy)', padding: 8, borderRadius: 8}}>
             <input type="text" placeholder="name@company.com" style={{
               background: 'transparent', border: 'none', color: 'white', padding: '16px', flex: 1, outline: 'none', fontSize: 16
             }}/>
             <button style={{
               background: 'white', color: 'var(--hyoka-navy)', border: 'none', padding: '16px 32px', borderRadius: 4, fontWeight: 700, cursor: 'pointer'
             }}>JOIN</button>
           </div>
         </div>
      </div>
    </div>
  );
}