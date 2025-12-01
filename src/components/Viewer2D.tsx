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
    
    // Find maximum width correctly based on figure type
    const maxRadius = figures.reduce((max, f) => {
        let currentR = 0;
        if (f.type === FigureType.Cube) {
            currentR = f.params.height / 2;
        } else if (f.type === FigureType.RectangularPrism || f.type === FigureType.Pyramid) {
            currentR = f.params.width / 2;
        } else if (f.type === FigureType.TruncatedCone) {
            currentR = Math.max(f.params.radius, f.params.radiusBottom);
        } else {
            // Cylinder, Cone, Sphere
            currentR = f.params.radius;
        }
        return Math.max(max, currentR);
    }, 0);
    
    const padding = 80; // Padding for labels
    
    // Calculate scale based primarily on height
    let newScale = totalWorldHeight > 0 
        ? (height - padding * 2) / totalWorldHeight 
        : 20;
    
    // Check if width exceeds bounds with this scale
    const width = containerRef.current.clientWidth;
    if (maxRadius * 2 * newScale > width - padding) {
        newScale = (width - padding) / (maxRadius * 2);
    }

    // Safety clamp
    newScale = Math.max(newScale, 5);
    newScale = Math.min(newScale, 100);

    setTransform({
        scale: newScale,
        offsetX: 0, // Reset pan to center
        offsetY: 0
    });
  };

  // Debounced Auto-fit logic for initial loads or structural changes
  useEffect(() => {
    // Timer to avoid resizing constantly while user types (debounce)
    const timer = setTimeout(() => {
        fitToScreen();
    }, 600); // 600ms debounce
    return () => clearTimeout(timer);
  }, [figures]); // Trigger on ANY figure change (dimensions or count)

  // Initial fit
  useEffect(() => { fitToScreen(); }, []);

  // Native Wheel Event
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheelNative = (e: WheelEvent) => {
        e.preventDefault();
        const scaleAmount = -e.deltaY * 0.05;
        setTransform(prev => ({
            ...prev,
            scale: Math.min(Math.max(prev.scale + scaleAmount, 5), 200)
        }));
    };
    canvas.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheelNative);
  }, []);

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
    
    // Determine starting Y
    const totalWorldHeight = figures.reduce((acc, f) => acc + getFigureHeight(f.type, f.params), 0);
    const groundY = (canvas.height / 2) + (totalWorldHeight * transform.scale / 2) + transform.offsetY;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid / Ground
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    // Simple Grid
    for(let i=0; i<canvas.width; i+=40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
    for(let i=0; i<canvas.height; i+=40) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(canvas.width, i); ctx.stroke(); }

    // Hard Ground Line
    ctx.beginPath();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();

    let currentY = groundY;

    // Font for labels
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    figures.forEach(fig => {
        const h = fig.params.height * transform.scale;
        const r = fig.params.radius * transform.scale;
        const rBot = fig.params.radiusBottom * transform.scale;
        const w = fig.params.width * transform.scale;
        
        ctx.fillStyle = 'rgba(59, 130, 246, 0.1)'; 
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        let labelH_Y = currentY - h / 2;
        let labelH_X = centerX + Math.max(r, w/2, rBot) + 15;
        let labelW_Text = "";

        switch (fig.type) {
            case FigureType.Cylinder:
                ctx.rect(centerX - r, currentY - h, r * 2, h);
                ctx.fill(); ctx.stroke();
                // Caps
                ctx.beginPath(); ctx.ellipse(centerX, currentY, r, r * 0.2, 0, 0, Math.PI * 2); ctx.stroke();
                ctx.beginPath(); ctx.ellipse(centerX, currentY - h, r, r * 0.2, 0, 0, Math.PI * 2); ctx.stroke();
                
                labelW_Text = `R: ${fig.params.radius}`;
                labelH_X = centerX + r + 10;
                break;
            
            case FigureType.Cube:
                ctx.rect(centerX - h/2, currentY - h, h, h);
                ctx.fill(); ctx.stroke();
                labelW_Text = `L: ${fig.params.height}`;
                labelH_X = centerX + h/2 + 10;
                break;

            case FigureType.RectangularPrism:
                ctx.rect(centerX - w/2, currentY - h, w, h);
                ctx.fill(); ctx.stroke();
                labelW_Text = `W: ${fig.params.width}`;
                labelH_X = centerX + w/2 + 10;
                break;
            
            case FigureType.Cone:
                ctx.moveTo(centerX - r, currentY);
                ctx.lineTo(centerX, currentY - h);
                ctx.lineTo(centerX + r, currentY);
                ctx.closePath();
                ctx.fill(); ctx.stroke();
                // Base
                ctx.beginPath(); ctx.ellipse(centerX, currentY, r, r * 0.2, 0, 0, Math.PI * 2); ctx.stroke();
                labelW_Text = `R: ${fig.params.radius}`;
                labelH_X = centerX + r + 10;
                break;

            case FigureType.TruncatedCone:
                ctx.moveTo(centerX - rBot, currentY);
                ctx.lineTo(centerX - r, currentY - h);
                ctx.lineTo(centerX + r, currentY - h);
                ctx.lineTo(centerX + rBot, currentY);
                ctx.closePath();
                ctx.fill(); ctx.stroke();
                 // Bases
                 ctx.beginPath(); ctx.ellipse(centerX, currentY, rBot, rBot * 0.2, 0, 0, Math.PI * 2); ctx.stroke();
                 ctx.beginPath(); ctx.ellipse(centerX, currentY - h, r, r * 0.2, 0, 0, Math.PI * 2); ctx.stroke();
                 labelW_Text = `R: ${fig.params.radiusBottom} / ${fig.params.radius}`;
                 labelH_X = centerX + Math.max(r, rBot) + 10;
                break;

            case FigureType.Sphere:
                const rad = fig.params.radius * transform.scale;
                const centerY = currentY - rad;
                ctx.arc(centerX, centerY, rad, 0, Math.PI * 2);
                ctx.fill(); ctx.stroke();
                labelH_Y = centerY;
                labelW_Text = `R: ${fig.params.radius}`;
                labelH_X = centerX + rad + 10;
                break;
            
            case FigureType.Pyramid:
                const baseHalf = (fig.params.width * transform.scale) / 2;
                ctx.moveTo(centerX - baseHalf, currentY);
                ctx.lineTo(centerX, currentY - h);
                ctx.lineTo(centerX + baseHalf, currentY);
                ctx.closePath();
                ctx.fill(); ctx.stroke();
                labelW_Text = `W: ${fig.params.width}`;
                labelH_X = centerX + baseHalf + 10;
                break;
        }

        // Draw Dimensions
        ctx.fillStyle = '#64748b';
        
        // Height Label
        if (fig.type !== FigureType.Sphere) {
            ctx.textAlign = 'left';
            ctx.fillText(`H: ${fig.params.height}`, labelH_X, labelH_Y);
            // Draw little indicator line
            ctx.strokeStyle = '#cbd5e1';
            ctx.beginPath();
            ctx.moveTo(labelH_X - 2, labelH_Y);
            ctx.lineTo(labelH_X - 8, labelH_Y);
            ctx.stroke();
        }

        // Width/Radius Label
        if (labelW_Text) {
             ctx.textAlign = 'center';
             // Draw below the object
             ctx.fillText(labelW_Text, centerX, currentY + 10);
        }

        const addedHeight = (fig.type === FigureType.Sphere) ? (fig.params.radius * transform.scale * 2) : h;
        currentY -= addedHeight;
    });
  }, [figures, transform]);

  // Mouse Handlers
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
    <div ref={containerRef} className="w-full h-full min-h-[400px] bg-slate-50 rounded-lg border border-slate-200 overflow-hidden relative group select-none">
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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};