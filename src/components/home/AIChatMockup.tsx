import { useEffect, useRef, useState } from 'react';
import { Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  text: string;
  delay: number; 
}

const CONVERSATION: Message[] = [
  {
    role: 'user',
    text: 'I want to become a Software Engineer at Google within 12 months. Where do I start?',
    delay: 0,
  },
  {
    role: 'ai',
    text: "Great goal! Here's your personalised 12-month roadmap to Google SWE:\n\n**Phase 1 — Foundations (Months 1–3)**\n• Master Data Structures: arrays, linked lists, trees, graphs, heaps\n• Core Algorithms: sorting, BFS/DFS, dynamic programming, recursion\n• Daily LeetCode: 2 Easy + 1 Medium per day\n\n**Phase 2 — Depth (Months 4–7)**\n• System Design fundamentals: scalability, load balancing, databases\n• Object-Oriented Design patterns\n• Behavioural interview prep using STAR method\n\n**Phase 3 — Google-Specific Prep (Months 8–11)**\n• Google's coding style & preferred patterns\n• Mock interviews with Google ex-employees\n• 5 full-length timed mock interviews per week\n\n**Month 12 — Apply & Interview**\n• Submit applications via referral network\n• Schedule 6–8 onsite loops\n• Negotiate the offer 🎯",
    delay: 2000,
  },
  {
    role: 'user',
    text: 'What resources do you recommend for System Design?',
    delay: 2000,
  },
  {
    role: 'ai',
    text: "For Google-level System Design, here are the top resources:\n\n📘 **Books**\n• *Designing Data-Intensive Applications* — Martin Kleppmann (must-read)\n• *System Design Interview* — Alex Xu (volumes 1 & 2)\n\n🎥 **Video Courses**\n• Grokking the System Design Interview (Educative)\n• ByteByteGo YouTube channel by Alex Xu\n\n🛠 **Practice**\n• Design Twitter, YouTube, URL shortener, Uber\n• Focus on: consistent hashing, CDN, caching layers, message queues\n\nAim for **2 system design sessions per week** from Month 4 onward.",
    delay: 2000,
  },
  {
    role: 'user',
    text: 'How many LeetCode problems should I solve before applying?',
    delay: 2000,
  },
  {
    role: 'ai',
    text: "Quality beats quantity, but here's the target:\n\n✅ **Minimum bar for Google**\n• 150–200 problems solved (not just attempted)\n• Distribution: 40% Easy · 45% Medium · 15% Hard\n\n🎯 **Focus areas for Google specifically**\n• Trees & Graphs (BFS, DFS, Dijkstra)\n• Dynamic Programming (Google loves DP)\n• String manipulation & sliding window\n• Bit manipulation\n\n💡 **Pro tip**: Do every problem at least twice. Speed and accuracy on Medium problems matters more than grinding Hards. Track your solve time — aim for < 20 min on Mediums.",
    delay: 2000,
  },
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-sky-400/60"
          style={{
            animation: `typing-dot 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ msg, visible }: { msg: Message; visible: boolean }) {
  const isAI = msg.role === 'ai';

  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      const withBullet = bold.startsWith('•') ? `&nbsp;&nbsp;${bold}` : bold;
      return (
        <span
          key={i}
          className="block"
          style={{ lineHeight: '1.7', minHeight: line === '' ? '0.6em' : undefined }}
          dangerouslySetInnerHTML={{ __html: withBullet }}
        />
      );
    });
  };

  return (
    <div
      className={`flex items-start gap-3 transition-all duration-500 ${
        isAI ? 'flex-row' : 'flex-row-reverse'
      } ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ transitionProperty: 'opacity, transform' }}
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1"
        style={{
          background: isAI
            ? 'linear-gradient(135deg, #0ea5e9, #0369a1)'
            : 'linear-gradient(135deg, #374151, #1f2937)',
          boxShadow: isAI ? '0 0 12px rgba(14,165,233,0.4)' : 'none',
        }}
      >
        {isAI ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-sky-300" />}
      </div>

      {/* Bubble */}
      <div
        className="max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
        style={
          isAI
            ? {
                background: 'rgba(14,36,64,0.85)',
                border: '1px solid rgba(56,189,248,0.15)',
                color: 'rgba(186,230,255,0.9)',
                backdropFilter: 'blur(12px)',
                borderRadius: '4px 18px 18px 18px',
              }
            : {
                background: 'linear-gradient(135deg, rgba(14,165,233,0.25), rgba(3,105,161,0.3))',
                border: '1px solid rgba(56,189,248,0.2)',
                color: 'rgba(224,242,254,0.95)',
                backdropFilter: 'blur(12px)',
                borderRadius: '18px 4px 18px 18px',
              }
        }
      >
        {formatText(msg.text)}
      </div>
    </div>
  );
}

export function AIChatMockup() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [showTyping, setShowTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function runConversation() {
      // Reset
      setVisibleCount(0);
      setShowTyping(false);

      for (let i = 0; i < CONVERSATION.length; i++) {
        const msg = CONVERSATION[i];

        // Wait before showing this message
        await new Promise((r) => setTimeout(r, i === 0 ? 600 : msg.delay + 400));
        if (cancelled) return;

        // Show typing indicator only before AI messages
        if (msg.role === 'ai') {
          setShowTyping(true);
          await new Promise((r) => setTimeout(r, 1100));
          if (cancelled) return;
          setShowTyping(false);
        }

        setVisibleCount((c) => c + 1);

        // Auto-scroll
        setTimeout(() => {
          scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }, 80);
      }

      // Pause, then loop
      await new Promise((r) => setTimeout(r, 5000));
      if (!cancelled) runConversation();
    }

    runConversation();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <style>{`
        @keyframes typing-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>

      <section
        className="py-20 px-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #020c1b 0%, #030e1c 100%)' }}
      >
        {/* Glow behind chat */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 600,
            height: 600,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(14,116,144,0.1) 0%, transparent 65%)',
            filter: 'blur(40px)',
          }}
        />

        <div className="relative z-10 container mx-auto max-w-3xl">
          {/* Section header */}
          <div className="text-center mb-10">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
              style={{
                color: '#38bdf8',
                background: 'rgba(56,189,248,0.1)',
                border: '1px solid rgba(56,189,248,0.2)',
                letterSpacing: '0.18em',
              }}
            >
              AI Career Advisor
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold text-white"
              style={{ letterSpacing: '-0.02em' }}
            >
              Ask anything about your roadmap
            </h2>
            <p className="mt-3 text-sky-100/50 text-base">
              Your AI advisor crafts step-by-step guidance tailored to your target company and timeline.
            </p>
          </div>

          {/* Chat window */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(4,20,40,0.7)',
              border: '1px solid rgba(56,189,248,0.12)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(56,189,248,0.05)',
            }}
          >
            {/* Title bar */}
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{
                borderBottom: '1px solid rgba(56,189,248,0.08)',
                background: 'rgba(2,12,27,0.6)',
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
                <span className="text-xs font-medium text-sky-300/70">Mirabile AI · Career Advisor</span>
              </div>
              <div className="flex gap-1.5">
                {['#ff5f57','#febc2e','#28c840'].map((c) => (
                  <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                ))}
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex flex-col gap-5 p-5 overflow-y-auto"
              style={{ minHeight: 420, maxHeight: 520 }}
            >
              {CONVERSATION.slice(0, visibleCount).map((msg, i) => (
                <MessageBubble key={i} msg={msg} visible />
              ))}
              {showTyping && (
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', boxShadow: '0 0 12px rgba(14,165,233,0.4)' }}
                  >
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div
                    className="rounded-2xl"
                    style={{
                      background: 'rgba(14,36,64,0.85)',
                      border: '1px solid rgba(56,189,248,0.15)',
                      borderRadius: '4px 18px 18px 18px',
                    }}
                  >
                    <TypingDots />
                  </div>
                </div>
              )}
            </div>

            {/* Fake input bar */}
            <div
              className="px-5 py-4 flex items-center gap-3"
              style={{ borderTop: '1px solid rgba(56,189,248,0.08)', background: 'rgba(2,12,27,0.5)' }}
            >
              <div
                className="flex-1 rounded-xl px-4 py-2.5 text-sm"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(56,189,248,0.12)',
                  color: 'rgba(148,213,252,0.3)',
                }}
              >
                Ask about your career roadmap…
              </div>
              <button
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9, #0369a1)',
                  boxShadow: '0 4px 16px rgba(14,165,233,0.35)',
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}