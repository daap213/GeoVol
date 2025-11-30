
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { FigureData, FigureType, Material } from '../types';
import { Layers, Ruler } from 'lucide-react';

interface Viewer3DProps {
  figures: FigureData[];
  materialConfig: Material;
}

export const Viewer3D: React.FC<Viewer3DProps> = ({ figures, materialConfig }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Refs to keep track of Three.js instances across renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const labelRendererRef = useRef<CSS2DRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshesRef = useRef<THREE.Mesh[]>([]);
  const requestRef = useRef<number>(0);

  // State
  const [isWireframe, setIsWireframe] = useState(false);
  const [showDimensions, setShowDimensions] = useState(true); // Default True

  // 1. Initialization Effect (Runs once)
  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f8fafc');
    sceneRef.current = scene;

    // Helpers
    const gridHelper = new THREE.GridHelper(50, 50, 0xcbd5e1, 0xe2e8f0);
    scene.add(gridHelper);
    
    // Initial Camera Setup
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    // Set initial position to a nice front-isometric view
    camera.position.set(20, 20, 30); 
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Label Renderer
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(width, height);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';
    mountRef.current.appendChild(labelRenderer.domElement);
    labelRendererRef.current = labelRenderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    // Prevent going below ground too much
    controls.maxPolarAngle = Math.PI / 2 + 0.1; 
    controlsRef.current = controls;

    // Lights
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
        if (!mountRef.current || !cameraRef.current || !rendererRef.current || !labelRendererRef.current) return;
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

    // Cleanup
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

  // 2. Update Geometry Effect (Runs when data/settings change)
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clean up old meshes only
    meshesRef.current.forEach(mesh => {
        // IMPORTANT: Manually remove CSS2DObjects from DOM
        // The render loop or CSS2DRenderer doesn't always automatically clean up DOM elements
        // if we are destroying the parent mesh entirely and recreating it.
        for (let i = mesh.children.length - 1; i >= 0; i--) {
            const child = mesh.children[i];
            if (child instanceof CSS2DObject) {
                if (child.element && child.element.parentNode) {
                    child.element.parentNode.removeChild(child.element);
                }
                mesh.remove(child);
            }
        }

        scene.remove(mesh);
        if (mesh.geometry) mesh.geometry.dispose();
    });
    meshesRef.current = [];

    const mainMaterial = new THREE.MeshStandardMaterial({ 
        color: materialConfig.color, 
        roughness: materialConfig.roughness,
        metalness: materialConfig.metalness,
        transparent: isWireframe,
        opacity: isWireframe ? 0.3 : 1.0,
        wireframe: false
    });

    let currentY = 0;

    figures.forEach(fig => {
        let geometry;
        const { height, radius, radiusBottom, width, depth } = fig.params;
        let yOffset = height / 2; 

        // Validate dimensions to prevent Three.js errors
        const safeH = Math.max(0.01, height);
        const safeR = Math.max(0.01, radius);
        const safeRBot = Math.max(0.01, radiusBottom);
        const safeW = Math.max(0.01, width);
        const safeD = Math.max(0.01, depth);

        switch (fig.type) {
            case FigureType.Cylinder:
                geometry = new THREE.CylinderGeometry(safeR, safeR, safeH, 32);
                break;
            case FigureType.Cube:
                geometry = new THREE.BoxGeometry(safeH, safeH, safeH);
                yOffset = safeH / 2;
                break;
            case FigureType.RectangularPrism:
                geometry = new THREE.BoxGeometry(safeW, safeH, safeD);
                yOffset = safeH / 2;
                break;
            case FigureType.Cone:
                geometry = new THREE.ConeGeometry(safeR, safeH, 32);
                yOffset = safeH / 2;
                break;
            case FigureType.TruncatedCone:
                geometry = new THREE.CylinderGeometry(safeR, safeRBot, safeH, 32);
                yOffset = safeH / 2;
                break;
            case FigureType.Sphere:
                geometry = new THREE.SphereGeometry(safeR, 32, 32);
                yOffset = safeR;
                break;
            case FigureType.Pyramid:
                geometry = new THREE.ConeGeometry(safeW / Math.sqrt(2), safeH, 4); 
                geometry.rotateY(Math.PI / 4);
                yOffset = safeH / 2;
                break;
        }

        if (geometry) {
            const mesh = new THREE.Mesh(geometry, mainMaterial.clone());
            mesh.castShadow = !isWireframe;
            mesh.receiveShadow = !isWireframe;
            
            // Edges
            const edges = new THREE.EdgesGeometry(geometry);
            const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: isWireframe ? 0xffffff : 0x000000, transparent: true, opacity: 0.2 }));
            mesh.add(line);

            if (isWireframe) {
                 const wireGeometry = new THREE.WireframeGeometry(geometry);
                 const wireframe = new THREE.LineSegments(wireGeometry, new THREE.LineBasicMaterial({ color: materialConfig.color }));
                 mesh.add(wireframe);
            }

            // Labels
            if (showDimensions) {
                // Height Label
                const hDiv = document.createElement('div');
                hDiv.className = 'bg-black/75 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm font-mono select-none pointer-events-none transition-opacity duration-200';
                hDiv.textContent = `H:${safeH}`;
                const hLabel = new CSS2DObject(hDiv);
                hLabel.position.set(0, 0, 0); 
                mesh.add(hLabel);
                
                // Radius/Width Label
                const wDiv = document.createElement('div');
                wDiv.className = 'bg-slate-200/90 text-slate-800 text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm font-mono border border-slate-300 select-none pointer-events-none transition-opacity duration-200';
                
                let wLabelPos = new THREE.Vector3(0, 0, 0);
                if (fig.type === FigureType.Cylinder || fig.type === FigureType.Cone || fig.type === FigureType.Sphere) {
                    wDiv.textContent = `R:${safeR}`;
                    wLabelPos.set(safeR, 0, 0);
                } else if (fig.type === FigureType.RectangularPrism || fig.type === FigureType.Pyramid) {
                    wDiv.textContent = `W:${safeW}`;
                    wLabelPos.set(safeW / 2, 0, 0);
                } else if (fig.type === FigureType.Cube) {
                     wDiv.textContent = `L:${safeH}`;
                     wLabelPos.set(safeH / 2, 0, 0);
                }

                const wLabel = new CSS2DObject(wDiv);
                wLabel.position.copy(wLabelPos);
                mesh.add(wLabel);
            }

            mesh.position.y = currentY + yOffset;
            scene.add(mesh);
            meshesRef.current.push(mesh);
            
            const addedHeight = (fig.type === FigureType.Sphere) ? (safeR * 2) : safeH;
            currentY += addedHeight;
        }
    });

    // Update Controls Target to center of mass, but DO NOT reset Camera Position completely
    if (controlsRef.current && figures.length > 0) {
        // Calculate new target center
        const newTargetY = currentY / 2;
        
        // Smoothly update target
        controlsRef.current.target.set(0, newTargetY, 0);
    } else if (controlsRef.current && figures.length === 0) {
        // Reset target if empty
        controlsRef.current.target.set(0, 0, 0);
    }

  }, [figures, isWireframe, showDimensions, materialConfig]);

  return (
    <div className="w-full h-full min-h-[400px] relative">
      <div ref={mountRef} className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 overflow-hidden" />
      
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-accent shadow-sm pointer-events-none z-10">
        Vista 3D Interactiva
      </div>

      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
          <button 
            onClick={() => setShowDimensions(!showDimensions)}
            className={`p-2 rounded-lg shadow border border-slate-200 transition-all ${showDimensions ? 'bg-accent text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            title="Mostrar/Ocultar Medidas"
          >
              <Ruler size={16} />
          </button>
          <button 
            onClick={() => setIsWireframe(!isWireframe)}
            className={`p-2 rounded-lg shadow border border-slate-200 transition-all ${isWireframe ? 'bg-accent text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            title="Alternar Vista de Alambre/Corte"
          >
              <Layers size={16} />
          </button>
      </div>
    </div>
  );
};
