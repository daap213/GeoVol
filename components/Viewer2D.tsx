import React, { useRef, useEffect, useState } from 'react';
import { FigureData, FigureType } from '../types';
import { getFigureHeight } from '../utils';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface Viewer2DProps {
  figures: FigureData[];
}

export const Viewer2D: React.FC<Viewer2DProps> = ({ figures }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Transform State: Scale factor, Translate X, Translate Y
  const [transform, setTransform] = useState({ scale: 20, offsetX: 0, offsetY: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });

  // Auto-fit function
  const fitToScreen = () => {
    if (!containerRef.current) return;
    const height = containerRef.current.clientHeight;
    const totalWorldHeight = figures.reduce((acc, f) => acc + getFigureHeight(f.type, f.params), 0);
    
    // Find maximum width roughly
    const maxRadius = figures.reduce((max, f) => Math.max(max, f.params.radius || 0, (f.params.width || 0)/2, f.params.radiusBottom || 0), 0);
    
    const padding = 60;
    
    // Calculate scale based primarily on height, but check width too
    let newScale = totalWorldHeight > 0 
        ? (height - padding * 2) / totalWorldHeight 
        : 20;
    
    // Safety clamp
    newScale = Math.max(newScale, 5);
    newScale = Math.min(newScale, 100);

    setTransform({
        scale: newScale,
        offsetX: 0, // Reset pan to center
        offsetY: 0
    });
  };

  // Initial fit when figures change significantly (length change usually implies new object structure)
  useEffect(() => {
    fitToScreen();
  }, [figures.length]);

  // Drawing Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive canvas
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const centerX = canvas.width / 2 + transform.offsetX;
    
    // Determine starting Y based on total height and offset
    // We want the base of the object to be somewhat grounded, but panning changes this
    const totalWorldHeight = figures.reduce((acc, f) => acc + getFigureHeight(f.type, f.params), 0);
    const groundY = (canvas.height / 2) + (totalWorldHeight * transform.scale / 2) + transform.offsetY;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid lines for reference (optional, keeps it minimal)
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    const gridSize = 50;
    
    // Ground line
    ctx.beginPath();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();

    let currentY = groundY;

    figures.forEach(fig => {
        const h = fig.params.height * transform.scale;
        const r = fig.params.radius * transform.scale;
        const rBot = fig.params.radiusBottom * transform.scale;
        const w = fig.params.width * transform.scale;
        
        ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'; // Blue-500 with low opacity
        ctx.strokeStyle = '#3b82f6'; // Blue-500
        ctx.lineWidth = 2;
        ctx.beginPath();

        switch (fig.type) {
            case FigureType.Cylinder:
                ctx.rect(centerX - r, currentY - h, r * 2, h);
                ctx.fill();
                ctx.stroke();
                // Caps
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
                // Base
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
                 // Bases
                 ctx.beginPath();
                 ctx.ellipse(centerX, currentY, rBot, rBot * 0.2, 0, 0, Math.PI * 2);
                 ctx.stroke();
                 ctx.beginPath();
                 ctx.ellipse(centerX, currentY - h, r, r * 0.2, 0, 0, Math.PI * 2);
                 ctx.stroke();
                currentY -= h;
                break;

            case FigureType.Sphere:
                const rad = fig.params.radius * transform.scale;
                const centerY = currentY - rad;
                ctx.arc(centerX, centerY, rad, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                currentY -= (rad * 2);
                break;
            
            case FigureType.Pyramid:
                const baseHalf = (fig.params.width * transform.scale) / 2;
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
  }, [figures, transform]);

  // Mouse Handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleAmount = -e.deltaY * 0.05;
    const newScale = Math.min(Math.max(transform.scale + scaleAmount, 5), 200);
    setTransform(prev => ({ ...prev, scale: newScale }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;
    setTransform(prev => ({
        ...prev,
        offsetX: prev.offsetX + dx,
        offsetY: prev.offsetY + dy
    }));
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px] bg-slate-50 rounded-lg border border-slate-200 overflow-hidden relative group">
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-secondary shadow-sm z-10">
        Vista Frontal (2D)
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-10">
        <button onClick={() => setTransform(prev => ({...prev, scale: Math.min(prev.scale * 1.2, 200)}))} className="p-2 bg-white rounded-lg shadow border border-slate-200 hover:bg-slate-50 text-slate-600">
            <ZoomIn size={16} />
        </button>
        <button onClick={() => setTransform(prev => ({...prev, scale: Math.max(prev.scale * 0.8, 5)}))} className="p-2 bg-white rounded-lg shadow border border-slate-200 hover:bg-slate-50 text-slate-600">
            <ZoomOut size={16} />
        </button>
        <button onClick={fitToScreen} className="p-2 bg-white rounded-lg shadow border border-slate-200 hover:bg-slate-50 text-slate-600">
            <Maximize size={16} />
        </button>
      </div>

      <canvas 
        ref={canvasRef} 
        className={`block w-full h-full cursor-${isDragging ? 'grabbing' : 'grab'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};
