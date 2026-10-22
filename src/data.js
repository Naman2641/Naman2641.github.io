// ============================================================
// data.js — Single source of truth for all portfolio content.
// ============================================================

export const meta = {
  title: "Naman Kumar — Data Science & AI Portfolio",
  description:
    "Portfolio of Naman Kumar — aspiring data scientist and AI builder studying Computer Science at DSCE, Bengaluru.",
  ogImage: "/og.png",
  favicon: "/favicon.svg",
  url: "https://namankumar.dev",
};

export const personal = {
  name: "Naman Kumar",
  wordmark: "NAMAN.",
  tagline: "Aspiring data scientist & AI builder",
  location: "Bengaluru, India",
  resumeUrl: "/resume.pdf",
  copyright: `© ${new Date().getFullYear()} Naman Kumar · Bengaluru`,
};

export const links = {
  github: "https://github.com/Naman2641",
  linkedin: "https://www.linkedin.com/in/namankumar2641/",
  email: "nkg2641@gmail.com",
};

export const nav = ["Home", "About", "Projects", "Skills", "Contact"];

// -------------------------------------------------------
// Hero config
// -------------------------------------------------------
export const heroConfig = {
  photoUrl: "/naman.jpg",
  headline: ["EXPLORE MY", "PORTFOLIO"],
};

// -------------------------------------------------------
// About
// -------------------------------------------------------
export const about = {
  heading: "ABOUT",
  bio: `I'm Naman Kumar, a Computer Science undergrad at Dayananda Sagar College of Engineering, Bengaluru. Currently in my 3rd semester with a CGPA of 8.75, I'm on a mission to build intelligent systems that solve real problems.

My focus is data science and AI — from sign-language recognition to physiological signal analysis. I love shipping projects that mix hardware, real-time interfaces, and machine learning. I've competed in 3 hackathons and won 2, including "Zero to One" and a physics department ideathon.

When I'm not coding, you'll find me exploring new tech, brainstorming product ideas, or pushing pixels until they're perfect.`,
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
      'Won "Zero to One" (college hackathon) and an ideathon organised by the physics department.',
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
    github: "",
    live: "",
  },
  {
    id: 2,
    name: "ETHiCare VitalSense",
    oneLiner:
      "Codethon project analysing WESAD and ECG physiological signals with a full-stack dashboard.",
    description:
      "A health-analytics platform built during a codethon. It ingests WESAD and ECG datasets, runs signal-processing pipelines on the backend, and serves interactive visualisations through a React dashboard connected via FastAPI.",
    tech: ["React", "Node.js", "FastAPI"],
    github: "",
    live: "",
  },
  {
    id: 3,
    name: "ThoughtFirewall",
    oneLiner:
      "Cybersecurity + AI hackathon project with a real-time interface.",
    description:
      "A real-time cybersecurity monitoring tool built at a hackathon. It streams threat-detection events over WebSocket to a React front-end, giving analysts a live view of network anomalies flagged by an AI model.",
    tech: ["React", "WebSocket"],
    github: "",
    live: "",
  },
  {
    id: 4,
    name: "Smart Mess Attendance",
    oneLiner: "Automated attendance system for college mess halls.",
    description:
      "An automated attendance tracking system designed for college mess halls. Students are checked in seamlessly, replacing manual registers with a reliable, low-friction digital workflow.",
    tech: ["Python"],
    github: "",
    live: "",
  },
  {
    id: 5,
    name: "SEAMS Motion Alarm",
    oneLiner: "Motion detection alarm built on an Arduino Uno.",
    description:
      "A hardware project using an Arduino Uno and motion sensors to trigger an alarm when movement is detected. Designed for simple perimeter security or activity monitoring scenarios.",
    tech: ["Arduino Uno", "C++"],
    github: "",
    live: "",
  },
];

// -------------------------------------------------------
// Skills
// -------------------------------------------------------
export const skills = [
  {
    category: "Languages",
    items: ["Python", "C", "C++"],
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

// -------------------------------------------------------
// Services / What I Do
// -------------------------------------------------------
export const services = [
  {
    title: "AI & ML Solutions",
    description: "Building intelligent systems with computer vision, NLP, and predictive analytics.",
    icon: "🧠",
  },
  {
    title: "Full-Stack Development",
    description: "React frontends, Node/FastAPI backends, real-time WebSocket architectures.",
    icon: "⚡",
  },
  {
    title: "Hardware & IoT",
    description: "Arduino-based prototyping, sensor integration, and embedded systems.",
    icon: "🔧",
  },
  {
    title: "Data Science",
    description: "Signal processing, physiological data analysis, and interactive dashboards.",
    icon: "📊",
  },
];
