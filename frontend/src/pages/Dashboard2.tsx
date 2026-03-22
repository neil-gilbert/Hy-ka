import React, { useEffect, useState } from 'react';
import { HyokaLayout } from '../components/HyokaLayout';
import { listExperiments } from '../lib/api';
import { Experiment } from '../lib/types';

export default function Dashboard2() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);

  useEffect(() => {
    listExperiments().then(setExperiments).catch(console.error);
  }, []);

  return (
    <HyokaLayout title="Experiments">
      <div className="hyoka-grid grid-1 animate-enter">
        {experiments.map((exp, i) => (
          <div key={exp.id} className={`hyoka-card delay-${(i % 4) + 1}`} style={{
            display: 'grid', 
            gridTemplateColumns: '48px 1fr 1fr 1fr 120px', 
            alignItems: 'center', 
            gap: 24
          }}>
            <div style={{
              width: 48, height: 48, 
              borderRadius: '50%', 
              background: `hsl(${i * 60}, 70%, 60%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 18, color: '#fff'
            }}>
              {exp.name.charAt(0).toUpperCase()}
            </div>
            
            <div>
              <div style={{fontWeight: 600, fontSize: 16}}>{exp.name}</div>
              <div style={{fontSize: 12, color: 'var(--hyoka-text-muted)'}}>Created {new Date().toLocaleDateString()}</div>
            </div>

            <div>
              <div style={{fontSize: 12, color: 'var(--hyoka-text-muted)', marginBottom: 4}}>Progress</div>
              <div style={{height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden'}}>
                <div style={{width: `${(i * 33) % 100}%`, height: '100%', background: 'var(--hyoka-orange)'}} />
              </div>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
              <div style={{fontSize: 12, color: 'var(--hyoka-text-muted)'}}>Models</div>
              <div style={{display: 'flex', gap: -8}}>
                {exp.model_arms.map((arm, j) => (
                  <div key={j} style={{
                    width: 24, height: 24, borderRadius: '50%', 
                    background: '#333', border: '2px solid var(--hyoka-navy)',
                    marginLeft: j > 0 ? -8 : 0,
                    fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {arm.provider[0].toUpperCase()}
                  </div>
                ))}
              </div>
            </div>

            <button className="hyoka-button" style={{padding: '8px 16px', fontSize: 14}}>View</button>
          </div>
        ))}
        {experiments.length === 0 && (
          <div className="hyoka-card" style={{textAlign: 'center', padding: 48}}>
            <div style={{fontSize: 64, marginBottom: 16}}>🧪</div>
            <h3>No Experiments Yet</h3>
            <p style={{color: 'var(--hyoka-text-muted)'}}>Create your first experiment to see it here.</p>
          </div>
        )}
      </div>
    </HyokaLayout>
  );
}
