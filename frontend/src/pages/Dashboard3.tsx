import React, { useEffect, useState } from 'react';
import { HyokaLayout } from '../components/HyokaLayout';

export default function Dashboard3() {
  // Mock data for visual design since we need specific run data
  const data = [
    { name: 'GPT-4o', score: 92, cost: 0.04, speed: 450 },
    { name: 'Claude 3.5 Haiku', score: 88, cost: 0.01, speed: 120 },
    { name: 'Llama 3 70B', score: 76, cost: 0.005, speed: 800 },
    { name: 'Gemini Pro', score: 85, cost: 0.02, speed: 300 },
  ];

  const maxScore = 100;
  const maxCost = 0.05;

  return (
    <HyokaLayout title="Model Comparison">
      <div className="hyoka-grid grid-2 animate-enter">
        <div className="hyoka-card" style={{gridColumn: 'span 2'}}>
          <h3 style={{marginBottom: 32}}>Quality vs Cost Efficiency</h3>
          <div style={{display: 'flex', alignItems: 'flex-end', height: 300, gap: 48, padding: '0 24px'}}>
            {data.map((item, i) => (
              <div key={i} className={`delay-${i+1} animate-enter`} style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center'}}>
                <div style={{
                  width: '100%', 
                  height: `${(item.score / maxScore) * 200}px`, 
                  background: i === 0 ? 'var(--hyoka-orange)' : 'var(--hyoka-navy-light)',
                  borderRadius: '12px 12px 0 0',
                  position: 'relative',
                  transition: 'height 1s ease-out'
                }}>
                  <div style={{
                    position: 'absolute', top: -30, width: '100%', textAlign: 'center', fontWeight: 800
                  }}>
                    {item.score}%
                  </div>
                </div>
                <div style={{textAlign: 'center'}}>
                  <div style={{fontWeight: 600}}>{item.name}</div>
                  <div style={{fontSize: 12, color: 'var(--hyoka-text-muted)'}}>${item.cost}/1k</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hyoka-card delay-3 animate-enter">
          <h3>Latency Distribution (P95)</h3>
          <div style={{marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16}}>
            {data.map((item, i) => (
              <div key={i}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 14}}>
                  <span>{item.name}</span>
                  <span style={{color: 'var(--hyoka-text-muted)'}}>{item.speed}ms</span>
                </div>
                <div style={{height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden'}}>
                  <div style={{
                    width: `${(item.speed / 1000) * 100}%`, 
                    height: '100%', 
                    background: item.speed < 200 ? 'var(--hyoka-teal)' : (item.speed < 500 ? 'var(--hyoka-blue)' : 'var(--hyoka-orange)')
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hyoka-card delay-4 animate-enter">
          <h3>Win Rate</h3>
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, position: 'relative'
          }}>
            <div style={{
              width: 160, height: 160, borderRadius: '50%', 
              background: 'conic-gradient(var(--hyoka-orange) 0% 45%, var(--hyoka-blue) 45% 75%, var(--hyoka-teal) 75% 100%)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute', inset: 20, background: 'var(--hyoka-navy)', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
              }}>
                <div style={{fontSize: 32, fontWeight: 800}}>45%</div>
                <div style={{fontSize: 12, color: 'var(--hyoka-text-muted)'}}>GPT-4o</div>
              </div>
            </div>
          </div>
          <div style={{display: 'flex', justifyContent: 'center', gap: 16, fontSize: 12}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 4}}><div style={{width: 8, height: 8, background: 'var(--hyoka-orange)', borderRadius: '50%'}}/> GPT-4o</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 4}}><div style={{width: 8, height: 8, background: 'var(--hyoka-blue)', borderRadius: '50%'}}/> Claude</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 4}}><div style={{width: 8, height: 8, background: 'var(--hyoka-teal)', borderRadius: '50%'}}/> Other</div>
          </div>
        </div>
      </div>
    </HyokaLayout>
  );
}
