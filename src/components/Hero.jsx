import { useRef, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { personal, heroConfig } from "../data";
import { useReducedMotion, useWebGLAvailable, useIsLowPower } from "../hooks";
import "./Hero.css";

gsap.registerPlugin(ScrollTrigger);

/* ---- Low-poly head geometry (fallback when no photo) ---- */
function LowPolyBust({ mouse }) {
  const meshRef = useRef();
  const groupRef = useRef();

  const geometry = useMemo(() => {
    const head = new THREE.IcosahedronGeometry(1, 1);
    const neck = new THREE.CylinderGeometry(0.35, 0.45, 0.6, 6);
    neck.translate(0, -1.2, 0);
    const shoulderL = new THREE.CylinderGeometry(0.2, 0.4, 1.0, 5);
    shoulderL.translate(-0.9, -1.8, 0);
    shoulderL.rotateZ(0.35);
    const shoulderR = new THREE.CylinderGeometry(0.2, 0.4, 1.0, 5);
    shoulderR.translate(0.9, -1.8, 0);
    shoulderR.rotateZ(-0.35);
    const torso = new THREE.BoxGeometry(2.2, 0.8, 0.9, 2, 2, 2);
    torso.translate(0, -2.2, 0);

    const merged = new THREE.BufferGeometry();
    const geos = [head, neck, shoulderL, shoulderR, torso];
    let totalVerts = 0;
    geos.forEach((g) => (totalVerts += g.attributes.position.count));

    const positions = new Float32Array(totalVerts * 3);
    const normals = new Float32Array(totalVerts * 3);
    let offset = 0;

    geos.forEach((g) => {
      const pos = g.attributes.position.array;
      const norm = g.attributes.normal?.array;
      for (let i = 0; i < pos.length; i++) {
        positions[offset + i] = pos[i];
        if (norm) normals[offset + i] = norm[i];
      }
      offset += pos.length;
    });

    merged.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    merged.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
    merged.computeVertexNormals();

    const posArr = merged.attributes.position.array;
    for (let i = 0; i < posArr.length; i += 3) {
      posArr[i] += (Math.random() - 0.5) * 0.05;
      posArr[i + 1] += (Math.random() - 0.5) * 0.05;
      posArr[i + 2] += (Math.random() - 0.5) * 0.05;
    }
    merged.computeVertexNormals();
    return merged;
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const targetX = mouse.current.y * 0.15;
    const targetY = mouse.current.x * 0.2;
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05;
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.05;
  });

  return (
    <group ref={groupRef} position={[0, -0.8, 0]} scale={1.1}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial color="#111111" flatShading roughness={0.7} metalness={0.1} />
      </mesh>
      <pointLight position={[3, 2, -2]} intensity={2} color="#ffffff" distance={8} />
      <pointLight position={[-3, 1, -1]} intensity={0.8} color="#888888" distance={6} />
    </group>
  );
}

function HeroScene({ mouse }) {
  const { gl } = useThree();
  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }, [gl]);

  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[0, 5, 5]} intensity={0.4} />
      <LowPolyBust mouse={mouse} />
    </>
  );
}

/* ---- Cinematic photo with slow rise & parallax tilt ---- */
function CinematicPhoto({ mouse, reducedMotion }) {
  const photoRef = useRef(null);
  const glowRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (reducedMotion.current || !photoRef.current) return;

    // Cinematic slow rise from below — like a movie scene entrance
    const tl = gsap.timeline({ delay: 1.6 });

    tl.set(photoRef.current, {
      y: "30%",
      opacity: 0,
      scale: 1.1,
      filter: "blur(8px) brightness(0.3)",
    });

    tl.set(glowRef.current, { opacity: 0, scale: 0.8 });

    // Phase 1: Fade in the glow aura first
    tl.to(glowRef.current, {
      opacity: 0.6,
      scale: 1,
      duration: 1.2,
      ease: "power2.out",
    });

    // Phase 2: The figure slowly rises from the darkness
    tl.to(
      photoRef.current,
      {
        y: "0%",
        opacity: 1,
        scale: 1,
        filter: "blur(0px) brightness(1)",
        duration: 2,
        ease: "power2.out",
      },
      "-=0.8"
    );

    // Phase 3: Subtle breathing glow pulse (infinite)
    tl.to(glowRef.current, {
      opacity: 0.4,
      duration: 2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    return () => tl.kill();
  }, []);

  // Parallax tilt on mouse move
  useEffect(() => {
    if (reducedMotion.current) return;

    const handleMove = () => {
      if (!containerRef.current) return;
      const rx = mouse.current.y * 4;
      const ry = mouse.current.x * -4;
      gsap.to(containerRef.current, {
        rotateX: rx,
        rotateY: ry,
        duration: 0.8,
        ease: "power2.out",
      });
    };

    const interval = setInterval(handleMove, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero__photo-cinema" ref={containerRef} style={{ perspective: "1000px" }}>
      {/* Aura glow behind the figure */}
      <div ref={glowRef} className="hero__photo-glow" aria-hidden="true" />

      {/* The cinematic photo */}
      <img
        ref={photoRef}
        src={heroConfig.photoUrl}
        alt={`${personal.name} — cinematic silhouette portrait`}
        className="hero__photo-img"
      />

      {/* Particle/dust overlay effect */}
      <div className="hero__photo-particles" aria-hidden="true" />
    </div>
  );
}

export default function Hero() {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const subRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const reducedMotion = useReducedMotion();
  const webGLAvailable = useWebGLAvailable();
  const isLowPower = useIsLowPower();

  useEffect(() => {
    const handleMove = (e) => {
      if (reducedMotion.current) return;
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  useEffect(() => {
    if (reducedMotion.current) return;
    const ctx = gsap.context(() => {
      gsap.from(headlineRef.current?.children || [], {
        y: 80,
        opacity: 0,
        stagger: 0.15,
        duration: 1,
        ease: "power3.out",
        delay: 1.8,
      });
      gsap.from(subRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 2.4,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const show3D = webGLAvailable.current && !isLowPower.current && !heroConfig.usePhoto;

  return (
    <section
      ref={sectionRef}
      id="home"
      className="hero section section--light"
      aria-label="Hero"
    >
      <div className="hero__content container">
        <div ref={headlineRef} className="hero__headline">
          <h1 className="headline hero__title-line hero__title-solid">
            {heroConfig.headline[0]}
          </h1>
          <span className="headline hero__title-line hero__title-gradient" aria-hidden="true">
            {heroConfig.headline[1]}
          </span>
        </div>

        <div className="hero__3d-wrapper">
          {heroConfig.usePhoto ? (
            <CinematicPhoto mouse={mouse} reducedMotion={reducedMotion} />
          ) : show3D ? (
            <Suspense fallback={null}>
              <Canvas
                camera={{ position: [0, 0, 5], fov: 40 }}
                dpr={[1, 2]}
                style={{ pointerEvents: "none" }}
                gl={{ antialias: true, alpha: true }}
              >
                <HeroScene mouse={mouse} />
              </Canvas>
            </Suspense>
          ) : (
            <div className="hero__fallback">
              <div className="hero__fallback-shape" />
            </div>
          )}
        </div>

        <div className="hero__captions" ref={subRef}>
          <span className="label hero__caption-left">
            {personal.name} — {personal.tagline}
          </span>
          <span className="label hero__caption-right">Scroll ↓</span>
        </div>
      </div>
    </section>
  );
}
