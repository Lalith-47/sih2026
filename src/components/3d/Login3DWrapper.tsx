import React from 'react';
import dynamic from 'next/dynamic';

const DynamicDigitalTwin3D = dynamic(
  () => import('./QuantumDigitalTwinScene').then((mod) => mod.QuantumDigitalTwinScene),
  {
    ssr: false,
    loading: () => (
      <div 
        aria-hidden="true" 
        className="absolute inset-0 bg-[#030712] pointer-events-none"
      />
    ),
  }
);

const DynamicRefinery3D = dynamic(
  () => import('./OilRefineryScene').then((mod) => mod.OilRefineryScene),
  {
    ssr: false,
    loading: () => (
      <div 
        aria-hidden="true" 
        className="absolute inset-0 bg-[#03060E] pointer-events-none"
      />
    ),
  }
);

interface Login3DWrapperProps {
  sceneMode?: 'digital-twin' | 'refinery';
}

export default function Login3DWrapper({ sceneMode = 'digital-twin' }: Login3DWrapperProps) {
  if (sceneMode === 'refinery') {
    return <DynamicRefinery3D />;
  }
  return <DynamicDigitalTwin3D />;
}
