import React from 'react';
import { HyokaLayout } from '../components/HyokaLayout';

export default function Dashboard4() {
  const rows = Array.from({ length: 20 }).map((_, i) => ({
    id: `run-${1000 + i}`,
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    model: i % 2 === 0 ? 'gpt-4o' : 'claude-3-opus',
    input_tokens: Math.floor(Math.random() * 1000),
    output_tokens: Math.floor(Math.random() * 500),
    cost: (Math.random() * 0.05).toFixed(4),
    status: Math.random() > 0.1 ? 'Success' : 'Failed'
  }));

  return (
    <HyokaLayout title="Data Grid">
      <div className="hyoka-card animate-enter" style={{overflow: 'hidden', padding: 0}}>
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: 14}}>
            <thead>
              <tr style={{borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)'}}>
                <th style={{padding: '16px 24px', textAlign: 'left'}}>Run ID</th>
                <th style={{padding: '16px 24px', textAlign: 'left'}}>Timestamp</th>
                <th style={{padding: '16px 24px', textAlign: 'left'}}>Model</th>
                <th style={{padding: '16px 24px', textAlign: 'right'}}>Input</th>
                <th style={{padding: '16px 24px', textAlign: 'right'}}>Output</th>
                <th style={{padding: '16px 24px', textAlign: 'right'}}>Cost</th>
                <th style={{padding: '16px 24px', textAlign: 'center'}}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} className={`delay-${(i % 5) + 1} animate-enter`} style={{
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  transition: 'background 0.2s'
                }}>
                  <td style={{padding: '16px 24px', fontFamily: 'monospace', color: 'var(--hyoka-blue)'}}>{row.id}</td>
                  <td style={{padding: '16px 24px', color: 'var(--hyoka-text-muted)'}}>{new Date(row.timestamp).toLocaleTimeString()}</td>
                  <td style={{padding: '16px 24px', fontWeight: 500}}>{row.model}</td>
                  <td style={{padding: '16px 24px', textAlign: 'right', fontFamily: 'monospace'}}>{row.input_tokens}</td>
                  <td style={{padding: '16px 24px', textAlign: 'right', fontFamily: 'monospace'}}>{row.output_tokens}</td>
                  <td style={{padding: '16px 24px', textAlign: 'right'}}>${row.cost}</td>
                  <td style={{padding: '16px 24px', textAlign: 'center'}}>
                    <span style={{
                      padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                      background: row.status === 'Success' ? 'rgba(150, 221, 209, 0.1)' : 'rgba(255, 77, 77, 0.1)',
                      color: row.status === 'Success' ? 'var(--hyoka-teal)' : 'var(--hyoka-orange)'
                    }}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </HyokaLayout>
  );
}
