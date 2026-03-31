import { useEffect, useRef } from 'react';

export default function AuthBackground3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let raf = 0;
    let width = 0;
    let height = 0;
    let tick = 0;
    const pointer = { x: 0, y: 0 };

    const points = Array.from({ length: 42 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: 0.2 + Math.random() * 1.1,
      speed: 0.15 + Math.random() * 0.45,
    }));

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const render = () => {
      tick += 0.01;
      ctx.clearRect(0, 0, width, height);

      const grad = ctx.createRadialGradient(
        width * (0.25 + pointer.x * 0.05),
        height * (0.2 + pointer.y * 0.04),
        40,
        width * 0.45,
        height * 0.38,
        Math.max(width, height)
      );
      grad.addColorStop(0, 'rgba(59,130,246,0.16)');
      grad.addColorStop(0.5, 'rgba(99,102,241,0.08)');
      grad.addColorStop(1, 'rgba(2,6,23,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const mapped = points.map((p, i) => {
        const drift = (Math.sin(tick * p.speed + i) + 1) * 0.5;
        const x = p.x * width + Math.sin(tick + i) * 14 + pointer.x * 22 * p.z;
        const y = p.y * height + Math.cos(tick * 0.75 + i) * 16 + pointer.y * 14 * p.z;
        const r = 1.2 + drift * 2.3 * p.z;
        return { x, y, r, z: p.z };
      });

      for (let i = 0; i < mapped.length; i += 1) {
        const a = mapped[i];
        for (let j = i + 1; j < mapped.length; j += 1) {
          const b = mapped[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 165) {
            const alpha = (1 - d / 165) * 0.2 * ((a.z + b.z) * 0.5);
            ctx.strokeStyle = `rgba(96,165,250,${alpha.toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      mapped.forEach((dot, idx) => {
        const pulse = 0.35 + ((Math.sin(tick * 2 + idx * 0.5) + 1) * 0.5) * 0.65;
        ctx.beginPath();
        ctx.fillStyle = `rgba(147,197,253,${(0.32 + pulse * 0.33).toFixed(3)})`;
        ctx.shadowBlur = 16;
        ctx.shadowColor = 'rgba(59,130,246,0.45)';
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(render);
    };

    const handleMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointer.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handleMove, { passive: true });
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handleMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="auth-canvas-3d" aria-hidden="true" />;
}
