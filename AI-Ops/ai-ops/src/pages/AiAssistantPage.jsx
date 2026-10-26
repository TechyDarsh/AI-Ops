import { useState } from 'react';
import { aiConversationHistory } from '../data/simulator';
import { Send, Bot, Sparkles, Database, Cpu, FileText, Zap } from 'lucide-react';

const capabilities = [
  { icon: <Cpu size={16}/>, label: 'Machine Analysis', desc: 'Query real-time telemetry and health scores' },
  { icon: <Zap size={16}/>, label: 'Failure Prediction', desc: 'AI-powered predictive maintenance insights' },
  { icon: <FileText size={16}/>, label: 'Report Generation', desc: 'Auto-generate maintenance and OEE reports' },
  { icon: <Database size={16}/>, label: 'RAG Knowledge Base', desc: 'Search manuals, SOPs and engineering docs' },
];

const suggestions = [
  'What is the current OEE and how can we improve it?',
  'Generate maintenance recommendations for all warning machines',
  'Analyze vibration trends for Laser Cutter Zeta',
  'What spare parts are running low and need reordering?',
  'Predict failure risk for all machines in the next 30 days',
  'Summarize this week\'s incident reports',
];

const aiResponses = [
  'Based on RAG retrieval from 47 engineering documents, I can provide the following analysis…\n\n**OEE Analysis:**\n• Current OEE: 83.7% (target: 86%)\n• Availability: 91.2% — primary constraint\n• Performance: 93.4% — within benchmark\n• Quality: 98.1% — excellent\n\n**Improvement Opportunities:**\n1. Fix MCH-006 (Laser Cutter) — estimated +2.1% OEE impact\n2. Schedule overdue maintenance on MCH-002 — estimated +1.4% impact\n3. Optimize MCH-008 restart procedure — estimated +0.8% impact\n\nTotal potential improvement: **+4.3% OEE** → reaching 88% benchmark.',
  'I have analyzed all 12 machines using the Predictive Maintenance Algorithm v3.2:\n\n**HIGH RISK (>70% failure probability in 30 days):**\n• MCH-006 Laser Cutter: **78%** risk — vibration anomaly + bearing temperature\n• MCH-012 Pump Station: **65%** risk — seal degradation pattern\n\n**MEDIUM RISK (30-70%):**\n• MCH-002 Hydraulic Press: **52%** risk — hydraulic fluid contamination\n• MCH-004 Conveyor: **38%** risk — belt wear acceleration\n\n**Recommended Actions:** Create 4 work orders immediately. Estimated cost to prevent: $18,500. Estimated cost of failures if ignored: $156,000.',
  'Searching RAG knowledge base…\n\nFound 3 relevant documents:\n1. "Hydraulic System Maintenance Manual Rev.4" — Section 7.3\n2. "Laser Cutter Calibration SOP-LC-001" — Section 2.1\n3. "Vibration Analysis Guidelines IEC 60068-2"\n\nBased on these documents and current telemetry, the vibration signature for MCH-006 matches the pattern described in IEC 60068-2 as "Stage 3 bearing degradation." Recommended action: Replace spindle bearing SKF 6209 within 48 hours.',
];
let respIdx = 0;

export default function AiAssistantPage() {
  const [messages, setMessages] = useState(aiConversationHistory);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const send = (text) => {
    const t = text || input;
    if (!t.trim()) return;
    setMessages(m => [...m, { role: 'user', content: t, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setMessages(m => [...m, { role: 'assistant', content: aiResponses[respIdx % aiResponses.length], time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      respIdx++;
      setTyping(false);
    }, 1800);
  };

  return (
    <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-md)', height: 'calc(100vh - 128px)' }}>
      {/* Chat Area */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: 'var(--space-md) var(--space-lg)', borderBottom: '1px solid var(--border)', background: 'linear-gradient(135deg, rgba(30,111,217,0.1), rgba(6,182,212,0.05))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--grad-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={18} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>AI-Ops Industrial Assistant</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block', animation: 'pulse-dot 2s infinite' }}></span>
                RAG Engine Active · GPT-4o Industrial Model · 47 Documents Indexed
              </div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <span className="tag"><Sparkles size={10} style={{ marginRight: 2 }} />AI Powered</span>
              <span className="tag"><Database size={10} style={{ marginRight: 2 }} />RAG Engine</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              {msg.role === 'assistant' && (
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--grad-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={13} color="white" />
                </div>
              )}
              <div style={{ maxWidth: '75%' }}>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: msg.role === 'user' ? 'var(--grad-blue)' : 'var(--bg-surface)',
                  border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                  fontSize: '0.85rem', lineHeight: 1.7,
                  color: msg.role === 'user' ? 'white' : 'var(--text-secondary)',
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>{msg.time}</div>
              </div>
            </div>
          ))}
          {typing && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--grad-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot size={13} color="white" />
              </div>
              <div style={{ padding: '12px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '14px 14px 14px 4px', display: 'flex', gap: 4 }}>
                {[0, 0.2, 0.4].map((d, i) => (
                  <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-blue)', display: 'block', animation: `pulse-dot 0.8s infinite ${d}s` }}></span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ padding: 'var(--space-md)', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <textarea
              id="ai-chat-input"
              style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'var(--font-sans)', outline: 'none', resize: 'none' }}
              rows={3}
              placeholder="Ask about machine health, maintenance recommendations, failure analysis, OEE insights…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button className="btn btn-primary" onClick={() => send()} style={{ alignSelf: 'flex-end', padding: '10px 16px' }} aria-label="Send message">
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', overflowY: 'auto' }}>
        {/* Capabilities */}
        <div className="card">
          <div className="card-title mb-md">AI Capabilities</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {capabilities.map(c => (
              <div key={c.label} style={{ display: 'flex', gap: 10, padding: '8px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', alignItems: 'flex-start' }}>
                <div style={{ color: 'var(--accent-blue-lt)', flexShrink: 0, marginTop: 2 }}>{c.icon}</div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        <div className="card">
          <div className="card-title mb-md">Suggested Queries</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => send(s)}
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', cursor: 'pointer', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-secondary)', transition: 'var(--transition)', lineHeight: 1.4 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* RAG Status */}
        <div className="card">
          <div className="card-title mb-md">RAG Knowledge Base</div>
          {[
            { label: 'Machine Manuals', count: 12, icon: '📖' },
            { label: 'Maintenance SOPs', count: 8, icon: '📋' },
            { label: 'Engineering Specs', count: 15, icon: '📐' },
            { label: 'Inspection Reports', count: 12, icon: '🔍' },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(30,45,69,0.5)', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{r.icon} {r.label}</span>
              <span style={{ color: 'var(--accent-blue-lt)', fontWeight: 600 }}>{r.count} docs</span>
            </div>
          ))}
          <div style={{ marginTop: 8, fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total: 47 documents indexed · Last updated: Today</div>
        </div>
      </div>
    </div>
  );
}
