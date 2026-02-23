// src/components/Galaxy.jsx
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;
uniform float uTime;
uniform vec3 uResolution;
uniform float uStarSpeed;
uniform float uHueShift;
uniform vec2 uMouse;
uniform bool uMouseRepulsion;
uniform float uGlowIntensity;

varying vec2 vUv;

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);
  vec2 gv = fract(uv) - 0.5; 
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + offset;
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      
      float flare = smoothstep(0.9, 1.0, size);
      vec3 base = hsv2rgb(vec3(fract(uHueShift/360.0 + seed*0.5), 0.8, 1.0));
      
      float d = length(gv - offset);
      float star = (0.01 + flare*0.05) / d;
      star *= smoothstep(1.0, 0.1, d);
      
      col += star * size * base;
    }
  }
  return col;
}

void main() {
  vec2 uv = (vUv * uResolution.xy) / uResolution.y;
  vec2 mouse = uMouse * uResolution.xy / uResolution.y;
  
  if (uMouseRepulsion) {
    float dist = length(uv - mouse);
    uv += normalize(uv - mouse) * (0.02 / (dist + 0.01));
  }

  vec3 col = vec3(0.0);
  for (float i = 0.0; i < 1.0; i += 0.2) {
    float depth = fract(i + uTime * 0.1 * uStarSpeed);
    float scale = mix(10.0, 0.5, depth);
    float fade = depth * smoothstep(1.0, 0.8, depth);
    col += StarLayer(uv * scale + i * 453.2) * fade;
  }
  
  gl_FragColor = vec4(col, 1.0);
}
`;

export default function Galaxy({
  starSpeed = 0.5,
  hueShift = 140,
  mouseRepulsion = true,
  glowIntensity = 0.3
}) {
  const ctnDom = useRef(null);
  const mousePos = useRef({ x: 0.5, y: 0.5 });
  const requestRef = useRef();

  useEffect(() => {
    if (!ctnDom.current) return;
    
    // STRICT MODE FIX: Clear any existing canvas before appending a new one
    ctnDom.current.innerHTML = '';

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Color(gl.canvas.width, gl.canvas.height, 1) },
        uStarSpeed: { value: starSpeed },
        uHueShift: { value: hueShift },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uMouseRepulsion: { value: mouseRepulsion },
        uGlowIntensity: { value: glowIntensity }
      }
    });

    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    function resize() {
      if(ctnDom.current) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        program.uniforms.uResolution.value = new Color(gl.canvas.width, gl.canvas.height, 1);
      }
    }
    window.addEventListener('resize', resize);
    resize();

    function update(t) {
      requestRef.current = requestAnimationFrame(update);
      program.uniforms.uTime.value = t * 0.001;
      
      program.uniforms.uMouse.value[0] += (mousePos.current.x - program.uniforms.uMouse.value[0]) * 0.05;
      program.uniforms.uMouse.value[1] += (mousePos.current.y - program.uniforms.uMouse.value[1]) * 0.05;
      
      renderer.render({ scene: mesh });
    }
    requestRef.current = requestAnimationFrame(update);
    ctnDom.current.appendChild(gl.canvas);

    function handleMove(e) {
      mousePos.current.x = e.clientX / window.innerWidth;
      mousePos.current.y = 1.0 - (e.clientY / window.innerHeight);
    }
    window.addEventListener('mousemove', handleMove);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (ctnDom.current && gl.canvas) ctnDom.current.innerHTML = '';
    };
  }, [starSpeed, hueShift, mouseRepulsion, glowIntensity]);

  return <div ref={ctnDom} style={{ width: '100vw', height: '100vh', display: 'block' }} />;
}