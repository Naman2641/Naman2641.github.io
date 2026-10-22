// Swirl background shaders — curl-noise flow-field in B&W
// Used in the About section for a "falling into night" effect

export const swirlVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const swirlFragmentShader = /* glsl */ `
  precision mediump float;

  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uScrollVelocity;
  uniform vec2 uResolution;

  varying vec2 vUv;

  // Simplex-like noise helpers
  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x_ = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x_) - 0.5;
    vec3 ox = floor(x_ + 0.5);
    vec3 a0 = x_ - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float f = 0.0;
    float amp = 0.5;
    for(int i = 0; i < 5; i++) {
      f += amp * snoise(p);
      p *= 2.1;
      amp *= 0.5;
    }
    return f;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

    // Mouse influence
    vec2 mouse = (uMouse - 0.5) * vec2(aspect, 1.0);
    float mouseDist = length(p - mouse);
    float mouseInfluence = smoothstep(0.8, 0.0, mouseDist) * 0.3;

    // Scroll velocity influence
    float scrollEffect = abs(uScrollVelocity) * 0.002;

    // Curl noise flow
    float t = uTime * 0.15;
    vec2 q = vec2(fbm(p + t * 0.4), fbm(p + vec2(5.2, 1.3) + t * 0.3));
    vec2 r = vec2(
      fbm(p + 4.0 * q + vec2(1.7, 9.2) + t * 0.25 + mouseInfluence),
      fbm(p + 4.0 * q + vec2(8.3, 2.8) + t * 0.2 + scrollEffect)
    );

    float f = fbm(p + 3.5 * r);

    // Starry Night-like swirling pattern
    float pattern = (f + 0.6 * snoise(p * 2.0 + t * 0.1)) * 0.5 + 0.5;
    pattern = smoothstep(0.1, 0.9, pattern);

    // Add some bright swirl highlights
    float highlight = smoothstep(0.65, 0.95, pattern);

    vec3 col = mix(vec3(0.02, 0.02, 0.025), vec3(0.12, 0.12, 0.13), pattern);
    col += highlight * 0.15;
    col += mouseInfluence * 0.08;

    gl_FragColor = vec4(col, 1.0);
  }
`;

// -------------------------------------------------------
// Card texture shader (animated grain / scanlines)
// -------------------------------------------------------
export const cardGrainVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const cardGrainFragmentShader = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  uniform float uHover;
  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  void main() {
    vec2 uv = vUv;

    // Base dark colour
    vec3 col = vec3(0.06, 0.06, 0.065);

    // Subtle scanlines
    float scanline = sin(uv.y * 400.0 + uTime * 2.0) * 0.015;
    col += scanline;

    // Film grain
    float grain = random(uv * vec2(uTime * 0.1, uTime * 0.07)) * 0.06;
    col += grain;

    // Hover light sweep
    float sweep = smoothstep(0.0, 1.0, uHover) *
                  smoothstep(1.0, 0.0, abs(uv.x - fract(uTime * 0.3))) * 0.12;
    col += sweep;

    gl_FragColor = vec4(col, 1.0);
  }
`;
