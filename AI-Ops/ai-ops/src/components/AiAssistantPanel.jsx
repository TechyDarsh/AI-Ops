import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, Minimize2 } from 'lucide-react';
import { aiConversationHistory } from '../data/simulator';

const aiResponses = [
  'Based on the current telemetry data, I can see elevated vibration levels on **MCH-006 (Laser Cutter Zeta)**. I recommend scheduling immediate inspection and creating a priority work order.',
  'The OEE for this month is **83.7%**, which is 2.3% below the industry benchmark of 86%. The primary factor is machine availability at 91.2%. Predictive maintenance on MCH-002 and MCH-012 could improve this by an estimated 4%.',
  'I have analyzed the maintenance history across all 12 machines. **3 machines** are overdue for preventive maintenance. The highest priority is MCH-006 followed by MCH-002. Total estimated maintenance cost: **$12,400**.',
  'Root cause analysis for the recent Hydraulic Press incident: The pressure drop was caused by worn hydraulic seals (Part #HSK-001A). Current stock level: 12 units (above minimum). Recommend scheduling repair within 72 hours.',
  'Production efficiency report: Current month production is **18,420 units** against a target of **22,000 units** (83.7% achievement). The gap is primarily due to MCH-008 downtime (14 hours). Projected month-end: ~19,200 units.',
];
let responseIdx = 0;

export default function AiAssistantPanel({ open, onClose }) {
  const [messages, setMessages] = useState(aiConversationHistory);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const msgEndRef = useRef(null);

  useEffect(() => { if (open) msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const resp = aiResponses[responseIdx % aiResponses.length];
      responseIdx++;
      setMessages(m => [...m, { role: 'assistant', content: resp, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setTyping(false);
    }, 1500);
  };

  if (!open) return (
    <button className="ai-fab" onClick={onClose} title="Open AI Assistant" aria-label="Open AI Assistant">
      <Bot size={22} />
      <div className="ai-pulse"></div>
    </button>
  );

  return (
    <div className="ai-panel" role="dialog" aria-label="AI Industrial Assistant">
      <div className="ai-panel-header">
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--grad-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bot size={16} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>AI-Ops Assistant</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block' }}></span>
            RAG Engine Active · GPT-4o Industrial
          </div>
        </div>
        <Sparkles size={14} style={{ color: 'var(--accent-blue-lt)' }} />
        <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close AI panel">
          <X size={14} />
        </button>
      </div>

      <div className="ai-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`ai-msg ${msg.role}`}>
            <div className="ai-bubble">{msg.content}</div>
            <div className="ai-time">{msg.time}</div>
          </div>
        ))}
        {typing && (
          <div className="ai-msg assistant">
            <div className="ai-bubble" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={{ animation: 'pulse-dot 0.8s infinite', animationDelay: '0s' }}>●</span>
              <span style={{ animation: 'pulse-dot 0.8s infinite', animationDelay: '0.2s' }}>●</span>
              <span style={{ animation: 'pulse-dot 0.8s infinite', animationDelay: '0.4s' }}>●</span>
            </div>
          </div>
        )}
        <div ref={msgEndRef} />
      </div>

      <div className="ai-input-row">
        <textarea
          className="ai-input"
          rows={2}
          placeholder="Ask about machines, maintenance, OEE, failures…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          aria-label="AI chat input"
        />
        <button className="btn btn-primary btn-icon" onClick={sendMessage} aria-label="Send message">
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
