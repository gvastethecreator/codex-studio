import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Video, Upload, X, RotateCw, ArrowUpFromLine, ZoomIn, Camera, Eye, Move3d, SlidersHorizontal, Loader2, Maximize2, MousePointer2 } from 'lucide-react';
import * as THREE from 'three';
import type { Attachment, ImageGenerationConfig, GeneratedImageWithConfig } from '../../types';
import { RecipeLayout } from './RecipeLayout';

interface CameraAnglesRecipeProps {
  config: ImageGenerationConfig;
  updateConfig: <K extends keyof ImageGenerationConfig>(key: K, value: ImageGenerationConfig[K]) => void;
  updateAttachment: (id: string, newProps: Partial<Attachment>) => void;
  onFileSelect: (files: File[]) => void;
  onGenerate: (prompt?: string) => void;
  isGenerating: boolean;
  images: GeneratedImageWithConfig[];
  onSelectImage: (image: GeneratedImageWithConfig) => void;
}

// Helper to translate raw math into director's language
const getDirectorInstructions = (az: number, el: number, dist: number) => {
    // 1. Camera Horizontal Position
    let side = az > 0 ? "RIGHT" : "LEFT";
    let hPos = "FRONT CENTER (0°)";
    const absAz = Math.abs(az);
    
    if (absAz > 10 && absAz <= 45) hPos = `${side} 3/4 ANGLE (Oblique)`;
    if (absAz > 45 && absAz <= 110) hPos = `${side} PROFILE (Side View)`;
    if (absAz > 110 && absAz <= 160) hPos = `${side} REAR 3/4 ANGLE (Behind)`;
    if (absAz > 160) hPos = "DIRECT BACK VIEW (Rear)";

    // 2. Camera Vertical Position
    let vPos = "EYE-LEVEL";
    if (el > 20) vPos = "HIGH-ANGLE (Looking Down)";
    if (el > 60) vPos = "OVERHEAD / BIRD'S EYE (Top-Down)";
    if (el < -20) vPos = "LOW-ANGLE (Looking Up)";
    if (el < -60) vPos = "WORM'S EYE (Ground View)";

    // 3. Framing / Lens
    let framing = "MEDIUM SHOT";
    if (dist < 50) framing = "WIDE ANGLE (Environment visible)";
    if (dist > 130) framing = "CLOSE-UP (Tight face framing)";
    if (dist > 170) framing = "MACRO (Extreme detail)";

    return { hPos, vPos, framing };
};

// Helper to translate geometry into visual guidance for the prompt.
const getGeometryConstraints = (az: number, el: number) => {
    const constraints = [];
    const absAz = Math.abs(az);
    
    // Vertical Logic
    if (el > 35) constraints.push("Favor a high camera view with visible top planes of the head and shoulders.");
    else if (el < -35) constraints.push("Favor a low camera view with visible underside planes such as chin and jaw.");
    
    // Horizontal Logic
    if (absAz > 150) constraints.push("Back view requested: emphasize the back of the head and body, with minimal face visibility.");
    else if (absAz > 60 && absAz < 120) constraints.push("Profile view requested: favor a clear side silhouette and one-eye facial structure.");
    else if (absAz < 20) constraints.push("Front view requested: favor a centered, symmetrical composition.");
    
    return constraints.join(" ");
};

const createGradientTexture = (colorStart: string, colorEnd: string) => {
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

const applyGradientToGeometry = (geo: THREE.BufferGeometry, colorA: THREE.Color, colorB: THREE.Color, axis: 'z' | 'y', reverse: boolean = false) => {
    const count = geo.attributes.position.count;
    const colors = new Float32Array(count * 3);
    const positions = geo.attributes.position.array;
    
    let min = Infinity, max = -Infinity;
    for(let i=0; i<count; i++) {
        const val = positions[i * 3 + (axis === 'z' ? 2 : 1)];
        if(val < min) min = val;
        if(val > max) max = val;
    }

    const range = max - min || 1;

    for(let i=0; i<count; i++) {
        const val = positions[i * 3 + (axis === 'z' ? 2 : 1)];
        let t = (val - min) / range; 
        if (reverse) t = 1 - t;
        const tEase = t * t * (3 - 2 * t); 

        colors[i*3] = THREE.MathUtils.lerp(colorA.r, colorB.r, tEase);
        colors[i*3+1] = THREE.MathUtils.lerp(colorA.g, colorB.g, tEase);
        colors[i*3+2] = THREE.MathUtils.lerp(colorA.b, colorB.b, tEase);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
};

export const CameraAnglesRecipe: React.FC<CameraAnglesRecipeProps> = ({
  config,
  updateConfig,
  onFileSelect,
  isGenerating,
  images = [],
  onSelectImage
}) => {
  const [azimuth, setAzimuth] = useState(0);
  const [elevation, setElevation] = useState(0);
  const [distance, setDistance] = useState(100);
  const [isEstimating, setIsEstimating] = useState(false);
  
  const mountRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const sceneObjects = useRef<any>({});
  const stateRef = useRef({ azimuth, elevation, distance });

  const activeImage = config.attachments[0];
  const hasReference = !!activeImage;
  const hasReferenceRef = useRef(hasReference);
  
  // Calculate aspect ratio for the box
  const ratioValue = useMemo(() => {
    const [w, h] = config.aspectRatio.split(':').map(Number);
    return w / h;
  }, [config.aspectRatio]);
  
  // Find images generated by this recipe specifically
  const cameraImages = useMemo(() => {
      return images.filter(img => img.config.recipeContext?.includes("CAMERA VIEW PROMPT"));
  }, [images]);

  useEffect(() => {
    stateRef.current = { azimuth, elevation, distance };
  }, [azimuth, elevation, distance]);

  useEffect(() => {
    hasReferenceRef.current = hasReference;
  }, [hasReference]);

  useEffect(() => {
    // Round values for prompt precision and consistency
    const roundedAz = Math.round(azimuth);
    const roundedEl = Math.round(elevation);
    const roundedDist = Math.round(distance);

    const { hPos, vPos, framing } = getDirectorInstructions(roundedAz, roundedEl, roundedDist);
    const geometryConstraints = getGeometryConstraints(roundedAz, roundedEl);

    // Prompt guidance: the local image tool can use references and camera intent,
    // but it cannot guarantee exact 3D reconstruction.
    const technicalContext = `
--- CAMERA VIEW PROMPT ---
ROLE: Image art director translating a reference and camera position into a plausible generated still.
${hasReference ? 'INPUT: A 2D reference image used as visual guidance for subject identity, style, and lighting.' : 'INPUT: A text description of the subject to be composed.'}
OBJECTIVE: Generate a ${hasReference ? 'plausible alternate view of the referenced subject' : 'subject image'} using the camera guidance below.

TARGET CAMERA TRANSFORM:
- ORBIT (Azimuth): ${roundedAz}° (${hPos})
- PITCH (Elevation): ${roundedEl}° (${vPos})
- ZOOM (Field of View): ${roundedDist}% (${framing})

VISUAL GUIDANCE:
${geometryConstraints}

GENERATION DIRECTIVES:
1. Keep subject identity, outfit, palette, and lighting as consistent as possible with the prompt/reference.
2. Use the requested orbit, pitch, and zoom as strong composition guidance.
3. Add plausible matching details for areas not visible in the reference.
4. Preserve the reference style where possible; prefer a neutral background when the source background is ambiguous.
--- END PROMPT ---
`;
    updateConfig('recipeContext', technicalContext);
    
    return () => updateConfig('recipeContext', '');
  }, [azimuth, elevation, distance, hasReference, updateConfig]);

  useEffect(() => {
    if (!mountRef.current) return;

    const mountNode = mountRef.current;
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
        powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    mountNode.appendChild(renderer.domElement);

    const pipMountNode = mountNode.querySelector('.pip-viewport') as HTMLElement;
    let pipRenderer: THREE.WebGLRenderer | null = null;
    let pipCamera: THREE.PerspectiveCamera | null = null;
    if (pipMountNode) {
        const pipWidth = pipMountNode.clientWidth;
        const pipHeight = pipMountNode.clientHeight;
        
        pipCamera = new THREE.PerspectiveCamera(50, pipWidth / pipHeight, 0.1, 100);
        
        pipRenderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance",
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

    // --- FRONT AXIS INDICATOR ---
    const axisGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.03, 0),
        new THREE.Vector3(0, 0.03, 50)
    ]);
    const axisMat = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.6, transparent: true });
    const frontAxis = new THREE.Line(axisGeo, axisMat);
    scene.add(frontAxis);
    // ----------------------------

    const subjGroup = new THREE.Group();
    
    const baseGeo = new THREE.CylinderGeometry(2, 2.5, 0.2, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.2 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.receiveShadow = true;
    subjGroup.add(base);

    // Setup Frame (Black Box with Grey Border)
    const [w, h] = config.aspectRatio.split(':').map(Number);
    const ratio = h / w;

    const frameGeo = new THREE.PlaneGeometry(3.2, 3.2 * ratio);
    const frameMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = (3.2 * ratio) / 2;
    
    // Add gray border outline to frame
    const edges = new THREE.EdgesGeometry(frameGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x444444 });
    const frameOutline = new THREE.LineSegments(edges, lineMat);
    frame.add(frameOutline);
    
    subjGroup.add(frame);
    sceneObjects.current.frame = frame;

    // Setup Subject (Image Plane)
    const imgGeo = new THREE.PlaneGeometry(3, 3 * ratio);
    const imgMat = new THREE.MeshBasicMaterial({ 
        color: 0x222222, 
        side: THREE.DoubleSide,
        transparent: true
    });
    const subject = new THREE.Mesh(imgGeo, imgMat);
    subject.position.z = 0.05; // Slightly in front of frame
    frame.add(subject); // Child of frame to move with it
    sceneObjects.current.subject = subject;
    
    scene.add(subjGroup);

    const ringCurve = new THREE.EllipseCurve(0, 0, 8, 8, 0, 2 * Math.PI, false, 0);
    const ringPoints = ringCurve.getPoints(64);
    const ringCurve3 = new THREE.CatmullRomCurve3(ringPoints.map(p => new THREE.Vector3(p.x, p.y, 0)), true); 
    const ringGeo = new THREE.TubeGeometry(ringCurve3, 64, 0.08, 8, true);
    
    const azTex = createGradientTexture('#083344', '#22d3ee');
    const ringMat = new THREE.MeshBasicMaterial({ 
        map: azTex, 
        transparent: true, 
        opacity: 0.9,
    }); 
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
    sceneObjects.current.ring = ring;

    const azHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.15, 32), 
        new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
    );
    scene.add(azHandle);
    sceneObjects.current.azHandle = azHandle;

    const arcRadius = 8;
    const curvePoints = [];
    for (let i = 0; i <= 64; i++) {
        const t = (i / 64) * Math.PI; 
        curvePoints.push(new THREE.Vector3(
            Math.cos(t) * arcRadius,
            Math.sin(t) * arcRadius,
            0
        ));
    }
    const arcCurve = new THREE.CatmullRomCurve3(curvePoints);
    const arcGeo = new THREE.TubeGeometry(arcCurve, 64, 0.06, 8, false); 
    
    const elTex = createGradientTexture('#831843', '#f472b6');
    const arcMat = new THREE.MeshBasicMaterial({ map: elTex });
    const arcLine = new THREE.Mesh(arcGeo, arcMat);
    scene.add(arcLine);
    sceneObjects.current.arcLine = arcLine;

    const camGroup = new THREE.Group();
    
    const bodyGeo = new THREE.BoxGeometry(1.2, 1.2, 1.8);
    const bodyMat = new THREE.MeshStandardMaterial({ 
        color: 0xffaa00, 
        roughness: 0.2, 
        metalness: 0.6 
    });
    const camBody = new THREE.Mesh(bodyGeo, bodyMat);
    camGroup.add(camBody);

    const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(1.25, 0.4, 1.2),
        new THREE.MeshBasicMaterial({ color: 0x111111 })
    );
    camGroup.add(stripe);

    const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.55, 0.8, 32),
        new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.2 })
    );
    barrel.rotation.x = Math.PI / 2; 
    barrel.position.z = 1.2; 
    camGroup.add(barrel);

    const glass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.1, 32),
        new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 1, roughness: 0 })
    );
    glass.rotation.x = Math.PI / 2;
    glass.position.z = 1.61; 
    camGroup.add(glass);

    const vf = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.4, 1.0),
        new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.2 })
    );
    vf.position.y = 0.8;
    camGroup.add(vf);

    const frustumHeight = 8;
    const frustumGeo = new THREE.ConeGeometry(3, frustumHeight, 4, 1, true);
    frustumGeo.rotateX(-Math.PI / 2); 
    frustumGeo.translate(0, 0, 1.6 + frustumHeight/2); 
    
    const frustumMat = new THREE.MeshBasicMaterial({ 
        color: 0xfacc15, 
        transparent: true, 
        opacity: 0.05, 
        side: THREE.DoubleSide,
        depthWrite: false 
    });
    const frustum = new THREE.Mesh(frustumGeo, frustumMat);
    camGroup.add(frustum);

    const frustumEdges = new THREE.LineSegments(
        new THREE.WireframeGeometry(frustumGeo),
        new THREE.LineBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.4 }) 
    );
    camGroup.add(frustumEdges);

    const rayLen = 50;
    const rayGeo = new THREE.CylinderGeometry(0.04, 0.04, rayLen, 8); 
    rayGeo.rotateX(Math.PI / 2); 
    rayGeo.translate(0, 0, 1.6 + rayLen/2); 
    const rayMat = new THREE.MeshBasicMaterial({ 
        color: 0xff0055, 
        transparent: true, 
        opacity: 0.9 
    });
    const ray = new THREE.Mesh(rayGeo, rayMat);
    camGroup.add(ray);

    scene.add(camGroup);
    sceneObjects.current.camGroup = camGroup;

    const elHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.15, 32), 
        new THREE.MeshBasicMaterial({ color: 0xec4899 })
    );
    elHandle.rotation.x = Math.PI / 2;
    scene.add(elHandle);
    sceneObjects.current.elHandle = elHandle;

    const gridRadius = 50;
    const azGroup = new THREE.Group();
    azGroup.position.y = 0.05; 
    
    const azCoreGeo = new THREE.CylinderGeometry(0.03, 0.03, gridRadius, 32); 
    azCoreGeo.rotateX(Math.PI / 2); 
    azCoreGeo.translate(0, 0, gridRadius / 2); 
    applyGradientToGeometry(azCoreGeo, new THREE.Color(0x22d3ee), new THREE.Color(0x0e7490), 'z', true); 
    const azCoreMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9 });
    const azCore = new THREE.Mesh(azCoreGeo, azCoreMat);
    azGroup.add(azCore);
    
    const azOutGeo = new THREE.CylinderGeometry(0.05, 0.05, gridRadius, 32); 
    azOutGeo.rotateX(Math.PI / 2);
    azOutGeo.translate(0, 0, gridRadius / 2);
    const azOutMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
    const azOutline = new THREE.Mesh(azOutGeo, azOutMat);
    azGroup.add(azOutline);
    
    scene.add(azGroup);
    sceneObjects.current.azGroup = azGroup;

    const distGroup = new THREE.Group();
    distGroup.position.y = 0.05; 
    const distCoreGeo = new THREE.TorusGeometry(1, 0.015, 32, 128); 
    distCoreGeo.rotateX(Math.PI / 2);
    const distCoreMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 }); 
    const distCore = new THREE.Mesh(distCoreGeo, distCoreMat);
    distGroup.add(distCore);
    const distOutGeo = new THREE.TorusGeometry(1, 0.03, 32, 128);
    distOutGeo.rotateX(Math.PI / 2);
    const distOutMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
    const distOutline = new THREE.Mesh(distOutGeo, distOutMat);
    distGroup.add(distOutline);
    
    scene.add(distGroup);
    sceneObjects.current.distGroup = distGroup;

    const hGroup = new THREE.Group();
    const hCoreGeo = new THREE.CylinderGeometry(0.02, 0.02, 1, 16); 
    hCoreGeo.translate(0, 0.5, 0); 
    applyGradientToGeometry(hCoreGeo, new THREE.Color(0xec4899), new THREE.Color(0xfacc15), 'y', true);
    const hCoreMat = new THREE.MeshBasicMaterial({ vertexColors: true });
    const hCore = new THREE.Mesh(hCoreGeo, hCoreMat);
    hGroup.add(hCore);
    const hOutGeo = new THREE.CylinderGeometry(0.035, 0.035, 1, 16); 
    hOutGeo.translate(0, 0.5, 0); 
    const hOutMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
    const hOutline = new THREE.Mesh(hOutGeo, hOutMat);
    hGroup.add(hOutline);

    scene.add(hGroup);
    sceneObjects.current.hGroup = hGroup;

    const reqIdRef = { current: 0 };
    let needsUpdate = true;

    const animate = () => {
        const { azimuth: az, elevation: el, distance: dist } = stateRef.current;
        
        // Visibility Logic: 
        // Frame is always visible.
        // Subject (Image) only visible if there is a reference.
        if (sceneObjects.current.subject) {
             if (sceneObjects.current.subject.visible !== hasReferenceRef.current) {
                 sceneObjects.current.subject.visible = hasReferenceRef.current;
                 needsUpdate = true;
             }
        }

        // Check if camera parameters changed
        if (
            az !== (stateRef.current as any).lastRenderedAz ||
            el !== (stateRef.current as any).lastRenderedEl ||
            dist !== (stateRef.current as any).lastRenderedDist
        ) {
            needsUpdate = true;
            (stateRef.current as any).lastRenderedAz = az;
            (stateRef.current as any).lastRenderedEl = el;
            (stateRef.current as any).lastRenderedDist = dist;
        }

        if (needsUpdate) {
            const phi = THREE.MathUtils.degToRad(90 - el);
            const theta = THREE.MathUtils.degToRad(az);

            const radius = 8;
            const visualDistance = 4 + ((200 - dist) / 200) * 8; 

            const camX = visualDistance * Math.sin(phi) * Math.sin(theta);
            const camY = visualDistance * Math.cos(phi);
            const camZ = visualDistance * Math.sin(phi) * Math.cos(theta);

            const targetY = (3.2 * ratio) / 2;

            camGroup.position.set(camX, camY + targetY, camZ); 
            camGroup.lookAt(0, targetY, 0); 

            if (arcLine) {
                arcLine.rotation.y = theta + (Math.PI / 2); 
                arcLine.position.y = targetY; 
            }

            const elX = radius * Math.sin(phi) * Math.sin(theta);
            const elY = radius * Math.cos(phi);
            const elZ = radius * Math.sin(phi) * Math.cos(theta);
            elHandle.position.set(elX, elY + targetY, elZ);
            elHandle.lookAt(0, targetY, 0);

            azHandle.position.set(
                radius * Math.sin(theta),
                0, 
                radius * Math.cos(theta)
            );

            if (azGroup) {
                azGroup.rotation.y = theta;
            }

            const groundRadius = Math.sqrt(camX * camX + camZ * camZ);
            if (distGroup) {
                distGroup.scale.setScalar(groundRadius);
            }

            if (hGroup) {
                 hGroup.position.set(camX, 0, camZ);
                 const totalHeight = camY + targetY;
                 hGroup.scale.set(1, totalHeight, 1);
            }

            if(pipCamera && camGroup) {
                camGroup.getWorldPosition(pipCamera.position);
                pipCamera.lookAt(0, targetY, 0);
            }

            renderer.render(scene, camera);

            if (pipRenderer && pipCamera && camGroup) {
                const guides = [
                    sceneObjects.current.ring,
                    sceneObjects.current.azHandle,
                    sceneObjects.current.arcLine,
                    sceneObjects.current.elHandle,
                    sceneObjects.current.azGroup,
                    sceneObjects.current.hGroup,
                ];

                // Hide guides for PIP render
                camGroup.visible = false;
                guides.forEach(g => { if(g) g.visible = false });
                
                pipRenderer.render(scene, pipCamera);

                // Restore guides for main render
                camGroup.visible = true;
                guides.forEach(g => { if(g) g.visible = true });

                // Ensure placeholder logic is reapplied
                if (sceneObjects.current.subject) {
                     sceneObjects.current.subject.visible = hasReferenceRef.current;
                }
            }
            
            needsUpdate = false;
        }

        reqIdRef.current = requestAnimationFrame(animate);
    };
    
    reqIdRef.current = requestAnimationFrame(animate);

    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    const onMouseDown = (e: MouseEvent) => {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        document.body.style.cursor = 'grabbing';
    };

    const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;

        setAzimuth(prev => {
            const next = prev + deltaX * 0.5; 
            if (next > 180) return next - 360;
            if (next < -180) return next + 360;
            return next;
        });

        setElevation(prev => {
            const next = prev - deltaY * 0.5; 
            return Math.max(-89, Math.min(89, next));
        });
    };

    const onMouseUp = () => {
        isDragging = false;
        document.body.style.cursor = 'default';
    };

    const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY * 0.1;
        // Invert direction: Up (negative deltaY) -> Increase distance (Zoom In in % logic)
        setDistance(prev => Math.max(20, Math.min(200, prev - delta)));
    };

    const canvasEl = renderer.domElement;
    canvasEl.addEventListener('mousedown', onMouseDown);
    canvasEl.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const resizeObserver = new ResizeObserver((entries) => {
        if (!Array.isArray(entries) || !entries.length) return;
        
        // Use requestAnimationFrame to throttle resize events
        window.requestAnimationFrame(() => {
            if (mountRef.current) {
                const w = mountNode.clientWidth;
                const h = mountNode.clientHeight;
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
                renderer.setSize(w, h);

                if (pipMountNode && pipRenderer && pipCamera) {
                    const pipW = pipMountNode.clientWidth;
                    const pipH = pipMountNode.clientHeight;
                    pipCamera.aspect = pipW / pipH;
                    pipCamera.updateProjectionMatrix();
                    pipRenderer.setSize(pipW, pipH);
                }
                needsUpdate = true;
            }
        });
    });
    resizeObserver.observe(mountNode);

    return () => {
        cancelAnimationFrame(reqIdRef.current);
        resizeObserver.disconnect();
        canvasEl.removeEventListener('mousedown', onMouseDown);
        canvasEl.removeEventListener('wheel', onWheel);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        mountNode?.removeChild(renderer.domElement);
        renderer.dispose();
        if (pipRenderer && pipMountNode) {
            pipMountNode.removeChild(pipRenderer.domElement);
            pipRenderer.dispose();
        }
    };
  }, [config.aspectRatio, hasReference]);

  useEffect(() => {
      const subj = sceneObjects.current.subject;
      if (subj && activeImage) {
          const loader = new THREE.TextureLoader();
          loader.load(activeImage.dataUrl, (tex) => {
              tex.colorSpace = THREE.SRGBColorSpace;
              subj.material.map = tex;
              subj.material.color.setHex(0xffffff);
              subj.material.needsUpdate = true;
              
              // Force render update when texture loads
              (stateRef.current as any).lastRenderedAz = -999;
          });
      }
  }, [activeImage]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f: File) => f.type.startsWith('image/'));
    if (files.length > 0) onFileSelect(files);
  };

  const handleEstimateCamera = async () => {
      if (!activeImage || isEstimating) return;
      setIsEstimating(true);
      
      try {
          const image = new Image();
          image.src = activeImage.dataUrl;
          await image.decode();

          const ratio = image.naturalWidth / Math.max(1, image.naturalHeight);
          setAzimuth(ratio > 1.25 ? 25 : ratio < 0.8 ? -15 : 0);
          setElevation(image.naturalHeight > image.naturalWidth ? 8 : 0);
          setDistance(ratio > 1.6 ? 120 : ratio < 0.75 ? 85 : 100);
      } catch (error) {
          setAzimuth(0);
          setElevation(0);
          setDistance(100);
      } finally {
          setIsEstimating(false);
      }
  };

  const { hPos, vPos, framing } = getDirectorInstructions(Math.round(azimuth), Math.round(elevation), Math.round(distance));

  const BottomDock = useMemo(() => (
    <div className="w-full flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[180px] space-y-3">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-500">
                <div className="flex items-center gap-2"><RotateCw size={12} className="text-cyan-400" /> Azimuth</div>
                <span className="text-cyan-400 font-mono">{Math.round(azimuth)}°</span>
            </div>
            <input type="range" min="-180" max="180" value={azimuth} onChange={(e) => setAzimuth(parseInt(e.target.value))} className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300" />
        </div>
        
        <div className="flex-1 min-w-[180px] space-y-3">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-500">
                <div className="flex items-center gap-2"><ArrowUpFromLine size={12} className="text-pink-400" /> Elevation</div>
                <span className="text-pink-400 font-mono">{Math.round(elevation)}°</span>
            </div>
            <input type="range" min="-85" max="85" value={elevation} onChange={(e) => setElevation(parseInt(e.target.value))} className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-pink-400 hover:accent-pink-300" />
        </div>

        <div className="flex-1 min-w-[180px] space-y-3">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-500">
                <div className="flex items-center gap-2"><ZoomIn size={12} className="text-yellow-400" /> Zoom</div>
                <span className="text-yellow-400 font-mono">{Math.round(distance)}%</span>
            </div>
            <input type="range" min="20" max="200" value={distance} onChange={(e) => setDistance(parseInt(e.target.value))} className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-yellow-400 hover:accent-yellow-300" />
        </div>
    </div>
  ), [azimuth, elevation, distance]);

  return (
    <RecipeLayout isGenerating={isGenerating} bottomDock={BottomDock} className="flex flex-col p-4 gap-6">
        <div className="flex flex-col lg:flex-row h-full gap-6">
             {/* LEFT: THREE.JS VIEWPORT */}
             <div className="flex-1 min-h-[400px] lg:min-h-0 rounded-3xl border border-white/5 flex flex-col relative overflow-hidden shadow-2xl">
                
                {/* Viewport Overlay Controls */}
                <div className="absolute top-6 left-6 z-20 flex flex-col gap-2 pointer-events-none">
                     <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm">
                        <Move3d size={12} className="text-cyan-400" />
                        <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Orbit & Zoom</span>
                     </div>
                     <div className="flex flex-col gap-1 text-[9px] font-mono text-zinc-500 bg-black/40 p-2 rounded-lg border border-white/5">
                        <span className="text-cyan-400">AZ: {Math.round(azimuth)}°</span>
                        <span className="text-pink-400">EL: {Math.round(elevation)}°</span>
                        <span className="text-yellow-400">DIST: {Math.round(distance)}%</span>
                     </div>
                </div>
                
                {/* CANVAS CONTAINER */}
                <div 
                    ref={mountRef} 
                    className="flex-1 w-full h-full relative cursor-move touch-none group" 
                >
                    <div className="pip-viewport absolute top-6 right-6 w-[240px] h-[180px] border-2 border-white/10 rounded-lg overflow-hidden bg-black/50 backdrop-blur-sm z-30 pointer-events-none shadow-2xl">
                        <div className="absolute top-0 left-0 px-2 py-0.5 bg-black/50 text-cyan-400 text-[8px] font-black uppercase tracking-widest">CAM VIEW</div>
                    </div>

                    {/* Instruction Overlay */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-black/40 border border-white/5 backdrop-blur-sm text-zinc-400 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-3">
                         <span className="flex items-center gap-1.5"><MousePointer2 size={12} className="text-white"/> Drag to Orbit</span>
                         <span className="w-px h-3 bg-white/20"/>
                         <span className="flex items-center gap-1.5"><ZoomIn size={12} className="text-white"/> Scroll to Zoom</span>
                    </div>
                </div>
             </div>
    
             {/* RIGHT: SIDEBAR (Reference & Gallery) */}
             <div className="w-full lg:w-80 flex flex-col gap-4 flex-shrink-0 min-h-0">
                {/* 1. Reference Image Panel */}
                <div 
                    className="flex-shrink-0 relative bg-zinc-950 rounded-xl border border-white/5 overflow-hidden shadow-2xl group w-full"
                    style={{ aspectRatio: ratioValue }}
                >
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                     
                     <div className="absolute top-0 left-0 right-0 h-10 bg-black/60 z-20 flex items-center px-4 justify-between border-b border-white/5">
                         <span className="text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Camera size={12} className="text-cyan-500" /> Subject
                         </span>
                         {hasReference && (
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={handleEstimateCamera} 
                                    disabled={isEstimating}
                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border border-white/10 transition-all ${isEstimating ? 'bg-white/10' : 'bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/30'}`}
                                    title="Estimate initial view from image shape"
                                >
                                    {isEstimating ? <Loader2 size={10} className="animate-spin" /> : <SlidersHorizontal size={10} />}
                                    <span className="text-[8px] font-bold uppercase">Fit</span>
                                </button>
                                <button onClick={() => updateConfig('attachments', [])} className="text-zinc-500 hover:text-red-500 transition-colors"><X size={12} /></button>
                            </div>
                         )}
                     </div>
    
                     {hasReference ? (
                        <div className="w-full h-full flex items-center justify-center p-6 bg-black/50">
                            <img src={activeImage.dataUrl} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl opacity-90" alt="ref" />
                        </div>
                     ) : (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.02] transition-colors relative z-10 p-6"
                        >
                            <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && onFileSelect(Array.from(e.target.files))} className="hidden" accept="image/*" />
                            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mb-4 shadow-xl group-hover:scale-110 group-hover:border-cyan-500/50 transition-all">
                                <Upload size={20} className="text-zinc-500 group-hover:text-white transition-colors" />
                            </div>
                            <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest text-center">Add Reference</h4>
                            <p className="text-[8px] text-zinc-600 font-bold uppercase mt-1 text-center">Optional: upload a reference</p>
                        </div>
                     )}
                </div>
    
                {/* 2. Output Stats */}
                <div className="flex-shrink-0 bg-zinc-900/40 border border-white/5 rounded-2xl p-5 shadow-xl">
                     <div className="flex items-center gap-3 mb-3">
                         <div className="p-2 bg-cyan-500/10 rounded-lg"><Eye size={14} className="text-cyan-400" /></div>
                         <div>
                             <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Virtual Output</h3>
                             <p className="text-[8px] text-zinc-500 font-bold uppercase">Prompt Translation</p>
                         </div>
                     </div>
                     <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-2">
                        <p className="text-[10px] font-bold text-zinc-300 leading-relaxed">
                            <span className="text-cyan-500">POS:</span> {hPos}
                        </p>
                        <p className="text-[10px] font-bold text-zinc-300 leading-relaxed">
                            <span className="text-pink-500">ANG:</span> {vPos}
                        </p>
                        <p className="text-[10px] font-bold text-zinc-300 leading-relaxed">
                            <span className="text-yellow-500">LENS:</span> {framing}
                        </p>
                     </div>
                </div>

                {/* 3. Workspace Gallery (Vertical Filmstrip) */}
                {cameraImages.length > 0 && (
                    <div className="flex-1 min-h-0 bg-black/40 border border-white/5 rounded-2xl p-2 flex flex-col gap-2 overflow-hidden shadow-inner">
                         <div className="px-2 flex items-center justify-between flex-shrink-0">
                             <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Workspace Gallery</span>
                             <span className="text-[9px] font-bold text-zinc-600 uppercase">{cameraImages.length} Renders</span>
                         </div>
                         
                         <div className="flex-1 overflow-y-auto custom-scrollbar grid grid-cols-2 gap-2 p-1 content-start">
                             {cameraImages.map((img) => (
                                 <button 
                                    key={img.id}
                                    onClick={() => onSelectImage(img)}
                                    className="relative aspect-square w-full rounded-xl overflow-hidden border border-white/10 hover:border-cyan-500/50 transition-all group shadow-sm hover:shadow-lg"
                                 >
                                     <img src={img.thumbnail || img.src} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" loading="lazy" />
                                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                         <Maximize2 size={16} className="text-white drop-shadow-md" />
                                     </div>
                                     {img.isFavorite && <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full shadow-lg" />}
                                 </button>
                             ))}
                         </div>
                    </div>
                )}
             </div>
        </div>
    </RecipeLayout>
  );
};
