"use client";

import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as THREE from "three";
import React, { useRef, useEffect, RefObject, useState } from "react";
import { Orientation } from "@/lib/types";

const WIDTH = 723;
const HEIGHT = 410;

function ThreeScene({
  orientationRef,
}: {
  orientationRef: RefObject<Orientation>;
}) {
  const containerRef = useRef<HTMLCanvasElement>(null);
  const [localOrientation, setLocalOrientation] = useState<Orientation>({
    yaw: 0,
    pitch: 0,
    roll: 0,
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
      let { yaw, pitch, roll } = orientationRef.current;
      setLocalOrientation({ yaw, pitch, roll });
      yaw = (yaw * Math.PI) / 180;
      pitch = (pitch * Math.PI) / 180;
      roll = (roll * Math.PI) / 180;
      scene.children[1].children[0].rotation.set(pitch, yaw, roll);
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
  }, []);

  return (
    <>
      <div className="absolute p-2">{`Yaw: ${localOrientation.yaw}, Pitch: ${localOrientation.pitch}, Roll: ${localOrientation.roll}`}</div>
      <canvas
        ref={containerRef}
        width={WIDTH}
        height={HEIGHT}
        style={{ width: "100%", height: "100%" }}
      />
    </>
  );
}

export default ThreeScene;
