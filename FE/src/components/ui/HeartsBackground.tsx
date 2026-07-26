import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const HeartsBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Heart Shape outline
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0);
    heartShape.bezierCurveTo(0, -0.3, -0.6, -0.3, -0.6, 0);
    heartShape.bezierCurveTo(-0.6, 0.6, 0, 1.0, 0, 1.4);
    heartShape.bezierCurveTo(0, 1.0, 0.6, 0.6, 0.6, 0);
    heartShape.bezierCurveTo(0.6, -0.3, 0, -0.3, 0, 0);

    const geometry = new THREE.ShapeGeometry(heartShape);
    const material = new THREE.MeshPhongMaterial({
      color: 0xff5e9c,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });

    const hearts: Array<{
      mesh: THREE.Mesh;
      speed: number;
      rotationSpeed: number;
    }> = [];
    const heartCount = 35;

    for (let i = 0; i < heartCount; i++) {
      const heart = new THREE.Mesh(geometry, material.clone());
      heart.position.set(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10
      );
      const s = Math.random() * 0.18 + 0.05;
      heart.scale.set(s, s, s);
      heart.rotation.z = Math.PI; // Flip orientation
      heart.rotation.y = Math.random() * Math.PI;

      scene.add(heart);
      hearts.push({
        mesh: heart,
        speed: Math.random() * 0.006 + 0.002,
        rotationSpeed: Math.random() * 0.015
      });
    }

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      hearts.forEach(h => {
        h.mesh.position.y += h.speed;
        h.mesh.rotation.y += h.rotationSpeed;
        if (h.mesh.position.y > 7) {
          h.mesh.position.y = -7;
          h.mesh.position.x = (Math.random() - 0.5) * 15;
        }
      });
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 w-full h-full bg-transparent -z-10 pointer-events-none" />;
};
