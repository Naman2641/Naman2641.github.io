import { useRef, useState, useEffect, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "../data";
import { useReducedMotion, useWebGLAvailable, useIsLowPower } from "../hooks";
import "./Projects.css";

gsap.registerPlugin(ScrollTrigger);

const CARD_COUNT = projects.length;
const CARD_WIDTH = 3.2;
const CARD_HEIGHT = 4.2;
const RADIUS = 5;

/* ---- Procedural card texture ---- */
function createCardTexture(project, index) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 672;
  const ctx = canvas.getContext("2d");

  // Dark background
  ctx.fillStyle = "#0d0d0e";
  ctx.fillRect(0, 0, 512, 672);

  // Subtle gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 672);
  grad.addColorStop(0, "rgba(255,255,255,0.03)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 672);

  // Grid lines
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let y = 0; y < 672; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Index number
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.font = "bold 200px Arial";
  ctx.textAlign = "right";
  ctx.fillText(`0${index + 1}`, 480, 250);

  // Project name
  ctx.fillStyle = "#efeeec";
  ctx.font = "bold 42px Arial";
  ctx.textAlign = "left";
  const words = project.name.toUpperCase().split(" ");
  let yPos = 380;
  words.forEach((word) => {
    ctx.fillText(word, 40, yPos);
    yPos += 50;
  });

  // Tech stack
  ctx.fillStyle = "rgba(239,238,236,0.5)";
  ctx.font = "14px monospace";
  ctx.fillText(project.tech.join(" · "), 40, yPos + 20);

  // Border
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 2;
  ctx.roundRect(8, 8, 496, 656, 16);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/* ---- Single curved card ---- */
function CarouselCard({ project, index, activeIndex, onClick, textures }) {
  const meshRef = useRef();
  const angle = ((index - activeIndex) / CARD_COUNT) * Math.PI * 2;
  const targetX = Math.sin(angle) * RADIUS;
  const targetZ = Math.cos(angle) * RADIUS - RADIUS;
  const targetRotY = -angle;
  const isActive = index === activeIndex;

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.08;
    meshRef.current.position.z += (targetZ - meshRef.current.position.z) * 0.08;
    meshRef.current.rotation.y += (targetRotY - meshRef.current.rotation.y) * 0.08;

    const targetScale = isActive ? 1.05 : 0.85;
    meshRef.current.scale.x += (targetScale - meshRef.current.scale.x) * 0.08;
    meshRef.current.scale.y += (targetScale - meshRef.current.scale.y) * 0.08;

    // Opacity via material
    if (meshRef.current.material) {
      const targetOpacity = isActive ? 1 : 0.55;
      meshRef.current.material.opacity += (targetOpacity - meshRef.current.material.opacity) * 0.08;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[targetX, 0, targetZ]}
      rotation={[0, targetRotY, 0]}
      onClick={() => onClick(index)}
    >
      <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT, 16, 1]} />
      <meshBasicMaterial
        map={textures[index]}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ---- Carousel scene ---- */
function CarouselScene({ activeIndex, setActiveIndex, textures }) {
  const { gl } = useThree();

  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }, [gl]);

  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[0, 3, 2]} intensity={0.5} />
      {projects.map((project, i) => (
        <CarouselCard
          key={project.id}
          project={project}
          index={i}
          activeIndex={activeIndex}
          onClick={setActiveIndex}
          textures={textures}
        />
      ))}
    </>
  );
}

/* ---- Project detail overlay ---- */
function ProjectOverlay({ project, onClose }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
    );
  }, []);

  const handleClose = () => {
    gsap.to(overlayRef.current, {
      opacity: 0,
      y: 40,
      duration: 0.35,
      ease: "power2.in",
      onComplete: onClose,
    });
  };

  return (
    <div className="project-overlay" role="dialog" aria-modal="true" aria-label={project.name}>
      <div ref={overlayRef} className="project-overlay__inner">
        <button
          className="project-overlay__close label"
          onClick={handleClose}
          aria-label="Close details"
        >
          ✕ Close
        </button>
        <h3 className="headline project-overlay__title">{project.name.toUpperCase()}</h3>
        <p className="label project-overlay__tech">{project.tech.join(" · ")}</p>
        <p className="project-overlay__desc">{project.description}</p>
        <div className="project-overlay__links">
          {project.github ? (
            <a href={project.github} target="_blank" rel="noopener noreferrer" className="pill pill--dark">
              GitHub
            </a>
          ) : (
            <span className="label" style={{ opacity: 0.4 }}>
              {/* TODO: add GitHub link in data.js */}
              GitHub link coming soon
            </span>
          )}
          {project.live ? (
            <a href={project.live} target="_blank" rel="noopener noreferrer" className="pill pill--dark">
              Live Demo
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ---- Mobile fallback carousel ---- */
function MobileCarousel({ activeIndex, setActiveIndex, setOverlayProject }) {
  return (
    <div className="projects__mobile-carousel">
      {projects.map((project, i) => (
        <div
          key={project.id}
          className={`projects__mobile-card ${i === activeIndex ? "active" : ""}`}
          onClick={() => setActiveIndex(i)}
          role="button"
          tabIndex={0}
          aria-label={`Project: ${project.name}`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setActiveIndex(i);
            }
          }}
        >
          <span className="label projects__mobile-index">0{i + 1}</span>
          <h3 className="headline projects__mobile-name">{project.name.toUpperCase()}</h3>
          <p className="label" style={{ color: "var(--grey-300)" }}>{project.tech.join(" · ")}</p>
          <p className="projects__mobile-desc">{project.oneLiner}</p>
          <button
            className="pill pill--ghost"
            style={{ marginTop: "12px", fontSize: "0.65rem" }}
            onClick={(e) => {
              e.stopPropagation();
              setOverlayProject(project);
            }}
          >
            View details →
          </button>
        </div>
      ))}
    </div>
  );
}

export default function Projects() {
  const sectionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [overlayProject, setOverlayProject] = useState(null);
  const reducedMotion = useReducedMotion();
  const webGLAvailable = useWebGLAvailable();
  const isLowPower = useIsLowPower();
  const texturesRef = useRef([]);

  // Generate textures once
  useEffect(() => {
    texturesRef.current = projects.map((p, i) => createCardTexture(p, i));
    return () => {
      texturesRef.current.forEach((t) => t.dispose());
    };
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % CARD_COUNT);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + CARD_COUNT) % CARD_COUNT);
      }
    },
    []
  );

  // Wheel / swipe
  const wheelTimeout = useRef(null);
  const handleWheel = useCallback((e) => {
    if (wheelTimeout.current) return;
    wheelTimeout.current = setTimeout(() => {
      wheelTimeout.current = null;
    }, 400);

    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      if (e.deltaX > 30) setActiveIndex((p) => (p + 1) % CARD_COUNT);
      else if (e.deltaX < -30) setActiveIndex((p) => (p - 1 + CARD_COUNT) % CARD_COUNT);
    }
  }, []);

  useEffect(() => {
    if (reducedMotion.current) return;
    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current, {
        opacity: 0,
        duration: 0.6,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const showWebGL = webGLAvailable.current && !isLowPower.current;
  const activeProject = projects[activeIndex];

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="projects section section--light"
      aria-label="Featured Projects"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
    >
      <div className="projects__inner container">
        <h2 className="headline projects__heading">FEATURED PROJECTS</h2>

        {showWebGL && texturesRef.current.length > 0 ? (
          <div className="projects__canvas-wrapper" onWheel={handleWheel}>
            <Suspense fallback={null}>
              <Canvas
                camera={{ position: [0, 0, 6], fov: 45 }}
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true }}
              >
                <CarouselScene
                  activeIndex={activeIndex}
                  setActiveIndex={setActiveIndex}
                  textures={texturesRef.current}
                />
              </Canvas>
            </Suspense>
          </div>
        ) : (
          <MobileCarousel
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            setOverlayProject={setOverlayProject}
          />
        )}

        {/* Active project info */}
        <div className="projects__info">
          <div className="projects__info-left">
            <h3 className="headline projects__active-name">
              {activeProject.name.toUpperCase()}
            </h3>
            <p className="projects__active-desc">{activeProject.oneLiner}</p>
            <p className="label" style={{ color: "var(--grey-400)" }}>
              {activeProject.tech.join(" · ")}
            </p>
          </div>
          <div className="projects__info-right">
            <span className="headline projects__index">
              0{activeIndex + 1}{" "}
              <span style={{ opacity: 0.3, fontWeight: 400 }}>/ 0{CARD_COUNT}</span>
            </span>
            <button
              className="pill pill--dark"
              onClick={() => setOverlayProject(activeProject)}
            >
              View details →
            </button>
          </div>
        </div>

        {/* Navigation dots */}
        <div className="projects__dots" role="tablist" aria-label="Project navigation">
          {projects.map((_, i) => (
            <button
              key={i}
              className={`projects__dot ${i === activeIndex ? "active" : ""}`}
              onClick={() => setActiveIndex(i)}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Go to project ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Detail overlay */}
      {overlayProject && (
        <ProjectOverlay
          project={overlayProject}
          onClose={() => setOverlayProject(null)}
        />
      )}
    </section>
  );
}
