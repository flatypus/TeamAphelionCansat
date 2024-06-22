"use client";

import { GLTF, GLTFLoader, RGBELoader } from "three/examples/jsm/Addons.js";
import { Show } from "./Show";
import * as THREE from "three";
import React, { useRef, useEffect, useState } from "react";
import { Rocket } from "./Rocket";

const ANIMATION_BOUND = 20400;

function ThreeScene() {
  const [hide, setHide] = useState(false);
  const [readyBackground, setReadyBackground] = useState(false);
  const [readyModel, setReadyModel] = useState(false);
  const containerRef = useRef<HTMLCanvasElement>(null);
  const scrollTotalAmount = useRef(0);
  const [scrollState, setScrollState] = useState(0);

  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      if (!readyBackground || !readyModel) return;

      scrollTotalAmount.current += event.deltaY;

      if (scrollTotalAmount.current > 200) {
        setHide(true);
      } else {
        setHide(false);
      }

      if (scrollTotalAmount.current < 0) {
        scrollTotalAmount.current = 0;
      }

      if (scrollTotalAmount.current > ANIMATION_BOUND) {
        scrollTotalAmount.current = ANIMATION_BOUND;
      }

      setScrollState(scrollTotalAmount.current);
    };
    window.addEventListener("wheel", handleScroll);
  }, [readyBackground, readyModel]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!containerRef.current) return;

    let renderer = new THREE.WebGLRenderer({
      canvas: containerRef.current,
      antialias: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();

    const background = "hill.hdr";
    let generator = new THREE.PMREMGenerator(renderer);

    new RGBELoader().load(background, (hdrmap) => {
      let envmap = generator.fromEquirectangular(hdrmap);
      scene.background = envmap.texture;
      setReadyBackground(true);
    });

    let camera: THREE.Camera;
    let mixer = new THREE.AnimationMixer(scene);

    // Load the GLTF model

    const loader = new GLTFLoader();
    loader.load("cansat.glb", (gltf) => {
      retrieveListOfCameras(gltf);
      console.log(gltf);
      scene.add(gltf.scene);
      const animationAction = mixer.clipAction(gltf.animations[0]);

      setReadyModel(true);
      animationAction.play();
    });

    function retrieveListOfCameras(scene: GLTF) {
      console.log(scene.cameras);
      camera = scene.cameras[0];
      updateCameraAspect(camera);
      animate();
    }

    function updateCameraAspect(camera: any) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function animate() {
      requestAnimationFrame(animate);
      mixer.setTime(scrollTotalAmount.current / 1000);
      renderer.render(scene, camera);
    }
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <div
        className="absolute left-0 top-0 z-[100] h-full w-full bg-blue-400 transition-all duration-500"
        style={{ opacity: readyBackground && readyModel ? 0 : 1 }}
      >
        <Rocket />
      </div>
      <Show
        title="About CanSat"
        description={
          <div className="flex flex-col gap-y-4">
            <div>
              The Canadian CanSat design challenge is a competition where teams
              are tasked with building a soda can-sized satellite to perform
              scientific missions. The cans are launched in high-power model
              rockets to an altitude of approximately 1 km at the launch
              campaign in Alberta.
            </div>
            <div>
              All teams are required to perform a common primary mission, to
              gather air pressure and temperature data, and a secondary mission
              of their choosing. The winning team will represent Canada at the
              European Space Agency’s International CanSat event, held in the
              Netherlands.
            </div>
          </div>
        }
        top={5}
        left={64}
        start={-1}
        end={7000}
        scrollAmount={scrollState}
      />
      <Show
        title={"Our Team - Team Aphelion"}
        description={
          <div className="flex flex-col gap-y-4">
            <span className="text-center text-sm text-[#ffffffb6]">
              Jason Huang, Hinson Chan, John Xu, Tristan Yan-Klassen, Anthony
              Lu, Mendel Reiseberg
            </span>
            <h2 className="text-2xl font-semibold">Primary Mission:</h2>
            <p className="font-light">
              Atmospheric temperature: accurately measure and analyze
              temperature data to gain insight into temperature variations at
              different altitudes
            </p>
            <p className="font-light">
              Atmospheric pressure: accurately measure and analyze pressure data
              to gain insight into pressure variations at different altitudes
            </p>
          </div>
        }
        top={5}
        width={600}
        left={5}
        start={7000}
        end={13000}
        scrollAmount={scrollState}
      />
      <Show
        title={
          <h2 className="text-left text-2xl font-semibold">
            Secondary Mission:
          </h2>
        }
        description={
          <div className="flex flex-col gap-y-4">
            <p className="font-light">
              For our secondary mission, we intend to test a soil sample for the
              presence of amino acids, the building blocks of proteins and a
              fundamental component of life. To achieve both this objective and
              the primary mission, we will need to complete the following
              mission objectives:
            </p>
            <p className="font-light">
              - Transmit pressure, temperature, and position data from the
              CanSat to our ground station while under controlled descent.
            </p>
            <p className="font-light">
              - Land the CanSat in the correct horizontal orientation.
            </p>
            <p className="font-light">
              - Successfully drill a soil sample and bring it onboard.
            </p>
            <p className="font-light">
              - Using an onboard ninhydrin solution, test the sample for the
              presence of amino acids.
            </p>
            <p className="font-light">
              - Analyze the results of the test and determine if amino acids are
              present in the sample.
            </p>
            <p className="font-light">
              Our mission is a proof of concept for the testing of other planets
              for the possible existence of alien life. Although we only perform
              a singular test on the soil sample, this could be adjusted to
              accommodate for alternative tests, such as for soil composition or
              pH.
            </p>
          </div>
        }
        top={5}
        left={5}
        start={13000}
        end={22000}
        scrollAmount={scrollState}
        width={800}
      />
      {/* <div className="absolute left-0 top-0">{scrollState}</div> */}
      <div
        className="absolute grid w-full animate-bounce place-items-center text-center transition-all"
        style={{ top: hide ? "-100px" : "10px" }}
      >
        <div className="rounded-xl bg-[#00000044] p-4 shadow-lg">
          Scroll Down!
        </div>
      </div>
      <canvas className="fixed" ref={containerRef} />
    </div>
  );
}

export default ThreeScene;
