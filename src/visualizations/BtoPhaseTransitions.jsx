import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

const PHASES = [
  {
    name: "Cubic",
    label: "Pm3̄m · Oₕ",
    temp: "> 393 K",
    color: "#706b63",
    desc: "Paraelectric. Ti centered. No polarization. Perfect cube.",
    // Unit cell: a=b=c, 90° angles, Ti at center
    cell: { a: 1, b: 1, c: 1, alpha: 90 },
    tiShift: [0, 0, 0],
    oShifts: [[0,0,0],[0,0,0],[0,0,0]], // face-center O shifts
    polarDir: null,
  },
  {
    name: "Tetragonal",
    label: "P4mm · C₄ᵥ",
    temp: "393–278 K",
    color: "#2a9d8f",
    desc: "Ferroelectric. Ti displaced along c [001]. c-axis elongated. P ∥ ĉ.",
    cell: { a: 1, b: 1, c: 1.15, alpha: 90 },
    tiShift: [0, 0, 0.08],
    oShifts: [[-0.03,0,0],[0,-0.03,0],[0,0,0.02]],
    polarDir: [0, 0, 1],
  },
  {
    name: "Orthorhombic",
    label: "Amm2 · C₂ᵥ",
    temp: "278–183 K",
    color: "#c4952a",
    desc: "Ferroelectric. Ti displaced along [011]. a≠b≠c, all 90°. P ∥ [011].",
    cell: { a: 0.95, b: 1.05, c: 1.08, alpha: 90 },
    tiShift: [0, 0.06, 0.06],
    oShifts: [[0,-0.03,-0.03],[0,-0.02,0.01],[0,0.01,-0.02]],
    polarDir: [0, 0.707, 0.707],
  },
  {
    name: "Rhombohedral",
    label: "R3m · C₃ᵥ",
    temp: "< 183 K",
    color: "#7b68ae",
    desc: "Ferroelectric. Ti displaced along [111]. a=b=c, α≠90°. P ∥ [111].",
    cell: { a: 1.02, b: 1.02, c: 1.02, alpha: 85 },
    tiShift: [0.05, 0.05, 0.05],
    oShifts: [[-0.025,-0.025,0.01],[-0.025,0.01,-0.025],[0.01,-0.025,-0.025]],
    polarDir: [0.577, 0.577, 0.577],
  },
];

function lerp(a, b, t) { return a + (b - a) * t; }
function lerpArr(a, b, t) { return a.map((v, i) => lerp(v, b[i], t)); }

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

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

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);
    const dirLight2 = new THREE.DirectionalLight(0x2a9d8f, 0.3);
    dirLight2.position.set(-3, -2, 4);
    scene.add(dirLight2);

    // Group for the whole unit cell
    // spinGroup handles slow rotation, cellGroup has base tilt so z(c) points up on screen
    const spinGroup = new THREE.Group();
    scene.add(spinGroup);
    const cellGroup = new THREE.Group();
    cellGroup.rotation.x = -Math.PI / 2; // tilt so z-axis (c) points up (screen Y)
    spinGroup.add(cellGroup);

    // Create atoms
    const createSphere = (radius, color, emissive) => {
      const geo = new THREE.SphereGeometry(radius, 32, 32);
      const mat = new THREE.MeshPhongMaterial({
        color, emissive: emissive || 0x000000,
        shininess: 80, specular: 0x444444,
      });
      return new THREE.Mesh(geo, mat);
    };

    // Ba atoms at corners (8 corners, shared)
    const baAtoms = [];
    const baPositions = [
      [-1,-1,-1],[1,-1,-1],[-1,1,-1],[1,1,-1],
      [-1,-1,1],[1,-1,1],[-1,1,1],[1,1,1],
    ];
    baPositions.forEach(pos => {
      const ba = createSphere(0.18, 0x22cc88, 0x114422);
      ba.position.set(...pos.map(v => v * 0.5));
      cellGroup.add(ba);
      baAtoms.push(ba);
    });

    // Ti atom at center
    const ti = createSphere(0.14, 0x4488ff, 0x112244);
    cellGroup.add(ti);

    // O atoms at face centers (6 faces)
    const oAtoms = [];
    const oBasePositions = [
      [0.5, 0, 0], [-0.5, 0, 0],  // x faces
      [0, 0.5, 0], [0, -0.5, 0],  // y faces
      [0, 0, 0.5], [0, 0, -0.5],  // z faces
    ];
    oBasePositions.forEach(pos => {
      const o = createSphere(0.12, 0xff4444, 0x331111);
      o.position.set(...pos);
      cellGroup.add(o);
      oAtoms.push(o);
    });

    // Wireframe edges
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x2d2418, transparent: true, opacity: 0.15 });
    const edgeGeo = new THREE.BufferGeometry();
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    cellGroup.add(edgeLines);

    // Polarization arrow
    const arrowGroup = new THREE.Group();
    cellGroup.add(arrowGroup);

    // Lattice vector axis arrows (a=red, b=green/yellow, c=blue)
    const axisGroup = new THREE.Group();
    cellGroup.add(axisGroup);

    // Create sprite text labels
    const createLabel = (text, color) => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      ctx.font = "bold 48px 'IBM Plex Serif', Georgia";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = color;
      ctx.fillText(text, 32, 32);
      const tex = new THREE.CanvasTexture(canvas);
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(0.22, 0.22, 1);
      return sprite;
    };

    const axisArrowA = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1, 0xcc4444, 0.08, 0.05
    );
    const axisArrowB = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 1, 0x339933, 0.08, 0.05
    );
    const axisArrowC = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1, 0x4477cc, 0.08, 0.05
    );
    axisGroup.add(axisArrowA);
    axisGroup.add(axisArrowB);
    axisGroup.add(axisArrowC);

    const labelA = createLabel("a", "#cc4444");
    const labelB = createLabel("b", "#339933");
    const labelC = createLabel("c", "#4477cc");
    axisGroup.add(labelA);
    axisGroup.add(labelB);
    axisGroup.add(labelC);

    sceneRef.current = {
      scene, camera, renderer, cellGroup,
      baAtoms, ti, oAtoms, edgeLines, edgeGeo, edgeMat,
      arrowGroup, axisGroup,
      axisArrowA, axisArrowB, axisArrowC,
      labelA, labelB, labelC,
    };

    // Update function
    const updateCell = (phaseData, t) => {
      const p = phaseData;
      const halfA = p.cell.a * 0.5;
      const halfB = p.cell.b * 0.5;
      const halfC = p.cell.c * 0.5;
      const alphaRad = (p.cell.alpha * Math.PI) / 180;
      const shear = Math.cos(alphaRad);

      // Update Ba corners
      const corners = [
        [-halfA, -halfB, -halfC],
        [halfA, -halfB, -halfC],
        [-halfA, halfB, -halfC],
        [halfA, halfB, -halfC],
        [-halfA + shear * halfC * 0.5, -halfB, halfC],
        [halfA + shear * halfC * 0.5, -halfB, halfC],
        [-halfA + shear * halfC * 0.5, halfB, halfC],
        [halfA + shear * halfC * 0.5, halfB, halfC],
      ];
      baAtoms.forEach((ba, i) => {
        ba.position.set(...corners[i]);
      });

      // Update Ti
      ti.position.set(
        p.tiShift[0] + shear * halfC * 0.25,
        p.tiShift[1],
        p.tiShift[2]
      );

      // Update O at face centers with shifts
      const faceCenters = [
        [halfA + shear * halfC * 0.25, p.oShifts[0][1], p.oShifts[0][2]],
        [-halfA + shear * halfC * 0.25, p.oShifts[0][1], p.oShifts[0][2]],
        [p.oShifts[1][0] + shear * halfC * 0.25, halfB, p.oShifts[1][2]],
        [p.oShifts[1][0] + shear * halfC * 0.25, -halfB, p.oShifts[1][2]],
        [p.oShifts[2][0] + shear * halfC * 0.5, p.oShifts[2][1], halfC],
        [p.oShifts[2][0], p.oShifts[2][1], -halfC],
      ];
      oAtoms.forEach((o, i) => {
        o.position.set(...faceCenters[i]);
      });

      // Update edges
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

      // Update arrow
      while (arrowGroup.children.length > 0) arrowGroup.remove(arrowGroup.children[0]);
      if (p.polarDir) {
        const dir = new THREE.Vector3(...p.polarDir).normalize();
        const origin = new THREE.Vector3(
          p.tiShift[0] + shear * halfC * 0.25,
          p.tiShift[1],
          p.tiShift[2]
        );
        const len = 0.6;
        const arrowHelper = new THREE.ArrowHelper(
          dir, origin, len,
          new THREE.Color(p.color).getHex(),
          0.12, 0.08
        );
        arrowGroup.add(arrowHelper);
      }

      // Update lattice vector axis arrows from corner[0]
      const origin = new THREE.Vector3(...corners[0]);
      const axisOffset = 0.12; // slight offset so arrows don't overlap edges
      const originOffset = origin.clone().addScalar(-axisOffset);

      // a-vector: corner[0] → corner[1] (along x)
      const aVec = new THREE.Vector3(...corners[1]).sub(origin);
      const aLen = aVec.length();
      axisArrowA.position.copy(originOffset);
      axisArrowA.setDirection(aVec.clone().normalize());
      axisArrowA.setLength(aLen + 0.15, 0.08, 0.05);
      labelA.position.copy(originOffset).add(aVec.clone().normalize().multiplyScalar(aLen + 0.28));

      // b-vector: corner[0] → corner[2] (along y)
      const bVec = new THREE.Vector3(...corners[2]).sub(origin);
      const bLen = bVec.length();
      axisArrowB.position.copy(originOffset);
      axisArrowB.setDirection(bVec.clone().normalize());
      axisArrowB.setLength(bLen + 0.15, 0.08, 0.05);
      labelB.position.copy(originOffset).add(bVec.clone().normalize().multiplyScalar(bLen + 0.28));

      // c-vector: corner[0] → corner[4] (along z)
      const cVec = new THREE.Vector3(...corners[4]).sub(origin);
      const cLen = cVec.length();
      axisArrowC.position.copy(originOffset);
      axisArrowC.setDirection(cVec.clone().normalize());
      axisArrowC.setLength(cLen + 0.15, 0.08, 0.05);
      labelC.position.copy(originOffset).add(cVec.clone().normalize().multiplyScalar(cLen + 0.28));
    };

    // Interpolate between phases
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
        },
        tiShift: lerpArr(from.tiShift, to.tiShift, et),
        oShifts: from.oShifts.map((s, i) => lerpArr(s, to.oShifts[i], et)),
        polarDir: to.polarDir
          ? (from.polarDir ? lerpArr(from.polarDir, to.polarDir, et) : to.polarDir.map(v => v * et))
          : (from.polarDir ? from.polarDir.map(v => v * (1 - et)) : null),
        color: to.color,
      };
    };

    sceneRef.current.updateCell = updateCell;
    sceneRef.current.interpolatePhases = interpolatePhases;

    // Initial
    updateCell(PHASES[0], 0);

    // Animation loop
    let frameId;
    const clock = new THREE.Clock();
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Slow rotation
      spinGroup.rotation.y = time * 0.15;

      // Transition animation
      if (animProgressRef.current < 1) {
        animProgressRef.current = Math.min(1, animProgressRef.current + 0.012);
        const interp = interpolatePhases(
          currentPhaseRef.current,
          targetPhaseRef.current,
          animProgressRef.current
        );
        updateCell(interp, animProgressRef.current);

        if (animProgressRef.current >= 1) {
          currentPhaseRef.current = targetPhaseRef.current;
          updateCell(PHASES[currentPhaseRef.current], 1);
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      const w2 = container.clientWidth;
      const h2 = container.clientHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
    };
    window.addEventListener("resize", onResize);

    sceneRef.current.cleanup = () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (container) buildScene(container);
    return () => {
      if (sceneRef.current.cleanup) sceneRef.current.cleanup();
    };
  }, [buildScene]);

  const goToPhase = (idx) => {
    if (idx === phaseIdx || isAnimating) return;
    targetPhaseRef.current = idx;
    animProgressRef.current = 0;
    setPhaseIdx(idx);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1200);
  };

  // Autoplay
  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setPhaseIdx(prev => {
        const next = (prev + 1) % 4;
        targetPhaseRef.current = next;
        animProgressRef.current = 0;
        currentPhaseRef.current = prev;
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
      {/* Header */}
      <div style={{ padding: "24px 28px 0" }}>
        <h1 style={{
          fontSize: 22, fontWeight: 300, margin: 0,
          fontFamily: "'IBM Plex Serif', Georgia, serif", color: "rgba(45,36,24,0.85)",
        }}>
          BaTiO₃ Phase Transitions
        </h1>
        <p style={{ fontSize: 12, color: "rgba(45,36,24,0.4)", margin: "4px 0 0", fontFamily: "'IBM Plex Mono', monospace" }}>
          Cubic Oₕ → Tetragonal C₄ᵥ → Orthorhombic C₂ᵥ → Rhombohedral C₃ᵥ
        </p>
      </div>

      {/* 3D Viewport */}
      <div
        ref={mountRef}
        style={{
          flex: 1, minHeight: 340, maxHeight: 450,
          margin: "16px 20px",
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(45,36,24,0.07)",
        }}
      />

      {/* Phase Info */}
      <div style={{ padding: "0 28px" }}>
        <div style={{
          display: "flex", alignItems: "baseline", gap: 12,
          marginBottom: 8,
        }}>
          <span style={{
            fontSize: 28, fontWeight: 700, color: phase.color,
            fontFamily: "'IBM Plex Serif', Georgia, serif",
            transition: "color 0.5s",
          }}>
            {phase.name}
          </span>
          <span style={{
            fontSize: 14, color: "rgba(45,36,24,0.55)",
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
            {phase.label}
          </span>
          <span style={{
            fontSize: 12, color: "rgba(45,36,24,0.3)",
            fontFamily: "'IBM Plex Mono', monospace",
            marginLeft: "auto",
          }}>
            {phase.temp}
          </span>
        </div>
        <p style={{
          fontSize: 14, color: "rgba(45,36,24,0.6)",
          margin: "0 0 12px", lineHeight: 1.6,
        }}>
          {phase.desc}
        </p>
        {/* Lattice parameter readout */}
        <div style={{
          display: "flex", gap: 16, flexWrap: "wrap",
          padding: "10px 14px", borderRadius: 8,
          background: "rgba(45,36,24,0.04)",
          border: "1px solid rgba(45,36,24,0.07)",
          marginBottom: 20, fontFamily: "'IBM Plex Mono', monospace", fontSize: 13,
          alignItems: "center",
        }}>
          <span style={{ fontSize: 10, color: "rgba(45,36,24,0.3)", textTransform: "uppercase", letterSpacing: 1 }}>
            Lattice:
          </span>
          <span>
            <span style={{ color: "#cc4444", fontWeight: 700 }}>a</span>
            <span style={{ color: "rgba(45,36,24,0.55)" }}> = {phase.cell.a.toFixed(2)}</span>
          </span>
          <span>
            <span style={{ color: "#339933", fontWeight: 700 }}>b</span>
            <span style={{ color: "rgba(45,36,24,0.55)" }}> = {phase.cell.b.toFixed(2)}</span>
          </span>
          <span>
            <span style={{ color: "#4477cc", fontWeight: 700 }}>c</span>
            <span style={{ color: "rgba(45,36,24,0.55)" }}> = {phase.cell.c.toFixed(2)}</span>
          </span>
          <span style={{ color: "rgba(45,36,24,0.3)" }}>│</span>
          <span>
            <span style={{ color: "rgba(45,36,24,0.45)" }}>α = </span>
            <span style={{ color: phase.cell.alpha === 90 ? "rgba(45,36,24,0.55)" : "#c4952a", fontWeight: phase.cell.alpha !== 90 ? 700 : 400 }}>
              {phase.cell.alpha}°
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
      </div>

      {/* Phase Selector */}
      <div style={{ padding: "0 28px 12px" }}>
        {/* Temperature bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          marginBottom: 16,
        }}>
          <span style={{ fontSize: 10, color: "rgba(45,36,24,0.3)", fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "nowrap" }}>
            HOT
          </span>
          <div style={{
            flex: 1, height: 4, borderRadius: 2,
            background: "rgba(45,36,24,0.07)", position: "relative",
            overflow: "visible",
          }}>
            <div style={{
              position: "absolute",
              left: 0, top: 0, bottom: 0,
              width: `${(phaseIdx / 3) * 100}%`,
              borderRadius: 2,
              background: `linear-gradient(90deg, ${PHASES[0].color}, ${PHASES[3].color})`,
              transition: "width 0.8s ease",
              opacity: 0.6,
            }} />
            {PHASES.map((p, i) => (
              <div
                key={i}
                onClick={() => goToPhase(i)}
                style={{
                  position: "absolute",
                  left: `${(i / 3) * 100}%`,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: phaseIdx === i ? 14 : 8,
                  height: phaseIdx === i ? 14 : 8,
                  borderRadius: "50%",
                  background: phaseIdx === i ? p.color : "rgba(45,36,24,0.2)",
                  border: `2px solid ${phaseIdx === i ? p.color : "transparent"}`,
                  boxShadow: phaseIdx === i ? `0 0 12px ${p.color}60` : "none",
                  cursor: "pointer",
                  transition: "all 0.4s ease",
                  zIndex: phaseIdx === i ? 2 : 1,
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: 10, color: "rgba(45,36,24,0.3)", fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "nowrap" }}>
            COLD
          </span>
        </div>

        {/* Phase buttons */}
        <div style={{ display: "flex", gap: 6 }}>
          {PHASES.map((p, i) => (
            <button
              key={i}
              onClick={() => goToPhase(i)}
              style={{
                flex: 1,
                padding: "10px 8px",
                borderRadius: 10,
                border: `1px solid ${phaseIdx === i ? p.color + "50" : "rgba(45,36,24,0.07)"}`,
                background: phaseIdx === i ? p.color + "15" : "rgba(45,36,24,0.03)",
                color: phaseIdx === i ? p.color : "rgba(45,36,24,0.45)",
                cursor: "pointer",
                transition: "all 0.3s",
                textAlign: "center",
                fontSize: 11,
                fontFamily: "'IBM Plex Mono', monospace",
                lineHeight: 1.4,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 12 }}>{p.name}</div>
              <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{p.label.split(" · ")[1]}</div>
            </button>
          ))}
        </div>

        {/* Auto-play */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 14, marginBottom: 8 }}>
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            style={{
              background: autoPlay ? "rgba(42,157,143,0.15)" : "rgba(45,36,24,0.04)",
              border: `1px solid ${autoPlay ? "rgba(42,157,143,0.3)" : "rgba(45,36,24,0.08)"}`,
              color: autoPlay ? "#2a9d8f" : "rgba(45,36,24,0.45)",
              padding: "6px 20px",
              borderRadius: 20,
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "'IBM Plex Mono', monospace",
              transition: "all 0.3s",
            }}
          >
            {autoPlay ? "⏸ Pause cycle" : "▶ Auto-cycle cooling"}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        padding: "12px 28px 20px",
        display: "flex", gap: 20, flexWrap: "wrap",
        borderTop: "1px solid rgba(45,36,24,0.05)",
      }}>
        {[
          { color: "#22cc88", label: "Ba²⁺ (corners)" },
          { color: "#4488ff", label: "Ti⁴⁺ (center)" },
          { color: "#ff4444", label: "O²⁻ (faces)" },
          { color: phase.color, label: "P (polarization)", arrow: true },
        ].map((l, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(45,36,24,0.55)" }}>
            {l.arrow ? (
              <span style={{ color: l.color, fontSize: 14 }}>→</span>
            ) : (
              <span style={{
                width: 10, height: 10, borderRadius: "50%",
                background: l.color, display: "inline-block",
                boxShadow: `0 0 6px ${l.color}40`,
              }} />
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
