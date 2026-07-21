import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import type { Group } from "three";

function getScrollFraction(): number {
  const scrollTop = document.documentElement.scrollTop;
  const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  return max > 0 ? scrollTop / max : 0;
}

function ScrollRig() {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    const t = getScrollFraction();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * Math.PI * 2;
      groupRef.current.position.y = t * 6;
    }
    state.camera.position.x = Math.sin(t * Math.PI) * 1.2;
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={groupRef}>
      <ShapeCluster />
    </group>
  );
}

function ShapeCluster() {
  const a = useRef<Group>(null);
  const b = useRef<Group>(null);
  const c = useRef<Group>(null);
  const d = useRef<Group>(null);

  useFrame((state) => {
    const el = state.clock.elapsedTime;
    if (a.current) a.current.rotation.x = el * 0.4;
    if (b.current) b.current.rotation.z = el * 0.3;
    if (c.current) c.current.rotation.y = el * 0.5;
    if (d.current) d.current.rotation.x = -el * 0.35;
  });

  return (
    <>
      <group ref={a} position={[-2.6, 0.8, 0]}>
        <mesh>
          <icosahedronGeometry args={[0.9, 0]} />
          <meshStandardMaterial color="#4f46e5" roughness={0.25} metalness={0.3} />
        </mesh>
      </group>
      <group ref={b} position={[2.4, -1, -1]}>
        <mesh>
          <torusGeometry args={[0.7, 0.28, 24, 64]} />
          <meshStandardMaterial color="#22d3ee" roughness={0.2} metalness={0.35} />
        </mesh>
      </group>
      <group ref={c} position={[0.6, 2.2, -2]}>
        <mesh>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.2} />
        </mesh>
      </group>
      <group ref={d} position={[-1.4, -2.4, -1.5]}>
        <mesh>
          <octahedronGeometry args={[0.6, 0]} />
          <meshStandardMaterial color="#22c55e" roughness={0.25} metalness={0.25} />
        </mesh>
      </group>
      <group position={[3.2, 3, -3]}>
        <mesh rotation={[0.4, 0.3, 0]}>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial color="#ec4899" roughness={0.3} metalness={0.2} />
        </mesh>
      </group>
      <group position={[-3.4, -0.6, -2.5]}>
        <mesh rotation={[0.2, 0.5, 0.1]}>
          <coneGeometry args={[0.55, 1, 4]} />
          <meshStandardMaterial color="#6366f1" roughness={0.25} metalness={0.3} />
        </mesh>
      </group>
    </>
  );
}

export function HeroScene({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.1} />
        <Suspense fallback={null}>
          <ScrollRig />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
