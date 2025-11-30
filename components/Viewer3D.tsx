import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FigureData, FigureType, Material } from '../types';
import { Layers } from 'lucide-react';

interface Viewer3DProps {
  figures: FigureData[];
  materialConfig: Material;
}

export const Viewer3D: React.FC<Viewer3DProps> = ({ figures, materialConfig }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isWireframe, setIsWireframe] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f8fafc'); // Match app background
    
    // Grid
    const gridHelper = new THREE.GridHelper(50, 50, 0xcbd5e1, 0xe2e8f0);
    scene.add(gridHelper);

    // Axes
    const axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper);

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Back light for definition
    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(-5, 5, -10);
    scene.add(backLight);

    // --- Object Generation Logic ---
    // Update material based on config
    const mainMaterial = new THREE.MeshStandardMaterial({ 
        color: materialConfig.color, 
        roughness: materialConfig.roughness,
        metalness: materialConfig.metalness,
        transparent: isWireframe,
        opacity: isWireframe ? 0.3 : 1.0,
        wireframe: false
    });
    
    const meshes: THREE.Mesh[] = [];
    let currentY = 0;

    figures.forEach(fig => {
        let geometry;
        const { height, radius, radiusBottom, width, depth } = fig.params;
        let yOffset = height / 2; 

        switch (fig.type) {
            case FigureType.Cylinder:
                geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
                break;
            case FigureType.Cube:
                geometry = new THREE.BoxGeometry(height, height, height);
                yOffset = height / 2;
                break;
            case FigureType.RectangularPrism:
                geometry = new THREE.BoxGeometry(width, height, depth);
                yOffset = height / 2;
                break;
            case FigureType.Cone:
                geometry = new THREE.ConeGeometry(radius, height, 32);
                yOffset = height / 2;
                break;
            case FigureType.TruncatedCone:
                geometry = new THREE.CylinderGeometry(radius, radiusBottom, height, 32);
                yOffset = height / 2;
                break;
            case FigureType.Sphere:
                geometry = new THREE.SphereGeometry(radius, 32, 32);
                yOffset = radius;
                break;
            case FigureType.Pyramid:
                geometry = new THREE.ConeGeometry(width / Math.sqrt(2), height, 4); 
                geometry.rotateY(Math.PI / 4);
                yOffset = height / 2;
                break;
        }

        if (geometry) {
            const mesh = new THREE.Mesh(geometry, mainMaterial.clone());
            mesh.castShadow = !isWireframe;
            mesh.receiveShadow = !isWireframe;
            
            // Highlight edges always
            const edges = new THREE.EdgesGeometry(geometry);
            const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: isWireframe ? 0xffffff : 0x000000, transparent: true, opacity: 0.2 }));
            mesh.add(line);

            if (isWireframe) {
                // Add internal structure hint
                 const wireGeometry = new THREE.WireframeGeometry(geometry);
                 const wireframe = new THREE.LineSegments(wireGeometry, new THREE.LineBasicMaterial({ color: materialConfig.color }));
                 mesh.add(wireframe);
            }

            mesh.position.y = currentY + yOffset;
            scene.add(mesh);
            meshes.push(mesh);
            
            const addedHeight = (fig.type === FigureType.Sphere) ? (radius * 2) : height;
            currentY += addedHeight;
        }
    });

    // Smart Camera Positioning
    if (meshes.length > 0) {
        const totalHeight = currentY;
        
        // Calculate bounding box max dimension to fit width
        const maxDim = figures.reduce((max, f) => {
            const dim = Math.max(f.params.width || 0, (f.params.radius || 0)*2, (f.params.radiusBottom || 0)*2);
            return Math.max(max, dim);
        }, 0);

        controls.target.set(0, totalHeight / 2, 0);
        
        // Position camera to fit object
        const fitHeight = Math.max(totalHeight, maxDim * 2);
        camera.position.set(fitHeight, fitHeight * 0.8, fitHeight);
    } else {
        camera.position.set(10, 10, 10);
        controls.target.set(0, 0, 0);
    }

    // Handle Resize
    const handleResize = () => {
        if (!mountRef.current) return;
        const newWidth = mountRef.current.clientWidth;
        const newHeight = mountRef.current.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationId: number;
    const animate = () => {
        animationId = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationId);
        if (mountRef.current) {
            mountRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
        scene.clear();
        mainMaterial.dispose();
        meshes.forEach(m => {
            m.geometry.dispose();
        });
    };
  }, [figures, isWireframe, materialConfig]);

  return (
    <div className="w-full h-full min-h-[400px] relative">
      <div ref={mountRef} className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 overflow-hidden" />
      
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-accent shadow-sm pointer-events-none z-10">
        Vista 3D Interactiva
      </div>

      <div className="absolute bottom-4 right-4 z-10">
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
