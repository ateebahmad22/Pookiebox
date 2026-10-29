import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Hero3DBox: React.FC<{ onBuildClick?: () => void }> = ({ onBuildClick }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(2.8, 2.2, 4.0);
    camera.lookAt(0, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Warm Studio Lighting
    const amb = new THREE.AmbientLight(0xfff5f8, 0.9);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xfff0f5, 1.8);
    key.position.set(4, 6, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xe6d6ff, 1.0);
    rim.position.set(-4, 3, -3);
    scene.add(rim);

    // Ground Contact Shadow
    const groundGeo = new THREE.CircleGeometry(1.5, 32);
    const groundMat = new THREE.MeshBasicMaterial({ color: 0xc45a7a, transparent: true, opacity: 0.15 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    scene.add(ground);

    // Box Root
    const boxGroup = new THREE.Group();
    scene.add(boxGroup);

    // Materials
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xffb6c1, roughness: 0.35, metalness: 0.05 });
    const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xc45a7a, roughness: 0.2, metalness: 0.25 });

    // Base
    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.0, 1.8), boxMat);
    baseMesh.position.y = 0.5;
    boxGroup.add(baseMesh);

    // Base ribbon wraps
    const r1 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.01, 1.82), ribbonMat);
    r1.position.y = 0.5;
    boxGroup.add(r1);

    const r2 = new THREE.Mesh(new THREE.BoxGeometry(1.82, 1.01, 0.22), ribbonMat);
    r2.position.y = 0.5;
    boxGroup.add(r2);

    // Lid
    const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.2, 1.9), boxMat);
    lidMesh.position.y = 1.1;
    boxGroup.add(lidMesh);

    // Lid Ribbons
    const lr1 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 1.92), ribbonMat);
    lr1.position.y = 1.1;
    boxGroup.add(lr1);

    const lr2 = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.22, 0.24), ribbonMat);
    lr2.position.y = 1.1;
    boxGroup.add(lr2);

    // Bow
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), ribbonMat);
    knot.position.y = 1.25;
    boxGroup.add(knot);

    const loopGeo = new THREE.TorusGeometry(0.22, 0.06, 12, 24);
    const leftLoop = new THREE.Mesh(loopGeo, ribbonMat);
    leftLoop.rotation.y = Math.PI / 2;
    leftLoop.rotation.z = Math.PI / 6;
    leftLoop.position.set(-0.2, 1.34, 0);
    boxGroup.add(leftLoop);

    const rightLoop = new THREE.Mesh(loopGeo, ribbonMat);
    rightLoop.rotation.y = Math.PI / 2;
    rightLoop.rotation.z = -Math.PI / 6;
    rightLoop.position.set(0.2, 1.34, 0);
    boxGroup.add(rightLoop);

    let frameId = 0;
    const clock = new THREE.Clock();

    function animate() {
      const elapsed = clock.getElapsedTime();
      boxGroup.rotation.y = elapsed * 0.45;
      boxGroup.position.y = Math.sin(elapsed * 1.5) * 0.06;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    }
    frameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[320px] md:h-[400px] flex items-center justify-center cursor-pointer group" onClick={onBuildClick}>
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute bottom-2 text-center pointer-events-none">
        <span className="text-xs font-serif italic text-[#C45A7A] bg-white/80 px-3 py-1 rounded-full shadow-xs border border-[#F8BBD0]">
          Click to Customize in 3D
        </span>
      </div>
    </div>
  );
};
