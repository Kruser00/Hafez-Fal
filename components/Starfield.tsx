import React, { useEffect, useRef } from 'react';

const Starfield: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Mouse tracking
    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Star configuration
    const STAR_COUNT = 100;
    const CONNECTION_DISTANCE = 150;
    const MOUSE_DISTANCE = 200;

    interface Star {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
    }

    const stars: Star[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2, // Slow movement
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 2,
        alpha: Math.random() * 0.5 + 0.1
      });
    }

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Gradient background handled by CSS, we just draw stars
      
      stars.forEach((star, i) => {
        // Move
        star.x += star.vx;
        star.y += star.vy;

        // Bounce off edges
        if (star.x < 0 || star.x > width) star.vx *= -1;
        if (star.y < 0 || star.y > height) star.vy *= -1;

        // Draw Star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${star.alpha})`; // Mystic Gold
        ctx.fill();

        // Connect near mouse
        const dxMouse = mouse.x - star.x;
        const dyMouse = mouse.y - star.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < MOUSE_DISTANCE) {
             // Connect to other stars
             for (let j = i + 1; j < stars.length; j++) {
                 const otherStar = stars[j];
                 const dx = star.x - otherStar.x;
                 const dy = star.y - otherStar.y;
                 const dist = Math.sqrt(dx * dx + dy * dy);

                 if (dist < CONNECTION_DISTANCE) {
                     ctx.beginPath();
                     ctx.moveTo(star.x, star.y);
                     ctx.lineTo(otherStar.x, otherStar.y);
                     // Fade line based on distance from mouse AND distance between stars
                     const opacity = (1 - dist / CONNECTION_DISTANCE) * (1 - distMouse / MOUSE_DISTANCE) * 0.5;
                     ctx.strokeStyle = `rgba(251, 191, 36, ${opacity})`;
                     ctx.lineWidth = 0.5;
                     ctx.stroke();
                 }
             }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 pointer-events-none opacity-60"
    />
  );
};

export default Starfield;