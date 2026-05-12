import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ReactiveOrb() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    let width = mount.clientWidth;
    let height = mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 9);

    const ambientLight = new THREE.AmbientLight(0x001a1a, 1.0);
    scene.add(ambientLight);

    const frontLight = new THREE.PointLight(0x00c8b4, 6, 22);
    frontLight.position.set(0, 0, 6);
    frontLight.castShadow = true;
    scene.add(frontLight);

    const fillLight = new THREE.PointLight(0x006655, 3, 25);
    fillLight.position.set(3, 2, 4);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x003344, 2, 20);
    rimLight.position.set(-2, -1, -5);
    scene.add(rimLight);

    let isHovered = false;
    let lightIntensityTarget = 6;

    // These hold the WORLD-SPACE light target position set by mouse
    const lightTarget = new THREE.Vector3(0, 0, 6);

    const targetRotation = new THREE.Vector2(0, 0);
    const currentRotation = new THREE.Vector2(0, 0);

    const onMouseMove = (e: MouseEvent) => {
      // Always recalculate from canvas bounding rect so coords are exact
      const rect = renderer.domElement.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Tilt the orb toward cursor
      targetRotation.x = ny * 0.55;
      targetRotation.y = nx * 0.55;

      // Move the key light in world space so the bright spot follows the cursor
      // Map NDC [-1,1] to a small world-space offset in front of the orb
      lightTarget.set(nx * 3.5, ny * 3.5, 6);
    };

    const onMouseEnter = () => {
      isHovered = true;
      lightIntensityTarget = 12; // boost on hover
    };

    const onMouseLeave = () => {
      isHovered = false;
      lightIntensityTarget = 6;
      targetRotation.set(0, 0);
      lightTarget.set(0, 0, 6); // reset light to centre
    };

    // Attach to the canvas so rect is always accurate
    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("mouseenter", onMouseEnter);
    renderer.domElement.addEventListener("mouseleave", onMouseLeave);

    const orbGroup = new THREE.Group();
    scene.add(orbGroup);

    const ORB_RADIUS = 2.6; // slightly smaller to sit nicely in the right panel
    const BUBBLE_R   = 0.265;
    const TOTAL      = 320;

    const bubbleGeo = new THREE.SphereGeometry(BUBBLE_R, 32, 32);
    const bubbleMat = new THREE.MeshStandardMaterial({
      color:     new THREE.Color(0x003333),
      emissive:  new THREE.Color(0x001111),
      metalness: 0.3,
      roughness: 0.35,
    });

    const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle

    // Outer shell
    for (let i = 0; i < TOTAL; i++) {
      const y = 1 - (i / (TOTAL - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = phi * i;
      const mesh = new THREE.Mesh(bubbleGeo, bubbleMat);
      mesh.position.set(Math.cos(theta) * r * ORB_RADIUS, y * ORB_RADIUS, Math.sin(theta) * r * ORB_RADIUS);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      orbGroup.add(mesh);
    }

    const INNER    = 180;
    const INNER_R  = ORB_RADIUS * 0.68;
    const innerGeo = new THREE.SphereGeometry(BUBBLE_R * 0.82, 32, 32);

    for (let i = 0; i < INNER; i++) {
      const y = 1 - (i / (INNER - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = phi * i + 1.2;
      const mesh = new THREE.Mesh(innerGeo, bubbleMat);
      mesh.position.set(Math.cos(theta) * r * INNER_R, y * INNER_R, Math.sin(theta) * r * INNER_R);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      orbGroup.add(mesh);
    }

    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x005555,
      transparent: true,
      opacity: 0.4,
      side: THREE.BackSide,
    });
    const ringGeo = new THREE.SphereGeometry(BUBBLE_R * 1.22, 16, 16);

    for (let i = 0; i < TOTAL; i++) {
      const y = 1 - (i / (TOTAL - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = phi * i;
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(Math.cos(theta) * r * ORB_RADIUS, y * ORB_RADIUS, Math.sin(theta) * r * ORB_RADIUS);
      orbGroup.add(ring);
    }

    const onResize = () => {
      width  = mount.clientWidth;
      height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    globalThis.addEventListener("resize", onResize);

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth rotation lerp
      currentRotation.x += (targetRotation.x - currentRotation.x) * 0.06;
      currentRotation.y += (targetRotation.y - currentRotation.y) * 0.06;
      orbGroup.rotation.x = currentRotation.x;
      orbGroup.rotation.y = currentRotation.y + elapsed * 0.08;

      // Breathing pulse
      const breathe = 1 + Math.sin(elapsed * 0.8) * 0.012;
      orbGroup.scale.setScalar(breathe);

      // Smooth light intensity
      frontLight.intensity += (lightIntensityTarget - frontLight.intensity) * 0.08;

      // Smooth light position — lerp toward target
      frontLight.position.lerp(lightTarget, 0.08);

      // When not hovered, drift the light in a gentle orbit
      if (!isHovered) {
        lightTarget.x = Math.sin(elapsed * 0.4) * 2;
        lightTarget.y = Math.cos(elapsed * 0.3) * 1.5;
        lightTarget.z = 6;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      globalThis.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("mouseenter", onMouseEnter);
      renderer.domElement.removeEventListener("mouseleave", onMouseLeave);
      renderer.dispose();
      bubbleGeo.dispose();
      bubbleMat.dispose();
      innerGeo.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "480px",
        aspectRatio: "1 / 1",
        position: "relative",
      }}
    >
      <div
        ref={mountRef}
        style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
      />
    </div>
  );
}