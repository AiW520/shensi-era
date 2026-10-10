"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as THREE from "three";
import { NODES, terrainHeight } from "./shanhai-data";
import type { CameraCommand } from "./ShanhaiExplorer";

type SceneProps = {
  selectedId: string;
  onSelect: (id: string) => void;
  lowPower: boolean;
  playing: boolean;
  visible: boolean;
  reducedMotion: boolean;
  touchCamera: boolean;
  command: CameraCommand;
  onFailure: () => void;
};

function Terrain({ lowPower }: { lowPower: boolean }) {
  const geometry = useMemo(() => {
    const surface = new THREE.PlaneGeometry(13, 11, lowPower ? 44 : 80, lowPower ? 36 : 68);
    surface.rotateX(-Math.PI / 2);
    const points = surface.attributes.position;
    const colors = new Float32Array(points.count * 3);
    const color = new THREE.Color();
    for (let index = 0; index < points.count; index++) {
      const x = points.getX(index), z = points.getZ(index);
      const height = terrainHeight(x, z);
      points.setY(index, height);
      color.set(height > 1.2 ? "#d6cda5" : height > 0.45 ? "#83a887" : height > 0.12 ? "#528674" : "#356e69");
      color.multiplyScalar(0.87 + Math.sin(x * 17 + z * 9) * 0.12);
      color.toArray(colors, index * 3);
    }
    surface.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    surface.computeVertexNormals();
    return surface;
  }, [lowPower]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry}><meshStandardMaterial vertexColors flatShading roughness={0.95} metalness={0.05} /></mesh>;
}

function Sea({ playing }: { playing: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ time: { value: 0 } }), []);
  useFrame((_, delta) => { if (playing && material.current) material.current.uniforms.time.value += Math.min(delta, 0.05); });
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
    <planeGeometry args={[80, 80, 1, 1]} />
    <shaderMaterial ref={material} uniforms={uniforms} vertexShader={`varying vec2 p; void main() { p = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`} fragmentShader={`uniform float time; varying vec2 p; void main() { float wave = sin(p.y*4.0+sin(p.x*.9+time*.12)*.8+time*.45); float line = smoothstep(.97,1.0,wave); float fade = 1.0-smoothstep(7.0,30.0,length(p)); vec3 color = mix(vec3(.27,.43,.46),vec3(.13,.36,.39),fade); gl_FragColor = vec4(color+vec3(.14,.2,.18)*line*fade*.25,1.0); }`} />
  </mesh>;
}

function Pagoda({ scale = 1, color = "#d4a967" }: { scale?: number; color?: string }) {
  return <group scale={scale}>
    <mesh position={[0, 0.07, 0]}><cylinderGeometry args={[0.55, 0.68, 0.14, 8]} /><meshStandardMaterial color="#64776c" roughness={0.9} /></mesh>
    {[0, 1, 2].map((level) => <group key={level} position={[0, 0.17 + level * 0.36, 0]} scale={1 - level * 0.16}>
      <mesh position={[0, 0.1, 0]}><boxGeometry args={[0.52, 0.26, 0.52]} /><meshStandardMaterial color="#5c352d" roughness={0.7} /></mesh>
      {[-1, 1].flatMap((x) => [-1, 1].map((z) => <mesh key={`${x}-${z}`} position={[x * 0.26, 0.1, z * 0.26]}><cylinderGeometry args={[0.028, 0.028, 0.28, 6]} /><meshStandardMaterial color={color} /></mesh>))}
      <Roof />
      {[-1, 1].flatMap((x) => [-1, 1].map((z) => <mesh key={`bell-${x}-${z}`} position={[x * 0.41, 0.2, z * 0.41]}><sphereGeometry args={[0.025, 6, 6]} /><meshStandardMaterial color="#dbc38a" metalness={0.6} roughness={0.4} /></mesh>))}
    </group>)}
    <mesh position={[0, 1.36, 0]}><sphereGeometry args={[0.045, 8, 8]} /><meshBasicMaterial color={color} /></mesh>
  </group>;
}

function Roof() {
  const geometry = useMemo(() => {
    const points: number[] = [], triangles: number[] = [];
    for (let side = 0; side < 4; side++) {
      const angle = side * Math.PI / 2;
      for (let row = 0; row <= 5; row++) {
        const t = row / 5, width = .07 + t * .52;
        for (let col = 0; col <= 8; col++) {
          const x = (col / 8 * 2 - 1) * width, z = .04 + t * .51;
          const y = .59 - t * .29 + t ** 5 * .08 + Math.abs(x / width) ** 4 * t * .06;
          points.push(x * Math.cos(angle) - z * Math.sin(angle), y, x * Math.sin(angle) + z * Math.cos(angle));
          if (row < 5 && col < 8) { const a = side * 54 + row * 9 + col; triangles.push(a, a + 9, a + 1, a + 1, a + 9, a + 10); }
        }
      }
    }
    const roof = new THREE.BufferGeometry(); roof.setAttribute("position", new THREE.Float32BufferAttribute(points, 3)); roof.setIndex(triangles); roof.computeVertexNormals(); return roof;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry}><meshStandardMaterial color="#38565f" metalness={0.25} roughness={0.65} side={THREE.DoubleSide} /></mesh>;
}

function Ridges() {
  const geometry = useMemo(() => {
    const ridge = new THREE.PlaneGeometry(34, 10, 70, 20); ridge.rotateX(-Math.PI / 2);
    const points = ridge.attributes.position;
    for (let index = 0; index < points.count; index++) {
      const x = points.getX(index), z = points.getZ(index);
      const ridgeLine = 2.1 + Math.sin(x * .43) * 1.1 + Math.sin(x * 1.17 + .4) * .62 + Math.cos(x * 2.3) * .3;
      const taper = Math.max(0, 1 - Math.abs(z) / 5);
      points.setY(index, Math.max(-.2, ridgeLine * taper + Math.sin(z * 2 + x) * .17));
    }
    ridge.computeVertexNormals(); return ridge;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <>{[0, 1, 2].map((layer) => <mesh key={layer} geometry={geometry} position={[layer * 3 - 3, -.06, -12 - layer * 6]} scale={[1 + layer * .25, .7 + layer * .3, 1]} rotation={[0, layer * .13, 0]}><meshBasicMaterial color={["#55777e", "#74949c", "#a0b6b8"][layer]} /></mesh>)}</>;
}

function CloudBands({ playing }: { playing: boolean }) {
  const group = useRef<THREE.Group>(null);
  const time = useRef(0);
  useFrame((_, delta) => { if (playing && group.current) { time.current += Math.min(delta,.05); group.current.position.x = Math.sin(time.current * .05) * .6; } });
  return <group ref={group}>{[-1, 0, 1].map((index) => <mesh key={index} position={[index * 6, 3.3 + index * .8, -6 - index * 2]} scale={[4.2, .11, .7]}><sphereGeometry args={[1, 18, 8]} /><meshStandardMaterial color="#e0e7e3" transparent opacity={.2} roughness={1} depthWrite={false} /></mesh>)}</group>;
}

function Bridge() {
  return <group position={[1.7, .43, -.8]} rotation={[0, .42, 0]}>
    {Array.from({ length: 15 }, (_, index) => {
      const t = (index / 14 - .5) * 2, y = .26 * (1 - t * t);
      return <group key={index} position={[t * 1.7, y, 0]}>
        <mesh><boxGeometry args={[.23, .08, .52]} /><meshStandardMaterial color="#b7a880" roughness={.9} /></mesh>
        {index % 2 === 0 && [-1, 1].map((side) => <mesh key={side} position={[0, .17, side * .26]}><boxGeometry args={[.035,.36,.035]} /><meshStandardMaterial color="#dcc898" /></mesh>)}
      </group>;
    })}
    {[-1, 1].map((side) => <mesh key={side} position={[0, .3, side * .26]}><boxGeometry args={[3.5,.035,.035]} /><meshStandardMaterial color="#bca27a" /></mesh>)}
  </group>;
}

function Landmarks({ playing }: { playing: boolean }) {
  const armillary = useRef<THREE.Group>(null);
  const island = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!playing) return;
    if (armillary.current) armillary.current.rotation.y += Math.min(delta, 0.05) * 0.17;
    if (island.current) island.current.rotation.y += Math.min(delta, 0.05) * 0.018;
  });
  return <>
    <Ridges /><CloudBands playing={playing} /><Bridge />
    {Array.from({ length: 7 }, (_, index) => <mesh key={`step-${index}`} position={[0, 0.72 + index * 0.135, 1.25 - index * 0.09]}><boxGeometry args={[0.42, 0.13, 0.18]} /><meshStandardMaterial color="#a19a7e" roughness={0.95} /></mesh>)}
    <group position={[0, 1.65, 0]}>
      {[0, 1, 2].map((index) => <mesh key={index} position={[0, index * 0.13, 0]}><cylinderGeometry args={[0.93 - index * 0.2, 1.05 - index * 0.2, 0.13, 8]} /><meshStandardMaterial color={index === 2 ? "#b5a07c" : "#667767"} roughness={0.8} /></mesh>)}
      <group position={[0, 0.39, 0]}><Pagoda scale={0.95} /></group>
      {Array.from({ length: 8 }, (_, index) => <mesh key={index} position={[Math.cos(index * Math.PI / 4) * 0.95, 0.25, Math.sin(index * Math.PI / 4) * 0.95]}><cylinderGeometry args={[0.04, 0.06, 0.45, 6]} /><meshStandardMaterial color="#b3a27d" /></mesh>)}
    </group>
    <group ref={island} position={[-3.8, 1.25, 1.6]}>
      <mesh position={[0, -0.16, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.95, 0.95, 7]} /><meshStandardMaterial color="#496457" flatShading /></mesh>
      <mesh position={[0, 0.27, 0]}><cylinderGeometry args={[0.85, 0.95, 0.12, 7]} /><meshStandardMaterial color="#779579" /></mesh>
      <group position={[0.1, 0.32, 0]}><Pagoda scale={0.6} color="#95d8b5" /></group>
      {[-0.5, 0.6].map((x) => <Tree key={x} position={[x, 0.32, 0.35]} />)}
    </group>
    <group position={[3.6, 0.9, -1.6]}>
      <mesh position={[0, 0.52, 0]}><cylinderGeometry args={[0.16, 0.44, 1.05, 8]} /><meshStandardMaterial color="#afa69a" flatShading /></mesh>
      <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.72, 0.82, 0.2, 8]} /><meshStandardMaterial color="#655c6f" /></mesh>
      <group ref={armillary} position={[0, 1.3, 0]}>
        {[0, 1, 2].map((index) => <mesh key={index} rotation={[index * 0.8, index * 0.7, index * 0.6]}><torusGeometry args={[0.55, 0.023, 6, 48]} /><meshStandardMaterial color={index === 0 ? "#d6b275" : "#ae8cbf"} metalness={0.65} roughness={0.3} /></mesh>)}
        <mesh><octahedronGeometry args={[0.16]} /><meshStandardMaterial color="#c5a0df" emissive="#9972bc" emissiveIntensity={1.4} /></mesh>
      </group>
    </group>
    <group position={[1.8, 0.06, 3.8]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[0.9, 0.15, 6, 24]} /><meshStandardMaterial color="#506b76" metalness={0.3} roughness={0.7} /></mesh>
      {Array.from({ length: 7 }, (_, index) => <mesh key={index} position={[Math.cos(index * Math.PI * 2 / 7) * 0.9, 0.3, Math.sin(index * Math.PI * 2 / 7) * 0.9]} rotation={[0.12 * index, index, 0.08]}><boxGeometry args={[0.13, index % 2 ? 0.62 : 0.9, 0.16]} /><meshStandardMaterial color="#8aa7ad" /></mesh>)}
      <mesh position={[0, 0.12, 0]}><octahedronGeometry args={[0.22]} /><meshStandardMaterial color="#81bbd6" emissive="#367b99" emissiveIntensity={1.5} /></mesh>
    </group>
    {Array.from({ length: 17 }, (_, index) => {
      const x = Math.sin(index * 4.1) * 4.1, z = Math.cos(index * 2.7) * 2.8;
      const height = terrainHeight(x, z);
      return height > 0.23 && height < 1.25 ? <Tree key={index} position={[x, height, z]} /> : null;
    })}
  </>;
}

function Tree({ position }: { position: [number, number, number] }) {
  return <group position={position}>
    <mesh position={[0, 0.16, 0]}><cylinderGeometry args={[0.026, 0.04, 0.35, 5]} /><meshStandardMaterial color="#766651" /></mesh>
    {[0, 1].map((level) => <mesh key={level} position={[0, 0.3 + level * 0.14, 0]}><coneGeometry args={[0.18 - level * 0.04, 0.28, 6]} /><meshStandardMaterial color={level ? "#609575" : "#395f47"} flatShading /></mesh>)}
  </group>;
}

function SkyVessel({ playing }: { playing: boolean }) {
  const vessel = useRef<THREE.Group>(null);
  const time = useRef(0);
  useFrame((_, delta) => {
    if (!playing || !vessel.current) return;
    time.current += Math.min(delta, 0.05) * 0.13;
    const t = time.current;
    vessel.current.position.set(Math.cos(t) * 4.9, 2.8 + Math.sin(t * 2) * 0.22, Math.sin(t) * 3.9);
    vessel.current.rotation.y = -t;
  });
  return <group ref={vessel} position={[4.9, 2.8, 0]} scale={0.65}>
    <mesh scale={[1.1, 0.28, 0.35]}><sphereGeometry args={[0.6, 12, 8]} /><meshStandardMaterial color="#b69565" metalness={0.45} roughness={0.5} /></mesh>
    <mesh position={[0, 0.37, 0]}><cylinderGeometry args={[0.018, 0.018, 0.7, 5]} /><meshStandardMaterial color="#e1cf9c" /></mesh>
    <mesh position={[0.1, 0.43, 0]} rotation={[0, 0, -0.18]}><boxGeometry args={[0.4, 0.45, 0.02]} /><meshStandardMaterial color="#e0d7be" roughness={1} side={THREE.DoubleSide} /></mesh>
    <mesh position={[-0.55, 0.02, 0]}><sphereGeometry args={[0.05, 8, 6]} /><meshBasicMaterial color="#c2e9d5" /></mesh>
  </group>;
}

function Markers({ selectedId, onSelect }: Pick<SceneProps, "selectedId" | "onSelect">) {
  return <>{NODES.map((node) => {
    const selected = selectedId === node.id;
    const y = node.id === "kunlun" ? 3.35 : node.id === "penglai" ? 2.65 : node.id === "tianwen" ? 2.95 : 1.35;
    return <group key={node.id} position={[node.position[0], y, node.position[2]]} onClick={(event) => { if (event.delta < 6) { event.stopPropagation(); onSelect(node.id); } }}>
      <mesh><octahedronGeometry args={[selected ? 0.17 : 0.12]} /><meshBasicMaterial color={node.color} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[selected ? 0.3 : 0.2, selected ? 0.025 : 0.014, 6, 32]} /><meshBasicMaterial color={node.color} transparent opacity={selected ? 1 : 0.45} /></mesh>
      <mesh visible={false}><sphereGeometry args={[0.45, 8, 6]} /><meshBasicMaterial /></mesh>
      <mesh position={[0, -0.32, 0]}><cylinderGeometry args={[0.006, 0.006, 0.6, 4]} /><meshBasicMaterial color={node.color} transparent opacity={0.45} /></mesh>
    </group>;
  })}</>;
}

function CameraRig({ selectedId, command, playing, touchCamera, onFailure }: Pick<SceneProps, "selectedId" | "command" | "playing" | "touchCamera" | "onFailure">) {
  const { camera, gl, invalidate, size } = useThree();
  const controls = useRef<OrbitControls | null>(null);
  const lastTarget = useRef(new THREE.Vector3(0, .9, 0));
  const interacting = useRef(false);
  const lastCommand = useRef(-1);

  useEffect(() => {
    const orbit = new OrbitControls(camera, gl.domElement);
    orbit.target.copy(lastTarget.current);
    orbit.enablePan = false;
    orbit.enableDamping = false;
    orbit.minDistance = 7;
    orbit.maxDistance = 30;
    orbit.minPolarAngle = Math.PI / 6;
    orbit.maxPolarAngle = Math.PI / 2.35;
    orbit.rotateSpeed = 0.55;
    orbit.zoomSpeed = 0.65;
    const mobile = window.matchMedia("(pointer: coarse)").matches || size.width < 600;
    orbit.enableRotate = !mobile || touchCamera;
    orbit.enableZoom = !mobile || touchCamera;
    gl.domElement.style.touchAction = mobile && !touchCamera ? "pan-y" : "none";
    const change = () => { lastTarget.current.copy(orbit.target); invalidate(); };
    const start = () => { interacting.current = true; };
    const end = () => { interacting.current = false; };
    const lost = (event: Event) => { event.preventDefault(); onFailure(); };
    orbit.addEventListener("change", change);
    orbit.addEventListener("start", start);
    orbit.addEventListener("end", end);
    gl.domElement.addEventListener("webglcontextlost", lost);
    controls.current = orbit;
    return () => { lastTarget.current.copy(orbit.target); orbit.dispose(); controls.current = null; gl.domElement.removeEventListener("webglcontextlost", lost); };
  }, [camera, gl, invalidate, onFailure, touchCamera, size.width]);

  useEffect(() => {
    const orbit = controls.current;
    if (!orbit) return;
    const node = NODES.find((item) => item.id === selectedId)!;
    const target = new THREE.Vector3(node.position[0] * 0.45, 0.8, node.position[2] * 0.45);
    const delta = target.clone().sub(orbit.target);
    camera.position.add(delta);
    orbit.target.copy(target);
    orbit.update();
    invalidate();
  }, [selectedId, camera, invalidate]);

  useEffect(() => {
    const orbit = controls.current;
    if (!orbit) return;
    const mobile = size.width < 600;
    const reset = command.action === "reset" || lastCommand.current === -1;
    if (reset) {
      orbit.target.set(0, 0.9, 0);
      camera.position.set(mobile ? 9 : 6, mobile ? 7.6 : 5.5, mobile ? 11.5 : 8);
    } else if (command.sequence !== lastCommand.current) {
      const offset = camera.position.clone().sub(orbit.target);
      if (command.action === "in" || command.action === "out") {
        offset.multiplyScalar(command.action === "in" ? 0.8 : 1.25);
        offset.setLength(THREE.MathUtils.clamp(offset.length(), 7, 30));
      } else offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), command.action === "left" ? -0.3 : 0.3);
      camera.position.copy(orbit.target).add(offset);
    }
    lastCommand.current = command.sequence;
    orbit.update();
    invalidate();
  }, [command, size.width, size.height, camera, invalidate]);

  useFrame((_, delta) => {
    const orbit = controls.current;
    if (!orbit || !playing || interacting.current) return;
    const offset = camera.position.clone().sub(orbit.target).applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.min(delta, 0.05) * 0.035);
    camera.position.copy(orbit.target).add(offset);
    orbit.update();
  });
  return null;
}

export default function ShanhaiScene(props: SceneProps) {
  return <Canvas className="shanhai-canvas" aria-label="可环绕的山海地形与四处文明遗迹" frameloop={props.playing ? "always" : "demand"} dpr={props.lowPower ? 1 : [1, 1.5]} camera={{ position: [10, 8, 12], fov: 45, near: 0.1, far: 100 }} gl={{ alpha: false, antialias: !props.lowPower, powerPreference: props.lowPower ? "low-power" : "default" }}>
    <color attach="background" args={["#789da0"]} /><fog attach="fog" args={["#789da0", 23, 52]} />
    <ambientLight intensity={1.45} /><hemisphereLight args={["#e7f4ef", "#5b8c84", 1.6]} /><directionalLight position={[-4, 8, 5]} color="#fff0cc" intensity={3.5} />
    <directionalLight position={[7, 5, -5]} color="#a7d7ec" intensity={1.3} />
    <Terrain lowPower={props.lowPower} /><Sea playing={props.playing} /><Landmarks playing={props.playing} /><SkyVessel playing={props.playing} /><Markers selectedId={props.selectedId} onSelect={props.onSelect} />
    <CameraRig selectedId={props.selectedId} command={props.command} playing={props.playing} touchCamera={props.touchCamera} onFailure={props.onFailure} />
  </Canvas>;
}
