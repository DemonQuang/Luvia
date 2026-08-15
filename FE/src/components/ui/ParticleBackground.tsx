import React, { useEffect, useRef } from 'react';

interface ParticleBackgroundProps {
  type: string; // 'heart' | 'snow' | 'flower' | 'leaf' | 'bubble' | 'confetti' | 'sparkle' | 'light' | 'none'
  primaryColor?: string;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ type, primaryColor }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || type === 'none') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Particle[] = [];
    const particleCount = type === 'snow' || type === 'confetti' ? 70 : 35;

    class Particle {
      x = Math.random() * width;
      y = Math.random() * height;
      size = 0;
      speedY = 0;
      speedX = 0;
      rotation = Math.random() * Math.PI * 2;
      rotationSpeed = (Math.random() - 0.5) * 0.02;
      color = '';
      opacity = Math.random() * 0.5 + 0.2;

      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : -20;
        this.opacity = Math.random() * 0.5 + 0.2;

        if (type === 'snow') {
          this.size = Math.random() * 3 + 1.5;
          this.speedY = Math.random() * 1.2 + 0.6;
          this.speedX = (Math.random() - 0.5) * 0.5;
          this.color = '#ffffff';
        } else if (type === 'bubble') {
          this.size = Math.random() * 10 + 4;
          this.speedY = -(Math.random() * 0.8 + 0.4); // bubbles rise
          this.speedX = (Math.random() - 0.5) * 0.4;
          this.y = init ? Math.random() * height : height + 20; // start from bottom
          this.color = primaryColor || '#ff5e9c';
        } else if (type === 'heart') {
          this.size = Math.random() * 12 + 6;
          this.speedY = Math.random() * 0.8 + 0.4;
          this.speedX = (Math.random() - 0.5) * 0.4;
          this.color = primaryColor || '#ff5e9c';
        } else if (type === 'flower') {
          this.size = Math.random() * 8 + 4;
          this.speedY = Math.random() * 0.9 + 0.5;
          this.speedX = Math.random() * 0.8 + 0.2; // drift right
          this.color = '#ffb3d1'; // pink petals
        } else if (type === 'leaf') {
          this.size = Math.random() * 10 + 6;
          this.speedY = Math.random() * 0.7 + 0.4;
          this.speedX = (Math.random() - 0.5) * 0.8;
          const leafColors = ['#a8e6cf', '#ffd3b6', '#ff8b94', '#dcedc1', '#74b9ff'];
          this.color = leafColors[Math.floor(Math.random() * leafColors.length)];
        } else if (type === 'confetti') {
          this.size = Math.random() * 6 + 4;
          this.speedY = Math.random() * 1.8 + 1.2;
          this.speedX = (Math.random() - 0.5) * 1.5;
          const confColors = ['#ff7675', '#74b9ff', '#55efc4', '#ffeaa7', '#a29bfe', '#fd79a8'];
          this.color = confColors[Math.floor(Math.random() * confColors.length)];
        } else if (type === 'sparkle') {
          this.size = Math.random() * 5 + 3;
          this.speedY = (Math.random() - 0.5) * 0.2;
          this.speedX = (Math.random() - 0.5) * 0.2;
          this.color = '#ffeaa7'; // gold
        } else if (type === 'light') {
          this.size = Math.random() * 30 + 15;
          this.speedY = -(Math.random() * 0.3 + 0.1); // float up
          this.speedX = (Math.random() - 0.5) * 0.3;
          this.color = '#ffeaa7';
          this.opacity = Math.random() * 0.15 + 0.05;
        }
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;

        if (type === 'bubble' || type === 'light') {
          if (this.y < -30 || this.x < -20 || this.x > width + 20) {
            this.reset();
          }
        } else {
          if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
            this.reset();
          }
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;

        if (type === 'snow') {
          ctx.beginPath();
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
        } else if (type === 'bubble') {
          ctx.beginPath();
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 1;
          ctx.stroke();
          // highlight shine
          ctx.beginPath();
          ctx.arc(-this.size * 0.3, -this.size * 0.3, this.size * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.fill();
        } else if (type === 'heart') {
          ctx.beginPath();
          ctx.moveTo(0, -this.size / 4);
          ctx.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size, -this.size / 4, -this.size, this.size / 4);
          ctx.bezierCurveTo(-this.size, this.size * 0.7, 0, this.size, 0, this.size * 1.1);
          ctx.bezierCurveTo(0, this.size, this.size, this.size * 0.7, this.size, this.size / 4);
          ctx.bezierCurveTo(this.size, -this.size / 4, this.size / 2, -this.size / 2, 0, -this.size / 4);
          ctx.fillStyle = this.color;
          ctx.fill();
        } else if (type === 'flower') {
          // Draw a petal
          ctx.beginPath();
          ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
          // draw center line
          ctx.beginPath();
          ctx.moveTo(-this.size, 0);
          ctx.lineTo(this.size * 0.5, 0);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (type === 'leaf') {
          // Draw leaf shape
          ctx.beginPath();
          ctx.moveTo(0, -this.size);
          ctx.quadraticCurveTo(-this.size * 0.6, 0, 0, this.size);
          ctx.quadraticCurveTo(this.size * 0.6, 0, 0, -this.size);
          ctx.fillStyle = this.color;
          ctx.fill();
        } else if (type === 'confetti') {
          // Draw rectangle
          ctx.fillStyle = this.color;
          ctx.fillRect(-this.size, -this.size / 2, this.size * 2, this.size);
        } else if (type === 'sparkle') {
          // Draw 4-point star
          ctx.beginPath();
          ctx.moveTo(0, -this.size);
          ctx.lineTo(this.size * 0.2, -this.size * 0.2);
          ctx.lineTo(this.size, 0);
          ctx.lineTo(this.size * 0.2, this.size * 0.2);
          ctx.lineTo(0, this.size);
          ctx.lineTo(-this.size * 0.2, this.size * 0.2);
          ctx.lineTo(-this.size, 0);
          ctx.lineTo(-this.size * 0.2, -this.size * 0.2);
          ctx.closePath();
          ctx.fillStyle = this.color;
          ctx.fill();
        } else if (type === 'light') {
          // Blur circle
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
          grad.addColorStop(0, this.color);
          grad.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        ctx.restore();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      particles.forEach((p) => p.reset(true));
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [type, primaryColor]);

  if (type === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full bg-transparent -z-10 pointer-events-none"
      style={{ mixBlendMode: type === 'light' || type === 'sparkle' ? 'screen' : 'normal' }}
    />
  );
};
