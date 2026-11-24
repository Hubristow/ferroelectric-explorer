import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import {
  PHASES, BOX_CORNERS, UNIT_CORNERS, boxToPc, latticePos, displacement, buildAtoms,
} from "./pzoStructures.js";

const NUM_PHASES = PHASES.length;
const E_MAX = PHASES[0].energy;
const ACCENT = "#c4952a";
const MONO = "'IBM Plex Mono', monospace";
const SERIF = "'IBM Plex Serif', Georgia, serif";
const SCALE = 1 / 4.16; // Å → scene units
const VIEW = {
  supercell: { corners: BOX_CORNERS, center: boxToPc([0.5, 0.5, 0.5]), zoom: 0.62, atomScale: 0.62 },
  unit: { corners: UNIT_CORNERS, center: [1.5, 0.5, 0.5], zoom: 1.05, atomScale: 0.8 },
};
const STYLE = {
  Pb: { radius: 0.19, color: 0xcc8822, emissive: 0x442200 },
  Zr: { radius: 0.14, color: 0x3d8f9c, emissive: 0x1a3a40 },
  O: { radius: 0.11, color: 0xc44040, emissive: 0x3a1818 },
};
const EDGES = [
  [0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7],
];
const OCT_FACES = [0, 1].flatMap((x) => [2, 3].flatMap((y) => [4, 5].map((z) => [x, y, z])));

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const UP = new THREE.Vector3(0, 1, 0);
const vec = (a) => new THREE.Vector3(...a);

function createScene(container, initial) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfaf6f0);
  const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(3.0, 1.8, 3.0);
  camera.lookAt(0, 0, 0);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const key = new THREE.DirectionalLight(0xffffff, 0.8);
  key.position.set(5, 8, 5);
  const fill = new THREE.DirectionalLight(0xc4952a, 0.25);
  fill.position.set(-3, -2, 4);
  scene.add(key, fill);

  // spinGroup rotates, cellGroup tilts z→up
  const spinGroup = new THREE.Group();
  const cellGroup = new THREE.Group();
  cellGroup.rotation.x = -Math.PI / 2;
  spinGroup.add(cellGroup);
  scene.add(spinGroup);

  // Atoms, with lattice site + displacement precomputed for every phase
  const { atoms, octahedra } = buildAtoms();
  const geometries = Object.fromEntries(Object.entries(STYLE).map(
    ([el, s]) => [el, new THREE.SphereGeometry(s.radius, 24, 24)]));
  const materials = Object.fromEntries(Object.entries(STYLE).map(
    ([el, s]) => [el, new THREE.MeshPhongMaterial({
      color: s.color, emissive: s.emissive, shininess: 80, specular: 0x444444,
    })]));
  const items = atoms.map((atom) => {
    const mesh = new THREE.Mesh(geometries[atom.el], materials[atom.el]);
    cellGroup.add(mesh);
    const item = {
      ...atom, mesh,
      site: PHASES.map((_, i) => vec(latticePos(i, atom.pc)).multiplyScalar(SCALE)),
      disp: PHASES.map((_, i) => vec(displacement(i, atom.el, atom.pc)).multiplyScalar(SCALE)),
    };
    if (atom.el === "Pb") {
      item.arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 0.5, 0x7a3b10, 0.16, 0.11);
      cellGroup.add(item.arrow);
    }
    return item;
  });

  const octGeo = new THREE.BufferGeometry();
  cellGroup.add(new THREE.Mesh(octGeo, new THREE.MeshBasicMaterial({
    color: 0x3d8f9c, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false,
  })));
  const bondGeo = new THREE.BufferGeometry();
  cellGroup.add(new THREE.LineSegments(bondGeo, new THREE.LineBasicMaterial({
    color: 0x3d8f9c, transparent: true, opacity: 0.45,
  })));
  const edgeGeo = new THREE.BufferGeometry();
  cellGroup.add(new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({
    color: 0x2d2418, transparent: true, opacity: 0.45,
  })));
  const setPositions = (geo, data) => {
    geo.setAttribute("position", new THREE.Float32BufferAttribute(data, 3));
    geo.computeBoundingSphere();
  };

  // Net polarization: solid arrow (unit length along y), drawn over the atoms
  const pMat = new THREE.MeshBasicMaterial({ depthTest: false, transparent: true, opacity: 0.9 });
  const pArrow = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.8, 16), pMat);
  shaft.position.y = -0.1;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 24), pMat);
  tip.position.y = 0.4;
  pArrow.add(shaft, tip);
  [shaft, tip].forEach((m) => { m.renderOrder = 10; });
  cellGroup.add(pArrow);

  const axes = [["a", 0xcc4444, "#cc4444"], ["b", 0x339933, "#339933"], ["c", 0x4477cc, "#4477cc"]].map(([text, hex, css]) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext("2d");
    ctx.font = "bold 48px 'IBM Plex Serif', Georgia";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = css;
    ctx.fillText(text, 32, 32);
    const label = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(canvas), transparent: true, depthTest: false,
    }));
    const arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1, hex, 0.1, 0.065);
    cellGroup.add(arrow, label);
    return { arrow, label };
  });

  const state = { from: initial.phase, to: initial.phase, t: 1, view: initial.view, amp: initial.amp, dirty: true };

  const update = () => {
    const e = easeInOut(state.t);
    const { from, to, amp } = state;
    const view = VIEW[state.view];
    const unitOnly = state.view === "unit";
    const point = (pc) => vec(latticePos(from, pc)).lerp(vec(latticePos(to, pc)), e).multiplyScalar(SCALE);
    const center = point(view.center);
    spinGroup.scale.setScalar(view.zoom);

    items.forEach((it) => {
      const visible = !unitOnly || it.inUnit;
      const d = it.disp[from].clone().lerp(it.disp[to], e);
      it.mesh.visible = visible;
      it.mesh.scale.setScalar(view.atomScale);
      it.mesh.position.copy(it.site[from]).lerp(it.site[to], e).sub(center).addScaledVector(d, amp);
      if (it.arrow) {
        const len = d.length();
        it.arrow.visible = visible && len > 0.004;
        if (it.arrow.visible) {
          it.arrow.position.copy(it.mesh.position);
          it.arrow.setDirection(d.normalize());
          // Base length clears the Pb sphere; the rest grows with the Pb shift
          it.arrow.setLength(0.3 + len * 2.5, 0.15, 0.11);
        }
      }
    });

    const tri = [], bonds = [];
    octahedra.forEach((oct) => {
      if (unitOnly && !oct.inUnit) return;
      const c = items[oct.center].mesh.position.toArray();
      const o = oct.o.map((k) => items[k].mesh.position.toArray());
      OCT_FACES.forEach((f) => f.forEach((k) => tri.push(...o[k])));
      o.forEach((p) => bonds.push(...c, ...p));
    });
    setPositions(octGeo, tri);
    setPositions(bondGeo, bonds);

    const corners = view.corners.map((pc) => point(pc).sub(center));
    setPositions(edgeGeo, EDGES.flatMap(([i, j]) => [...corners[i].toArray(), ...corners[j].toArray()]));

    // Net polarization: shrink/grow through zero, turn between directions
    const pFrom = vec(PHASES[from].polarDir ?? [0, 0, 0]).normalize();
    const pTo = vec(PHASES[to].polarDir ?? [0, 0, 0]).normalize();
    const p = pFrom.lerp(pTo, e);
    const pLen = p.length();
    pArrow.visible = pLen > 0.1;
    if (pArrow.visible) {
      pMat.color.set(PHASES[PHASES[to].polarDir ? to : from].color);
      pArrow.quaternion.setFromUnitVectors(UP, p.normalize());
      pArrow.scale.setScalar((unitOnly ? 1.1 : 1.9) * pLen);
    }

    const k = 1 / view.zoom; // constant on-screen size
    const sides = [1, 2, 4].map((i) => corners[i].clone().sub(corners[0]));
    const dirs = sides.map((v) => v.clone().normalize());
    const off = corners[0].clone();
    dirs.forEach((d) => off.addScaledVector(d, -0.1 * k));
    axes.forEach(({ arrow, label }, i) => {
      const len = sides[i].length();
      arrow.position.copy(off);
      arrow.setDirection(dirs[i]);
      arrow.setLength(len + 0.12 * k, 0.1 * k, 0.065 * k);
      label.position.copy(off).addScaledVector(dirs[i], len + 0.24 * k);
      label.scale.set(0.2 * k, 0.2 * k, 1);
    });
  };

  let frameId;
  const start = performance.now();
  const animate = () => {
    frameId = requestAnimationFrame(animate);
    spinGroup.rotation.y = ((performance.now() - start) / 1000) * 0.15;
    if (state.t < 1) {
      state.t = Math.min(1, state.t + 0.012);
      state.dirty = true;
    }
    if (state.dirty) {
      state.dirty = false;
      update();
    }
    renderer.render(scene, camera);
  };
  animate();

  const onResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
  window.addEventListener("resize", onResize);

  return {
    goTo(idx) {
      if (idx === state.to) return;
      Object.assign(state, { from: state.to, to: idx, t: 0, dirty: true });
    },
    setDisplay(view, amp) {
      Object.assign(state, { view, amp, dirty: true });
    },
    dispose() {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      scene.traverse((obj) => {
        obj.geometry?.dispose();
        obj.material?.map?.dispose();
        obj.material?.dispose();
      });
      renderer.dispose();
      container.removeChild(renderer.domElement);
    },
  };
}

export default function App() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [view, setView] = useState("supercell");
  const [amp, setAmp] = useState(1);

  const phase = PHASES[phaseIdx];

  useEffect(() => {
    const handle = createScene(mountRef.current, { phase: 0, view: "supercell", amp: 1 });
    sceneRef.current = handle;
    return () => handle.dispose();
  }, []);

  useEffect(() => { sceneRef.current?.setDisplay(view, amp); }, [view, amp]);

  useEffect(() => {
    sceneRef.current?.goTo(phaseIdx);
  }, [phaseIdx]);

  useEffect(() => {
    if (!isAnimating) return;
    const id = setTimeout(() => setIsAnimating(false), 1500);
    return () => clearTimeout(id);
  }, [isAnimating]);

  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => setPhaseIdx((prev) => (prev + 1) % NUM_PHASES), 3500);
    return () => clearInterval(id);
  }, [autoPlay]);

  const goToPhase = (idx) => {
    if (idx === phaseIdx || isAnimating) return;
    setIsAnimating(true);
    setPhaseIdx(idx);
  };

  const pill = (active) => ({
    background: active ? "rgba(196,149,42,0.15)" : "rgba(45,36,24,0.04)",
    border: `1px solid ${active ? "rgba(196,149,42,0.4)" : "rgba(45,36,24,0.08)"}`,
    color: active ? "#946c14" : "rgba(45,36,24,0.55)",
    padding: "6px 14px", borderRadius: 20, cursor: "pointer",
    fontSize: 11, fontFamily: MONO, transition: "all 0.3s",
  });
  const muted = { color: "rgba(45,36,24,0.55)" };
  const energyPos = (p) => `${(1 - p.energy / E_MAX) * 100}%`;

  return (
    <div style={{
      minHeight: "100vh", background: "#faf6f0", color: "#2d2418",
      fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ padding: "24px 28px 0" }}>
        <h1 style={{ fontSize: 22, fontWeight: 300, margin: 0, fontFamily: SERIF, color: "rgba(45,36,24,0.85)" }}>
          PbZrO₃ Phases
        </h1>
        <p style={{ fontSize: 12, color: "rgba(45,36,24,0.4)", margin: "4px 0 0", fontFamily: MONO }}>
          Cubic Oₕ → Antiferroelectric D₂ₕ &nbsp;·&nbsp; Tc ≈ 505 K &nbsp;·&nbsp; competing polar phases: P4mm, R3m, R3c
        </p>
      </div>

      <div
        ref={mountRef}
        style={{
          flex: 1, minHeight: 380, maxHeight: 480, margin: "16px 20px 10px",
          borderRadius: 16, overflow: "hidden", border: "1px solid rgba(45,36,24,0.07)",
        }}
      />

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", padding: "0 20px 14px" }}>
        <button style={pill(view === "supercell")} aria-pressed={view === "supercell"} onClick={() => setView("supercell")}>40-atom cell</button>
        <button style={pill(view === "unit")} aria-pressed={view === "unit"} onClick={() => setView("unit")}>Single perovskite unit</button>
        <button style={pill(amp === 2)} aria-pressed={amp === 2} onClick={() => setAmp(amp === 1 ? 2 : 1)}>
          Displacements ×{amp}
        </button>
      </div>

      <div style={{ padding: "0 28px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: phase.color, fontFamily: SERIF, transition: "color 0.5s" }}>
            {phase.name}
          </span>
          <span style={{ fontSize: 14, color: "rgba(45,36,24,0.55)", fontFamily: MONO }}>{phase.label}</span>
          <span style={{ fontSize: 12, color: "rgba(45,36,24,0.45)", fontFamily: MONO, marginLeft: "auto" }}>{phase.tag}</span>
        </div>
        <p style={{ fontSize: 14, color: "rgba(45,36,24,0.6)", margin: "0 0 12px", lineHeight: 1.6 }}>
          {phase.desc}
        </p>

        <div style={{
          display: "flex", gap: 16, flexWrap: "wrap", padding: "10px 14px", borderRadius: 8,
          background: "rgba(45,36,24,0.04)", border: "1px solid rgba(45,36,24,0.07)",
          marginBottom: 12, fontFamily: MONO, fontSize: 13, alignItems: "center",
        }}>
          <span style={{ fontSize: 10, color: "rgba(45,36,24,0.3)", textTransform: "uppercase", letterSpacing: 1 }}>
            {phase.antipolar ? "40-atom cell:" : "5-atom cell:"}
          </span>
          {[["a", "#cc4444"], ["b", "#339933"], ["c", "#4477cc"]].map(([k, color]) => (
            <span key={k}>
              <span style={{ color, fontWeight: 700 }}>{k}</span>
              <span style={muted}> = {phase.cell[k].toFixed(2)} Å</span>
            </span>
          ))}
          <span style={muted}>α = {phase.cell.alpha}°</span>
          <span style={muted}>P {phase.polarization}</span>
          <span style={muted}>ΔE = {phase.energy} meV/f.u.</span>
          <span style={{ fontSize: 10, color: "rgba(45,36,24,0.4)", fontStyle: "italic" }}>{phase.lattice} · {phase.source}</span>
        </div>

        <div style={{
          padding: "10px 14px", borderRadius: 8,
          background: "rgba(196,149,42,0.08)", border: "1px solid rgba(196,149,42,0.25)",
          marginBottom: 20, fontSize: 12, color: "rgba(45,36,24,0.65)", lineHeight: 1.7,
        }}>
          <strong style={{ color: "#946c14" }}>Key difference from BTO and PTO:</strong> PZO cools
          into an antiferroelectric, not a ferroelectric. P4mm, R3m and R3c are not steps in
          a cooling sequence; they are competing polar states, ranked here by first-principles (LDA)
          energy. Octahedral tilts matter as much as polarization: adding them to R3m gives R3c,
          which nearly ties with Pbam.
        </div>
      </div>

      <div style={{ padding: "0 28px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <span style={{ fontSize: 10, color: "rgba(45,36,24,0.45)", fontFamily: MONO, whiteSpace: "nowrap" }}>HIGH E</span>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(45,36,24,0.07)", position: "relative" }}>
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0, width: energyPos(phase), borderRadius: 2,
              background: `linear-gradient(90deg, ${PHASES[0].color}, ${ACCENT})`,
              transition: "width 0.8s ease", opacity: 0.6,
            }} />
            {PHASES.map((p, i) => (
              <div
                key={p.label}
                title={`${p.label}: ${p.energy} meV/f.u.`}
                onClick={() => goToPhase(i)}
                style={{
                  position: "absolute", left: energyPos(p), top: "50%", transform: "translate(-50%, -50%)",
                  width: phaseIdx === i ? 14 : 8, height: phaseIdx === i ? 14 : 8, borderRadius: "50%",
                  background: phaseIdx === i ? p.color : "rgba(45,36,24,0.2)",
                  border: `2px solid ${phaseIdx === i ? p.color : "transparent"}`,
                  boxShadow: phaseIdx === i ? `0 0 12px ${p.color}60` : "none",
                  cursor: "pointer", transition: "all 0.4s ease", zIndex: phaseIdx === i ? 2 : 1,
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: 10, color: "rgba(45,36,24,0.45)", fontFamily: MONO, whiteSpace: "nowrap" }}>LOW E</span>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {PHASES.map((p, i) => (
            <button
              key={p.label}
              onClick={() => goToPhase(i)}
              style={{
                flex: "1 1 120px", padding: "10px 8px", borderRadius: 10,
                border: `1px solid ${phaseIdx === i ? p.color + "50" : "rgba(45,36,24,0.07)"}`,
                background: phaseIdx === i ? p.color + "15" : "rgba(45,36,24,0.03)",
                color: phaseIdx === i ? p.color : "rgba(45,36,24,0.45)",
                cursor: "pointer", transition: "all 0.3s", textAlign: "center",
                fontSize: 11, fontFamily: MONO, lineHeight: 1.4,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 12 }}>{p.name}</div>
              <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{p.label.split(" · ")[0]}</div>
            </button>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 14, marginBottom: 8 }}>
          <button onClick={() => setAutoPlay(!autoPlay)} style={pill(autoPlay)}>
            {autoPlay ? "⏸ Pause cycle" : "▶ Auto-cycle by energy"}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        padding: "12px 28px 20px", display: "flex", gap: 20, flexWrap: "wrap",
        borderTop: "1px solid rgba(45,36,24,0.05)",
      }}>
        {[
          { color: "#cc8822", label: "Pb²⁺ (corners)" },
          { color: "#3d8f9c", label: "Zr⁴⁺ (octahedra)" },
          { color: "#c44040", label: "O²⁻" },
          { color: "#7a3b10", label: "Pb displacement (magnified)", arrow: true },
          ...(phase.polarDir ? [{ color: phase.color, label: "P (net polarization)", arrow: true }] : []),
        ].map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(45,36,24,0.55)" }}>
            {l.arrow ? (
              <span style={{ color: l.color, fontSize: 14 }}>→</span>
            ) : (
              <span style={{
                width: 10, height: 10, borderRadius: "50%", background: l.color,
                display: "inline-block", boxShadow: `0 0 6px ${l.color}40`,
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
        <span style={{ fontSize: 11, color: "rgba(45,36,24,0.45)", flexBasis: "100%" }}>
          Axes follow the drawn cell. Data: {[
            ["energies", "1407.8405"], ["P4mm polarization", "1307.7645"], ["R3c cell", "2406.09011"], ["Pbam", "2102.08856"],
          ].map(([name, id], i) => (
            <span key={id}>{i > 0 && ", "}<a href={`https://arxiv.org/abs/${id}`}>{name} (arXiv:{id})</a></span>
          ))}, <a href="https://orbi.uliege.be/handle/2268/262140">R3m, R3c tilt (ORBi)</a>,
          {" "}<a href="https://alexandria.icams.rub.de/">P4mm structure (Alexandria agm002228878)</a>.
        </span>
      </div>
    </div>
  );
}
