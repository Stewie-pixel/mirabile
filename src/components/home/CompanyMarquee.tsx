const COMPANIES: { name: string; icon: string; color: string }[] = [
  { name: 'Google',     icon: '/icons/google.png',     color: '#4285F4' },
  { name: 'Meta',       icon: '/icons/meta.png',       color: '#0082FB' },
  { name: 'Amazon',     icon: '/icons/amazon.png',     color: '#FF9900' },
  { name: 'Microsoft',  icon: '/icons/microsoft.png',  color: '#00A4EF' },
  { name: 'Apple',      icon: '/icons/apple.png',      color: '#A2AAAD' },
  { name: 'Stripe',     icon: '/icons/stripe.png',     color: '#635BFF' },
  { name: 'Adobe',      icon: '/icons/adobe.png',      color: '#ee1515' },
  { name: 'LinkedIn',   icon: '/icons/linkedin.png',   color: '#0A66C2' },
  { name: 'NVIDIA',     icon: '/icons/nvidia.png',     color: '#00ff40' },
  { name: 'IBM',        icon: '/icons/ibm.png',        color: '#8c8686' },
  { name: 'OpenAI',     icon: '/icons/openai.png',     color: '#000000' },
  { name: 'Pinterest',  icon: '/icons/pinterest.png',  color: '#ff0000' },
];

const TRACK = [...COMPANIES, ...COMPANIES];

export function CompanyMarquee() {
  return (
    <>
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee-scroll 38s linear infinite;
          display: flex;
          width: max-content;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <section
        className="relative overflow-hidden py-10"
        style={{
          background: 'linear-gradient(180deg, #020c1b 0%, #040f20 50%, #020c1b 100%)',
          borderTop: '1px solid rgba(56,189,248,0.08)',
          borderBottom: '1px solid rgba(56,189,248,0.08)',
        }}
      >
        {/* Edge fade masks */}
        <div
          className="absolute inset-y-0 left-0 w-28 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #020c1b, transparent)' }}
        />
        <div
          className="absolute inset-y-0 right-0 w-28 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #020c1b, transparent)' }}
        />

        {/* Label */}
        <p
          className="text-center text-xs font-semibold uppercase mb-6"
          style={{ color: 'rgba(148,213,252,0.35)', letterSpacing: '0.22em' }}
        >
          Land your dream role at
        </p>

        <div className="overflow-hidden">
          <div className="marquee-track">
            {TRACK.map((co, i) => (
              <div
                key={i}
                className="flex items-center gap-3 mx-5 px-5 py-3 rounded-2xl select-none"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(8px)',
                  minWidth: 'max-content',
                }}
              >
                <img
                  src={co.icon}
                  alt={`${co.name} logo`}
                  width={22}
                  height={22}
                  className="flex-shrink-0 object-contain"
                  style={{
                    filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.12))',
                  }}
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    el.style.display = 'none';
                    const dot = document.createElement('span');
                    dot.style.cssText = `
                      width:10px;height:10px;border-radius:50%;flex-shrink:0;
                      background:${co.color};
                      box-shadow:0 0 6px ${co.color}99;
                      display:inline-block;
                    `;
                    el.parentNode?.insertBefore(dot, el);
                  }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: 'rgba(186,230,255,0.85)' }}
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