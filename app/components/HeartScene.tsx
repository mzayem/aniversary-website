"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

function buildHeartGeometry() {
  const x = 0;
  const y = 0;
  const shape = new THREE.Shape();
  shape.moveTo(x + 5, y + 5);
  shape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
  shape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
  shape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
  shape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
  shape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
  shape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 5,
    bevelEnabled: true,
    bevelThickness: 1.4,
    bevelSize: 1,
    bevelSegments: 6,
    curveSegments: 24,
  });
  geometry.center();
  geometry.rotateX(Math.PI);
  geometry.scale(0.11, 0.11, 0.11);
  return geometry;
}

function makeGlowSprite() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.55)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
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

    // drifting particles
    const count = isSmall ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
      speeds[i] = 0.25 + Math.random() * 0.55;
      phases[i] = Math.random() * Math.PI * 2;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.32,
      map: makeGlowSprite(),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: new THREE.Color("#f0b93e"),
      opacity: 0.75,
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
