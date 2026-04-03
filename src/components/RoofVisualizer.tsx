import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoofDimensions, RoofType, LightSettings } from '../types';
import { createRoofGeometry } from '../lib/roof-math';

interface RoofVisualizerProps {
  type: RoofType;
  dims: RoofDimensions;
  color?: string;
  lightSettings: LightSettings;
}

const RoofVisualizer: React.FC<RoofVisualizerProps> = ({ type, dims, color = '#3b82f6', lightSettings }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const roofMeshRef = useRef<THREE.Mesh | null>(null);
  const frameRef = useRef<THREE.LineSegments | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Helper to create procedural siding texture
  const createSidingTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;

    for (let i = 0; i < 256; i += 16) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(256, i);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  };

  // Helper to create procedural brick texture for chimney
  const createBrickTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#991b1b'; // Dark red
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#fca5a5'; // Light red/pink for mortar
    ctx.lineWidth = 1;

    for (let y = 0; y < 128; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(128, y);
      ctx.stroke();
      
      const offset = (y / 16) % 2 === 0 ? 0 : 16;
      for (let x = offset; x < 128; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 16);
        ctx.stroke();
      }
    }

    return new THREE.CanvasTexture(canvas);
  };

  useEffect(() => {
    if (!mountRef.current) return;
    // ... (rest of the setup remains same until the update effect)

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f1f5f9'); // Slate 100
    scene.fog = new THREE.Fog('#f1f5f9', 20, 100);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(20, 20, 20);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2.1; // Prevent looking under the ground
    controls.minDistance = 10;
    controls.maxDistance = 60;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, lightSettings.ambientIntensity);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const directionalLight = new THREE.DirectionalLight(0xffffff, lightSettings.directionalIntensity);
    directionalLight.position.set(20, 40, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);
    directionalLightRef.current = directionalLight;

    // Hemisphere light for better outdoor feel
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // Ground Plane
    const groundGeom = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshPhongMaterial({ color: 0xe2e8f0 });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.name = 'ground';
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid Helper (Subtle)
    const gridHelper = new THREE.GridHelper(100, 40, 0xcbd5e1, 0xdbeafe);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler using ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries[0] || !rendererRef.current) return;
      const { width, height } = entries[0].contentRect;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    });
    resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update light intensities
  useEffect(() => {
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = lightSettings.ambientIntensity;
    }
    if (directionalLightRef.current) {
      directionalLightRef.current.intensity = lightSettings.directionalIntensity;
    }
  }, [lightSettings]);

  // Update roof geometry when type or dims change
  useEffect(() => {
    if (!sceneRef.current) return;

    // Remove old mesh and house parts
    sceneRef.current.children.forEach(child => {
      if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments || child instanceof THREE.Group) {
        if (child.name !== 'ground') { // Keep ground
          sceneRef.current?.remove(child);
          if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
            if (child.geometry) child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose());
            } else if (child.material) {
              child.material.dispose();
            }
          }
        }
      }
    });

    const wallHeight = 10;
    const sidingTexture = createSidingTexture();
    const brickTexture = createBrickTexture();

    // Foundation
    const foundationGeom = new THREE.BoxGeometry(dims.width + 0.5, 1, dims.length + 0.5);
    const foundationMat = new THREE.MeshPhongMaterial({ color: 0x64748b }); // Slate 500
    const foundation = new THREE.Mesh(foundationGeom, foundationMat);
    foundation.position.y = 0.5;
    foundation.receiveShadow = true;
    sceneRef.current.add(foundation);

    // Add house base (walls) with siding texture
    const houseBodyGeometry = new THREE.BoxGeometry(dims.width, wallHeight, dims.length);
    const houseBodyMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xf1f5f9, 
      map: sidingTexture,
      flatShading: true 
    });
    const houseBody = new THREE.Mesh(houseBodyGeometry, houseBodyMaterial);
    houseBody.position.y = wallHeight / 2 + 1; // Above foundation
    houseBody.castShadow = true;
    houseBody.receiveShadow = true;
    sceneRef.current.add(houseBody);

    // Detailed Windows & Door
    const createWindow = (x: number, y: number, z: number, rotationY = 0) => {
      const group = new THREE.Group();
      
      // Glass
      const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 3),
        new THREE.MeshPhongMaterial({ color: 0x334155, shininess: 100 })
      );
      group.add(glass);

      // Frame
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 3.2, 0.1),
        new THREE.MeshPhongMaterial({ color: 0xffffff })
      );
      frame.position.z = -0.05;
      group.add(frame);

      // Cross-panes
      const hPane = new THREE.Mesh(new THREE.BoxGeometry(2, 0.1, 0.05), new THREE.MeshPhongMaterial({ color: 0xffffff }));
      const vPane = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3, 0.05), new THREE.MeshPhongMaterial({ color: 0xffffff }));
      group.add(hPane);
      group.add(vPane);

      group.position.set(x, y, z);
      group.rotation.y = rotationY;
      return group;
    };

    // Front windows
    for (let i = -1; i <= 1; i += 2) {
      sceneRef.current.add(createWindow(i * (dims.width / 4), wallHeight / 2 + 2, dims.length / 2 + 0.05));
      sceneRef.current.add(createWindow(i * (dims.width / 4), wallHeight / 2 + 2, -dims.length / 2 - 0.05, Math.PI));
    }

    // Detailed Door
    const doorGroup = new THREE.Group();
    const doorMain = new THREE.Mesh(new THREE.BoxGeometry(3, 6, 0.2), new THREE.MeshPhongMaterial({ color: 0x475569 }));
    doorGroup.add(doorMain);
    const handle = new THREE.Mesh(new THREE.SphereGeometry(0.15), new THREE.MeshPhongMaterial({ color: 0xfacc15 }));
    handle.position.set(1.2, 0, 0.2);
    doorGroup.add(handle);
    doorGroup.position.set(0, 4, dims.length / 2 + 0.06);
    sceneRef.current.add(doorGroup);

    // Create new roof geometry
    const geometry = createRoofGeometry(type, dims);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(color),
      side: THREE.DoubleSide,
      flatShading: true,
      transparent: true,
      opacity: 0.95,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = wallHeight + 1; 
    mesh.castShadow = true;
    sceneRef.current.add(mesh);
    roofMeshRef.current = mesh;

    // Chimney
    const chimneyHeight = 6;
    const chimneyGeom = new THREE.BoxGeometry(2, chimneyHeight, 2);
    const chimneyMat = new THREE.MeshPhongMaterial({ map: brickTexture });
    const chimney = new THREE.Mesh(chimneyGeom, chimneyMat);
    chimney.position.set(dims.width / 4, wallHeight + 1 + chimneyHeight / 2 - 1, dims.length / 4);
    chimney.castShadow = true;
    sceneRef.current.add(chimney);

    // Landscaping
    const createBush = (x: number, z: number) => {
      const bush = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 8, 8),
        new THREE.MeshPhongMaterial({ color: 0x166534 })
      );
      bush.position.set(x, 1, z);
      bush.scale.y = 0.8;
      bush.castShadow = true;
      return bush;
    };

    sceneRef.current.add(createBush(dims.width / 2 + 3, dims.length / 2 - 2));
    sceneRef.current.add(createBush(-dims.width / 2 - 3, dims.length / 2 - 2));
    
    // Path
    const pathGeom = new THREE.PlaneGeometry(4, dims.length);
    const pathMat = new THREE.MeshPhongMaterial({ color: 0x94a3b8 });
    const path = new THREE.Mesh(pathGeom, pathMat);
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0.02, dims.length / 2 + dims.length / 4);
    sceneRef.current.add(path);

    // Wireframe
    const wireframe = new THREE.WireframeGeometry(geometry);
    const line = new THREE.LineSegments(wireframe);
    line.position.y = wallHeight + 1;
    (line.material as THREE.LineBasicMaterial).color.set(0x1e293b);
    (line.material as THREE.LineBasicMaterial).transparent = true;
    (line.material as THREE.LineBasicMaterial).opacity = 0.15;
    sceneRef.current.add(line);
    frameRef.current = line;

  }, [type, dims, color]);

  return <div ref={mountRef} className="w-full h-full min-h-[400px] rounded-xl overflow-hidden shadow-inner bg-slate-50" />;
};

export default RoofVisualizer;
