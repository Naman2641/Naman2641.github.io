import { useRef, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { about } from "../data";
import { useReducedMotion, useWebGLAvailable, useIsLowPower } from "../hooks";
import { swirlVertexShader, swirlFragmentShader } from "../three/shaders";
import "./About.css";

gsap.registerPlugin(ScrollTrigger);

/* ---- Swirl background fullscreen quad ---- */
function SwirlBackground({ scrollVelocity, mouse }) {
  const matRef = useRef();
  const { size } = useThree();

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    matRef.current.uniforms.uMouse.value.set(mouse.current.x, mouse.current.y);
    matRef.current.uniforms.uScrollVelocity.value = scrollVelocity.current;
    matRef.current.uniforms.uResolution.value.set(size.width, size.height);
  });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uScrollVelocity: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
    }),
    []
  );

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={swirlVertexShader}
        fragmentShader={swirlFragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ---- Wireframe icosahedron ---- */
function GlowingIcosahedron({ mouse }) {
  const meshRef = useRef();
  const wireRef = useRef();

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.2 + mouse.current.y * 0.3;
    meshRef.current.rotation.y = t * 0.15 + mouse.current.x * 0.3;
  });

  return (
    <group ref={meshRef} scale={0.8}>
      <mesh>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#ffffff" wireframe opacity={0.15} transparent />
      </mesh>
      <mesh ref={wireRef}>
        <icosahedronGeometry args={[1.02, 1]} />
        <meshBasicMaterial color="#ffffff" wireframe opacity={0.06} transparent />
      </mesh>
      {/* Spotlight from above */}
      <spotLight
        position={[0, 4, 0]}
        angle={0.5}
        penumbra={0.8}
        intensity={2}
        color="#ffffff"
        distance={10}
      />
      {/* Inner glow via point light */}
      <pointLight position={[0, 0, 0]} intensity={0.6} color="#ffffff" distance={3} />
    </group>
  );
}

function AboutScene({ mouse }) {
  const { gl } = useThree();
  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }, [gl]);

  return (
    <>
      <ambientLight intensity={0.05} />
      <GlowingIcosahedron mouse={mouse} />
    </>
  );
}

export default function About() {
  const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const headingRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const scrollVelocity = useRef(0);
  const reducedMotion = useReducedMotion();
  const webGLAvailable = useWebGLAvailable();
  const isLowPower = useIsLowPower();

  useEffect(() => {
    const handleMove = (e) => {
      if (reducedMotion.current) return;
      mouse.current.x = e.clientX / window.innerWidth;
      mouse.current.y = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  useEffect(() => {
    if (reducedMotion.current) return;
    const ctx = gsap.context(() => {
      // Card entrance
      gsap.from(cardRef.current, {
        y: 80,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
          toggleActions: "play none none reverse",
        },
      });

      // Heading overlap reveal
      gsap.from(headingRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 50%",
          toggleActions: "play none none reverse",
        },
      });

      // Track scroll velocity
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          scrollVelocity.current = self.getVelocity();
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const showWebGL = webGLAvailable.current && !isLowPower.current;

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      className="about section section--dark"
      aria-label="About"
    >
      <div className="grain-overlay grain-overlay--animated" aria-hidden="true" />

      {/* Fullscreen swirl background */}
      {showWebGL && (
        <div className="about__swirl" aria-hidden="true">
          <Canvas
            camera={{ position: [0, 0, 1] }}
            dpr={[1, 1.5]}
            gl={{ antialias: false, alpha: false }}
            style={{ pointerEvents: "none" }}
          >
            <SwirlBackground scrollVelocity={scrollVelocity} mouse={mouse} />
          </Canvas>
        </div>
      )}

      <div className="about__inner container">
        <h2
          ref={headingRef}
          className="headline bloom-text about__heading"
        >
          {about.heading}
        </h2>

        <div ref={cardRef} className="about__card card">
          <div className="about__card-content">
            {/* Mini 3D scene */}
            {showWebGL && (
              <div className="about__mini-scene" aria-hidden="true">
                <Suspense fallback={null}>
                  <Canvas
                    camera={{ position: [0, 0, 3.5], fov: 35 }}
                    dpr={[1, 2]}
                    gl={{ antialias: true, alpha: true }}
                    style={{ pointerEvents: "none" }}
                  >
                    <AboutScene mouse={mouse} />
                  </Canvas>
                </Suspense>
              </div>
            )}

            <p className="about__bio">{about.bio}</p>

            <div className="about__actions">
              <button
                className="pill pill--filled"
                onClick={() => scrollToSection("projects")}
              >
                See projects
              </button>
              <button
                className="pill pill--ghost"
                style={{ color: "var(--paper)", borderColor: "var(--grey-400)" }}
                onClick={() => scrollToSection("contact")}
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
