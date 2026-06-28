import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

const VIEWS = {
  broadcast: { theta: Math.PI * 0.08, phi: 0.50, r: 165, label: 'Broadcast' },
  aerial:    { theta: 0.3,            phi: 0.10, r: 290, label: 'Aerial'    },
  pitch:     { theta: Math.PI * 0.55, phi: 1.05, r: 38,  label: 'Pitch'     },
  pavilion:  { theta: Math.PI,        phi: 0.44, r: 185, label: 'Pavilion'  },
  cover:     { theta: Math.PI * 0.3,  phi: 0.72, r: 90,  label: 'Cover'     },
};

export default function Stadium3DViewer({ activeBlockCoords }) {
  const mountRef   = useRef(null);
  const stateRef   = useRef({}); 
  const rafRef     = useRef(null);
  const [activeView, setActiveView]   = useState('broadcast');
  const [isLoading, setIsLoading]     = useState(true);

  // ── helpers ────────────────────────────────────────────────────────────────
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

  const animateTo = useCallback((target, s) => {
    const start = { ...s.spherical };
    let t = 0;
    const tick = () => {
      t = Math.min(t + 0.035, 1);
      const k = easeOutCubic(t);
      s.spherical.theta = start.theta + (target.theta - start.theta) * k;
      s.spherical.phi   = start.phi   + (target.phi   - start.phi)   * k;
      s.spherical.r     = start.r     + (target.r     - start.r)     * k;
      applyCam(s);
      if (t < 1) requestAnimationFrame(tick);
    };
    tick();
  }, []);

  const applyCam = (s) => {
    const { theta, phi, r } = s.spherical;
    s.camera.position.set(
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.cos(theta)
    );
    s.camera.lookAt(0, 6, 0); // Always look at the center pitch
  };

  // ── Procedural Grass Texture ────────────────────────────────────────────────
  const createGrassTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#277033'; 
    ctx.fillRect(0, 0, 1024, 1024);
    
    ctx.fillStyle = '#1e5e27'; 
    ctx.fillRect(0, 0, 512, 1024); 
    
    for(let i = 0; i < 40000; i++) {
       ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.08})`;
       ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
       ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.03})`;
       ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(24, 24); 
    tex.anisotropy = 16; 
    return tex;
  };

  // ── build scene ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mountRef.current) return;
    const el = mountRef.current;
    const W = el.clientWidth, H = el.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', logarithmicDepthBuffer: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled  = true;
    renderer.shadowMap.type     = THREE.PCFSoftShadowMap;
    renderer.toneMapping        = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85; 
    if (renderer.outputColorSpace !== undefined) {
      renderer.outputColorSpace = THREE.SRGBColorSpace ?? 'srgb';
    } else {
      renderer.outputEncoding = THREE.sRGBEncoding ?? 3001;
    }
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    scene.background = new THREE.Color(0x74b9ff); 
    scene.fog        = new THREE.FogExp2(0xa8d3ff, 0.0015);

    const skyGeo = new THREE.SphereGeometry(1500, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x2980b9) }, 
        bottomColor: { value: new THREE.Color(0xdff9fb) }, 
        offset: { value: 33 },
        exponent: { value: 0.6 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
      side: THREE.BackSide
    });
    scene.add(new THREE.Mesh(skyGeo, skyMat));

    const camera = new THREE.PerspectiveCamera(52, W / H, 0.3, 2500);
    const spherical = { theta: Math.PI * 0.08, phi: 0.50, r: 165 };

    const s = { renderer, scene, camera, spherical };
    stateRef.current = s;
    applyCam(s);

    scene.add(new THREE.AmbientLight(0xffffff, 0.45)); 
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444455, 0.3));

    const sunLight = new THREE.DirectionalLight(0xfffff0, 1.8); 
    sunLight.position.set(150, 300, 100);
    sunLight.castShadow = true;
    
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 800;
    const shadowSize = 220; 
    sunLight.shadow.camera.left = -shadowSize;
    sunLight.shadow.camera.right = shadowSize;
    sunLight.shadow.camera.top = shadowSize;
    sunLight.shadow.camera.bottom = -shadowSize;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const FIELD_R = 83;
    const grassTex = createGrassTexture();
    
    const baseField = new THREE.Mesh(
      new THREE.CircleGeometry(FIELD_R, 128), 
      new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.95, metalness: 0.0 })
    );
    baseField.rotation.x = -Math.PI / 2;
    baseField.receiveShadow = true;
    scene.add(baseField);

    const circle30 = new THREE.Mesh(
      new THREE.RingGeometry(45.3, 45.8, 128),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
    );
    circle30.rotation.x = -Math.PI / 2;
    circle30.position.y = 0.02;
    scene.add(circle30);

    const rope = new THREE.Mesh(
      new THREE.TorusGeometry(79, 0.32, 14, 240),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.05 })
    );
    rope.rotation.x = -Math.PI / 2; rope.position.y = 0.32; rope.castShadow = true;
    scene.add(rope);

    // ── PITCH ─────────────────────────────────────────────────────────────────
    const pitchMat = new THREE.MeshStandardMaterial({ color: 0xc8b589, roughness: 1.0, metalness: 0.0 });
    const pitchBody = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.44, 22.0), pitchMat);
    pitchBody.position.y = 0.22; pitchBody.castShadow = true; pitchBody.receiveShadow = true;
    scene.add(pitchBody);

    const wornMat = new THREE.MeshStandardMaterial({ color: 0xad9562, roughness: 1.0 });
    const worn = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.01, 10.0), wornMat);
    worn.position.y = 0.45;
    scene.add(worn);

    const whiteLine = (w, d, px, py, pz) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, d),
        new THREE.MeshBasicMaterial({ color: 0xffffff }));
      m.position.set(px, py, pz);
      scene.add(m);
    };

    whiteLine(10.0, 0.22, 0, 0.46,  8.53);  
    whiteLine(10.0, 0.22, 0, 0.46, -8.53);
    whiteLine(10.0, 0.14, 0, 0.46,  10.06); 
    whiteLine(10.0, 0.14, 0, 0.46, -10.06);
    [[-4.6, 0.46, 9.3],[4.6, 0.46, 9.3],[-4.6, 0.46, -9.3],[4.6, 0.46, -9.3]].forEach(([x,y,z]) => {
      whiteLine(0.22, 3.0, x, y, z);
    });

    // ── WICKETS ───────────────────────────────────────────────────────────────
    const stumpMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, metalness: 0.1, roughness: 0.5 });
    const bailMat  = new THREE.MeshStandardMaterial({ color: 0xffcc00, metalness: 0.1,  roughness: 0.5 });

    const addWickets = (zPos) => {
      [-0.18, 0, 0.18].forEach(dx => {
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.85, 12), stumpMat);
        shaft.position.set(dx, 0.88, zPos); shaft.castShadow = true; scene.add(shaft);
        
        const top = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), stumpMat);
        top.position.set(dx, 1.3, zPos); scene.add(top);
      });
      [[-0.09, 1.35, zPos],[0.09, 1.35, zPos]].forEach(([bx,by,bz]) => {
        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 8), bailMat);
        b.position.set(bx, by, bz); b.rotation.z = Math.PI / 2; scene.add(b);
      });
    };
    addWickets( 9.14);
    addWickets(-9.14);

    // ── TIERED STANDS ─────────────────────────────────────────────────────────
    const TIERS = 8, BASE_R = 87, STEP = 13, H_STEP = 9;
    const tierCols = [0xa0a5ab, 0xb0b5bc, 0xa0a5ab, 0xb0b5bc, 0xa0a5ab, 0xb0b5bc, 0xa0a5ab, 0xb0b5bc];

    for (let i = 0; i < TIERS; i++) {
      const rIn = BASE_R + i * STEP, rOut = BASE_R + (i + 1) * STEP;
      const h   = (i + 1) * H_STEP;

      const deck = new THREE.Mesh(
        new THREE.RingGeometry(rIn, rOut, 96),
        new THREE.MeshStandardMaterial({ color: tierCols[i], roughness: 0.9, side: THREE.DoubleSide })
      );
      deck.rotation.x = -Math.PI / 2; deck.position.y = h; deck.receiveShadow = true; deck.castShadow = true;
      scene.add(deck);

      const riser = new THREE.Mesh(
        new THREE.CylinderGeometry(rOut, rOut, H_STEP, 96, 1, true),
        new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 1, side: THREE.DoubleSide })
      );
      riser.position.y = h + H_STEP / 2; riser.receiveShadow = true; riser.castShadow = true; scene.add(riser);

      const rail = new THREE.Mesh(
        new THREE.TorusGeometry(rIn + 0.5, 0.18, 8, 96),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 })
      );
      rail.rotation.x = -Math.PI / 2; rail.position.y = h + 0.5; rail.castShadow = true;
      scene.add(rail);
    }

    // ── SEATING (INSTANCED) ───────────────────────────────────────────────────
    const PALETTES = [
      [0x1a3a8f, 0x2251c5, 0x1a3a8f], 
      [0x8b0000, 0xb91c1c, 0x8b0000],
      [0x14532d, 0x16a34a, 0x14532d], 
      [0x1a3a8f, 0x2251c5, 0x1a3a8f],
      [0x7c2d12, 0xc2410c, 0x7c2d12], 
      [0x312e81, 0x4338ca, 0x312e81], 
      [0x1a3a8f, 0x2251c5, 0x1a3a8f],
      [0x831843, 0xbe185d, 0x831843], 
    ];
    const NUM_SECTIONS = 16;
    const seatData = [];

    for (let t = 0; t < TIERS; t++) {
      const h    = (t + 1) * H_STEP;
      const pal  = PALETTES[t % PALETTES.length];

      for (let row = 0; row < 4; row++) {
        const r        = BASE_R + t * STEP + row * (STEP / 5) + 2.5;
        const rowPitch = 1.35;
        const numSeats = Math.floor((2 * Math.PI * r) / rowPitch);

        for (let si = 0; si < numSeats; si++) {
          const theta   = (si / numSeats) * Math.PI * 2;
          const section = Math.floor((theta / (Math.PI * 2)) * NUM_SECTIONS);
          seatData.push({
            x: Math.cos(theta) * r,
            y: h + 0.55 + row * 0.28,
            z: Math.sin(theta) * r,
            rotY: -theta - Math.PI / 2,
            col: pal[section % 3],
          });
        }
      }
    }

    const dummy = new THREE.Object3D();
    const seatMesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.78, 1.05, 0.90),
      new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1 }),
      seatData.length
    );
    seatMesh.castShadow = true;
    seatMesh.receiveShadow = true;
    const tempColor = new THREE.Color();
    seatData.forEach((d, i) => {
      dummy.position.set(d.x, d.y, d.z);
      dummy.rotation.set(0, d.rotY, 0);
      dummy.updateMatrix();
      seatMesh.setMatrixAt(i, dummy.matrix);
      tempColor.set(d.col);
      seatMesh.setColorAt(i, tempColor);
    });
    seatMesh.instanceMatrix.needsUpdate = true;
    seatMesh.instanceColor.needsUpdate  = true;
    scene.add(seatMesh);

    // ── ROOF CANOPY ───────────────────────────────────────────────────────────
    const roofInner = BASE_R + 4 * STEP;
    const roofOuter = BASE_R + TIERS * STEP + 16;
    const roofH     = TIERS * H_STEP + 25;

    const roofMesh = new THREE.Mesh(
      new THREE.RingGeometry(roofInner, roofOuter, 96),
      new THREE.MeshStandardMaterial({
        color: 0xf1f2f6, roughness: 0.5, metalness: 0.2,
        side: THREE.DoubleSide
      })
    );
    roofMesh.rotation.x = -Math.PI / 2; roofMesh.position.y = roofH;
    roofMesh.castShadow = true; roofMesh.receiveShadow = true;
    scene.add(roofMesh);

    const roofGlass = new THREE.Mesh(
      new THREE.RingGeometry(roofInner, roofInner + 28, 96),
      new THREE.MeshStandardMaterial({
        color: 0x82ccdd, roughness: 0.1, metalness: 0.8,
        side: THREE.DoubleSide, transparent: true, opacity: 0.4,
      })
    );
    roofGlass.rotation.x = -Math.PI / 2; roofGlass.position.y = roofH - 0.5;
    scene.add(roofGlass);

    const colMat = new THREE.MeshStandardMaterial({ color: 0xbdc3c7, metalness: 0.6, roughness: 0.4 });
    const COL_COUNT = 48;
    for (let i = 0; i < COL_COUNT; i++) {
      const theta  = (i / COL_COUNT) * Math.PI * 2;
      const colR   = roofInner + 4;
      const colH   = roofH - TIERS * H_STEP + 6;
      const col    = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, colH, 8), colMat);
      col.position.set(Math.cos(theta) * colR, TIERS * H_STEP + colH / 2, Math.sin(theta) * colR);
      col.castShadow = true; scene.add(col);
    }

    // ── FLOODLIGHT TOWERS ─────────────────────────────────────────────────────
    const towMat  = new THREE.MeshStandardMaterial({ color: 0x95a5a6, metalness: 0.7, roughness: 0.3 });
    const wireMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, metalness: 0.5 });

    [[132,-132],[132,132],[-132,-132],[-132,132]].forEach(([tx,tz]) => {
      const ang = Math.atan2(tz, tx);
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 3.2, 175, 14), towMat);
      mast.position.set(tx, 87.5, tz); mast.castShadow = true; scene.add(mast);

      const arm = new THREE.Mesh(new THREE.BoxGeometry(30, 1.4, 2.8), towMat);
      arm.position.set(tx, 176, tz); arm.castShadow = true; scene.add(arm);

      for (let p = -2; p <= 2; p++) {
        const px = tx + Math.cos(ang + Math.PI/2) * p * 5.5;
        const pz = tz + Math.sin(ang + Math.PI/2) * p * 5.5;
        const panelFrame = new THREE.Mesh(
          new THREE.BoxGeometry(4.8, 3.8, 0.45),
          new THREE.MeshStandardMaterial({ color: 0x2c3e50, metalness: 0.4 })
        );
        panelFrame.position.set(px, 178, pz);
        panelFrame.rotation.y = -ang - Math.PI / 2;
        panelFrame.rotation.x = 0.22;
        panelFrame.castShadow = true;
        scene.add(panelFrame);

        const ledFace = new THREE.Mesh(
          new THREE.PlaneGeometry(4.2, 3.2),
          new THREE.MeshStandardMaterial({ color: 0xdcdde1, roughness: 0.5 }) 
        );
        const nrmX = Math.cos(ang + Math.PI);
        const nrmZ = Math.sin(ang + Math.PI);
        ledFace.position.set(px + nrmX * 0.24, 178, pz + nrmZ * 0.24);
        ledFace.rotation.y = -ang - Math.PI / 2;
        ledFace.rotation.x = 0.22;
        scene.add(ledFace);
      }

      for (let g = 0; g < 4; g++) {
        const ga = ang + g * Math.PI / 2;
        const pts = [
          new THREE.Vector3(tx, 172, tz),
          new THREE.Vector3(tx + Math.cos(ga) * 36, 2, tz + Math.sin(ga) * 36),
        ];
        const tube = new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 6, 0.1, 4),
          wireMat
        );
        tube.castShadow = true;
        scene.add(tube);
      }
    });

    // ── ELECTRONIC SCOREBOARD ─────────────────────────────────────────────────
    const addScoreboard = (pos, rotY) => {
      const g = new THREE.Group();
      g.position.copy(pos); g.rotation.y = rotY;

      const sbFrame = new THREE.Mesh(new THREE.BoxGeometry(44, 22, 1.8),
        new THREE.MeshStandardMaterial({ color: 0x2f3640, metalness: 0.3, roughness: 0.5 }));
      sbFrame.castShadow = true; g.add(sbFrame);
      
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(41, 19),
        new THREE.MeshBasicMaterial({ color: 0x111111 })); 
      screen.position.z = 0.92; g.add(screen);
      
      const strip = new THREE.Mesh(new THREE.PlaneGeometry(38, 6),
        new THREE.MeshBasicMaterial({ color: 0x4cd137 })); 
      strip.position.set(0, 4, 0.95); g.add(strip);
      
      [-15, 15].forEach(lx => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.1, 28, 8),
          new THREE.MeshStandardMaterial({ color: 0xbdc3c7, metalness: 0.5 }));
        leg.position.set(lx, -25, 0); leg.castShadow = true; g.add(leg);
      });
      scene.add(g);
    };

    addScoreboard(new THREE.Vector3(-128, 46, 0),   Math.PI / 2);
    addScoreboard(new THREE.Vector3(0,   46, -128), 0);

    // ── MOUSE / TOUCH CONTROLS ────────────────────────────────────────────────
    let isDragging = false, prev = { x: 0, y: 0 };

    const onDown = (x, y) => { isDragging = true; prev = { x, y }; };
    const onUp   = ()      => { isDragging = false; };
    const onMove = (x, y)  => {
      if (!isDragging) return;
      const dx = x - prev.x, dy = y - prev.y;
      s.spherical.theta -= dx * 0.006;
      s.spherical.phi    = Math.max(0.06, Math.min(Math.PI / 2 - 0.04, s.spherical.phi + dy * 0.006));
      prev = { x, y };
      applyCam(s);
    };

    renderer.domElement.addEventListener('mousedown',  e => onDown(e.clientX, e.clientY));
    window.addEventListener('mouseup',                 onUp);
    window.addEventListener('mousemove',               e => onMove(e.clientX, e.clientY));
    renderer.domElement.addEventListener('wheel',      e => {
      s.spherical.r = Math.max(18, Math.min(380, s.spherical.r + e.deltaY * 0.28));
      applyCam(s); e.preventDefault();
    }, { passive: false });

    // ── ANIMATE ───────────────────────────────────────────────────────────────
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
    setIsLoading(false);

    // ── RESIZE ────────────────────────────────────────────────────────────────
    const onResize = () => {
      const W2 = el.clientWidth, H2 = el.clientHeight;
      camera.aspect = W2 / H2;
      camera.updateProjectionMatrix();
      renderer.setSize(W2, H2);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize',    onResize);
      window.removeEventListener('mouseup',   onUp);
      window.removeEventListener('mousemove', e => onMove(e.clientX, e.clientY));
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  const handleView = useCallback((key) => {
    const s = stateRef.current;
    if (!s.camera) return;
    setActiveView(key);
    animateTo(VIEWS[key], s);
  }, [animateTo]);

  // ── FLY TO EXTERNAL BLOCK COORDS ───────────────────────────────────────────
  useEffect(() => {
    const s = stateRef.current;
    if (!s.camera || !activeBlockCoords || activeBlockCoords.x == null) return;

    const x = parseFloat(activeBlockCoords.x);
    // Add +8 to the Y coordinate so the camera acts like a person's head looking over the seats
    const y = parseFloat(activeBlockCoords.y) + 8; 
    const z = parseFloat(activeBlockCoords.z);

    // Convert the cartesian block coordinates into our Spherical camera math
    const r = Math.sqrt(x * x + y * y + z * z);
    const phi = Math.acos(y / r);
    const theta = Math.atan2(x, z);

    // Un-highlight the default preset buttons
    setActiveView('custom');

    // Trigger the smooth flight animation!
    animateTo({ theta, phi, r }, s);
  }, [activeBlockCoords, animateTo]);

  return (
    <div style={styles.wrapper}>
      <div ref={mountRef} style={styles.canvas} />
      {isLoading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingDot} />
          <span style={styles.loadingText}>Initialising stadium…</span>
        </div>
      )}
      {!isLoading && (
        <div style={styles.viewBar}>
          {Object.entries(VIEWS).map(([key, v]) => (
            <button
              key={key}
              onClick={() => handleView(key)}
              style={{
                ...styles.viewBtn,
                ...(activeView === key ? styles.viewBtnActive : {}),
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}
      {!isLoading && (
        <div style={styles.hint}>
          Drag to orbit · Scroll to zoom
        </div>
      )}
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = {
  wrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: '540px',
    borderRadius: '20px',
    overflow: 'hidden',
    background: '#87ceeb', 
    boxShadow: '0 32px 64px -16px rgba(0,0,0,0.3)',
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  },
  canvas: { width: '100%', height: '100%', minHeight: '540px', display: 'block' },
  loadingOverlay: {
    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '16px',
    background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
  },
  loadingDot: {
    width: '36px', height: '36px', borderRadius: '50%',
    border: '3px solid rgba(0,0,0,0.1)', borderTop: '3px solid #3b82f6',
    animation: 'spin 0.9s linear infinite',
  },
  loadingText: { color: '#64748b', fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase' },
  viewBar: {
    position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
    display: 'flex', gap: '6px', padding: '6px 8px',
    background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.05)',
    borderRadius: '28px', backdropFilter: 'blur(14px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  viewBtn: {
    padding: '6px 16px', border: 'none', borderRadius: '20px', background: 'transparent',
    color: '#475569', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.18s ease', letterSpacing: '0.02em',
  },
  viewBtnActive: { background: '#3b82f6', color: '#ffffff', boxShadow: '0 2px 4px rgba(59,130,246,0.4)' },
  hint: { position: 'absolute', top: '16px', right: '16px', color: 'rgba(0,0,0,0.4)', fontSize: '11px', letterSpacing: '0.03em', pointerEvents: 'none', userSelect: 'none' },
};