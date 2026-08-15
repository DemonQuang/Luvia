import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useMusic } from '../../store/music.store';

interface CosmicGalleryProps {
  images: string[];
  title?: string;
  music?: string;
  onNext?: () => void;
  onBack?: () => void;
}

const CosmicGalleryInner: React.FC<CosmicGalleryProps> = ({ images, title, music, onNext, onBack }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [typewriterText, setTypewriterText] = useState('');
  const { isPlaying, progress: audioProgress, togglePlay, playMusic, pauseMusic, currentMusic } = useMusic();

  const recipientName = title || 'chúng ta';
  const fullText = `Hành tinh mang tên ${recipientName}`;

  useEffect(() => {
    let i = 0;
    setTypewriterText('');
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setTypewriterText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [fullText]);

  // Music player
  useEffect(() => {
    if (music) {
      if (music !== currentMusic) {
        playMusic(music);
      }
    } else {
      pauseMusic();
    }

    return () => {
      // Pause music if we are leaving the love page views
      if (!window.location.pathname.startsWith('/page/')) {
        pauseMusic();
      }
    };
  }, [music, currentMusic, playMusic, pauseMusic]);

  // Music floater state
  const [musicExpanded, setMusicExpanded] = useState(false);
  const [musicPos, setMusicPos] = useState({ x: 24, y: 24 });
  const musicDragRef = useRef({ dragging: false, moved: false, startX: 0, startY: 0, startPosX: 0, startPosY: 0 });

  const handleMusicMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const d = musicDragRef.current;
    d.dragging = true;
    d.moved = false;
    d.startX = e.clientX;
    d.startY = e.clientY;
    d.startPosX = musicPos.x;
    d.startPosY = musicPos.y;

    const handleMove = (ev: MouseEvent) => {
      if (!d.dragging) return;
      const dx = ev.clientX - d.startX;
      const dy = ev.clientY - d.startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) d.moved = true;
      setMusicPos({ x: d.startPosX + dx, y: d.startPosY + dy });
    };
    const handleUp = () => { d.dragging = false; window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [musicPos.x, musicPos.y]);

  const handleMusicTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const d = musicDragRef.current;
    d.dragging = true;
    d.moved = false;
    d.startX = touch.clientX;
    d.startY = touch.clientY;
    d.startPosX = musicPos.x;
    d.startPosY = musicPos.y;

    const handleMove = (ev: TouchEvent) => {
      const t = ev.touches[0];
      const dx = t.clientX - d.startX;
      const dy = t.clientY - d.startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) d.moved = true;
      setMusicPos({ x: d.startPosX + dx, y: d.startPosY + dy });
    };
    const handleEnd = () => { d.dragging = false; window.removeEventListener('touchmove', handleMove); window.removeEventListener('touchend', handleEnd); };
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);
  }, [musicPos.x, musicPos.y]);

  const handleNoteClick = useCallback(() => {
    if (!musicDragRef.current.moved) setMusicExpanded(p => !p);
  }, []);

  const handlePlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlay();
  }, [togglePlay]);

  // Three.js
  useEffect(() => {
    if (!containerRef.current || images.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x160016);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 4, 21);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controls.enablePan = false;

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
      uniforms: { uTime: { value: 0 }, uSize: { value: 0.1 } },
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
          vColor = mix(vec3(227.0, 155.0, 0.0), vec3(100.0, 50.0, 255.0), d) / 255.0;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          float d = length(gl_PointCoord.xy - 0.5);
          if (d > 0.5) discard;
          gl_FragColor = vec4(vColor, smoothstep(0.5, 0.2, d) * 0.5 + 0.5);
        }
      `,
    });

    const p = new THREE.Points(g, m);
    p.rotation.order = 'ZYX';
    p.rotation.z = 0.2;
    scene.add(p);

    const imageMeshes: THREE.Mesh[] = [];
    const imageFloats: { mesh: THREE.Mesh; baseY: number; phase: number }[] = [];
    const textureLoader = new THREE.TextureLoader();

    images.forEach((imgUrl) => {
      const texture = textureLoader.load(imgUrl);
      const size = 1.8 + Math.random() * 1.2;
      const geometry = new THREE.PlaneGeometry(size, size);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geometry, material);

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

      scene.add(mesh);
      imageMeshes.push(mesh);
      imageFloats.push({ mesh, baseY: pos.y, phase: Math.random() * Math.PI * 2 });
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(imageMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const idx = imageMeshes.indexOf(hit);
        if (idx >= 0) setSelectedImage(images[idx]);
      }
    };

    container.addEventListener('click', handleClick);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const t = elapsed * 0.5;

      m.uniforms.uTime.value = t * Math.PI;
      p.rotation.y = t * 0.05;

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
      imageMeshes.forEach(mesh => {
        mesh.geometry.dispose();
        const mat = mesh.material;
        if (Array.isArray(mat)) mat.forEach(m => m.dispose());
        else mat.dispose();
      });
    };
  }, [images]);

  const handleCloseModal = useCallback(() => setSelectedImage(null), []);

  if (images.length === 0) return null;

  return (
    <section className="relative w-full h-screen overflow-hidden bg-[#160016]">
      {/* Full-width Glassmorphic Header */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-black/40 backdrop-blur-md px-4 md:px-6 flex items-center justify-between shadow-lg pointer-events-auto w-full">
        {/* Left: Back button */}
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all text-xs font-semibold active:scale-95"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span className="hidden sm:inline">Quay lại</span>
          </button>
        ) : <div className="w-[84px] sm:w-[110px]" />}

        {/* Center: Title & Subtitle */}
        <div className="flex flex-col items-center text-center max-w-[50%] md:max-w-[60%]">
          <h1 className="text-sm md:text-lg font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 font-display">
            {typewriterText}
            <span className="animate-pulse ml-0.5 text-fuchsia-400">|</span>
          </h1>
          {fullText === typewriterText && (
            <p className="text-[9px] md:text-xs text-white/50 font-light mt-0.5 line-clamp-1 italic animate-fade-in">
              Mỗi bức ảnh là một hành tinh chứa đầy kỷ niệm
            </p>
          )}
        </div>

        {/* Right: Next button */}
        {onNext ? (
          <button
            onClick={onNext}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 border border-pink-400/20 text-white transition-all text-xs font-semibold shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_25px_rgba(236,72,153,0.5)] active:scale-95"
          >
            <span>Tiếp theo</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        ) : <div className="w-[84px] sm:w-[110px]" />}
      </div>

      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Music player */}
      {music && (
        <div className="fixed z-50" style={{ left: musicPos.x, bottom: musicPos.y }}>
          {!musicExpanded && (
            <div
              onClick={handleNoteClick}
              onMouseDown={handleMusicMouseDown}
              onTouchStart={handleMusicTouchStart}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden shadow-lg"
            >
              <div className={`absolute inset-0 bg-primary/20 rounded-full ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
              <span className="material-symbols-outlined text-white text-xl relative z-10 pointer-events-none">music_note</span>
            </div>
          )}

          {musicExpanded && (
            <div className="bg-[#16213e]/90 backdrop-blur-md dreamy-shadow rounded-full px-6 py-3 flex items-center justify-between gap-4 border border-white/10 relative overflow-hidden shadow-lg max-w-xs">
              <div
                onClick={handleNoteClick}
                onMouseDown={handleMusicMouseDown}
                onTouchStart={handleMusicTouchStart}
                className="flex items-center gap-4 flex-1 min-w-0 cursor-grab active:cursor-grabbing"
              >
                <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center relative overflow-hidden">
                  <div className={`absolute inset-0 bg-primary/20 rounded-full ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                  <span className="material-symbols-outlined text-primary text-xl relative z-10 pointer-events-none">music_note</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-label-caps text-label-caps text-primary truncate font-semibold pointer-events-none">Nhạc nền</p>
                  <p className="font-caption text-[10px] text-on-surface-variant truncate uppercase tracking-tighter pointer-events-none">Kỷ niệm của chúng ta</p>
                </div>
              </div>
              <button onClick={handlePlayClick} className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform active:scale-95 flex-shrink-0">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{isPlaying ? 'pause' : 'play_arrow'}</span>
              </button>
              <div className="h-1 absolute bottom-0 left-0 right-0 bg-primary/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-200" style={{ width: `${audioProgress}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={e => e.stopPropagation()}>
            <img src={selectedImage} alt="" className="w-full h-full object-contain rounded-2xl" />
            <button onClick={handleCloseModal} className="absolute -top-12 right-0 text-white/70 hover:text-white p-2 transition-colors">
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
          </div>
        </div>
      )}

    </section>
  );
};

export const CosmicGallery = React.memo(CosmicGalleryInner);
