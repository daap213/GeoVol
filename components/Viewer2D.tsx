import React, { useRef, useEffect } from 'react';
import { FigureData, FigureType } from '../types';
import { getFigureHeight } from '../utils';

interface Viewer2DProps {
  figures: FigureData[];
}

export const Viewer2D: React.FC<Viewer2DProps> = ({ figures }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive canvas
    const updateSize = () => {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        draw();
    };

    window.addEventListener('resize', updateSize);
    updateSize();

    function draw() {
        if (!canvas || !ctx) return;
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        
        ctx.clearRect(0, 0, width, height);

        // Calculate total height to auto-scale
        const totalWorldHeight = figures.reduce((acc, f) => acc + getFigureHeight(f.type, f.params), 0);
        const padding = 40;
        // If empty, default scale
        const scale = totalWorldHeight > 0 
            ? Math.min(25, (height - padding * 2) / totalWorldHeight) 
            : 20;

        // Draw ground line
        ctx.beginPath();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.moveTo(0, height - padding);
        ctx.lineTo(width, height - padding);
        ctx.stroke();

        let currentY = height - padding;

        figures.forEach(fig => {
            const h = fig.params.height * scale;
            const r = fig.params.radius * scale;
            const rBot = fig.params.radiusBottom * scale;
            const w = fig.params.width * scale;
            // const d = fig.params.depth * scale; // Depth not shown in 2D profile often

            ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'; // Blue-500 with low opacity
            ctx.strokeStyle = '#3b82f6'; // Blue-500
            ctx.lineWidth = 2;
            ctx.beginPath();

            switch (fig.type) {
                case FigureType.Cylinder:
                    ctx.rect(centerX - r, currentY - h, r * 2, h);
                    ctx.fill();
                    ctx.stroke();
                    // Caps visual hint
                    ctx.beginPath();
                    ctx.ellipse(centerX, currentY, r, r * 0.2, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.ellipse(centerX, currentY - h, r, r * 0.2, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    currentY -= h;
                    break;
                
                case FigureType.Cube:
                    ctx.rect(centerX - h/2, currentY - h, h, h);
                    ctx.fill();
                    ctx.stroke();
                    currentY -= h;
                    break;

                case FigureType.RectangularPrism:
                    ctx.rect(centerX - w/2, currentY - h, w, h);
                    ctx.fill();
                    ctx.stroke();
                    currentY -= h;
                    break;
                
                case FigureType.Cone:
                    ctx.moveTo(centerX - r, currentY);
                    ctx.lineTo(centerX, currentY - h);
                    ctx.lineTo(centerX + r, currentY);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    // Base visual hint
                    ctx.beginPath();
                    ctx.ellipse(centerX, currentY, r, r * 0.2, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    currentY -= h;
                    break;

                case FigureType.TruncatedCone:
                    ctx.moveTo(centerX - rBot, currentY);
                    ctx.lineTo(centerX - r, currentY - h);
                    ctx.lineTo(centerX + r, currentY - h);
                    ctx.lineTo(centerX + rBot, currentY);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                     // Base visual hints
                     ctx.beginPath();
                     ctx.ellipse(centerX, currentY, rBot, rBot * 0.2, 0, 0, Math.PI * 2);
                     ctx.stroke();
                     ctx.beginPath();
                     ctx.ellipse(centerX, currentY - h, r, r * 0.2, 0, 0, Math.PI * 2);
                     ctx.stroke();
                    currentY -= h;
                    break;

                case FigureType.Sphere:
                    const rad = fig.params.radius * scale;
                    // Sphere center is up by radius
                    const centerY = currentY - rad;
                    ctx.arc(centerX, centerY, rad, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                    currentY -= (rad * 2);
                    break;
                
                case FigureType.Pyramid:
                    // Profile of a square pyramid is a triangle
                    const baseHalf = (fig.params.width * scale) / 2;
                    ctx.moveTo(centerX - baseHalf, currentY);
                    ctx.lineTo(centerX, currentY - h);
                    ctx.lineTo(centerX + baseHalf, currentY);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    currentY -= h;
                    break;
            }
        });
    }

    return () => window.removeEventListener('resize', updateSize);
  }, [figures]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px] bg-slate-50 rounded-lg border border-slate-200 overflow-hidden relative">
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-secondary shadow-sm">
        Vista Frontal (2D)
      </div>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};