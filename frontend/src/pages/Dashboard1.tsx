import React, { useEffect, useState } from 'react';
import { HyokaLayout } from '../components/HyokaLayout';
import { listExperiments } from '../lib/api';
import { Experiment } from '../lib/types';

export default function Dashboard1() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);

  useEffect(() => {
    listExperiments().then(setExperiments).catch(console.error);
  }, []);

  return (
    <HyokaLayout title="Overview">
      <div className="hyoka-grid grid-3">
        <div className="hyoka-card balance-card delay-1 animate-enter" style={{gridColumn: 'span 2'}}>
          <div className="balance-label">Total Budget Remaining</div>
          <div className="balance-amount">$1,240.50</div>
          <div style={{color: '#8b9bb4', marginTop: 12, display: 'flex', gap: 24}}>
             <span><strong style={{color: '#96ddd1'}}>+ $200.00</strong> this month</span>
             <span><strong style={{color: 'var(--hyoka-text)'}}>85%</strong> utilization</span>
          </div>
        </div>

        <div className="hyoka-card delay-2 animate-enter" style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          <div className="balance-label">Active Experiments</div>
          <div className="balance-amount">{experiments.length || 0}</div>
          <div style={{color: '#8b9bb4'}}>
            across 4 providers
          </div>
        </div>
      </div>

      <div className="hyoka-grid grid-4" style={{marginTop: 24}}>
        <div className="hyoka-card delay-3 animate-enter" style={{background: 'var(--hyoka-navy-light)'}}>
           <div style={{fontSize: 24, marginBottom: 8}}>🚀</div>
           <div style={{fontWeight: 600, marginBottom: 4}}>Launch Run</div>
           <div style={{fontSize: 12, color: 'var(--hyoka-text-muted)'}}>Start a new evaluation</div>
        </div>
        <div className="hyoka-card delay-3 animate-enter" style={{background: 'var(--hyoka-navy-light)'}}>
           <div style={{fontSize: 24, marginBottom: 8}}>📊</div>
           <div style={{fontWeight: 600, marginBottom: 4}}>Compare</div>
           <div style={{fontSize: 12, color: 'var(--hyoka-text-muted)'}}>View model tradeoffs</div>
        </div>
        <div className="hyoka-card delay-3 animate-enter" style={{background: 'var(--hyoka-navy-light)'}}>
           <div style={{fontSize: 24, marginBottom: 8}}>⚡️</div>
           <div style={{fontWeight: 600, marginBottom: 4}}>Quick Test</div>
           <div style={{fontSize: 12, color: 'var(--hyoka-text-muted)'}}>Single prompt check</div>
        </div>
        <div className="hyoka-card delay-3 animate-enter" style={{background: 'var(--hyoka-navy-light)'}}>
           <div style={{fontSize: 24, marginBottom: 8}}>⚙️</div>
           <div style={{fontWeight: 600, marginBottom: 4}}>Settings</div>
           <div style={{fontSize: 12, color: 'var(--hyoka-text-muted)'}}>Manage providers</div>
        </div>
      </div>

      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 48, marginBottom: 24}}>
        <h3 style={{margin: 0}}>Recent Activity</h3>
        <button className="hyoka-button" style={{padding: '8px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)'}}>View All</button>
      </div>
      
      <div className="hyoka-grid grid-1 delay-4 animate-enter">
        {experiments.length > 0 ? experiments.slice(0, 3).map(exp => (
          <div key={exp.id} className="hyoka-card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
              <div style={{
                width: 48, height: 48, 
                borderRadius: 12, 
                background: 'rgba(255, 77, 77, 0.1)', 
                color: 'var(--hyoka-orange)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold'
              }}>Ex</div>
              <div>
                <div style={{fontWeight: 600, fontSize: 16}}>{exp.name}</div>
                <div style={{color: '#8b9bb4', fontSize: 14}}>{exp.workload_type} • {exp.dataset_ref}</div>
              </div>
            </div>
            <div style={{textAlign: 'right'}}>
              <div style={{fontWeight: 600}}>${exp.budget_usd}</div>
              <div style={{fontSize: 12, color: '#8b9bb4'}}>Budget</div>
            </div>
          </div>
        )) : (
          <div className="hyoka-card" style={{textAlign: 'center', padding: 48, color: '#8b9bb4'}}>
            No recent activity. Start an experiment to see it here.
          </div>
        )}
      </div>
    </HyokaLayout>
  );
}
