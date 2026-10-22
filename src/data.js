// ============================================================
// data.js — Single source of truth for all portfolio content.
// Edit this file to personalise the site. Rebuild after changes.
// ============================================================

export const meta = {
  title: "Naman Kumar — Data Science & AI Portfolio",
  description:
    "Portfolio of Naman Kumar — aspiring data scientist and AI builder studying Computer Science at DSCE, Bengaluru.",
  ogImage: "/og.png", // TODO: replace with a real OG image
  favicon: "/favicon.svg",
  url: "https://namankumar.dev", // TODO: replace with your actual domain
};

export const personal = {
  name: "Naman Kumar",
  wordmark: "NAMAN.",
  tagline: "Aspiring data scientist & AI builder",
  location: "Bengaluru",
  copyright: `© ${new Date().getFullYear()} Naman Kumar · Bengaluru`,
};

export const links = {
  github: "https://github.com/Naman2641",
  linkedin: "https://www.linkedin.com/in/namankumar2641/",
  email: "nkg2641@gmail.com",
};

export const nav = ["Home", "About", "Journey", "Projects", "Skills", "Contact"];

// -------------------------------------------------------
// Hero config
// -------------------------------------------------------
// Set usePhoto to true and provide photoUrl to swap the 3D
// bust for a cut-out photo with parallax tilt.
export const heroConfig = {
  usePhoto: true,
  photoUrl: "/hero-photo.jpg",
  headline: ["EXPLORE MY", "PORTFOLIO"],
};

// -------------------------------------------------------
// About
// -------------------------------------------------------
export const about = {
  heading: "ABOUT",
  bio: `I'm Naman Kumar, a Computer Science undergrad at Dayananda Sagar College of Engineering, Bengaluru. I'm in my 3rd semester with a CGPA of 8.75, and I'm on a mission to build intelligent systems that solve real problems. My focus is data science and AI — from sign-language recognition to physiological signal analysis — and I love shipping projects that mix hardware, real-time interfaces, and machine learning.`,
};

// -------------------------------------------------------
// Journey / Timeline
// -------------------------------------------------------
export const timeline = [
  {
    year: "2025–2029",
    title: "B.E. Computer Science",
    subtitle: "Dayananda Sagar College of Engineering, Bengaluru",
    detail: "CGPA 8.75 · 3rd semester · Expected graduation 2029",
  },
  {
    year: "2025–26",
    title: "Competitions",
    subtitle: "Participated in 3, won 2",
    detail:
      "Won \"Zero to One\" (college hackathon) and an ideathon organised by the physics department.",
  },
  {
    year: "NOW",
    title: "Focus",
    subtitle: "Data Science & AI",
    detail:
      "Building projects at the intersection of machine learning, real-time systems, and embedded hardware.",
  },
];

// -------------------------------------------------------
// Projects
// -------------------------------------------------------
export const projects = [
  {
    id: 1,
    name: "Signspeak",
    oneLiner: "Sign language detection using MediaPipe hand landmarks.",
    description:
      "A real-time sign language recognition system that uses MediaPipe's hand-tracking pipeline to capture 21 3D landmarks per hand, classify gestures via a trained model, and display the recognised signs on screen.",
    tech: ["Python", "MediaPipe"],
    github: "", // TODO: add GitHub link
    live: "", // TODO: add live demo link
    image: null, // TODO: add screenshot path e.g. "/projects/signspeak.png"
  },
  {
    id: 2,
    name: "ETHiCare VitalSense",
    oneLiner:
      "Codethon project analysing WESAD and ECG physiological signals with a full-stack dashboard.",
    description:
      "A health-analytics platform built during a codethon. It ingests WESAD and ECG datasets, runs signal-processing pipelines on the backend, and serves interactive visualisations through a React dashboard connected via FastAPI.",
    tech: ["React", "Node.js", "FastAPI"],
    github: "", // TODO: add GitHub link
    live: "", // TODO: add live demo link
    image: null, // TODO: add screenshot path
  },
  {
    id: 3,
    name: "ThoughtFirewall",
    oneLiner:
      "Cybersecurity + AI hackathon project with a real-time interface.",
    description:
      "A real-time cybersecurity monitoring tool built at a hackathon. It streams threat-detection events over WebSocket to a React front-end, giving analysts a live view of network anomalies flagged by an AI model.",
    tech: ["React", "WebSocket"],
    github: "", // TODO: add GitHub link
    live: "", // TODO: add live demo link
    image: null, // TODO: add screenshot path
  },
  {
    id: 4,
    name: "Smart Mess Attendance",
    oneLiner: "Smart attendance system for mess halls.",
    description:
      "An automated attendance tracking system designed for college mess halls. Students are checked in seamlessly, replacing manual registers with a reliable, low-friction digital workflow.",
    tech: ["Python"],
    github: "", // TODO: add GitHub link
    live: "", // TODO: add live demo link
    image: null, // TODO: add screenshot path
  },
  {
    id: 5,
    name: "SEAMS Motion Alarm",
    oneLiner: "Motion detection alarm built on an Arduino Uno.",
    description:
      "A hardware project using an Arduino Uno and motion sensors to trigger an alarm when movement is detected. Designed for simple perimeter security or activity monitoring scenarios.",
    tech: ["Arduino Uno"],
    github: "", // TODO: add GitHub link
    live: "", // TODO: add live demo link
    image: null, // TODO: add screenshot path
  },
];

// -------------------------------------------------------
// Skills
// -------------------------------------------------------
export const skills = [
  {
    category: "Languages",
    items: ["Python", "C"],
    description:
      "Core programming languages I use for data science, systems programming, and rapid prototyping.",
    usedIn: ["Signspeak", "Smart Mess Attendance", "SEAMS Motion Alarm"],
  },
  {
    category: "Libraries & Frameworks",
    items: ["MediaPipe", "React", "Node.js", "FastAPI", "WebSocket"],
    description:
      "The tools I reach for when building full-stack applications, real-time interfaces, and ML pipelines.",
    usedIn: ["Signspeak", "ETHiCare VitalSense", "ThoughtFirewall"],
  },
  {
    category: "Hardware",
    items: ["Arduino Uno"],
    description:
      "Hands-on experience with embedded systems and sensor-driven projects.",
    usedIn: ["SEAMS Motion Alarm"],
  },
];
