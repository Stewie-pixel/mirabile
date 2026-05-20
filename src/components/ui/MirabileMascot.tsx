
interface MascotProps {
  className?: string;
  size?: number;
}

export function MirabileMascot({ className = '', size = 180 }: MascotProps) {
  return (
    <div 
      className={`flex flex-col items-center justify-center select-none ${className}`}
      style={{
        animation: 'mirabile-float 4s ease-in-out infinite',
      }}
    >
      <style>{`
        @keyframes mirabile-float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }
        @keyframes eye-pulse {
          0%, 100% {
            opacity: 0.9;
            transform: scaleY(1);
          }
          50% {
            opacity: 1;
            transform: scaleY(1.05);
          }
        }
        @keyframes shadow-shrink {
          0%, 100% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(0.85);
            opacity: 0.1;
          }
        }
      `}</style>

      {/* Mascot SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main Gradient */}
          <linearGradient id="mascot-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#F472B6" />
          </linearGradient>
          {/* Face Screen Gradient */}
          <linearGradient id="face-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0D1527" />
            <stop offset="100%" stopColor="#040810" />
          </linearGradient>
          {/* Glow Filters */}
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Antennas */}
        <path d="M70 45 L50 25" stroke="url(#mascot-grad)" strokeWidth="4" strokeLinecap="round" />
        <path d="M130 45 L150 25" stroke="url(#mascot-grad)" strokeWidth="4" strokeLinecap="round" />
        <circle cx="50" cy="25" r="7" fill="#00F0FF" filter="url(#neon-glow)" />
        <circle cx="150" cy="25" r="7" fill="#F472B6" filter="url(#neon-glow)" />

        {/* Headphones Arch */}
        <path
          d="M40 90 A 62 62 0 0 1 160 90"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="6"
          fill="none"
        />

        {/* Robot Head Body */}
        <rect
          x="35"
          y="50"
          width="130"
          height="105"
          rx="52.5"
          fill="rgba(255,255,255,0.03)"
          stroke="url(#mascot-grad)"
          strokeWidth="3.5"
          filter="drop-shadow(0px 8px 24px rgba(0, 240, 255, 0.15))"
        />

        {/* Inner Glass Face Screen */}
        <rect
          x="48"
          y="68"
          width="104"
          height="70"
          rx="35"
          fill="url(#face-grad)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1.5"
        />

        {/* Glowing Eyes */}
        <g style={{ animation: 'eye-pulse 2s ease-in-out infinite' }}>
          {/* Left Eye */}
          <ellipse cx="78" cy="100" rx="8" ry="8" fill="#00F0FF" filter="url(#neon-glow)" />
          <ellipse cx="78" cy="100" rx="3" ry="3" fill="#FFFFFF" />
          {/* Right Eye */}
          <ellipse cx="122" cy="100" rx="8" ry="8" fill="#F472B6" filter="url(#neon-glow)" />
          <ellipse cx="122" cy="100" rx="3" ry="3" fill="#FFFFFF" />
        </g>

        {/* Cute Blushing Cheeks */}
        <circle cx="66" cy="115" r="4" fill="#F472B6" opacity="0.4" filter="blur(1px)" />
        <circle cx="134" cy="115" r="4" fill="#F472B6" opacity="0.4" filter="blur(1px)" />

        {/* Smile mouth */}
        <path
          d="M93 115 Q 100 121 107 115"
          stroke="#00F0FF"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          filter="url(#neon-glow)"
        />

        {/* Headphones Ear Cups */}
        <rect x="25" y="85" width="12" height="34" rx="6" fill="#00F0FF" filter="url(#neon-glow)" />
        <rect x="163" y="85" width="12" height="34" rx="6" fill="#F472B6" filter="url(#neon-glow)" />

        {/* Decorative Mascot Collar / Neck base */}
        <path
          d="M80 156 L120 156 L110 166 L90 166 Z"
          fill="url(#mascot-grad)"
          opacity="0.8"
        />
      </svg>

      {/* Floating Shadow Below */}
      <div 
        className="w-24 h-2 rounded-full bg-black mt-2 blur-[3px]"
        style={{
          animation: 'shadow-shrink 4s ease-in-out infinite',
        }}
      />
    </div>
  );
}
