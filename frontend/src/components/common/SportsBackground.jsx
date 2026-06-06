import React from 'react';

// All SVG paths as data URIs — zero external requests, zero dependencies
// Each element floats independently with its own timing function

const SPORTS_ELEMENTS = [
  // Football / Soccer ball
  {
    id: 'football',
    svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><circle cx='24' cy='24' r='22' fill='none' stroke='%23current' stroke-width='2'/><path d='M24 2a22 22 0 0 1 0 44A22 22 0 0 1 24 2z' fill='none'/><polygon points='24,8 30,14 28,22 20,22 18,14' fill='%23current' opacity='0.6'/><polygon points='38,20 42,27 36,33 30,30 30,22' fill='%23current' opacity='0.6'/><polygon points='34,38 26,42 20,37 22,30 30,30' fill='%23current' opacity='0.6'/><polygon points='14,38 8,33 10,25 18,22 22,30 20,37' fill='%23current' opacity='0.6'/><polygon points='6,20 12,14 18,14 20,22 10,25' fill='%23current' opacity='0.6'/></svg>`,
    animClass: 'float-1',
    lightOpacity: 0.07,
    darkOpacity: 0.09,
  },
  // Basketball
  {
    id: 'basketball',
    svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><circle cx='24' cy='24' r='22' fill='none' stroke='%23current' stroke-width='2'/><path d='M2 24 h44 M24 2 v44' stroke='%23current' stroke-width='1.5' fill='none'/><path d='M8 8 Q24 16 8 40' stroke='%23current' stroke-width='1.5' fill='none'/><path d='M40 8 Q24 16 40 40' stroke='%23current' stroke-width='1.5' fill='none'/></svg>`,
    animClass: 'float-2',
    lightOpacity: 0.07,
    darkOpacity: 0.09,
  },
  // Tennis ball
  {
    id: 'tennis',
    svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><circle cx='24' cy='24' r='22' fill='none' stroke='%23current' stroke-width='2'/><path d='M5 14 Q16 24 5 34' stroke='%23current' stroke-width='2' fill='none'/><path d='M43 14 Q32 24 43 34' stroke='%23current' stroke-width='2' fill='none'/></svg>`,
    animClass: 'float-3',
    lightOpacity: 0.08,
    darkOpacity: 0.10,
  },
  // Cricket ball
  {
    id: 'cricket',
    svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><circle cx='24' cy='24' r='22' fill='none' stroke='%23current' stroke-width='2'/><path d='M24 2 Q36 12 36 24 Q36 36 24 46' stroke='%23current' stroke-width='2' fill='none'/><path d='M24 2 Q12 12 12 24 Q12 36 24 46' stroke='%23current' stroke-width='2' fill='none'/><path d='M18 10 l3 3 m-3 6 l3 3 m-3 6 l3 3 m-3 6 l3 3' stroke='%23current' stroke-width='1.2' fill='none'/><path d='M27 10 l3 3 m-3 6 l3 3 m-3 6 l3 3 m-3 6 l3 3' stroke='%23current' stroke-width='1.2' fill='none'/></svg>`,
    animClass: 'float-4',
    lightOpacity: 0.07,
    darkOpacity: 0.09,
  },
  // Shuttlecock
  {
    id: 'shuttle',
    svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><ellipse cx='24' cy='38' rx='7' ry='4' fill='none' stroke='%23current' stroke-width='2'/><path d='M17 38 L24 10 L31 38' fill='none' stroke='%23current' stroke-width='1.5'/><path d='M19 30 Q24 26 29 30' stroke='%23current' stroke-width='1.2' fill='none'/><path d='M18 23 Q24 18 30 23' stroke='%23current' stroke-width='1.2' fill='none'/><path d='M20 16 Q24 12 28 16' stroke='%23current' stroke-width='1.2' fill='none'/><circle cx='24' cy='38' r='3' fill='none' stroke='%23current' stroke-width='1.5'/></svg>`,
    animClass: 'float-5',
    lightOpacity: 0.07,
    darkOpacity: 0.09,
  },
  // Trophy / Star
  {
    id: 'trophy',
    svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><path d='M16 6 h16 v16 a8 8 0 0 1-16 0 Z' fill='none' stroke='%23current' stroke-width='2'/><path d='M10 8 h6 v8 a6 6 0 0 1-6 0 Z' fill='none' stroke='%23current' stroke-width='1.5'/><path d='M32 8 h6 v8 a6 6 0 0 1-6 0 Z' fill='none' stroke='%23current' stroke-width='1.5'/><line x1='24' y1='30' x2='24' y2='38' stroke='%23current' stroke-width='2'/><path d='M14 38 h20 v4 H14 Z' fill='none' stroke='%23current' stroke-width='1.5'/></svg>`,
    animClass: 'float-6',
    lightOpacity: 0.06,
    darkOpacity: 0.08,
  },
  // Running shoe / Boot outline
  {
    id: 'shoe',
    svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 40'><path d='M4 32 Q8 20 20 20 L44 20 Q56 20 60 28 L60 32 Q44 36 4 36 Z' fill='none' stroke='%23current' stroke-width='2'/><path d='M20 20 L18 10 Q20 6 26 8 L38 20' fill='none' stroke='%23current' stroke-width='1.5'/><path d='M28 12 l4-1 m-4 3 l5-1 m-5 3 l4-1' stroke='%23current' stroke-width='1' fill='none'/></svg>`,
    animClass: 'float-7',
    lightOpacity: 0.07,
    darkOpacity: 0.09,
  },
  // Star burst / sparkle
  {
    id: 'star',
    svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><path d='M24 4 L27 20 L43 20 L30 29 L35 45 L24 36 L13 45 L18 29 L5 20 L21 20 Z' fill='none' stroke='%23current' stroke-width='2'/></svg>`,
    animClass: 'float-8',
    lightOpacity: 0.06,
    darkOpacity: 0.08,
  },
];

// Positions and sizes for a grid of elements across the viewport
const ELEMENT_POSITIONS = [
  { el: 0, x: 5,  y: 10, size: 48, delay: '0s'    },
  { el: 1, x: 18, y: 75, size: 56, delay: '2.3s'  },
  { el: 2, x: 32, y: 25, size: 40, delay: '1.1s'  },
  { el: 3, x: 48, y: 60, size: 52, delay: '3.7s'  },
  { el: 4, x: 65, y: 15, size: 44, delay: '0.8s'  },
  { el: 5, x: 78, y: 80, size: 60, delay: '4.2s'  },
  { el: 6, x: 90, y: 40, size: 48, delay: '2.0s'  },
  { el: 7, x: 12, y: 50, size: 36, delay: '5.1s'  },
  { el: 0, x: 55, y: 88, size: 42, delay: '1.8s'  },
  { el: 1, x: 38, y: 45, size: 34, delay: '3.2s'  },
  { el: 2, x: 72, y: 55, size: 38, delay: '0.5s'  },
  { el: 3, x: 24, y: 88, size: 46, delay: '6.0s'  },
  { el: 4, x: 84, y: 22, size: 32, delay: '2.8s'  },
  { el: 5, x: 8,  y: 35, size: 40, delay: '4.5s'  },
  { el: 7, x: 95, y: 65, size: 36, delay: '1.5s'  },
  { el: 6, x: 44, y: 8,  size: 30, delay: '3.0s'  },
];

// We expose a variant prop: 'customer' | 'admin' | 'supplier'
// which changes which elements are emphasized (but all get the full set at different opacities)
const SportsBackground = ({ variant = 'customer' }) => {
  return (
    <div
      className="sports-bg-layer"
      aria-hidden="true"
      role="presentation"
    >
      {ELEMENT_POSITIONS.map((pos, i) => {
        const el = SPORTS_ELEMENTS[pos.el];
        return (
          <div
            key={i}
            className={`sports-bg-item ${el.animClass}`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: `${pos.size}px`,
              height: `${pos.size}px`,
              animationDelay: pos.delay,
            }}
          >
            {/* Render the SVG inline for easy color control via CSS */}
            <SportsSvg id={el.id} size={pos.size} />
          </div>
        );
      })}
    </div>
  );
};

// A lightweight inline SVG renderer for each sports icon
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
          <circle cx="24" cy="24" r="21" strokeWidth="2" className="sports-stroke" />
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
          <circle cx="24" cy="24" r="21" strokeWidth="2" className="sports-stroke" />
          <line x1="3" y1="24" x2="45" y2="24" strokeWidth="1.5" className="sports-stroke" />
          <line x1="24" y1="3" x2="24" y2="45" strokeWidth="1.5" className="sports-stroke" />
          <path d="M8 8 Q24 18 8 40" strokeWidth="1.5" className="sports-stroke" />
          <path d="M40 8 Q24 18 40 40" strokeWidth="1.5" className="sports-stroke" />
        </svg>
      );
    case 'tennis':
      return (
        <svg {...svgProps}>
          <circle cx="24" cy="24" r="21" strokeWidth="2" className="sports-stroke" />
          <path d="M5 14 Q17 24 5 34" strokeWidth="2.5" className="sports-stroke" />
          <path d="M43 14 Q31 24 43 34" strokeWidth="2.5" className="sports-stroke" />
        </svg>
      );
    case 'cricket':
      return (
        <svg {...svgProps}>
          <circle cx="24" cy="24" r="21" strokeWidth="2" className="sports-stroke" />
          <path d="M24 3 Q35 12 35 24 Q35 36 24 45" strokeWidth="1.8" className="sports-stroke" />
          <path d="M24 3 Q13 12 13 24 Q13 36 24 45" strokeWidth="1.8" className="sports-stroke" />
          <path d="M18 11 l2 2 m-2 5 l2 2 m-2 5 l2 2 m-2 5 l2 2" strokeWidth="1.2" className="sports-stroke" />
          <path d="M28 11 l2 2 m-2 5 l2 2 m-2 5 l2 2 m-2 5 l2 2" strokeWidth="1.2" className="sports-stroke" />
        </svg>
      );
    case 'shuttle':
      return (
        <svg {...svgProps} viewBox="0 0 48 56">
          <ellipse cx="24" cy="46" rx="8" ry="5" strokeWidth="2" className="sports-stroke" />
          <path d="M16 46 L24 12 L32 46" strokeWidth="1.8" className="sports-stroke" />
          <path d="M18 36 Q24 32 30 36" strokeWidth="1.3" className="sports-stroke" />
          <path d="M17 27 Q24 22 31 27" strokeWidth="1.3" className="sports-stroke" />
          <path d="M19 19 Q24 15 29 19" strokeWidth="1.3" className="sports-stroke" />
          <circle cx="24" cy="46" r="3" strokeWidth="1.5" className="sports-stroke" />
        </svg>
      );
    case 'trophy':
      return (
        <svg {...svgProps}>
          <path d="M15 5 h18 v16 a9 9 0 0 1-18 0 Z" strokeWidth="2" className="sports-stroke" />
          <path d="M9 7 h6 v9 a5 5 0 0 1-6 0 Z" strokeWidth="1.5" className="sports-stroke" />
          <path d="M33 7 h6 v9 a5 5 0 0 1-6 0 Z" strokeWidth="1.5" className="sports-stroke" />
          <line x1="24" y1="30" x2="24" y2="39" strokeWidth="2" className="sports-stroke" />
          <path d="M13 39 h22 v5 H13 Z" strokeWidth="1.5" className="sports-stroke" />
        </svg>
      );
    case 'shoe':
      return (
        <svg {...svgProps} viewBox="0 0 64 40">
          <path d="M4 30 Q9 20 22 20 L44 20 Q57 20 60 28 L60 34 Q44 38 4 38 Z" strokeWidth="2" className="sports-stroke" />
          <path d="M22 20 L20 10 Q22 5 28 7 L40 20" strokeWidth="1.5" className="sports-stroke" />
          <path d="M28 13 l5-1 m-5 3.5 l6-1.2" strokeWidth="1.1" className="sports-stroke" />
        </svg>
      );
    case 'star':
      return (
        <svg {...svgProps}>
          <path d="M24 3 L27.5 16 L42 16 L30.5 25 L35 38 L24 30 L13 38 L17.5 25 L6 16 L20.5 16 Z" strokeWidth="2" className="sports-stroke" />
        </svg>
      );
    default:
      return null;
  }
};

export default SportsBackground;
