import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FloatingMusicPlayer } from '../../components/common/FloatingMusicPlayer';
import { ImageLightbox } from '../../components/common/ImageLightbox';

interface CosmicGalleryProps {
  images: string[];
  title?: string;
  music?: string;
  onNext?: () => void;
  onBack?: () => void;
}

const CosmicGalleryInner: React.FC<CosmicGalleryProps> = ({ images, title, music, onNext, onBack }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [typewriterText, setTypewriterText] = useState('');
  const [titleFinished, setTitleFinished] = useState(false);
  const [showSpecialStarModal, setShowSpecialStarModal] = useState(false);

  // Discovery / Zoom State Machine (Zoom In from deep black void into universe)
  const [isRevealed, setIsRevealed] = useState(false);
  const [zoomProgress, setZoomProgress] = useState(0); // 0 to 100
  const [discoveryState, setDiscoveryState] = useState<'start' | 'zooming' | 'revealed'>('start');
  const [showCelebrationToast, setShowCelebrationToast] = useState(false);

  // References to control camera animation externally
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const isAnimatingRef = useRef(false);

  const recipientName = title || 'chúng ta';
  const fullText = `Hành tinh mang tên ${recipientName}`;

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    setTypewriterText('');
    setTitleFinished(false);
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setTypewriterText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setTitleFinished(true);
        }, 300);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [fullText]);

  // Smooth auto-reveal animation helper (Flies from deep void ~115 down to 21)
  const handleAutoDiscover = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current || isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    const camera = cameraRef.current;
    const startPos = camera.position.clone();
    const targetPos = new THREE.Vector3(0, 4, 50);
    const duration = 2600; // 2.6 seconds
    const startTime = performance.now();

    const animateZoom = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // EaseInOutCubic
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      camera.position.lerpVectors(startPos, targetPos, ease);

      if (progress < 1) {
        requestAnimationFrame(animateZoom);
      } else {
        camera.position.copy(targetPos);
        isAnimatingRef.current = false;
        setIsRevealed(true);
        setDiscoveryState('revealed');
        setShowCelebrationToast(true);
        setTimeout(() => setShowCelebrationToast(false), 6000);
      }
    };

    requestAnimationFrame(animateZoom);
  }, []);

  // Three.js Scene Setup
  useEffect(() => {
    if (!containerRef.current || images.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    // Deep black cosmic void
    scene.background = new THREE.Color(0x040006);

    // Initial Camera: Placed far away in the deep dark void (distance ~ 115)
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 18, 115);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 140;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;
    controls.enablePan = false;
    controlsRef.current = controls;

    // Root galaxy container for smooth scaling
    const galaxyContainer = new THREE.Group();
    scene.add(galaxyContainer);

    // --- 1. Delicate Central Star of the Galaxy ---
    const centralStarGroup = new THREE.Group();
    galaxyContainer.add(centralStarGroup);

    // Core Glowing Sphere (Delicate, not oversized)
    const starCoreGeo = new THREE.SphereGeometry(0.18, 32, 32);
    const starCoreMat = new THREE.MeshBasicMaterial({
      color: 0xfff8b3,
      transparent: true,
      opacity: 1,
    });
    const starCore = new THREE.Mesh(starCoreGeo, starCoreMat);
    centralStarGroup.add(starCore);

    // Inner Glowing Aura
    const starAuraGeo = new THREE.SphereGeometry(0.36, 32, 32);
    const starAuraMat = new THREE.MeshBasicMaterial({
      color: 0xff3385,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const starAura = new THREE.Mesh(starAuraGeo, starAuraMat);
    centralStarGroup.add(starAura);

    // Delicate Corona Ring
    const coronaGeo = new THREE.RingGeometry(0.45, 0.75, 48);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xffd11a,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const coronaRing = new THREE.Mesh(coronaGeo, coronaMat);
    coronaRing.rotation.x = Math.PI / 3;
    centralStarGroup.add(coronaRing);

    // Second Delicate Corona Ring
    const corona2Geo = new THREE.RingGeometry(0.6, 0.95, 48);
    const corona2Mat = new THREE.MeshBasicMaterial({
      color: 0xff66cc,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const corona2Ring = new THREE.Mesh(corona2Geo, corona2Mat);
    corona2Ring.rotation.y = Math.PI / 4;
    centralStarGroup.add(corona2Ring);

    // --- 2. The Distant Shining Planet ("Hành tinh mang tên em") ---
    const distantPlanetGroup = new THREE.Group();
    distantPlanetGroup.position.set(13, 5, -12);
    galaxyContainer.add(distantPlanetGroup);

    // Distant Star Core
    const distantPlanetGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const distantPlanetMat = new THREE.MeshBasicMaterial({
      color: 0xffe066,
      transparent: true,
      opacity: 0.3,
    });
    const distantPlanetMesh = new THREE.Mesh(distantPlanetGeo, distantPlanetMat);
    distantPlanetGroup.add(distantPlanetMesh);

    // Distant Star Pulsing Aura
    const distantAuraGeo = new THREE.SphereGeometry(0.65, 32, 32);
    const distantAuraMat = new THREE.MeshBasicMaterial({
      color: 0xff3399,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const distantAuraMesh = new THREE.Mesh(distantAuraGeo, distantAuraMat);
    distantPlanetGroup.add(distantAuraMesh);

    // Distant Star Planetary Halo Ring
    const distantRingGeo = new THREE.RingGeometry(0.7, 1.1, 48);
    const distantRingMat = new THREE.MeshBasicMaterial({
      color: 0xff99ff,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const distantRingMesh = new THREE.Mesh(distantRingGeo, distantRingMat);
    distantRingMesh.rotation.x = Math.PI / 2.5;
    distantPlanetGroup.add(distantRingMesh);

    // --- 3. Galaxy Particle Field (Milky Way / Nebula) ---
    const sizes: number[] = [];
    const shift: number[] = [];
    const pts: THREE.Vector3[] = [];

    for (let i = 0; i < 25000; i++) {
      sizes.push(Math.random() * 1.5 + 0.5);
      shift.push(
        Math.random() * Math.PI,
        Math.random() * Math.PI * 2,
        (Math.random() * 0.9 + 0.1) * Math.PI * 0.1,
        Math.random() * 0.9 + 0.1
      );
      pts.push(new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * 0.5 + 9.5));
    }

    for (let i = 0; i < 50000; i++) {
      const r = 10, R = 40;
      const rand = Math.pow(Math.random(), 1.5);
      const radius = Math.sqrt(R * R * rand + (1 - rand) * r * r);
      pts.push(new THREE.Vector3().setFromCylindricalCoords(radius, Math.random() * 2 * Math.PI, (Math.random() - 0.5) * 2));
      sizes.push(Math.random() * 1.5 + 0.5);
      shift.push(
        Math.random() * Math.PI,
        Math.random() * Math.PI * 2,
        (Math.random() * 0.9 + 0.1) * Math.PI * 0.1,
        Math.random() * 0.9 + 0.1
      );
    }

    const g = new THREE.BufferGeometry().setFromPoints(pts);
    g.setAttribute('sizes', new THREE.Float32BufferAttribute(sizes, 1));
    g.setAttribute('shift', new THREE.Float32BufferAttribute(shift, 4));

    const m = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 0.05 },
        uOpacity: { value: 0.05 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexShader: `
        uniform float uTime;
        uniform float uSize;
        attribute float sizes;
        attribute vec4 shift;
        varying vec3 vColor;

        const float PI2 = 6.28318530718;

        void main() {
          vec4 modelPos = modelMatrix * vec4(position, 1.0);

          float moveT = mod(shift.x + shift.z * uTime, PI2);
          float moveS = mod(shift.y + shift.z * uTime, PI2);
          modelPos.xyz += vec3(cos(moveS) * sin(moveT), cos(moveT), sin(moveS) * sin(moveT)) * shift.w;

          vec4 viewPos = viewMatrix * modelPos;
          gl_Position = projectionMatrix * viewPos;

          gl_PointSize = uSize * sizes * (300.0 / -viewPos.z);

          float d = length(abs(position) / vec3(40.0, 10.0, 40.0));
          d = clamp(d, 0.0, 1.0);
          vColor = mix(vec3(255.0, 180.0, 50.0), vec3(160.0, 70.0, 255.0), d) / 255.0;
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        varying vec3 vColor;

        void main() {
          float d = length(gl_PointCoord.xy - 0.5);
          if (d > 0.5) discard;
          gl_FragColor = vec4(vColor, (smoothstep(0.5, 0.2, d) * 0.5 + 0.5) * uOpacity);
        }
      `,
    });

    const p = new THREE.Points(g, m);
    p.rotation.order = 'ZYX';
    p.rotation.z = 0.2;
    galaxyContainer.add(p);

    // --- 4. Photo Planet Cards (Planes orbiting) ---
    const imageMeshes: THREE.Mesh[] = [];
    const imageFloats: { mesh: THREE.Mesh; baseY: number; phase: number }[] = [];
    const textureLoader = new THREE.TextureLoader();

    const uniformSize = 2.4;
    const geometry = new THREE.PlaneGeometry(uniformSize, uniformSize);

    images.forEach((imgUrl) => {
      const texture = textureLoader.load(imgUrl);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0, // Initially invisible when far away
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(0, 0, 0); // Initially scaled down when far away

      const radius = 8 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const pos = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi) * 0.5,
        radius * Math.sin(phi) * Math.sin(theta)
      );
      mesh.position.copy(pos);
      mesh.lookAt(0, 0, 0);
      mesh.rotation.z = Math.random() * Math.PI;

      galaxyContainer.add(mesh);
      imageMeshes.push(mesh);
      imageFloats.push({ mesh, baseY: pos.y, phase: Math.random() * Math.PI * 2 });
    });

    // --- 5. Raycaster for clicking photos & special star ---
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);

      // Check if clicking central mystery star when far away
      const starHits = raycaster.intersectObjects([starCore, starAura]);
      if (starHits.length > 0 && camera.position.length() > 30) {
        handleAutoDiscover();
        return;
      }

      // Check if clicking the distant shining planet
      const distantHits = raycaster.intersectObjects([distantPlanetMesh, distantAuraMesh]);
      if (distantHits.length > 0) {
        setShowSpecialStarModal(true);
        return;
      }

      // Check photo planes
      const intersects = raycaster.intersectObjects(imageMeshes);
      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const idx = imageMeshes.indexOf(hit);
        if (idx >= 0) setSelectedIndex(idx);
      }
    };

    container.addEventListener('click', handleClick);

    // --- 6. Animation Render Loop & Deep Void Zoom-In State Tracking ---
    const clock = new THREE.Clock();
    let animationId: number;
    let localRevealed = false;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const t = elapsed * 0.5;

      // Pulse Central Star
      const pulse = Math.sin(elapsed * 4) * 0.08 + 1;
      starCore.scale.set(pulse, pulse, pulse);
      starAura.scale.set(pulse * 1.15, pulse * 1.15, pulse * 1.15);
      coronaRing.rotation.z += 0.01;
      corona2Ring.rotation.z -= 0.008;

      // Rotate and Pulse the Distant Planet ("Hành tinh mang tên em")
      const distantPulse = Math.sin(elapsed * 2.5) * 0.12 + 1;
      distantPlanetMesh.scale.set(distantPulse, distantPulse, distantPulse);
      distantAuraMesh.scale.set(distantPulse * 1.25, distantPulse * 1.25, distantPulse * 1.25);
      distantRingMesh.rotation.z += 0.006;

      // Measure camera distance from universe center (0, 0, 0)
      // Deep void distance = 115.0, Reveal distance = 48.0
      const camDist = camera.position.distanceTo(controls.target);
      const startDist = 115.0;
      const revealDist = 48.0;
      const rawProgress = Math.min(Math.max((startDist - camDist) / (startDist - revealDist), 0), 1);
      const progressPercent = localRevealed ? 100 : Math.round(rawProgress * 100);

      setZoomProgress(progressPercent);

      // Trigger success as soon as progress reaches 80%
      if (rawProgress >= 0.80 && !localRevealed) {
        localRevealed = true;
        setIsRevealed(true);
        setDiscoveryState('revealed');
        setShowCelebrationToast(true);
        setTimeout(() => setShowCelebrationToast(false), 6000);
      } else if (!localRevealed) {
        if (rawProgress < 0.15) {
          setDiscoveryState('start');
        } else {
          setDiscoveryState('zooming');
        }
      }

      // Visual scaling normalized (100% crisp when revealed or >= 80%)
      const visualFactor = localRevealed ? 1.0 : Math.min(rawProgress / 0.80, 1);

      // When far away, whole galaxy scales down like a single twinkling dot in the deep black void
      const galaxyScale = 0.08 + visualFactor * 0.92;
      galaxyContainer.scale.set(galaxyScale, galaxyScale, galaxyScale);

      // Dynamic scaling of Galaxy Shader and Photo Meshes based on Zoom-In Progress
      m.uniforms.uTime.value = t * Math.PI;
      m.uniforms.uSize.value = 0.03 + visualFactor * 0.07;
      m.uniforms.uOpacity.value = 0.08 + visualFactor * 0.92;
      p.rotation.y = t * 0.05;

      // Distant Planet Opacity & Scaling
      distantPlanetMat.opacity = 0.2 + visualFactor * 0.8;
      distantAuraMat.opacity = 0.1 + visualFactor * 0.65;
      distantRingMat.opacity = 0.1 + visualFactor * 0.55;

      // Scale & fade photo cards based on discovery progress (reveal as user zooms in)
      imageMeshes.forEach((mesh) => {
        const s = visualFactor;
        mesh.scale.set(s, s, s);
        if (mesh.material && !Array.isArray(mesh.material)) {
          (mesh.material as THREE.MeshBasicMaterial).opacity = visualFactor;
        }
      });

      // Float photo planes
      imageFloats.forEach((data) => {
        data.mesh.position.y = data.baseY + Math.sin(elapsed * 0.3 + data.phase) * 0.3;
        data.mesh.rotation.z += 0.002;
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('click', handleClick);
      controls.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      g.dispose();
      (m as THREE.ShaderMaterial).dispose();
      geometry.dispose();
      starCoreGeo.dispose();
      starCoreMat.dispose();
      starAuraGeo.dispose();
      starAuraMat.dispose();
      coronaGeo.dispose();
      coronaMat.dispose();
      corona2Geo.dispose();
      corona2Mat.dispose();
      distantPlanetGeo.dispose();
      distantPlanetMat.dispose();
      distantAuraGeo.dispose();
      distantAuraMat.dispose();
      distantRingGeo.dispose();
      distantRingMat.dispose();
      imageMeshes.forEach(mesh => {
        const mat = mesh.material;
        if (Array.isArray(mat)) mat.forEach(m => m.dispose());
        else mat.dispose();
      });
    };
  }, [images, handleAutoDiscover]);

  const handleCloseModal = useCallback(() => setSelectedIndex(null), []);

  if (images.length === 0) return null;

  return (
    <section className="relative w-full h-screen overflow-hidden bg-[#040006] select-none">
      {/* Top Glassmorphic Header */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-black/40 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between shadow-lg pointer-events-auto w-full transition-all duration-500">
        {/* Left: Back button */}
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-1 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/90 hover:text-white transition-all text-xs sm:text-sm font-semibold active:scale-95 whitespace-nowrap shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm sm:text-base">arrow_back</span>
            <span className="hidden sm:inline">Quay lại</span>
          </button>
        ) : <div className="w-[60px] sm:w-[100px]" />}

        {/* Center: Title & Subtitle */}
        <div className="flex flex-col items-center text-center max-w-[50%] md:max-w-[60%]">
          <h1 className="text-xs sm:text-base md:text-lg font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 font-display line-clamp-1">
            {typewriterText}
            <span className="animate-pulse ml-0.5 text-fuchsia-400">|</span>
          </h1>
          {fullText === typewriterText && (
            <p className="text-[9px] md:text-xs text-white/50 font-light mt-0.5 line-clamp-1 italic animate-fade-in">
              {isRevealed ? 'Mỗi bức ảnh là một hành tinh chứa đầy kỷ niệm ✨' : 'Dù ở rất xa, anh vẫn luôn tìm thấy em ✨'}
            </p>
          )}
        </div>

        {/* Right: Next button (ONLY REVEALED ONCE UNIVERSE IS DISCOVERED) */}
        {onNext && isRevealed ? (
          <button
            onClick={onNext}
            className="flex items-center justify-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-95 border border-pink-300/40 text-white transition-all text-xs sm:text-sm font-semibold shadow-[0_0_25px_rgba(236,72,153,0.45)] hover:shadow-[0_0_35px_rgba(236,72,153,0.7)] active:scale-95 whitespace-nowrap cursor-pointer animate-in fade-in zoom-in-95 duration-500"
          >
            <span>Tiếp tới</span>
            <span className="material-symbols-outlined text-sm sm:text-base">arrow_forward</span>
          </button>
        ) : <div className="w-[60px] sm:w-[100px]" />}
      </div>

      {/* 3D WebGL Canvas */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* --- INITIAL GUIDANCE PILL (ONLY SHOWN AFTER TITLE LOADS & BEFORE USER ZOOMS) --- */}
      {!isRevealed && titleFinished && discoveryState === 'start' && zoomProgress < 10 && (
        <div className="fixed top-[72px] sm:top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-400 max-w-[94vw] w-max">
          <div className="px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-[#180520]/90 border border-pink-400/50 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] flex items-center gap-2 sm:gap-2.5">
            <span className="material-symbols-outlined text-base sm:text-lg text-yellow-300 animate-bounce flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
              stars
            </span>
            <span className="text-[11px] sm:text-sm text-white font-medium truncate">
              Có 1 phần quà khi bé zoom vào
            </span>
            <button
              type="button"
              onClick={handleAutoDiscover}
              className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white text-[11px] sm:text-xs font-semibold flex-shrink-0 shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-xs">rocket_launch</span>
              <span>Bay tới</span>
            </button>
          </div>
        </div>
      )}

      {/* --- CELEBRATION TOAST PILL (SHOWN WHEN REVEALED) --- */}
      {showCelebrationToast && (
        <div className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-40 pointer-events-auto animate-in fade-in zoom-in-95 duration-400 max-w-[92vw] w-max">
          <div className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-black/80 border border-yellow-400/60 backdrop-blur-xl shadow-[0_8px_30px_rgba(255,215,0,0.35)] flex items-center gap-2 text-yellow-200 text-xs sm:text-sm font-semibold">
            <span className="material-symbols-outlined text-base text-pink-400 animate-pulse flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
              favorite
            </span>
            <span className="truncate">Đã tìm thấy hành tinh mang tên {recipientName}! 🌌</span>
          </div>
        </div>
      )}

      {/* Special Star Love Message Modal */}
      {showSpecialStarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-[32px] bg-gradient-to-b from-[#2a0c38] to-[#16001a] border border-pink-400/40 shadow-[0_0_50px_rgba(236,72,153,0.4)] text-center space-y-5 text-white relative">
            <button
              type="button"
              onClick={() => setShowSpecialStarModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>

            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.6)] animate-pulse">
              <span className="material-symbols-outlined text-3xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-200 to-fuchsia-300">
                Hành Tinh Mang Tên {recipientName}
              </h2>
              <p className="text-xs text-pink-300/80 uppercase tracking-widest font-semibold">
                Ngôi sao sáng nhất trong vũ trụ
              </p>
            </div>

            <p className="text-sm sm:text-base text-pink-100/90 leading-relaxed font-light italic font-serif">
              "Giữa vũ trụ bao la với hàng triệu vì sao xa xôi... Dù hành tinh mang tên em ở nơi rất xa, anh vẫn luôn tìm thấy em. Bởi vì em chính là ánh sáng dẫn lối cho cuộc đời anh." ❤️
            </p>

            <button
              type="button"
              onClick={() => setShowSpecialStarModal(false)}
              className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 font-semibold text-xs sm:text-sm shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              Cảm ơn anh ❤️
            </button>
          </div>
        </div>
      )}

      {/* Synchronized Floating Music Player (Fixed at Bottom-Left) */}
      <FloatingMusicPlayer music={music} isDark={true} />

      {/* Fullscreen Image Lightbox with Left/Right Arrow navigation */}
      <ImageLightbox
        images={images}
        currentIndex={selectedIndex}
        onClose={handleCloseModal}
        onNavigate={(newIdx) => setSelectedIndex(newIdx)}
      />
    </section>
  );
};

export const CosmicGallery = React.memo(CosmicGalleryInner);
