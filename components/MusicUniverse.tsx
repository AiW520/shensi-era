"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function StarRiver() {
  const riverRef = useRef<THREE.Points>(null);
  const dustRef = useRef<THREE.Points>(null);
  const stars = useMemo(() => {
    const values = new Float32Array(1500 * 3);
    for (let index = 0; index < 1500; index += 1) {
      const radius = 3.5 + Math.random() * 18;
      const angle = Math.random() * Math.PI * 2;
      values[index * 3] = Math.cos(angle) * radius;
      values[index * 3 + 1] = (Math.random() - 0.5) * (1.2 + radius * 0.22);
      values[index * 3 + 2] = Math.sin(angle) * radius;
    }
    return values;
  }, []);
  const dust = useMemo(() => {
    const values = new Float32Array(420 * 3);
    for (let index = 0; index < 420; index += 1) {
      values[index * 3] = (Math.random() - 0.5) * 28;
      values[index * 3 + 1] = (Math.random() - 0.5) * 12;
      values[index * 3 + 2] = -4 - Math.random() * 18;
    }
    return values;
  }, []);

  useFrame((state, delta) => {
    if (riverRef.current) {
      riverRef.current.rotation.y += delta * 0.008;
      riverRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.08) * 0.04;
    }
    if (dustRef.current) dustRef.current.rotation.y -= delta * 0.004;
  });

  return <>
    <points ref={riverRef} rotation={[0.22, 0, -0.08]}><bufferGeometry><bufferAttribute attach="attributes-position" args={[stars, 3]} /></bufferGeometry><pointsMaterial color="#c6e5d8" size={0.035} transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} /></points>
    <points ref={dustRef}><bufferGeometry><bufferAttribute attach="attributes-position" args={[dust, 3]} /></bufferGeometry><pointsMaterial color="#d6b66e" size={0.018} transparent opacity={0.5} depthWrite={false} /></points>
  </>;
}

function CelestialCore() {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (!groupRef.current || !innerRef.current) return;
    groupRef.current.rotation.y += delta * 0.055;
    innerRef.current.rotation.x -= delta * 0.09;
    innerRef.current.rotation.z += delta * 0.06;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.42) * 0.12;
  });
  return <group ref={groupRef} position={[2.8, 0, 0]} rotation={[0.22, 0, 0.1]}>
    <mesh ref={innerRef}><icosahedronGeometry args={[0.72, 2]} /><meshPhysicalMaterial color="#14332d" emissive="#4b9880" emissiveIntensity={1.6} metalness={0.35} roughness={0.2} wireframe /></mesh>
    {[1.45, 2.1, 2.8].map((radius, index) => <mesh key={radius} rotation={[Math.PI / 2 + index * 0.48, index * 0.42, index * 0.68]}><torusGeometry args={[radius, index === 0 ? 0.022 : 0.012, 8, 160]} /><meshBasicMaterial color={index === 1 ? "#b38a4a" : "#80b7a2"} transparent opacity={0.65 - index * 0.13} /></mesh>)}
    <pointLight color="#75c2a7" intensity={18} distance={9} decay={2} />
  </group>;
}

function CameraDrift() {
  const { camera, pointer } = useThree();
  useFrame((_, delta) => {
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.35, 2.1, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, pointer.y * 0.2, 2.1, delta);
    camera.lookAt(0.9, 0, 0);
  });
  return null;
}

export default function MusicUniverse() {
  return <div className="cosmos-canvas" aria-hidden="true"><Canvas dpr={[1, 1.4]} camera={{ position: [0, 0.2, 10], fov: 44 }} gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}>
    <fog attach="fog" args={["#050b0d", 9, 28]} /><ambientLight intensity={0.35} /><directionalLight position={[5, 4, 6]} color="#e8d7a2" intensity={1.4} />
    <StarRiver /><CelestialCore /><CameraDrift />
  </Canvas></div>;
}
