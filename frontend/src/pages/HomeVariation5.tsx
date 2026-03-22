import React, { useState, useEffect } from 'react';
import { Link } from '../components/SimpleRouter';

export default function HomeVariation5() {
  // Variation of Home5: "The Terminal" - Typing effect
  const [text, setText] = useState('');
  const fullText = "Initializing Hyoka Protocol... Connecting to Model Registry... Verifying Integrity... Done.";
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      background: '#0d1117',
      minHeight: '100vh',
      color: '#58a6ff',
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      padding: '60px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <nav style={{display: 'flex', justifyContent: 'space-between', marginBottom: 80, borderBottom: '1px solid #30363d', paddingBottom: 20}}>
        <div>~/hyoka/v1</div>
        <div>status: online</div>
      </nav>

      <main style={{flex: 1}}>
        <div style={{fontSize: '14px', color: '#8b949e', marginBottom: 20}}>$ start-eval --all</div>
        <div style={{fontSize: '32px', marginBottom: 40, minHeight: '80px', color: '#e6edf3'}}>
          {text}<span style={{animation: 'blink 1s step-end infinite'}}>_</span>
        </div>
        <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>

        <div style={{
          border: '1px solid #30363d', 
          background: '#161b22', 
          padding: '40px', 
          borderRadius: '6px',
          maxWidth: '600px'
        }}>
          <h2 style={{color: '#e6edf3', fontSize: '20px', marginTop: 0}}>Deploy Evaluation Pipeline</h2>
          <p style={{color: '#8b949e', lineHeight: 1.5}}>
            Hyoka integrates directly into your CI/CD pipeline to ensure no regression slips through.
          </p>
          <div style={{display: 'flex', marginTop: 20, gap: 10}}>
             <button style={{background: '#238636', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600}}>
               Install CLI
             </button>
             <button style={{background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer'}}>
               Read Docs
             </button>
          </div>
        </div>
      </main>
    </div>
  );
}