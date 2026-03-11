import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

const PHASES = [
  {
    name: "Cubic",
    label: "Pm3̄m · Oₕ",
    temp: "> 763 K",
    color: "#706b63",
    desc: "Paraelectric. Ti centered. No polarization. Perfect cube. Tc = 763 K — much higher than BTO (393 K).",
    cell: { a: 1, b: 1, c: 1, alpha: 90 },
    tiShift: [0, 0, 0],
    pbShift: [0, 0, 0],
    oShifts: [[0,0,0],[0,0,0],[0,0,0]],
    polarDir: null,
  },
  {
    name: "Tetragonal",
    label: "P4mm · C₄ᵥ",
    temp: "< 763 K",
    color: "#c44d3f",
    desc: "Ferroelectric. c/a ≈ 1.06 — much larger distortion than BTO (~1.01). Ti and Pb both displace along c. P ∥ ĉ. PTO stays tetragonal all the way down — no orthorhombic or rhombohedral phases.",
    cell: { a: 1, b: 1, c: 1.22, alpha: 90 },
    tiShift: [0, 0, 0.12],
    pbShift: [0, 0, 0.04],
    oShifts: [[-0.04,0,0],[0,-0.04,0],[0,0,-0.05]],
    polarDir: [0, 0, 1],
  },
];

const NUM_PHASES = PHASES.length;

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
    const dirLight2 = new THREE.DirectionalLight(0xc44d3f, 0.25);
    dirLight2.position.set(-3, -2, 4);
    scene.add(dirLight2);

    // spinGroup rotates, cellGroup tilts z→up
    const spinGroup = new THREE.Group();
    scene.add(spinGroup);
    const cellGroup = new THREE.Group();
    cellGroup.rotation.x = -Math.PI / 2;
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

    // Pb atoms at corners (8 corners)
    const pbAtoms = [];
    const pbBasePositions = [
      [-1,-1,-1],[1,-1,-1],[-1,1,-1],[1,1,-1],
      [-1,-1,1],[1,-1,1],[-1,1,1],[1,1,1],
    ];
    pbBasePositions.forEach(pos => {
      const pb = createSphere(0.19, 0xcc8822, 0x442200);
      pb.position.set(...pos.map(v => v * 0.5));
      cellGroup.add(pb);
      pbAtoms.push(pb);
    });

    // Ti atom at center
    const ti = createSphere(0.14, 0x4488ff, 0x112244);
    cellGroup.add(ti);

    // O atoms at face centers (6 faces)
    const oAtoms = [];
    for (let i = 0; i < 6; i++) {
      const o = createSphere(0.12, 0xff4444, 0x331111);
      cellGroup.add(o);
      oAtoms.push(o);
    }

    // Wireframe edges
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x2d2418, transparent: true, opacity: 0.15 });
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

    const axisArrowA = new THREE.ArrowHelper(new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,0), 1, 0xcc4444, 0.08, 0.05);
    const axisArrowB = new THREE.ArrowHelper(new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,0), 1, 0x339933, 0.08, 0.05);
    const axisArrowC = new THREE.ArrowHelper(new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,0), 1, 0x4477cc, 0.08, 0.05);
    axisGroup.add(axisArrowA, axisArrowB, axisArrowC);

    const labelA = createLabel("a", "#cc4444");
    const labelB = createLabel("b", "#339933");
    const labelC = createLabel("c", "#4477cc");
    axisGroup.add(labelA, labelB, labelC);

    sceneRef.current = {
      scene, camera, renderer, cellGroup,
      pbAtoms, ti, oAtoms, edgeLines, edgeGeo, edgeMat,
      arrowGroup, axisGroup,
      axisArrowA, axisArrowB, axisArrowC,
      labelA, labelB, labelC,
    };

    const updateCell = (phaseData) => {
      const p = phaseData;
      const halfA = p.cell.a * 0.5;
      const halfB = p.cell.b * 0.5;
      const halfC = p.cell.c * 0.5;

      // Pb corners — Pb also shifts in PTO (unlike Ba in BTO)
      const corners = [
        [-halfA, -halfB, -halfC],
        [halfA, -halfB, -halfC],
        [-halfA, halfB, -halfC],
        [halfA, halfB, -halfC],
        [-halfA, -halfB, halfC],
        [halfA, -halfB, halfC],
        [-halfA, halfB, halfC],
        [halfA, halfB, halfC],
      ];
      pbAtoms.forEach((pb, i) => {
        pb.position.set(
          corners[i][0] + p.pbShift[0],
          corners[i][1] + p.pbShift[1],
          corners[i][2] + p.pbShift[2]
        );
      });

      // Ti
      ti.position.set(p.tiShift[0], p.tiShift[1], p.tiShift[2]);

      // O at face centers with shifts
      const faceCenters = [
        [halfA + p.oShifts[0][0], p.oShifts[0][1], p.oShifts[0][2]],
        [-halfA + p.oShifts[0][0], p.oShifts[0][1], p.oShifts[0][2]],
        [p.oShifts[1][0], halfB + p.oShifts[1][1], p.oShifts[1][2]],
        [p.oShifts[1][0], -halfB + p.oShifts[1][1], p.oShifts[1][2]],
        [p.oShifts[2][0], p.oShifts[2][1], halfC + p.oShifts[2][2]],
        [p.oShifts[2][0], p.oShifts[2][1], -halfC + p.oShifts[2][2]],
      ];
      oAtoms.forEach((o, i) => o.position.set(...faceCenters[i]));

      // Edges
      const edgeIndices = [
        [0,1],[2,3],[4,5],[6,7],
        [0,2],[1,3],[4,6],[5,7],
        [0,4],[1,5],[2,6],[3,7],
      ];
      const positions = [];
      edgeIndices.forEach(([a, b]) => {
        const ca = pbAtoms[a].position;
        const cb = pbAtoms[b].position;
        positions.push(ca.x, ca.y, ca.z, cb.x, cb.y, cb.z);
      });
      edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      edgeGeo.attributes.position.needsUpdate = true;

      // Polarization arrow
      while (arrowGroup.children.length > 0) arrowGroup.remove(arrowGroup.children[0]);
      if (p.polarDir) {
        const dir = new THREE.Vector3(...p.polarDir).normalize();
        const origin = new THREE.Vector3(p.tiShift[0], p.tiShift[1], p.tiShift[2]);
        const arrowHelper = new THREE.ArrowHelper(
          dir, origin, 0.65,
          new THREE.Color(p.color).getHex(),
          0.12, 0.08
        );
        arrowGroup.add(arrowHelper);
      }

      // Axis arrows from corner 0
      const origin0 = new THREE.Vector3(...corners[0]);
      const off = origin0.clone().addScalar(-0.12);

      const aVec = new THREE.Vector3(...corners[1]).sub(origin0);
      axisArrowA.position.copy(off);
      axisArrowA.setDirection(aVec.clone().normalize());
      axisArrowA.setLength(aVec.length() + 0.15, 0.08, 0.05);
      labelA.position.copy(off).add(aVec.clone().normalize().multiplyScalar(aVec.length() + 0.28));

      const bVec = new THREE.Vector3(...corners[2]).sub(origin0);
      axisArrowB.position.copy(off);
      axisArrowB.setDirection(bVec.clone().normalize());
      axisArrowB.setLength(bVec.length() + 0.15, 0.08, 0.05);
      labelB.position.copy(off).add(bVec.clone().normalize().multiplyScalar(bVec.length() + 0.28));

      const cVec = new THREE.Vector3(...corners[4]).sub(origin0);
      axisArrowC.position.copy(off);
      axisArrowC.setDirection(cVec.clone().normalize());
      axisArrowC.setLength(cVec.length() + 0.15, 0.08, 0.05);
      labelC.position.copy(off).add(cVec.clone().normalize().multiplyScalar(cVec.length() + 0.28));
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
        },
        tiShift: lerpArr(from.tiShift, to.tiShift, et),
        pbShift: lerpArr(from.pbShift, to.pbShift, et),
        oShifts: from.oShifts.map((s, i) => lerpArr(s, to.oShifts[i], et)),
        polarDir: to.polarDir
          ? (from.polarDir ? lerpArr(from.polarDir, to.polarDir, et) : to.polarDir.map(v => v * et))
          : (from.polarDir ? from.polarDir.map(v => v * (1 - et)) : null),
        color: to.color,
      };
    };

    sceneRef.current.updateCell = updateCell;
    sceneRef.current.interpolatePhases = interpolatePhases;

    updateCell(PHASES[0]);

    let frameId;
    const clock = new THREE.Clock();
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      spinGroup.rotation.y = time * 0.15;

      if (animProgressRef.current < 1) {
        animProgressRef.current = Math.min(1, animProgressRef.current + 0.012);
        const interp = interpolatePhases(
          currentPhaseRef.current,
          targetPhaseRef.current,
          animProgressRef.current
        );
        updateCell(interp);
        if (animProgressRef.current >= 1) {
          currentPhaseRef.current = targetPhaseRef.current;
          updateCell(PHASES[currentPhaseRef.current]);
        }
      }
      renderer.render(scene, camera);
    };
    animate();

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
    return () => { if (sceneRef.current.cleanup) sceneRef.current.cleanup(); };
  }, [buildScene]);

  const goToPhase = (idx) => {
    if (idx === phaseIdx || isAnimating) return;
    targetPhaseRef.current = idx;
    animProgressRef.current = 0;
    currentPhaseRef.current = phaseIdx;
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
        <h1 style={{
          fontSize: 22, fontWeight: 300, margin: 0,
          fontFamily: "'IBM Plex Serif', Georgia, serif", color: "rgba(45,36,24,0.85)",
        }}>
          PbTiO₃ Phase Transition
        </h1>
        <p style={{ fontSize: 12, color: "rgba(45,36,24,0.4)", margin: "4px 0 0", fontFamily: "'IBM Plex Mono', monospace" }}>
          Cubic Oₕ → Tetragonal C₄ᵥ &nbsp;·&nbsp; Tc = 763 K &nbsp;·&nbsp; Only 2 phases (no ortho/rhombo)
        </p>
      </div>

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
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
          <span style={{
            fontSize: 28, fontWeight: 700, color: phase.color,
            fontFamily: "'IBM Plex Serif', Georgia, serif", transition: "color 0.5s",
          }}>
            {phase.name}
          </span>
          <span style={{ fontSize: 14, color: "rgba(45,36,24,0.55)", fontFamily: "'IBM Plex Mono', monospace" }}>
            {phase.label}
          </span>
          <span style={{ fontSize: 12, color: "rgba(45,36,24,0.3)", fontFamily: "'IBM Plex Mono', monospace", marginLeft: "auto" }}>
            {phase.temp}
          </span>
        </div>
        <p style={{ fontSize: 14, color: "rgba(45,36,24,0.6)", margin: "0 0 12px", lineHeight: 1.6 }}>
          {phase.desc}
        </p>

        {/* Lattice readout */}
        <div style={{
          display: "flex", gap: 16, flexWrap: "wrap",
          padding: "10px 14px", borderRadius: 8,
          background: "rgba(45,36,24,0.04)",
          border: "1px solid rgba(45,36,24,0.07)",
          marginBottom: 12, fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, alignItems: "center",
        }}>
          <span style={{ fontSize: 10, color: "rgba(45,36,24,0.3)", textTransform: "uppercase", letterSpacing: 1 }}>Lattice:</span>
          <span><span style={{ color: "#cc4444", fontWeight: 700 }}>a</span><span style={{ color: "rgba(45,36,24,0.55)" }}> = {phase.cell.a.toFixed(2)}</span></span>
          <span><span style={{ color: "#339933", fontWeight: 700 }}>b</span><span style={{ color: "rgba(45,36,24,0.55)" }}> = {phase.cell.b.toFixed(2)}</span></span>
          <span><span style={{ color: "#4477cc", fontWeight: 700 }}>c</span><span style={{ color: "rgba(45,36,24,0.55)" }}> = {phase.cell.c.toFixed(2)}</span></span>
          <span style={{ color: "rgba(45,36,24,0.3)" }}>│</span>
          <span>
            <span style={{ color: "rgba(45,36,24,0.45)" }}>α = </span>
            <span style={{ color: "rgba(45,36,24,0.55)" }}>{phase.cell.alpha}°</span>
          </span>
          {phase.cell.a === phase.cell.b && phase.cell.b === phase.cell.c ? (
            <span style={{ fontSize: 10, color: "rgba(45,36,24,0.25)", fontStyle: "italic" }}>a=b=c</span>
          ) : (
            <span style={{ fontSize: 10, color: "rgba(45,36,24,0.25)", fontStyle: "italic" }}>a=b≠c</span>
          )}
        </div>

        {/* BTO comparison note */}
        <div style={{
          padding: "10px 14px", borderRadius: 8,
          background: "rgba(196,77,63,0.07)",
          border: "1px solid rgba(196,77,63,0.2)",
          marginBottom: 20, fontSize: 12, color: "rgba(45,36,24,0.55)", lineHeight: 1.7,
        }}>
          <strong style={{ color: "#c44d3f" }}>Key difference from BTO:</strong> PTO has a much larger tetragonal distortion (c/a ≈ 1.06 vs 1.01).
          Both Pb and Ti displace along c — in BTO, Ba barely moves. PTO never transitions to orthorhombic
          or rhombohedral phases on cooling — it stays tetragonal down to 0 K. This is because the Pb 6s²
          lone pair strongly favors the tetragonal distortion.
        </div>
      </div>

      {/* Phase Selector */}
      <div style={{ padding: "0 28px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 10, color: "rgba(45,36,24,0.3)", fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "nowrap" }}>HOT</span>
          <div style={{
            flex: 1, height: 4, borderRadius: 2,
            background: "rgba(45,36,24,0.07)", position: "relative", overflow: "visible",
          }}>
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              width: `${(phaseIdx / (NUM_PHASES - 1)) * 100}%`,
              borderRadius: 2,
              background: `linear-gradient(90deg, ${PHASES[0].color}, ${PHASES[NUM_PHASES - 1].color})`,
              transition: "width 0.8s ease", opacity: 0.6,
            }} />
            {PHASES.map((p, i) => (
              <div
                key={i}
                onClick={() => goToPhase(i)}
                style={{
                  position: "absolute",
                  left: `${(i / (NUM_PHASES - 1)) * 100}%`,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: phaseIdx === i ? 14 : 8,
                  height: phaseIdx === i ? 14 : 8,
                  borderRadius: "50%",
                  background: phaseIdx === i ? p.color : "rgba(45,36,24,0.2)",
                  border: `2px solid ${phaseIdx === i ? p.color : "transparent"}`,
                  boxShadow: phaseIdx === i ? `0 0 12px ${p.color}60` : "none",
                  cursor: "pointer", transition: "all 0.4s ease",
                  zIndex: phaseIdx === i ? 2 : 1,
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: 10, color: "rgba(45,36,24,0.3)", fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "nowrap" }}>COLD</span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {PHASES.map((p, i) => (
            <button
              key={i}
              onClick={() => goToPhase(i)}
              style={{
                flex: 1, padding: "12px 8px", borderRadius: 10,
                border: `1px solid ${phaseIdx === i ? p.color + "50" : "rgba(45,36,24,0.07)"}`,
                background: phaseIdx === i ? p.color + "15" : "rgba(45,36,24,0.03)",
                color: phaseIdx === i ? p.color : "rgba(45,36,24,0.45)",
                cursor: "pointer", transition: "all 0.3s",
                textAlign: "center", fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.4,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
              <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{p.label.split(" · ")[1]}</div>
            </button>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 14, marginBottom: 8 }}>
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            style={{
              background: autoPlay ? "rgba(196,77,63,0.2)" : "rgba(45,36,24,0.04)",
              border: `1px solid ${autoPlay ? "rgba(196,77,63,0.3)" : "rgba(45,36,24,0.1)"}`,
              color: autoPlay ? "#c44d3f" : "rgba(45,36,24,0.45)",
              padding: "6px 20px", borderRadius: 20, cursor: "pointer",
              fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", transition: "all 0.3s",
            }}
          >
            {autoPlay ? "⏸ Pause" : "▶ Toggle transition"}
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
          { color: "#cc8822", label: "Pb²⁺ (corners)" },
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
