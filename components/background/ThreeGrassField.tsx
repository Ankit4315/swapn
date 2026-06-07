'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// --- THREE.JS 3D GRASS COMPONENT ---
// Hardware-accelerated WebGL Instancing + custom Shaders for
// tens of thousands of grass blades at 60fps.

interface ThreeGrassFieldProps {
  isForeground?: boolean;
}

const ThreeGrassField: React.FC<ThreeGrassFieldProps> = ({ isForeground = false }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // 1. Setup Scene & Camera
    const scene = new THREE.Scene();
    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    // Using identical camera settings for both layers to match perspective
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5);
    camera.lookAt(0, 0.5, 0);

    // 2. Setup Renderer (Transparent background)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    currentMount.appendChild(renderer.domElement);

    // 3. Grass Blade Geometry (Tapered Plane)
    const geometry = new THREE.PlaneGeometry(0.06, 1.5, 1, 4);
    geometry.translate(0, 0.75, 0); // Anchor rotation to the bottom of the blade

    // 4. Custom Wind Shader Material
    const material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isForeground ? 1.0 : 0.85
    });

    // Inject custom organic wind animation into standard Three.js shader
    material.onBeforeCompile = (shader) => {
      shader.uniforms.time = { value: 0 };
      material.userData.shader = shader;

      shader.vertexShader = `uniform float time;\n` + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        `#include <begin_vertex>`,
        `
        vec3 transformed = vec3( position );
        
        // Taper the grass blade to a point at the top
        transformed.x *= (1.0 - uv.y * 0.85);
        
        // Calculate world position to create rolling wind waves
        vec4 worldPos = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        
        // Organic wind algorithm (Reduced wave by another 50%)
        float windWave = sin(time * 2.5 + worldPos.x * 0.6 + worldPos.z * 0.8) * 0.04675;
        float windGust = sin(time * 1.2 + worldPos.x * 0.2) * 0.04675;
        
        // Bend more aggressively at the top (pow curve)
        float bend = pow(uv.y, 2.0);
        
        transformed.x += (windWave + windGust) * bend;
        transformed.z += (windWave * 0.5) * bend;
        `
      );
    };

    // 5. Instancing (Drawing thousands of blades in one single draw call)
    const count = isForeground ? 4500 : 3500;
    const mesh = new THREE.InstancedMesh(geometry, material, count);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    // Clearing parameters for both trees
    const treeCenterX = -13.0;
    const treeCenterZ = -4.0;
    const clearingRadius = 7.0;

    const tree2CenterX = 15.0;
    const tree2CenterZ = -14.0;
    const clearing2Radius = 4.0;

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 35;

      let z;
      if (isForeground) {
        z = Math.random() * 4;
      } else {
        z = (Math.random() * 14) - 15;
      }

      dummy.position.set(x, 0, z);
      dummy.rotation.y = Math.random() * Math.PI;

      const depthScale = (z + 15) / 19;
      const baseScaleY = (Math.random() * 0.5 + 0.5) * (depthScale * 0.8 + 0.5);

      // Clearing around primary left tree
      const distToTreeX = x - treeCenterX;
      const distToTreeZ = z - treeCenterZ;
      const distToTree = Math.sqrt(distToTreeX * distToTreeX + distToTreeZ * distToTreeZ);

      let treeHeightFactor = 1.0;
      if (distToTree < clearingRadius) {
        const normalizedDist = distToTree / clearingRadius;
        treeHeightFactor = 0.15 + Math.pow(normalizedDist, 2.0) * 0.85;
      }

      // Clearing around cherry blossom tree
      const distToTree2X = x - tree2CenterX;
      const distToTree2Z = z - tree2CenterZ;
      const distToTree2 = Math.sqrt(distToTree2X * distToTree2X + distToTree2Z * distToTree2Z);

      let tree2HeightFactor = 1.0;
      if (distToTree2 < clearing2Radius) {
        const normalizedDist2 = distToTree2 / clearing2Radius;
        tree2HeightFactor = 0.2 + Math.pow(normalizedDist2, 2.0) * 0.8;
      }

      // Organic winding path
      const t = Math.max(0, Math.min(1, (4.0 - z) / 8.0));
      const pathX = -13.0 * t + Math.sin(t * Math.PI) * -3.5;
      const distToPath = Math.abs(x - pathX);
      const pathWidth = 1.5 + (1.0 - t) * 4.5;

      let pathHeightFactor = 1.0;
      if (z > -6.0 && distToPath < pathWidth) {
        const normalizedPathDist = distToPath / pathWidth;
        pathHeightFactor = 0.05 + Math.pow(normalizedPathDist, 2.0) * 0.95;
      }

      const finalHeightFactor = Math.min(treeHeightFactor, tree2HeightFactor, pathHeightFactor);

      // Regional boost on the left side
      let regionalBoost = 1.0;
      if (x < 2.0) {
        const leftFactor = Math.min(Math.max((2.0 - x) / 19.5, 0.0), 1.0);
        regionalBoost = 1.0 + leftFactor * 1.5;
        if (isForeground) {
          regionalBoost *= 1.4;
        }
      }

      const foregroundAdjustment = isForeground ? 0.7 : 1.0;
      const scaleY = baseScaleY * 0.4 * finalHeightFactor * foregroundAdjustment * regionalBoost;
      const scaleX = (Math.random() * 0.5 + 0.8) * (finalHeightFactor * 0.4 + 0.6);
      dummy.scale.set(scaleX, scaleY, 1);

      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // Color based on depth
      if (isForeground) {
        const depthT = z / 4;
        const opacityBias = finalHeightFactor < 0.9 ? finalHeightFactor + 0.2 : 1.0;
        color.setHSL(0.85, 0.6, (0.15 - depthT * 0.12) * Math.min(opacityBias, 1.0));
      } else {
        const depthT = (z + 15) / 14;
        const opacityBias = finalHeightFactor < 0.9 ? finalHeightFactor + 0.3 : 1.0;
        color.setHSL(0.85 + Math.random() * 0.05, 0.8, (0.65 - depthT * 0.4) * Math.min(opacityBias, 1.0));
      }
      mesh.setColorAt(i, color);
    }

    scene.add(mesh);

    // 6. Animation Loop
    let animationFrameId: number | null = null;
    const startTime = performance.now();

    const animate = () => {
      if (material.userData.shader) {
        const elapsed = (performance.now() - startTime) / 1000;
        material.userData.shader.uniforms.time.value = elapsed;
      }
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // 7. Handle Resizing
    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      currentMount.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [isForeground]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        zIndex: isForeground ? 40 : 10,
        filter: isForeground
          ? 'drop-shadow(0px -2px 5px rgba(255, 20, 147, 0.25))'
          : 'drop-shadow(0px -5px 12px rgba(255, 105, 180, 0.65))'
      }}
    />
  );
};

export default React.memo(ThreeGrassField);
