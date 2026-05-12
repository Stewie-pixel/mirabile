import { useEffect, useRef } from 'react';

interface Dot {
  x: number;
  y: number;
  z: number;
}

function createDotSphere(count: number, radius: number): Dot[] {
  const dots: Dot[] = [];
  // Fibonacci sphere distribution for even dot spread
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < count; i++) {
    const theta = Math.acos(1 - (2 * (i + 0.5)) / count);
    const phi = (2 * Math.PI * i) / goldenRatio;
    dots.push({
      x: radius * Math.sin(theta) * Math.cos(phi),
      y: radius * Math.sin(theta) * Math.sin(phi),
      z: radius * Math.cos(theta),
    });
  }
  return dots;
}

function rotateX(dot: Dot, angle: number): Dot {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: dot.x,
    y: dot.y * cos - dot.z * sin,
    z: dot.y * sin + dot.z * cos,
  };
}

function rotateY(dot: Dot, angle: number): Dot {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: dot.x * cos + dot.z * sin,
    y: dot.y,
    z: -dot.x * sin + dot.z * cos,
  };
}

export function InteractiveOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Rotation state
  const rotRef = useRef({ x: 0.4, y: 0 });
  const velRef = useRef({ x: 0.0008, y: 0.003 });
  const mouseRef = useRef({ down: false, lastX: 0, lastY: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d')!;
    const RADIUS = 130;
    const DOT_COUNT = 280;
    const dots = createDotSphere(DOT_COUNT, RADIUS);

    // Hi-DPI
    const resize = () => {
      const dpr = globalThis.devicePixelRatio || 1;
      const size = Math.min(container.offsetWidth, 420);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.scale(dpr, dpr);
    };
    resize();

    const draw = () => {
      const size = parseInt(canvas.style.width);
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;

      // Auto-rotate when not dragging
      if (!mouseRef.current.down) {
        rotRef.current.y += velRef.current.y;
        rotRef.current.x += velRef.current.x;
      }

      // Project all dots
      const projected = dots.map((dot) => {
        const d1 = rotateX(dot, rotRef.current.x);
        const d2 = rotateY(d1, rotRef.current.y);
        // Perspective projection
        const fov = 420;
        const scale = fov / (fov + d2.z);
        const px = cx + d2.x * scale;
        const py = cy + d2.y * scale;
        // Depth: -1 (back) to +1 (front)
        const depth = (d2.z + RADIUS) / (2 * RADIUS);
        return { px, py, depth, scale };
      });

      // Sort back-to-front so front dots render on top
      projected.sort((a, b) => a.depth - b.depth);

      projected.forEach(({ px, py, depth, scale }) => {
        const dotRadius = Math.max(0.8, 2.2 * scale);

        // Colour: deep blue at back → bright cyan at front
        const r = Math.round(14 + depth * 110);
        const g = Math.round(116 + depth * 95);
        const b = Math.round(144 + depth * 108);
        const alpha = 0.25 + depth * 0.75;

        ctx.beginPath();
        ctx.arc(px, py, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();

        // Glow on front-facing dots
        if (depth > 0.72) {
          ctx.beginPath();
          ctx.arc(px, py, dotRadius * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(125,211,252,${(depth - 0.72) * 0.35})`;
          ctx.fill();
        }
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    // Mouse / touch drag
    const onMouseDown = (e: MouseEvent) => {
      mouseRef.current.down = true;
      mouseRef.current.lastX = e.clientX;
      mouseRef.current.lastY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!mouseRef.current.down) return;
      const dx = e.clientX - mouseRef.current.lastX;
      const dy = e.clientY - mouseRef.current.lastY;
      rotRef.current.y += dx * 0.008;
      rotRef.current.x += dy * 0.008;
      mouseRef.current.lastX = e.clientX;
      mouseRef.current.lastY = e.clientY;
    };
    const onMouseUp = () => { mouseRef.current.down = false; };

    const onTouchStart = (e: TouchEvent) => {
      mouseRef.current.down = true;
      mouseRef.current.lastX = e.touches[0].clientX;
      mouseRef.current.lastY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!mouseRef.current.down) return;
      const dx = e.touches[0].clientX - mouseRef.current.lastX;
      const dy = e.touches[0].clientY - mouseRef.current.lastY;
      rotRef.current.y += dx * 0.008;
      rotRef.current.x += dy * 0.008;
      mouseRef.current.lastX = e.touches[0].clientX;
      mouseRef.current.lastY = e.touches[0].clientY;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    globalThis.addEventListener('mousemove', onMouseMove);
    globalThis.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onMouseUp);

    globalThis.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('mousedown', onMouseDown);
      globalThis.removeEventListener('mousemove', onMouseMove);
      globalThis.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onMouseUp);
      globalThis.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-full"
      style={{ minHeight: 420 }}
    >
      {/* Outer ambient glow ring */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 320,
          height: 320,
          background:
            'radial-gradient(circle, rgba(56,189,248,0.12) 0%, rgba(14,116,144,0.06) 50%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />

      {/* Canvas — cursor:grab signals interactivity */}
      <canvas
        ref={canvasRef}
        style={{ cursor: 'grab', touchAction: 'none', borderRadius: '50%' }}
        onMouseDown={() => {
          if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
        }}
        onMouseUp={() => {
          if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
        }}
      />

      {/* Logo centred over the orb — non-interactive layer */}
      <img
        src="/images/logo.png"
        alt="Mirabile"
        className="absolute pointer-events-none"
        style={{
          width: 72,
          height: 72,
          objectFit: 'contain',
          filter: 'drop-shadow(0 0 18px rgba(56,189,248,0.7)) brightness(1.15)',
        }}
      />

      {/* Floating stat chips */}
      <div
        className="absolute top-10 right-6 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-sky-100 border border-sky-400/20"
        style={{
          background: 'rgba(8,47,73,0.75)',
          backdropFilter: 'blur(12px)',
          animation: 'orb-float 4s ease-in-out infinite',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        }}
      >
        <span
          className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"
          style={{ boxShadow: '0 0 6px rgba(52,211,153,0.8)' }}
        />
        500+ roadmaps generated
      </div>

      <div
        className="absolute bottom-14 left-4 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-sky-100 border border-sky-400/20"
        style={{
          background: 'rgba(8,47,73,0.75)',
          backdropFilter: 'blur(12px)',
          animation: 'orb-float 5s ease-in-out infinite 1.5s',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        }}
      >
        <span className="text-base">🎯</span>
        Google · Meta · Amazon
      </div>
    </div>
  );
}