import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '@/lib/theme-context';

// ==========================================
// PROCEDURAL INDUSTRIAL TEXTURE GENERATORS
// ==========================================

function createProceduralTextures(isLight: boolean) {
  if (typeof document === 'undefined') return null;

  // 1. Riveted Steel Plate Texture (For Distillation Towers, Columns & Tanks)
  const plateCanvas = document.createElement('canvas');
  plateCanvas.width = 512;
  plateCanvas.height = 512;
  const pCtx = plateCanvas.getContext('2d')!;

  // Base metallic fill
  const plateGrad = pCtx.createLinearGradient(0, 0, 512, 512);
  if (isLight) {
    plateGrad.addColorStop(0, '#94A3B8');
    plateGrad.addColorStop(0.3, '#CBD5E1');
    plateGrad.addColorStop(0.7, '#E2E8F0');
    plateGrad.addColorStop(1, '#94A3B8');
  } else {
    plateGrad.addColorStop(0, '#0F172A');
    plateGrad.addColorStop(0.3, '#1E293B');
    plateGrad.addColorStop(0.7, '#334155');
    plateGrad.addColorStop(1, '#0F172A');
  }
  pCtx.fillStyle = plateGrad;
  pCtx.fillRect(0, 0, 512, 512);

  // Brushed steel micro-scratches
  pCtx.fillStyle = isLight ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)';
  for (let i = 0; i < 600; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const len = 30 + Math.random() * 180;
    pCtx.fillRect(x, y, len, 1);
  }

  // Horizontal weld seams & panel borders
  pCtx.strokeStyle = isLight ? 'rgba(51, 65, 85, 0.4)' : 'rgba(2, 6, 23, 0.8)';
  pCtx.lineWidth = 4;
  pCtx.strokeRect(2, 2, 508, 508);

  pCtx.beginPath();
  pCtx.moveTo(0, 128); pCtx.lineTo(512, 128);
  pCtx.moveTo(0, 256); pCtx.lineTo(512, 256);
  pCtx.moveTo(0, 384); pCtx.lineTo(512, 384);
  pCtx.moveTo(256, 0); pCtx.lineTo(256, 512);
  pCtx.stroke();

  // Secondary weld highlight line
  pCtx.strokeStyle = isLight ? 'rgba(255, 255, 255, 0.35)' : 'rgba(148, 163, 184, 0.15)';
  pCtx.lineWidth = 1.5;
  pCtx.beginPath();
  pCtx.moveTo(0, 130); pCtx.lineTo(512, 130);
  pCtx.moveTo(0, 258); pCtx.lineTo(512, 258);
  pCtx.moveTo(0, 386); pCtx.lineTo(512, 386);
  pCtx.stroke();

  // Rivet / Bolt Heads along seams
  pCtx.fillStyle = isLight ? '#475569' : '#0B0F19';
  const rivetRows = [16, 120, 136, 248, 264, 376, 392, 496];
  for (const y of rivetRows) {
    for (let x = 16; x < 512; x += 32) {
      pCtx.beginPath();
      pCtx.arc(x, y, 3, 0, Math.PI * 2);
      pCtx.fill();
    }
  }

  const metalTexture = new THREE.CanvasTexture(plateCanvas);
  metalTexture.wrapS = THREE.RepeatWrapping;
  metalTexture.wrapT = THREE.RepeatWrapping;
  metalTexture.repeat.set(2, 4);

  // 2. Industrial Hazard Caution Stripes (Yellow & Black / Carbon)
  const hazardCanvas = document.createElement('canvas');
  hazardCanvas.width = 256;
  hazardCanvas.height = 256;
  const hCtx = hazardCanvas.getContext('2d')!;

  hCtx.fillStyle = '#EAB308'; // Safety yellow
  hCtx.fillRect(0, 0, 256, 256);

  hCtx.fillStyle = isLight ? '#1E293B' : '#090D16'; // Deep charcoal/black
  const stripeWidth = 32;
  for (let d = -256; d < 512; d += stripeWidth * 2) {
    hCtx.beginPath();
    hCtx.moveTo(d, 0);
    hCtx.lineTo(d + stripeWidth, 0);
    hCtx.lineTo(d + stripeWidth + 256, 256);
    hCtx.lineTo(d + 256, 256);
    hCtx.closePath();
    hCtx.fill();
  }

  const hazardTexture = new THREE.CanvasTexture(hazardCanvas);
  hazardTexture.wrapS = THREE.RepeatWrapping;
  hazardTexture.wrapT = THREE.RepeatWrapping;
  hazardTexture.repeat.set(4, 1);

  // 3. Heavy Industrial Concrete Ground & Roadways Texture
  const groundCanvas = document.createElement('canvas');
  groundCanvas.width = 512;
  groundCanvas.height = 512;
  const gCtx = groundCanvas.getContext('2d')!;

  gCtx.fillStyle = isLight ? '#CBD5E1' : '#070B14';
  gCtx.fillRect(0, 0, 512, 512);

  // Concrete slabs grid lines
  gCtx.strokeStyle = isLight ? '#94A3B8' : '#0F172A';
  gCtx.lineWidth = 2;
  for (let i = 0; i <= 512; i += 64) {
    gCtx.beginPath();
    gCtx.moveTo(i, 0); gCtx.lineTo(i, 512);
    gCtx.moveTo(0, i); gCtx.lineTo(512, i);
    gCtx.stroke();
  }

  // Asphalt Access Road in the center
  gCtx.fillStyle = isLight ? '#64748B' : '#030509';
  gCtx.fillRect(192, 0, 128, 512);

  // Road Lane Dash Line
  gCtx.strokeStyle = '#FBBF24';
  gCtx.lineWidth = 4;
  gCtx.setLineDash([20, 16]);
  gCtx.beginPath();
  gCtx.moveTo(256, 0); gCtx.lineTo(256, 512);
  gCtx.stroke();
  gCtx.setLineDash([]);

  // Concrete surface noise / aggregate specks
  gCtx.fillStyle = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)';
  for (let s = 0; s < 1200; s++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 512;
    gCtx.fillRect(rx, ry, 2, 2);
  }

  const groundTexture = new THREE.CanvasTexture(groundCanvas);
  groundTexture.wrapS = THREE.RepeatWrapping;
  groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(8, 8);

  // 4. Pressure Vessel Geodesic Spherical Seams Texture
  const sphereCanvas = document.createElement('canvas');
  sphereCanvas.width = 512;
  sphereCanvas.height = 256;
  const sCtx = sphereCanvas.getContext('2d')!;

  sCtx.fillStyle = isLight ? '#E2E8F0' : '#1E293B';
  sCtx.fillRect(0, 0, 512, 256);

  sCtx.strokeStyle = isLight ? '#64748B' : '#0A0F1D';
  sCtx.lineWidth = 3;
  // Latitude lines
  for (let lat = 32; lat < 256; lat += 32) {
    sCtx.beginPath();
    sCtx.moveTo(0, lat); sCtx.lineTo(512, lat);
    sCtx.stroke();
  }
  // Longitude lines
  for (let lon = 32; lon < 512; lon += 64) {
    sCtx.beginPath();
    sCtx.moveTo(lon, 0); sCtx.lineTo(lon, 256);
    sCtx.stroke();
  }

  const sphereTexture = new THREE.CanvasTexture(sphereCanvas);
  sphereTexture.wrapS = THREE.RepeatWrapping;
  sphereTexture.wrapT = THREE.ClampToEdgeWrapping;

  return {
    metal: metalTexture,
    hazard: hazardTexture,
    ground: groundTexture,
    sphere: sphereTexture,
  };
}

// 1. Dynamic background color and fog manager
function SceneEnvironment({ isLight }: { isLight: boolean }) {
  const { scene } = useThree();

  useEffect(() => {
    const bgColor = isLight ? '#E2E8F0' : '#02040A';
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.FogExp2(bgColor, isLight ? 0.03 : 0.04);
  }, [isLight, scene]);

  return null;
}

// 2. Interactive Drone Camera Rig with cursor parallax tracking
function RefineryCameraRig({ mousePos }: { mousePos: React.MutableRefObject<{ x: number; y: number }> }) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    const targetX = mousePos.current.x * 4.2;
    const targetY = 2.6 + mousePos.current.y * 2.0;
    const targetZ = 10.2 - Math.abs(mousePos.current.x) * 1.0;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, Math.min(delta * 2.8, 0.1));
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, Math.min(delta * 2.8, 0.1));
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, Math.min(delta * 2.8, 0.1));

    camera.lookAt(targetX * 0.2, 2.0, -1.8);
  });

  return null;
}

// 3. Detailed Distillation & Fractionation Towers with Textured Shell & Catwalks
function DetailedDistillationColumn({
  position,
  height = 8,
  radius = 0.65,
  platforms = 6,
  isLight,
  textures,
}: {
  position: [number, number, number];
  height?: number;
  radius?: number;
  platforms?: number;
  isLight: boolean;
  textures: ReturnType<typeof createProceduralTextures>;
}) {
  const beaconRef = useRef<THREE.Mesh>(null);
  const vaporRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (beaconRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 5) * 0.5 + 0.5;
      (beaconRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 + pulse * 0.7;
    }
    if (vaporRef.current) {
      vaporRef.current.rotation.y += 0.01;
    }
  });

  const platformHeights = useMemo(() => {
    const step = height / (platforms + 1);
    return Array.from({ length: platforms }, (_, i) => step * (i + 1));
  }, [height, platforms]);

  return (
    <group position={position}>
      {/* Heavy Octagonal Concrete Foundation */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[radius * 1.8, radius * 2.0, 0.4, 8]} />
        <meshStandardMaterial color={isLight ? '#94A3B8' : '#0B0F19'} roughness={0.9} />
      </mesh>

      {/* Hazard Striped Foundation Skirt */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[radius * 1.6, radius * 1.7, 0.15, 24]} />
        {textures?.hazard ? (
          <meshStandardMaterial map={textures.hazard} roughness={0.4} />
        ) : (
          <meshStandardMaterial color="#EAB308" />
        )}
      </mesh>

      {/* Main Riveted Steel Column Shell */}
      <mesh position={[0, height / 2 + 0.5, 0]}>
        <cylinderGeometry args={[radius, radius * 1.04, height, 32]} />
        {textures?.metal ? (
          <meshStandardMaterial
            map={textures.metal}
            metalness={isLight ? 0.75 : 0.88}
            roughness={isLight ? 0.35 : 0.2}
          />
        ) : (
          <meshStandardMaterial color={isLight ? '#CBD5E1' : '#1E293B'} metalness={0.85} roughness={0.25} />
        )}
      </mesh>

      {/* Top Hemispherical Cap */}
      <mesh position={[0, height + 0.5, 0]}>
        <sphereGeometry args={[radius, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={isLight ? '#E2E8F0' : '#334155'} metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Multi-tier Circular Catwalk Platforms with Steel Grates */}
      {platformHeights.map((h, i) => (
        <group key={i} position={[0, h + 0.5, 0]}>
          {/* Grate Deck */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius * 0.98, radius * 1.65, 32]} />
            <meshStandardMaterial
              color={isLight ? '#94A3B8' : '#1E293B'}
              metalness={0.8}
              roughness={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Handrail Posts & Railings */}
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[radius * 1.65, radius * 1.65, 0.44, 32, 2, true]} />
            <meshStandardMaterial color={isLight ? '#475569' : '#64748B'} wireframe />
          </mesh>
          {/* Platform Bracing Struts */}
          {[-radius * 1.1, radius * 1.1].map((bx, bi) => (
            <mesh key={bi} position={[bx, -0.2, 0]} rotation={[0, 0, bi === 0 ? 0.6 : -0.6]}>
              <boxGeometry args={[0.04, 0.5, 0.04]} />
              <meshStandardMaterial color={isLight ? '#64748B' : '#334155'} />
            </mesh>
          ))}
        </group>
      ))}

      {/* External Vertical Service Ladder with Safety Cages */}
      <group position={[radius + 0.12, height / 2 + 0.5, 0]}>
        {/* Ladder Stringers */}
        <mesh position={[-0.08, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, height, 8]} />
          <meshStandardMaterial color="#0284C7" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.08, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, height, 8]} />
          <meshStandardMaterial color="#0284C7" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Safety Cages (Wireframe Rings along height) */}
        {Array.from({ length: 12 }, (_, ci) => (
          <mesh key={ci} position={[0, -height / 2 + (height / 12) * (ci + 1), 0]}>
            <torusGeometry args={[0.22, 0.015, 6, 12, Math.PI * 1.5]} />
            <meshStandardMaterial color="#F59E0B" />
          </mesh>
        ))}
      </group>

      {/* Heavy Hydrocarbon Riser Pipes & Valves */}
      <group position={[-radius - 0.18, height / 2 + 0.5, 0.2]}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, height * 0.95, 12]} />
          <meshStandardMaterial color="#10B981" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Isolation Flanges and Red Valve Handwheels */}
        {[height * 0.2, height * 0.6].map((vy, vi) => (
          <group key={vi} position={[0, -height / 2 + vy, 0]}>
            <mesh>
              <cylinderGeometry args={[0.13, 0.13, 0.06, 12]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
            <mesh position={[-0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.12, 0.02, 8, 16]} />
              <meshStandardMaterial color="#EF4444" roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Top Warning Beacon with Glow Effect */}
      <mesh ref={beaconRef} position={[0, height + 0.85, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial color="#EF4444" transparent opacity={1} />
      </mesh>
    </group>
  );
}

// 4. Textured Pressurized Gas Storage (Horton Spheres on Steel Stilts)
function DetailedHortonSphere({
  position,
  radius = 1.5,
  isLight,
  textures,
}: {
  position: [number, number, number];
  radius?: number;
  isLight: boolean;
  textures: ReturnType<typeof createProceduralTextures>;
}) {
  const legCount = 10;
  const legRadius = radius * 0.95;
  const legHeight = radius * 1.4;

  const legs = useMemo(() => {
    return Array.from({ length: legCount }, (_, i) => {
      const angle = (i / legCount) * Math.PI * 2;
      return {
        x: Math.cos(angle) * legRadius,
        z: Math.sin(angle) * legRadius,
        angle,
      };
    });
  }, [legCount, legRadius]);

  return (
    <group position={position}>
      {/* Heavy Octagonal Concrete Footing */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[radius * 1.5, radius * 1.6, 0.3, 8]} />
        <meshStandardMaterial color={isLight ? '#CBD5E1' : '#0F172A'} roughness={0.8} />
      </mesh>

      {/* Spherical Pressure Vessel with Plate Seams Texture */}
      <mesh position={[0, legHeight + radius * 0.6, 0]}>
        <sphereGeometry args={[radius, 40, 32]} />
        {textures?.sphere ? (
          <meshStandardMaterial
            map={textures.sphere}
            metalness={isLight ? 0.7 : 0.85}
            roughness={isLight ? 0.3 : 0.25}
          />
        ) : (
          <meshStandardMaterial color={isLight ? '#E2E8F0' : '#334155'} metalness={0.8} roughness={0.3} />
        )}
      </mesh>

      {/* Equator Catwalk Walkway with Guardrails */}
      <group position={[0, legHeight + radius * 0.6, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 0.99, radius * 1.35, 36]} />
          <meshStandardMaterial
            color={isLight ? '#94A3B8' : '#1E293B'}
            metalness={0.75}
            roughness={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[radius * 1.35, radius * 1.35, 0.4, 36, 1, true]} />
          <meshStandardMaterial color={isLight ? '#475569' : '#64748B'} wireframe />
        </mesh>
      </group>

      {/* Structural Steel Tubular Stilt Legs with Cross-Diagonal Bracing */}
      {legs.map((leg, i) => (
        <group key={i}>
          {/* Main Stilt */}
          <mesh position={[leg.x, legHeight / 2, leg.z]}>
            <cylinderGeometry args={[0.065, 0.08, legHeight, 12]} />
            <meshStandardMaterial color={isLight ? '#64748B' : '#1E293B'} metalness={0.8} roughness={0.4} />
          </mesh>
          {/* Foundation Anchor Shoes */}
          <mesh position={[leg.x, 0.25, leg.z]}>
            <boxGeometry args={[0.2, 0.15, 0.2]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </group>
      ))}

      {/* Top Inspection Hatch & Pressure Relief Valve Header */}
      <mesh position={[0, legHeight + radius * 1.62, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.9} />
      </mesh>
      <mesh position={[0.1, legHeight + radius * 1.75, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.25, 8]} />
        <meshStandardMaterial color="#EF4444" />
      </mesh>
    </group>
  );
}

// 5. Cylindrical Floating-Roof Crude Storage Tank with Hazard Base & Spiral Stairs
function DetailedCrudeStorageTank({
  position,
  radius = 2.2,
  height = 2.4,
  isLight,
  textures,
}: {
  position: [number, number, number];
  radius?: number;
  height?: number;
  isLight: boolean;
  textures: ReturnType<typeof createProceduralTextures>;
}) {
  return (
    <group position={position}>
      {/* Earthen Dike / Concrete Retention Wall */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[radius * 1.35, radius * 1.45, 0.3, 32]} />
        <meshStandardMaterial color={isLight ? '#CBD5E1' : '#0B0F19'} roughness={0.95} />
      </mesh>

      {/* High-Visibility Hazard Striped Tank Skirt */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[radius * 1.05, radius * 1.08, 0.25, 32]} />
        {textures?.hazard ? (
          <meshStandardMaterial map={textures.hazard} roughness={0.4} />
        ) : (
          <meshStandardMaterial color="#EAB308" />
        )}
      </mesh>

      {/* Main Steel Tank Shell with Welded Steel Plate Texture */}
      <mesh position={[0, height / 2 + 0.5, 0]}>
        <cylinderGeometry args={[radius, radius, height, 40]} />
        {textures?.metal ? (
          <meshStandardMaterial
            map={textures.metal}
            metalness={isLight ? 0.7 : 0.85}
            roughness={isLight ? 0.4 : 0.25}
          />
        ) : (
          <meshStandardMaterial color={isLight ? '#F1F5F9' : '#1E293B'} metalness={0.7} roughness={0.3} />
        )}
      </mesh>

      {/* Wind Girder Stiffener Rings around Perimeter */}
      {[0.5 + height * 0.4, 0.5 + height * 0.8].map((wy, wi) => (
        <mesh key={wi} position={[0, wy, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius, radius * 1.08, 40]} />
          <meshStandardMaterial color={isLight ? '#64748B' : '#334155'} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Top Floating Roof Deck with Rim Seal */}
      <mesh position={[0, height + 0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 0.98, 40]} />
        <meshStandardMaterial color={isLight ? '#94A3B8' : '#0F172A'} roughness={0.7} />
      </mesh>

      {/* Top Perimeter Guardrail */}
      <mesh position={[0, height + 0.7, 0]}>
        <cylinderGeometry args={[radius * 1.02, radius * 1.02, 0.4, 36, 1, true]} />
        <meshStandardMaterial color={isLight ? '#475569' : '#64748B'} wireframe />
      </mesh>

      {/* Exterior Spiral Stairway Simulation */}
      {Array.from({ length: 14 }, (_, si) => {
        const angle = (si / 14) * Math.PI * 1.4;
        const stepY = 0.5 + (height / 14) * si;
        const sx = Math.cos(angle) * (radius + 0.12);
        const sz = Math.sin(angle) * (radius + 0.12);
        return (
          <mesh key={si} position={[sx, stepY, sz]} rotation={[0, -angle, 0]}>
            <boxGeometry args={[0.3, 0.04, 0.18]} />
            <meshStandardMaterial color={isLight ? '#475569' : '#94A3B8'} metalness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

// 6. Detailed Multi-Level Pipe Rack Network with Color-Coded Lines & Valves
function DetailedPipeRackNetwork({
  isLight,
}: {
  isLight: boolean;
}) {
  const rackCount = 9;
  const rackSpacing = 2.4;

  const racks = useMemo(() => {
    return Array.from({ length: rackCount }, (_, i) => -9.6 + i * rackSpacing);
  }, [rackCount, rackSpacing]);

  return (
    <group position={[0, 0, -2.0]}>
      {/* Structural Steel I-Beam Portal Bents */}
      {racks.map((rx, idx) => (
        <group key={idx} position={[rx, 0, 0]}>
          {/* Vertical Columns */}
          <mesh position={[-1.2, 1.4, 0]}>
            <boxGeometry args={[0.1, 2.8, 0.1]} />
            <meshStandardMaterial color={isLight ? '#64748B' : '#1E293B'} metalness={0.75} roughness={0.3} />
          </mesh>
          <mesh position={[1.2, 1.4, 0]}>
            <boxGeometry args={[0.1, 2.8, 0.1]} />
            <meshStandardMaterial color={isLight ? '#64748B' : '#1E293B'} metalness={0.75} roughness={0.3} />
          </mesh>
          {/* Lower Cross Beam */}
          <mesh position={[0, 1.3, 0]}>
            <boxGeometry args={[2.5, 0.09, 0.09]} />
            <meshStandardMaterial color={isLight ? '#64748B' : '#1E293B'} metalness={0.75} roughness={0.3} />
          </mesh>
          {/* Upper Cross Beam */}
          <mesh position={[0, 2.5, 0]}>
            <boxGeometry args={[2.5, 0.09, 0.09]} />
            <meshStandardMaterial color={isLight ? '#64748B' : '#1E293B'} metalness={0.75} roughness={0.3} />
          </mesh>
          {/* Concrete Footing Pads */}
          <mesh position={[-1.2, 0.1, 0]}>
            <boxGeometry args={[0.3, 0.2, 0.3]} />
            <meshStandardMaterial color={isLight ? '#CBD5E1' : '#0B0F19'} roughness={0.9} />
          </mesh>
          <mesh position={[1.2, 0.1, 0]}>
            <boxGeometry args={[0.3, 0.2, 0.3]} />
            <meshStandardMaterial color={isLight ? '#CBD5E1' : '#0B0F19'} roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Multi-tier Continuous Process Pipelines with Flanges */}
      {/* Lower Level Pipelines */}
      {/* Crude Oil Line (Black / Slate) */}
      <mesh position={[0, 1.4, -0.8]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 22, 16]} />
        <meshStandardMaterial color={isLight ? '#334155' : '#0F172A'} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* High-Pressure Gas Line (Safety Yellow) */}
      <mesh position={[0, 1.4, -0.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 22, 16]} />
        <meshStandardMaterial color="#EAB308" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Refined Products Line (Teal / Cyan) */}
      <mesh position={[0, 1.4, 0.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 22, 16]} />
        <meshStandardMaterial color="#06B6D4" metalness={0.8} roughness={0.25} />
      </mesh>
      {/* Firewater / Cooling Water Return (Safety Red) */}
      <mesh position={[0, 1.4, 0.8]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 22, 16]} />
        <meshStandardMaterial color="#EF4444" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Upper Level High-Pressure Steam & Nitrogen Pipelines */}
      <mesh position={[0, 2.6, -0.6]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.13, 22, 16]} />
        <meshStandardMaterial color={isLight ? '#F8FAFC' : '#E2E8F0'} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.6, 0.1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 22, 16]} />
        <meshStandardMaterial color="#10B981" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, 2.6, 0.7]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 22, 16]} />
        <meshStandardMaterial color="#3B82F6" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Decorative Red Emergency Shutoff Valves with Handwheels */}
      {[-4.8, 0, 4.8].map((vx, vi) => (
        <group key={vi} position={[vx, 1.55, 0.3]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.1, 0.018, 8, 16]} />
            <meshStandardMaterial color="#EF4444" />
          </mesh>
          <mesh position={[0, -0.08, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// 7. Dynamic Industrial Flare Stack with Flickering Flame & Flame Point Light
function DetailedFlareStack({
  position,
  height = 9.5,
  isLight,
}: {
  position: [number, number, number];
  height?: number;
  isLight: boolean;
}) {
  const flameOuterRef = useRef<THREE.Mesh>(null);
  const flameInnerRef = useRef<THREE.Mesh>(null);
  const flameLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime * 9;
    const flicker = Math.sin(time) * 0.25 + Math.cos(time * 2.3) * 0.2 + 1.0;

    if (flameOuterRef.current) {
      flameOuterRef.current.scale.set(
        0.8 + Math.sin(time * 1.5) * 0.18,
        flicker * 1.2,
        0.8 + Math.cos(time * 1.8) * 0.18
      );
    }
    if (flameInnerRef.current) {
      flameInnerRef.current.scale.set(
        0.6 + Math.cos(time * 2.1) * 0.15,
        flicker * 1.35,
        0.6 + Math.sin(time * 2.4) * 0.15
      );
    }
    if (flameLightRef.current) {
      flameLightRef.current.intensity = (isLight ? 2.5 : 4.5) * flicker;
    }
  });

  return (
    <group position={position}>
      {/* Concrete Foundation */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[1.2, 1.4, 0.4, 8]} />
        <meshStandardMaterial color={isLight ? '#94A3B8' : '#0B0F19'} roughness={0.9} />
      </mesh>

      {/* Lattice Derrick Tower (Truss Structure) */}
      {Array.from({ length: 7 }, (_, ti) => {
        const segH = height / 7;
        const segY = 0.4 + segH * (ti + 0.5);
        const bRad = 0.9 - (ti / 7) * 0.45;
        return (
          <group key={ti} position={[0, segY, 0]}>
            <mesh>
              <cylinderGeometry args={[bRad * 0.85, bRad, segH, 4, 1, true]} />
              <meshStandardMaterial color={isLight ? '#475569' : '#1E293B'} wireframe />
            </mesh>
          </group>
        );
      })}

      {/* Central High-Pressure Flare Riser Pipe */}
      <mesh position={[0, height / 2 + 0.4, 0]}>
        <cylinderGeometry args={[0.16, 0.2, height, 16]} />
        <meshStandardMaterial color={isLight ? '#334155' : '#1E293B'} metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Flare Burner Tip & Wind Shield */}
      <mesh position={[0, height + 0.4, 0]}>
        <cylinderGeometry args={[0.3, 0.2, 0.6, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Animated Burning Flame - Outer Fiery Corona */}
      <mesh ref={flameOuterRef} position={[0, height + 1.2, 0]}>
        <coneGeometry args={[0.38, 1.4, 16]} />
        <meshBasicMaterial color="#FF5500" transparent opacity={0.85} />
      </mesh>

      {/* Animated Burning Flame - Inner Hot Yellow/White Core */}
      <mesh ref={flameInnerRef} position={[0, height + 1.15, 0]}>
        <coneGeometry args={[0.22, 1.2, 16]} />
        <meshBasicMaterial color="#FFDD44" transparent opacity={0.95} />
      </mesh>

      {/* Dynamic Flickering Firelight */}
      <pointLight
        ref={flameLightRef}
        position={[0, height + 1.5, 0]}
        color="#FFAA22"
        distance={24}
        decay={2}
      />
    </group>
  );
}

// 8. Ground Surface with Asphalt Roads, Concrete Slabs & Facility Worklights
function DetailedRefineryGround({
  isLight,
  textures,
}: {
  isLight: boolean;
  textures: ReturnType<typeof createProceduralTextures>;
}) {
  return (
    <group position={[0, 0, 0]}>
      {/* Textured Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -4]}>
        <planeGeometry args={[48, 36]} />
        {textures?.ground ? (
          <meshStandardMaterial
            map={textures.ground}
            roughness={0.88}
            metalness={0.1}
          />
        ) : (
          <meshStandardMaterial color={isLight ? '#CBD5E1' : '#070B14'} roughness={0.9} />
        )}
      </mesh>

      {/* High-Mast Yard Worklights illuminating the columns from ground level */}
      {[-6, 6].map((lx, li) => (
        <group key={li} position={[lx, 0, 1.2]}>
          {/* Light Mast Pole */}
          <mesh position={[0, 2.5, 0]}>
            <cylinderGeometry args={[0.05, 0.08, 5, 8]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
          {/* Floodlight Fixture */}
          <mesh position={[0, 5, 0]} rotation={[0.4, li === 0 ? 0.3 : -0.3, 0]}>
            <boxGeometry args={[0.4, 0.25, 0.2]} />
            <meshStandardMaterial color="#E2E8F0" />
          </mesh>
          {/* Ground Wash Warm Light */}
          <spotLight
            position={[0, 5, 0]}
            target-position={[lx * 0.5, 3, -3]}
            intensity={isLight ? 1.2 : 2.8}
            angle={0.7}
            penumbra={0.6}
            color={isLight ? '#FEF08A' : '#FDE047'}
            distance={20}
          />
        </group>
      ))}
    </group>
  );
}

// 9. Floating Steam / Atmospheric Vapor Billows
function AtmosphericSteam() {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const count = 120;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = 1.0 + Math.random() * 8.0;
      positions[i * 3 + 2] = -2.0 - Math.random() * 8.0;
    }
    return positions;
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length / 3; i++) {
        // Slowly rise upward
        positions[i * 3 + 1] += delta * 0.45;
        // Reset when exceeding height
        if (positions[i * 3 + 1] > 9.5) {
          positions[i * 3 + 1] = 1.0;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
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
        size={0.14}
        color="#FFFFFF"
        transparent
        opacity={0.25}
        sizeAttenuation
      />
    </points>
  );
}

// ==========================================
// MAIN REFINERY CANVAS SCENE
// ==========================================

export function OilRefineryScene() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const mousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Generate high-resolution procedural industrial textures once per theme
  const textures = useMemo(() => {
    return createProceduralTextures(isLight);
  }, [isLight]);

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
        camera={{ position: [0, 2.6, 10.2], fov: 48 }}
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

        {/* Dynamic Camera Rig following cursor */}
        <RefineryCameraRig mousePos={mousePos} />

        {/* Key & Fill Industrial Lighting */}
        <ambientLight intensity={isLight ? 0.95 : 0.45} />
        <directionalLight
          position={[14, 18, 12]}
          intensity={isLight ? 1.5 : 0.8}
          color={isLight ? '#FFFDF5' : '#93C5FD'}
          castShadow
        />
        <directionalLight
          position={[-12, 10, -6]}
          intensity={isLight ? 0.7 : 0.45}
          color={isLight ? '#93C5FD' : '#10B981'}
        />

        {/* Detailed Ground Pavement, Roadways & Facility Lights */}
        <DetailedRefineryGround isLight={isLight} textures={textures} />

        {/* Interconnected Pipe Racks with Multi-Color Lines */}
        <DetailedPipeRackNetwork isLight={isLight} />

        {/* Major Distillation Columns (Atmospheric & Vacuum Towers) */}
        <DetailedDistillationColumn
          position={[-3.8, 0, -3.2]}
          height={8.6}
          radius={0.68}
          platforms={6}
          isLight={isLight}
          textures={textures}
        />
        <DetailedDistillationColumn
          position={[-5.8, 0, -4.6]}
          height={6.6}
          radius={0.82}
          platforms={5}
          isLight={isLight}
          textures={textures}
        />
        <DetailedDistillationColumn
          position={[3.8, 0, -3.8]}
          height={7.8}
          radius={0.52}
          platforms={5}
          isLight={isLight}
          textures={textures}
        />
        <DetailedDistillationColumn
          position={[5.4, 0, -4.8]}
          height={6.0}
          radius={0.46}
          platforms={4}
          isLight={isLight}
          textures={textures}
        />

        {/* High-Pressure Spherical Gas Storage (Horton Spheres on Stilts) */}
        <DetailedHortonSphere
          position={[-2.2, 0, -5.8]}
          radius={1.5}
          isLight={isLight}
          textures={textures}
        />
        <DetailedHortonSphere
          position={[2.0, 0, -6.6]}
          radius={1.4}
          isLight={isLight}
          textures={textures}
        />

        {/* Crude Oil Bulk Floating-Roof Storage Tanks */}
        <DetailedCrudeStorageTank
          position={[-7.8, 0, -2.4]}
          radius={2.0}
          height={2.3}
          isLight={isLight}
          textures={textures}
        />
        <DetailedCrudeStorageTank
          position={[7.8, 0, -2.8]}
          radius={2.2}
          height={2.5}
          isLight={isLight}
          textures={textures}
        />

        {/* Twin Industrial Flare Stacks with Flickering Flame Corona */}
        <DetailedFlareStack position={[7.2, 0, -7.2]} height={9.4} isLight={isLight} />
        <DetailedFlareStack position={[-8.2, 0, -7.6]} height={8.6} isLight={isLight} />

        {/* Floating Atmospheric Steam / Vapor Particles */}
        <AtmosphericSteam />
      </Canvas>

      {/* Cinematic Vignette for card contrast */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-500"
        style={{
          background: isLight
            ? 'radial-gradient(ellipse at 50% 48%, transparent 38%, rgba(226, 232, 240, 0.72) 80%, #E2E8F0 100%)'
            : 'radial-gradient(ellipse at 50% 48%, transparent 32%, rgba(2, 4, 10, 0.75) 75%, #02040A 100%)',
        }}
      />
    </div>
  );
}

export default OilRefineryScene;
