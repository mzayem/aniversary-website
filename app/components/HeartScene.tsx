"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { HEART_PATH } from "./heartPath";

// Traces the same silhouette as HEART_PATH (heartPath.ts) so the 3D hero
// heart, the flat bullet icons and the click-burst hearts all match.
function buildHeartGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(50, 88);
  shape.bezierCurveTo(22, 68, 6, 50, 6, 32);
  shape.bezierCurveTo(6, 18, 17, 8, 30, 8);
  shape.bezierCurveTo(39, 8, 46, 13, 50, 20);
  shape.bezierCurveTo(54, 13, 61, 8, 70, 8);
  shape.bezierCurveTo(83, 8, 94, 18, 94, 32);
  shape.bezierCurveTo(94, 50, 78, 68, 50, 88);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 26,
    bevelEnabled: true,
    bevelThickness: 6,
    bevelSize: 4,
    bevelSegments: 6,
    curveSegments: 48,
  });
  geometry.center();
  geometry.rotateX(Math.PI);
  geometry.scale(0.028, 0.028, 0.028);
  return geometry;
}

// Same heart silhouette as the hero mesh and bullet icons, rendered as a
// soft glowing sprite so the drifting background particles read as tiny
// hearts rather than plain dots.
function makeHeartSprite() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.translate(size * 0.03, size * 0.05);
  const scale = (size * 0.94) / 100;
  ctx.scale(scale, scale);
  const path = new Path2D(HEART_PATH);
  ctx.shadowColor = "rgba(255,255,255,0.95)";
  ctx.shadowBlur = 9;
  ctx.fillStyle = "#ffffff";
  ctx.fill(path);
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

const PARTICLE_COUNT_DESKTOP = 150;
const PARTICLE_COUNT_MOBILE = 70;

export default function HeartScene() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmall = window.innerWidth < 720;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.6 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 11);

    // heart mesh
    const heartGeo = buildHeartGeometry();
    const heartMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#f0577c"),
      emissive: new THREE.Color("#b8264a"),
      emissiveIntensity: 0.55,
      metalness: 0.2,
      roughness: 0.32,
      clearcoat: 0.7,
      clearcoatRoughness: 0.25,
    });
    const heart = new THREE.Mesh(heartGeo, heartMat);
    const heartGroup = new THREE.Group();
    heartGroup.add(heart);
    heartGroup.rotation.x = 0.15;
    scene.add(heartGroup);

    // lights
    scene.add(new THREE.AmbientLight("#3a2440", 1.4));
    const goldLight = new THREE.PointLight("#f0b93e", 60, 30);
    goldLight.position.set(4, 3, 6);
    scene.add(goldLight);
    const roseLight = new THREE.PointLight("#f0577c", 40, 30);
    roseLight.position.set(-4, -2, 4);
    scene.add(roseLight);
    const rim = new THREE.DirectionalLight("#fff6ec", 0.6);
    rim.position.set(0, 4, -5);
    scene.add(rim);

    // drifting heart particles — mostly rose, some gold, matching the burst hearts
    const count = isSmall ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);
    const roseColor = new THREE.Color("#f0577c");
    const goldColor = new THREE.Color("#f0b93e");
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
      speeds[i] = 0.25 + Math.random() * 0.55;
      phases[i] = Math.random() * Math.PI * 2;
      const c = Math.random() > 0.62 ? goldColor : roseColor;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.42,
      map: makeHeartSprite(),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      opacity: 0.5,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    let raf = 0;
    let scrollProgress = 0;
    let targetProgress = 0;
    const clock = new THREE.Clock();
    let visible = true;

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      targetProgress = max > 0 ? window.scrollY / max : 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    const onVisibility = () => {
      visible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    function render() {
      raf = requestAnimationFrame(render);
      if (!visible) return;
      const t = clock.getElapsedTime();

      scrollProgress += (targetProgress - scrollProgress) * (reduced ? 1 : 0.06);

      if (!reduced) {
        heartGroup.rotation.y = t * 0.35;
        heartGroup.rotation.x = 0.15 + Math.sin(t * 0.5) * 0.05 + scrollProgress * 0.4;
        heartGroup.position.y =
          THREE.MathUtils.lerp(0.4, -2.4, Math.min(scrollProgress * 1.4, 1)) +
          Math.sin(t * 0.6) * 0.08;

        const heroScale = THREE.MathUtils.lerp(
          1,
          0.6,
          Math.min(scrollProgress * 2.2, 1)
        );
        const finaleBoost =
          scrollProgress > 0.82
            ? THREE.MathUtils.smoothstep(scrollProgress, 0.82, 1) * 0.75
            : 0;
        const scale = heroScale + finaleBoost;
        heartGroup.scale.setScalar(scale);
        heartMat.emissiveIntensity = 0.5 + finaleBoost * 0.6;

        const pos = particleGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < count; i++) {
          const idx = i * 3;
          pos.array[idx + 1] += speeds[i] * 0.004;
          pos.array[idx] += Math.sin(t * 0.4 + phases[i]) * 0.0018;
          if (pos.array[idx + 1] > 7.5) pos.array[idx + 1] = -7.5;
        }
        pos.needsUpdate = true;
        particles.rotation.y = t * 0.02;
      }

      renderer.render(scene, camera);
    }
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      heartGeo.dispose();
      heartMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      particleMat.map?.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div className="scene" ref={hostRef} aria-hidden="true" />;
}
