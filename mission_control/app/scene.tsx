"use client";

import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as THREE from "three";
import React, { useRef, useEffect, RefObject, useState } from "react";
import { Orientation } from "@/lib/types";

const WIDTH = 360;
const HEIGHT = 300;

function ThreeScene({
  orientationRef,
}: {
  orientationRef: RefObject<Orientation>;
}) {
  const containerRef = useRef<HTMLCanvasElement>(null);
  const [localOrientation, setLocalOrientation] = useState<Orientation>({
    gyroX: 0,
    gyroY: 0,
    gyroZ: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!containerRef.current) return;

    let renderer = new THREE.WebGLRenderer({
      canvas: containerRef.current,
      antialias: true,
    });

    renderer.setSize(WIDTH, HEIGHT);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xffffff, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();

    let camera: THREE.Camera;
    let controls: OrbitControls;

    // Load the GLTF model

    const loader = new GLTFLoader();
    loader.load("can.glb", (gltf) => {
      retrieveListOfCameras(gltf);
      const axesHelper = new THREE.AxesHelper(5);
      scene.add(axesHelper);
      scene.add(gltf.scene);
      controls = new OrbitControls(camera, renderer.domElement);
      camera.position.set(0, 0, 10);
      controls.update();
      animate();
    });

    function retrieveListOfCameras(scene: GLTF) {
      camera = scene.cameras[0];
      updateCameraAspect(camera);
    }

    function updateCameraAspect(camera: any) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function animate() {
      if (!orientationRef.current) return;
      let { gyroX, gyroY, gyroZ } = orientationRef.current;
      setLocalOrientation({ gyroX, gyroY, gyroZ });
      scene.children[1].children[0].rotation.set(gyroX, gyroY, gyroZ);
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
  }, []);

  return (
    <>
      <div className="select-none p-4">
        <p>Gyro X: {localOrientation.gyroX}</p>
        <p>Gyro Y: {localOrientation.gyroY}</p>
        <p>Gyro Z: {localOrientation.gyroZ}</p>
      </div>
      <canvas ref={containerRef} width={WIDTH} height={HEIGHT} />
    </>
  );
}

export default ThreeScene;
