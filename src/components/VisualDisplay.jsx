/**
 * SVG visual renderers for math problems.
 * Each visual type renders a clean, labelled diagram that IS the problem.
 */

const PURPLE = "#8B5CF6";
const ACCENT = "#F59E0B";   // amber — unknown / highlight
const WHITE  = "#E8EAFF";
const BLUE   = "#60A5FA";
const GREEN  = "#6BCB77";
const DIM    = "rgba(255,255,255,0.08)";

function Txt({ x, y, children, fill = WHITE, size = 13, anchor = "middle", weight = "bold", italic = false }) {
  return (
    <text
      x={x} y={y}
      textAnchor={anchor}
      fontSize={size}
      fill={fill}
      fontWeight={weight}
      fontStyle={italic ? "italic" : "normal"}
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      {children}
    </text>
  );
}

// ── Right Triangle ───────────────────────────────────────────────────
// sides: { a: bottom, b: left, c: hyp } — null means unknown (rendered as "x")
export function RightTriangle({ a, b, c, angleDeg, angleAt }) {
  // Vertices: right angle at bottom-left
  const P1 = [38, 142];   // bottom-left  (right angle)
  const P2 = [182, 142];  // bottom-right
  const P3 = [38, 26];    // top-left

  function label(v)  { return v === null ? "x" : String(v); }
  function color(v)  { return v === null ? ACCENT : WHITE; }

  // Hyp midpoint — offset outward
  const hmx = (P2[0] + P3[0]) / 2 + 20;
  const hmy = (P2[1] + P3[1]) / 2;

  return (
    <svg viewBox="0 0 220 170" className="problem-visual">
      {/* Triangle fill */}
      <polygon
        points={`${P1[0]},${P1[1]} ${P2[0]},${P2[1]} ${P3[0]},${P3[1]}`}
        fill="rgba(139,92,246,0.13)"
        stroke={PURPLE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Right-angle box */}
      <path
        d={`M ${P1[0]},${P1[1]-18} L ${P1[0]+18},${P1[1]-18} L ${P1[0]+18},${P1[1]}`}
        fill="none" stroke={PURPLE} strokeWidth="1.8"
      />

      {/* Optional angle arc at bottom-right */}
      {angleDeg && (
        <>
          <path
            d={`M ${P2[0]-30},${P2[1]} A 30,30 0 0,0 ${P2[0]-22},${P2[1]-22}`}
            fill="none" stroke={BLUE} strokeWidth="1.6"
          />
          <Txt x={P2[0]-42} y={P2[1]-14} fill={BLUE} size={11}>{angleDeg}°</Txt>
        </>
      )}

      {/* Side labels */}
      {/* a — bottom */}
      <Txt x={(P1[0]+P2[0])/2} y={P1[1]+18} fill={color(a)}>{label(a)}</Txt>
      {/* b — left vertical */}
      <Txt x={P1[0]-18} y={(P1[1]+P3[1])/2+5} fill={color(b)}>{label(b)}</Txt>
      {/* c — hypotenuse */}
      <Txt x={hmx} y={hmy} fill={color(c)}>{label(c)}</Txt>
    </svg>
  );
}

// ── Circle (basic — area or circumference) ────────────────────────────
export function CircleBasic({ radius, show }) {
  const cx = 105, cy = 95, r = 68;
  return (
    <svg viewBox="0 0 210 185" className="problem-visual">
      <circle cx={cx} cy={cy} r={r} fill="rgba(139,92,246,0.1)" stroke={PURPLE} strokeWidth="2.5" />
      {/* Center */}
      <circle cx={cx} cy={cy} r={3.5} fill={WHITE} />
      {/* Radius line */}
      <line x1={cx} y1={cy} x2={cx+r} y2={cy} stroke={WHITE} strokeWidth="2" strokeDasharray="6 3" />
      <Txt x={cx + r/2 + 2} y={cy - 11} fill={WHITE}>r = {radius}</Txt>
      {/* Formula hint */}
      {show === "circumference" && (
        <Txt x={cx} y={cy + r + 18} fill={ACCENT} size={11}>C = 2πr = {2*radius}π</Txt>
      )}
      {show === "area" && (
        <Txt x={cx} y={cy + r + 18} fill={ACCENT} size={11}>A = πr² = ?π</Txt>
      )}
    </svg>
  );
}

// ── Circle Arc ────────────────────────────────────────────────────────
export function CircleArc({ radius, angleDeg }) {
  const cx = 100, cy = 95, r = 65;
  const rad = (angleDeg * Math.PI) / 180;
  const ex = cx + r * Math.cos(rad);
  const ey = cy - r * Math.sin(rad);
  const large = angleDeg > 180 ? 1 : 0;

  // Midpoint of arc for label
  const midRad = rad / 2;
  const lx = cx + (r + 20) * Math.cos(midRad);
  const ly = cy - (r + 20) * Math.sin(midRad);

  return (
    <svg viewBox="0 0 210 190" className="problem-visual">
      {/* Full circle (dim) */}
      <circle cx={cx} cy={cy} r={r} fill="rgba(139,92,246,0.06)" stroke={PURPLE} strokeWidth="1.5" opacity="0.5" />
      {/* Highlighted arc */}
      <path
        d={`M ${cx+r},${cy} A ${r},${r} 0 ${large},0 ${ex},${ey}`}
        fill="none" stroke={ACCENT} strokeWidth="4.5" strokeLinecap="round"
      />
      {/* Center */}
      <circle cx={cx} cy={cy} r={3.5} fill={WHITE} />
      {/* Radius 1 */}
      <line x1={cx} y1={cy} x2={cx+r} y2={cy} stroke={WHITE} strokeWidth="1.8" strokeDasharray="5 3" />
      {/* Radius 2 */}
      <line x1={cx} y1={cy} x2={ex} y2={ey} stroke={WHITE} strokeWidth="1.8" strokeDasharray="5 3" />
      {/* Angle arc */}
      <path
        d={`M ${cx+22},${cy} A 22,22 0 ${large},0 ${cx+22*Math.cos(rad)},${cy-22*Math.sin(rad)}`}
        fill="none" stroke={PURPLE} strokeWidth="1.5"
      />
      {/* Labels */}
      <Txt x={cx + r + 14} y={cy + 5} fill={WHITE} anchor="start">r={radius}</Txt>
      <Txt x={cx + 34} y={cy - 10} fill={PURPLE} size={11}>{angleDeg}°</Txt>
      <Txt x={lx} y={ly} fill={ACCENT} size={12}>arc</Txt>
    </svg>
  );
}

// ── Circle Sector (shaded) ────────────────────────────────────────────
export function CircleSector({ radius, angleDeg }) {
  const cx = 100, cy = 95, r = 65;
  const rad = (angleDeg * Math.PI) / 180;
  const ex = cx + r * Math.cos(-rad);
  const ey = cy + r * Math.sin(-rad);
  const large = angleDeg > 180 ? 1 : 0;

  const midRad = rad / 2;
  const slx = cx + r * 0.55 * Math.cos(-midRad);
  const sly = cy + r * 0.55 * Math.sin(-midRad);

  return (
    <svg viewBox="0 0 210 190" className="problem-visual">
      {/* Full circle (dim) */}
      <circle cx={cx} cy={cy} r={r} fill="rgba(139,92,246,0.06)" stroke={PURPLE} strokeWidth="1.5" opacity="0.4" />
      {/* Sector fill */}
      <path
        d={`M ${cx},${cy} L ${cx+r},${cy} A ${r},${r} 0 ${large},1 ${ex},${ey} Z`}
        fill="rgba(245,158,11,0.22)"
        stroke={ACCENT}
        strokeWidth="2.2"
      />
      {/* Center */}
      <circle cx={cx} cy={cy} r={3.5} fill={WHITE} />
      {/* Angle indicator */}
      <path
        d={`M ${cx+24},${cy} A 24,24 0 ${large},1 ${cx+24*Math.cos(-rad)},${cy+24*Math.sin(-rad)}`}
        fill="none" stroke={PURPLE} strokeWidth="1.5"
      />
      {/* Labels */}
      <Txt x={cx + r + 12} y={cy + 5} fill={WHITE} anchor="start">r={radius}</Txt>
      <Txt x={cx + 36} y={cy + 20} fill={PURPLE} size={11}>{angleDeg}°</Txt>
      <Txt x={slx} y={sly} fill={ACCENT} size={12}>A = ?π</Txt>
    </svg>
  );
}

// ── Rectangle ─────────────────────────────────────────────────────────
export function Rectangle({ width, height, question }) {
  const rw = 150, rh = 90, rx = 30, ry = 38;
  return (
    <svg viewBox="0 0 210 168" className="problem-visual">
      <rect x={rx} y={ry} width={rw} height={rh}
        fill="rgba(139,92,246,0.12)" stroke={PURPLE} strokeWidth="2.5" strokeLinejoin="round"
      />
      {/* Width label (top, with arrows) */}
      <line x1={rx} y1={ry-8} x2={rx+rw} y2={ry-8} stroke={PURPLE} strokeWidth="1.2" markerEnd="url(#a)" markerStart="url(#a)" />
      <Txt x={rx + rw/2} y={ry - 14} fill={WHITE}>{width}</Txt>
      {/* Height label (right, with arrows) */}
      <line x1={rx+rw+8} y1={ry} x2={rx+rw+8} y2={ry+rh} stroke={PURPLE} strokeWidth="1.2" />
      <Txt x={rx + rw + 20} y={ry + rh/2 + 5} fill={WHITE} anchor="start">{height}</Txt>
      {/* Question label in center */}
      {question && <Txt x={rx+rw/2} y={ry+rh/2+6} fill={ACCENT} size={12}>{question}</Txt>}
    </svg>
  );
}

// ── Triangle (area — base + height) ──────────────────────────────────
export function TriangleArea({ base, height }) {
  const P1 = [28, 140], P2 = [182, 140], P3 = [82, 28];
  const hx = P3[0], hy1 = P3[1], hy2 = P1[1];
  return (
    <svg viewBox="0 0 210 168" className="problem-visual">
      <polygon points={`${P1[0]},${P1[1]} ${P2[0]},${P2[1]} ${P3[0]},${P3[1]}`}
        fill="rgba(139,92,246,0.12)" stroke={PURPLE} strokeWidth="2.5" strokeLinejoin="round"
      />
      {/* Height line */}
      <line x1={hx} y1={hy1} x2={hx} y2={hy2} stroke={BLUE} strokeWidth="1.8" strokeDasharray="6 4" />
      {/* Height right-angle marker */}
      <path d={`M ${hx},${hy2+16} L ${hx+16},${hy2+16} L ${hx+16},${hy2}`}
        fill="none" stroke={BLUE} strokeWidth="1.4"
      />
      {/* Labels */}
      <Txt x={(P1[0]+P2[0])/2} y={P1[1]+18} fill={WHITE}>b = {base}</Txt>
      <Txt x={hx + 22} y={(hy1+hy2)/2 + 5} fill={BLUE} anchor="start">h = {height}</Txt>
    </svg>
  );
}

// ── Parallelogram ─────────────────────────────────────────────────────
export function Parallelogram({ base, height }) {
  const P1 = [28, 140], P2 = [178, 140], P3 = [148, 36], P4 = [−2, 36];
  // Reposition so nothing goes offscreen
  const shift = 18;
  const pts = [
    [28, 140], [178, 140], [148, 36], [-2+shift*2, 36]
  ];
  const ptStr = pts.map(p => p.join(",")).join(" ");
  // Height from top-right to base
  const hx = pts[1][0], hy1 = pts[1][1], hy2 = pts[2][1];
  return (
    <svg viewBox="0 0 210 168" className="problem-visual">
      <polygon points={ptStr}
        fill="rgba(139,92,246,0.12)" stroke={PURPLE} strokeWidth="2.5" strokeLinejoin="round"
      />
      {/* Height line */}
      <line x1={hx} y1={hy1} x2={pts[2][0]} y2={hy2} stroke={BLUE} strokeWidth="1.8" strokeDasharray="6 4" />
      <path d={`M ${hx-16},${hy1} L ${hx-16},${hy1-16} L ${hx},${hy1-16}`}
        fill="none" stroke={BLUE} strokeWidth="1.4"
      />
      {/* Labels */}
      <Txt x={(pts[0][0]+pts[1][0])/2} y={pts[1][1]+18} fill={WHITE}>b = {base}</Txt>
      <Txt x={hx+14} y={(hy1+hy2)/2+5} fill={BLUE} anchor="start">h = {height}</Txt>
    </svg>
  );
}

// ── 3D Box ────────────────────────────────────────────────────────────
export function Box3D({ l, w, h }) {
  const ox = 52, oy = 120;
  const pw = 90, pd = 50, ph = 70;
  const dx = pd * 0.7, dy = pd * 0.5;

  // 8 vertices
  const BL = [ox, oy];
  const BR = [ox+pw, oy];
  const TL = [ox, oy-ph];
  const TR = [ox+pw, oy-ph];
  const BLb = [ox+dx, oy-dy];
  const BRb = [ox+pw+dx, oy-dy];
  const TLb = [ox+dx, oy-ph-dy];
  const TRb = [ox+pw+dx, oy-ph-dy];

  function p(pts) { return pts.map(v=>v.join(",")).join(" "); }

  return (
    <svg viewBox="0 0 210 165" className="problem-visual">
      {/* Back edges (dim) */}
      <polyline points={p([TLb,TRb,BRb,BLb,TLb])} fill="none" stroke={PURPLE} strokeWidth="1" opacity="0.35" />
      <line x1={TLb[0]} y1={TLb[1]} x2={TL[0]} y2={TL[1]} stroke={PURPLE} strokeWidth="1" opacity="0.35" />
      <line x1={BLb[0]} y1={BLb[1]} x2={BL[0]} y2={BL[1]} stroke={PURPLE} strokeWidth="1" opacity="0.35" />

      {/* Front face */}
      <polygon points={p([BL,BR,TR,TL])} fill="rgba(139,92,246,0.18)" stroke={PURPLE} strokeWidth="2.2" />
      {/* Top face */}
      <polygon points={p([TL,TR,TRb,TLb])} fill="rgba(139,92,246,0.28)" stroke={PURPLE} strokeWidth="2.2" />
      {/* Right face */}
      <polygon points={p([BR,BRb,TRb,TR])} fill="rgba(139,92,246,0.10)" stroke={PURPLE} strokeWidth="2.2" />

      {/* Dimension labels */}
      <Txt x={(BL[0]+BR[0])/2} y={BL[1]+16} fill={WHITE}>l = {l}</Txt>
      <Txt x={TR[0]+6} y={(TR[1]+TRb[1])/2+5} fill={WHITE} anchor="start">w = {w}</Txt>
      <Txt x={BL[0]-14} y={(BL[1]+TL[1])/2+5} fill={WHITE} anchor="end">h = {h}</Txt>
    </svg>
  );
}

// ── Number Line ───────────────────────────────────────────────────────
export function NumberLine({ min, max, point, direction, strict }) {
  const lx = 22, rx = 188, y = 72;
  const range = max - min;
  const toX = (v) => lx + ((v - min) / range) * (rx - lx);
  const px = toX(point);

  const ticks = [];
  for (let i = Math.ceil(min); i <= max; i++) ticks.push(i);

  return (
    <svg viewBox="0 0 210 115" className="problem-visual">
      {/* Shading */}
      {direction === "right" && (
        <rect x={px} y={y-10} width={rx-px} height={20} fill="rgba(245,158,11,0.22)" rx="4" />
      )}
      {direction === "left" && (
        <rect x={lx} y={y-10} width={px-lx} height={20} fill="rgba(245,158,11,0.22)" rx="4" />
      )}
      {/* Axis */}
      <line x1={lx} y1={y} x2={rx} y2={y} stroke={WHITE} strokeWidth="2.2" />
      {/* Arrowheads */}
      <polygon points={`${rx+9},${y} ${rx},${y-5} ${rx},${y+5}`} fill={WHITE} />
      <polygon points={`${lx-9},${y} ${lx},${y-5} ${lx},${y+5}`} fill={WHITE} />
      {/* Ticks */}
      {ticks.map(t => (
        <g key={t}>
          <line x1={toX(t)} y1={y-6} x2={toX(t)} y2={y+6} stroke={WHITE} strokeWidth="1.5" />
          <Txt x={toX(t)} y={y+20} fill={WHITE} size={10}>{t}</Txt>
        </g>
      ))}
      {/* Boundary circle */}
      <circle cx={px} cy={y} r={7.5}
        fill={strict ? "#1a1a2e" : ACCENT}
        stroke={ACCENT} strokeWidth="2.5"
      />
      {/* Direction arrow */}
      {direction === "right" && (
        <polygon points={`${Math.min(px+45,rx-4)},${y} ${Math.min(px+35,rx-14)},${y-6} ${Math.min(px+35,rx-14)},${y+6}`} fill={ACCENT} />
      )}
      {direction === "left" && (
        <polygon points={`${Math.max(px-45,lx+4)},${y} ${Math.max(px-35,lx+14)},${y-6} ${Math.max(px-35,lx+14)},${y+6}`} fill={ACCENT} />
      )}
    </svg>
  );
}

// ── Coordinate Plane (two points + line) ─────────────────────────────
export function CoordinatePlane({ x1, y1, x2, y2 }) {
  const sc = 22, cx = 105, cy = 90;
  const toSvg = (x, y) => [cx + x * sc, cy - y * sc];
  const [sx1, sy1] = toSvg(x1, y1);
  const [sx2, sy2] = toSvg(x2, y2);
  const gridRange = 4;

  return (
    <svg viewBox="0 0 210 180" className="problem-visual">
      {/* Grid */}
      {Array.from({length: 2*gridRange+1}, (_,i)=>i-gridRange).map(i=>(
        <g key={i}>
          <line x1={cx+i*sc} y1={cy-gridRange*sc} x2={cx+i*sc} y2={cy+gridRange*sc} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1={cx-gridRange*sc} y1={cy-i*sc} x2={cx+gridRange*sc} y2={cy-i*sc} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        </g>
      ))}
      {/* Axes */}
      <line x1={cx-gridRange*sc} y1={cy} x2={cx+gridRange*sc} y2={cy} stroke={WHITE} strokeWidth="1.8" />
      <line x1={cx} y1={cy-gridRange*sc} x2={cx} y2={cy+gridRange*sc} stroke={WHITE} strokeWidth="1.8" />
      {/* Axis arrows */}
      <polygon points={`${cx+gridRange*sc+8},${cy} ${cx+gridRange*sc},${cy-5} ${cx+gridRange*sc},${cy+5}`} fill={WHITE} />
      <polygon points={`${cx},${cy-gridRange*sc-8} ${cx-5},${cy-gridRange*sc} ${cx+5},${cy-gridRange*sc}`} fill={WHITE} />
      {/* Axis labels */}
      <Txt x={cx+gridRange*sc+12} y={cy+4} fill={WHITE} size={11} anchor="start">x</Txt>
      <Txt x={cx+6} y={cy-gridRange*sc-10} fill={WHITE} size={11}>y</Txt>
      {/* Tick labels */}
      {[-3,-2,-1,1,2,3].map(i=>(
        <g key={i}>
          <Txt x={cx+i*sc} y={cy+14} fill="rgba(255,255,255,0.5)" size={9}>{i}</Txt>
          <Txt x={cx-12} y={cy-i*sc+4} fill="rgba(255,255,255,0.5)" size={9}>{i}</Txt>
        </g>
      ))}
      {/* Connecting line */}
      <line x1={sx1} y1={sy1} x2={sx2} y2={sy2} stroke={ACCENT} strokeWidth="2.2" />
      {/* Points */}
      <circle cx={sx1} cy={sy1} r={5.5} fill={BLUE} stroke={WHITE} strokeWidth="1.8" />
      <circle cx={sx2} cy={sy2} r={5.5} fill={BLUE} stroke={WHITE} strokeWidth="1.8" />
      {/* Point labels */}
      <Txt x={sx1} y={sy1-12} fill={WHITE} size={10}>({x1},{y1})</Txt>
      <Txt x={sx2} y={sy2-12} fill={WHITE} size={10}>({x2},{y2})</Txt>
    </svg>
  );
}

// ── Triangle Angles ───────────────────────────────────────────────────
export function TriangleAngles({ a, b, c }) {
  const P1 = [28, 148], P2 = [186, 148], P3 = [104, 26];
  const cols = [a,b,c].map(v => v === null ? ACCENT : WHITE);
  const labs = [a,b,c].map(v => v === null ? "x°" : `${v}°`);

  return (
    <svg viewBox="0 0 214 175" className="problem-visual">
      <polygon points={`${P1[0]},${P1[1]} ${P2[0]},${P2[1]} ${P3[0]},${P3[1]}`}
        fill="rgba(139,92,246,0.12)" stroke={PURPLE} strokeWidth="2.5" strokeLinejoin="round"
      />
      {/* Angle arcs */}
      <path d={`M ${P1[0]+24},${P1[1]} A 24,24 0 0,0 ${P1[0]+18},${P1[1]-18}`} fill="none" stroke={cols[0]} strokeWidth="1.8" />
      <path d={`M ${P2[0]-24},${P2[1]} A 24,24 0 0,1 ${P2[0]-18},${P2[1]-18}`} fill="none" stroke={cols[1]} strokeWidth="1.8" />
      <path d={`M ${P3[0]-16},${P3[1]+22} A 22,22 0 0,1 ${P3[0]+16},${P3[1]+22}`} fill="none" stroke={cols[2]} strokeWidth="1.8" />
      {/* Labels */}
      <Txt x={P1[0]+36} y={P1[1]-8} fill={cols[0]} anchor="start" size={12}>{labs[0]}</Txt>
      <Txt x={P2[0]-36} y={P2[1]-8} fill={cols[1]} anchor="end" size={12}>{labs[1]}</Txt>
      <Txt x={P3[0]} y={P3[1]-14} fill={cols[2]} size={12}>{labs[2]}</Txt>
      {/* Sum label */}
      <Txt x={107} y={170} fill="rgba(255,255,255,0.4)" size={10}>angles sum to 180°</Txt>
    </svg>
  );
}

// ── Fraction Bar ──────────────────────────────────────────────────────
export function FractionBar({ numerator, denominator }) {
  const totalW = 170, barH = 42, x0 = 20, y0 = 60;
  const cellW = totalW / denominator;
  return (
    <svg viewBox="0 0 210 140" className="problem-visual">
      {Array.from({length: denominator}, (_,i) => (
        <rect key={i}
          x={x0 + i * cellW} y={y0}
          width={cellW - 1} height={barH}
          fill={i < numerator ? "rgba(245,158,11,0.4)" : "rgba(139,92,246,0.1)"}
          stroke={PURPLE} strokeWidth="1.8" rx="2"
        />
      ))}
      <Txt x={105} y={y0 + barH + 22} fill={WHITE}>{numerator}/{denominator}</Txt>
    </svg>
  );
}

// ── Fraction Circle ───────────────────────────────────────────────────
export function FractionCircle({ numerator, denominator }) {
  const cx = 105, cy = 88, r = 65;
  const step = (2 * Math.PI) / denominator;

  const slices = Array.from({length: denominator}, (_, i) => {
    const s = i * step - Math.PI / 2;
    const e = s + step;
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
    const large = step > Math.PI ? 1 : 0;
    return { s, e, x1, y1, x2, y2, large, filled: i < numerator };
  });

  return (
    <svg viewBox="0 0 210 178" className="problem-visual">
      {slices.map((sl, i) => (
        <path key={i}
          d={`M ${cx},${cy} L ${sl.x1},${sl.y1} A ${r},${r} 0 ${sl.large},1 ${sl.x2},${sl.y2} Z`}
          fill={sl.filled ? "rgba(245,158,11,0.38)" : "rgba(139,92,246,0.1)"}
          stroke={PURPLE} strokeWidth="2"
        />
      ))}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={PURPLE} strokeWidth="2.5" />
      <Txt x={cx} y={cy + r + 22} fill={WHITE}>{numerator}/{denominator}</Txt>
    </svg>
  );
}

// ── Master router ─────────────────────────────────────────────────────
export default function VisualDisplay({ visual }) {
  if (!visual) return null;
  switch (visual.type) {
    case "right_triangle":   return <RightTriangle {...visual} />;
    case "circle":           return <CircleBasic   {...visual} />;
    case "circle_arc":       return <CircleArc     {...visual} />;
    case "circle_sector":    return <CircleSector  {...visual} />;
    case "rectangle":        return <Rectangle     {...visual} />;
    case "triangle_area":    return <TriangleArea  {...visual} />;
    case "parallelogram":    return <Parallelogram  {...visual} />;
    case "box_3d":           return <Box3D         {...visual} />;
    case "number_line":      return <NumberLine    {...visual} />;
    case "coordinate_plane": return <CoordinatePlane {...visual} />;
    case "triangle_angles":  return <TriangleAngles {...visual} />;
    case "fraction_bar":     return <FractionBar   {...visual} />;
    case "fraction_circle":  return <FractionCircle {...visual} />;
    default: return null;
  }
}
