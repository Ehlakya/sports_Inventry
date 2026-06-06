import React, { useMemo } from 'react';

// ─── SVG ICON RENDERERS ───────────────────────────────────────────────────────
const SportsSvg = ({ id, size }) => {
  const svgProps = {
    width: size,
    height: size,
    viewBox: '0 0 48 48',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    className: 'sports-svg-icon',
  };

  switch (id) {
    case 'football':
      return (
        <svg {...svgProps}>
          <circle cx="24" cy="24" r="21" strokeWidth="1.8" className="sports-stroke" />
          <polygon points="24,8 30,15 28,22 20,22 18,15" className="sports-fill" />
          <polygon points="37,20 42,27 36,33 29,30 29,22" className="sports-fill" />
          <polygon points="33,38 26,42 20,37 22,30 29,30" className="sports-fill" />
          <polygon points="14,38 8,33 10,25 18,22 22,30 20,37" className="sports-fill" />
          <polygon points="6,20 12,14 18,14 20,22 10,25" className="sports-fill" />
        </svg>
      );
    case 'basketball':
      return (
        <svg {...svgProps}>
          <circle cx="24" cy="24" r="21" strokeWidth="1.8" className="sports-stroke" />
          <line x1="3" y1="24" x2="45" y2="24" strokeWidth="1.3" className="sports-stroke" />
          <line x1="24" y1="3" x2="24" y2="45" strokeWidth="1.3" className="sports-stroke" />
          <path d="M8 8 Q24 18 8 40" strokeWidth="1.3" className="sports-stroke" />
          <path d="M40 8 Q24 18 40 40" strokeWidth="1.3" className="sports-stroke" />
        </svg>
      );
    case 'tennis':
      return (
        <svg {...svgProps}>
          <circle cx="24" cy="24" r="21" strokeWidth="1.8" className="sports-stroke" />
          <path d="M5 14 Q17 24 5 34" strokeWidth="2.2" className="sports-stroke" />
          <path d="M43 14 Q31 24 43 34" strokeWidth="2.2" className="sports-stroke" />
        </svg>
      );
    case 'cricket':
      return (
        <svg {...svgProps}>
          <circle cx="24" cy="24" r="21" strokeWidth="1.8" className="sports-stroke" />
          <path d="M24 3 Q35 12 35 24 Q35 36 24 45" strokeWidth="1.6" className="sports-stroke" />
          <path d="M24 3 Q13 12 13 24 Q13 36 24 45" strokeWidth="1.6" className="sports-stroke" />
          <path d="M18 11 l2 2 m-2 5 l2 2 m-2 5 l2 2 m-2 5 l2 2" strokeWidth="1" className="sports-stroke" />
          <path d="M28 11 l2 2 m-2 5 l2 2 m-2 5 l2 2 m-2 5 l2 2" strokeWidth="1" className="sports-stroke" />
        </svg>
      );
    case 'shuttle':
      return (
        <svg {...svgProps} viewBox="0 0 48 56">
          <ellipse cx="24" cy="46" rx="8" ry="5" strokeWidth="1.8" className="sports-stroke" />
          <path d="M16 46 L24 12 L32 46" strokeWidth="1.6" className="sports-stroke" />
          <path d="M18 36 Q24 32 30 36" strokeWidth="1.1" className="sports-stroke" />
          <path d="M17 27 Q24 22 31 27" strokeWidth="1.1" className="sports-stroke" />
          <path d="M19 19 Q24 15 29 19" strokeWidth="1.1" className="sports-stroke" />
          <circle cx="24" cy="46" r="3" strokeWidth="1.3" className="sports-stroke" />
        </svg>
      );
    case 'trophy':
      return (
        <svg {...svgProps}>
          <path d="M15 5 h18 v16 a9 9 0 0 1-18 0 Z" strokeWidth="1.8" className="sports-stroke" />
          <path d="M9 7 h6 v9 a5 5 0 0 1-6 0 Z" strokeWidth="1.3" className="sports-stroke" />
          <path d="M33 7 h6 v9 a5 5 0 0 1-6 0 Z" strokeWidth="1.3" className="sports-stroke" />
          <line x1="24" y1="30" x2="24" y2="39" strokeWidth="1.8" className="sports-stroke" />
          <path d="M13 39 h22 v5 H13 Z" strokeWidth="1.3" className="sports-stroke" />
        </svg>
      );
    case 'shoe':
      return (
        <svg {...svgProps} viewBox="0 0 64 40">
          <path d="M4 30 Q9 20 22 20 L44 20 Q57 20 60 28 L60 34 Q44 38 4 38 Z" strokeWidth="1.8" className="sports-stroke" />
          <path d="M22 20 L20 10 Q22 5 28 7 L40 20" strokeWidth="1.3" className="sports-stroke" />
          <path d="M28 13 l5-1 m-5 3.5 l6-1.2" strokeWidth="1" className="sports-stroke" />
        </svg>
      );
    case 'star':
      return (
        <svg {...svgProps}>
          <path d="M24 3 L27.5 16 L42 16 L30.5 25 L35 38 L24 30 L13 38 L17.5 25 L6 16 L20.5 16 Z" strokeWidth="1.8" className="sports-stroke" />
        </svg>
      );
    case 'dumbbell':
      return (
        <svg {...svgProps}>
          <rect x="6" y="18" width="8" height="12" rx="2" strokeWidth="1.8" className="sports-stroke" />
          <rect x="34" y="18" width="8" height="12" rx="2" strokeWidth="1.8" className="sports-stroke" />
          <line x1="14" y1="24" x2="34" y2="24" strokeWidth="2.5" className="sports-stroke" />
          <rect x="2" y="20" width="4" height="8" rx="1" strokeWidth="1.3" className="sports-stroke" />
          <rect x="42" y="20" width="4" height="8" rx="1" strokeWidth="1.3" className="sports-stroke" />
        </svg>
      );
    case 'medal':
      return (
        <svg {...svgProps}>
          <circle cx="24" cy="30" r="12" strokeWidth="1.8" className="sports-stroke" />
          <circle cx="24" cy="30" r="8" strokeWidth="1.2" className="sports-stroke" />
          <path d="M18 4 L20 18 M30 4 L28 18" strokeWidth="1.5" className="sports-stroke" />
          <path d="M16 4 h16" strokeWidth="1.3" className="sports-stroke" />
          <path d="M24 25 l2 3 h3 l-2.5 2 l1 3 L24 31 l-3.5 2 l1-3 L19 28 h3 Z" strokeWidth="0.8" className="sports-fill" />
        </svg>
      );
    case 'whistle':
      return (
        <svg {...svgProps}>
          <ellipse cx="30" cy="28" rx="14" ry="10" strokeWidth="1.8" className="sports-stroke" />
          <path d="M16 24 L8 16" strokeWidth="2" className="sports-stroke" />
          <circle cx="6" cy="14" r="3" strokeWidth="1.3" className="sports-stroke" />
          <line x1="38" y1="22" x2="38" y2="18" strokeWidth="2" className="sports-stroke" />
          <circle cx="38" cy="16" r="2" strokeWidth="1" className="sports-fill" />
        </svg>
      );
    case 'target':
      return (
        <svg {...svgProps}>
          <circle cx="24" cy="24" r="20" strokeWidth="1.5" className="sports-stroke" />
          <circle cx="24" cy="24" r="14" strokeWidth="1.3" className="sports-stroke" />
          <circle cx="24" cy="24" r="8" strokeWidth="1.3" className="sports-stroke" />
          <circle cx="24" cy="24" r="3" strokeWidth="1" className="sports-fill" />
        </svg>
      );
    case 'stopwatch':
      return (
        <svg {...svgProps}>
          <circle cx="24" cy="27" r="16" strokeWidth="1.8" className="sports-stroke" />
          <line x1="24" y1="27" x2="24" y2="18" strokeWidth="1.5" className="sports-stroke" />
          <line x1="24" y1="27" x2="31" y2="27" strokeWidth="1.3" className="sports-stroke" />
          <path d="M20 7 h8 M24 7 v4" strokeWidth="1.5" className="sports-stroke" />
          <path d="M36 14 l3-3" strokeWidth="1.3" className="sports-stroke" />
        </svg>
      );
    default:
      return null;
  }
};

// ─── ELEMENT CATALOG ──────────────────────────────────────────────────────────
const ICON_IDS = [
  'football', 'basketball', 'tennis', 'cricket', 'shuttle',
  'trophy', 'shoe', 'star', 'dumbbell', 'medal', 'whistle',
  'target', 'stopwatch'
];

// 30 sport icon positions spread across the viewport
const ICON_POSITIONS = [
  { el: 0,  x: 3,  y: 8,   size: 50, delay: '0s',   anim: 'float-1' },
  { el: 1,  x: 16, y: 72,  size: 58, delay: '2.3s', anim: 'float-2' },
  { el: 2,  x: 30, y: 22,  size: 42, delay: '1.1s', anim: 'float-3' },
  { el: 3,  x: 46, y: 58,  size: 54, delay: '3.7s', anim: 'float-4' },
  { el: 4,  x: 63, y: 12,  size: 46, delay: '0.8s', anim: 'float-5' },
  { el: 5,  x: 76, y: 78,  size: 62, delay: '4.2s', anim: 'float-6' },
  { el: 6,  x: 88, y: 38,  size: 50, delay: '2.0s', anim: 'float-7' },
  { el: 7,  x: 10, y: 48,  size: 38, delay: '5.1s', anim: 'float-8' },
  { el: 8,  x: 53, y: 86,  size: 44, delay: '1.8s', anim: 'float-9' },
  { el: 9,  x: 36, y: 43,  size: 36, delay: '3.2s', anim: 'float-10' },
  { el: 10, x: 70, y: 53,  size: 40, delay: '0.5s', anim: 'float-11' },
  { el: 11, x: 22, y: 86,  size: 48, delay: '6.0s', anim: 'float-12' },
  { el: 12, x: 82, y: 20,  size: 34, delay: '2.8s', anim: 'float-1' },
  { el: 0,  x: 6,  y: 33,  size: 42, delay: '4.5s', anim: 'float-3' },
  { el: 1,  x: 93, y: 63,  size: 38, delay: '1.5s', anim: 'float-5' },
  { el: 2,  x: 42, y: 6,   size: 32, delay: '3.0s', anim: 'float-7' },
  { el: 3,  x: 58, y: 35,  size: 30, delay: '7.2s', anim: 'float-9' },
  { el: 4,  x: 14, y: 18,  size: 36, delay: '0.3s', anim: 'float-11' },
  { el: 5,  x: 50, y: 72,  size: 44, delay: '5.5s', anim: 'float-2' },
  { el: 6,  x: 27, y: 55,  size: 28, delay: '2.6s', anim: 'float-4' },
  { el: 7,  x: 74, y: 8,   size: 34, delay: '8.0s', anim: 'float-6' },
  { el: 8,  x: 38, y: 92,  size: 40, delay: '1.2s', anim: 'float-8' },
  { el: 9,  x: 85, y: 48,  size: 32, delay: '4.8s', anim: 'float-10' },
  { el: 10, x: 60, y: 25,  size: 36, delay: '6.5s', anim: 'float-12' },
  { el: 11, x: 8,  y: 68,  size: 46, delay: '3.4s', anim: 'float-1' },
  { el: 12, x: 95, y: 85,  size: 30, delay: '7.8s', anim: 'float-3' },
  { el: 0,  x: 48, y: 48,  size: 26, delay: '9.0s', anim: 'float-5' },
  { el: 3,  x: 20, y: 3,   size: 34, delay: '5.8s', anim: 'float-7' },
  { el: 5,  x: 66, y: 42,  size: 30, delay: '4.0s', anim: 'float-9' },
  { el: 7,  x: 33, y: 68,  size: 32, delay: '6.8s', anim: 'float-11' },
];

// 24 floating particles (dots/rings)
const PARTICLES = [
  { x: 5,  y: 15, size: 6,  type: 'dot',  anim: 'particle-1',  delay: '0s' },
  { x: 12, y: 82, size: 8,  type: 'ring', anim: 'particle-2',  delay: '1s' },
  { x: 25, y: 40, size: 5,  type: 'dot',  anim: 'particle-3',  delay: '2s' },
  { x: 35, y: 10, size: 10, type: 'ring', anim: 'particle-4',  delay: '0.5s' },
  { x: 45, y: 65, size: 7,  type: 'dot',  anim: 'particle-5',  delay: '3s' },
  { x: 58, y: 30, size: 6,  type: 'ring', anim: 'particle-6',  delay: '1.5s' },
  { x: 68, y: 80, size: 9,  type: 'dot',  anim: 'particle-1',  delay: '4s' },
  { x: 78, y: 50, size: 5,  type: 'ring', anim: 'particle-2',  delay: '2.5s' },
  { x: 88, y: 20, size: 8,  type: 'dot',  anim: 'particle-3',  delay: '0.8s' },
  { x: 95, y: 75, size: 6,  type: 'ring', anim: 'particle-4',  delay: '3.5s' },
  { x: 15, y: 55, size: 7,  type: 'dot',  anim: 'particle-5',  delay: '5s' },
  { x: 40, y: 90, size: 5,  type: 'ring', anim: 'particle-6',  delay: '1.8s' },
  { x: 52, y: 18, size: 8,  type: 'dot',  anim: 'particle-1',  delay: '6s' },
  { x: 72, y: 42, size: 6,  type: 'ring', anim: 'particle-2',  delay: '2.2s' },
  { x: 3,  y: 92, size: 7,  type: 'dot',  anim: 'particle-3',  delay: '4.5s' },
  { x: 82, y: 68, size: 9,  type: 'ring', anim: 'particle-4',  delay: '7s' },
  { x: 30, y: 75, size: 5,  type: 'dot',  anim: 'particle-5',  delay: '3.8s' },
  { x: 60, y: 55, size: 6,  type: 'ring', anim: 'particle-6',  delay: '5.5s' },
  { x: 18, y: 28, size: 4,  type: 'dot',  anim: 'particle-1',  delay: '8s' },
  { x: 90, y: 10, size: 7,  type: 'ring', anim: 'particle-2',  delay: '1.2s' },
  { x: 48, y: 38, size: 5,  type: 'dot',  anim: 'particle-3',  delay: '6.5s' },
  { x: 65, y: 95, size: 8,  type: 'ring', anim: 'particle-4',  delay: '0.2s' },
  { x: 8,  y: 45, size: 6,  type: 'dot',  anim: 'particle-5',  delay: '9s' },
  { x: 55, y: 8,  size: 4,  type: 'ring', anim: 'particle-6',  delay: '7.5s' },
];

// Variant CSS class mapping
const VARIANT_CLASS = {
  customer: '',
  admin: 'sports-bg-admin',
  supplier: 'sports-bg-supplier',
};

const SportsBackground = ({ variant = 'customer' }) => {
  const variantClass = VARIANT_CLASS[variant] || '';

  return (
    <div
      className={`sports-bg-layer ${variantClass}`}
      aria-hidden="true"
      role="presentation"
    >
      {/* ── Animated gradient orbs ── */}
      <div className="sports-orb sports-orb-1" />
      <div className="sports-orb sports-orb-2" />
      <div className="sports-orb sports-orb-3" />

      {/* ── Geometric grid lines ── */}
      <div className="sports-grid-overlay" />

      {/* ── Floating sport icons ── */}
      {ICON_POSITIONS.map((pos, i) => (
        <div
          key={`icon-${i}`}
          className={`sports-bg-item ${pos.anim}`}
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            width: `${pos.size}px`,
            height: `${pos.size}px`,
            animationDelay: pos.delay,
          }}
        >
          <SportsSvg id={ICON_IDS[pos.el]} size={pos.size} />
        </div>
      ))}

      {/* ── Floating micro-particles ── */}
      {PARTICLES.map((p, i) => (
        <div
          key={`particle-${i}`}
          className={`sports-particle ${p.type === 'ring' ? 'sports-particle-ring' : 'sports-particle-dot'} ${p.anim}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: p.delay,
          }}
        />
      ))}

      {/* ── Diagonal speed lines ── */}
      <div className="sports-speed-lines">
        <div className="speed-line speed-line-1" />
        <div className="speed-line speed-line-2" />
        <div className="speed-line speed-line-3" />
        <div className="speed-line speed-line-4" />
        <div className="speed-line speed-line-5" />
        <div className="speed-line speed-line-6" />
      </div>
    </div>
  );
};

export default SportsBackground;
