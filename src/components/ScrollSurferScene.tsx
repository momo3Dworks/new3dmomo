
"use client";

import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { AfterimagePass } from '@/lib/three/postprocessing/AfterimagePass.js';
import { CopyShader } from '@/lib/three/shaders/CopyShader.js';


import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import LottieAnimation from '@/components/LottieAnimation';
import TechHudOverlay from '@/components/TechHudOverlay';
import PlanetInfoBox from '@/components/PlanetInfoBox';
import StationInfoBox from '@/components/StationInfoBox';
import SpeedometerHUD from '@/components/SpeedometerHUD';
import { useGlitch } from 'react-powerglitch';



// Spaceship mouse interaction parameters
const mouseFollowSpeed = 0.07;
const shipRotationFactor = 0.4;
const shipMaxTilt = Math.PI / 9;
const parallaxFactorX = 6;
const parallaxFactorY = 3;

const SHIP_INTRO_Z_OFFSET = 30.0;
const SHIP_INTRO_Y_OFFSET_BELOW = 10.0;
const SHIP_INTRO_ANIMATION_SPEED = 0.025;
const SPACESHIP_FIXED_EMISSIVE_INTENSITY = 100.0;


// Horizon Particle Parameters
const NUM_HORIZON_PARTICLES = 600;
const HORIZON_PARTICLE_SPEED_MIN = 35.0;
const HORIZON_PARTICLE_SPEED_MAX = 60.0;
const HORIZON_PARTICLE_BASE_SIZE = 0.25;
const HORIZON_PARTICLE_COLOR = 0xffffff;
const HORIZON_SPAWN_Z_DISTANCE = 600;
const HORIZON_SPAWN_XY_RANGE = 70;
const HORIZON_DESPAWN_Z_OFFSET = -10;


// Bloom Parameters
const bloomParams = {
  threshold: 0.6,
  strength: 0.3,
  radius: 0.35,
};

// Planet1 Parameters
const PLANET1_MODEL_PATH = '/models/PLANET1.glb';
const PLANET1_INITIAL_Z = -1000;
const PLANET1_TRAVEL_DISTANCE = -6000;
const INITIAL_PLANET1_CORE_EMISSIVE_INTENSITY = 1.0;
const INITIAL_PLANET1_CLOUDS_EMISSIVE_INTENSITY = 1.0;
const PLANET1_EMITTER_SIZE = 0.05;
const PLANET1_EMITTER_INTENSITY = 30.0;
const PLANET1_EMITTER_LOCAL_OFFSET = new THREE.Vector3(0.5, 0, 1);


// SpaceStation1 Parameters
const SPACE_STATION1_MODEL_PATH = '/models/SPACE_STATION1.glb';
const SPACE_STATION1_INITIAL_Z = -1300;
const SPACE_STATION1_TRAVEL_DISTANCE = -5000;
const INITIAL_SPACE_STATION1_EMISSIVE_INTENSITY = 8.0;
const SPACE_STATION1_EMITTER_SIZE = 0.05;
const SPACE_STATION1_EMITTER_INTENSITY = 30.0;
const SPACE_STATION1_EMITTER_LOCAL_OFFSET = new THREE.Vector3(-0.5, 0, 1);


// Object Lerp Speed
const OBJECT_LERP_SPEED = 0.03;


// Spaceship Acceleration Effect Parameters
const FORWARD_BOOST_AMOUNT = 20.0;
const ACCELERATION_EFFECT_LERP_SPEED = 0.1;
const SCROLL_DIRECTION_FOR_EFFECTS: "up" | "down" | "any" = "down";
const SCROLL_TIMEOUT_DURATION_EFFECTS = 150; // ms

// Camera FOV Acceleration Effect Parameters
const BOOST_CAMERA_FOV_ADDITION = 20.0;
const CAMERA_FOV_LERP_SPEED = 0.08;

// Motion Blur Parameters
const MOTION_BLUR_DAMP_NORMAL = 0.0; // No blur
const MOTION_BLUR_DAMP_BOOST = 0.92; // Higher value = more blur (0.0 to < 1.0)
const MOTION_BLUR_LERP_SPEED = 0.1;


// Camera Shake Parameters
const CAMERA_SHAKE_INTENSITY_BOOST = 0.15; // Max displacement during boost
const CAMERA_SHAKE_INTENSITY_NORMAL = 0.0; // No shake when idle
const CAMERA_SHAKE_LERP_SPEED = 0.1;
const CAMERA_SHAKE_FREQUENCY = 20; // Oscillations per second


// HDRI Rotation Speed
const HDRI_ROTATION_SPEED = 0.0;

// Depth of Field (Bokeh) Parameters
const DOF_APERTURE = 0.00002;
const DOF_MAXBLUR = 0.004; // Base blur

// InfoBox
const INFO_BOX_MAX_DISTANCE = 150.0;

// Camera state values (initial position)
const cameraInitialPosX = 0;
const cameraInitialPosY = 0;
const cameraInitialPosZ = 7;
const cameraInitialRotX = 0;
const cameraInitialRotY = 0;
const cameraInitialRotZ = 0;
const cameraInitialFov = 70; // Base FOV

// Spaceship state values (offsets from camera, and base rotation/scale)
const shipInitialCameraOffsetX = 0;
const shipInitialCameraOffsetY = -3;
const shipInitialCameraOffsetZ = -17;
const shipInitialRotX = 0;
const shipInitialRotY = Math.PI;
const shipInitialRotZ = 0;
const shipInitialScale = 0.45;

// Wormhole state values
const wormholeInitialPosX = 0;
const wormholeInitialPosY = 0;
const wormholeInitialPosZ = 1000;
const wormholeInitialRotX = 0;
const wormholeInitialRotY = 0;
const wormholeInitialRotZ = 0;
const wormholeInitialScale = 10;

// PLANET1 state values
const planet1InitialPosX = -20;
const planet1InitialPosY = 0;
const planet1InitialRotX = 0;
const planet1InitialRotY = 0;
const planet1InitialRotZ = 0;
const planet1InitialScale = 12;

// SPACE_STATION1 state values
const spaceStation1InitialPosX = 20;
const spaceStation1InitialPosY = 0;
const spaceStation1InitialRotX = 0;
const spaceStation1InitialRotY = 0;
const spaceStation1InitialRotZ = 0;
const spaceStation1InitialScale = 12;


// Wormhole material animation
const wormhole1EmissiveIntensity = 80.0;
const wormhole1OffsetXSpeed = 0.03;
const wormhole1OffsetYSpeed = -0.1;
const wormhole2EmissiveIntensity = 60.0;
const wormhole2OffsetXSpeed = 0.02;
const wormhole2OffsetYSpeed = -0.07;

// Projection Lines
const NUM_PROJECTION_LINES = 8;
const PROJECTION_LINE_COLOR = 0x90D5FF;
const PROJECTION_LINE_OPACITY_LERP_SPEED = 0.1;
const PROJECTION_LINE_BASE_TARGET_OPACITY = 0.7;
const PROJECTION_LINE_OPACITY_FLICKER_AMOUNT = 0.4;
const PROJECTION_LINE_ENDPOINT_GLITCH_NDC_AMOUNT = 0.015;

// Scene Change
const SCENE_CHANGE_SCROLL_THRESHOLD = 0.35;

// Transition Parameters
const TRANSITION_FOV_NARROW = 20;
const TRANSITION_FOV_NORMAL = cameraInitialFov;
const TRANSITION_BLUR_HIGH = 0.02;
const TRANSITION_BLUR_NORMAL = DOF_MAXBLUR;
const TRANSITION_LERP_SPEED = 0.05;

// Speedometer Parameters
const SPEEDOMETER_INITIAL_SPEED = 0;
const SPEEDOMETER_CRUISING_SPEED = 150;
const SPEEDOMETER_BOOST_SPEED = 250;
const SPEEDOMETER_MAX_GAUGE_SPEED = 280;
const SPEEDOMETER_LERP_SPEED = 0.07;

// OCEAN.glb model parameters
const OCEAN_GLB_MODEL_PATH = '/models/OCEAN.glb';
const OCEAN_GLB_INITIAL_Y_OFFSET = -8;
const OCEAN_GLB_SCALE = 10;
const OCEAN_MODEL_TEXTURE_OFFSET_X_SPEED = 0.0;
const OCEAN_MODEL_TEXTURE_OFFSET_Y_SPEED = -0.08;


const ScrollSurferScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const spaceshipRef = useRef<THREE.Group | null>(null);
  const wormholeRef = useRef<THREE.Group | null>(null);
  const planet1Ref = useRef<THREE.Group | null>(null);
  const spaceStation1Ref = useRef<THREE.Group | null>(null);
  const oceanModelRef = useRef<THREE.Group | null>(null);
  const oceanModelTextureMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);


  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const bokehPassRef = useRef<BokehPass | null>(null);
  const afterimagePassRef = useRef<AfterimagePass | null>(null);

  const shipMixerRef = useRef<THREE.AnimationMixer | null>(null);
  const planet1MixerRef = useRef<THREE.AnimationMixer | null>(null);
  const spaceStation1MixerRef = useRef<THREE.AnimationMixer | null>(null);

  const horizonParticlesRef = useRef<Array<any>>([]);
  const horizonParticleContainerRef = useRef<THREE.Group | null>(null);
  const horizonParticleGeometryRef = useRef<THREE.SphereGeometry | null>(null);
  const horizonParticleMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null);

  const wormholeMaterial1Ref = useRef<THREE.MeshStandardMaterial | null>(null);
  const wormholeMaterial2Ref = useRef<THREE.MeshStandardMaterial | null>(null);

  const { toast } = useToast();

  const mousePositionRef = useRef(new THREE.Vector2(0, 0));
  const targetShipPositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const isMouseOutsideRef = useRef(false);
  const shipIntroAnimationCompleteRef = useRef(false);

  const scrollProgressRef = useRef(0);
  const [scrollableHeight, setScrollableHeight] = useState(0);
  const lastScrollYRef = useRef(0);

  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const targetShipBoostZOffsetRef = useRef(0);
  const currentShipBoostZOffsetRef = useRef(0);

  const targetCameraFovOffsetRef = useRef(0);
  const currentCameraFovOffsetRef = useRef(0);

  const targetMotionBlurDampRef = useRef(MOTION_BLUR_DAMP_NORMAL);
  const currentMotionBlurDampRef = useRef(MOTION_BLUR_DAMP_NORMAL);

  const targetCameraShakeIntensityRef = useRef(CAMERA_SHAKE_INTENSITY_NORMAL);
  const currentCameraShakeIntensityRef = useRef(CAMERA_SHAKE_INTENSITY_NORMAL);
  const cameraShakeOffsetRef = useRef(new THREE.Vector3(0, 0, 0));


  const planet1TargetZRef = useRef(PLANET1_INITIAL_Z);
  const spaceStation1TargetZRef = useRef(SPACE_STATION1_INITIAL_Z);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const loadingMessageRef = useRef("Initializing...");

  const [hoveredObject, setHoveredObject] = useState<string | null>(null);

  const [countdownDisplay, setCountdownDisplay] = useState<number | "GO!" | null>(4);
  const [shipControlReady, setShipControlReady] = useState(false);

  const planetInfoBoxDOMRef = useRef<HTMLDivElement | null>(null);
  const planetProjectionLinesRef = useRef<THREE.Line[]>([]);
  const targetPlanetLineOpacityRef = useRef(0);
  const currentPlanetLineOpacityRef = useRef(0);
  const planet1EmitterRef = useRef<THREE.Mesh | null>(null);

  const stationInfoBoxDOMRef = useRef<HTMLDivElement | null>(null);
  const stationProjectionLinesRef = useRef<THREE.Line[]>([]);
  const targetStationLineOpacityRef = useRef(0);
  const currentStationLineOpacityRef = useRef(0);
  const spaceStation1EmitterRef = useRef<THREE.Mesh | null>(null);

  const [currentSceneKey, setCurrentSceneKey] = useState<'scene1' | 'scene2'>('scene1');
  const scene1HdriRef = useRef<THREE.Texture | null>(null);
  const scene2HdriRef = useRef<THREE.Texture | null>(null);
  type TransitionState = 'idle' | 'fadingOutToScene2' | 'fadingInToScene2' | 'scene2Active' | 'fadingOutToScene1' | 'fadingInToScene1';
  const [transitionState, setTransitionState] = useState<TransitionState>('idle');

  const targetTransitionFovRef = useRef(cameraInitialFov);
  const currentTransitionFovRef = useRef(cameraInitialFov);
  const targetTransitionMaxBlurRef = useRef(DOF_MAXBLUR);
  const currentTransitionMaxBlurRef = useRef(DOF_MAXBLUR);
  const targetOverlayOpacityRef = useRef(0.0);
  const [currentOverlayOpacity, setCurrentOverlayOpacity] = useState(0.0);

  const animationFrameIdRef = useRef<number | null>(null);
  const clock = useMemo(() => new THREE.Clock(), []);

  const goGlitch = useGlitch({
    playMode: 'always',
    createContainers: true,
    hideOverflow: false,
    timing: { duration: 800, iterations: Infinity },
    glitchTimeSpan: { start: 0, end: 1 },
    shake: { velocity: 18, amplitudeX: 0.15, amplitudeY: 0.15 },
    slice: { count: 7, velocity: 12, minHeight: 0.02, maxHeight: 0.18, hueRotate: true },
    pulse: false,
  });

  // Speedometer state
  const targetSpeedRef = useRef(SPEEDOMETER_INITIAL_SPEED);
  const currentSpeedRef = useRef(SPEEDOMETER_INITIAL_SPEED);
  const [displayedSpeed, setDisplayedSpeed] = useState(SPEEDOMETER_INITIAL_SPEED);


  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined;
    let newShipControlReady = false;
    if (!isLoading) {
      if (countdownDisplay === "GO!") {
        timerId = setTimeout(() => {
          setCountdownDisplay(null);
          newShipControlReady = true;
          setShipControlReady(true);
          if (newShipControlReady) {
            targetSpeedRef.current = SPEEDOMETER_CRUISING_SPEED;
          }
        }, 1000);
      } else if (typeof countdownDisplay === 'number' && countdownDisplay > 0) {
        timerId = setTimeout(() => {
          setCountdownDisplay((prev) => {
            if (typeof prev === 'number') {
              if (prev > 1) return prev - 1;
              if (prev === 1) return "GO!";
            }
            return prev;
          });
        }, 1000);
      }
    }
    return () => { if (timerId) clearTimeout(timerId); };
  }, [isLoading, countdownDisplay]);


  const calculateAndSetScrollableHeight = useCallback(() => {
    if (typeof window !== 'undefined') {
      const calculatedHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollableHeight(calculatedHeight > 0 ? calculatedHeight : 0);
    }
  }, []);

  const initHorizonParticles = useCallback((scene: THREE.Scene, camera: THREE.PerspectiveCamera) => {
    if (horizonParticleContainerRef.current) {
        scene.remove(horizonParticleContainerRef.current);
        horizonParticlesRef.current.forEach(p => {
            p.mesh.geometry?.dispose();
            (p.mesh.material as THREE.Material)?.dispose();
        });
        horizonParticlesRef.current = [];
    }
    if (horizonParticleGeometryRef.current) horizonParticleGeometryRef.current.dispose();
    if (horizonParticleMaterialRef.current) horizonParticleMaterialRef.current.dispose();

    horizonParticleContainerRef.current = new THREE.Group();
    scene.add(horizonParticleContainerRef.current);
    horizonParticleGeometryRef.current = new THREE.SphereGeometry(HORIZON_PARTICLE_BASE_SIZE, 8, 8);
    horizonParticleMaterialRef.current = new THREE.MeshBasicMaterial({ color: HORIZON_PARTICLE_COLOR });

    for (let i = 0; i < NUM_HORIZON_PARTICLES; i++) {
      const particle = new THREE.Mesh(horizonParticleGeometryRef.current, horizonParticleMaterialRef.current);
      const posX = (Math.random() - 0.5) * HORIZON_SPAWN_XY_RANGE * 2;
      const posY = (Math.random() - 0.5) * HORIZON_SPAWN_XY_RANGE * 2;
      const posZ = camera.position.z - HORIZON_SPAWN_Z_DISTANCE - Math.random() * 50;
      particle.position.set(posX, posY, posZ);
      const speed = HORIZON_PARTICLE_SPEED_MIN + Math.random() * (HORIZON_PARTICLE_SPEED_MAX - HORIZON_PARTICLE_SPEED_MIN);
      const velocity = new THREE.Vector3((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, speed );
      horizonParticleContainerRef.current.add(particle);
      horizonParticlesRef.current.push({ mesh: particle, velocity: velocity, initialZ: posZ });
    }
  }, []);


  const initThreeScene = useCallback((currentMount: HTMLDivElement, loadingManager: THREE.LoadingManager) => {
    if (currentMount.clientWidth === 0 || currentMount.clientHeight === 0) {
        console.warn("Mount point has zero dimensions. Aborting Three.js scene initialization.");
        setIsLoading(false);
        return;
    }

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.Fog(0xffffff, 50, 500);

    const camera = new THREE.PerspectiveCamera(cameraInitialFov, currentMount.clientWidth / currentMount.clientHeight, 0.1, 15000);
    cameraRef.current = camera;
    camera.position.set(cameraInitialPosX, cameraInitialPosY, cameraInitialPosZ);
    camera.rotation.set(cameraInitialRotX, cameraInitialRotY, cameraInitialRotZ);
    currentCameraFovOffsetRef.current = 0;
    targetCameraFovOffsetRef.current = 0;
    currentTransitionFovRef.current = cameraInitialFov;
    targetTransitionFovRef.current = cameraInitialFov;
    currentCameraShakeIntensityRef.current = CAMERA_SHAKE_INTENSITY_NORMAL;
    targetCameraShakeIntensityRef.current = CAMERA_SHAKE_INTENSITY_NORMAL;
    cameraShakeOffsetRef.current.set(0,0,0);


    targetShipPositionRef.current.set(cameraInitialPosX + shipInitialCameraOffsetX, cameraInitialPosY + shipInitialCameraOffsetY, cameraInitialPosZ + shipInitialCameraOffsetZ);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.autoClear = false;
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const composer = new EffectComposer(renderer);
    composerRef.current = composer;
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const initialFocusDistance = Math.abs(shipInitialCameraOffsetZ);
    const bokehPassInstance = new BokehPass(scene, camera, { focus: initialFocusDistance, aperture: DOF_APERTURE, maxblur: DOF_MAXBLUR, width: currentMount.clientWidth, height: currentMount.clientHeight });
    composer.addPass(bokehPassInstance);
    bokehPassRef.current = bokehPassInstance;
    currentTransitionMaxBlurRef.current = DOF_MAXBLUR;
    targetTransitionMaxBlurRef.current = DOF_MAXBLUR;

    const afterimagePassInstance = new AfterimagePass(MOTION_BLUR_DAMP_NORMAL);
    composer.addPass(afterimagePassInstance);
    afterimagePassRef.current = afterimagePassInstance;
    currentMotionBlurDampRef.current = MOTION_BLUR_DAMP_NORMAL;
    targetMotionBlurDampRef.current = MOTION_BLUR_DAMP_NORMAL;


    const bloomPassInstance = new UnrealBloomPass(new THREE.Vector2(currentMount.clientWidth, currentMount.clientHeight), bloomParams.strength, bloomParams.radius, bloomParams.threshold);
    bloomPassInstance.clear = false;
    composer.addPass(bloomPassInstance);
    bloomPassRef.current = bloomPassInstance;

    const finalPass = new ShaderPass(CopyShader);
    finalPass.renderToScreen = true;
    composer.addPass(finalPass);

    initHorizonParticles(scene, camera);

    planetProjectionLinesRef.current = [];
    for (let i = 0; i < NUM_PROJECTION_LINES; i++) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(2 * 3);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const material = new THREE.LineBasicMaterial({ color: PROJECTION_LINE_COLOR, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
      const line = new THREE.Line(geometry, material);
      line.visible = false;
      scene.add(line);
      planetProjectionLinesRef.current.push(line);
    }

    stationProjectionLinesRef.current = [];
    for (let i = 0; i < NUM_PROJECTION_LINES; i++) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(2 * 3);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const material = new THREE.LineBasicMaterial({ color: PROJECTION_LINE_COLOR, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
      const line = new THREE.Line(geometry, material);
      line.visible = false;
      scene.add(line);
      stationProjectionLinesRef.current.push(line);
    }


    const rgbeLoader = new RGBELoader(loadingManager);
    loadingMessageRef.current = "Loading environment (Scene 1)...";
    rgbeLoader.load('/hdri/sky_1.hdr', (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene1HdriRef.current = texture;
      }, undefined, (error) => {
        console.error('Error loading HDRI (Scene 1):', error);
        if (sceneRef.current && !(sceneRef.current.background instanceof THREE.Texture)) sceneRef.current.background = new THREE.Color(0x101015);
        if (sceneRef.current) sceneRef.current.environment = null;
      }
    );

    loadingMessageRef.current = "Loading environment (Scene 2)...";
    rgbeLoader.load('/hdri/sky_2.hdr', (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene2HdriRef.current = texture;
      }, undefined, (error) => {
        console.error('Error loading HDRI (Scene 2):', error);
      }
    );

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight.position.set(2, 5, -5);
    scene.add(directionalLight);

    const gltfLoader = new GLTFLoader(loadingManager);
    loadingMessageRef.current = "Loading spaceship...";
    gltfLoader.load('/models/spaceship.glb', (gltf) => {
        const spaceship = gltf.scene;
        spaceshipRef.current = spaceship;
        const initialIntroX = cameraInitialPosX + shipInitialCameraOffsetX;
        const initialIntroY = cameraInitialPosY + shipInitialCameraOffsetY - SHIP_INTRO_Y_OFFSET_BELOW;
        const initialIntroZ = cameraInitialPosZ + shipInitialCameraOffsetZ + SHIP_INTRO_Z_OFFSET;
        spaceship.position.set(initialIntroX, initialIntroY, initialIntroZ);
        shipIntroAnimationCompleteRef.current = false;
        spaceship.rotation.set(shipInitialRotX, shipInitialRotY, shipInitialRotZ);
        spaceship.scale.set(shipInitialScale, shipInitialScale, shipInitialScale);
        spaceship.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach(material => {
              if ((material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
                const standardMaterial = material as THREE.MeshStandardMaterial;
                if (standardMaterial.emissiveMap) {
                  standardMaterial.emissive = new THREE.Color(0xffffff);
                }
                // If no emissiveMap, material.emissive remains its default (usually black)
                // or what's defined in the GLB. We don't explicitly set it to black here
                // if there's no map, allowing the GLB's original emissive color (if any)
                // to persist for non-mapped emission.
                standardMaterial.emissiveIntensity = SPACESHIP_FIXED_EMISSIVE_INTENSITY;
                standardMaterial.needsUpdate = true;
              }
            });
          }
        });
        scene.add(spaceship);
        if (gltf.animations && gltf.animations.length) {
          shipMixerRef.current = new THREE.AnimationMixer(spaceship);
          gltf.animations.forEach((clip) => { if(shipMixerRef.current){ const action = shipMixerRef.current.clipAction(clip); action.play(); } });
        }
      }, undefined, (error) => { console.error('Error loading spaceship model:', error); }
    );

    loadingMessageRef.current = "Loading wormhole...";
    gltfLoader.load('/models/WORMHOLE.glb', (gltf) => {
        const wormhole = gltf.scene;
        wormholeRef.current = wormhole;
        wormhole.position.set(wormholeInitialPosX, wormholeInitialPosY, wormholeInitialPosZ);
        wormhole.rotation.set(wormholeInitialRotX, wormholeInitialRotY, wormholeInitialRotZ);
        wormhole.scale.set(wormholeInitialScale, wormholeInitialScale, wormholeInitialScale);
        wormhole.visible = currentSceneKey === 'scene1' && transitionState !== 'fadingOutToScene2' && transitionState !== 'fadingInToScene2' && transitionState !== 'scene2Active';
        wormhole.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const material = child.material as THREE.MeshStandardMaterial;
            if (material.name === "WORMHOLE 1") {
              wormholeMaterial1Ref.current = material; material.emissiveIntensity = wormhole1EmissiveIntensity;
              if (material.map) { material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping; }
              if (material.emissiveMap) { material.emissiveMap.wrapS = material.emissiveMap.wrapT = THREE.RepeatWrapping; }
              if (material.normalMap) { material.normalMap.wrapS = material.normalMap.wrapT = THREE.RepeatWrapping; }
            } else if (material.name === "WORMHOLE 2") {
              wormholeMaterial2Ref.current = material; material.emissiveIntensity = wormhole2EmissiveIntensity;
              if (material.map) { material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping; }
              if (material.emissiveMap) { material.emissiveMap.wrapS = material.emissiveMap.wrapT = THREE.RepeatWrapping; }
              if (material.normalMap) { material.normalMap.wrapS = material.normalMap.wrapT = THREE.RepeatWrapping; }
            }
          }
        });
        scene.add(wormhole);
      }, undefined, (error) => { console.error('Error loading wormhole model:', error); }
    );

    loadingMessageRef.current = "Loading Planet 1...";
    gltfLoader.load(PLANET1_MODEL_PATH, (gltf) => {
        const planet = gltf.scene;
        planet1Ref.current = planet;
        planet.position.set(planet1InitialPosX, planet1InitialPosY, PLANET1_INITIAL_Z);
        planet.rotation.set(planet1InitialRotX, planet1InitialRotY, planet1InitialRotZ);
        planet.scale.set(planet1InitialScale, planet1InitialScale, planet1InitialScale);
        planet1TargetZRef.current = PLANET1_INITIAL_Z;
        planet.visible = currentSceneKey === 'scene1' && transitionState !== 'fadingOutToScene2' && transitionState !== 'fadingInToScene2' && transitionState !== 'scene2Active';
        planet.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const material = child.material as THREE.MeshStandardMaterial;
            if (material.isMeshStandardMaterial) {
              if (child.name === "PLANET1") material.emissiveIntensity = INITIAL_PLANET1_CORE_EMISSIVE_INTENSITY;
              else if (child.name === "PLANET1_CLOUDS") material.emissiveIntensity = INITIAL_PLANET1_CLOUDS_EMISSIVE_INTENSITY;
            }
          }
        });
        const emitterGeo = new THREE.SphereGeometry(PLANET1_EMITTER_SIZE, 16, 16);
        const emitterMat = new THREE.MeshStandardMaterial({ color: PROJECTION_LINE_COLOR, emissive: PROJECTION_LINE_COLOR, emissiveIntensity: PLANET1_EMITTER_INTENSITY, transparent: true, opacity: 0.8 });
        planet1EmitterRef.current = new THREE.Mesh(emitterGeo, emitterMat);
        planet1EmitterRef.current.position.copy(PLANET1_EMITTER_LOCAL_OFFSET);
        planet.add(planet1EmitterRef.current);
        if (gltf.animations && gltf.animations.length) {
          planet1MixerRef.current = new THREE.AnimationMixer(planet);
          gltf.animations.forEach((clip) => { if (planet1MixerRef.current) { const action = planet1MixerRef.current.clipAction(clip); action.play(); } });
        }
        scene.add(planet);
        loadingMessageRef.current = "Planet 1 loaded.";
      }, undefined, (error) => { console.error(`Error loading ${PLANET1_MODEL_PATH}:`, error); }
    );

    loadingMessageRef.current = "Loading Space Station 1...";
    gltfLoader.load(SPACE_STATION1_MODEL_PATH, (gltf) => {
        const station = gltf.scene;
        spaceStation1Ref.current = station;
        station.position.set(spaceStation1InitialPosX, spaceStation1InitialPosY, SPACE_STATION1_INITIAL_Z);
        station.rotation.set(spaceStation1InitialRotX, spaceStation1InitialRotY, spaceStation1InitialRotZ);
        station.scale.set(spaceStation1InitialScale, spaceStation1InitialScale, spaceStation1InitialScale);
        spaceStation1TargetZRef.current = SPACE_STATION1_INITIAL_Z;
        station.visible = currentSceneKey === 'scene1' && transitionState !== 'fadingOutToScene2' && transitionState !== 'fadingInToScene2' && transitionState !== 'scene2Active';
        station.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const material = child.material as THREE.MeshStandardMaterial;
            if (material.isMeshStandardMaterial) material.emissiveIntensity = INITIAL_SPACE_STATION1_EMISSIVE_INTENSITY;
          }
        });
        const emitterGeo = new THREE.SphereGeometry(SPACE_STATION1_EMITTER_SIZE, 16, 16);
        const emitterMat = new THREE.MeshStandardMaterial({ color: PROJECTION_LINE_COLOR, emissive: PROJECTION_LINE_COLOR, emissiveIntensity: SPACE_STATION1_EMITTER_INTENSITY, transparent: true, opacity: 0.8 });
        spaceStation1EmitterRef.current = new THREE.Mesh(emitterGeo, emitterMat);
        spaceStation1EmitterRef.current.position.copy(SPACE_STATION1_EMITTER_LOCAL_OFFSET);
        station.add(spaceStation1EmitterRef.current);
        if (gltf.animations && gltf.animations.length) {
          spaceStation1MixerRef.current = new THREE.AnimationMixer(station);
          gltf.animations.forEach((clip) => { if (spaceStation1MixerRef.current) { const action = spaceStation1MixerRef.current.clipAction(clip); action.play(); } });
        }
        scene.add(station);
        loadingMessageRef.current = "Space Station 1 loaded.";
      }, undefined, (error) => { console.error(`Error loading ${SPACE_STATION1_MODEL_PATH}:`, error); }
    );

    loadingMessageRef.current = "Loading Ocean Model...";
    gltfLoader.load(OCEAN_GLB_MODEL_PATH, (gltf) => {
      const oceanModel = gltf.scene;
      oceanModelRef.current = oceanModel;
      oceanModelTextureMaterialsRef.current = []; // Clear before populating

      oceanModel.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          const material = child.material as THREE.MeshStandardMaterial;
          if (material.map) {
            material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
            oceanModelTextureMaterialsRef.current.push(material);
          }
          if (material.normalMap) {
            material.normalMap.wrapS = material.normalMap.wrapT = THREE.RepeatWrapping;
            if (!oceanModelTextureMaterialsRef.current.includes(material)) {
              oceanModelTextureMaterialsRef.current.push(material);
            }
          }
        }
      });

      oceanModel.position.set(0, OCEAN_GLB_INITIAL_Y_OFFSET, 0);
      oceanModel.rotation.x = 0;
      oceanModel.scale.set(OCEAN_GLB_SCALE, OCEAN_GLB_SCALE, OCEAN_GLB_SCALE);

      oceanModel.visible = currentSceneKey === 'scene2' && transitionState !== 'fadingOutToScene1' && transitionState !== 'fadingInToScene1' && transitionState !== 'idle';
      scene.add(oceanModel);
      loadingMessageRef.current = "Ocean Model loaded.";
    }, undefined, (error) => {
      console.error(`Error loading ${OCEAN_GLB_MODEL_PATH}:`, error);
    });

  }, [initHorizonParticles, currentSceneKey, transitionState]);


  const handleScroll = useCallback(() => {
    if (typeof window === 'undefined' || !cameraRef.current || !sceneRef.current || !mountRef.current) return;

    const scrollTop = window.scrollY;

    if (scrollableHeight > 0 && scrollTop >= scrollableHeight - 1) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      scrollProgressRef.current = 0;
      lastScrollYRef.current = 0;
      
      if (planet1Ref.current) planet1TargetZRef.current = PLANET1_INITIAL_Z - (scrollProgressRef.current * PLANET1_TRAVEL_DISTANCE);
      if (spaceStation1Ref.current) spaceStation1TargetZRef.current = SPACE_STATION1_INITIAL_Z - (scrollProgressRef.current * SPACE_STATION1_TRAVEL_DISTANCE);


      if (currentSceneKey === 'scene2' && (transitionState === 'scene2Active' || transitionState === 'fadingInToScene2')) {
        console.log("Transition: Scroll jump from bottom, starting fadeOutToScene1 from scene2");
        if (cameraRef.current) currentTransitionFovRef.current = cameraRef.current.fov;
        if (bokehPassRef.current) currentTransitionMaxBlurRef.current = bokehPassRef.current.uniforms.maxblur.value;

        targetTransitionFovRef.current = TRANSITION_FOV_NARROW;
        targetTransitionMaxBlurRef.current = TRANSITION_BLUR_HIGH;
        targetOverlayOpacityRef.current = 1.0;
        targetMotionBlurDampRef.current = MOTION_BLUR_DAMP_NORMAL;
        targetCameraShakeIntensityRef.current = CAMERA_SHAKE_INTENSITY_NORMAL;
        setTransitionState('fadingOutToScene1');
      }

      isScrollingRef.current = false;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
      targetShipBoostZOffsetRef.current = 0;
      targetCameraFovOffsetRef.current = 0;
      targetMotionBlurDampRef.current = MOTION_BLUR_DAMP_NORMAL;
      targetCameraShakeIntensityRef.current = CAMERA_SHAKE_INTENSITY_NORMAL;
      if (shipControlReady) targetSpeedRef.current = SPEEDOMETER_CRUISING_SPEED;

      return;
    }

    scrollProgressRef.current = scrollableHeight > 0 ? Math.min(scrollTop / scrollableHeight, 1.0) : 0;
    const scrollDelta = scrollTop - lastScrollYRef.current;

    if (transitionState === 'idle' && scrollProgressRef.current > SCENE_CHANGE_SCROLL_THRESHOLD && currentSceneKey === 'scene1') {
        console.log("Transition: Starting fadeOutToScene2");
        if (cameraRef.current) currentTransitionFovRef.current = cameraRef.current.fov;
        if (bokehPassRef.current) currentTransitionMaxBlurRef.current = bokehPassRef.current.uniforms.maxblur.value;

        targetTransitionFovRef.current = TRANSITION_FOV_NARROW;
        targetTransitionMaxBlurRef.current = TRANSITION_BLUR_HIGH;
        targetOverlayOpacityRef.current = 1.0;
        targetMotionBlurDampRef.current = MOTION_BLUR_DAMP_NORMAL;
        targetCameraShakeIntensityRef.current = CAMERA_SHAKE_INTENSITY_NORMAL;
        setTransitionState('fadingOutToScene2');
    } else if (transitionState === 'scene2Active' && scrollProgressRef.current <= SCENE_CHANGE_SCROLL_THRESHOLD && currentSceneKey === 'scene2') {
        console.log("Transition: Starting fadeOutToScene1");
        if (cameraRef.current) currentTransitionFovRef.current = cameraRef.current.fov;
        if (bokehPassRef.current) currentTransitionMaxBlurRef.current = bokehPassRef.current.uniforms.maxblur.value;

        targetTransitionFovRef.current = TRANSITION_FOV_NARROW;
        targetTransitionMaxBlurRef.current = TRANSITION_BLUR_HIGH;
        targetOverlayOpacityRef.current = 1.0;
        targetMotionBlurDampRef.current = MOTION_BLUR_DAMP_NORMAL;
        targetCameraShakeIntensityRef.current = CAMERA_SHAKE_INTENSITY_NORMAL;
        setTransitionState('fadingOutToScene1');
    }

    if (planet1Ref.current) {
        planet1TargetZRef.current = PLANET1_INITIAL_Z - (scrollProgressRef.current * PLANET1_TRAVEL_DISTANCE);
    }
    if (spaceStation1Ref.current) {
        spaceStation1TargetZRef.current = SPACE_STATION1_INITIAL_Z - (scrollProgressRef.current * SPACE_STATION1_TRAVEL_DISTANCE);
    }

    lastScrollYRef.current = scrollTop;

    if (transitionState === 'idle' || transitionState === 'scene2Active') {
        isScrollingRef.current = true;
        let activateBoostEffectThisTick = false;
        if (SCROLL_DIRECTION_FOR_EFFECTS === "any") activateBoostEffectThisTick = true;
        else if (SCROLL_DIRECTION_FOR_EFFECTS === "down" && scrollDelta > 0) activateBoostEffectThisTick = true;

        if (activateBoostEffectThisTick) {
            targetShipBoostZOffsetRef.current = -FORWARD_BOOST_AMOUNT;
            targetCameraFovOffsetRef.current = BOOST_CAMERA_FOV_ADDITION;
            targetMotionBlurDampRef.current = MOTION_BLUR_DAMP_BOOST;
            targetCameraShakeIntensityRef.current = CAMERA_SHAKE_INTENSITY_BOOST;

            if (shipControlReady) targetSpeedRef.current = SPEEDOMETER_BOOST_SPEED;
        }
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
            isScrollingRef.current = false;
             if (transitionState === 'idle' || transitionState === 'scene2Active') {
                targetShipBoostZOffsetRef.current = 0;
                targetCameraFovOffsetRef.current = 0;
                targetMotionBlurDampRef.current = MOTION_BLUR_DAMP_NORMAL;
                targetCameraShakeIntensityRef.current = CAMERA_SHAKE_INTENSITY_NORMAL;
                if (shipControlReady) targetSpeedRef.current = SPEEDOMETER_CRUISING_SPEED;
            }
        }, SCROLL_TIMEOUT_DURATION_EFFECTS);
    } else {
        targetShipBoostZOffsetRef.current = 0;
        targetCameraFovOffsetRef.current = 0;
        targetMotionBlurDampRef.current = MOTION_BLUR_DAMP_NORMAL;
        targetCameraShakeIntensityRef.current = CAMERA_SHAKE_INTENSITY_NORMAL;
        if (shipControlReady) targetSpeedRef.current = SPEEDOMETER_CRUISING_SPEED;
        isScrollingRef.current = false;
        if (scrollTimeoutRef.current) { clearTimeout(scrollTimeoutRef.current); scrollTimeoutRef.current = null; }
    }
  }, [scrollableHeight, currentSceneKey, transitionState, scene1HdriRef, scene2HdriRef, shipControlReady]);


  const animate = useCallback(() => {
    if (!cameraRef.current || !sceneRef.current || !rendererRef.current || !composerRef.current || !mountRef.current || !bokehPassRef.current || !afterimagePassRef.current) return;

    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();
    if (shipMixerRef.current) shipMixerRef.current.update(deltaTime);

    let nextFrameOpacity = currentOverlayOpacity;

    if (transitionState === 'fadingOutToScene2') {
        currentTransitionFovRef.current = THREE.MathUtils.lerp(currentTransitionFovRef.current, targetTransitionFovRef.current, TRANSITION_LERP_SPEED);
        currentTransitionMaxBlurRef.current = THREE.MathUtils.lerp(currentTransitionMaxBlurRef.current, targetTransitionMaxBlurRef.current, TRANSITION_LERP_SPEED);
        nextFrameOpacity = THREE.MathUtils.lerp(currentOverlayOpacity, targetOverlayOpacityRef.current, TRANSITION_LERP_SPEED);

        targetMotionBlurDampRef.current = MOTION_BLUR_DAMP_NORMAL;
        targetCameraShakeIntensityRef.current = CAMERA_SHAKE_INTENSITY_NORMAL;


        if (nextFrameOpacity >= 0.995) {
            nextFrameOpacity = 1.0;
            setCurrentOverlayOpacity(1.0);

            if (sceneRef.current && scene2HdriRef.current) {
                sceneRef.current.environment = scene2HdriRef.current;
                sceneRef.current.background = scene2HdriRef.current;
            }
            if (planet1Ref.current) planet1Ref.current.visible = false;
            if (spaceStation1Ref.current) spaceStation1Ref.current.visible = false;
            if (wormholeRef.current) wormholeRef.current.visible = false;
            if (oceanModelRef.current) oceanModelRef.current.visible = true;
            targetPlanetLineOpacityRef.current = 0;
            targetStationLineOpacityRef.current = 0;

            setCurrentSceneKey('scene2');
            targetTransitionFovRef.current = TRANSITION_FOV_NORMAL;
            targetTransitionMaxBlurRef.current = TRANSITION_BLUR_NORMAL;
            targetOverlayOpacityRef.current = 0.0;
            setTransitionState('fadingInToScene2');
        } else {
            setCurrentOverlayOpacity(nextFrameOpacity);
        }
    } else if (transitionState === 'fadingInToScene2') {
        currentTransitionFovRef.current = THREE.MathUtils.lerp(currentTransitionFovRef.current, targetTransitionFovRef.current, TRANSITION_LERP_SPEED);
        currentTransitionMaxBlurRef.current = THREE.MathUtils.lerp(currentTransitionMaxBlurRef.current, targetTransitionMaxBlurRef.current, TRANSITION_LERP_SPEED);
        nextFrameOpacity = THREE.MathUtils.lerp(currentOverlayOpacity, targetOverlayOpacityRef.current, TRANSITION_LERP_SPEED);

        if (oceanModelRef.current) oceanModelRef.current.visible = true;


        if (nextFrameOpacity <= 0.005) {
            nextFrameOpacity = 0.0;
            setCurrentOverlayOpacity(0.0);
            setTransitionState('scene2Active');
        } else {
            setCurrentOverlayOpacity(nextFrameOpacity);
        }
    } else if (transitionState === 'fadingOutToScene1') {
        currentTransitionFovRef.current = THREE.MathUtils.lerp(currentTransitionFovRef.current, targetTransitionFovRef.current, TRANSITION_LERP_SPEED);
        currentTransitionMaxBlurRef.current = THREE.MathUtils.lerp(currentTransitionMaxBlurRef.current, targetTransitionMaxBlurRef.current, TRANSITION_LERP_SPEED);
        nextFrameOpacity = THREE.MathUtils.lerp(currentOverlayOpacity, targetOverlayOpacityRef.current, TRANSITION_LERP_SPEED);

        targetMotionBlurDampRef.current = MOTION_BLUR_DAMP_NORMAL;
        targetCameraShakeIntensityRef.current = CAMERA_SHAKE_INTENSITY_NORMAL;


        if (oceanModelRef.current) oceanModelRef.current.visible = false;

        if (nextFrameOpacity >= 0.995) {
            nextFrameOpacity = 1.0;
            setCurrentOverlayOpacity(1.0);

            if (sceneRef.current && scene1HdriRef.current) {
                sceneRef.current.environment = scene1HdriRef.current;
                sceneRef.current.background = scene1HdriRef.current;
            }
            if (planet1Ref.current) planet1Ref.current.visible = true;
            if (spaceStation1Ref.current) spaceStation1Ref.current.visible = true;
            if (wormholeRef.current) wormholeRef.current.visible = true;

            if (planet1Ref.current) {
                planet1TargetZRef.current = PLANET1_INITIAL_Z - (scrollProgressRef.current * PLANET1_TRAVEL_DISTANCE);
            }
            if (spaceStation1Ref.current) {
                spaceStation1TargetZRef.current = SPACE_STATION1_INITIAL_Z - (scrollProgressRef.current * SPACE_STATION1_TRAVEL_DISTANCE);
            }

            setCurrentSceneKey('scene1');
            targetTransitionFovRef.current = TRANSITION_FOV_NORMAL;
            targetTransitionMaxBlurRef.current = TRANSITION_BLUR_NORMAL;
            targetOverlayOpacityRef.current = 0.0;
            setTransitionState('fadingInToScene1');
        } else {
            setCurrentOverlayOpacity(nextFrameOpacity);
        }
    } else if (transitionState === 'fadingInToScene1') {
        currentTransitionFovRef.current = THREE.MathUtils.lerp(currentTransitionFovRef.current, targetTransitionFovRef.current, TRANSITION_LERP_SPEED);
        currentTransitionMaxBlurRef.current = THREE.MathUtils.lerp(currentTransitionMaxBlurRef.current, targetTransitionMaxBlurRef.current, TRANSITION_LERP_SPEED);
        nextFrameOpacity = THREE.MathUtils.lerp(currentOverlayOpacity, targetOverlayOpacityRef.current, TRANSITION_LERP_SPEED);

         if (nextFrameOpacity <= 0.005) {
            nextFrameOpacity = 0.0;
            setCurrentOverlayOpacity(0.0);
            setTransitionState('idle');
        } else {
            setCurrentOverlayOpacity(nextFrameOpacity);
        }
    }


    cameraRef.current.fov = currentTransitionFovRef.current;
    bokehPassRef.current.uniforms.maxblur.value = currentTransitionMaxBlurRef.current;


    if (currentSceneKey === 'scene1' && (transitionState === 'idle' || transitionState === 'fadingInToScene1')) {
        if (planet1MixerRef.current) planet1MixerRef.current.update(deltaTime);
        if (spaceStation1MixerRef.current) spaceStation1MixerRef.current.update(deltaTime);
        if (wormholeMaterial1Ref.current && wormholeMaterial1Ref.current.map) { wormholeMaterial1Ref.current.map.offset.x += wormhole1OffsetXSpeed * deltaTime; wormholeMaterial1Ref.current.map.offset.y += wormhole1OffsetYSpeed * deltaTime; }
        if (wormholeMaterial1Ref.current && wormholeMaterial1Ref.current.emissiveMap) { wormholeMaterial1Ref.current.emissiveMap.offset.x += wormhole1OffsetXSpeed * deltaTime; wormholeMaterial1Ref.current.emissiveMap.offset.y += wormhole1OffsetYSpeed * deltaTime; }
        if (wormholeMaterial1Ref.current && wormholeMaterial1Ref.current.normalMap) { wormholeMaterial1Ref.current.normalMap.offset.x += wormhole1OffsetXSpeed * deltaTime; wormholeMaterial1Ref.current.normalMap.offset.y += wormhole1OffsetYSpeed * deltaTime; }
        if (wormholeMaterial2Ref.current && wormholeMaterial2Ref.current.map) { wormholeMaterial2Ref.current.map.offset.x += wormhole2OffsetXSpeed * deltaTime; wormholeMaterial2Ref.current.map.offset.y += wormhole2OffsetYSpeed * deltaTime; }
        if (wormholeMaterial2Ref.current && wormholeMaterial2Ref.current.emissiveMap) { wormholeMaterial2Ref.current.emissiveMap.offset.x += wormhole2OffsetXSpeed * deltaTime; wormholeMaterial2Ref.current.emissiveMap.offset.y += wormhole2OffsetYSpeed * deltaTime; }
        if (wormholeMaterial2Ref.current && wormholeMaterial2Ref.current.normalMap) { wormholeMaterial2Ref.current.normalMap.offset.x += wormhole2OffsetXSpeed * deltaTime; wormholeMaterial2Ref.current.normalMap.offset.y += wormhole2OffsetYSpeed * deltaTime; }
    } else if (currentSceneKey === 'scene2' && oceanModelRef.current && oceanModelRef.current.visible && oceanModelTextureMaterialsRef.current.length > 0) {
        oceanModelTextureMaterialsRef.current.forEach(material => {
            if (material.map) {
                material.map.offset.x += OCEAN_MODEL_TEXTURE_OFFSET_X_SPEED * deltaTime;
                material.map.offset.y += OCEAN_MODEL_TEXTURE_OFFSET_Y_SPEED * deltaTime;
            }
            if (material.normalMap) {
                material.normalMap.offset.x += OCEAN_MODEL_TEXTURE_OFFSET_X_SPEED * deltaTime;
                material.normalMap.offset.y += OCEAN_MODEL_TEXTURE_OFFSET_Y_SPEED * deltaTime;
            }
        });
    }

    currentCameraShakeIntensityRef.current = THREE.MathUtils.lerp(currentCameraShakeIntensityRef.current, targetCameraShakeIntensityRef.current, CAMERA_SHAKE_LERP_SPEED);
    if (currentCameraShakeIntensityRef.current > 0.001) {
      const shakeX = Math.sin(elapsedTime * CAMERA_SHAKE_FREQUENCY) * currentCameraShakeIntensityRef.current;
      const shakeY = Math.cos(elapsedTime * CAMERA_SHAKE_FREQUENCY * 0.7) * currentCameraShakeIntensityRef.current; // Slightly different frequency for Y for more natural feel
      cameraShakeOffsetRef.current.set(shakeX, shakeY, 0);
    } else {
      cameraShakeOffsetRef.current.set(0, 0, 0);
    }
    cameraRef.current.position.x = cameraInitialPosX + cameraShakeOffsetRef.current.x;
    cameraRef.current.position.y = cameraInitialPosY + cameraShakeOffsetRef.current.y;
    // Z position remains cameraInitialPosZ (not affected by shake in this implementation)


    currentShipBoostZOffsetRef.current = THREE.MathUtils.lerp(currentShipBoostZOffsetRef.current, targetShipBoostZOffsetRef.current, ACCELERATION_EFFECT_LERP_SPEED);
    if (transitionState === 'idle' || transitionState === 'scene2Active') {
        currentCameraFovOffsetRef.current = THREE.MathUtils.lerp(currentCameraFovOffsetRef.current, targetCameraFovOffsetRef.current, CAMERA_FOV_LERP_SPEED);
        cameraRef.current.fov = cameraInitialFov + currentCameraFovOffsetRef.current;
    } else {
        currentCameraFovOffsetRef.current = 0;
        cameraRef.current.fov = currentTransitionFovRef.current;
    }

    currentMotionBlurDampRef.current = THREE.MathUtils.lerp(currentMotionBlurDampRef.current, targetMotionBlurDampRef.current, MOTION_BLUR_LERP_SPEED);
    if (afterimagePassRef.current) {
        afterimagePassRef.current.uniforms['damp'].value = currentMotionBlurDampRef.current;
    }


    if (spaceshipRef.current) {
        const introTargetWorldPos = new THREE.Vector3(cameraInitialPosX + shipInitialCameraOffsetX, cameraInitialPosY + shipInitialCameraOffsetY, cameraInitialPosZ + shipInitialCameraOffsetZ);
        if (!shipIntroAnimationCompleteRef.current) {
            spaceshipRef.current.position.lerp(introTargetWorldPos, SHIP_INTRO_ANIMATION_SPEED);
            spaceshipRef.current.rotation.x = THREE.MathUtils.lerp(spaceshipRef.current.rotation.x, shipInitialRotX, mouseFollowSpeed * 2);
            spaceshipRef.current.rotation.y = THREE.MathUtils.lerp(spaceshipRef.current.rotation.y, shipInitialRotY, mouseFollowSpeed * 2);
            spaceshipRef.current.rotation.z = THREE.MathUtils.lerp(spaceshipRef.current.rotation.z, shipInitialRotZ, mouseFollowSpeed * 2);
            if (spaceshipRef.current.position.distanceTo(introTargetWorldPos) < 0.01) {
                spaceshipRef.current.position.copy(introTargetWorldPos);
                targetShipPositionRef.current.copy(spaceshipRef.current.position);
                shipIntroAnimationCompleteRef.current = true;
            }
        } else {
            const canControlShip = shipControlReady && (transitionState === 'idle' || transitionState === 'scene2Active');
            if (canControlShip) {
                let currentInputMouseX = mousePositionRef.current.x;
                let currentInputMouseY = mousePositionRef.current.y;
                if (isMouseOutsideRef.current) { currentInputMouseX = 0; currentInputMouseY = 0; }
                const targetX = cameraInitialPosX + shipInitialCameraOffsetX + (currentInputMouseX * parallaxFactorX);
                const targetY = cameraInitialPosY + shipInitialCameraOffsetY + (currentInputMouseY * parallaxFactorY);
                const targetZ = cameraInitialPosZ + shipInitialCameraOffsetZ + currentShipBoostZOffsetRef.current;
                targetShipPositionRef.current.set(targetX, targetY, targetZ);
                spaceshipRef.current.position.lerp(targetShipPositionRef.current, mouseFollowSpeed);
                const targetPitch = shipInitialRotX - THREE.MathUtils.clamp(currentInputMouseY * shipRotationFactor * 0.7, -shipMaxTilt, shipMaxTilt);
                const targetYaw = shipInitialRotY - THREE.MathUtils.clamp(currentInputMouseX * shipRotationFactor * 0.5, -shipMaxTilt * 0.8, shipMaxTilt * 0.8);
                const targetRoll = shipInitialRotZ - THREE.MathUtils.clamp(currentInputMouseX * shipRotationFactor, -shipMaxTilt, shipMaxTilt);
                spaceshipRef.current.rotation.x = THREE.MathUtils.lerp(spaceshipRef.current.rotation.x, targetPitch, mouseFollowSpeed);
                spaceshipRef.current.rotation.y = THREE.MathUtils.lerp(spaceshipRef.current.rotation.y, targetYaw, mouseFollowSpeed);
                spaceshipRef.current.rotation.z = THREE.MathUtils.lerp(spaceshipRef.current.rotation.z, targetRoll, mouseFollowSpeed);
            } else {
                const neutralBaseX = cameraInitialPosX + shipInitialCameraOffsetX;
                const neutralBaseY = cameraInitialPosY + shipInitialCameraOffsetY;
                const neutralBaseZ = cameraInitialPosZ + shipInitialCameraOffsetZ + currentShipBoostZOffsetRef.current;

                targetShipPositionRef.current.set(neutralBaseX, neutralBaseY, neutralBaseZ);
                spaceshipRef.current.position.lerp(targetShipPositionRef.current, mouseFollowSpeed * 0.5);

                spaceshipRef.current.rotation.x = THREE.MathUtils.lerp(spaceshipRef.current.rotation.x, shipInitialRotX, mouseFollowSpeed * 1.5);
                spaceshipRef.current.rotation.y = THREE.MathUtils.lerp(spaceshipRef.current.rotation.y, shipInitialRotY, mouseFollowSpeed * 1.5);
                spaceshipRef.current.rotation.z = THREE.MathUtils.lerp(spaceshipRef.current.rotation.z, shipInitialRotZ, mouseFollowSpeed * 1.5);
            }
        }
    }

    if (currentSceneKey === 'scene1' && (transitionState === 'idle' || transitionState === 'fadingInToScene1')) {
        if (planet1Ref.current) planet1Ref.current.position.z = THREE.MathUtils.lerp(planet1Ref.current.position.z, planet1TargetZRef.current, OBJECT_LERP_SPEED);
        if (spaceStation1Ref.current) spaceStation1Ref.current.position.z = THREE.MathUtils.lerp(spaceStation1Ref.current.position.z, spaceStation1TargetZRef.current, OBJECT_LERP_SPEED);
    }

    if (horizonParticlesRef.current.length > 0 && cameraRef.current && horizonParticleContainerRef.current) {
      const camZ = cameraRef.current.position.z;
      for (let i = horizonParticlesRef.current.length - 1; i >= 0; i--) {
          const p = horizonParticlesRef.current[i];
          p.mesh.position.addScaledVector(p.velocity, deltaTime);
          if (p.mesh.position.z > camZ - HORIZON_DESPAWN_Z_OFFSET) {
              const respawnZBase = camZ - HORIZON_SPAWN_Z_DISTANCE;
              const posX = (Math.random() - 0.5) * HORIZON_SPAWN_XY_RANGE * 2;
              const posY = (Math.random() - 0.5) * HORIZON_SPAWN_XY_RANGE * 2;
              const posZ = respawnZBase - Math.random() * 50;
              p.mesh.position.set(posX, posY, posZ);
              p.initialZ = posZ;
              const speed = HORIZON_PARTICLE_SPEED_MIN + Math.random() * (HORIZON_PARTICLE_SPEED_MAX - HORIZON_PARTICLE_SPEED_MIN);
              p.velocity.set((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, speed);
          }
      }
    }
    cameraRef.current.updateProjectionMatrix();

    if (bokehPassRef.current && spaceshipRef.current && cameraRef.current && shipIntroAnimationCompleteRef.current) {
        const focusDistance = spaceshipRef.current.position.distanceTo(cameraRef.current.position);
        const clampedFocusDistance = Math.max(0.1, focusDistance);
        if (transitionState === 'idle' || transitionState === 'scene2Active') {
           bokehPassRef.current.uniforms['focus'].value = clampedFocusDistance;
        } else {
            bokehPassRef.current.uniforms['focus'].value = 1000;
        }
    }

    if (sceneRef.current) {
      if (sceneRef.current.background && (sceneRef.current.background as THREE.Texture).isTexture) sceneRef.current.backgroundRotation.y += HDRI_ROTATION_SPEED * deltaTime;
      if (sceneRef.current.environment && (sceneRef.current.environment as THREE.Texture).isTexture) sceneRef.current.environmentRotation.y += HDRI_ROTATION_SPEED * deltaTime;
    }

    if (currentSceneKey === 'scene1' && (transitionState === 'idle' || transitionState === 'fadingInToScene1')) {
        if (hoveredObject === 'planet1' && planet1Ref.current && planet1EmitterRef.current && cameraRef.current && planetInfoBoxDOMRef.current && planetProjectionLinesRef.current.length === NUM_PROJECTION_LINES && mountRef.current) {
            targetPlanetLineOpacityRef.current = PROJECTION_LINE_BASE_TARGET_OPACITY - Math.random() * PROJECTION_LINE_OPACITY_FLICKER_AMOUNT;
            targetPlanetLineOpacityRef.current = Math.max(0.1, targetPlanetLineOpacityRef.current);

            const planetEmitterWorldPos = new THREE.Vector3();
            planet1EmitterRef.current.getWorldPosition(planetEmitterWorldPos);
            const planetInfoBoxRect = planetInfoBoxDOMRef.current.getBoundingClientRect();
            const mountRect = mountRef.current.getBoundingClientRect();

            const hudPoints = [
                { x: planetInfoBoxRect.left - mountRect.left, y: planetInfoBoxRect.top - mountRect.top },
                { x: planetInfoBoxRect.right - mountRect.left, y: planetInfoBoxRect.top - mountRect.top },
                { x: planetInfoBoxRect.left - mountRect.left, y: planetInfoBoxRect.bottom - mountRect.top },
                { x: planetInfoBoxRect.right - mountRect.left, y: planetInfoBoxRect.bottom - mountRect.top },
                { x: planetInfoBoxRect.left + planetInfoBoxRect.width / 2 - mountRect.left, y: planetInfoBoxRect.top - mountRect.top },
                { x: planetInfoBoxRect.left + planetInfoBoxRect.width / 2 - mountRect.left, y: planetInfoBoxRect.bottom - mountRect.top },
                { x: planetInfoBoxRect.left - mountRect.left, y: planetInfoBoxRect.top + planetInfoBoxRect.height / 2 - mountRect.top },
                { x: planetInfoBoxRect.right - mountRect.left, y: planetInfoBoxRect.top + planetInfoBoxRect.height / 2 - mountRect.top },
            ];

            planetProjectionLinesRef.current.forEach((line, index) => {
              if (!cameraRef.current || !mountRef.current || index >= hudPoints.length) return;
              const linePositions = line.geometry.attributes.position.array as Float32Array;
              linePositions[0] = planetEmitterWorldPos.x; linePositions[1] = planetEmitterWorldPos.y; linePositions[2] = planetEmitterWorldPos.z;
              const screenX = hudPoints[index].x + (Math.random() - 0.5) * PROJECTION_LINE_ENDPOINT_GLITCH_NDC_AMOUNT * mountRef.current.clientWidth;
              const screenY = hudPoints[index].y + (Math.random() - 0.5) * PROJECTION_LINE_ENDPOINT_GLITCH_NDC_AMOUNT * mountRef.current.clientHeight;
              const ndcX = (screenX / mountRef.current.clientWidth) * 2 - 1;
              const ndcY = -(screenY / mountRef.current.clientHeight) * 2 + 1;
              const hudPoint = new THREE.Vector3(ndcX, ndcY, -0.9);
              hudPoint.unproject(cameraRef.current);
              linePositions[3] = hudPoint.x; linePositions[4] = hudPoint.y; linePositions[5] = hudPoint.z;
              line.geometry.attributes.position.needsUpdate = true;
            });
        } else { targetPlanetLineOpacityRef.current = 0; }
        currentPlanetLineOpacityRef.current = THREE.MathUtils.lerp(currentPlanetLineOpacityRef.current, targetPlanetLineOpacityRef.current, PROJECTION_LINE_OPACITY_LERP_SPEED);
        planetProjectionLinesRef.current.forEach(line => { if (line.material instanceof THREE.LineBasicMaterial) line.material.opacity = currentPlanetLineOpacityRef.current; line.visible = currentPlanetLineOpacityRef.current > 0.01; });

        if (hoveredObject === 'station1' && spaceStation1Ref.current && spaceStation1EmitterRef.current && cameraRef.current && stationInfoBoxDOMRef.current && stationProjectionLinesRef.current.length === NUM_PROJECTION_LINES && mountRef.current) {
            targetStationLineOpacityRef.current = PROJECTION_LINE_BASE_TARGET_OPACITY - Math.random() * PROJECTION_LINE_OPACITY_FLICKER_AMOUNT;
            targetStationLineOpacityRef.current = Math.max(0.1, targetStationLineOpacityRef.current);

            const stationEmitterWorldPos = new THREE.Vector3();
            spaceStation1EmitterRef.current.getWorldPosition(stationEmitterWorldPos);
            const stationInfoBoxRect = stationInfoBoxDOMRef.current.getBoundingClientRect();
            const mountRect = mountRef.current.getBoundingClientRect();

             const hudPoints = [
                { x: stationInfoBoxRect.left - mountRect.left, y: stationInfoBoxRect.top - mountRect.top },
                { x: stationInfoBoxRect.right - mountRect.left, y: stationInfoBoxRect.top - mountRect.top },
                { x: stationInfoBoxRect.left - mountRect.left, y: stationInfoBoxRect.bottom - mountRect.top },
                { x: stationInfoBoxRect.right - mountRect.left, y: stationInfoBoxRect.bottom - mountRect.top },
                { x: stationInfoBoxRect.left + stationInfoBoxRect.width / 2 - mountRect.left, y: stationInfoBoxRect.top - mountRect.top },
                { x: stationInfoBoxRect.left + stationInfoBoxRect.width / 2 - mountRect.left, y: stationInfoBoxRect.bottom - mountRect.top },
                { x: stationInfoBoxRect.left - mountRect.left, y: stationInfoBoxRect.top + stationInfoBoxRect.height / 2 - mountRect.top },
                { x: stationInfoBoxRect.right - mountRect.left, y: stationInfoBoxRect.top + stationInfoBoxRect.height / 2 - mountRect.top },
            ];
            stationProjectionLinesRef.current.forEach((line, index) => {
              if (!cameraRef.current || !mountRef.current || index >= hudPoints.length) return;
              const linePositions = line.geometry.attributes.position.array as Float32Array;
              linePositions[0] = stationEmitterWorldPos.x; linePositions[1] = stationEmitterWorldPos.y; linePositions[2] = stationEmitterWorldPos.z;
              const screenX = hudPoints[index].x + (Math.random() - 0.5) * PROJECTION_LINE_ENDPOINT_GLITCH_NDC_AMOUNT * mountRef.current.clientWidth;
              const screenY = hudPoints[index].y + (Math.random() - 0.5) * PROJECTION_LINE_ENDPOINT_GLITCH_NDC_AMOUNT * mountRef.current.clientHeight;
              const ndcX = (screenX / mountRef.current.clientWidth) * 2 - 1;
              const ndcY = -(screenY / mountRef.current.clientHeight) * 2 + 1;
              const hudPoint = new THREE.Vector3(ndcX, ndcY, -0.9);
              hudPoint.unproject(cameraRef.current);
              linePositions[3] = hudPoint.x; linePositions[4] = hudPoint.y; linePositions[5] = hudPoint.z;
              line.geometry.attributes.position.needsUpdate = true;
            });
        } else { targetStationLineOpacityRef.current = 0; }
        currentStationLineOpacityRef.current = THREE.MathUtils.lerp(currentStationLineOpacityRef.current, targetStationLineOpacityRef.current, PROJECTION_LINE_OPACITY_LERP_SPEED);
        stationProjectionLinesRef.current.forEach(line => { if (line.material instanceof THREE.LineBasicMaterial) line.material.opacity = currentStationLineOpacityRef.current; line.visible = currentStationLineOpacityRef.current > 0.01; });

        let determinedHoverTarget: string | null = null;
        if (spaceshipRef.current && shipIntroAnimationCompleteRef.current && shipControlReady) {
            if (planet1Ref.current && planet1Ref.current.visible) {
                const distanceToPlanet1 = spaceshipRef.current.position.distanceTo(planet1Ref.current.position);
                if (distanceToPlanet1 <= INFO_BOX_MAX_DISTANCE) determinedHoverTarget = 'planet1';
            }
            if (!determinedHoverTarget && spaceStation1Ref.current && spaceStation1Ref.current.visible) {
                const distanceToStation1 = spaceshipRef.current.position.distanceTo(spaceStation1Ref.current.position);
                if (distanceToStation1 <= INFO_BOX_MAX_DISTANCE) determinedHoverTarget = 'station1';
            }
        }
         if (determinedHoverTarget !== hoveredObject) setHoveredObject(determinedHoverTarget);
    } else {
        if (hoveredObject === 'planet1' || hoveredObject === 'station1') setHoveredObject(null);
        targetPlanetLineOpacityRef.current = 0;
        targetStationLineOpacityRef.current = 0;
        currentPlanetLineOpacityRef.current = THREE.MathUtils.lerp(currentPlanetLineOpacityRef.current, 0, PROJECTION_LINE_OPACITY_LERP_SPEED);
        planetProjectionLinesRef.current.forEach(line => { if (line.material instanceof THREE.LineBasicMaterial) line.material.opacity = currentPlanetLineOpacityRef.current; line.visible = currentPlanetLineOpacityRef.current > 0.01; });
        currentStationLineOpacityRef.current = THREE.MathUtils.lerp(currentStationLineOpacityRef.current, 0, PROJECTION_LINE_OPACITY_LERP_SPEED);
        stationProjectionLinesRef.current.forEach(line => { if (line.material instanceof THREE.LineBasicMaterial) line.material.opacity = currentStationLineOpacityRef.current; line.visible = currentStationLineOpacityRef.current > 0.01; });
    }

    if (shipControlReady || displayedSpeed > SPEEDOMETER_INITIAL_SPEED) {
        currentSpeedRef.current = THREE.MathUtils.lerp(currentSpeedRef.current, targetSpeedRef.current, SPEEDOMETER_LERP_SPEED);
        if (Math.abs(currentSpeedRef.current - targetSpeedRef.current) < 0.5) {
            currentSpeedRef.current = targetSpeedRef.current;
        }
        if (Math.round(currentSpeedRef.current) !== displayedSpeed) {
             setDisplayedSpeed(Math.round(currentSpeedRef.current));
        }
    } else if (!shipControlReady && displayedSpeed !== SPEEDOMETER_INITIAL_SPEED) {
        targetSpeedRef.current = SPEEDOMETER_INITIAL_SPEED;
        currentSpeedRef.current = THREE.MathUtils.lerp(currentSpeedRef.current, SPEEDOMETER_INITIAL_SPEED, SPEEDOMETER_LERP_SPEED);
         if (Math.round(currentSpeedRef.current) !== displayedSpeed) {
            setDisplayedSpeed(Math.round(currentSpeedRef.current));
        }
    }


    if (composerRef.current && rendererRef.current) composerRef.current.render(deltaTime);
  }, [clock, shipControlReady, currentOverlayOpacity, currentSceneKey, transitionState, hoveredObject, displayedSpeed]);

  const animateRef = useRef(animate);
  useEffect(() => { animateRef.current = animate; }, [animate]);

  const handleScrollRef = useRef(handleScroll);
  useEffect(() => { handleScrollRef.current = handleScroll; }, [handleScroll]);


  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount || rendererRef.current) return;

    const loadingManager = new THREE.LoadingManager(
        () => {
            setIsLoading(false);
            loadingMessageRef.current = "Scene ready!";

            calculateAndSetScrollableHeight();

            const pageScrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
            const currentScrollTop = window.scrollY;
            const initialProgress = pageScrollableHeight > 0 ? Math.min(currentScrollTop / pageScrollableHeight, 1.0) : 0;
            let initialSceneKeyVal: 'scene1' | 'scene2' = 'scene1';
             if (initialProgress > SCENE_CHANGE_SCROLL_THRESHOLD) {
                initialSceneKeyVal = 'scene2';
            }

            if (sceneRef.current) {
                if (initialSceneKeyVal === 'scene1' && scene1HdriRef.current) {
                    sceneRef.current.environment = scene1HdriRef.current;
                    sceneRef.current.background = scene1HdriRef.current;
                    setCurrentSceneKey('scene1');
                    setTransitionState('idle');
                    if (oceanModelRef.current) oceanModelRef.current.visible = false;
                } else if (initialSceneKeyVal === 'scene2' && scene2HdriRef.current) {
                    sceneRef.current.environment = scene2HdriRef.current;
                    sceneRef.current.background = scene2HdriRef.current;
                    setCurrentSceneKey('scene2');
                    setTransitionState('scene2Active');

                    if (planet1Ref.current) planet1Ref.current.visible = false;
                    if (spaceStation1Ref.current) spaceStation1Ref.current.visible = false;
                    if (wormholeRef.current) wormholeRef.current.visible = false;
                    if (oceanModelRef.current) oceanModelRef.current.visible = true;
                    targetPlanetLineOpacityRef.current = 0;
                    targetStationLineOpacityRef.current = 0;
                } else {
                     if(sceneRef.current && scene1HdriRef.current && !sceneRef.current.background) {
                        sceneRef.current.environment = scene1HdriRef.current;
                        sceneRef.current.background = scene1HdriRef.current;
                        setCurrentSceneKey('scene1');
                        setTransitionState('idle');
                        if (oceanModelRef.current) oceanModelRef.current.visible = false;
                     }
                }
            }

             requestAnimationFrame(() => {
                 if (handleScrollRef.current) handleScrollRef.current();
             });

            setCountdownDisplay(4);
            shipIntroAnimationCompleteRef.current = false;
        },
        (itemUrl, itemsLoaded, itemsTotal) => {
            const progress = (itemsLoaded / itemsTotal) * 100;
            setLoadingProgress(progress);
            const itemName = itemUrl.split('/').pop() || "asset";
            loadingMessageRef.current = `Loading: ${itemName} (${itemsLoaded}/${itemsTotal})`;
        },
        (itemUrl) => {
            console.error(`Error loading: ${itemUrl}`);
            const itemName = itemUrl.split('/').pop() || "asset";
            loadingMessageRef.current = `Error loading: ${itemName}`;
            setIsLoading(false);
        }
    );

    initThreeScene(currentMount, loadingManager);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoading) return;

    let frameId: number;
    const loop = () => {
        if (animateRef.current) animateRef.current();
        frameId = requestAnimationFrame(loop);
    };

    if (rendererRef.current) {
        clock.start();
        frameId = requestAnimationFrame(loop);
        animationFrameIdRef.current = frameId;
    }

    return () => {
        if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
        if (clock.running) clock.stop();
    };
  }, [isLoading, clock]);


  useEffect(() => {
    return () => {
      if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
          animationFrameIdRef.current = null;
      }
      if (clock.running) clock.stop();

      if (sceneRef.current) {
        sceneRef.current.traverse(object => {
          if (object instanceof THREE.Mesh) {
            object.geometry?.dispose();
            const material = object.material as THREE.Material | THREE.Material[];
            if (Array.isArray(material)) {
              material.forEach(mat => mat.dispose());
            } else if (material) {
              material.dispose();
            }
          }
        });
      }
      scene1HdriRef.current?.dispose();
      scene2HdriRef.current?.dispose();
      horizonParticleGeometryRef.current?.dispose();
      horizonParticleMaterialRef.current?.dispose();
      planetProjectionLinesRef.current.forEach(line => { line.geometry.dispose(); (line.material as THREE.Material).dispose(); });
      stationProjectionLinesRef.current.forEach(line => { line.geometry.dispose(); (line.material as THREE.Material).dispose(); });

      if (planet1EmitterRef.current) {
        planet1EmitterRef.current.geometry?.dispose();
        (planet1EmitterRef.current.material as THREE.Material)?.dispose();
      }
      if (spaceStation1EmitterRef.current) {
        spaceStation1EmitterRef.current.geometry?.dispose();
        (spaceStation1EmitterRef.current.material as THREE.Material)?.dispose();
      }
      oceanModelTextureMaterialsRef.current = [];

      composerRef.current?.dispose();
      if (bloomPassRef.current) bloomPassRef.current.dispose();
      bokehPassRef.current?.dispose();
      if (afterimagePassRef.current) afterimagePassRef.current.dispose();
      rendererRef.current?.dispose();
       if (mountRef.current && rendererRef.current?.domElement && rendererRef.current.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      spaceshipRef.current = null;
      wormholeRef.current = null;
      planet1Ref.current = null;
      spaceStation1Ref.current = null;
      oceanModelRef.current = null;
      composerRef.current = null;
      bloomPassRef.current = null;
      bokehPassRef.current = null;
      afterimagePassRef.current = null;
      shipMixerRef.current = null;
      planet1MixerRef.current = null;
      spaceStation1MixerRef.current = null;
      horizonParticleContainerRef.current = null;
      wormholeMaterial1Ref.current = null;
      wormholeMaterial2Ref.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResizeRef = useRef<() => void>(() => {});
  const handleMouseMoveRef = useRef<(event: MouseEvent) => void>(() => {});
  const handleDocumentMouseLeaveRef = useRef<() => void>(() => {});
  const handleDocumentMouseEnterRef = useRef<() => void>(() => {});

  useEffect(() => {
    handleResizeRef.current = () => {
        if (!mountRef.current || !rendererRef.current || !cameraRef.current || !composerRef.current || !bokehPassRef.current) return;
        const currentMount = mountRef.current; const width = currentMount.clientWidth; const height = currentMount.clientHeight;
        if (width === 0 || height === 0) return;
        cameraRef.current.aspect = width / height; cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height); composerRef.current.setSize(width, height);
        if (bloomPassRef.current) bloomPassRef.current.setSize(width, height);
        if (afterimagePassRef.current) afterimagePassRef.current.setSize(width, height);
        if (bokehPassRef.current && bokehPassRef.current.uniforms && bokehPassRef.current.uniforms['aspect']) {
           bokehPassRef.current.uniforms['aspect'].value = width / height;
        }
        calculateAndSetScrollableHeight();
    };
    const onResize = () => { if (handleResizeRef.current) handleResizeRef.current(); };
    if (typeof window !== 'undefined') { window.addEventListener('resize', onResize); window.addEventListener('resize', calculateAndSetScrollableHeight); }
    return () => { if (typeof window !== 'undefined') { window.removeEventListener('resize', onResize); window.removeEventListener('resize', calculateAndSetScrollableHeight); }};
  }, [calculateAndSetScrollableHeight]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    lastScrollYRef.current = window.scrollY;
    const onScroll = () => { if (handleScrollRef.current) handleScrollRef.current(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);


  useEffect(() => {
    handleMouseMoveRef.current = (event: MouseEvent) => {
        isMouseOutsideRef.current = false;
        if (mountRef.current && mountRef.current.clientWidth > 0 && mountRef.current.clientHeight > 0) {
            const newMouseX = (event.clientX / mountRef.current.clientWidth) * 2 - 1;
            const newMouseY = -(event.clientY / mountRef.current.clientHeight) * 2 + 1;
            mousePositionRef.current.set(newMouseX, newMouseY);
        }
    };
    handleDocumentMouseLeaveRef.current = () => { isMouseOutsideRef.current = true; };
    handleDocumentMouseEnterRef.current = () => { isMouseOutsideRef.current = false; };

    const onMouseMove = (e: MouseEvent) => { if (handleMouseMoveRef.current) handleMouseMoveRef.current(e);};
    const onMouseLeave = () => { if (handleDocumentMouseLeaveRef.current) handleDocumentMouseLeaveRef.current();};
    const onMouseEnter = () => { if (handleDocumentMouseEnterRef.current) handleDocumentMouseEnterRef.current();};

    if (typeof window !== 'undefined') window.addEventListener('mousemove', onMouseMove);
    if (typeof document !== 'undefined') {
        document.documentElement.addEventListener('mouseleave', onMouseLeave);
        document.documentElement.addEventListener('mouseenter', onMouseEnter);
    }
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('mousemove', onMouseMove);
      if (typeof document !== 'undefined') {
          document.documentElement.removeEventListener('mouseleave', onMouseLeave);
          document.documentElement.removeEventListener('mouseenter', onMouseEnter);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (currentSceneKey === 'scene2' && (transitionState === 'scene2Active' || transitionState === 'fadingInToScene2')) {
        document.documentElement.classList.add('scene2-nav-active');
      } else {
        document.documentElement.classList.remove('scene2-nav-active');
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('scene2-nav-active');
      }
    };
  }, [currentSceneKey, transitionState]);


  return (
    <>
      {isLoading && (
         <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
          <p className="text-2xl text-primary-foreground mb-4 text-holographic">{loadingMessageRef.current}</p>
          <Progress value={loadingProgress} className="w-1/2 max-w-md" />
        </div>
      )}
      {!isLoading && countdownDisplay !== null && (
         <div
            className="fixed inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
            style={{
              color: 'hsl(var(--primary-foreground))',
              textShadow: '0 0 10px hsl(var(--primary)), 0 0 20px hsl(var(--primary))',
            }}
          >
            {countdownDisplay !== "GO!" && (
              <p className="text-5xl sm:text-7xl font-bold mb-4 text-holographic">
                PREPARE TO LAUNCH
              </p>
            )}
            <p
              className="text-8xl sm:text-9xl font-extrabold text-holographic"
              ref={countdownDisplay === "GO!" ? goGlitch.ref : undefined}
            >
              {countdownDisplay}
            </p>
          </div>
      )}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'white', opacity: currentOverlayOpacity, zIndex: 50, pointerEvents: currentOverlayOpacity > 0.01 ? 'auto' : 'none', transition: 'opacity 0s' }} />
      <TechHudOverlay />
      <LottieAnimation />
      <PlanetInfoBox ref={planetInfoBoxDOMRef} isVisible={hoveredObject === 'planet1' && currentSceneKey === 'scene1' && (transitionState === 'idle' || transitionState === 'fadingInToScene1')} />
      <StationInfoBox ref={stationInfoBoxDOMRef} isVisible={hoveredObject === 'station1' && currentSceneKey === 'scene1' && (transitionState === 'idle' || transitionState === 'fadingInToScene1')} />
      <SpeedometerHUD currentSpeed={displayedSpeed} maxSpeed={SPEEDOMETER_MAX_GAUGE_SPEED} />
      <div ref={mountRef} style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0, visibility: isLoading ? 'hidden' : 'visible' }} />
    </>
  );
};

export default ScrollSurferScene;

    

