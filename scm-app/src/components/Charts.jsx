// ─── Chart wrapper components ───────────────────────────────
// Thin Recharts wrappers using the NEXUS design system tokens.
// All charts are responsive and respect dark mode.

import { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  ComposedChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

// ── Skeleton shimmer shared across all charts ───────────────
const Skeleton = ({ height = 260 }) => (
  <div style={{
    height,
    borderRadius: 10,
    background: 'var(--color-bg-surface-alt, #F8FAFC)',
    animation: 'chartPulse 1.4s ease-in-out infinite',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <style>{`@keyframes chartPulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  </div>
);

// ── Shared tooltip style ──────────────────────────────────────
const tooltipStyle = {
  background: 'var(--color-bg-surface, #fff)',
  border: '1px solid var(--color-border, #E2E8F0)',
  borderRadius: 8,
  fontSize: 12,
  fontFamily: 'DM Sans, sans-serif',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  color: 'var(--color-text, #1E293B)',
};

const labelStyle = {
  color: 'var(--color-text-secondary, #64748B)',
  fontSize: 11,
  fontFamily: 'DM Sans, sans-serif',
};

const tickStyle = { fontSize: 11, fontFamily: 'DM Sans, sans-serif', fill: 'var(--color-text-secondary, #64748B)' };

// ── 1. TrendLine — Area chart for monthly case/txn trends ────
function TrendLine({ data, loading }) {
  if (loading) return <Skeleton height={240} />;
  if (!data) return null;

  const chartData = (data.months || []).map((m, i) => ({
    month: m,
    'Açılan': data.created[i] ?? 0,
    'Kapatılan': data.closed[i] ?? 0,
    'İşlemler': data.transactions[i] ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={chartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradClosed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#059669" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradTxn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #E2E8F0)" vertical={false} />
        <XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} />
        <YAxis tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, fontFamily: 'DM Sans, sans-serif', paddingTop: 8 }} />
        <Area type="monotone" dataKey="Açılan" stroke="#3B82F6" strokeWidth={2} fill="url(#gradCreated)" dot={false} activeDot={{ r: 4 }} />
        <Area type="monotone" dataKey="Kapatılan" stroke="#059669" strokeWidth={2} fill="url(#gradClosed)" dot={false} activeDot={{ r: 4 }} />
        <Area type="monotone" dataKey="İşlemler" stroke="#F59E0B" strokeWidth={2} fill="url(#gradTxn)" dot={false} activeDot={{ r: 4 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── 2. SeverityDonut — Pie chart for severity breakdown ───────
const SEV_COLORS = {
  // Cases (lowercase)
  critical: '#DC2626',
  high: '#F59E0B',
  medium: '#3B82F6',
  low: '#94A3B8',
  // FDM transactions (capitalized)
  Critical: '#DC2626',
  High: '#F59E0B',
  Medium: '#3B82F6',
  Low: '#94A3B8',
};

const SEV_LABELS = { critical: 'Kritik', high: 'Yüksek', medium: 'Orta', low: 'Düşük', Critical: 'Kritik', High: 'Yüksek', Medium: 'Orta', Low: 'Düşük' };

function SeverityDonut({ data, loading }) {
  if (loading) return <Skeleton height={240} />;
  if (!data) return null;

  const caseEntries = Object.entries(data.cases || {}).filter(([, v]) => v > 0);
  const chartData = caseEntries.map(([k, v]) => ({ name: SEV_LABELS[k] || k, value: v, key: k }));
  const total = chartData.reduce((s, d) => s + d.value, 0);

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.06) return null;
    const R = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + R * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + R * Math.sin(-midAngle * Math.PI / 180);
    return <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>{`${(percent * 100).toFixed(0)}%`}</text>;
  };

  return (
    <div style={{ position: 'relative' }}>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius="52%"
            outerRadius="80%"
            dataKey="value"
            labelLine={false}
            label={renderLabel}
            strokeWidth={0}
          >
            {chartData.map((entry) => (
              <Cell key={entry.key} fill={SEV_COLORS[entry.key]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} formatter={(v) => [v, 'Vaka']} />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -54%)',
        textAlign: 'center', pointerEvents: 'none',
      }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text, #1E293B)', lineHeight: 1.1 }}>{total}</div>
        <div style={{ fontSize: 10, color: 'var(--color-text-secondary, #64748B)', marginTop: 2 }}>Açık Vaka</div>
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 16px', marginTop: 4 }}>
        {chartData.map(d => (
          <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: SEV_COLORS[d.key], flexShrink: 0 }} />
            <span style={{ color: 'var(--color-text-secondary, #64748B)' }}>{d.name}</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text, #1E293B)' }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 3. DomainHeatmap — Domain cards with radial gauge ─────────

// Radial gauge: SVG circle stroke trick
function RadialGauge({ score = 0, size = 56 }) {
  const r       = (size - 8) / 2;
  const circum  = 2 * Math.PI * r;
  const filled  = (score / 100) * circum;
  const gaugeColor = score >= 75 ? '#DC2626' : score >= 50 ? '#F59E0B' : '#059669';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={5} />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke={gaugeColor}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circum - filled}`}
        style={{ animation: 'scm-gauge-fill 1s cubic-bezier(0.16,1,0.3,1) both' }}
      />
    </svg>
  );
}

function DomainCard({ d, idx }) {
  const [flipped, setFlipped] = useState(false);
  const fmtK = (v) => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v/1_000).toFixed(0)}K` : v ?? 0;

  return (
    <div
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      style={{
        perspective: 800,
        height: 168,
        animation: `scm-stagger-in 0.35s ${idx * 60}ms cubic-bezier(0.16,1,0.3,1) both`,
      }}
    >
      <div style={{
        position: 'relative', width: '100%', height: '100%',
        transformStyle: 'preserve-3d',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        transition: 'transform 0.42s cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* ── Front face ── */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          background: 'var(--color-bg-surface, #fff)',
          border: '1px solid var(--color-border, #E2E8F0)',
          borderRadius: 14, padding: '14px 16px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {/* Domain header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: d.color + '22', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 14,
              }}>{d.icon || '📊'}</div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text, #1E293B)', lineHeight: 1.3 }}>
                {(d.label || '').replace(' Fraud', '').replace('Account Takeover', 'Acc. Takeover')}
              </span>
            </div>
            {/* Gauge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
              <div style={{ position: 'relative' }}>
                <RadialGauge score={d.avgScore ?? 0} color={d.color} size={48} />
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700,
                  color: (d.avgScore ?? 0) >= 75 ? '#DC2626' : (d.avgScore ?? 0) >= 50 ? '#F59E0B' : '#059669',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {d.avgScore ?? 0}
                </div>
              </div>
              <span style={{ fontSize: 9, color: '#94A3B8', fontFamily: 'DM Sans, sans-serif', letterSpacing: 0.2 }}>
                Ort. Risk
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
            <div>
              <div style={{ color: '#64748B' }}>Açık</div>
              <div style={{ fontWeight: 700, color: '#F59E0B' }}>{d.openCases ?? 0}</div>
            </div>
            <div>
              <div style={{ color: '#64748B' }}>Kapalı</div>
              <div style={{ fontWeight: 700, color: '#059669' }}>{d.closedCases ?? 0}</div>
            </div>
            <div>
              <div style={{ color: '#64748B' }}>Toplam</div>
              <div style={{ fontWeight: 700, color: 'var(--color-text, #1E293B)' }}>{(d.openCases ?? 0) + (d.closedCases ?? 0)}</div>
            </div>
          </div>

          {/* Total amount */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary, #64748B)', fontFamily: 'JetBrains Mono, monospace' }}>
              ₺{fmtK(d.totalAmount)}
            </span>
          </div>
        </div>

        {/* ── Back face ── */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: d.color || '#3B82F6',
          borderRadius: 14, padding: '14px 16px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          color: '#fff',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.9 }}>
            {d.label || ''}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 4px', fontSize: 11 }}>
            {[
              ['Kritik', d.criticalCount ?? 0],
              ['Yüksek', d.highCount ?? 0],
              ['İşlem', d.txnCount ?? 0],
              ['Risk Skoru', d.avgScore ?? 0],
            ].map(([lbl, val]) => (
              <div key={lbl}>
                <div style={{ opacity: 0.72, fontSize: 10 }}>{lbl}</div>
                <div style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>
            Tutar: ₺{(d.totalAmount ?? 0).toLocaleString('tr-TR')}
          </div>
        </div>
      </div>
    </div>
  );
}

function DomainHeatmap({ data, loading }) {
  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
      {[0,1,2,3,4].map(i => <Skeleton key={i} height={168} />)}
    </div>
  );
  if (!data || data.length === 0) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
      {data.map((d, i) => <DomainCard key={d.domain_id || i} d={d} idx={i} />)}
    </div>
  );
}

// ── 4. AmountTrends — Composed bar + line for fraud amounts ──
function AmountTrends({ data, loading }) {
  if (loading) return <Skeleton height={240} />;
  if (!data) return null;

  const fmtK = (v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v;

  const chartData = (data.months || []).map((m, i) => ({
    month: m,
    'Toplam Tutar': data.totalAmounts[i] ?? 0,
    'Ort. Tutar': data.avgAmounts[i] ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 24, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #E2E8F0)" vertical={false} />
        <XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} />
        <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={fmtK} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} formatter={(v) => [`₺${Number(v).toLocaleString('tr-TR')}`, '']} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, fontFamily: 'DM Sans, sans-serif', paddingTop: 8 }} />
        <Bar dataKey="Toplam Tutar" fill="#1E40AF" radius={[4, 4, 0, 0]} barSize={28} fillOpacity={0.85} />
        <Line type="monotone" dataKey="Ort. Tutar" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3, fill: '#F59E0B' }} activeDot={{ r: 5 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ── 5. RiskScoreDistribution — Color-graded vertical bar chart ──
const RISK_COLORS = ['#059669', '#3B82F6', '#F59E0B', '#F97316', '#DC2626'];

function RiskScoreDistribution({ data, loading }) {
  if (loading) return <Skeleton height={220} />;
  if (!data || data.length === 0) return null;

  const chartData = data.map((d, i) => ({ name: d.bucket, count: d.count, fill: RISK_COLORS[i] || '#94A3B8' }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #E2E8F0)" vertical={false} />
        <XAxis dataKey="name" tick={tickStyle} axisLine={false} tickLine={false} />
        <YAxis tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} formatter={(v) => [v, 'İşlem']} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── 6. AnalystPerformance — Horizontal stacked bar per analyst ──
function AnalystPerformance({ data, loading }) {
  if (loading) return <Skeleton height={240} />;
  if (!data || data.length === 0) return (
    <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary, #64748B)', fontSize: 13 }}>
      Veri bulunamadı
    </div>
  );

  const chartData = data.map(d => ({
    name: (d.analyst || '').split(' ')[0],
    fullName: d.analyst,
    'Açık': d.openCases,
    'Kapalı': d.closedCases,
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 44)}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 24, left: 70, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #E2E8F0)" horizontal={false} />
        <XAxis type="number" tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="name" tick={tickStyle} axisLine={false} tickLine={false} width={68} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} formatter={(v, name) => [v, name === 'Açık' ? 'Açık Vaka' : 'Kapalı Vaka']} />
        <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 12, fontFamily: 'DM Sans, sans-serif' }} />
        <Bar dataKey="Açık" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
        <Bar dataKey="Kapalı" stackId="a" fill="#059669" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── 7. FraudFunnel — Interactive SVG trapezoid funnel ────────
const FUNNEL_COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#059669'];

function FraudFunnel({ data, loading }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (loading) return <Skeleton height={220} />;
  if (!data) return null;

  const stages = [
    { label: 'Toplam İşlem',   value: data.totalTransactions  ?? 0 },
    { label: 'İşaretli',       value: data.markedTransactions ?? 0 },
    { label: 'Vakaya Atanmış', value: data.caseAssigned       ?? 0 },
    { label: 'Kapatılmış',     value: data.closedCases        ?? 0 },
  ];

  const maxVal  = stages[0].value || 1;
  const W       = 560;   // SVG viewBox width
  const H       = 220;
  const stageH  = 44;
  const gapH    = 10;
  const minPct  = 0.22;  // minimum width as fraction of W so funnel doesn't collapse

  // Each stage: trapezoid from prev width to next width
  const widths = stages.map((s, i) => {
    const frac = Math.max(s.value / maxVal, i === 0 ? 1 : minPct);
    return frac * W;
  });

  const totalH = stages.length * stageH + (stages.length - 1) * gapH;
  const offsetY = (H - totalH) / 2;

  return (
    <div style={{ position: 'relative', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @keyframes scm-funnel-in {
          from { opacity: 0; transform: translateX(-18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .scm-funnel-stage { cursor: pointer; }
        .scm-funnel-stage path { transition: filter 0.18s ease; }
        .scm-funnel-stage:hover path { filter: brightness(1.12); }
      `}</style>

      {/* Tooltip */}
      {hoveredIdx !== null && (
        <div style={{
          position: 'absolute', top: 6, right: 0,
          background: 'var(--color-bg-surface, #fff)',
          border: '1px solid var(--color-border, #E2E8F0)',
          borderRadius: 8, padding: '8px 12px',
          fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          pointerEvents: 'none', minWidth: 140,
        }}>
          <div style={{ fontWeight: 600, color: FUNNEL_COLORS[hoveredIdx], marginBottom: 2 }}>
            {stages[hoveredIdx].label}
          </div>
          <div style={{ color: 'var(--color-text, #1E293B)', fontWeight: 700, fontSize: 16 }}>
            {stages[hoveredIdx].value.toLocaleString('tr-TR')}
          </div>
          {hoveredIdx > 0 && stages[0].value > 0 && (
            <div style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}>
              {((stages[hoveredIdx].value / stages[0].value) * 100).toFixed(1)}% toplam
            </div>
          )}
        </div>
      )}

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} overflow="visible">
        {stages.map((stage, i) => {
          const y   = offsetY + i * (stageH + gapH);
          const w   = widths[i];
          const wNext = i < stages.length - 1 ? widths[i + 1] : w * 0.82;
          const x   = (W - w) / 2;
          const xNext = (W - wNext) / 2;
          const color = FUNNEL_COLORS[i];

          // Trapezoid path
          const path = `M${x},${y} L${x + w},${y} L${xNext + wNext},${y + stageH} L${xNext},${y + stageH} Z`;

          // Conversion rate label between stages
          const convRate = i < stages.length - 1 && stages[i].value > 0
            ? Math.round((stages[i + 1].value / stages[i].value) * 100)
            : null;

          return (
            <g
              key={i}
              className="scm-funnel-stage"
              style={{ animation: `scm-funnel-in 0.35s ${i * 70}ms cubic-bezier(0.16,1,0.3,1) both` }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Trapezoid */}
              <path d={path} fill={color} opacity={hoveredIdx === i ? 1 : 0.88} />

              {/* Stage label (left) */}
              <text
                x={x - 8}
                y={y + stageH / 2}
                textAnchor="end"
                dominantBaseline="central"
                fontSize={11}
                fill="var(--color-text-secondary, #64748B)"
                fontFamily="DM Sans, sans-serif"
              >
                {stage.label}
              </text>

              {/* Value (center of trapezoid) */}
              <text
                x={W / 2}
                y={y + stageH / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                fontWeight={600}
                fill="#fff"
                fontFamily="JetBrains Mono, monospace"
              >
                {stage.value.toLocaleString('tr-TR')}
              </text>

              {/* Conversion rate arrow between stages */}
              {convRate !== null && (
                <g>
                  <text
                    x={W / 2}
                    y={y + stageH + gapH / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={10}
                    fill={FUNNEL_COLORS[i + 1]}
                    fontFamily="DM Sans, sans-serif"
                    fontWeight={600}
                  >
                    ↓ {convRate}%
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const Charts = { TrendLine, SeverityDonut, DomainHeatmap, AmountTrends, RiskScoreDistribution, AnalystPerformance, FraudFunnel };
export default Charts;
