import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const COLORS = [
  '#3b82f6', '#60a5fa', '#fbbf24', '#f59e0b',
  '#34d399', '#10b981', '#f472b6', '#ec4899',
  '#a78bfa', '#8b5cf6', '#fb923c', '#ef4444',
];

const PARTICLE_COUNT = 120;
const DURATION_MS = 3500;

const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Size canvas to window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.4,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 3 + 2,
        size: Math.random() * 8 + 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        opacity: 1,
      });
    }

    const startTime = Date.now();
    let animId: number;

    function animate() {
      const elapsed = Date.now() - startTime;
      if (elapsed > DURATION_MS) {
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
        return;
      }

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Fade out in the last 800ms
      const fadeStart = DURATION_MS - 800;
      const globalAlpha = elapsed > fadeStart
        ? 1 - (elapsed - fadeStart) / 800
        : 1;

      for (const p of particles) {
        p.x += p.vx;
        p.vy += 0.08; // gravity
        p.y += p.vy;
        p.vx *= 0.99; // air resistance
        p.rotation += p.rotationSpeed;

        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rotation);
        ctx!.globalAlpha = p.opacity * globalAlpha;
        ctx!.fillStyle = p.color;
        // Draw rectangle confetti pieces
        ctx!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx!.restore();
      }

      animId = requestAnimationFrame(animate);
    }

    animId = requestAnimationFrame(animate);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
};

export default Confetti;
