// ─── Chart wrapper components ───────────────────────────────
// Thin Recharts wrappers using the NEXUS design system tokens.
// All charts are responsive and respect dark mode.

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

// ── 3. DomainHeatmap — Stacked bar per domain ─────────────────
function DomainHeatmap({ data, loading }) {
  if (loading) return <Skeleton height={200} />;
  if (!data || data.length === 0) return null;

  const chartData = data.map(d => ({
    name: d.label.replace(' Fraud', '').replace('Account Takeover', 'Acc. Takeover'),
    'Açık': d.openCases,
    'Kapalı': d.closedCases,
    color: d.color,
    totalAmount: d.totalAmount,
    txnCount: d.txnCount,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 24, left: 80, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #E2E8F0)" horizontal={false} />
        <XAxis type="number" tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="name" tick={tickStyle} axisLine={false} tickLine={false} width={78} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={labelStyle}
          formatter={(v, name) => [v, name === 'Açık' ? 'Açık Vaka' : 'Kapalı Vaka']}
        />
        <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 12, fontFamily: 'DM Sans, sans-serif' }} />
        <Bar dataKey="Açık" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
        <Bar dataKey="Kapalı" stackId="a" fill="#059669" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
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

// ── 7. FraudFunnel — Horizontal bar chart pipeline ────────────
const FUNNEL_COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#059669'];

function FraudFunnel({ data, loading }) {
  if (loading) return <Skeleton height={200} />;
  if (!data) return null;

  const chartData = [
    { name: 'Toplam İşlem', value: data.totalTransactions },
    { name: 'İşaretli', value: data.markedTransactions },
    { name: 'Vakaya Atanmış', value: data.caseAssigned },
    { name: 'Kapatılmış', value: data.closedCases },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 40, left: 90, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #E2E8F0)" horizontal={false} />
        <XAxis type="number" tick={tickStyle} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" tick={tickStyle} axisLine={false} tickLine={false} width={88} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} formatter={(v) => [v, 'Adet']} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
          {chartData.map((_, i) => <Cell key={i} fill={FUNNEL_COLORS[i]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

const Charts = { TrendLine, SeverityDonut, DomainHeatmap, AmountTrends, RiskScoreDistribution, AnalystPerformance, FraudFunnel };
export default Charts;
