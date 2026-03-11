import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

const PHASES = [
  {
    name: "Tetragonal",
    label: "P4₂/nmc · D₄ₕ",
    temp: "high T (> ~2000 K)",
    color: "#706b63",
    desc: "Centrosymmetric. Fluorite-derived. Hf in 8-fold O coordination. No polarization. Parent high-T phase.",
    cell: { a: 1, b: 1, c: 1.02, alpha: 90, beta: 90 },
    hfShifts: [[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
    oShifts: [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
    polarDir: null,
    stability: "equilibrium",
  },
  {
    name: "Monoclinic",
    label: "P2₁/c · C₂ₕ",
    temp: "room T bulk",
    color: "#b85c7a",
    desc: "Centrosymmetric — still no Pockels effect. Bulk ground state. β ≠ 90° breaks the tetragonal symmetry. Hf coordination drops from 8 to 7. This is the phase in every CMOS transistor gate stack.",
    cell: { a: 1.02, b: 1, c: 1.06, alpha: 90, beta: 80 },
    hfShifts: [[0.02,0,0.01],[-0.02,0,-0.01],[0.02,0,0.01],[-0.02,0,-0.01]],
    oShifts: [[0.02,0.01,0],[0.02,-0.01,0],[-0.02,0.01,0],[-0.02,-0.01,0],
              [0.01,0,0.02],[0.01,0,-0.02],[-0.01,0,0.02],[-0.01,0,-0.02]],
    polarDir: null,
    stability: "equilibrium",
  },
  {
    name: "Orthorhombic",
    label: "Pca2₁ · C₂ᵥ",
    temp: "stabilized in films",
    color: "#5b4cad",
    desc: "Ferroelectric — polar along c. Non-centrosymmetric. Metastable: must be stabilized by thin-film surface energy, doping (Si, Zr, Y, La), or mechanical confinement. Discovered 2011. CMOS-compatible. Pockels coefficients ~7–12 pm/V from DFT.",
    cell: { a: 1.04, b: 1.02, c: 1.0, alpha: 90, beta: 90 },
    hfShifts: [[0,0,0.04],[0,0,0.04],[0,0,0.04],[0,0,0.04]],
    oShifts: [[0,0,-0.03],[0,0,-0.03],[0,0,-0.03],[0,0,-0.03],
              [0,0,-0.02],[0,0,-0.02],[0,0,-0.02],[0,0,-0.02]],
    polarDir: [0, 0, 1],
    stability: "metastable",
  },
];

const NUM_PHASES = PHASES.length;

function lerp(a, b, t) { return a + (b - a) * t; }
function lerpArr(a, b, t) { return a.map((v, i) => lerp(v, b[i], t)); }
function easeInOut(t) { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2; }

export default function App() {
  const mountRef = useRef(null);
  const sceneRef = useRef({});
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const targetPhaseRef = useRef(0);
  const currentPhaseRef = useRef(0);
  const animProgressRef = useRef(1);

  const phase = PHASES[phaseIdx];

  const buildScene = useCallback((container) => {
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfaf6f0);

    const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
    camera.position.set(3.0, 1.8, 3.0);
    camera.lookAt(0, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);
    const dirLight2 = new THREE.DirectionalLight(0x5b4cad, 0.25);
    dirLight2.position.set(-3, -2, 4);
    scene.add(dirLight2);

    const spinGroup = new THREE.Group();
    scene.add(spinGroup);
    const cellGroup = new THREE.Group();
    cellGroup.rotation.x = -Math.PI / 2;
    spinGroup.add(cellGroup);

    const createSphere = (radius, color, emissive) => {
      const geo = new THREE.SphereGeometry(radius, 32, 32);
      const mat = new THREE.MeshPhongMaterial({
        color, emissive: emissive || 0x000000,
        shininess: 80, specular: 0x444444,
      });
      return new THREE.Mesh(geo, mat);
    };

    // Fluorite-derived: Hf at FCC positions (corners + face centers = 4 per cell)
    // Simplified: show Hf at corners and face-center positions of conventional cell
    const hfAtoms = [];
    // Corners (8, shared → effectively 1)
    const cornerPositions = [
      [-1,-1,-1],[1,-1,-1],[-1,1,-1],[1,1,-1],
      [-1,-1,1],[1,-1,1],[-1,1,1],[1,1,1],
    ];
    cornerPositions.forEach(pos => {
      const hf = createSphere(0.16, 0x7a8596, 0x2a3340);
      hf.position.set(...pos.map(v => v * 0.5));
      cellGroup.add(hf);
      hfAtoms.push(hf);
    });
    // Face centers (6, shared → effectively 3)
    const fcPositions = [
      [0.5,0.5,0],[0.5,-0.5,0],[-0.5,0.5,0],[-0.5,-0.5,0],
    ];
    const hfFcAtoms = [];
    fcPositions.forEach(pos => {
      const hf = createSphere(0.16, 0x7a8596, 0x2a3340);
      hf.position.set(...pos);
      cellGroup.add(hf);
      hfFcAtoms.push(hf);
    });

    // O atoms at tetrahedral sites (8 per conventional fluorite cell)
    const oAtoms = [];
    const oBasePositions = [
      [0.25, 0.25, 0.25], [-0.25, 0.25, 0.25],
      [0.25, -0.25, 0.25], [-0.25, -0.25, 0.25],
      [0.25, 0.25, -0.25], [-0.25, 0.25, -0.25],
      [0.25, -0.25, -0.25], [-0.25, -0.25, -0.25],
    ];
    oBasePositions.forEach(pos => {
      const o = createSphere(0.10, 0xc44040, 0x3a1818);
      o.position.set(...pos);
      cellGroup.add(o);
      oAtoms.push(o);
    });

    // Edges
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x2d2418, transparent: true, opacity: 0.3 });
    const edgeGeo = new THREE.BufferGeometry();
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    cellGroup.add(edgeLines);

    // Polarization arrow
    const arrowGroup = new THREE.Group();
    cellGroup.add(arrowGroup);

    // Axis arrows
    const axisGroup = new THREE.Group();
    cellGroup.add(axisGroup);

    const createLabel = (text, color) => {
      const canvas = document.createElement("canvas");
      canvas.width = 64; canvas.height = 64;
      const ctx = canvas.getContext("2d");
      ctx.font = "bold 48px 'IBM Plex Serif', Georgia";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = color;
      ctx.fillText(text, 32, 32);
      const tex = new THREE.CanvasTexture(canvas);
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(0.22, 0.22, 1);
      return sprite;
    };

    const axisArrowA = new THREE.ArrowHelper(new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,0), 1, 0xcc4444, 0.10, 0.065);
    const axisArrowB = new THREE.ArrowHelper(new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,0), 1, 0x339933, 0.10, 0.065);
    const axisArrowC = new THREE.ArrowHelper(new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,0), 1, 0x4477cc, 0.10, 0.065);
    axisGroup.add(axisArrowA, axisArrowB, axisArrowC);

    const labelA = createLabel("a", "#cc4444");
    const labelB = createLabel("b", "#339933");
    const labelC = createLabel("c", "#4477cc");
    axisGroup.add(labelA, labelB, labelC);

    const updateCell = (p) => {
      const halfA = p.cell.a * 0.5;
      const halfB = p.cell.b * 0.5;
      const halfC = p.cell.c * 0.5;
      const betaRad = (p.cell.beta * Math.PI) / 180;
      const shearX = (90 - p.cell.beta) * Math.PI / 180; // shear for monoclinic β

      // Corners with monoclinic shear along x-z plane
      const corners = [
        [-halfA, -halfB, -halfC],
        [halfA, -halfB, -halfC],
        [-halfA, halfB, -halfC],
        [halfA, halfB, -halfC],
        [-halfA + Math.sin(shearX)*halfC*2, -halfB, halfC],
        [halfA + Math.sin(shearX)*halfC*2, -halfB, halfC],
        [-halfA + Math.sin(shearX)*halfC*2, halfB, halfC],
        [halfA + Math.sin(shearX)*halfC*2, halfB, halfC],
      ];

      hfAtoms.forEach((hf, i) => {
        hf.position.set(
          corners[i][0] + p.hfShifts[i % 4][0],
          corners[i][1] + p.hfShifts[i % 4][1],
          corners[i][2] + p.hfShifts[i % 4][2]
        );
      });

      // Face-center Hf atoms
      const shOff = Math.sin(shearX) * halfC;
      const fcPos = [
        [shOff, 0, halfC], [shOff, 0, -halfC],
        [halfA + shOff*0.5, halfB, 0], [-halfA + shOff*0.5, -halfB, 0],
      ];
      hfFcAtoms.forEach((hf, i) => {
        hf.position.set(
          fcPos[i][0] + p.hfShifts[i % 4][0],
          fcPos[i][1] + p.hfShifts[i % 4][1],
          fcPos[i][2] + p.hfShifts[i % 4][2]
        );
      });

      // O at tetrahedral interstitials
      const tetScale = 0.5;
      oBasePositions.forEach((base, i) => {
        const sx = base[0] * p.cell.a + Math.sin(shearX) * base[2] * p.cell.c;
        const sy = base[1] * p.cell.b;
        const sz = base[2] * p.cell.c;
        oAtoms[i].position.set(
          sx + p.oShifts[i][0],
          sy + p.oShifts[i][1],
          sz + p.oShifts[i][2]
        );
      });

      // Edges
      const edgeIndices = [
        [0,1],[2,3],[4,5],[6,7],
        [0,2],[1,3],[4,6],[5,7],
        [0,4],[1,5],[2,6],[3,7],
      ];
      const positions = [];
      edgeIndices.forEach(([a, b]) => {
        positions.push(...corners[a], ...corners[b]);
      });
      edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      edgeGeo.attributes.position.needsUpdate = true;

      // Polarization
      while (arrowGroup.children.length > 0) arrowGroup.remove(arrowGroup.children[0]);
      if (p.polarDir) {
        const dir = new THREE.Vector3(...p.polarDir).normalize();
        const arrowHelper = new THREE.ArrowHelper(dir, new THREE.Vector3(0,0,0), 0.65,
          new THREE.Color(p.color).getHex(), 0.16, 0.11);
        arrowGroup.add(arrowHelper);
      }

      // Axis arrows
      const origin0 = new THREE.Vector3(...corners[0]);
      const off = origin0.clone().addScalar(-0.12);
      const aVec = new THREE.Vector3(...corners[1]).sub(origin0);
      axisArrowA.position.copy(off);
      axisArrowA.setDirection(aVec.clone().normalize());
      axisArrowA.setLength(aVec.length()+0.15, 0.10, 0.065);
      labelA.position.copy(off).add(aVec.clone().normalize().multiplyScalar(aVec.length()+0.28));

      const bVec = new THREE.Vector3(...corners[2]).sub(origin0);
      axisArrowB.position.copy(off);
      axisArrowB.setDirection(bVec.clone().normalize());
      axisArrowB.setLength(bVec.length()+0.15, 0.10, 0.065);
      labelB.position.copy(off).add(bVec.clone().normalize().multiplyScalar(bVec.length()+0.28));

      const cVec = new THREE.Vector3(...corners[4]).sub(origin0);
      axisArrowC.position.copy(off);
      axisArrowC.setDirection(cVec.clone().normalize());
      axisArrowC.setLength(cVec.length()+0.15, 0.10, 0.065);
      labelC.position.copy(off).add(cVec.clone().normalize().multiplyScalar(cVec.length()+0.28));
    };

    const interpolatePhases = (fromIdx, toIdx, t) => {
      const from = PHASES[fromIdx];
      const to = PHASES[toIdx];
      const et = easeInOut(t);
      return {
        cell: {
          a: lerp(from.cell.a, to.cell.a, et),
          b: lerp(from.cell.b, to.cell.b, et),
          c: lerp(from.cell.c, to.cell.c, et),
          alpha: lerp(from.cell.alpha, to.cell.alpha, et),
          beta: lerp(from.cell.beta, to.cell.beta, et),
        },
        hfShifts: from.hfShifts.map((s,i) => lerpArr(s, to.hfShifts[i], et)),
        oShifts: from.oShifts.map((s,i) => lerpArr(s, to.oShifts[i], et)),
        polarDir: to.polarDir
          ? (from.polarDir ? lerpArr(from.polarDir, to.polarDir, et) : to.polarDir.map(v => v*et))
          : (from.polarDir ? from.polarDir.map(v => v*(1-et)) : null),
        color: to.color,
      };
    };

    sceneRef.current = { scene, camera, renderer, cellGroup, cleanup: null };
    sceneRef.current.updateCell = updateCell;
    sceneRef.current.interpolatePhases = interpolatePhases;
    updateCell(PHASES[0]);

    let frameId;
    const clock = new THREE.Clock();
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      spinGroup.rotation.y = clock.getElapsedTime() * 0.15;
      if (animProgressRef.current < 1) {
        animProgressRef.current = Math.min(1, animProgressRef.current + 0.012);
        updateCell(interpolatePhases(currentPhaseRef.current, targetPhaseRef.current, animProgressRef.current));
        if (animProgressRef.current >= 1) {
          currentPhaseRef.current = targetPhaseRef.current;
          updateCell(PHASES[currentPhaseRef.current]);
        }
      }
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w2 = container.clientWidth; const h2 = container.clientHeight;
      camera.aspect = w2/h2; camera.updateProjectionMatrix(); renderer.setSize(w2,h2);
    };
    window.addEventListener("resize", onResize);
    sceneRef.current.cleanup = () => {
      cancelAnimationFrame(frameId); window.removeEventListener("resize", onResize);
      renderer.dispose(); container.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (container) buildScene(container);
    return () => { if (sceneRef.current.cleanup) sceneRef.current.cleanup(); };
  }, [buildScene]);

  const goToPhase = (idx) => {
    if (idx === phaseIdx || isAnimating) return;
    currentPhaseRef.current = phaseIdx;
    targetPhaseRef.current = idx;
    animProgressRef.current = 0;
    setPhaseIdx(idx);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1200);
  };

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setPhaseIdx(prev => {
        const next = (prev + 1) % NUM_PHASES;
        currentPhaseRef.current = prev;
        targetPhaseRef.current = next;
        animProgressRef.current = 0;
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  return (
    <div style={{
      minHeight: "100vh", background: "#faf6f0", color: "#2d2418",
      fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ padding: "24px 28px 0" }}>
        <h1 style={{ fontSize: 22, fontWeight: 300, margin: 0, fontFamily: "'IBM Plex Serif', Georgia, serif", color: "rgba(45,36,24,0.85)" }}>
          HfO₂ Phase Transitions
        </h1>
        <p style={{ fontSize: 12, color: "rgba(45,36,24,0.4)", margin: "4px 0 0", fontFamily: "'IBM Plex Mono', monospace" }}>
          Tetragonal D₄ₕ → Monoclinic C₂ₕ (bulk) · Orthorhombic C₂ᵥ (films, ferroelectric)
        </p>
      </div>

      <div ref={mountRef} style={{
        flex: 1, minHeight: 340, maxHeight: 450, margin: "16px 20px",
        borderRadius: 16, overflow: "hidden", border: "1px solid rgba(45,36,24,0.07)",
      }} />

      <div style={{ padding: "0 28px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: phase.color, fontFamily: "'IBM Plex Serif', Georgia, serif", transition: "color 0.5s" }}>
            {phase.name}
          </span>
          <span style={{ fontSize: 14, color: "rgba(45,36,24,0.55)", fontFamily: "'IBM Plex Mono', monospace" }}>{phase.label}</span>
          {phase.stability === "metastable" && (
            <span style={{
              fontSize: 10, padding: "2px 8px", borderRadius: 4,
              background: "rgba(91,76,173,0.15)", color: "#5b4cad",
              border: "1px solid rgba(91,76,173,0.25)", fontFamily: "'IBM Plex Mono', monospace",
            }}>
              METASTABLE
            </span>
          )}
          <span style={{ fontSize: 12, color: "rgba(45,36,24,0.3)", fontFamily: "'IBM Plex Mono', monospace", marginLeft: "auto" }}>
            {phase.temp}
          </span>
        </div>
        <p style={{ fontSize: 14, color: "rgba(45,36,24,0.6)", margin: "0 0 12px", lineHeight: 1.6 }}>
          {phase.desc}
        </p>

        <div style={{
          display: "flex", gap: 16, flexWrap: "wrap",
          padding: "10px 14px", borderRadius: 8,
          background: "rgba(45,36,24,0.04)", border: "1px solid rgba(45,36,24,0.07)",
          marginBottom: 12, fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, alignItems: "center",
        }}>
          <span style={{ fontSize: 10, color: "rgba(45,36,24,0.3)", textTransform: "uppercase", letterSpacing: 1 }}>Lattice:</span>
          <span><span style={{ color: "#cc4444", fontWeight: 700 }}>a</span><span style={{ color: "rgba(45,36,24,0.55)" }}> = {phase.cell.a.toFixed(2)}</span></span>
          <span><span style={{ color: "#339933", fontWeight: 700 }}>b</span><span style={{ color: "rgba(45,36,24,0.55)" }}> = {phase.cell.b.toFixed(2)}</span></span>
          <span><span style={{ color: "#4477cc", fontWeight: 700 }}>c</span><span style={{ color: "rgba(45,36,24,0.55)" }}> = {phase.cell.c.toFixed(2)}</span></span>
          <span style={{ color: "rgba(45,36,24,0.3)" }}>│</span>
          <span>
            <span style={{ color: "rgba(45,36,24,0.45)" }}>β = </span>
            <span style={{ color: phase.cell.beta !== 90 ? "#b85c7a" : "rgba(45,36,24,0.55)", fontWeight: phase.cell.beta !== 90 ? 700 : 400 }}>
              {phase.cell.beta}°
            </span>
          </span>
          {phase.cell.a === phase.cell.b && phase.cell.b === phase.cell.c ? (
            <span style={{ fontSize: 10, color: "rgba(45,36,24,0.25)", fontStyle: "italic" }}>a=b=c</span>
          ) : phase.cell.a === phase.cell.b ? (
            <span style={{ fontSize: 10, color: "rgba(45,36,24,0.25)", fontStyle: "italic" }}>a=b≠c</span>
          ) : (
            <span style={{ fontSize: 10, color: "rgba(45,36,24,0.25)", fontStyle: "italic" }}>a≠b≠c</span>
          )}
        </div>

        {/* Key note */}
        <div style={{
          padding: "10px 14px", borderRadius: 8,
          background: "rgba(91,76,173,0.07)", border: "1px solid rgba(91,76,173,0.2)",
          marginBottom: 20, fontSize: 12, color: "rgba(45,36,24,0.55)", lineHeight: 1.7,
        }}>
          <strong style={{ color: "#5b4cad" }}>Not a perovskite:</strong> HfO₂ has a fluorite-derived structure (Hf at FCC sites, O at tetrahedral interstitials),
          not the ABO₃ perovskite structure of BTO/PTO/STO. The ferroelectric Pca2₁ phase does not exist in bulk equilibrium —
          it must be stabilized in thin films (&lt; 20 nm) via doping, surface energy, or confinement. This CMOS compatibility is what
          makes it uniquely interesting for integration.
          {phase.stability === "metastable" && (
            <span style={{ color: "#5b4cad" }}> The polarization arrow indicates the polar c-axis in Pca2₁ — the 2₁ screw axis direction.</span>
          )}
        </div>
      </div>

      <div style={{ padding: "0 28px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 10, color: "rgba(45,36,24,0.3)", fontFamily: "'IBM Plex Mono', monospace" }}>HOT</span>
          <div style={{
            flex: 1, height: 4, borderRadius: 2,
            background: "rgba(45,36,24,0.07)", position: "relative", overflow: "visible",
          }}>
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              width: `${(phaseIdx / (NUM_PHASES-1)) * 100}%`,
              borderRadius: 2,
              background: `linear-gradient(90deg, ${PHASES[0].color}, ${PHASES[NUM_PHASES-1].color})`,
              transition: "width 0.8s ease", opacity: 0.6,
            }} />
            {PHASES.map((p, i) => (
              <div key={i} onClick={() => goToPhase(i)} style={{
                position: "absolute", left: `${(i/(NUM_PHASES-1))*100}%`,
                top: "50%", transform: "translate(-50%, -50%)",
                width: phaseIdx === i ? 14 : 8, height: phaseIdx === i ? 14 : 8,
                borderRadius: "50%",
                background: phaseIdx === i ? p.color : "rgba(45,36,24,0.2)",
                border: `2px solid ${phaseIdx === i ? p.color : "transparent"}`,
                boxShadow: phaseIdx === i ? `0 0 12px ${p.color}60` : "none",
                cursor: "pointer", transition: "all 0.4s ease", zIndex: phaseIdx === i ? 2 : 1,
              }} />
            ))}
          </div>
          <span style={{ fontSize: 10, color: "rgba(45,36,24,0.3)", fontFamily: "'IBM Plex Mono', monospace" }}>FILM</span>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {PHASES.map((p, i) => (
            <button key={i} onClick={() => goToPhase(i)} style={{
              flex: 1, padding: "10px 8px", borderRadius: 10,
              border: `1px solid ${phaseIdx === i ? p.color+"50" : "rgba(45,36,24,0.07)"}`,
              background: phaseIdx === i ? p.color+"15" : "rgba(45,36,24,0.03)",
              color: phaseIdx === i ? p.color : "rgba(45,36,24,0.45)",
              cursor: "pointer", transition: "all 0.3s",
              textAlign: "center", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.4,
            }}>
              <div style={{ fontWeight: 700, fontSize: 12 }}>{p.name}</div>
              <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{p.label.split(" · ")[1]}</div>
              {p.stability === "metastable" && <div style={{ fontSize: 8, opacity: 0.5, marginTop: 2 }}>metastable</div>}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 14, marginBottom: 8 }}>
          <button onClick={() => setAutoPlay(!autoPlay)} style={{
            background: autoPlay ? "rgba(91,76,173,0.2)" : "rgba(45,36,24,0.04)",
            border: `1px solid ${autoPlay ? "rgba(91,76,173,0.25)" : "rgba(45,36,24,0.1)"}`,
            color: autoPlay ? "#5b4cad" : "rgba(45,36,24,0.45)",
            padding: "6px 20px", borderRadius: 20, cursor: "pointer",
            fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", transition: "all 0.3s",
          }}>
            {autoPlay ? "⏸ Pause cycle" : "▶ Auto-cycle phases"}
          </button>
        </div>
      </div>

      <div style={{
        padding: "12px 28px 20px", display: "flex", gap: 20, flexWrap: "wrap",
        borderTop: "1px solid rgba(45,36,24,0.05)",
      }}>
        {[
          { color: "#7a8596", label: "Hf⁴⁺ (FCC sites)" },
          { color: "#c44040", label: "O²⁻ (tetrahedral)" },
          { color: phase.color, label: "P (polarization)", arrow: true },
        ].map((l, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(45,36,24,0.55)" }}>
            {l.arrow ? (
              <span style={{ color: l.color, fontSize: 14 }}>→</span>
            ) : (
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: l.color, display: "inline-block", boxShadow: `0 0 6px ${l.color}40` }} />
            )}
            <span>{l.label}</span>
          </div>
        ))}
        <span style={{ color: "rgba(45,36,24,0.1)" }}>│</span>
        {[
          { color: "#cc4444", label: "a" },
          { color: "#339933", label: "b" },
          { color: "#4477cc", label: "c" },
        ].map((l, i) => (
          <div key={`ax${i}`} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "rgba(45,36,24,0.55)" }}>
            <span style={{ color: l.color, fontSize: 13, fontWeight: 700 }}>→</span>
            <span style={{ color: l.color, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
