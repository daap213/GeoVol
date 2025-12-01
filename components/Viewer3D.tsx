import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { FigureData, FigureType, Material } from '../types';
import { Layers, Ruler } from 'lucide-react';

interface Viewer3DProps {
  figures: FigureData[];
  materialConfig: Material;
}

export interface Viewer3DHandle {
  captureScreenshot: () => string;
}

export const Viewer3D = forwardRef<Viewer3DHandle, Viewer3DProps>(({ figures, materialConfig }, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const labelRendererRef = useRef<CSS2DRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshesRef = useRef<THREE.Mesh[]>([]);
  const requestRef = useRef<number>(0);

  const [isWireframe, setIsWireframe] = useState(false);
  const [showDimensions, setShowDimensions] = useState(true);

  // Expose capture method
  useImperativeHandle(ref, () => ({
    captureScreenshot: () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        return rendererRef.current.domElement.toDataURL('image/png');
      }
      return '';
    }
  }));

  // Initialize Scene (One time)
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f8fafc');
    sceneRef.current = scene;

    const gridHelper = new THREE.GridHelper(50, 50, 0xcbd5e1, 0xe2e8f0);
    scene.add(gridHelper);
    
    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 20, 30); 
    cameraRef.current = camera;

    // Renderers
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); // preserveDrawingBuffer needed for screenshot
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(width, height);
    Object.assign(labelRenderer.domElement.style, {
        position: 'absolute',
        top: '0px',
        pointerEvents: 'none'
    });
    mountRef.current.appendChild(labelRenderer.domElement);
    labelRendererRef.current = labelRenderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2 + 0.1; 
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);
    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(-5, 5, -10);
    scene.add(backLight);

    // Resize Handler
    const handleResize = () => {
        if (!cameraRef.current || !rendererRef.current || !labelRendererRef.current || !mountRef.current) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
        labelRendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    const animate = () => {
        requestRef.current = requestAnimationFrame(animate);
        if (controlsRef.current) controlsRef.current.update();
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
        if (labelRendererRef.current && sceneRef.current && cameraRef.current) {
            labelRendererRef.current.render(sceneRef.current, cameraRef.current);
        }
    };
    animate();

    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(requestRef.current);
        if (mountRef.current) {
            if (renderer.domElement) mountRef.current.removeChild(renderer.domElement);
            if (labelRenderer.domElement) mountRef.current.removeChild(labelRenderer.domElement);
        }
        renderer.dispose();
    };
  }, []);

  // Update Meshes (Reactive)
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Cleanup previous meshes
    meshesRef.current.forEach(mesh => {
        mesh.traverse((child) => {
            if (child instanceof CSS2DObject && child.element.parentNode) {
                child.element.parentNode.removeChild(child.element);
            }
        });
        scene.remove(mesh);
        if (mesh.geometry) mesh.geometry.dispose();
    });
    meshesRef.current = [];

    // Optimize: Create Material ONCE per update, not per loop
    const mainMaterial = new THREE.MeshStandardMaterial({ 
        color: materialConfig.color, 
        roughness: materialConfig.roughness,
        metalness: materialConfig.metalness,
        transparent: isWireframe,
        opacity: isWireframe ? 0.3 : 1.0,
        wireframe: false
    });

    // Optional: Wireframe material cache
    const wireframeMat = new THREE.LineBasicMaterial({ 
        color: isWireframe ? 0xffffff : 0x000000, 
        transparent: true, 
        opacity: 0.2 
    });
    const secondaryWireframeMat = new THREE.LineBasicMaterial({ color: materialConfig.color });

    let currentY = 0;

    figures.forEach(fig => {
        let geometry;
        const { height, radius, radiusBottom, width, depth } = fig.params;
        let yOffset = height / 2; 

        const safeH = Math.max(0.01, height);
        const safeR = Math.max(0.01, radius);
        const safeRBot = Math.max(0.01, radiusBottom);
        const safeW = Math.max(0.01, width);
        const safeD = Math.max(0.01, depth);

        // Geometry Factory
        switch (fig.type) {
            case FigureType.Cylinder: geometry = new THREE.CylinderGeometry(safeR, safeR, safeH, 32); break;
            case FigureType.Cube: geometry = new THREE.BoxGeometry(safeH, safeH, safeH); yOffset = safeH / 2; break;
            case FigureType.RectangularPrism: geometry = new THREE.BoxGeometry(safeW, safeH, safeD); yOffset = safeH / 2; break;
            case FigureType.Cone: geometry = new THREE.ConeGeometry(safeR, safeH, 32); yOffset = safeH / 2; break;
            case FigureType.TruncatedCone: geometry = new THREE.CylinderGeometry(safeR, safeRBot, safeH, 32); yOffset = safeH / 2; break;
            case FigureType.Sphere: geometry = new THREE.SphereGeometry(safeR, 32, 32); yOffset = safeR; break;
            case FigureType.Pyramid: 
                geometry = new THREE.ConeGeometry(safeW / Math.sqrt(2), safeH, 4); 
                geometry.rotateY(Math.PI / 4);
                yOffset = safeH / 2;
                break;
        }

        if (geometry) {
            const mesh = new THREE.Mesh(geometry, mainMaterial);
            mesh.castShadow = !isWireframe;
            mesh.receiveShadow = !isWireframe;
            
            // Edges optimization: Reusing geometry reference
            const edges = new THREE.EdgesGeometry(geometry);
            const line = new THREE.LineSegments(edges, wireframeMat);
            mesh.add(line);

            if (isWireframe) {
                 const wireGeometry = new THREE.WireframeGeometry(geometry);
                 const wireframe = new THREE.LineSegments(wireGeometry, secondaryWireframeMat);
                 mesh.add(wireframe);
            }

            // Labels Logic
            if (showDimensions) {
                const addLabel = (text: string, x: number, y: number, z: number, isDark = false) => {
                     const div = document.createElement('div');
                     div.className = `${isDark ? 'bg-black/75 text-white' : 'bg-slate-200/90 text-slate-800 border-slate-300'} text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm font-mono select-none pointer-events-none z-20`;
                     div.textContent = text;
                     const label = new CSS2DObject(div);
                     label.position.set(x, y, z);
                     mesh.add(label);
                };

                if (fig.type !== FigureType.Sphere) {
                    addLabel(`H:${safeH}`, 0, 0, 0, true);
                }
                
                let labelText = '';
                let lx = 0, lz = 0;

                if (fig.type === FigureType.Cylinder || fig.type === FigureType.Cone || fig.type === FigureType.Sphere) {
                    labelText = `R:${safeR}`; lx = safeR;
                } else if (fig.type === FigureType.TruncatedCone) {
                    labelText = `R:${safeRBot}/${safeR}`; lx = Math.max(safeR, safeRBot);
                } else if (fig.type === FigureType.RectangularPrism) {
                    labelText = `W:${safeW} D:${safeD}`; lx = safeW / 2; lz = safeD / 2;
                } else if (fig.type === FigureType.Pyramid) {
                    labelText = `W:${safeW}`; lx = safeW / 2;
                } else if (fig.type === FigureType.Cube) {
                     labelText = `L:${safeH}`; lx = safeH / 2;
                }

                if (labelText) addLabel(labelText, lx, 0, lz);
            }

            mesh.position.y = currentY + yOffset;
            scene.add(mesh);
            meshesRef.current.push(mesh);
            
            currentY += (fig.type === FigureType.Sphere) ? (safeR * 2) : safeH;
        }
    });

    // Update Camera Target nicely
    if (controlsRef.current) {
        const targetY = figures.length > 0 ? currentY / 2 : 0;
        controlsRef.current.target.set(0, targetY, 0);
    }

  }, [figures, isWireframe, showDimensions, materialConfig]);

  return (
    <div className="w-full h-full min-h-[400px] relative">
      <div ref={mountRef} className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 overflow-hidden" />
      
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-accent shadow-sm pointer-events-none z-10">
        Vista 3D Interactiva
      </div>

      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
          <button onClick={() => setShowDimensions(!showDimensions)} className={`p-2 rounded-lg shadow border transition-all ${showDimensions ? 'bg-accent text-white border-accent' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`} title="Mostrar Medidas">
              <Ruler size={16} />
          </button>
          <button onClick={() => setIsWireframe(!isWireframe)} className={`p-2 rounded-lg shadow border transition-all ${isWireframe ? 'bg-accent text-white border-accent' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`} title="Modo Alambre">
              <Layers size={16} />
          </button>
      </div>
    </div>
  );
});