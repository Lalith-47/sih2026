import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '@/lib/theme-context';

// ==========================================
// 1. DYNAMIC ENVIRONMENT & FOG
// ==========================================
function SceneEnvironment({ isLight }: { isLight: boolean }) {
  const { scene } = useThree();

  useEffect(() => {
    const bgColor = isLight ? '#F0F4F9' : '#030712';
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.FogExp2(bgColor, isLight ? 0.038 : 0.045);
  }, [isLight, scene]);

  return null;
}

// ==========================================
// 2. SMOOTH GYROSCOPIC CAMERA RIG
// ==========================================
function CameraRig({ mousePos }: { mousePos: React.MutableRefObject<{ x: number; y: number }> }) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    const targetX = mousePos.current.x * 2.8;
    const targetY = 0.5 + mousePos.current.y * 1.8;
    const targetZ = 8.5 - Math.abs(mousePos.current.x) * 0.6;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, Math.min(delta * 2.5, 0.1));
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, Math.min(delta * 2.5, 0.1));
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, Math.min(delta * 2.5, 0.1));

    // Dynamic bank/tilt
    camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, -mousePos.current.x * 0.06, delta * 2.0);

    camera.lookAt(targetX * 0.25, 0.2, 0);
  });

  return null;
}

// ==========================================
// 3. HOLOGRAPHIC DIGITAL TWIN GLOBE & ARCS
// ==========================================

interface HubCoordinate {
  id: string;
  name: string;
  pos: [number, number, number];
}

function HolographicDigitalTwin({ isLight }: { isLight: boolean }) {
  const globeGroupRef = useRef<THREE.Group>(null);
  const innerCoreRef = useRef<THREE.Mesh>(null);
  const packetGroupRef = useRef<THREE.Group>(null);

  // Surface Hubs mapped onto sphere (radius ~ 2.4)
  const sphereRadius = 2.35;
  const hubs: HubCoordinate[] = useMemo(() => {
    // Generate distinct geographical cluster positions
    const latLngs = [
      { id: 'delhi', name: 'Northern Gateway (Delhi)', lat: 28.6, lng: 77.2 },
      { id: 'mumbai', name: 'Western Financial Hub (Mumbai)', lat: 19.0, lng: 72.8 },
      { id: 'bengaluru', name: 'Silicon Corridors (Bengaluru)', lat: 12.9, lng: 77.6 },
      { id: 'hyderabad', name: 'Central Quantum Node (Hyderabad)', lat: 17.3, lng: 78.4 },
      { id: 'chennai', name: 'Deep Sea Maritime (Chennai)', lat: 13.0, lng: 80.2 },
      { id: 'kolkata', name: 'Eastern Industrial Artery (Kolkata)', lat: 22.5, lng: 88.3 },
      { id: 'ahmedabad', name: 'Chemical & Freight Corridor (Ahmedabad)', lat: 23.0, lng: 72.5 },
      { id: 'guwahati', name: 'Northeast Sentinel (Guwahati)', lat: 26.1, lng: 91.7 },
    ];

    return latLngs.map((h) => {
      const phi = (90 - h.lat) * (Math.PI / 180);
      const theta = (h.lng + 180) * (Math.PI / 180);
      const x = -(sphereRadius * Math.sin(phi) * Math.cos(theta));
      const z = sphereRadius * Math.sin(phi) * Math.sin(theta);
      const y = sphereRadius * Math.cos(phi);
      return { id: h.id, name: h.name, pos: [x, y, z] as [number, number, number] };
    });
  }, [sphereRadius]);

  // Parabolic Beziers Connecting Hubs
  const corridorCurves = useMemo(() => {
    const connections: { curve: THREE.QuadraticBezierCurve3; points: THREE.Vector3[] }[] = [];
    const pairs = [
      [0, 1], // Delhi - Mumbai
      [0, 5], // Delhi - Kolkata
      [1, 2], // Mumbai - Bengaluru
      [2, 4], // Bengaluru - Chennai
      [2, 3], // Bengaluru - Hyderabad
      [3, 0], // Hyderabad - Delhi
      [0, 6], // Delhi - Ahmedabad
      [5, 7], // Kolkata - Guwahati
      [1, 6], // Mumbai - Ahmedabad
    ];

    pairs.forEach(([aIdx, bIdx]) => {
      const p1 = new THREE.Vector3(...hubs[aIdx].pos);
      const p2 = new THREE.Vector3(...hubs[bIdx].pos);
      // Midpoint elevated above sphere to form majestic arc
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const elevation = 1.35 + mid.length() * 0.15;
      mid.normalize().multiplyScalar(sphereRadius * elevation);

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      connections.push({ curve, points: curve.getPoints(32) });
    });

    return connections;
  }, [hubs, sphereRadius]);

  // Rotational Animation & Traveling Laser Pulses
  useFrame((state, delta) => {
    if (globeGroupRef.current) {
      // Gentle planetary rotation
      globeGroupRef.current.rotation.y += delta * 0.12;
      globeGroupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.08;
    }
    if (innerCoreRef.current) {
      // Pulsing core breathing
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.04 + 1.0;
      innerCoreRef.current.scale.set(pulse, pulse, pulse);
    }
    if (packetGroupRef.current) {
      // Update light packet positions along curves
      const time = state.clock.elapsedTime * 0.8;
      packetGroupRef.current.children.forEach((child, idx) => {
        const cIdx = idx % corridorCurves.length;
        const progress = (time + idx * 0.22) % 1.0;
        const pt = corridorCurves[cIdx].curve.getPoint(progress);
        child.position.copy(pt);
      });
    }
  });

  const wireColor = isLight ? '#0284C7' : '#10B981';
  const pointColor = isLight ? '#06B6D4' : '#34D399';
  const arcColor = isLight ? '#0284C7' : '#38BDF8';
  const coreColor = isLight ? '#BAE6FD' : '#047857';

  return (
    <group ref={globeGroupRef} position={[0, 0.4, -0.6]}>
      {/* 1. Translucent Quantum Core */}
      <mesh ref={innerCoreRef}>
        <sphereGeometry args={[sphereRadius * 0.92, 32, 24]} />
        <meshStandardMaterial
          color={coreColor}
          transparent
          opacity={isLight ? 0.35 : 0.25}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>

      {/* 2. Geodesic Wireframe Planetary Matrix */}
      <mesh>
        <icosahedronGeometry args={[sphereRadius, 4]} />
        <meshStandardMaterial
          color={wireColor}
          wireframe
          transparent
          opacity={isLight ? 0.35 : 0.28}
        />
      </mesh>

      {/* 3. Glowing Vertex Constellation Cloud on Globe */}
      <points>
        <icosahedronGeometry args={[sphereRadius, 3]} />
        <pointsMaterial
          size={0.065}
          color={pointColor}
          transparent
          opacity={isLight ? 0.75 : 0.85}
          sizeAttenuation
        />
      </points>

      {/* 4. Concentric Longitudinal & Latitudinal Coordinate Rings */}
      {[-0.6, 0, 0.6].map((latY, i) => {
        const ringRad = Math.sqrt(Math.max(0, sphereRadius * sphereRadius - latY * latY * 2.2));
        return (
          <mesh key={i} position={[0, latY * 1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[ringRad - 0.015, ringRad + 0.015, 64]} />
            <meshBasicMaterial
              color={isLight ? '#0EA5E9' : '#059669'}
              transparent
              opacity={isLight ? 0.4 : 0.35}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}

      {/* 5. Major Infrastructure Hub Nodes with Vertical Laser Beacons */}
      {hubs.map((hub) => {
        const norm = new THREE.Vector3(...hub.pos).normalize();
        return (
          <group key={hub.id} position={hub.pos}>
            {/* Surface Node Anchor Point */}
            <mesh>
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshBasicMaterial color={isLight ? '#0284C7' : '#10B981'} />
            </mesh>
            {/* Beacon Laser Pillar radiating outwards */}
            <mesh position={[norm.x * 0.35, norm.y * 0.35, norm.z * 0.35]}>
              <cylinderGeometry args={[0.015, 0.03, 0.7, 8]} />
              <meshBasicMaterial color={isLight ? '#38BDF8' : '#34D399'} transparent opacity={0.7} />
            </mesh>
          </group>
        );
      })}

      {/* 6. Luminous National Corridor Arcs */}
      {corridorCurves.map((corr, idx) => {
        const lineGeo = new THREE.BufferGeometry().setFromPoints(corr.points);
        return (
          <primitive key={idx} object={new THREE.Line(lineGeo, new THREE.LineBasicMaterial({
            color: arcColor,
            transparent: true,
            opacity: isLight ? 0.55 : 0.45,
            linewidth: 2,
          }))} />
        );
      })}

      {/* 7. Animated High-Speed Data/Energy Packets traveling along Arcs */}
      <group ref={packetGroupRef}>
        {corridorCurves.map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.065, 8, 8]} />
            <meshBasicMaterial color={isLight ? '#F59E0B' : '#67E8F9'} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ==========================================
// 4. GYROSCOPIC ORBITAL SATELLITE RINGS
// ==========================================
function OrbitalSatelliteSystem({ isLight }: { isLight: boolean }) {
  const ringGroup1 = useRef<THREE.Group>(null);
  const ringGroup2 = useRef<THREE.Group>(null);
  const sat1Ref = useRef<THREE.Mesh>(null);
  const sat2Ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (ringGroup1.current) {
      ringGroup1.current.rotation.z += delta * 0.15;
      ringGroup1.current.rotation.y += delta * 0.08;
    }
    if (ringGroup2.current) {
      ringGroup2.current.rotation.z -= delta * 0.12;
      ringGroup2.current.rotation.x += delta * 0.06;
    }

    // Satellites orbiting around the rings
    const t1 = state.clock.elapsedTime * 0.5;
    if (sat1Ref.current) {
      sat1Ref.current.position.x = Math.cos(t1) * 3.8;
      sat1Ref.current.position.y = Math.sin(t1) * 3.8;
    }

    const t2 = -state.clock.elapsedTime * 0.4;
    if (sat2Ref.current) {
      sat2Ref.current.position.x = Math.cos(t2) * 4.6;
      sat2Ref.current.position.y = Math.sin(t2) * 4.6;
    }
  });

  const ringColor = isLight ? '#0284C7' : '#06B6D4';
  const satColor = isLight ? '#F59E0B' : '#34D399';

  return (
    <group position={[0, 0.4, -0.6]}>
      {/* Primary Orbital Plane Ring (35 deg tilt) */}
      <group ref={ringGroup1} rotation={[0.6, 0.4, 0]}>
        <mesh>
          <ringGeometry args={[3.78, 3.82, 96]} />
          <meshBasicMaterial color={ringColor} transparent opacity={isLight ? 0.3 : 0.25} side={THREE.DoubleSide} />
        </mesh>
        {/* NavIC Sentinel Satellite 1 with Solar Wings */}
        <group ref={sat1Ref as any}>
          {/* Central Satellite Body */}
          <mesh>
            <boxGeometry args={[0.16, 0.16, 0.16]} />
            <meshStandardMaterial color={isLight ? '#0F172A' : '#F8FAFC'} metalness={0.9} />
          </mesh>
          {/* Solar Array Panels */}
          <mesh position={[-0.22, 0, 0]}>
            <boxGeometry args={[0.22, 0.08, 0.015]} />
            <meshBasicMaterial color="#38BDF8" />
          </mesh>
          <mesh position={[0.22, 0, 0]}>
            <boxGeometry args={[0.22, 0.08, 0.015]} />
            <meshBasicMaterial color="#38BDF8" />
          </mesh>
          {/* Downlink Telemetry Beacon */}
          <mesh position={[0, -0.12, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color={satColor} />
          </mesh>
        </group>
      </group>

      {/* Secondary Outer Polar Orbital Ring */}
      <group ref={ringGroup2} rotation={[-0.8, -0.5, 0.4]}>
        <mesh>
          <ringGeometry args={[4.58, 4.62, 96]} />
          <meshBasicMaterial color={ringColor} transparent opacity={isLight ? 0.2 : 0.18} side={THREE.DoubleSide} />
        </mesh>
        {/* Geospatial Radar Satellite 2 */}
        <group ref={sat2Ref as any}>
          <mesh>
            <boxGeometry args={[0.18, 0.18, 0.18]} />
            <meshStandardMaterial color={isLight ? '#1E293B' : '#E2E8F0'} metalness={0.95} />
          </mesh>
          {/* Radar Dish */}
          <mesh position={[0, -0.15, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.14, 0.1, 16, 1, true]} />
            <meshStandardMaterial color={satColor} wireframe />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// ==========================================
// 5. UNDULATING QUANTUM TOPOGRAPHICAL WAVE
// ==========================================
function QuantumTopographyWave({ isLight }: { isLight: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const gridDim = 48;

  const { geometry, originalPositions } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(36, 24, gridDim, gridDim);
    const pos = geo.attributes.position.array as Float32Array;
    const orig = new Float32Array(pos.length);
    orig.set(pos);
    return { geometry: geo, originalPositions: orig };
  }, [gridDim]);

  useFrame((state) => {
    if (meshRef.current) {
      const pos = meshRef.current.geometry.attributes.position.array as Float32Array;
      const time = state.clock.elapsedTime * 0.9;

      for (let i = 0; i < pos.length / 3; i++) {
        const x = originalPositions[i * 3];
        const y = originalPositions[i * 3 + 1];

        // Harmonic dual-wave equations creating fluid organic terrain ripples
        const wave =
          Math.sin(x * 0.35 + time) * Math.cos(y * 0.35 + time * 0.7) * 0.45 +
          Math.sin(Math.sqrt(x * x + y * y) * 0.5 - time * 1.2) * 0.25;

        pos[i * 3 + 2] = wave;
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const waveColor = isLight ? '#0284C7' : '#059669';

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={[0, -3.2, -1.5]}
      rotation={[-Math.PI / 2.2, 0, 0]}
    >
      <meshStandardMaterial
        color={waveColor}
        wireframe
        transparent
        opacity={isLight ? 0.35 : 0.22}
        roughness={0.2}
      />
    </mesh>
  );
}

// ==========================================
// 6. FLOATING QUANTUM DATA PARTICLES CLOUD
// ==========================================
function QuantumParticleCloud({ isLight }: { isLight: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, count } = useMemo(() => {
    const count = 300;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 2] = -5 + (Math.random() - 0.5) * 14;
    }
    return { positions: pos, count };
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.02;
      pointsRef.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color={isLight ? '#0284C7' : '#34D399'}
        transparent
        opacity={isLight ? 0.45 : 0.4}
        sizeAttenuation
      />
    </points>
  );
}

// ==========================================
// MAIN COMPONENT: QUANTUM DIGITAL TWIN SCENE
// ==========================================
export function QuantumDigitalTwinScene() {
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
        camera={{ position: [0, 0.5, 8.5], fov: 46 }}
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
      >
        <SceneEnvironment isLight={isLight} />

        {/* Gyroscopic Camera Rig tracking mouse */}
        <CameraRig mousePos={mousePos} />

        {/* Cinematic Multi-color Studio Lighting */}
        <ambientLight intensity={isLight ? 0.95 : 0.45} />
        <directionalLight
          position={[10, 15, 10]}
          intensity={isLight ? 1.4 : 0.8}
          color={isLight ? '#FFFFFF' : '#38BDF8'}
        />
        <directionalLight
          position={[-10, -5, -5]}
          intensity={isLight ? 0.6 : 0.5}
          color={isLight ? '#0284C7' : '#10B981'}
        />
        <pointLight position={[0, 0.4, 3]} intensity={isLight ? 1.0 : 1.5} color="#34D399" distance={12} />

        {/* 1. Holographic Planetary Digital Twin & Corridor Arcs */}
        <HolographicDigitalTwin isLight={isLight} />

        {/* 2. Gyroscopic Orbital Satellites (NavIC Telemetry System) */}
        <OrbitalSatelliteSystem isLight={isLight} />

        {/* 3. Undulating Quantum Topographical Wave Ground */}
        <QuantumTopographyWave isLight={isLight} />

        {/* 4. Floating Quantum Stardust Particles */}
        <QuantumParticleCloud isLight={isLight} />
      </Canvas>

      {/* Cinematic Vignette for focus on central login card */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-500"
        style={{
          background: isLight
            ? 'radial-gradient(ellipse at 50% 48%, transparent 32%, rgba(240, 244, 249, 0.75) 75%, #F0F4F9 100%)'
            : 'radial-gradient(ellipse at 50% 48%, transparent 28%, rgba(3, 7, 18, 0.78) 72%, #030712 100%)',
        }}
      />
    </div>
  );
}

export default QuantumDigitalTwinScene;
