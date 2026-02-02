import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateSpiralData, lerp } from '../utils/math';

interface SpiralLightsProps {
  mixFactor: number;
}

const SpiralLights: React.FC<SpiralLightsProps> = ({ mixFactor }) => {
  const count = 420;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const currentMixRef = useRef(1);

  // Generate spiral positions
  const { target, chaos } = useMemo(() => generateSpiralData(count, 19, 7.5, 9), []);

  useLayoutEffect(() => {
     if (!meshRef.current) return;
     const palette = [
       new THREE.Color('#fffae0'), // Warm white
       new THREE.Color('#ffd1f5'), // soft pink
       new THREE.Color('#a0f7ff'), // cyan
       new THREE.Color('#fff3b0')  // pale yellow
     ];

     for(let i=0; i<count; i++) {
       const color = palette[i % palette.length];
       meshRef.current.setColorAt(i, color);

       dummy.position.set(target[i*3], target[i*3+1], target[i*3+2]);
       dummy.scale.setScalar(0.12);
       dummy.updateMatrix();
       meshRef.current.setMatrixAt(i, dummy.matrix);
     }
     
     if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
     meshRef.current.instanceMatrix.needsUpdate = true;
  }, [target, dummy]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const speed = 2.0 * delta;
    currentMixRef.current = lerp(currentMixRef.current, mixFactor, speed);
    const t = currentMixRef.current;
    
    // Animate glow/brightness via scale pulse
    const time = state.clock.elapsedTime;
    
    for(let i=0; i<count; i++) {
      const tx = target[i*3];
      const ty = target[i*3+1];
      const tz = target[i*3+2];
      
      const cx = chaos[i*3];
      const cy = chaos[i*3+1];
      const cz = chaos[i*3+2];

      const x = lerp(cx, tx, t);
      const y = lerp(cy, ty, t);
      const z = lerp(cz, tz, t);

      dummy.position.set(x, y, z);
      
      // Pulse effect
      const pulse = Math.sin(time * 3 + i * 0.1) * 0.05 + 0.15;
      dummy.scale.setScalar(pulse);

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshBasicMaterial toneMapped={false} transparent={true} opacity={0.95} />
    </instancedMesh>
  );
};

export default SpiralLights;