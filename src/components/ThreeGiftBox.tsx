import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CustomGiftBoxItem, RibbonStyle } from '../types.ts';

interface ThreeGiftBoxProps {
  boxColor: string;
  lidColor?: string;
  ribbonColor: string;
  ribbonStyle: RibbonStyle['style'];
  items: CustomGiftBoxItem[];
  isOpen: boolean;
  onToggleOpen?: () => void;
  recipientName?: string;
}

export const ThreeGiftBox: React.FC<ThreeGiftBoxProps> = ({
  boxColor,
  ribbonColor,
  items,
  isOpen,
  onToggleOpen,
  recipientName,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const lidGroupRef = useRef<THREE.Group | null>(null);
  const boxMeshRef = useRef<THREE.Mesh | null>(null);
  const ribbonMeshesRef = useRef<THREE.Mesh[]>([]);
  const itemsGroupRef = useRef<THREE.Group | null>(null);
  const sparklesGroupRef = useRef<THREE.Points | null>(null);
  const animStateRef = useRef({
    lidProgress: isOpen ? 1 : 0,
    targetProgress: isOpen ? 1 : 0,
    sparkleOpacities: [] as number[],
  });

  // Track user drag/rotate
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.35, y: -0.55 });
  const zoomRef = useRef(4.8);

  const [isHovered, setIsHovered] = useState(false);

  // Update target progress when isOpen changes
  useEffect(() => {
    animStateRef.current.targetProgress = isOpen ? 1 : 0;
  }, [isOpen]);

  // Update colors when props change
  useEffect(() => {
    if (boxMeshRef.current) {
      (boxMeshRef.current.material as THREE.MeshStandardMaterial).color.set(boxColor);
    }
    ribbonMeshesRef.current.forEach((m) => {
      (m.material as THREE.MeshStandardMaterial).color.set(ribbonColor);
    });
  }, [boxColor, ribbonColor]);

  // Update inside items when items prop changes
  useEffect(() => {
    if (!itemsGroupRef.current) return;
    const group = itemsGroupRef.current;
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if ((child as any).geometry) (child as any).geometry.dispose();
    }

    // Auto-layout inside items in a 2x2 or circular grid inside the box
    const totalItems = items.reduce((sum, it) => sum + it.quantity, 0);
    let itemIdx = 0;

    items.forEach((item) => {
      for (let q = 0; q < item.quantity; q++) {
        const itemModel = create3DItemModel(item.product.modelShape || 'gift_card', item.product.colorHint || '#F8BBD0');
        
        // Compute position inside box (box dimensions approx 2.0 width x 2.0 depth, inner area ~1.7)
        const angle = (itemIdx / Math.max(1, totalItems)) * Math.PI * 2;
        const radius = totalItems === 1 ? 0 : totalItems <= 3 ? 0.45 : 0.6;
        const posX = Math.cos(angle) * radius;
        const posZ = Math.sin(angle) * radius;
        
        itemModel.position.set(posX, 0.1, posZ);
        itemModel.rotation.y = angle + Math.PI / 4;
        group.add(itemModel);
        itemIdx++;
      }
    });
  }, [items]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.5, zoomRef.current);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xfff9f5, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff0f5, 1.8);
    keyLight.position.set(4, 7, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe6d6ff, 1.1);
    fillLight.position.set(-5, 3, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.9);
    rimLight.position.set(0, 6, -5);
    scene.add(rimLight);

    // Ground contact shadow disc
    const groundGeo = new THREE.CircleGeometry(1.6, 32);
    const groundMat = new THREE.MeshBasicMaterial({
      color: 0xc45a7a,
      transparent: true,
      opacity: 0.12,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    scene.add(ground);

    // Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Materials
    const boxMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(boxColor),
      roughness: 0.35,
      metalness: 0.05,
    });
    boxMeshRef.current = boxMat as any;

    const ribbonMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(ribbonColor),
      roughness: 0.2,
      metalness: 0.25,
    });
    ribbonMeshesRef.current = [];

    // Box Base (dimensions: 2.1 width, 1.2 height, 2.1 depth)
    const boxWidth = 2.0;
    const boxHeight = 1.1;
    const boxDepth = 2.0;
    const wallThick = 0.08;

    const baseGroup = new THREE.Group();
    
    // Bottom plate
    const bottomGeo = new THREE.BoxGeometry(boxWidth, wallThick, boxDepth);
    const bottomMesh = new THREE.Mesh(bottomGeo, boxMat);
    bottomMesh.position.y = wallThick / 2;
    baseGroup.add(bottomMesh);

    // 4 Walls
    const wallZGeo = new THREE.BoxGeometry(boxWidth, boxHeight, wallThick);
    const frontWall = new THREE.Mesh(wallZGeo, boxMat);
    frontWall.position.set(0, boxHeight / 2, boxDepth / 2 - wallThick / 2);
    baseGroup.add(frontWall);

    const backWall = new THREE.Mesh(wallZGeo, boxMat);
    backWall.position.set(0, boxHeight / 2, -boxDepth / 2 + wallThick / 2);
    baseGroup.add(backWall);

    const wallXGeo = new THREE.BoxGeometry(wallThick, boxHeight, boxDepth - wallThick * 2);
    const leftWall = new THREE.Mesh(wallXGeo, boxMat);
    leftWall.position.set(-boxWidth / 2 + wallThick / 2, boxHeight / 2, 0);
    baseGroup.add(leftWall);

    const rightWall = new THREE.Mesh(wallXGeo, boxMat);
    rightWall.position.set(boxWidth / 2 - wallThick / 2, boxHeight / 2, 0);
    baseGroup.add(rightWall);

    // Base ribbon vertical bands
    const ribbonVertGeo = new THREE.BoxGeometry(0.24, boxHeight + 0.01, boxDepth + 0.02);
    const ribbonVert = new THREE.Mesh(ribbonVertGeo, ribbonMat);
    ribbonVert.position.y = boxHeight / 2;
    baseGroup.add(ribbonVert);
    ribbonMeshesRef.current.push(ribbonVert);

    const ribbonHorizGeo = new THREE.BoxGeometry(boxWidth + 0.02, boxHeight + 0.01, 0.24);
    const ribbonHoriz = new THREE.Mesh(ribbonHorizGeo, ribbonMat);
    ribbonHoriz.position.y = boxHeight / 2;
    baseGroup.add(ribbonHoriz);
    ribbonMeshesRef.current.push(ribbonHoriz);

    rootGroup.add(baseGroup);

    // Inside items group
    const itemsGroup = new THREE.Group();
    itemsGroupRef.current = itemsGroup;
    rootGroup.add(itemsGroup);

    // Lid Assembly (Hinged at back: z = -boxDepth / 2)
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, boxHeight, -boxDepth / 2);
    lidGroupRef.current = lidGroup;

    // Lid Body offset so hinge is at back
    const lidInnerGroup = new THREE.Group();
    lidInnerGroup.position.set(0, 0, boxDepth / 2);

    const lidTopGeo = new THREE.BoxGeometry(boxWidth + 0.12, 0.12, boxDepth + 0.12);
    const lidMesh = new THREE.Mesh(lidTopGeo, boxMat);
    lidMesh.position.y = 0.06;
    lidInnerGroup.add(lidMesh);

    // Lid ribbons
    const lidRibbonX = new THREE.Mesh(new THREE.BoxGeometry(boxWidth + 0.14, 0.13, 0.26), ribbonMat);
    lidRibbonX.position.y = 0.06;
    lidInnerGroup.add(lidRibbonX);
    ribbonMeshesRef.current.push(lidRibbonX);

    const lidRibbonZ = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.13, boxDepth + 0.14), ribbonMat);
    lidRibbonZ.position.y = 0.06;
    lidInnerGroup.add(lidRibbonZ);
    ribbonMeshesRef.current.push(lidRibbonZ);

    // Bow Assembly on top of lid
    const bowGroup = new THREE.Group();
    bowGroup.position.y = 0.14;

    // Knot
    const knotMesh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), ribbonMat);
    knotMesh.scale.set(1.1, 0.8, 1.1);
    bowGroup.add(knotMesh);
    ribbonMeshesRef.current.push(knotMesh);

    // Bow loops (Torus)
    const loopGeo = new THREE.TorusGeometry(0.24, 0.07, 12, 24);
    const leftLoop = new THREE.Mesh(loopGeo, ribbonMat);
    leftLoop.rotation.y = Math.PI / 2;
    leftLoop.rotation.z = Math.PI / 6;
    leftLoop.position.set(-0.25, 0.12, 0);
    bowGroup.add(leftLoop);
    ribbonMeshesRef.current.push(leftLoop);

    const rightLoop = new THREE.Mesh(loopGeo, ribbonMat);
    rightLoop.rotation.y = Math.PI / 2;
    rightLoop.rotation.z = -Math.PI / 6;
    rightLoop.position.set(0.25, 0.12, 0);
    bowGroup.add(rightLoop);
    ribbonMeshesRef.current.push(rightLoop);

    lidInnerGroup.add(bowGroup);
    lidGroup.add(lidInnerGroup);
    rootGroup.add(lidGroup);

    // Fairy Sparkles when opening
    const sparkleCount = 45;
    const sparklePos = new Float32Array(sparkleCount * 3);
    for (let i = 0; i < sparkleCount * 3; i += 3) {
      sparklePos[i] = (Math.random() - 0.5) * 1.8;
      sparklePos[i + 1] = Math.random() * 1.5 + 0.8;
      sparklePos[i + 2] = (Math.random() - 0.5) * 1.8;
    }
    const sparkleGeo = new THREE.BufferGeometry();
    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePos, 3));
    const sparkleMat = new THREE.PointsMaterial({
      color: 0xffd1dc,
      size: 0.09,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const sparkles = new THREE.Points(sparkleGeo, sparkleMat);
    sparklesGroupRef.current = sparkles;
    rootGroup.add(sparkles);

    // Initial render setup
    let frameId = 0;
    const clock = new THREE.Clock();

    function renderLoop() {
      const dt = clock.getDelta();
      const anim = animStateRef.current;

      // Smooth hinge animation
      anim.lidProgress = THREE.MathUtils.damp(anim.lidProgress, anim.targetProgress, 5, dt);

      if (lidGroupRef.current) {
        // Hinge rotation opens back lid
        lidGroupRef.current.rotation.x = -anim.lidProgress * 1.95;
        lidGroupRef.current.position.y = boxHeight + anim.lidProgress * 0.15;
      }

      // Sparkles opacity and subtle float
      if (sparklesGroupRef.current) {
        const mat = sparklesGroupRef.current.material as THREE.PointsMaterial;
        mat.opacity = THREE.MathUtils.damp(mat.opacity, anim.lidProgress > 0.3 ? 0.85 : 0, 4, dt);
        sparklesGroupRef.current.rotation.y += 0.01;
      }

      // Apply root rotation from user mouse/touch controls
      rootGroup.rotation.y = rotationRef.current.y;
      rootGroup.rotation.x = rotationRef.current.x;

      camera.position.z = zoomRef.current;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(renderLoop);
    }

    frameId = requestAnimationFrame(renderLoop);

    // Pointer events for rotating & zooming
    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      rotationRef.current.y += dx * 0.008;
      rotationRef.current.x = Math.max(-0.2, Math.min(1.2, rotationRef.current.x + dy * 0.008));
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomRef.current = Math.max(3.0, Math.min(7.0, zoomRef.current + e.deltaY * 0.004));
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      className="relative w-full h-[380px] md:h-[460px] flex items-center justify-center select-none overflow-hidden rounded-3xl bg-gradient-to-b from-[#FFF5F8] to-[#FFF9F5] border border-[#F8BBD0]/40"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Navigation & Open/Close Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <button
          onClick={onToggleOpen}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#C45A7A] bg-white/90 backdrop-blur-md shadow-sm border border-[#F8BBD0]/60 hover:bg-[#F8BBD0]/20 transition-all active:scale-95 cursor-pointer"
        >
          <span>{isOpen ? '🎀 Close Box Lid' : '✨ Open Box Lid'}</span>
          <span className="text-[10px] text-gray-400">({isOpen ? 'Inspect Inside' : 'Tap to Peek'})</span>
        </button>
      </div>

      {recipientName && (
        <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif italic text-[#C45A7A] bg-white/80 border border-[#F8BBD0]/50 shadow-xs">
          <span>For: {recipientName} 💝</span>
        </div>
      )}

      {/* Minimal Touch / Drag Hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] font-sans tracking-wide text-[#59434D]/60 bg-white/70 backdrop-blur-xs px-3 py-0.5 rounded-full pointer-events-none border border-[#F8BBD0]/30">
        Drag to rotate • Scroll to zoom • {items.length} gift{items.length === 1 ? '' : 's'} inside
      </div>
    </div>
  );
};

// Helper: Generates beautiful procedural 3D model for inside items
function create3DItemModel(shape: string, colorHex: string): THREE.Group {
  const group = new THREE.Group();
  const color = new THREE.Color(colorHex);

  if (shape === 'teddy') {
    const teddyMat = new THREE.MeshStandardMaterial({ color: 0xfff0e6, roughness: 0.8 });
    const bowMat = new THREE.MeshStandardMaterial({ color: 0xc45a7a, roughness: 0.3 });

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), teddyMat);
    head.position.y = 0.55;
    group.add(head);

    // Ears
    const earGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const leftEar = new THREE.Mesh(earGeo, teddyMat);
    leftEar.position.set(-0.18, 0.72, 0);
    group.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, teddyMat);
    rightEar.position.set(0.18, 0.72, 0);
    group.add(rightEar);

    // Body
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), teddyMat);
    body.position.y = 0.28;
    body.scale.set(1, 1.1, 0.9);
    group.add(body);

    // Little Ribbon Bow
    const miniBow = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.025, 8, 16), bowMat);
    miniBow.position.set(0, 0.44, 0.2);
    group.add(miniBow);
  } else if (shape === 'chocolate') {
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x59434d, roughness: 0.4 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.2, metalness: 0.8 });

    const chocoBox = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.12, 0.45), boxMat);
    chocoBox.position.y = 0.1;
    group.add(chocoBox);

    // 4 mini heart/round truffles
    for (let x = -0.12; x <= 0.12; x += 0.24) {
      for (let z = -0.12; z <= 0.12; z += 0.24) {
        const truffle = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), goldMat);
        truffle.position.set(x, 0.18, z);
        group.add(truffle);
      }
    }
  } else if (shape === 'jewellery') {
    const velvetMat = new THREE.MeshStandardMaterial({ color: 0xffb6c1, roughness: 0.6 });
    const pearlMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.1, clearcoat: 1 });

    const ringBox = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.18, 24), velvetMat);
    ringBox.position.y = 0.1;
    group.add(ringBox);

    const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), pearlMat);
    pearl.position.set(0, 0.24, 0);
    group.add(pearl);
  } else if (shape === 'flower') {
    const petalMat = new THREE.MeshStandardMaterial({ color: 0xf8bbd0, roughness: 0.5 });
    const stemMat = new THREE.MeshStandardMaterial({ color: 0xa8c3a0, roughness: 0.7 });

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), stemMat);
    stem.position.y = 0.2;
    group.add(stem);

    for (let p = 0; p < 5; p++) {
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), petalMat);
      const ang = (p / 5) * Math.PI * 2;
      petal.position.set(Math.cos(ang) * 0.08, 0.38, Math.sin(ang) * 0.08);
      petal.scale.set(0.8, 1, 0.5);
      group.add(petal);
    }
  } else {
    // Elegant stationery card / letter
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xfffdfa, roughness: 0.7 });
    const waxMat = new THREE.MeshStandardMaterial({ color: 0xc45a7a, roughness: 0.3 });

    const envelope = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 0.35), paperMat);
    envelope.position.y = 0.08;
    envelope.rotation.y = 0.2;
    group.add(envelope);

    const waxSeal = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 16), waxMat);
    waxSeal.position.set(0, 0.11, 0);
    waxSeal.rotation.y = 0.2;
    group.add(waxSeal);
  }

  return group;
}
