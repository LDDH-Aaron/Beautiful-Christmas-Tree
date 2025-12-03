import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import SpiralLights from './SpiralLights';
import Snow from './Snow';
import { TreeColors } from '../types';

interface ExperienceProps {
  mixFactor: number;
  colors: TreeColors;
  inputRef: React.MutableRefObject<{ x: number, y: number }>;
  userImages?: string[];
}

// STATIC CONSTANTS FOR STABILITY
// Increased Red and Green variations, reduced Yellow/Gold frequency
const BALL_COLORS = [
    '#8B0000', // Dark Red
    '#D32F2F', // Bright Red
    '#1B5E20', // Dark Green
    '#2E7D32', // Forest Green
    '#D4AF37', // Gold (kept but diluted)
    '#C0C0C0', // Silver
    '#191970'  // Midnight Blue
]; 

const BOX_COLORS = [
    '#800000', // Maroon
    '#C62828', // Red
    '#1B5E20', // Dark Green
    '#43A047', // Green
    '#D4AF37'  // Gold
];

const STAR_COLORS = ['#D4AF37', '#E5E4E2'];
const CRYSTAL_COLORS = ['#F0F8FF', '#E0FFFF']; 
const CANDY_COLORS = ['#FF0000', '#FFFFFF'];

// Handles Camera Parallax and Tree Rotation Physics
const SceneController: React.FC<{ inputRef: React.MutableRefObject<{ x: number, y: number }>, groupRef: React.RefObject<THREE.Group> }> = ({ inputRef, groupRef }) => {
    const { camera } = useThree();
    const vec = new THREE.Vector3();
    
    // Physics State
    const currentInput = useRef({ x: 0, y: 0 }); 
    const velocity = useRef(0);
    const lastX = useRef(0);

    useFrame((state, delta) => {
        const safeDelta = Math.min(delta, 0.1);

        // 1. Smooth Input Interpolation
        const targetX = inputRef.current.x;
        const targetY = inputRef.current.y;
        
        const inputSmoothing = 3.0 * safeDelta;
        currentInput.current.x = THREE.MathUtils.lerp(currentInput.current.x, targetX, inputSmoothing);
        currentInput.current.y = THREE.MathUtils.lerp(currentInput.current.y, targetY, inputSmoothing);

        // 2. Camera Parallax
        // REDUCED RANGE: Reduced X range from 6 to 4 to minimize "dizzy" background movement
        const camX = currentInput.current.x * 4; 
        const camY = currentInput.current.y * 2; 
        const camZ = 32 + Math.abs(currentInput.current.x) * 2; 
        
        camera.position.lerp(vec.set(camX, camY, camZ), 2.0 * safeDelta);
        camera.lookAt(0, 0, 0);

        // 3. Tree Momentum Physics
        // Only applies to the groupRef, which creates the "spinning inertia"
        if (groupRef.current) {
            const deltaX = currentInput.current.x - lastX.current;
            lastX.current = currentInput.current.x;
            velocity.current += deltaX * 0.5;
            velocity.current *= 0.95; 
            groupRef.current.rotation.y += 0.002 + velocity.current;
        }
    });
    
    return null;
};

const SceneContent: React.FC<ExperienceProps> = ({ mixFactor, colors, inputRef, userImages }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Dynamic Photo Count Logic:
  // If images exist, use their count (up to max, which is handled by App slice).
  // If no images, default to 10 "blank" frames.
  const photoCount = (userImages && userImages.length > 0) ? userImages.length : 10;

  return (
    <>
      <SceneController inputRef={inputRef} groupRef={groupRef} />
      
      <ambientLight intensity={0.2} />
      <spotLight position={[20, 20, 20]} angle={0.3} penumbra={1} intensity={1.5} color="#ffeebb" castShadow />
      <pointLight position={[-10, 5, -10]} intensity={0.8} color="#00ff00" />
      <pointLight position={[10, -5, 10]} intensity={0.8} color="#ff0000" />
      
      {/* Luxury Environment */}
      <Environment preset="city" background={false} />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

      {/* GLOBAL SNOW EFFECT - PLACED OUTSIDE THE ROTATING GROUP */}
      {/* This ensures snow does not rotate with the tree */}
      <Snow mixFactor={mixFactor} />

      {/* ROTATING TREE GROUP */}
      <group ref={groupRef} position={[0, 0, 0]}>
        
        {/* Dense Foliage */}
        <Foliage mixFactor={mixFactor} colors={colors} />
        
        {/* Spiral Light Strip */}
        <SpiralLights mixFactor={mixFactor} />
        
        {/* Ornaments */}
        <Ornaments 
            mixFactor={mixFactor} 
            type="BALL" 
            count={60} 
            scale={0.5}
            colors={BALL_COLORS} 
        />
        <Ornaments 
            mixFactor={mixFactor} 
            type="BOX" 
            count={30} 
            scale={0.6}
            colors={BOX_COLORS} 
        />
        <Ornaments 
            mixFactor={mixFactor} 
            type="STAR" 
            count={40} 
            scale={0.5}
            colors={STAR_COLORS} 
        />
        <Ornaments 
            mixFactor={mixFactor} 
            type="CRYSTAL" 
            count={50} 
            scale={0.3}
            colors={CRYSTAL_COLORS} 
        />
        <Ornaments 
            mixFactor={mixFactor} 
            type="CANDY" 
            count={40} 
            scale={0.4}
            colors={CANDY_COLORS} 
        />
        <Ornaments 
            mixFactor={mixFactor} 
            type="PHOTO" 
            count={photoCount} 
            userImages={userImages}
        />
      </group>

      {/* Post Processing */}
      <EffectComposer enableNormalPass={false}>
        <Bloom 
            luminanceThreshold={0.9} 
            mipmapBlur 
            intensity={1.2} 
            radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};

const Experience: React.FC<ExperienceProps> = (props) => {
  return (
    <Canvas
      dpr={[1, 1.5]} 
      camera={{ position: [0, 0, 32], fov: 45 }}
      gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
      shadows
    >
      <SceneContent {...props} />
    </Canvas>
  );
};

export default Experience;