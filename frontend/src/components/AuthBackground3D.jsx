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
    const points = Array.from({ length: 70 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random() * 0.7 + 0.3,
      vx: (Math.random() - 0.5) * 0.00025,
      vy: (Math.random() - 0.5) * 0.00025,
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
      ctx.clearRect(0, 0, width, height);

      // Match home page look: black base with white 3D dots and subtle links.
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < points.length; i += 1) {
        const point = points[i];
        point.x += point.vx * point.z;
        point.y += point.vy * point.z;

        if (point.x < -0.05 || point.x > 1.05) point.vx *= -1;
        if (point.y < -0.05 || point.y > 1.05) point.vy *= -1;

        const x = point.x * width;
        const y = point.y * height;
        const r = 1 + point.z * 2.6;

        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + point.z * 0.35})`;
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < points.length; j += 1) {
          const other = points[j];
          const ox = other.x * width;
          const oy = other.y * height;
          const dist = Math.hypot(ox - x, oy - y);
          if (dist < 170) {
            const opacity = (1 - dist / 170) * 0.15;
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(ox, oy);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="auth-canvas-3d" aria-hidden="true" />;
}
