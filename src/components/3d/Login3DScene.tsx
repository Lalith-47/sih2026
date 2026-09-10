import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '@/lib/theme-context';

// Dynamic background color updater on Three.js Scene
function SceneThemeManager({ isLight }: { isLight: boolean }) {
  const { scene } = useThree();

  useEffect(() => {
    scene.background = new THREE.Color(isLight ? '#F1F5F9' : '#040711');
  }, [isLight, scene]);

  return null;
}

// 1. Interactive Camera Controller with Mouse Smoothing
function InteractiveCameraRig({ mousePos }: { mousePos: React.MutableRefObject<{ x: number; y: number }> }) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    // Smooth lerp camera position based on normalized mouse coords (-1 to 1)
    const targetX = mousePos.current.x * 1.8;
    const targetY = 1.0 + mousePos.current.y * 1.2;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, Math.min(delta * 2.5, 0.1));
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, Math.min(delta * 2.5, 0.1));
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// 2. Undulating Digital Twin Topological Mesh (Infrastructure Terrain Wave)
function UndulatingTopographicGrid({ isLight }: { isLight: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const { geometry, originalPositions } = useMemo(() => {
    const geom = new THREE.PlaneGeometry(36, 36, 48, 48);
    geom.rotateX(-Math.PI / 2.3);
    const pos = geom.attributes.position;
    const orig = new Float32Array(pos.array.length);
    orig.set(pos.array);
    return { geometry: geom, originalPositions: orig };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime() * 0.7;
    const pos = geometry.attributes.position;
    const arr = pos.array as Float32Array;

    for (let i = 0; i < pos.count; i++) {
      const idx = i * 3;
      const x = originalPositions[idx];
      const z = originalPositions[idx + 2]; // Z is depth after tilt

      // Multidimensional undulating sine waves
      const wave1 = Math.sin(x * 0.25 + time * 1.1) * Math.cos(z * 0.25 + time * 0.9) * 1.1;
      const wave2 = Math.sin((x + z) * 0.15 - time * 0.8) * 0.7;
      const wave3 = Math.cos(x * 0.5 - time * 1.4) * 0.25;

      arr[idx + 1] = originalPositions[idx + 1] + (wave1 + wave2 + wave3) * 0.85;
    }
    pos.needsUpdate = true;
  });

  const surfaceColor = isLight ? '#BAE6FD' : '#042F2E';
  const emissiveColor = isLight ? '#0284C7' : '#059669';

  return (
    <group position={[0, -3.2, -6]}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color={surfaceColor}
          emissive={emissiveColor}
          emissiveIntensity={isLight ? 0.35 : 0.45}
          roughness={0.4}
          metalness={0.8}
          wireframe
          transparent
          opacity={isLight ? 0.4 : 0.45}
        />
      </mesh>
    </group>
  );
}

// 3. Central Telemetry Orbital Rings (Gyroscopic HUD)
function OrbitalTelemetryRings({ isLight }: { isLight: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x -= delta * 0.25;
      ring2Ref.current.rotation.y += delta * 0.15;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z -= delta * 0.12;
    }
  });

  const colorCyan = isLight ? '#0284C7' : '#06B6D4';
  const colorEmerald = isLight ? '#059669' : '#10B981';
  const colorViolet = isLight ? '#6366F1' : '#8B5CF6';

  return (
    <group ref={groupRef} position={[0, 0.4, -4.5]}>
      {/* Outer Telemetry Ring */}
      <mesh ref={ring1Ref} rotation={[0.4, 0.2, 0]}>
        <ringGeometry args={[3.8, 3.84, 80]} />
        <meshBasicMaterial color={colorEmerald} transparent opacity={isLight ? 0.55 : 0.35} side={THREE.DoubleSide} />
      </mesh>

      {/* Tilted Middle Ring */}
      <mesh ref={ring2Ref} rotation={[-0.6, 0.3, 0]}>
        <ringGeometry args={[2.9, 2.93, 64]} />
        <meshBasicMaterial color={colorCyan} transparent opacity={isLight ? 0.6 : 0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Counter-rotating Inner Ring */}
      <mesh ref={ring3Ref} rotation={[0.8, -0.4, 0]}>
        <ringGeometry args={[2.0, 2.025, 48]} />
        <meshBasicMaterial color={colorViolet} transparent opacity={isLight ? 0.5 : 0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Luminous Core Pulse Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.22, 36]} />
        <meshBasicMaterial color={colorCyan} transparent opacity={isLight ? 0.4 : 0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// 4. Floating Quantum Data Polyhedrons (Infrastructure Nodes)
function FloatingDataNodes({ isLight }: { isLight: boolean }) {
  const crystalColor1 = isLight ? '#0284C7' : '#06B6D4';
  const crystalColor2 = isLight ? '#059669' : '#10B981';
  const crystalColor3 = isLight ? '#4F46E5' : '#818CF8';

  return (
    <group>
      {/* Left Top Node */}
      <Float speed={2} rotationIntensity={1.5} floatIntensity={1.8} position={[-4.5, 2.4, -3]}>
        <mesh>
          <octahedronGeometry args={[0.65, 0]} />
          <meshStandardMaterial
            color={crystalColor1}
            emissive={crystalColor1}
            emissiveIntensity={isLight ? 0.4 : 0.5}
            wireframe
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>
      </Float>

      {/* Right Upper Node */}
      <Float speed={2.4} rotationIntensity={2} floatIntensity={1.5} position={[4.8, 1.8, -3.2]}>
        <mesh>
          <icosahedronGeometry args={[0.75, 0]} />
          <meshStandardMaterial
            color={crystalColor2}
            emissive={crystalColor2}
            emissiveIntensity={isLight ? 0.45 : 0.6}
            wireframe
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>
      </Float>

      {/* Left Lower Node */}
      <Float speed={1.8} rotationIntensity={1.2} floatIntensity={2} position={[-4.2, -1.8, -2.5]}>
        <mesh>
          <dodecahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial
            color={crystalColor3}
            emissive={crystalColor3}
            emissiveIntensity={isLight ? 0.35 : 0.4}
            wireframe
            roughness={0.3}
            metalness={0.85}
          />
        </mesh>
      </Float>

      {/* Right Lower Node */}
      <Float speed={2.2} rotationIntensity={1.8} floatIntensity={1.6} position={[4.4, -2.2, -3]}>
        <mesh>
          <octahedronGeometry args={[0.6, 0]} />
          <meshStandardMaterial
            color={crystalColor1}
            emissive={crystalColor1}
            emissiveIntensity={isLight ? 0.4 : 0.5}
            wireframe
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>
      </Float>
    </group>
  );
}

// 5. Deep Space Quantum Particle Field (Drifting Constellation)
function ParticleConstellation({ isLight }: { isLight: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, scales] = useMemo(() => {
    const count = 350;
    const pos = new Float32Array(count * 3);
    const scl = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 32;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 2] = -12 + (Math.random() - 0.5) * 14;
      scl[i] = Math.random() * 0.8 + 0.2;
    }
    return [pos, scl];
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.015;
      pointsRef.current.rotation.x += delta * 0.008;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isLight ? 0.08 : 0.07}
        color={isLight ? '#0284C7' : '#34D399'}
        transparent
        opacity={isLight ? 0.65 : 0.55}
        sizeAttenuation
        blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
      />
    </points>
  );
}

// Main 3D Canvas Scene
export function Login3DScene() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const mousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 52 }}
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
      >
        <SceneThemeManager isLight={isLight} />

        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={isLight ? 0.95 : 0.45} />
        <directionalLight
          position={[6, 8, 5]}
          intensity={isLight ? 1.1 : 0.8}
          color={isLight ? '#38BDF8' : '#10B981'}
        />
        <directionalLight
          position={[-6, -6, 3]}
          intensity={isLight ? 0.7 : 0.5}
          color={isLight ? '#818CF8' : '#06B6D4'}
        />
        <pointLight
          position={[0, 2, 2]}
          intensity={isLight ? 0.9 : 1.2}
          color={isLight ? '#0284C7' : '#10B981'}
          distance={16}
        />

        {/* 3D Scene Components */}
        <InteractiveCameraRig mousePos={mousePos} />
        <ParticleConstellation isLight={isLight} />
        <OrbitalTelemetryRings isLight={isLight} />
        <UndulatingTopographicGrid isLight={isLight} />
        <FloatingDataNodes isLight={isLight} />
      </Canvas>

      {/* Cinematic Vignette & Radial Atmospheric Illumination */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-500"
        style={{
          background: isLight
            ? 'radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(241, 245, 249, 0.75) 85%, #F1F5F9 100%)'
            : 'radial-gradient(ellipse at 50% 45%, transparent 30%, rgba(4, 7, 17, 0.65) 75%, #040711 100%)',
        }}
      />
    </div>
  );
}

export default Login3DScene;
