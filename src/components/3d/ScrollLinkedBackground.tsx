import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Layer 1: Deep Constellation / Topo Grid (Far Depth)
function DeepSpaceLayer({ scroll }: { scroll: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const count = 120;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 2] = -8 + (Math.random() - 0.5) * 4;
    }
    return positions;
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      // Subtle continuous drift + slow parallax
      pointsRef.current.rotation.z += delta * 0.02;
      pointsRef.current.position.y = THREE.MathUtils.lerp(
        pointsRef.current.position.y,
        scroll * 2.0,
        0.05
      );
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#10B981"
        transparent
        opacity={0.35}
        sizeAttenuation
      />
    </points>
  );
}

// Layer 2: Holographic Radar Rings & Coordinate Beams (Mid Depth)
function MidDepthRadarRings({ scroll }: { scroll: number }) {
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Rotate and shift position based on scroll
      groupRef.current.rotation.y += delta * 0.15;
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        -scroll * 5.0,
        0.08
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        scroll * 0.8,
        0.08
      );
    }
    if (ring1.current) ring1.current.rotation.z += delta * 0.2;
    if (ring2.current) ring2.current.rotation.z -= delta * 0.25;
  });

  return (
    <group ref={groupRef} position={[2.5, 0, -3.5]}>
      {/* Outer Telemetry Ring */}
      <mesh ref={ring1} rotation={[Math.PI / 4, 0, 0]}>
        <ringGeometry args={[2.2, 2.24, 48]} />
        <meshBasicMaterial color="#06B6D4" transparent opacity={0.22} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner Scanner Disc */}
      <mesh ref={ring2} rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[1.4, 1.43, 32]} />
        <meshBasicMaterial color="#10B981" transparent opacity={0.28} side={THREE.DoubleSide} />
      </mesh>
      {/* Coordinate Crosswire */}
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[3.2, 0.015, 0.015]} />
        <meshBasicMaterial color="#10B981" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

// Layer 3: Floating Infrastructure Digital Nodes (Near Depth)
function NearNodesLayer({ scroll }: { scroll: number }) {
  const nodesGroup = useRef<THREE.Group>(null);

  const nodeOffsets = useMemo(
    () => [
      [-3.2, 2.0, 0.5],
      [3.0, -1.5, 0.2],
      [-2.0, -3.5, 0.8],
      [2.2, -6.0, 0.4],
      [-2.8, -9.0, 0.6],
    ],
    []
  );

  useFrame((state, delta) => {
    if (nodesGroup.current) {
      // Faster parallax movement creating genuine depth
      nodesGroup.current.position.y = THREE.MathUtils.lerp(
        nodesGroup.current.position.y,
        scroll * 8.5,
        0.1
      );
      nodesGroup.current.rotation.y = THREE.MathUtils.lerp(
        nodesGroup.current.rotation.y,
        scroll * 0.5,
        0.05
      );
    }
  });

  return (
    <group ref={nodesGroup} position={[0, 0, 0]}>
      {nodeOffsets.map(([x, y, z], idx) => (
        <group key={idx} position={[x, y, z]}>
          <mesh rotation={[idx * 0.4, idx * 0.6, 0]}>
            <octahedronGeometry args={[0.22, 0]} />
            <meshStandardMaterial
              color={idx % 2 === 0 ? '#10B981' : '#06B6D4'}
              wireframe
              transparent
              opacity={0.35}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function ScrollLinkedBackgroundContent() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check user preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);

    // Scroll progress handler
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          const currentProgress = totalHeight > 0 ? window.scrollY / totalHeight : 0;
          setScrollProgress(currentProgress);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Fallback: If user prefers reduced motion or WebGL is unsupported, render static backdrop
  if (reducedMotion) {
    return (
      <div 
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 bg-[#07090E]" 
      />
    );
  }

  return (
    <div 
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 select-none overflow-hidden"
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.25]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.6} color="#10B981" />
        <directionalLight position={[-5, -5, 2]} intensity={0.4} color="#06B6D4" />

        <DeepSpaceLayer scroll={scrollProgress} />
        <MidDepthRadarRings scroll={scrollProgress} />
        <NearNodesLayer scroll={scrollProgress} />
      </Canvas>
    </div>
  );
}

export default ScrollLinkedBackgroundContent;
