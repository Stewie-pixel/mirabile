import { useState, MouseEvent } from "react";
import { assetUrl } from '@/lib/assetUrl';

type Company = {
  name: string,
  icon: string,
  color: string,
}

const COMPANIES: Company[] = [
  { name: 'Google',    icon: assetUrl('icons/google.png'),    color: '#4285F4' },
  { name: 'Meta',      icon: assetUrl('icons/meta.png'),      color: '#0082FB' },
  { name: 'Amazon',    icon: assetUrl('icons/amazon.png'),    color: '#FF9900' },
  { name: 'Microsoft', icon: assetUrl('icons/microsoft.png'), color: '#00A4EF' },
  { name: 'Apple',     icon: assetUrl('icons/apple.png'),     color: '#A2AAAD' },
  { name: 'Stripe',    icon: assetUrl('icons/stripe.png'),    color: '#635BFF' },
  { name: 'Adobe',     icon: assetUrl('icons/adobe.png'),     color: '#EE1515' },
  { name: 'LinkedIn',  icon: assetUrl('icons/linkedin.png'),  color: '#0A66C2' },
  { name: 'NVIDIA',    icon: assetUrl('icons/nvidia.png'),    color: '#76B900' },
  { name: 'IBM',       icon: assetUrl('icons/ibm.png'),       color: '#8C8686' },
  { name: 'OpenAI',    icon: assetUrl('icons/openai.png'),    color: '#AAAAAA' },
  { name: 'Pinterest', icon: assetUrl('icons/pinterest.png'), color: '#E60023' },
];

const TRACK = [...COMPANIES, ...COMPANIES];

const T = {
  bg:      '#000000',
  border: 'rgba(10,255,228,0.10)',
  teal:    '#0AFFE4',
  textMid: 'rgba(232, 255, 254, 0.77)',
  textHigh: 'rgb(255, 255, 255)',
} as const;

function CompanyLogo({ company }: { company: Company }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        aria-hidden
        style={{
          width: 9,
          height: 9,
          borderRadius: '50%',
          flexShrink: 0,
          background: company.color,
          boxShadow: `0 0 6px ${company.color}99`,
          display: 'inline-block',
        }}
      />
    );
  }

  return (
    <img
      src={company.icon}
      alt={`${company.name} logo`}
      width={20}
      height={20}
      className="flex-shrink-0 object-contain"
      style={{
        filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.1))',
      }}
      onError={() => setFailed(true)}
    />
  );
}

export function CompanyMarquee() {
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { currentTarget, clientX, clientY } = e;
    const { left, top } = currentTarget.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;

    currentTarget.style.setProperty("--mouse-x", `${x}px`);
    currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

return (
    <>
      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      
        .marquee-track {
          animation: marquee-scroll 40s linear infinite;
          display: flex;
          width: max-content;
          align-items: center;
          padding: 20px 0; /* Creates space for the lift */
        }
      
        .marquee-track:hover {
          animation-play-state: paused;
        }
      
        .company-card {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), 
                      background 0.25s ease, 
                      border-color 0.25s ease;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        
        .company-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            300px circle at var(--mouse-x) var(--mouse-y),
            rgb(0, 240, 255),
            transparent 80%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
          pointer-events: none;
        }
        
        .company-card:hover::before {
          opacity: 1;
        }
        
        .company-card:hover {
          transform: translateY(-6px); /* The lift */
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(10, 255, 228, 0.3);
          box-shadow: 
            0 12px 24px -10px rgba(0, 0, 0, 0.5),
            0 0 20px rgba(10, 255, 228, 0.05);
        }
      `}</style>

      <section
        className="relative overflow-hidden py-12"
        style={{
          background:  T.bg,
          borderTop:    `1px solid ${T.border}`,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <div
          className="absolute inset-y-0 left-0 w-28 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to right, ${T.bg}, transparent)` }}
        />
        <div
          className="absolute inset-y-0 right-0 w-28 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to left, ${T.bg}, transparent)` }}
        />

        <p
          className="text-center text-lg font-semibold uppercase mb-7"
          style={{
            color: 'rgb(0, 240, 255)',
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
                key={`${co.name}-${i}`}
                onMouseMove={handleMouseMove}
                className="company-card flex items-center gap-3 mx-4 px-5 py-3 rounded-2xl select-none"
                style={{
                  minWidth: 'max-content',
                }}
              >
                <CompanyLogo company={co} />
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