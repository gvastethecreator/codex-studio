import { useEffect, useRef, useState } from 'react';

type ThreeModule = typeof import('three');
type ThreeBufferGeometry = import('three').BufferGeometry;
type ThreeColor = import('three').Color;
type ThreeMaterial = import('three').Material;
type ThreeMesh = import('three').Mesh;
type ThreeMeshBasicMaterial = import('three').MeshBasicMaterial;
type ThreePlaneGeometry = import('three').PlaneGeometry;
type ThreeScene = import('three').Scene;
type ThreeTexture = import('three').Texture;
type ThreeSubjectMesh = {
  geometry: ThreePlaneGeometry;
  material: ThreeMeshBasicMaterial;
};

const loadThree = () => import('three');

export interface CameraViewportState {
  azimuth: number;
  elevation: number;
  distance: number;
}

export interface UseCameraViewportOptions {
  aspectRatio: string;
  referenceImageSrc?: string | null;
  initialState?: Partial<CameraViewportState>;
}

export interface UseCameraViewportResult {
  mountRef: React.RefObject<HTMLDivElement | null>;
  cameraState: CameraViewportState;
  setAzimuth: React.Dispatch<React.SetStateAction<number>>;
  setElevation: React.Dispatch<React.SetStateAction<number>>;
  setDistance: React.Dispatch<React.SetStateAction<number>>;
}

const createGradientTexture = (THREE: ThreeModule, colorStart: string, colorEnd: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 256, 0);
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(1, colorEnd);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

const applyGradientToGeometry = (
  THREE: ThreeModule,
  geometry: ThreeBufferGeometry,
  colorA: ThreeColor,
  colorB: ThreeColor,
  axis: 'z' | 'y',
  reverse = false,
) => {
  const count = geometry.attributes.position.count;
  const colors = new Float32Array(count * 3);
  const positions = geometry.attributes.position.array;

  let min = Infinity;
  let max = -Infinity;
  for (let index = 0; index < count; index += 1) {
    const value = positions[index * 3 + (axis === 'z' ? 2 : 1)];
    if (value < min) min = value;
    if (value > max) max = value;
  }

  const range = max - min || 1;

  for (let index = 0; index < count; index += 1) {
    const value = positions[index * 3 + (axis === 'z' ? 2 : 1)];
    let t = (value - min) / range;
    if (reverse) t = 1 - t;
    const eased = t * t * (3 - 2 * t);

    colors[index * 3] = THREE.MathUtils.lerp(colorA.r, colorB.r, eased);
    colors[index * 3 + 1] = THREE.MathUtils.lerp(colorA.g, colorB.g, eased);
    colors[index * 3 + 2] = THREE.MathUtils.lerp(colorA.b, colorB.b, eased);
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
};

const parseAspectRatio = (aspectRatio: string) => {
  const [width = 1, height = 1] = aspectRatio.split(':').map(Number);
  return {
    width,
    height,
    ratioValue: width / Math.max(height, 1),
    planeRatio: height / Math.max(width, 1),
  };
};

const disposeMaterial = (material: ThreeMaterial | ThreeMaterial[] | undefined) => {
  if (!material) return;
  if (Array.isArray(material)) {
    material.forEach((entry) => entry.dispose());
    return;
  }
  material.dispose();
};

const disposeScene = (scene: ThreeScene) => {
  scene.traverse((object) => {
    if ('geometry' in object) {
      const geometry = (object as ThreeMesh).geometry;
      geometry?.dispose?.();
    }

    if ('material' in object) {
      disposeMaterial(
        (object as ThreeMesh).material as ThreeMaterial | ThreeMaterial[] | undefined,
      );
    }
  });
};

export const useCameraViewport = ({
  aspectRatio,
  referenceImageSrc,
  initialState,
}: UseCameraViewportOptions): UseCameraViewportResult => {
  const [azimuth, setAzimuth] = useState(initialState?.azimuth ?? 0);
  const [elevation, setElevation] = useState(initialState?.elevation ?? 0);
  const [distance, setDistance] = useState(initialState?.distance ?? 100);

  const mountRef = useRef<HTMLDivElement>(null);
  const sceneObjects = useRef<Record<string, any>>({});
  const stateRef = useRef<
    CameraViewportState & {
      lastRenderedAz?: number;
      lastRenderedEl?: number;
      lastRenderedDist?: number;
    }
  >({
    azimuth: initialState?.azimuth ?? 0,
    elevation: initialState?.elevation ?? 0,
    distance: initialState?.distance ?? 100,
  });

  const hasReference = Boolean(referenceImageSrc);
  const hasReferenceRef = useRef(hasReference);

  useEffect(() => {
    stateRef.current = { ...stateRef.current, azimuth, elevation, distance };
  }, [azimuth, elevation, distance]);

  useEffect(() => {
    hasReferenceRef.current = hasReference;
  }, [hasReference]);

  useEffect(() => {
    if (!mountRef.current) return;

    const mountNode = mountRef.current;
    let cancelled = false;
    let cleanupViewport: (() => void) | undefined;

    void loadThree().then((THREE) => {
      if (cancelled || mountRef.current !== mountNode) return;

      const { planeRatio } = parseAspectRatio(aspectRatio);
      const width = mountNode.clientWidth;
      const height = mountNode.clientHeight;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x050505);
      scene.fog = new THREE.FogExp2(0x050505, 0.02);

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(20, 16, 20);
      camera.lookAt(0, 1, 0);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      mountNode.appendChild(renderer.domElement);

      const pipMountNode = mountNode.querySelector('.pip-viewport') as HTMLElement | null;
      let pipRenderer: import('three').WebGLRenderer | null = null;
      let pipCamera: import('three').PerspectiveCamera | null = null;

      if (pipMountNode) {
        const pipWidth = pipMountNode.clientWidth;
        const pipHeight = pipMountNode.clientHeight;
        pipCamera = new THREE.PerspectiveCamera(50, pipWidth / pipHeight, 0.1, 100);
        pipRenderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        });
        pipRenderer.setSize(pipWidth, pipHeight);
        pipRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        pipMountNode.appendChild(pipRenderer.domElement);
      }

      const ambient = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambient);

      const keyLight = new THREE.DirectionalLight(0xffffff, 1);
      keyLight.position.set(10, 20, 10);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;
      keyLight.shadow.camera.left = -20;
      keyLight.shadow.camera.right = 20;
      keyLight.shadow.camera.top = 20;
      keyLight.shadow.camera.bottom = -20;
      scene.add(keyLight);

      const rimLight = new THREE.SpotLight(0x06b6d4, 5);
      rimLight.position.set(-15, 10, -15);
      rimLight.lookAt(0, 0, 0);
      scene.add(rimLight);

      const grid = new THREE.PolarGridHelper(50, 24, 20, 64, 0x222222, 0x111111);
      grid.position.y = -0.01;
      scene.add(grid);
      sceneObjects.current.grid = grid;

      const axisGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.03, 0),
        new THREE.Vector3(0, 0.03, 50),
      ]);
      const axisMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        opacity: 0.6,
        transparent: true,
      });
      const frontAxis = new THREE.Line(axisGeometry, axisMaterial);
      scene.add(frontAxis);

      const subjectGroup = new THREE.Group();

      const baseGeometry = new THREE.CylinderGeometry(2, 2.5, 0.2, 32);
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.8,
        roughness: 0.2,
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.receiveShadow = true;
      subjectGroup.add(base);

      const frameGeometry = new THREE.PlaneGeometry(3.2, 3.2 * planeRatio);
      const frameMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        side: THREE.DoubleSide,
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.y = (3.2 * planeRatio) / 2;

      const edges = new THREE.EdgesGeometry(frameGeometry);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x444444 });
      const frameOutline = new THREE.LineSegments(edges, lineMaterial);
      frame.add(frameOutline);

      subjectGroup.add(frame);
      sceneObjects.current.frame = frame;

      const imageGeometry = new THREE.PlaneGeometry(3, 3 * planeRatio);
      const imageMaterial = new THREE.MeshBasicMaterial({
        color: 0x222222,
        side: THREE.DoubleSide,
        transparent: true,
      });
      const subject = new THREE.Mesh(imageGeometry, imageMaterial);
      subject.position.z = 0.05;
      frame.add(subject);
      sceneObjects.current.subject = subject;

      if (referenceImageSrc) {
        const loader = new THREE.TextureLoader();
        loader.load(
          referenceImageSrc,
          (texture) => {
            if (cancelled || sceneObjects.current.subject !== subject) {
              texture.dispose();
              return;
            }

            texture.colorSpace = THREE.SRGBColorSpace;
            const existingTexture = subject.material.map as ThreeTexture | null;
            if (existingTexture && existingTexture !== texture) {
              existingTexture.dispose();
            }

            subject.material.map = texture;
            subject.material.color.setHex(0xffffff);
            subject.material.needsUpdate = true;
            stateRef.current.lastRenderedAz = -999;
          },
          undefined,
          () => {},
        );
      }

      scene.add(subjectGroup);

      const ringCurve = new THREE.EllipseCurve(0, 0, 8, 8, 0, 2 * Math.PI, false, 0);
      const ringPoints = ringCurve.getPoints(64);
      const ringCurve3 = new THREE.CatmullRomCurve3(
        ringPoints.map((point) => new THREE.Vector3(point.x, point.y, 0)),
        true,
      );
      const ringGeometry = new THREE.TubeGeometry(ringCurve3, 64, 0.08, 8, true);
      const azimuthTexture = createGradientTexture(THREE, '#083344', '#22d3ee');
      const ringMaterial = new THREE.MeshBasicMaterial({
        map: azimuthTexture,
        transparent: true,
        opacity: 0.9,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
      sceneObjects.current.ring = ring;

      const azimuthHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.15, 32),
        new THREE.MeshBasicMaterial({ color: 0x06b6d4 }),
      );
      scene.add(azimuthHandle);
      sceneObjects.current.azHandle = azimuthHandle;

      const arcRadius = 8;
      const curvePoints: import('three').Vector3[] = [];
      for (let index = 0; index <= 64; index += 1) {
        const t = (index / 64) * Math.PI;
        curvePoints.push(new THREE.Vector3(Math.cos(t) * arcRadius, Math.sin(t) * arcRadius, 0));
      }
      const arcCurve = new THREE.CatmullRomCurve3(curvePoints);
      const arcGeometry = new THREE.TubeGeometry(arcCurve, 64, 0.06, 8, false);
      const elevationTexture = createGradientTexture(THREE, '#831843', '#f472b6');
      const arcMaterial = new THREE.MeshBasicMaterial({ map: elevationTexture });
      const arcLine = new THREE.Mesh(arcGeometry, arcMaterial);
      scene.add(arcLine);
      sceneObjects.current.arcLine = arcLine;

      const cameraGroup = new THREE.Group();

      const bodyGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.8);
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xffaa00,
        roughness: 0.2,
        metalness: 0.6,
      });
      const cameraBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
      cameraGroup.add(cameraBody);

      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(1.25, 0.4, 1.2),
        new THREE.MeshBasicMaterial({ color: 0x111111 }),
      );
      cameraGroup.add(stripe);

      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.55, 0.8, 32),
        new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.2 }),
      );
      barrel.rotation.x = Math.PI / 2;
      barrel.position.z = 1.2;
      cameraGroup.add(barrel);

      const glass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.1, 32),
        new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 1, roughness: 0 }),
      );
      glass.rotation.x = Math.PI / 2;
      glass.position.z = 1.61;
      cameraGroup.add(glass);

      const viewFinder = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.4, 1.0),
        new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.2 }),
      );
      viewFinder.position.y = 0.8;
      cameraGroup.add(viewFinder);

      const frustumHeight = 8;
      const frustumGeometry = new THREE.ConeGeometry(3, frustumHeight, 4, 1, true);
      frustumGeometry.rotateX(-Math.PI / 2);
      frustumGeometry.translate(0, 0, 1.6 + frustumHeight / 2);

      const frustumMaterial = new THREE.MeshBasicMaterial({
        color: 0xfacc15,
        transparent: true,
        opacity: 0.05,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const frustum = new THREE.Mesh(frustumGeometry, frustumMaterial);
      cameraGroup.add(frustum);

      const frustumEdges = new THREE.LineSegments(
        new THREE.WireframeGeometry(frustumGeometry),
        new THREE.LineBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.4 }),
      );
      cameraGroup.add(frustumEdges);

      const rayLength = 50;
      const rayGeometry = new THREE.CylinderGeometry(0.04, 0.04, rayLength, 8);
      rayGeometry.rotateX(Math.PI / 2);
      rayGeometry.translate(0, 0, 1.6 + rayLength / 2);
      const rayMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0055,
        transparent: true,
        opacity: 0.9,
      });
      const ray = new THREE.Mesh(rayGeometry, rayMaterial);
      cameraGroup.add(ray);

      scene.add(cameraGroup);
      sceneObjects.current.camGroup = cameraGroup;

      const elevationHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.15, 32),
        new THREE.MeshBasicMaterial({ color: 0xec4899 }),
      );
      elevationHandle.rotation.x = Math.PI / 2;
      scene.add(elevationHandle);
      sceneObjects.current.elHandle = elevationHandle;

      const gridRadius = 50;
      const azimuthGroup = new THREE.Group();
      azimuthGroup.position.y = 0.05;

      const azimuthCoreGeometry = new THREE.CylinderGeometry(0.03, 0.03, gridRadius, 32);
      azimuthCoreGeometry.rotateX(Math.PI / 2);
      azimuthCoreGeometry.translate(0, 0, gridRadius / 2);
      applyGradientToGeometry(
        THREE,
        azimuthCoreGeometry,
        new THREE.Color(0x22d3ee),
        new THREE.Color(0x0e7490),
        'z',
        true,
      );
      const azimuthCoreMaterial = new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
      });
      const azimuthCore = new THREE.Mesh(azimuthCoreGeometry, azimuthCoreMaterial);
      azimuthGroup.add(azimuthCore);

      const azimuthOutlineGeometry = new THREE.CylinderGeometry(0.05, 0.05, gridRadius, 32);
      azimuthOutlineGeometry.rotateX(Math.PI / 2);
      azimuthOutlineGeometry.translate(0, 0, gridRadius / 2);
      const azimuthOutlineMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        side: THREE.BackSide,
      });
      const azimuthOutline = new THREE.Mesh(azimuthOutlineGeometry, azimuthOutlineMaterial);
      azimuthGroup.add(azimuthOutline);

      scene.add(azimuthGroup);
      sceneObjects.current.azGroup = azimuthGroup;

      const distanceGroup = new THREE.Group();
      distanceGroup.position.y = 0.05;
      const distanceCoreGeometry = new THREE.TorusGeometry(1, 0.015, 32, 128);
      distanceCoreGeometry.rotateX(Math.PI / 2);
      const distanceCoreMaterial = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      const distanceCore = new THREE.Mesh(distanceCoreGeometry, distanceCoreMaterial);
      distanceGroup.add(distanceCore);
      const distanceOutlineGeometry = new THREE.TorusGeometry(1, 0.03, 32, 128);
      distanceOutlineGeometry.rotateX(Math.PI / 2);
      const distanceOutlineMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        side: THREE.BackSide,
      });
      const distanceOutline = new THREE.Mesh(distanceOutlineGeometry, distanceOutlineMaterial);
      distanceGroup.add(distanceOutline);

      scene.add(distanceGroup);
      sceneObjects.current.distGroup = distanceGroup;

      const heightGroup = new THREE.Group();
      const heightCoreGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1, 16);
      heightCoreGeometry.translate(0, 0.5, 0);
      applyGradientToGeometry(
        THREE,
        heightCoreGeometry,
        new THREE.Color(0xec4899),
        new THREE.Color(0xfacc15),
        'y',
        true,
      );
      const heightCoreMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });
      const heightCore = new THREE.Mesh(heightCoreGeometry, heightCoreMaterial);
      heightGroup.add(heightCore);
      const heightOutlineGeometry = new THREE.CylinderGeometry(0.035, 0.035, 1, 16);
      heightOutlineGeometry.translate(0, 0.5, 0);
      const heightOutlineMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        side: THREE.BackSide,
      });
      const heightOutline = new THREE.Mesh(heightOutlineGeometry, heightOutlineMaterial);
      heightGroup.add(heightOutline);

      scene.add(heightGroup);
      sceneObjects.current.hGroup = heightGroup;

      const requestIdRef = { current: 0 };
      let needsUpdate = true;

      const animate = () => {
        const {
          azimuth: currentAzimuth,
          elevation: currentElevation,
          distance: currentDistance,
        } = stateRef.current;

        if (
          sceneObjects.current.subject &&
          sceneObjects.current.subject.visible !== hasReferenceRef.current
        ) {
          sceneObjects.current.subject.visible = hasReferenceRef.current;
          needsUpdate = true;
        }

        if (
          currentAzimuth !== stateRef.current.lastRenderedAz ||
          currentElevation !== stateRef.current.lastRenderedEl ||
          currentDistance !== stateRef.current.lastRenderedDist
        ) {
          needsUpdate = true;
          stateRef.current.lastRenderedAz = currentAzimuth;
          stateRef.current.lastRenderedEl = currentElevation;
          stateRef.current.lastRenderedDist = currentDistance;
        }

        if (needsUpdate) {
          const phi = THREE.MathUtils.degToRad(90 - currentElevation);
          const theta = THREE.MathUtils.degToRad(currentAzimuth);
          const radius = 8;
          const visualDistance = 4 + ((200 - currentDistance) / 200) * 8;

          const camX = visualDistance * Math.sin(phi) * Math.sin(theta);
          const camY = visualDistance * Math.cos(phi);
          const camZ = visualDistance * Math.sin(phi) * Math.cos(theta);
          const targetY = (3.2 * planeRatio) / 2;

          cameraGroup.position.set(camX, camY + targetY, camZ);
          cameraGroup.lookAt(0, targetY, 0);

          if (arcLine) {
            arcLine.rotation.y = theta + Math.PI / 2;
            arcLine.position.y = targetY;
          }

          const elevationX = radius * Math.sin(phi) * Math.sin(theta);
          const elevationY = radius * Math.cos(phi);
          const elevationZ = radius * Math.sin(phi) * Math.cos(theta);
          elevationHandle.position.set(elevationX, elevationY + targetY, elevationZ);
          elevationHandle.lookAt(0, targetY, 0);

          azimuthHandle.position.set(radius * Math.sin(theta), 0, radius * Math.cos(theta));

          if (azimuthGroup) {
            azimuthGroup.rotation.y = theta;
          }

          const groundRadius = Math.sqrt(camX * camX + camZ * camZ);
          if (distanceGroup) {
            distanceGroup.scale.setScalar(groundRadius);
          }

          if (heightGroup) {
            heightGroup.position.set(camX, 0, camZ);
            const totalHeight = camY + targetY;
            heightGroup.scale.set(1, totalHeight, 1);
          }

          if (pipCamera && cameraGroup) {
            cameraGroup.getWorldPosition(pipCamera.position);
            pipCamera.lookAt(0, targetY, 0);
          }

          renderer.render(scene, camera);

          if (pipRenderer && pipCamera && cameraGroup) {
            const guides = [
              sceneObjects.current.ring,
              sceneObjects.current.azHandle,
              sceneObjects.current.arcLine,
              sceneObjects.current.elHandle,
              sceneObjects.current.azGroup,
              sceneObjects.current.hGroup,
            ];

            cameraGroup.visible = false;
            guides.forEach((guide) => {
              if (guide) guide.visible = false;
            });

            pipRenderer.render(scene, pipCamera);

            cameraGroup.visible = true;
            guides.forEach((guide) => {
              if (guide) guide.visible = true;
            });

            if (sceneObjects.current.subject) {
              sceneObjects.current.subject.visible = hasReferenceRef.current;
            }
          }

          needsUpdate = false;
        }

        requestIdRef.current = requestAnimationFrame(animate);
      };

      requestIdRef.current = requestAnimationFrame(animate);

      let isDragging = false;
      let lastX = 0;
      let lastY = 0;

      const onMouseDown = (event: MouseEvent) => {
        isDragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
        document.body.style.cursor = 'grabbing';
      };

      const onMouseMove = (event: MouseEvent) => {
        if (!isDragging) return;

        const deltaX = event.clientX - lastX;
        const deltaY = event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;

        setAzimuth((previous) => {
          const next = previous + deltaX * 0.5;
          if (next > 180) return next - 360;
          if (next < -180) return next + 360;
          return next;
        });

        setElevation((previous) => {
          const next = previous - deltaY * 0.5;
          return Math.max(-89, Math.min(89, next));
        });
      };

      const onMouseUp = () => {
        isDragging = false;
        document.body.style.cursor = 'default';
      };

      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        const delta = event.deltaY * 0.1;
        setDistance((previous) => Math.max(20, Math.min(200, previous - delta)));
      };

      const canvasElement = renderer.domElement;
      canvasElement.addEventListener('mousedown', onMouseDown);
      canvasElement.addEventListener('wheel', onWheel, { passive: false });
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);

      const resizeObserver = new ResizeObserver((entries) => {
        if (!Array.isArray(entries) || entries.length === 0) return;

        window.requestAnimationFrame(() => {
          if (!mountRef.current) return;

          const nextWidth = mountNode.clientWidth;
          const nextHeight = mountNode.clientHeight;
          camera.aspect = nextWidth / nextHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(nextWidth, nextHeight);

          if (pipMountNode && pipRenderer && pipCamera) {
            const pipWidth = pipMountNode.clientWidth;
            const pipHeight = pipMountNode.clientHeight;
            pipCamera.aspect = pipWidth / pipHeight;
            pipCamera.updateProjectionMatrix();
            pipRenderer.setSize(pipWidth, pipHeight);
          }

          needsUpdate = true;
        });
      });
      resizeObserver.observe(mountNode);

      cleanupViewport = () => {
        cancelAnimationFrame(requestIdRef.current);
        resizeObserver.disconnect();
        canvasElement.removeEventListener('mousedown', onMouseDown);
        canvasElement.removeEventListener('wheel', onWheel);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = 'default';

        if (renderer.domElement.parentNode === mountNode) {
          mountNode.removeChild(renderer.domElement);
        }
        renderer.dispose();

        if (pipRenderer && pipMountNode && pipRenderer.domElement.parentNode === pipMountNode) {
          pipMountNode.removeChild(pipRenderer.domElement);
          pipRenderer.dispose();
        }

        disposeScene(scene);
        sceneObjects.current = {};
      };
    });

    return () => {
      cancelled = true;
      cleanupViewport?.();
    };
  }, [aspectRatio, hasReference]);

  useEffect(() => {
    const subject = sceneObjects.current.subject as ThreeSubjectMesh | undefined;
    if (!subject) return;

    if (!referenceImageSrc) {
      const existingTexture = subject.material.map as ThreeTexture | null;
      existingTexture?.dispose();
      subject.material.map = null;
      subject.material.color.setHex(0x222222);
      subject.material.needsUpdate = true;
      stateRef.current.lastRenderedAz = -999;
      return;
    }

    let cancelled = false;
    void loadThree().then((THREE) => {
      if (cancelled) return;

      const loader = new THREE.TextureLoader();
      loader.load(
        referenceImageSrc,
        (texture) => {
          if (cancelled) {
            texture.dispose();
            return;
          }

          texture.colorSpace = THREE.SRGBColorSpace;
          const existingTexture = subject.material.map as ThreeTexture | null;
          if (existingTexture && existingTexture !== texture) {
            existingTexture.dispose();
          }

          subject.material.map = texture;
          subject.material.color.setHex(0xffffff);
          subject.material.needsUpdate = true;
          stateRef.current.lastRenderedAz = -999;
        },
        undefined,
        () => {},
      );
    });

    return () => {
      cancelled = true;
    };
  }, [referenceImageSrc]);

  return {
    mountRef,
    cameraState: { azimuth, elevation, distance },
    setAzimuth,
    setElevation,
    setDistance,
  };
};
