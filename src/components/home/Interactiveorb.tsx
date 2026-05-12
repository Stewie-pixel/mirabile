import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ReactiveOrb() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current!;

    let width = mount.clientWidth;
    let height = mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio, 2));

    renderer.setSize(width, height);

    renderer.setClearColor(0x000000, 0);

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure = 1.2;

    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      width / height,
      0.1,
      100
    );

    camera.position.set(0, 0, 9);

    const ambientLight = new THREE.AmbientLight(
      0x002222,
      0.25
    );

    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(
      0x00ffff,
      12,
      50
    );

    mainLight.position.set(0, 0, 10);

    scene.add(mainLight);

    const rimLight = new THREE.PointLight(
      0x004444,
      3,
      30
    );

    rimLight.position.set(-6, -3, -8);

    scene.add(rimLight);

    const mouseDir = new THREE.Vector3(0, 0, 1);

    const smoothMouseDir = new THREE.Vector3(
      0,
      0,
      1
    );

    const targetRotation = new THREE.Vector2(0, 0);

    const currentRotation = new THREE.Vector2(0, 0);

    const orbGroup = new THREE.Group();

    scene.add(orbGroup);

    // Store all bubble meshes
    const bubbles: THREE.Mesh[] = [];

    const ORB_RADIUS = 2.6;

    const BUBBLE_R = 0.265;

    const TOTAL = 320;

    const bubbleGeo = new THREE.SphereGeometry(
      BUBBLE_R,
      32,
      32
    );

    const baseMaterial =
      new THREE.MeshPhysicalMaterial({
        color: 0x055555,

        metalness: 0.2,

        roughness: 0.22,

        clearcoat: 1,

        clearcoatRoughness: 0.1,

        emissive: 0x000000,
      });

    const coreGeo = new THREE.SphereGeometry(
      1.9,
      64,
      64
    );

    const coreMat =
      new THREE.MeshPhysicalMaterial({
        color: 0x00ffff,

        transparent: true,

        opacity: 0.08,

        transmission: 1,

        roughness: 0,

        metalness: 0,

        ior: 1.5,
      });

    const core = new THREE.Mesh(
      coreGeo,
      coreMat
    );

    orbGroup.add(core);

    const phi =
      Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < TOTAL; i++) {
      const y =
        1 - (i / (TOTAL - 1)) * 2;

      const r = Math.sqrt(
        Math.max(0, 1 - y * y)
      );

      const theta = phi * i;

      // IMPORTANT:
      // unique material per sphere
      const material =
        baseMaterial.clone();

      const mesh = new THREE.Mesh(
        bubbleGeo,
        material
      );

      mesh.position.set(
        Math.cos(theta) * r * ORB_RADIUS,
        y * ORB_RADIUS,
        Math.sin(theta) * r * ORB_RADIUS
      );

      orbGroup.add(mesh);

      bubbles.push(mesh);
    }

    const INNER = 180;

    const INNER_R = ORB_RADIUS * 0.68;

    const innerGeo = new THREE.SphereGeometry(
      BUBBLE_R * 0.82,
      32,
      32
    );

    for (let i = 0; i < INNER; i++) {
      const y =
        1 - (i / (INNER - 1)) * 2;

      const r = Math.sqrt(
        Math.max(0, 1 - y * y)
      );

      const theta = phi * i + 1.2;

      const material =
        baseMaterial.clone();

      const mesh = new THREE.Mesh(
        innerGeo,
        material
      );

      mesh.position.set(
        Math.cos(theta) * r * INNER_R,
        y * INNER_R,
        Math.sin(theta) * r * INNER_R
      );

      orbGroup.add(mesh);

      bubbles.push(mesh);
    }

    const ringMat =
      new THREE.MeshBasicMaterial({
        color: 0x00aaaa,

        transparent: true,

        opacity: 0.15,

        side: THREE.BackSide,
      });

    const ringGeo = new THREE.SphereGeometry(
      BUBBLE_R * 1.22,
      16,
      16
    );

    for (let i = 0; i < TOTAL; i++) {
      const y =
        1 - (i / (TOTAL - 1)) * 2;

      const r = Math.sqrt(
        Math.max(0, 1 - y * y)
      );

      const theta = phi * i;

      const ring = new THREE.Mesh(
        ringGeo,
        ringMat
      );

      ring.position.set(
        Math.cos(theta) * r * ORB_RADIUS,
        y * ORB_RADIUS,
        Math.sin(theta) * r * ORB_RADIUS
      );

      orbGroup.add(ring);
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect =
        renderer.domElement.getBoundingClientRect();

      const nx =
        ((e.clientX - rect.left) / rect.width) *
          2 -
        1;

      const ny =
        -(
          (e.clientY - rect.top) /
          rect.height
        ) *
          2 +
        1;

      // Orb rotation
      targetRotation.x = ny * 0.55;

      targetRotation.y = nx * 0.55;

      // Direction for energy sweep
      mouseDir.set(nx, ny, 1).normalize();
    };

    renderer.domElement.addEventListener(
      "mousemove",
      onMouseMove
    );

    const onResize = () => {
      width = mount.clientWidth;

      height = mount.clientHeight;

      camera.aspect = width / height;

      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    globalThis.addEventListener("resize", onResize);

    const clock = new THREE.Clock();

    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      currentRotation.x +=
        (targetRotation.x -
          currentRotation.x) *
        0.06;

      currentRotation.y +=
        (targetRotation.y -
          currentRotation.y) *
        0.06;

      orbGroup.rotation.x =
        currentRotation.x;

      orbGroup.rotation.y =
        currentRotation.y +
        elapsed * 0.18;

      const breathe =
        1 +
        Math.sin(elapsed * 0.8) *
          0.012;

      orbGroup.scale.setScalar(breathe);

      smoothMouseDir.lerp(mouseDir, 0.12);

      for (const bubble of bubbles) {
        const dir =
          bubble.position
            .clone()
            .normalize();

        // Surface alignment
        const alignment =
          dir.dot(smoothMouseDir);

        // Sharper sweep band
        const glow = Math.pow(
          Math.max(0, alignment),
          3
        );

        const material =
          bubble.material as THREE.MeshPhysicalMaterial;

        // Reactive emissive wave
        material.emissive.setRGB(
          0,
          glow * 0.75,
          glow
        );

        material.emissiveIntensity =
          0.15 + glow * 2.5;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);

      globalThis.removeEventListener(
        "resize",
        onResize
      );

      renderer.domElement.removeEventListener(
        "mousemove",
        onMouseMove
      );

      bubbleGeo.dispose();

      innerGeo.dispose();

      ringGeo.dispose();

      ringMat.dispose();

      coreGeo.dispose();

      coreMat.dispose();

      baseMaterial.dispose();

      renderer.dispose();

      if (
        mount.contains(renderer.domElement)
      ) {
        mount.removeChild(
          renderer.domElement
        );
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
        cursor: "crosshair",
      }}
    >
      <div
        ref={mountRef}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          inset: 0,
        }}
      />
    </div>
  );
}