// BB INNOVATION Logo SVG Component
export const BBLogoSVG = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#0d6b6b" />
        <stop offset="100%" stopColor="#063a3a" />
      </radialGradient>
      <radialGradient id="discGrad" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#2a8a5a" />
        <stop offset="100%" stopColor="#0d5535" />
      </radialGradient>
      <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f5d060" />
        <stop offset="40%" stopColor="#c89020" />
        <stop offset="70%" stopColor="#f0c040" />
        <stop offset="100%" stopColor="#9a6a10" />
      </linearGradient>
      <linearGradient id="goldText" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffe878" />
        <stop offset="50%" stopColor="#c89020" />
        <stop offset="100%" stopColor="#f0c040" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    {/* Outer circle background */}
    <circle cx="100" cy="100" r="98" fill="url(#bgGrad)" />

    {/* Gold ring border */}
    <circle cx="100" cy="100" r="98" fill="none" stroke="url(#goldRing)" strokeWidth="6" />
    <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(200,144,32,0.3)" strokeWidth="1.5" />

    {/* 3D Disc body - bottom lip */}
    <ellipse cx="100" cy="128" rx="68" ry="14" fill="#0a4020" />
    {/* 3D Disc body - top face */}
    <ellipse cx="100" cy="90" rx="68" ry="24" fill="url(#discGrad)" />
    {/* Disc side connection */}
    <rect x="32" y="90" width="136" height="38" fill="url(#discGrad)" />
    <ellipse cx="100" cy="128" rx="68" ry="14" fill="#145a30" />
    {/* Disc top face redraw on top */}
    <ellipse cx="100" cy="90" rx="68" ry="24" fill="url(#discGrad)" />

    {/* Gold rim on disc */}
    <ellipse cx="100" cy="90" rx="68" ry="24" fill="none" stroke="url(#goldRing)" strokeWidth="2.5" />
    <ellipse cx="100" cy="128" rx="68" ry="14" fill="none" stroke="url(#goldRing)" strokeWidth="2" />
    <line x1="32" y1="90" x2="32" y2="128" stroke="url(#goldRing)" strokeWidth="2" />
    <line x1="168" y1="90" x2="168" y2="128" stroke="url(#goldRing)" strokeWidth="2" />

    {/* Circuit traces radiating from center */}
    {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => {
      const r1 = deg * Math.PI / 180;
      const cos = Math.cos(r1), sin = Math.sin(r1);
      const x1 = 100 + 18 * cos, y1 = 90 + 6 * sin;
      const x2 = 100 + 55 * cos, y2 = 90 + 18 * sin;
      const mx = 100 + 36 * cos, my = 90 + 12 * sin;
      return (
        <g key={i}>
          <line x1={x1} y1={y1} x2={mx} y2={my} stroke="#c89020" strokeWidth="1" opacity="0.7" />
          <line x1={mx} y1={my} x2={x2} y2={y2} stroke="#c89020" strokeWidth="1" opacity="0.5" />
          <circle cx={x2} cy={y2} r="1.5" fill="#c89020" opacity="0.6" />
        </g>
      );
    })}

    {/* BB Text - shadow/3D layer */}
    <text x="100" y="100" textAnchor="middle" dominantBaseline="central"
      fontFamily="Georgia, serif" fontWeight="900" fontSize="42"
      fill="#0a4020" letterSpacing="-2">BB</text>
    {/* BB Text - main gold */}
    <text x="100" y="97" textAnchor="middle" dominantBaseline="central"
      fontFamily="Georgia, serif" fontWeight="900" fontSize="42"
      fill="url(#goldText)" letterSpacing="-2" filter="url(#glow)">BB</text>
    {/* BB Text - highlight */}
    <text x="100" y="97" textAnchor="middle" dominantBaseline="central"
      fontFamily="Georgia, serif" fontWeight="900" fontSize="42"
      fill="none" stroke="#ffe878" strokeWidth="0.5" letterSpacing="-2" opacity="0.6">BB</text>

    {/* BB INNOVATION text at bottom */}
    <text x="100" y="166" textAnchor="middle"
      fontFamily="Arial, sans-serif" fontWeight="700" fontSize="14"
      fill="url(#goldText)" letterSpacing="1">BB INNOVATION</text>
  </svg>
);

export default BBLogoSVG;
