import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';

function ChakraModel({ rotating }) {
  const groupRef = useRef();
  
  // Custom rotation logic that smoothly slows down based on `rotating`
  const targetSpeed = useRef(0.005);
  const currentSpeed = useRef(0.005);
  
  useEffect(() => {
    targetSpeed.current = rotating ? 0.005 : 0;
  }, [rotating]);

  useFrame(() => {
    if (groupRef.current) {
      currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, targetSpeed.current, 0.02);
      groupRef.current.rotation.z -= currentSpeed.current;
    }
  });

  // Material: frosted glass / translucent navy-white with subtle glow
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#E8EEF7',
    metalness: 0.2,
    roughness: 0.1,
    transmission: 0.9,
    thickness: 1.5,
    ior: 1.5,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    emissive: '#1B3A6B',
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.8
  }), []);

  const rimMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    metalness: 0.5,
    roughness: 0.05,
    transmission: 0.8,
    ior: 1.5,
    emissive: '#2A5298',
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.9
  }), []);

  const spokes = Array.from({ length: 24 }).map((_, i) => {
    const angle = (i * 15 * Math.PI) / 180;
    return (
      <mesh
        key={i}
        position={[Math.cos(angle) * 3, Math.sin(angle) * 3, 0]}
        rotation={[0, 0, angle]}
      >
        <cylinderGeometry args={[0.08, 0.05, 6, 8]} />
        <meshPhysicalMaterial {...material} />
      </mesh>
    );
  });

  return (
    <group ref={groupRef} rotation={[0.2, -0.3, 0]}>
      {/* Outer Rim */}
      <mesh>
        <torusGeometry args={[6, 0.2, 16, 64]} />
        <meshPhysicalMaterial {...rimMaterial} />
      </mesh>
      
      {/* Inner Hub */}
      <mesh>
        <cylinderGeometry args={[0.6, 0.6, 0.4, 32]} rotation={[Math.PI / 2, 0, 0]} />
        <meshPhysicalMaterial {...material} emissiveIntensity={0.6} />
      </mesh>
      
      {/* Spokes */}
      {spokes}
    </group>
  );
}

export default function Chakra3D({ className, style }) {
  const [rotating, setRotating] = React.useState(true);

  React.useEffect(() => {
    const handleScroll = () => {
      // If we scroll down past 100px, slow rotation
      if (window.scrollY > 100) {
        setRotating(false);
      } else {
        setRotating(true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={className} style={{ ...style, pointerEvents: 'none', position: 'absolute' }}>
      <Canvas>
        <OrthographicCamera makeDefault position={[0, 0, 20]} zoom={35} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -10, -5]} intensity={1} color="#E8872A" />
        
        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.5}>
          <ChakraModel rotating={rotating} />
        </Float>
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
