import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type SylvieMood = 'idle' | 'thinking' | 'speaking' | 'alert';

interface SylvieHologram3DProps {
  mood?: SylvieMood;
  height?: number;
  label?: string;
}

const _pointerTarget = new THREE.Vector2(0, 0);

function detectSoftwareGl(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function SylvieHologram3D({
  mood = 'idle',
  height = 200,
  label = 'Sylvie 3D Copilot Hologram',
}: SylvieHologram3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const moodRef = useRef<SylvieMood>(mood);
  const [fallbackActive, setFallbackActive] = useState(false);

  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setFallbackActive(true);
      return;
    }

    const isSoftwareGl = detectSoftwareGl();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setFallbackActive(true);
      return;
    }

    const width = Math.max(container.clientWidth, 180);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = `${height}px`;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 0.45, 4.1);
    camera.lookAt(0, 0.05, 0);

    // 3-point studio lighting with warm/cool contrast
    const keyLight = new THREE.DirectionalLight(0xe0f7ff, 2.2);
    keyLight.position.set(2.8, 3.5, 3.2);
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x38bdf8, 0x1e1b4b, 1.1);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xc084fc, 1.8);
    rimLight.position.set(-2.5, 1.8, -2.5);
    scene.add(rimLight);

    // Composite 8-part procedural Sylvie holographic assembly
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const disposables: Array<{ dispose: () => void }> = [];

    // 1. Grounded emitter pedestal base
    const baseGeo = new THREE.CylinderGeometry(0.92, 1.1, 0.16, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.88,
      roughness: 0.24,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -1.12;
    rootGroup.add(baseMesh);
    disposables.push(baseGeo, baseMat);

    // 2. Emitter collar ring
    const collarGeo = new THREE.TorusGeometry(0.84, 0.03, 12, 48);
    const collarMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x22d3ee,
      emissiveIntensity: 0.9,
      metalness: 0.4,
      roughness: 0.2,
    });
    const collarMesh = new THREE.Mesh(collarGeo, collarMat);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.y = -1.03;
    rootGroup.add(collarMesh);
    disposables.push(collarGeo, collarMat);

    // 3. Projection beam disc (soft contact hologram base)
    const discGeo = new THREE.CircleGeometry(0.8, 36);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const discMesh = new THREE.Mesh(discGeo, discMat);
    discMesh.rotation.x = -Math.PI / 2;
    discMesh.position.y = -1.01;
    rootGroup.add(discMesh);
    disposables.push(discGeo, discMat);

    // 4. Head & bust holographic avatar assembly
    const avatarGroup = new THREE.Group();
    avatarGroup.position.y = 0.05;
    rootGroup.add(avatarGroup);

    // Sculpted shoulder collar using LatheGeometry
    const bustPoints = [
      new THREE.Vector2(0.01, -0.58),
      new THREE.Vector2(0.56, -0.56),
      new THREE.Vector2(0.46, -0.32),
      new THREE.Vector2(0.22, -0.18),
      new THREE.Vector2(0.2, -0.05),
    ];
    const bustGeo = new THREE.LatheGeometry(bustPoints, 28);
    const bustMat = new THREE.MeshPhysicalMaterial({
      color: 0x67e8f9,
      emissive: 0x0891b2,
      emissiveIntensity: 0.4,
      metalness: 0.25,
      roughness: 0.18,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.72,
    });
    const bustMesh = new THREE.Mesh(bustGeo, bustMat);
    avatarGroup.add(bustMesh);
    disposables.push(bustGeo, bustMat);

    // 5. Outer crystalline head shell
    const headGeo = new THREE.IcosahedronGeometry(0.44, 2);
    const headMat = new THREE.MeshPhysicalMaterial({
      color: 0x0e7490,
      emissive: 0x22d3ee,
      emissiveIntensity: 0.3,
      metalness: 0.65,
      roughness: 0.15,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.85,
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.y = 0.28;
    headMesh.scale.set(0.92, 1.08, 0.96);
    avatarGroup.add(headMesh);
    disposables.push(headGeo, headMat);

    // 6. Visor band + optical nodes
    const visorGeo = new THREE.CylinderGeometry(0.43, 0.43, 0.15, 28, 1, true, -Math.PI * 0.38, Math.PI * 0.76);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x040814,
      metalness: 0.9,
      roughness: 0.1,
      side: THREE.DoubleSide,
    });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 0.3, 0.02);
    avatarGroup.add(visorMesh);
    disposables.push(visorGeo, visorMat);

    const eyeGeo = new THREE.SphereGeometry(0.048, 16, 16);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x22d3ee,
      emissiveIntensity: 1.6,
      roughness: 0.1,
    });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.14, 0.3, 0.41);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.14, 0.3, 0.41);
    avatarGroup.add(leftEye, rightEye);
    disposables.push(eyeGeo, eyeMat);

    // 7. Twin gyroscopic orbital rings
    const ring1Geo = new THREE.TorusGeometry(0.86, 0.018, 10, 56);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x22d3ee,
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.2,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.position.y = 0.15;
    ring1.rotation.set(0.55, 0.3, 0);
    rootGroup.add(ring1);
    disposables.push(ring1Geo, ring1Mat);

    const ring2Geo = new THREE.TorusGeometry(1.04, 0.014, 10, 56);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0xa855f7,
      emissiveIntensity: 0.75,
      metalness: 0.7,
      roughness: 0.25,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.position.y = 0.15;
    ring2.rotation.set(-0.65, -0.4, 0.3);
    rootGroup.add(ring2);
    disposables.push(ring2Geo, ring2Mat);

    // 8. Instanced orbital data nodes (24 micro-nodes)
    const nodeCount = 24;
    const nodeGeo = new THREE.OctahedronGeometry(0.032, 0);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      emissive: 0x22d3ee,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.6,
    });
    const instancedNodes = new THREE.InstancedMesh(nodeGeo, nodeMat, nodeCount);
    instancedNodes.frustumCulled = false;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 1.18 + (i % 3) * 0.12;
      dummy.position.set(
        Math.cos(angle) * radius,
        ((i % 5) - 2) * 0.24 + 0.1,
        Math.sin(angle) * radius
      );
      dummy.updateMatrix();
      instancedNodes.setMatrixAt(i, dummy.matrix);
    }
    instancedNodes.instanceMatrix.needsUpdate = true;
    rootGroup.add(instancedNodes);
    disposables.push(nodeGeo, nodeMat);

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      _pointerTarget.x = ((e.clientX - rect.left) / rect.width - 0.5) * 0.5;
      _pointerTarget.y = -((e.clientY - rect.top) / rect.height - 0.5) * 0.35;
    };
    const handlePointerLeave = () => {
      _pointerTarget.set(0, 0);
    };
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);

    const handleContextLost = (ev: Event) => {
      ev.preventDefault();
      setFallbackActive(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

    const handleResize = () => {
      if (!container) return;
      const nextWidth = Math.max(container.clientWidth, 180);
      camera.aspect = nextWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, height);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    let frameId = 0;
    let disposed = false;
    const startTime = performance.now();
    let prevTime = startTime;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const poll = () => {
        if (disposed) return;
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min((now - prevTime) / 1000, 0.1);
      prevTime = now;
      const elapsed = (now - startTime) / 1000;
      const currentMood = moodRef.current;

      const speedMult =
        currentMood === 'thinking' ? 2.4 : currentMood === 'speaking' ? 1.7 : currentMood === 'alert' ? 2.0 : 1.0;

      avatarGroup.position.y = 0.05 + Math.sin(elapsed * 1.8) * 0.055;
      avatarGroup.rotation.y = THREE.MathUtils.damp(avatarGroup.rotation.y, _pointerTarget.x, 5, dt);
      avatarGroup.rotation.x = THREE.MathUtils.damp(avatarGroup.rotation.x, _pointerTarget.y * 0.5, 5, dt);

      ring1.rotation.z += dt * 0.65 * speedMult;
      ring1.rotation.y += dt * 0.35 * speedMult;
      ring2.rotation.z -= dt * 0.48 * speedMult;
      ring2.rotation.x += dt * 0.25 * speedMult;
      instancedNodes.rotation.y += dt * 0.28 * speedMult;

      const targetEmissive =
        currentMood === 'alert' ? 0xf59e0b : currentMood === 'speaking' ? 0x34d399 : 0x22d3ee;
      eyeMat.emissive.setHex(targetEmissive);
      eyeMat.color.setHex(targetEmissive);
      const pulseScale = currentMood === 'speaking' ? 1 + Math.sin(elapsed * 12) * 0.22 : 1;
      leftEye.scale.setScalar(pulseScale);
      rightEye.scale.setScalar(pulseScale);

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      envTex.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, [height]);

  if (fallbackActive) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-xl border border-cyan-400/25 bg-[#080d1c]"
        style={{ height }}
        aria-label={label}
        data-testid="sylvie-hologram-fallback"
      >
        <svg viewBox="0 0 220 120" className="h-28 w-44" aria-hidden="true">
          <defs>
            <linearGradient id="sylvieFallbackGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <ellipse cx="110" cy="102" rx="66" ry="9" fill="none" stroke="url(#sylvieFallbackGrad)" strokeOpacity="0.55" />
          <circle cx="110" cy="46" r="26" fill="rgba(34,211,238,0.12)" stroke="url(#sylvieFallbackGrad)" strokeWidth="2" />
          <rect x="92" y="38" width="36" height="16" rx="8" fill="#060913" stroke="#22d3ee" strokeWidth="1.5" />
          <circle cx="103" cy="46" r="3" fill="#22d3ee" />
          <circle cx="117" cy="46" r="3" fill="#22d3ee" />
          <path d="M84 78 C84 64, 136 64, 136 78 L130 96 L90 96 Z" fill="rgba(168,85,247,0.18)" stroke="url(#sylvieFallbackGrad)" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden rounded-xl"
      style={{ height }}
      role="img"
      aria-label={label}
      data-testid="sylvie-hologram-3d"
    />
  );
}
