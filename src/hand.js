// A 21-landmark hand built with forward kinematics, plus the same kind of
// per-finger analysis the real Signspeak does: bend (curvature) per finger,
// extended or not, then a pose lookup. Illustration, not the camera pipeline.

export const NAMES = ["Thumb", "Index", "Middle", "Ring", "Pinky"];
const PALM = 1.12; // wrist to middle MCP, used to normalise the thumb

const F = [
  null, // thumb handled separately
  { mcp: [-0.3, 1.05], dir: -0.1, L: [0.45, 0.28, 0.22] },
  { mcp: [-0.05, 1.12], dir: 0.0, L: [0.5, 0.32, 0.24] },
  { mcp: [0.2, 1.06], dir: 0.1, L: [0.46, 0.3, 0.22] },
  { mcp: [0.42, 0.93], dir: 0.24, L: [0.36, 0.22, 0.18] },
];
const BEND = [1.45, 1.7, 1.1]; // max flexion at MCP, PIP, DIP

const lerp = (a, b, t) => a + (b - a) * t;

function chain(base, dir, L, bends) {
  const pts = [[base[0], base[1], 0]];
  let th = 0, u = 0, z = 0;
  const sx = Math.sin(dir), sy = Math.cos(dir);
  for (let i = 0; i < 3; i++) {
    th += bends[i];
    u += L[i] * Math.cos(th);
    z += L[i] * Math.sin(th);
    pts.push([base[0] + sx * u, base[1] + sy * u, z]);
  }
  return pts;
}

// ext: five numbers 0 (curled) … 1 (straight). Returns 21 [x, y, z] points.
export function landmarks(ext) {
  const out = [[0, 0, 0]];
  // thumb: swings out to the side as it extends
  const e0 = ext[0];
  const tdir = lerp(0.95, -0.85, e0);
  const tb = [0.5, 0.7, 0.6].map((b) => (1 - e0) * b);
  out.push(...chain([-0.32, 0.22], tdir, [0.38, 0.3, 0.26], tb));
  for (let f = 1; f < 5; f++) {
    const d = F[f];
    const b = BEND.map((m) => (1 - ext[f]) * m);
    out.push(...chain(d.mcp, d.dir, d.L, b));
  }
  return out;
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (v) => Math.hypot(v[0], v[1], v[2]);
function ang(a, b) {
  const c = (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (len(a) * len(b));
  return Math.acos(Math.max(-1, Math.min(1, c)));
}

export const BEND_LIMIT = 1.15; // radians of PIP+DIP bend before a finger counts as curled
export const THUMB_LIMIT = 1.0; // thumb tip to pinky MCP, in palm lengths

// measure[i] is a unitless "how curled" number; extended[i] compares it to its limit
export function analyse(p) {
  const measure = [], extended = [];
  // thumb: distance from tip across to the pinky knuckle, as a fraction of palm length
  const td = len(sub(p[4], p[17])) / PALM;
  measure.push(td);
  extended.push(td > THUMB_LIMIT);
  for (let f = 0; f < 4; f++) {
    const o = 5 + f * 4;
    const v1 = sub(p[o + 1], p[o]);
    const v2 = sub(p[o + 2], p[o + 1]);
    const v3 = sub(p[o + 3], p[o + 2]);
    const bend = ang(v1, v2) + ang(v2, v3);
    measure.push(bend);
    extended.push(bend < BEND_LIMIT);
  }
  return { measure, extended };
}

const POSES = {
  "00000": "A",
  "01000": "1",
  "01100": "2",
  "11100": "3",
  "01111": "4",
  "11111": "5",
  "11000": "L",
  "10001": "Y",
  "00001": "I",
  "01110": "W",
  "00100": "\ud83d\udd95",
};
export const classify = (extended) => POSES[extended.map((e) => (e ? 1 : 0)).join("")] || "·";

export const POSE_LIST = [
  ["\ud83d\udd95", [0, 0, 1, 0, 0]],
  ["5", [1, 1, 1, 1, 1]],
  ["1", [0, 1, 0, 0, 0]],
  ["2", [0, 1, 1, 0, 0]],
  ["L", [1, 1, 0, 0, 0]],
  ["Y", [1, 0, 0, 0, 1]],
  ["4", [0, 1, 1, 1, 1]],
  ["A", [0, 0, 0, 0, 0]],
  ["3", [1, 1, 1, 0, 0]],
];

// "A sign only counts once it has held still": commit after N identical frames.
export class Stabiliser {
  constructor(n = 10) { this.n = n; this.cur = null; this.count = 0; this.committed = null; }
  push(label) {
    if (label === this.cur) this.count++;
    else { this.cur = label; this.count = 1; }
    let fired = null;
    if (this.count >= this.n && label !== "·" && label !== this.committed) {
      this.committed = label;
      fired = label;
    }
    return { count: Math.min(this.count, this.n), fired };
  }
}
