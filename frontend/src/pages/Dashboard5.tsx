import React, { useEffect, useState } from 'react';
import { HyokaLayout } from '../components/HyokaLayout';

export default function Dashboard5() {
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const msgs = [
        "Evaluator agent started for task #1293",
        "Connection established to OpenAI API",
        "Received 200 OK from Anthropic",
        "Task #1293 completed in 450ms",
        "Rate limit check passed",
        "Model gpt-4o-mini processing...",
      ];
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <HyokaLayout title="System Pulse">
      <div className="hyoka-grid grid-4 animate-enter">
        {['API Latency', 'Error Rate', 'Active Agents', 'Queue Depth'].map((metric, i) => (
          <div key={metric} className={`hyoka-card delay-${i+1} animate-enter`}>
            <div style={{color: 'var(--hyoka-text-muted)', fontSize: 12, textTransform: 'uppercase'}}>{metric}</div>
            <div style={{fontSize: 32, fontWeight: 700, margin: '8px 0'}}>
              {i === 0 ? '124ms' : i === 1 ? '0.02%' : i === 2 ? '12' : '4'}
            </div>
            <div style={{height: 40, display: 'flex', alignItems: 'flex-end', gap: 2}}>
              {Array.from({length: 20}).map((_, j) => (
                <div key={j} style={{
                  width: '100%', 
                  height: `${30 + Math.random() * 70}%`, 
                  background: i === 1 ? 'var(--hyoka-orange)' : 'var(--hyoka-teal)',
                  opacity: 0.5 + (j/40)
                }}/>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="hyoka-grid grid-2" style={{marginTop: 24}}>
        <div className="hyoka-card delay-3 animate-enter">
          <h3>Live Logs</h3>
          <div style={{marginTop: 16, fontFamily: 'monospace', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8}}>
            {logs.map((log, i) => (
              <div key={i} style={{opacity: 1 - (i * 0.1), color: log.includes('Error') ? 'var(--hyoka-orange)' : 'var(--hyoka-text-muted)'}}>
                {log}
              </div>
            ))}
          </div>
        </div>

        <div className="hyoka-card delay-4 animate-enter" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300}}>
          <div style={{position: 'relative', width: 200, height: 200}}>
            <div className="pulse-indicator" style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%', 
              background: 'transparent', border: '2px solid var(--hyoka-teal)', borderRadius: '50%'
            }} />
            <div className="pulse-indicator" style={{
              position: 'absolute', inset: 40, width: 'auto', height: 'auto', 
              background: 'transparent', border: '2px solid var(--hyoka-orange)', borderRadius: '50%',
              animationDelay: '0.5s'
            }} />
             <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column'
            }}>
              <div style={{fontSize: 24, fontWeight: 800}}>99.9%</div>
              <div style={{fontSize: 12, color: 'var(--hyoka-text-muted)'}}>UPTIME</div>
            </div>
          </div>
        </div>
      </div>
    </HyokaLayout>
  );
}
