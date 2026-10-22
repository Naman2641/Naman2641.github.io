import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "../data";
import { useReducedMotion, useWebGLAvailable, useIsLowPower } from "../hooks";
import "./Orbit.css";

gsap.registerPlugin(ScrollTrigger);

const RING_RADIUS = 3.5;

/* ---- Reuse card texture generator ---- */
function createMiniCardTexture(project, index) {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 500;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#111112";
  ctx.fillRect(0, 0, 400, 500);

  const grad = ctx.createLinearGradient(0, 0, 0, 500);
  grad.addColorStop(0, "rgba(255,255,255,0.02)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 400, 500);

  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.font = "bold 160px Arial";
  ctx.textAlign = "right";
  ctx.fillText(`0${index + 1}`, 370, 200);

  ctx.fillStyle = "#efeeec";
  ctx.font = "bold 34px Arial";
  ctx.textAlign = "left";
  const words = project.name.toUpperCase().split(" ");
  let yPos = 300;
  words.forEach((word) => {
    ctx.fillText(word, 30, yPos);
    yPos += 42;
  });

  ctx.fillStyle = "rgba(239,238,236,0.4)";
  ctx.font = "12px monospace";
  ctx.fillText(project.tech.join(" · "), 30, yPos + 16);

  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 2;
  ctx.roundRect(6, 6, 388, 488, 14);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/* ---- Orbit card ---- */
function OrbitCard({ index, total, rotation, textures }) {
  const meshRef = useRef();
  const angle = (index / total) * Math.PI * 2 + rotation;

  useFrame(() => {
    if (!meshRef.current) return;
    const currentAngle = (index / total) * Math.PI * 2 + rotation;
    const x = Math.sin(currentAngle) * RING_RADIUS;
    const z = Math.cos(currentAngle) * RING_RADIUS;
    meshRef.current.position.x = x;
    meshRef.current.position.z = z;
    meshRef.current.rotation.y = -currentAngle;

    // Fade cards that are behind
    const depth = (Math.cos(currentAngle) + 1) / 2;
    if (meshRef.current.material) {
      meshRef.current.material.opacity = 0.4 + depth * 0.6;
    }
  });

  return (
    <mesh ref={meshRef} position={[Math.sin(angle) * RING_RADIUS, 0, Math.cos(angle) * RING_RADIUS]}>
      <planeGeometry args={[2.2, 2.8]} />
      <meshBasicMaterial map={textures[index]} transparent side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ---- Orbit scene ---- */
function OrbitScene({ rotation, textures }) {
  const groupRef = useRef();
  const { gl } = useThree();

  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }, [gl]);

  // Tilt the ring
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = -0.3;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.6} />
      {projects.map((_, i) => (
        <OrbitCard
          key={i}
          index={i}
          total={projects.length}
          rotation={rotation}
          textures={textures}
        />
      ))}
    </group>
  );
}

export default function Orbit() {
  const sectionRef = useRef(null);
  const pinRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const rotationRef = useRef(0);
  const [rotation, setRotation] = useState(0);
  const reducedMotion = useReducedMotion();
  const webGLAvailable = useWebGLAvailable();
  const isLowPower = useIsLowPower();
  const texturesRef = useRef([]);

  useEffect(() => {
    texturesRef.current = projects.map((p, i) => createMiniCardTexture(p, i));
    return () => {
      texturesRef.current.forEach((t) => t.dispose());
    };
  }, []);

  useEffect(() => {
    if (reducedMotion.current) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: pinRef.current,
        start: "top top",
        end: `+=${window.innerHeight * 2.5}`,
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          const newRotation = self.progress * Math.PI * 2;
          rotationRef.current = newRotation;
          setRotation(newRotation);

          // Calculate active index based on rotation
          const normalizedAngle = (newRotation % (Math.PI * 2)) / (Math.PI * 2);
          const idx = Math.round(normalizedAngle * projects.length) % projects.length;
          setActiveIndex(idx);
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const showWebGL = webGLAvailable.current && !isLowPower.current;

  return (
    <section
      ref={sectionRef}
      className="orbit section section--light"
      aria-label="Works Orbit"
    >
      <div ref={pinRef} className="orbit__pin">
        <div className="orbit__inner container">
          <div className="orbit__canvas-area">
            {showWebGL && texturesRef.current.length > 0 ? (
              <Suspense fallback={null}>
                <Canvas
                  camera={{ position: [0, 2, 7], fov: 40 }}
                  dpr={[1, 2]}
                  gl={{ antialias: true, alpha: true }}
                >
                  <OrbitScene rotation={rotation} textures={texturesRef.current} />
                </Canvas>
              </Suspense>
            ) : (
              <div className="orbit__fallback">
                <span className="headline" style={{ fontSize: "2rem", opacity: 0.2 }}>
                  WORKS '26
                </span>
              </div>
            )}

            {/* Centre label */}
            <div className="orbit__centre-label headline" aria-hidden="true">
              WORKS '26
            </div>
          </div>

          <div className="orbit__sidebar">
            <div className="orbit__active-name">
              <span className="label label-bold">Active Project</span>
              <h3 className="headline orbit__project-name">
                {projects[activeIndex]?.name.toUpperCase()}
              </h3>
            </div>

            <ul className="orbit__index-list" role="list" aria-label="Project index">
              {projects.map((p, i) => (
                <li
                  key={i}
                  className={`label orbit__index-item ${i === activeIndex ? "active" : ""}`}
                >
                  {p.name}
                </li>
              ))}
            </ul>

            <span className="label orbit__hint">Scroll to cycle ↓</span>
          </div>
        </div>
      </div>
    </section>
  );
}
