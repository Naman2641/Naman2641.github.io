import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function ParticleField() {
  const meshRef = useRef();
  const count = 800;

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
      sz[i] = Math.random() * 2 + 0.5;
    }
    return [pos, sz];
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#00e87b"
        transparent
        opacity={0.35}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function FloatingRing() {
  const ringRef = useRef();

  useFrame((state) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.x = state.clock.elapsedTime * 0.15;
    ringRef.current.rotation.z = state.clock.elapsedTime * 0.08;
    ringRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
  });

  return (
    <mesh ref={ringRef} position={[3, 0, -2]}>
      <torusGeometry args={[1.5, 0.02, 16, 100]} />
      <meshBasicMaterial color="#00e87b" transparent opacity={0.12} />
    </mesh>
  );
}

function FloatingRing2() {
  const ringRef = useRef();

  useFrame((state) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.y = state.clock.elapsedTime * 0.12;
    ringRef.current.rotation.x = state.clock.elapsedTime * 0.06;
    ringRef.current.position.y = Math.cos(state.clock.elapsedTime * 0.25) * 0.4;
  });

  return (
    <mesh ref={ringRef} position={[-3, 1, -3]}>
      <torusGeometry args={[1, 0.015, 16, 100]} />
      <meshBasicMaterial color="#a855f7" transparent opacity={0.1} />
    </mesh>
  );
}

export default function Scene3D() {
  return (
    <div className="canvas-bg">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ParticleField />
        <FloatingRing />
        <FloatingRing2 />
      </Canvas>
    </div>
  );
}
