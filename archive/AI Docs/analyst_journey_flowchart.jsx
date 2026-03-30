import { useState, useCallback, useRef, useEffect } from "react";

// ── SCM Analyst Journey — Case-Centric Model ────────────────────────
// Cases arrive pre-created from SFD. No standalone Alert triage.
// Analyst entry: Dashboard → Case List → Case Detail (alerts inside case)

const LANES = {
  AUTH: { label: "Authentication", accent: "#e94560", bg: "rgba(233,69,96,0.06)" },
  DASH: { label: "Dashboard & Case List", accent: "#0f3460", bg: "rgba(15,52,96,0.06)" },
  CASE_DETAIL: { label: "Case Detail — Investigation Workspace", accent: "#2d6a4f", bg: "rgba(45,106,79,0.06)" },
  MAKER_CHECKER: { label: "Maker-Checker Approval Flow", accent: "#c9184a", bg: "rgba(201,24,74,0.06)" },
};

const nodes = [
  // ── AUTH ──
  { id: "S-001", label: "System Entry", desc: "User navigates to SCM URL", screen: "Login Page", lane: "AUTH", type: "start", col: 0, row: 0 },
  { id: "D-001", label: "Auth Mode?", desc: "System checks ldap_only_mode setting", screen: "Login Page", lane: "AUTH", type: "decision", col: 1, row: 0 },
  { id: "P-001", label: "LDAP Login", desc: "User authenticates via LDAP directory credentials", screen: "Login Page", lane: "AUTH", type: "process", col: 2, row: -0.6 },
  { id: "P-002", label: "OIDC / KeyCloak Login", desc: "User authenticates via KeyCloak OIDC flow (local or LDAP-backed)", screen: "Login Page", lane: "AUTH", type: "process", col: 2, row: 0.6 },
  { id: "D-002", label: "Auth Valid?", desc: "Backend validates token, checks domain & role claims", screen: "Login Page", lane: "AUTH", type: "decision", col: 3, row: 0 },
  { id: "P-003", label: "Show Error & Retry", desc: "Display invalid credentials or account-pending message", screen: "Login Page", lane: "AUTH", type: "error", col: 3.8, row: -0.9 },
  { id: "P-004", label: "Load User Context", desc: "Fetch user roles, domains, preferences. Set session.", screen: "\u2014", lane: "AUTH", type: "process", col: 4.2, row: 0 },

  // ── DASHBOARD & CASE LIST ──
  { id: "P-005", label: "Dashboard", desc: "Summary: My Open Cases count, Pending Approvals (if M-C ON), SLA warnings, quick-nav cards", screen: "Dashboard", lane: "DASH", type: "screen", col: 0, row: 0 },
  { id: "P-010", label: "Case List", desc: "Open/Closed tabs. Filter by status, owner, domain, severity, date. Default: \u2018My Cases\u2019. Cases arrive from SFD \u2014 analysts do NOT create cases.", screen: "Case List", lane: "DASH", type: "screen", col: 1.5, row: 0 },
  { id: "P-SFD", label: "SFD \u2192 CDC/Kafka", desc: "Upstream SFD system confirms fraud/high-fraud alerts and pushes pre-built cases with linked alerts into SCM automatically.", screen: "External (SFD Pipeline)", lane: "DASH", type: "external", col: 1.5, row: -0.9 },
  { id: "P-011", label: "Select a Case", desc: "Click case row to open Case Detail. Only own cases editable (Analyst role).", screen: "Case List", lane: "DASH", type: "process", col: 3, row: 0 },

  // ── CASE DETAIL ──
  { id: "P-012", label: "Case Detail \u2014 Overview", desc: "Header: ID, Name, Status, Owner, Severity, Domain. Tab navigation below.", screen: "Case Detail", lane: "CASE_DETAIL", type: "screen", col: 0, row: 0 },
  { id: "D-006", label: "Investigation Tab?", desc: "Analyst chooses which tab to work in", screen: "Case Detail", lane: "CASE_DETAIL", type: "decision", col: 1.2, row: 0 },
  { id: "P-013", label: "Tab: Alerts", desc: "View all alerts linked to this case. Drill into each alert: triggered rules, contributing objects, associated transactions (UC-011).", screen: "Case Detail \u2192 Alerts", lane: "CASE_DETAIL", type: "tab", col: 2.5, row: -2.2 },
  { id: "P-014", label: "Tab: Transactions", desc: "View transactions linked via the case\u2019s alerts. Mark/unmark as fraud (amounts split: total, bank, customer).", screen: "Case Detail \u2192 Transactions", lane: "CASE_DETAIL", type: "tab", col: 2.5, row: -1.1 },
  { id: "P-015", label: "Tab: Related Entities", desc: "Customer, Debit Card, Credit Card, Account details from FDM read-only.", screen: "Case Detail \u2192 Entities", lane: "CASE_DETAIL", type: "tab", col: 2.5, row: 0 },
  { id: "P-016", label: "Tab: Comments", desc: "Add threaded investigation notes. Visible to Reviewer/Manager.", screen: "Case Detail \u2192 Comments", lane: "CASE_DETAIL", type: "tab", col: 2.5, row: 1.1 },
  { id: "P-017", label: "Tab: Attachments", desc: "Upload supporting docs (screenshots, correspondence). Max 25MB per file.", screen: "Case Detail \u2192 Attachments", lane: "CASE_DETAIL", type: "tab", col: 2.5, row: 2.2 },
  { id: "P-018", label: "Tab: History", desc: "Immutable audit log. All actions with before/after values.", screen: "Case Detail \u2192 History", lane: "CASE_DETAIL", type: "tab", col: 2.5, row: 3.3 },
  { id: "P-020", label: "Drill: Rules & Objects", desc: "Within Alerts tab, drill into each alert\u2019s triggered rules and contributing objects. Include/exclude from investigation scope. (UC-011)", screen: "Case Detail \u2192 Alerts \u2192 Rule Detail", lane: "CASE_DETAIL", type: "action", col: 4, row: -2.2 },
  { id: "P-019", label: "Mark Transaction as Fraud", desc: "Enter total_fraud_amount, bank_fraud_amount, customer_fraud_amount", screen: "Case Detail \u2192 Transactions", lane: "CASE_DETAIL", type: "action", col: 4, row: -1.1 },
  { id: "D-007", label: "Continue or Close?", desc: "Analyst decides to keep investigating or finalize", screen: "Case Detail", lane: "CASE_DETAIL", type: "decision", col: 4, row: 0.6 },
  { id: "P-021", label: "Select Disposition", desc: "Choose: confirmed_fraud, cleared, suspicious, referred_to_LE", screen: "Case Detail \u2192 Close Dialog", lane: "CASE_DETAIL", type: "process", col: 5.2, row: 0.6 },

  // ── MAKER-CHECKER ──
  { id: "D-008", label: "Maker-Checker ON?", desc: "System checks maker_checker_enabled setting", screen: "\u2014", lane: "MAKER_CHECKER", type: "decision", col: 0, row: 0 },
  { id: "P-022", label: "Case \u2192 CLOSED", desc: "Immediate closure. Disposition propagates to linked alerts.", screen: "Case Detail", lane: "MAKER_CHECKER", type: "end-success", col: 1.5, row: -0.7 },
  { id: "P-023", label: "Case \u2192 PENDING_CLOSURE", desc: "Closure request created (Approval_Request table). Analyst notified to wait.", screen: "Case Detail", lane: "MAKER_CHECKER", type: "pending", col: 1.5, row: 0.7 },
  { id: "P-024", label: "2nd User: Review Closure", desc: "Different analyst/reviewer/manager sees pending request in their queue", screen: "Dashboard / Approvals Queue", lane: "MAKER_CHECKER", type: "screen", col: 3, row: 0.7 },
  { id: "D-009", label: "Approve or Reject?", desc: "Checker reviews disposition, evidence, comments", screen: "Approval Detail", lane: "MAKER_CHECKER", type: "decision", col: 4.2, row: 0.7 },
  { id: "P-025", label: "Approved \u2192 CLOSED", desc: "Case finalized. Both users logged in audit trail.", screen: "\u2014", lane: "MAKER_CHECKER", type: "end-success", col: 5.5, row: 0.2 },
  { id: "P-026", label: "Rejected \u2192 Back to OPEN", desc: "Case reverts. Analyst notified with rejection reason.", screen: "\u2014", lane: "MAKER_CHECKER", type: "error", col: 5.5, row: 1.2 },
];

const edges = [
  { from: "S-001", to: "D-001" },
  { from: "D-001", to: "P-001", label: "LDAP-Only ON" },
  { from: "D-001", to: "P-002", label: "LDAP-Only OFF" },
  { from: "P-001", to: "D-002" },
  { from: "P-002", to: "D-002" },
  { from: "D-002", to: "P-003", label: "No" },
  { from: "D-002", to: "P-004", label: "Yes" },
  { from: "P-003", to: "S-001", label: "Retry" },
  { from: "P-004", to: "P-005" },
  { from: "P-005", to: "P-010", label: "View Cases" },
  { from: "P-SFD", to: "P-010", label: "Auto-push cases" },
  { from: "P-010", to: "P-011" },
  { from: "P-011", to: "P-012" },
  { from: "P-012", to: "D-006" },
  { from: "D-006", to: "P-013", label: "Alerts" },
  { from: "D-006", to: "P-014", label: "Transactions" },
  { from: "D-006", to: "P-015", label: "Entities" },
  { from: "D-006", to: "P-016", label: "Comments" },
  { from: "D-006", to: "P-017", label: "Attachments" },
  { from: "D-006", to: "P-018", label: "History" },
  { from: "P-013", to: "P-020", label: "Drill into alert" },
  { from: "P-014", to: "P-019", label: "Mark fraud" },
  { from: "P-020", to: "D-007", label: "Done" },
  { from: "P-019", to: "D-007", label: "Done" },
  { from: "P-015", to: "D-007", label: "Done" },
  { from: "P-016", to: "D-007", label: "Done" },
  { from: "P-017", to: "D-007", label: "Done" },
  { from: "P-018", to: "D-007", label: "Done" },
  { from: "D-007", to: "D-006", label: "Continue" },
  { from: "D-007", to: "P-021", label: "Close Case" },
  { from: "P-021", to: "D-008" },
  { from: "D-008", to: "P-022", label: "OFF" },
  { from: "D-008", to: "P-023", label: "ON" },
  { from: "P-023", to: "P-024" },
  { from: "P-024", to: "D-009" },
  { from: "D-009", to: "P-025", label: "Approve" },
  { from: "D-009", to: "P-026", label: "Reject" },
  { from: "P-026", to: "P-012", label: "Analyst re-opens" },
];

const NODE_W = 180, NODE_H = 64, COL_GAP = 220, ROW_GAP = 100, LANE_PAD_X = 40, LANE_PAD_Y = 30, LANE_GAP = 28;
const LANE_ORDER = ["AUTH", "DASH", "CASE_DETAIL", "MAKER_CHECKER"];

function computeLayout() {
  const laneNodes = {};
  LANE_ORDER.forEach(l => (laneNodes[l] = []));
  nodes.forEach(n => laneNodes[n.lane]?.push(n));
  const laneYStart = {};
  let runningY = 20;
  LANE_ORDER.forEach(laneKey => {
    const lns = laneNodes[laneKey];
    if (!lns.length) return;
    const minRow = Math.min(...lns.map(n => n.row));
    const maxRow = Math.max(...lns.map(n => n.row));
    const laneHeight = (maxRow - minRow + 1) * ROW_GAP + LANE_PAD_Y * 2 + NODE_H;
    laneYStart[laneKey] = { top: runningY, minRow, height: laneHeight };
    runningY += laneHeight + LANE_GAP;
  });
  const positions = {};
  nodes.forEach(n => {
    const ls = laneYStart[n.lane];
    if (!ls) return;
    positions[n.id] = {
      x: LANE_PAD_X + 60 + n.col * COL_GAP,
      y: ls.top + LANE_PAD_Y + 20 + (n.row - ls.minRow) * ROW_GAP,
      cx: LANE_PAD_X + 60 + n.col * COL_GAP + NODE_W / 2,
      cy: ls.top + LANE_PAD_Y + 20 + (n.row - ls.minRow) * ROW_GAP + NODE_H / 2,
    };
  });
  const maxCol = Math.max(...nodes.map(n => n.col));
  return { positions, laneYStart, totalW: LANE_PAD_X + 60 + (maxCol + 1) * COL_GAP + NODE_W + 80, totalH: runningY + 20 };
}
const layout = computeLayout();

const TYPE_STYLES = {
  start: { fill: "#0f172a", stroke: "#38bdf8", text: "#e0f2fe", icon: "\u25B6" },
  process: { fill: "#1e293b", stroke: "#64748b", text: "#e2e8f0", icon: "" },
  screen: { fill: "#172554", stroke: "#3b82f6", text: "#dbeafe", icon: "\uD83D\uDDA5" },
  decision: { fill: "#1c1917", stroke: "#f59e0b", text: "#fef3c7", icon: "\u25C6" },
  tab: { fill: "#14352a", stroke: "#34d399", text: "#d1fae5", icon: "" },
  action: { fill: "#1e1b4b", stroke: "#818cf8", text: "#e0e7ff", icon: "\u26A1" },
  error: { fill: "#2d0a0a", stroke: "#ef4444", text: "#fecaca", icon: "\u2715" },
  pending: { fill: "#2d1b00", stroke: "#f59e0b", text: "#fef3c7", icon: "\u23F3" },
  "end-success": { fill: "#052e16", stroke: "#22c55e", text: "#bbf7d0", icon: "\u2713" },
  external: { fill: "#1a0a2e", stroke: "#a78bfa", text: "#ede9fe", icon: "\u2601" },
};

function pathBetween(fp, tp) {
  let sx = fp.cx, sy = fp.cy, ex = tp.cx, ey = tp.cy;
  const dx = ex - sx, dy = ey - sy;
  if (Math.abs(dx) > Math.abs(dy)) { sx += dx > 0 ? NODE_W/2 : -NODE_W/2; ex += dx > 0 ? -NODE_W/2 : NODE_W/2; }
  else { sy += dy > 0 ? NODE_H/2 : -NODE_H/2; ey += dy > 0 ? -NODE_H/2 : NODE_H/2; }
  const mx = (sx+ex)/2, my = (sy+ey)/2;
  if (Math.abs(dx) > Math.abs(dy)*1.5) return `M${sx},${sy} C${mx},${sy} ${mx},${ey} ${ex},${ey}`;
  if (Math.abs(dy) > Math.abs(dx)*1.5) return `M${sx},${sy} C${sx},${my} ${ex},${my} ${ex},${ey}`;
  return `M${sx},${sy} Q${sx},${ey} ${ex},${ey}`;
}

export default function AnalystJourneyFlowchart() {
  const [selected, setSelected] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [zoom, setZoom] = useState(0.78);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  const selectedNode = nodes.find(n => n.id === selected);
  const connEdges = selected ? edges.filter(e => e.from === selected || e.to === selected) : [];
  const connIds = new Set(connEdges.flatMap(e => [e.from, e.to]));

  const onMD = useCallback(e => { if (e.target.closest('.nb')) return; setIsPanning(true); setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y }); }, [pan]);
  const onMM = useCallback(e => { if (!isPanning) return; setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y }); }, [isPanning, panStart]);
  const onMU = useCallback(() => setIsPanning(false), []);
  useEffect(() => { window.addEventListener('mousemove', onMM); window.addEventListener('mouseup', onMU); return () => { window.removeEventListener('mousemove', onMM); window.removeEventListener('mouseup', onMU); }; }, [onMM, onMU]);

  const bs = { background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 14, fontFamily: "inherit", fontWeight: 700 };

  return (
    <div style={{ width: "100%", height: "100vh", background: "#0a0a0f", fontFamily: "'JetBrains Mono','SF Mono','Fira Code',monospace", color: "#e2e8f0", overflow: "hidden", position: "relative" }}>
      {/* Header */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 20, background: "linear-gradient(180deg,#0a0a0f 60%,transparent)", padding: "16px 24px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#64748b", marginBottom: 4 }}>SCM \u00B7 Case-Centric Model \u00B7 Fraud Analyst Journey</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, background: "linear-gradient(135deg,#e2e8f0,#94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MVP UI/UX Workflow \u2014 Analyst Role</h1>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>Cases arrive from SFD (upstream) \u2014 No standalone alert triage \u00B7 Click node for details \u00B7 Drag to pan \u00B7 Scroll to zoom</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => setZoom(z => Math.max(0.3, z-0.1))} style={bs}>\u2212</button>
            <span style={{ fontSize: 11, color: "#64748b", minWidth: 36, textAlign: "center" }}>{Math.round(zoom*100)}%</span>
            <button onClick={() => setZoom(z => Math.min(2, z+0.1))} style={bs}>+</button>
            <button onClick={() => { setZoom(0.78); setPan({x:0,y:0}); }} style={{...bs, fontSize:10, padding:"4px 10px"}}>Reset</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
          {[["Screen","screen"],["Process","process"],["Decision","decision"],["Tab","tab"],["Action","action"],["External (SFD)","external"],["Success","end-success"],["Error/Reject","error"],["Pending","pending"]].map(([l,t]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: TYPE_STYLES[t].fill, border: `2px solid ${TYPE_STYLES[t].stroke}` }} />
              <span style={{ fontSize: 10, color: "#94a3b8" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG */}
      <div ref={svgRef} onMouseDown={onMD} onWheel={e => { e.preventDefault(); setZoom(z => Math.max(0.25, Math.min(2.5, z - e.deltaY*0.001))); }} style={{ width: "100%", height: "100%", cursor: isPanning ? "grabbing" : "grab", paddingTop: 140 }}>
        <svg width="100%" height="100%" viewBox={`${-pan.x/zoom} ${(-pan.y/zoom)-140/zoom} ${layout.totalW/zoom} ${layout.totalH/zoom}`} style={{ overflow: "visible" }}>
          <defs>
            <marker id="ar" viewBox="0 0 10 8" refX="9" refY="4" markerWidth="8" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,4 L0,8 Z" fill="#475569" /></marker>
            <marker id="arh" viewBox="0 0 10 8" refX="9" refY="4" markerWidth="8" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,4 L0,8 Z" fill="#f59e0b" /></marker>
            <filter id="gl"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>

          {LANE_ORDER.map(k => { const ls = layout.laneYStart[k]; if (!ls) return null; const ln = LANES[k]; return (<g key={k}><rect x={10} y={ls.top} width={layout.totalW-20} height={ls.height} rx={8} fill={ln.bg} stroke={ln.accent} strokeWidth={0.5} strokeOpacity={0.3} /><text x={24} y={ls.top+16} fontSize={10} fill={ln.accent} fontWeight={700} letterSpacing={1.5} fontFamily="inherit" opacity={0.8}>{ln.label.toUpperCase()}</text></g>); })}

          {edges.map((e, i) => {
            const fp = layout.positions[e.from], tp = layout.positions[e.to];
            if (!fp || !tp) return null;
            const hl = selected && (e.from === selected || e.to === selected);
            const d = pathBetween(fp, tp);
            const mx = (fp.cx+tp.cx)/2, my = (fp.cy+tp.cy)/2;
            return (
              <g key={i} onMouseEnter={() => setHoveredEdge(i)} onMouseLeave={() => setHoveredEdge(null)}>
                <path d={d} fill="none" stroke={hl ? "#f59e0b" : hoveredEdge===i ? "#94a3b8" : "#334155"} strokeWidth={hl ? 2 : 1.2} markerEnd={hl ? "url(#arh)" : "url(#ar)"} opacity={selected && !hl ? 0.15 : 1} strokeDasharray={(e.from==="P-026"&&e.to==="P-012")?"4,3":e.from==="P-SFD"?"6,3":"none"} />
                {e.label && (<g><rect x={mx-e.label.length*3.2-4} y={my-8} width={e.label.length*6.4+8} height={14} rx={3} fill="#0f172a" fillOpacity={0.9} /><text x={mx} y={my+2} textAnchor="middle" fontSize={8.5} fill={hl?"#fbbf24":"#94a3b8"} fontFamily="inherit" fontWeight={500}>{e.label}</text></g>)}
              </g>
            );
          })}

          {nodes.map(n => {
            const p = layout.positions[n.id]; if (!p) return null;
            const s = TYPE_STYLES[n.type] || TYPE_STYLES.process;
            const isSel = selected===n.id, isConn = selected && connIds.has(n.id), dim = selected && !isSel && !isConn;
            const isDash = n.type==="external" ? "4,2" : "none";
            return (
              <g key={n.id} className="nb" onClick={ev => { ev.stopPropagation(); setSelected(isSel?null:n.id); }} style={{ cursor: "pointer" }} opacity={dim?0.18:1} filter={isSel?"url(#gl)":"none"}>
                {isSel && <rect x={p.x-4} y={p.y-4} width={NODE_W+8} height={NODE_H+8} rx={8} fill="none" stroke={s.stroke} strokeWidth={1.5} strokeOpacity={0.4} />}
                {n.type==="decision" ? (<g><rect x={p.x} y={p.y} width={NODE_W} height={NODE_H} rx={4} fill={s.fill} stroke={s.stroke} strokeWidth={isSel?2:1.2} /><rect x={p.x} y={p.y} width={4} height={NODE_H} rx={2} fill={s.stroke} /></g>)
                : (<rect x={p.x} y={p.y} width={NODE_W} height={NODE_H} rx={6} fill={s.fill} stroke={s.stroke} strokeWidth={isSel?2:1} strokeDasharray={isDash} />)}
                <rect x={p.x+4} y={p.y+4} width={38} height={14} rx={3} fill={s.stroke} fillOpacity={0.2} />
                <text x={p.x+23} y={p.y+13} textAnchor="middle" fontSize={7.5} fill={s.stroke} fontFamily="inherit" fontWeight={700}>{n.id}</text>
                <text x={p.x+NODE_W/2} y={p.y+32} textAnchor="middle" fontSize={10} fill={s.text} fontFamily="inherit" fontWeight={600}>{n.label.length>24?n.label.slice(0,22)+"\u2026":n.label}</text>
                <text x={p.x+NODE_W/2} y={p.y+46} textAnchor="middle" fontSize={7} fill={s.stroke} fontFamily="inherit" opacity={0.7}>{n.screen.length>28?n.screen.slice(0,26)+"\u2026":n.screen}</text>
                {s.icon && <text x={p.x+NODE_W-14} y={p.y+14} fontSize={10} fill={s.stroke} opacity={0.6}>{s.icon}</text>}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Detail Panel */}
      {selectedNode && (
        <div style={{ position: "absolute", bottom: 16, left: 16, right: 16, maxWidth: 720, background: "linear-gradient(135deg,#0f172a,#1e293b)", border: "1px solid #334155", borderRadius: 12, padding: "16px 20px", zIndex: 30, boxShadow: "0 -8px 32px rgba(0,0,0,0.5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <span style={{ background: TYPE_STYLES[selectedNode.type]?.stroke||"#64748b", color: "#0a0a0f", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4 }}>{selectedNode.id}</span>
                <span style={{ background: "rgba(100,116,139,0.2)", color: "#94a3b8", fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: 1 }}>{selectedNode.type}</span>
                <span style={{ background: LANES[selectedNode.lane]?.accent+"22", color: LANES[selectedNode.lane]?.accent, fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 4 }}>{LANES[selectedNode.lane]?.label}</span>
              </div>
              <h3 style={{ margin: "4px 0 6px", fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>{selectedNode.label}</h3>
              <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{selectedNode.desc}</p>
              <div style={{ marginTop: 8, fontSize: 10, color: "#64748b" }}>
                <span style={{ color: "#475569" }}>Screen: </span><span style={{ color: "#cbd5e1" }}>{selectedNode.screen}</span>
                <span style={{ margin: "0 8px", color: "#334155" }}>|</span>
                <span style={{ color: "#475569" }}>Mock-up: </span><span style={{ color: "#f59e0b", fontStyle: "italic" }}>TBD \u2014 map to {selectedNode.id}</span>
              </div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "1px solid #334155", color: "#94a3b8", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>\u2715 Close</button>
          </div>
          {connEdges.length > 0 && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1e293b" }}>
              <div style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Connections</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {connEdges.map((e, i) => { const o = e.from===selected?e.to:e.from; const d = e.from===selected?"\u2192":"\u2190"; return (<span key={i} onClick={() => setSelected(o)} style={{ background: "rgba(51,65,85,0.5)", border: "1px solid #334155", borderRadius: 4, padding: "2px 8px", fontSize: 10, color: "#cbd5e1", cursor: "pointer" }}>{d} {o} {e.label?`(${e.label})`:""}</span>); })}
              </div>
            </div>
          )}
        </div>
      )}
      <div style={{ position: "absolute", bottom: selectedNode?160:16, right: 16, fontSize: 9, color: "#334155", zIndex: 10 }}>{nodes.length} nodes \u00B7 {edges.length} edges \u00B7 {LANE_ORDER.length} lanes \u00B7 Case-Centric (no alert triage)</div>
    </div>
  );
}
