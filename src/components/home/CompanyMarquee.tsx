const COMPANIES: { name: string; icon: string; color: string }[] = [
  { name: 'Google',    icon: '/icons/google.png',    color: '#4285F4' },
  { name: 'Meta',      icon: '/icons/meta.png',      color: '#0082FB' },
  { name: 'Amazon',    icon: '/icons/amazon.png',    color: '#FF9900' },
  { name: 'Microsoft', icon: '/icons/microsoft.png', color: '#00A4EF' },
  { name: 'Apple',     icon: '/icons/apple.png',     color: '#A2AAAD' },
  { name: 'Stripe',    icon: '/icons/stripe.png',    color: '#635BFF' },
  { name: 'Adobe',     icon: '/icons/adobe.png',     color: '#EE1515' },
  { name: 'LinkedIn',  icon: '/icons/linkedin.png',  color: '#0A66C2' },
  { name: 'NVIDIA',    icon: '/icons/nvidia.png',    color: '#76B900' },
  { name: 'IBM',       icon: '/icons/ibm.png',       color: '#8C8686' },
  { name: 'OpenAI',    icon: '/icons/openai.png',    color: '#AAAAAA' },
  { name: 'Pinterest', icon: '/icons/pinterest.png', color: '#E60023' },
];

const TRACK = [...COMPANIES, ...COMPANIES];

const T = {
  bg:     '#000000',
  border: 'rgba(10,255,228,0.10)',
  teal:   '#0AFFE4',
  textMid: 'rgba(232,255,254,0.55)',
  textHigh: 'rgba(232,255,254,0.85)',
} as const;

export function CompanyMarquee() {
  return (
    <>
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee-scroll 40s linear infinite;
          display: flex;
          width: max-content;
        }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>

      <section
        className="relative overflow-hidden py-12"
        style={{
          background:  T.bg,
          borderTop:    `1px solid ${T.border}`,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        {/* Edge fade masks */}
        <div
          className="absolute inset-y-0 left-0 w-28 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to right, ${T.bg}, transparent)` }}
        />
        <div
          className="absolute inset-y-0 right-0 w-28 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to left, ${T.bg}, transparent)` }}
        />

        {/* Label */}
        <p
          className="text-center text-lg font-semibold uppercase mb-7"
          style={{
            color: 'rgb(10, 255, 226)',
            letterSpacing: '0.22em',
            fontFamily: "'DM Mono', monospace",
          }}
        >
          Land your dream role at
        </p>

        <div className="overflow-hidden">
          <div className="marquee-track">
            {TRACK.map((co, i) => (
              <div
                key={i}
                className="flex items-center gap-3 mx-4 px-5 py-3 rounded-2xl select-none"
                style={{
                  background:    'rgba(10,255,228,0.03)',
                  border:        '1px solid rgba(10,255,228,0.09)',
                  backdropFilter: 'blur(8px)',
                  minWidth: 'max-content',
                }}
              >
                <img
                  src={co.icon}
                  alt={`${co.name} logo`}
                  width={20}
                  height={20}
                  className="flex-shrink-0 object-contain"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.1))' }}
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    el.style.display = 'none';
                    const dot = document.createElement('span');
                    dot.style.cssText = `
                      width:9px;height:9px;border-radius:50%;flex-shrink:0;
                      background:${co.color};box-shadow:0 0 6px ${co.color}99;
                      display:inline-block;
                    `;
                    el.parentNode?.insertBefore(dot, el);
                  }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: T.textHigh }}
                >
                  {co.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}