import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FigureData, FigureType } from '../types';

interface Viewer3DProps {
  figures: FigureData[];
}

export const Viewer3D: React.FC<Viewer3DProps> = ({ figures }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f8fafc'); // Match app background
    // Add grid helper
    const gridHelper = new THREE.GridHelper(50, 50, 0xcbd5e1, 0xe2e8f0);
    scene.add(gridHelper);

    const camera = new THREE.PerspectiveCamera(50, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
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
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Initial Camera Position
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);

    // --- Object Generation Logic ---
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x3b82f6, 
        roughness: 0.3,
        metalness: 0.1,
        transparent: true,
        opacity: 0.9
    });
    
    const meshes: THREE.Mesh[] = [];

    let currentY = 0;

    figures.forEach(fig => {
        let geometry;
        const { height, radius, radiusBottom, width, depth } = fig.params;
        let yOffset = height / 2; // Default for most shapes centered at local 0

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
                yOffset = radius; // Sphere center is at radius
                break;
            case FigureType.Pyramid:
                // Box Geometry simplified, or Cone with 4 radial segments for pyramid
                geometry = new THREE.ConeGeometry(width / Math.sqrt(2), height, 4); 
                // Rotate to align flat side
                geometry.rotateY(Math.PI / 4);
                yOffset = height / 2;
                break;
        }

        if (geometry) {
            const mesh = new THREE.Mesh(geometry, material.clone());
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            // Edges for better visual
            const edges = new THREE.EdgesGeometry(geometry);
            const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x1e40af }));
            mesh.add(line);

            mesh.position.y = currentY + yOffset;
            scene.add(mesh);
            meshes.push(mesh);
            
            // Advance height cursor
            const addedHeight = (fig.type === FigureType.Sphere) ? (radius * 2) : height;
            currentY += addedHeight;
        }
    });

    // Auto-center Camera logic
    if (meshes.length > 0) {
        const totalHeight = currentY;
        controls.target.set(0, totalHeight / 2, 0);
        
        // Adjust zoom slightly based on height
        const dist = Math.max(15, totalHeight * 1.5);
        camera.position.set(dist, totalHeight * 0.8, dist);
    }

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
        cancelAnimationFrame(animationId);
        if (mountRef.current) {
            mountRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
        scene.clear();
    };
  }, [figures]); // Re-run when figures change

  return (
    <div ref={mountRef} className="w-full h-full min-h-[400px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 relative overflow-hidden">
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-accent shadow-sm pointer-events-none z-10">
        Vista 3D Interactiva
      </div>
    </div>
  );
};