import React from 'react';
import { Activity, Radio, AlertOctagon, CheckCircle2, Gauge, Flame, Wind, Thermometer } from 'lucide-react';

/**
 * Premium Modern Industrial SCADA Process Flow
 * Clean, high-contrast, polished control room interface
 */
export function FuxaFlowDiagram({ telemetry }) {
  const dht = telemetry?.dht22 || {};
  const mq2 = telemetry?.mq2 || {};
  const mq9 = telemetry?.mq9 || {};

  const tempVal = dht.temperature != null ? Number(dht.temperature) : null;
  const humVal = dht.humidity != null ? Number(dht.humidity) : null;
  const mq2Raw = mq2.raw != null ? Number(mq2.raw) : null;
  const mq2Volt = mq2.voltage != null ? Number(mq2.voltage) : null;
  const mq9Raw = mq9.raw != null ? Number(mq9.raw) : null;
  const mq9Volt = mq9.voltage != null ? Number(mq9.voltage) : null;

  const isMq2Crit = mq2Raw != null && mq2Raw >= 130;
  const isTempCrit = tempVal != null && tempVal > 40;

  return (
    <div style={{
      background: 'linear-gradient(145deg, #182234 0%, #0e1726 100%)',
      borderRadius: '10px',
      border: '1px solid #2a3b53',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
      overflow: 'hidden',
      color: '#e2e8f0',
      marginBottom: '16px'
    }}>
      {/* Control Room Topbar */}
      <div style={{
        padding: '12px 18px',
        background: 'rgba(10, 16, 28, 0.7)',
        borderBottom: '1px solid #223249',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Activity size={16} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.5, color: '#f8fafc', textTransform: 'uppercase' }}>
              SCADA Process Flow & Telemetry Pipeline
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>
              Real-time fluid & gas transport automation overview
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isMq2Crit ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#f87171',
              padding: '4px 10px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700
            }}>
              <AlertOctagon size={13} />
              <span>PRESSURE FAULT DETECTED</span>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              color: '#34d399',
              padding: '4px 10px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700
            }}>
              <CheckCircle2 size={13} />
              <span>FLOW INTEGRITY NOMINAL</span>
            </div>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#1e293b',
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: 11,
            color: '#38bdf8',
            fontFamily: 'monospace',
            fontWeight: 600,
            border: '1px solid #334155'
          }}>
            <Radio size={12} className="spin-slow" />
            <span>PORT 8081 SYNC</span>
          </div>
        </div>
      </div>

      {/* Process Flow Canvas */}
      <div style={{ padding: '16px 20px', position: 'relative' }}>
        <svg viewBox="0 0 960 210" style={{ width: '100%', height: 'auto', display: 'block' }}>
          <defs>
            {/* Flow Gradients */}
            <linearGradient id="scadaBluePipe" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            <linearGradient id="scadaCritPipe" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="50%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>

            <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* --- Industrial Heavy Steel Pipe Conduit Backgrounds --- */}
          {/* Main Trunk Pipe */}
          <path d="M 85 105 L 260 105" stroke="#1f2d42" strokeWidth="12" strokeLinecap="round" />
          <path d="M 370 105 L 530 105" stroke="#1f2d42" strokeWidth="12" strokeLinecap="round" />
          <path d="M 640 105 L 800 105" stroke="#1f2d42" strokeWidth="12" strokeLinecap="round" />
          {/* Secondary Recirculation Branch */}
          <path d="M 530 105 L 530 165 L 800 165" fill="none" stroke="#1f2d42" strokeWidth="10" strokeLinecap="round" />

          {/* --- Animated Fluid Flow Pulses --- */}
          <path
            d="M 85 105 L 260 105"
            stroke="url(#scadaBluePipe)"
            strokeWidth="5"
            fill="none"
            strokeDasharray="8 6"
            className="fuxa-pipeline"
          />
          <path
            d="M 370 105 L 530 105"
            stroke={isMq2Crit ? "url(#scadaCritPipe)" : "url(#scadaBluePipe)"}
            strokeWidth="5"
            fill="none"
            strokeDasharray="8 6"
            className={`fuxa-pipeline ${isMq2Crit ? 'crit' : ''}`}
          />
          <path
            d="M 640 105 L 800 105"
            stroke="url(#scadaBluePipe)"
            strokeWidth="5"
            fill="none"
            strokeDasharray="8 6"
            className="fuxa-pipeline"
          />
          <path
            d="M 530 105 L 530 165 L 800 165"
            stroke="url(#scadaBluePipe)"
            strokeWidth="4"
            fill="none"
            strokeDasharray="6 6"
            className="fuxa-pipeline"
          />

          {/* Pipe Flange Junctions */}
          {[260, 370, 530, 640, 800].map((x, i) => (
            <rect key={i} x={x - 2} y={97} width={4} height={16} fill="#475569" rx={1} />
          ))}

          {/* =========================================================
              STATION 0: FEED SOURCE VESSEL (TANK A)
             ========================================================= */}
          <g transform="translate(15, 55)" filter="url(#nodeGlow)">
            {/* Vessel Body */}
            <rect width="70" height="100" rx="10" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Fluid Indicator */}
            <rect x="5" y="32" width="60" height="63" rx="6" fill="rgba(14, 165, 233, 0.2)" />
            <path d="M 5 50 Q 20 47, 35 50 T 65 50 L 65 95 L 5 95 Z" fill="#0284c7" opacity="0.4" />
            
            <text x="35" y="24" fill="#94a3b8" fontSize="9" fontWeight="700" textAnchor="middle" letterSpacing="0.5">SOURCE</text>
            <text x="35" y="68" fill="#ffffff" fontSize="11" fontWeight="800" textAnchor="middle">TANK-01</text>
            <text x="35" y="84" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="700" textAnchor="middle">78.4%</text>
          </g>

          {/* =========================================================
              STATION 1: THERMAL MONITORING UNIT (DHT22)
             ========================================================= */}
          <g transform="translate(260, 45)" filter="url(#nodeGlow)">
            <rect width="110" height="120" rx="8" fill="#131d2e" stroke={isTempCrit ? "#ef4444" : "#22c55e"} strokeWidth="1.5" />
            {/* Header pill */}
            <rect x="0" y="0" width="110" height="28" rx="8" fill={isTempCrit ? "rgba(239, 68, 68, 0.15)" : "rgba(34, 197, 94, 0.1)"} />
            <text x="55" y="18" fill={isTempCrit ? "#f87171" : "#4ade80"} fontSize="10" fontWeight="700" textAnchor="middle" letterSpacing="0.5">
              M01 &middot; THERMAL
            </text>

            {/* Main Value Display */}
            <rect x="10" y="36" width="90" height="38" rx="5" fill="#0b111c" stroke="#1e293b" />
            <text x="55" y="60" fill={isTempCrit ? "#ef4444" : tempVal != null ? "#22c55e" : "#f59e0b"} fontSize="15" fontWeight="800" fontFamily="monospace" textAnchor="middle">
              {tempVal != null ? `${tempVal.toFixed(1)}°C` : 'ERR / OFF'}
            </text>

            {/* Sub telemetry */}
            <text x="55" y="92" fill="#94a3b8" fontSize="9" fontWeight="600" textAnchor="middle">
              {humVal != null ? `HUMIDITY: ${humVal.toFixed(0)}%` : 'HUM: DISCONNECTED'}
            </text>
            <rect x="12" y="102" width="86" height="5" rx="2.5" fill="#1e293b" />
            <rect x="12" y="102" width={humVal != null ? `${Math.min(86, humVal * 0.86)}` : "0"} height="5" rx="2.5" fill="#38bdf8" />
          </g>

          {/* =========================================================
              STATION 2: GAS MONITORING VESSEL A (MQ-2)
             ========================================================= */}
          <g transform="translate(530, 45)" filter="url(#nodeGlow)">
            <rect width="110" height="120" rx="8" fill="#131d2e" stroke={isMq2Crit ? "#ef4444" : "#0284c7"} strokeWidth="1.5" />
            {/* Header pill */}
            <rect x="0" y="0" width="110" height="28" rx="8" fill={isMq2Crit ? "rgba(239, 68, 68, 0.2)" : "rgba(2, 132, 199, 0.15)"} />
            <text x="55" y="18" fill={isMq2Crit ? "#f87171" : "#38bdf8"} fontSize="10" fontWeight="700" textAnchor="middle" letterSpacing="0.5">
              M02 &middot; MQ-2 VESSEL
            </text>

            {/* Main Value Display */}
            <rect x="10" y="36" width="90" height="38" rx="5" fill="#0b111c" stroke="#1e293b" />
            <text x="55" y="60" fill={isMq2Crit ? "#ef4444" : "#38bdf8"} fontSize="15" fontWeight="800" fontFamily="monospace" textAnchor="middle">
              {mq2Raw != null ? `${mq2Raw.toFixed(0)}` : '--'}
            </text>
            <text x="55" y="70" fill="#64748b" fontSize="8" textAnchor="middle" fontWeight="700">RAW UNITS</text>

            {/* Voltage & State */}
            <text x="55" y="92" fill={isMq2Crit ? "#f87171" : "#94a3b8"} fontSize="9" fontFamily="monospace" fontWeight="600" textAnchor="middle">
              {mq2Volt != null ? `${mq2Volt.toFixed(2)} V` : '-- V'} &middot; {isMq2Crit ? 'CRITICAL' : 'OPTIMAL'}
            </text>
            <rect x="12" y="102" width="86" height="5" rx="2.5" fill="#1e293b" />
            <rect x="12" y="102" width={mq2Raw != null ? `${Math.min(86, (mq2Raw / 1024) * 86)}` : "0"} height="5" rx="2.5" fill={isMq2Crit ? "#ef4444" : "#0284c7"} />
          </g>

          {/* =========================================================
              STATION 3: HIGH-PRESSURE EXHAUST (MQ-9)
             ========================================================= */}
          <g transform="translate(800, 45)" filter="url(#nodeGlow)">
            <rect width="110" height="120" rx="8" fill="#131d2e" stroke="#2563eb" strokeWidth="1.5" />
            {/* Header pill */}
            <rect x="0" y="0" width="110" height="28" rx="8" fill="rgba(37, 99, 235, 0.15)" />
            <text x="55" y="18" fill="#60a5fa" fontSize="10" fontWeight="700" textAnchor="middle" letterSpacing="0.5">
              M03 &middot; MQ-9 EXHAUST
            </text>

            {/* Main Value Display */}
            <rect x="10" y="36" width="90" height="38" rx="5" fill="#0b111c" stroke="#1e293b" />
            <text x="55" y="60" fill="#60a5fa" fontSize="15" fontWeight="800" fontFamily="monospace" textAnchor="middle">
              {mq9Raw != null ? `${mq9Raw.toFixed(0)}` : '--'}
            </text>
            <text x="55" y="70" fill="#64748b" fontSize="8" textAnchor="middle" fontWeight="700">RAW UNITS</text>

            {/* Voltage & State */}
            <text x="55" y="92" fill="#94a3b8" fontSize="9" fontFamily="monospace" fontWeight="600" textAnchor="middle">
              {mq9Volt != null ? `${mq9Volt.toFixed(2)} V` : '-- V'} &middot; ONLINE
            </text>
            <rect x="12" y="102" width="86" height="5" rx="2.5" fill="#1e293b" />
            <rect x="12" y="102" width={mq9Raw != null ? `${Math.min(86, (mq9Raw / 1024) * 86)}` : "0"} height="5" rx="2.5" fill="#2563eb" />
          </g>
        </svg>
      </div>

      {/* Footer Metrics Strip */}
      <div style={{
        padding: '10px 18px',
        background: '#0b111d',
        borderTop: '1px solid #1e293b',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 11,
        color: '#94a3b8'
      }}>
        <div style={{ display: 'flex', gap: 20 }}>
          <span><strong>Line A Status:</strong> <span style={{ color: '#38bdf8' }}>Continuous Cycle</span></span>
          <span><strong>Fluid Density:</strong> <span style={{ color: '#f8fafc' }}>1.024 g/cm³</span></span>
          <span><strong>Volumetric Rate:</strong> <span style={{ color: '#f8fafc' }}>48.2 L/min</span></span>
        </div>
        <div style={{ fontFamily: 'monospace', color: '#64748b' }}>
          ISO-55000 AUTOMATED FLOW MONITOR
        </div>
      </div>
    </div>
  );
}
