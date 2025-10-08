'use client';

import { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  hue: number;
}

export default function DigitalOrganism() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mode, setMode] = useState<'attract' | 'repel' | 'flow'>('flow');
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize particles
    const particleCount = 2000;
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      life: Math.random(),
      hue: Math.random() * 360,
    }));

    let time = 0;

    const animate = () => {
      time += 0.01;
      
      // Fade trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p, i) => {
        // Calculate distance to mouse
        const dx = mousePos.x - p.x;
        const dy = mousePos.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Apply forces based on mode
        if (mode === 'attract' && dist > 5) {
          const force = Math.min(200 / dist, 5);
          p.vx += Math.cos(angle) * force * 0.1;
          p.vy += Math.sin(angle) * force * 0.1;
        } else if (mode === 'repel' && dist < 200) {
          const force = (200 - dist) / 200 * 3;
          p.vx -= Math.cos(angle) * force;
          p.vy -= Math.sin(angle) * force;
        } else if (mode === 'flow') {
          // Fluid flow field
          const flowX = Math.sin(p.y * 0.01 + time) * 0.5;
          const flowY = Math.cos(p.x * 0.01 + time) * 0.5;
          p.vx += flowX;
          p.vy += flowY;
        }

        // Particle interaction - flock behavior
        particlesRef.current.forEach((other, j) => {
          if (i === j) return;
          const dx2 = other.x - p.x;
          const dy2 = other.y - p.y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          
          if (dist2 < 30 && dist2 > 0) {
            // Alignment
            p.vx += (other.vx - p.vx) * 0.01;
            p.vy += (other.vy - p.vy) * 0.01;
            
            // Separation
            const angle2 = Math.atan2(dy2, dx2);
            p.vx -= Math.cos(angle2) * 0.1;
            p.vy -= Math.sin(angle2) * 0.1;
          }
        });

        // Apply friction
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Update color based on velocity
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        p.hue = (p.hue + speed * 0.5) % 360;
        p.life = Math.min(1, p.life + 0.01);

        // Draw particle
        const size = 2 + speed * 0.5;
        const alpha = p.life * 0.8;
        
        ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections
        particlesRef.current.forEach((other, j) => {
          if (j <= i) return;
          const dx3 = other.x - p.x;
          const dy3 = other.y - p.y;
          const dist3 = Math.sqrt(dx3 * dx3 + dy3 * dy3);
          
          if (dist3 < 50) {
            const lineAlpha = (1 - dist3 / 50) * 0.2;
            ctx.strokeStyle = `hsla(${(p.hue + other.hue) / 2}, 70%, 60%, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mousePos, mode]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        className="absolute inset-0"
      />
      
      <div className="absolute top-8 left-8 z-10 space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
          Digital Organism
        </h1>
        
        <div className="flex gap-2">
          <button
            onClick={() => setMode('flow')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              mode === 'flow'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Flow
          </button>
          <button
            onClick={() => setMode('attract')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              mode === 'attract'
                ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/50'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Attract
          </button>
          <button
            onClick={() => setMode('repel')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              mode === 'repel'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Repel
          </button>
        </div>

        <div className="text-gray-400 text-sm space-y-1">
          <p>🌊 Flow: Organic fluid motion</p>
          <p>🧲 Attract: Pull toward cursor</p>
          <p>💨 Repel: Push away from cursor</p>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 text-gray-500 text-xs">
        {particlesRef.current.length} particles
      </div>
    </div>
  );
}
