import { useEffect, useRef } from 'react';

export default function DotsBackground3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let animationFrame;
    let width = 0;
    let height = 0;

    const nodes = Array.from({ length: 70 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random() * 0.7 + 0.3,
      vx: (Math.random() - 0.5) * 0.00025,
      vy: (Math.random() - 0.5) * 0.00025,
    }));

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.max(1, Math.floor(width * window.devicePixelRatio));
      canvas.height = Math.max(1, Math.floor(height * window.devicePixelRatio));
      context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = '#000000';
      context.fillRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        node.x += node.vx * node.z;
        node.y += node.vy * node.z;

        if (node.x < -0.05 || node.x > 1.05) node.vx *= -1;
        if (node.y < -0.05 || node.y > 1.05) node.vy *= -1;

        const x = node.x * width;
        const y = node.y * height;

        context.beginPath();
        context.arc(x, y, 1 + node.z * 2.6, 0, Math.PI * 2);
        context.fillStyle = `rgba(255, 255, 255, ${0.1 + node.z * 0.35})`;
        context.fill();

        for (let j = i + 1; j < nodes.length; j += 1) {
          const other = nodes[j];
          const ox = other.x * width;
          const oy = other.y * height;
          const dist = Math.hypot(ox - x, oy - y);
          if (dist < 170) {
            const opacity = (1 - dist / 170) * 0.15;
            context.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            context.lineWidth = 0.5;
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(ox, oy);
            context.stroke();
          }
        }
      }

      animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener('resize', resize);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="page-canvas-3d" aria-hidden="true" />;
}
