import { useState, useEffect } from "react";

const MATERIALS = [
  {
    name: "BaTiO₃",
    abbr: "BTO",
    color: "#4ecdc4",
    phases: [
      { phase: "Cubic paraelectric", sg: "Pm3̄m", pg: "m3̄m", schoen: "Oₕ", crystal: "Cubic", temp: "> 393 K", tNum: 393, type: "para" },
      { phase: "Tetragonal ferroelectric", sg: "P4mm", pg: "4mm", schoen: "C₄ᵥ", crystal: "Tetragonal", temp: "393–278 K", tNum: 335, type: "ferro" },
      { phase: "Orthorhombic ferroelectric", sg: "Amm2", pg: "mm2", schoen: "C₂ᵥ", crystal: "Orthorhombic", temp: "278–183 K", tNum: 230, type: "ferro" },
      { phase: "Rhombohedral ferroelectric", sg: "R3m", pg: "3m", schoen: "C₃ᵥ", crystal: "Trigonal", temp: "< 183 K", tNum: 90, type: "ferro" },
    ],
  },
  {
    name: "PbTiO₃",
    abbr: "PTO",
    color: "#ff6b6b",
    phases: [
      { phase: "Cubic paraelectric", sg: "Pm3̄m", pg: "m3̄m", schoen: "Oₕ", crystal: "Cubic", temp: "> 763 K", tNum: 763, type: "para" },
      { phase: "Tetragonal ferroelectric", sg: "P4mm", pg: "4mm", schoen: "C₄ᵥ", crystal: "Tetragonal", temp: "< 763 K", tNum: 400, type: "ferro" },
    ],
  },
  {
    name: "PbZrO₃",
    abbr: "PZO",
    color: "#feca57",
    phases: [
      { phase: "Cubic paraelectric", sg: "Pm3̄m", pg: "m3̄m", schoen: "Oₕ", crystal: "Cubic", temp: "> ~505 K", tNum: 505, type: "para" },
      { phase: "Antiferroelectric", sg: "Pbam", pg: "mmm", schoen: "D₂ₕ", crystal: "Orthorhombic", temp: "< ~505 K", tNum: 300, type: "anti" },
      { phase: "Polar (field/strain induced)", sg: "Pba2 / Pca2₁", pg: "mm2", schoen: "C₂ᵥ", crystal: "Orthorhombic", temp: "induced", tNum: null, type: "induced" },
    ],
  },
  {
    name: "CsGeBr₃",
    abbr: "CGB",
    color: "#a29bfe",
    phases: [
      { phase: "Cubic paraelectric", sg: "Pm3̄m", pg: "m3̄m", schoen: "Oₕ", crystal: "Cubic", temp: "high T", tNum: 600, type: "para" },
      { phase: "Rhombohedral ferroelectric", sg: "R3m", pg: "3m", schoen: "C₃ᵥ", crystal: "Trigonal", temp: "lower T", tNum: 300, type: "ferro" },
    ],
  },
  {
    name: "HfO₂",
    abbr: "HfO₂",
    color: "#fd79a8",
    phases: [
      { phase: "High-T tetragonal", sg: "P4₂/nmc", pg: "4/mmm", schoen: "D₄ₕ", crystal: "Tetragonal", temp: "high T", tNum: 800, type: "para" },
      { phase: "Nonpolar monoclinic", sg: "P2₁/c", pg: "2/m", schoen: "C₂ₕ", crystal: "Monoclinic", temp: "room T bulk", tNum: 300, type: "para" },
      { phase: "Ferroelectric orthorhombic", sg: "Pca2₁", pg: "mm2", schoen: "C₂ᵥ", crystal: "Orthorhombic", temp: "stabilized in films", tNum: null, type: "ferro" },
    ],
  },
];

const POLAR_GROUPS = [
  { schoen: "C₁", intl: "1", crystal: "Triclinic", spaces: "P1" },
  { schoen: "C₂", intl: "2", crystal: "Monoclinic", spaces: "P2, C2" },
  { schoen: "Cₛ", intl: "m", crystal: "Monoclinic (mirror)", spaces: "Pm, Pc, Cm, Cc" },
  { schoen: "C₂ᵥ", intl: "mm2", crystal: "Orthorhombic", spaces: "Pmm2, Pmc2₁, Pcc2, Pma2, Pca2₁, Pnc2, Pmn2₁, Pba2, Pna2₁, Pnn2, Cmm2, Cmc2₁, Ccc2, Amm2, Abm2, Ama2, Aba2" },
  { schoen: "C₄", intl: "4", crystal: "Tetragonal", spaces: "P4, I4" },
  { schoen: "C₄ᵥ", intl: "4mm", crystal: "Tetragonal (mirror)", spaces: "P4mm, P4bm, P4₂cm, P4₂nm, I4mm, I4cm" },
  { schoen: "C₃", intl: "3", crystal: "Trigonal", spaces: "P3" },
  { schoen: "C₃ᵥ", intl: "3m", crystal: "Trigonal (mirror)", spaces: "P3m1, P31m" },
  { schoen: "C₆", intl: "6", crystal: "Hexagonal", spaces: "P6" },
  { schoen: "C₆ᵥ", intl: "6mm", crystal: "Hexagonal (mirror)", spaces: "P6mm, P6cc, P63cm, P63mc" },
];

const crystalColors = {
  Cubic: "#888",
  Tetragonal: "#4ecdc4",
  Orthorhombic: "#feca57",
  Trigonal: "#a29bfe",
  Monoclinic: "#fd79a8",
  Hexagonal: "#ff6b6b",
  "Monoclinic (mirror)": "#fd79a8",
  "Tetragonal (mirror)": "#4ecdc4",
  "Trigonal (mirror)": "#a29bfe",
  "Hexagonal (mirror)": "#ff6b6b",
  Triclinic: "#dfe6e9",
};

function PhaseCard({ material, isExpanded, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: isExpanded ? `linear-gradient(135deg, ${material.color}15, ${material.color}08)` : "rgba(255,255,255,0.03)",
        border: `1px solid ${isExpanded ? material.color + "60" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 12,
        padding: "16px 20px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        marginBottom: 8,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: material.color, fontFamily: "'Georgia', serif" }}>
            {material.name}
          </span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
            {material.abbr}
          </span>
        </div>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
          {material.phases.length} phase{material.phases.length > 1 ? "s" : ""}
        </span>
      </div>

      {isExpanded && (
        <div style={{ marginTop: 16 }}>
          <div style={{ position: "relative", paddingLeft: 20 }}>
            <div style={{
              position: "absolute", left: 6, top: 4, bottom: 4, width: 2,
              background: `linear-gradient(180deg, ${material.color}80, ${material.color}20)`,
            }} />
            {material.phases.map((p, i) => (
              <div key={i} style={{ position: "relative", marginBottom: 16, paddingLeft: 16 }}>
                <div style={{
                  position: "absolute", left: -17, top: 8, width: 10, height: 10,
                  borderRadius: "50%",
                  background: p.type === "ferro" ? material.color : p.type === "anti" ? "#feca57" : p.type === "induced" ? "transparent" : "rgba(255,255,255,0.3)",
                  border: p.type === "induced" ? `2px dashed ${material.color}60` : "none",
                  boxShadow: p.type === "ferro" ? `0 0 8px ${material.color}60` : "none",
                }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.9)", marginBottom: 4 }}>
                  {p.phase}
                </div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <Tag label="SG" value={p.sg} />
                  <Tag label="PG" value={`${p.pg} / ${p.schoen}`} />
                  <Tag label="" value={p.crystal} color={crystalColors[p.crystal] || "#888"} />
                  <Tag label="T" value={p.temp} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Tag({ label, value, color }) {
  return (
    <span style={{
      fontSize: 11,
      padding: "2px 8px",
      borderRadius: 4,
      background: color ? color + "20" : "rgba(255,255,255,0.06)",
      color: color || "rgba(255,255,255,0.6)",
      fontFamily: "monospace",
      border: `1px solid ${color ? color + "30" : "rgba(255,255,255,0.08)"}`,
    }}>
      {label && <span style={{ color: "rgba(255,255,255,0.3)", marginRight: 4 }}>{label}</span>}
      {value}
    </span>
  );
}

function QuizMode({ onBack }) {
  const allPhases = MATERIALS.flatMap(m =>
    m.phases.map(p => ({ ...p, material: m.name, matColor: m.color }))
  );
  const allGroups = POLAR_GROUPS;

  const questions = [
    ...MATERIALS.map(m => ({
      q: `What is the lowest-temperature stable phase of ${m.name}?`,
      a: m.phases[m.phases.length - 1].phase,
      hint: m.phases[m.phases.length - 1].sg,
      type: "phase",
    })),
    ...MATERIALS.filter(m => m.phases.length > 1).map(m => ({
      q: `What space group does ${m.name} have in its highest-T phase?`,
      a: m.phases[0].sg,
      hint: m.phases[0].crystal,
      type: "sg",
    })),
    ...MATERIALS.filter(m => m.phases.some(p => p.type === "ferro")).map(m => {
      const ferro = m.phases.find(p => p.type === "ferro");
      return {
        q: `What point group does ferroelectric ${m.name} (${ferro.crystal}) have?`,
        a: `${ferro.pg} (${ferro.schoen})`,
        hint: ferro.sg,
        type: "pg",
      };
    }),
    { q: "Which point group corresponds to orthorhombic polar symmetry?", a: "mm2 (C₂ᵥ)", hint: "C₂ᵥ", type: "polar" },
    { q: "Which Schoenflies symbol corresponds to point group 4mm?", a: "C₄ᵥ", hint: "Tetragonal with mirror", type: "polar" },
    { q: "What space group is the ferroelectric orthorhombic phase of HfO₂?", a: "Pca2₁ — point group mm2 (C₂ᵥ)", hint: "stabilized in films", type: "sg" },
    { q: "Which crystal system does point group 3m (C₃ᵥ) belong to?", a: "Trigonal", hint: "C₃ᵥ", type: "polar" },
    { q: "Is Pm3̄m a polar space group?", a: "No — m3̄m (Oₕ) is centrosymmetric", hint: "Cubic paraelectric", type: "concept" },
    { q: "What is the Curie temperature of BaTiO₃?", a: "~393 K (120 °C)", hint: "Cubic Oₕ ↔ Tetragonal C₄ᵥ", type: "temp" },
    { q: "Which perovskite is antiferroelectric rather than ferroelectric?", a: "PbZrO₃ (PZO) — mmm (D₂ₕ)", hint: "Pbam space group", type: "concept" },
    { q: "What Schoenflies symbol is the cubic paraelectric point group?", a: "Oₕ (International: m3̄m)", hint: "All perovskites start here at high T", type: "polar" },
    { q: "BTO rhombohedral is C₃ᵥ. What is C₃ᵥ in International notation?", a: "3m", hint: "R3m space group", type: "polar" },
    { q: "What is the Schoenflies symbol for the monoclinic P2₁/c phase of HfO₂?", a: "C₂ₕ (International: 2/m)", hint: "Nonpolar — has inversion", type: "polar" },
  ];

  const [idx, setIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [shuffled, setShuffled] = useState([]);

  useEffect(() => {
    const s = [...questions].sort(() => Math.random() - 0.5);
    setShuffled(s);
  }, []);

  if (shuffled.length === 0) return null;
  const current = shuffled[idx % shuffled.length];

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <button onClick={onBack} style={btnStyle}>← Back</button>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
          {(idx % shuffled.length) + 1} / {shuffled.length}
        </span>
      </div>

      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 16,
        padding: 32,
        minHeight: 200,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}>
        <div style={{
          fontSize: 10, textTransform: "uppercase", letterSpacing: 2,
          color: "rgba(255,255,255,0.3)", marginBottom: 16,
        }}>
          {current.type}
        </div>
        <div style={{
          fontSize: 20, fontWeight: 600, color: "rgba(255,255,255,0.9)",
          fontFamily: "'Georgia', serif", lineHeight: 1.5, marginBottom: 24,
        }}>
          {current.q}
        </div>

        {showHint && !showAnswer && (
          <div style={{
            fontSize: 14, color: "#feca57", fontFamily: "monospace",
            padding: "8px 12px", background: "#feca5710", borderRadius: 8,
            border: "1px solid #feca5730", marginBottom: 16,
          }}>
            Hint: {current.hint}
          </div>
        )}

        {showAnswer && (
          <div style={{
            fontSize: 18, color: "#4ecdc4", fontWeight: 600,
            padding: "12px 16px", background: "#4ecdc410", borderRadius: 8,
            border: "1px solid #4ecdc430", fontFamily: "monospace",
          }}>
            {current.a}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 20, justifyContent: "center" }}>
        {!showAnswer && (
          <button onClick={() => setShowHint(true)} style={{ ...btnStyle, opacity: showHint ? 0.3 : 1 }}>
            Hint
          </button>
        )}
        <button
          onClick={() => { setShowAnswer(!showAnswer); if (showAnswer) setShowHint(false); }}
          style={{ ...btnStyle, background: showAnswer ? "#4ecdc420" : "rgba(255,255,255,0.08)" }}
        >
          {showAnswer ? "Hide" : "Reveal"}
        </button>
        <button
          onClick={() => { setIdx(idx + 1); setShowAnswer(false); setShowHint(false); }}
          style={btnStyle}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

const btnStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "rgba(255,255,255,0.7)",
  padding: "8px 16px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 13,
  fontFamily: "monospace",
  transition: "all 0.2s",
};

export default function App() {
  const [tab, setTab] = useState("phases");
  const [expanded, setExpanded] = useState(0);
  const [highlightCrystal, setHighlightCrystal] = useState(null);

  if (tab === "quiz") {
    return (
      <div style={{
        minHeight: "100vh", background: "#0a0e1a",
        color: "white", padding: "32px 24px",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}>
        <QuizMode onBack={() => setTab("phases")} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0e1a",
      color: "white",
      padding: "32px 24px",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{
          fontSize: 28, fontWeight: 300, letterSpacing: -0.5,
          marginBottom: 4, fontFamily: "'Georgia', serif",
          color: "rgba(255,255,255,0.9)",
        }}>
          Ferroelectric Crystallography
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 28, fontFamily: "monospace" }}>
          Phase sequences · Polar space groups · Study tool
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {["phases", "polar", "quiz"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                ...btnStyle,
                background: tab === t ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)",
                color: tab === t ? "white" : "rgba(255,255,255,0.5)",
                borderColor: tab === t ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)",
                fontWeight: tab === t ? 600 : 400,
              }}
            >
              {t === "phases" ? "Phase Sequences" : t === "polar" ? "Polar Groups" : "Quiz"}
            </button>
          ))}
        </div>

        {tab === "phases" && (
          <div>
            <div style={{
              display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap",
            }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", alignSelf: "center", marginRight: 8 }}>
                Legend:
              </span>
              {[
                { label: "Paraelectric", color: "rgba(255,255,255,0.3)", fill: false },
                { label: "Ferroelectric", color: "#4ecdc4", fill: true },
                { label: "Antiferroelectric", color: "#feca57", fill: true },
                { label: "Induced", color: "rgba(255,255,255,0.3)", fill: false, dashed: true },
              ].map(l => (
                <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: l.fill ? l.color : "transparent",
                    border: l.fill ? "none" : l.dashed ? `1.5px dashed ${l.color}` : `1.5px solid ${l.color}`,
                    display: "inline-block",
                  }} />
                  {l.label}
                </span>
              ))}
            </div>

            {MATERIALS.map((m, i) => (
              <PhaseCard
                key={i}
                material={m}
                isExpanded={expanded === i}
                onClick={() => setExpanded(expanded === i ? -1 : i)}
              />
            ))}

            <div style={{
              marginTop: 24, padding: 16, borderRadius: 10,
              background: "rgba(78,205,196,0.05)", border: "1px solid rgba(78,205,196,0.15)",
              fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.7,
            }}>
              <strong style={{ color: "#4ecdc4" }}>Pattern to remember:</strong> All these perovskites start cubic Oₕ (Pm3̄m) at high T.
              Cooling progressively lowers symmetry: Cubic Oₕ → Tetragonal C₄ᵥ → Orthorhombic C₂ᵥ → Rhombohedral C₃ᵥ.
              BTO goes through all four. PTO stops at C₄ᵥ. HfO₂ is the outlier — monoclinic C₂ₕ in bulk, orthorhombic C₂ᵥ ferroelectric only stabilized in thin films.
            </div>
          </div>
        )}

        {tab === "polar" && (
          <div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20, lineHeight: 1.6 }}>
              The 10 polar point groups — these are the only ones that can support spontaneous polarization (and thus ferroelectricity).
              Tap a crystal system to highlight related entries.
            </p>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
              {Object.entries(crystalColors).filter(([k]) => !k.includes("(")).map(([name, color]) => (
                <button
                  key={name}
                  onClick={() => setHighlightCrystal(highlightCrystal === name ? null : name)}
                  style={{
                    ...btnStyle,
                    fontSize: 11,
                    padding: "4px 10px",
                    background: highlightCrystal === name ? color + "30" : "transparent",
                    borderColor: color + "40",
                    color: color,
                  }}
                >
                  {name}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              {POLAR_GROUPS.map((g, i) => {
                const baseCrystal = g.crystal.replace(/ \(mirror\)/, "");
                const c = crystalColors[g.crystal] || crystalColors[baseCrystal] || "#888";
                const dimmed = highlightCrystal && baseCrystal !== highlightCrystal;
                return (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "70px 50px 1fr",
                      gap: 16,
                      padding: "12px 16px",
                      borderRadius: 10,
                      background: dimmed ? "rgba(255,255,255,0.01)" : `${c}08`,
                      border: `1px solid ${dimmed ? "rgba(255,255,255,0.03)" : c + "25"}`,
                      opacity: dimmed ? 0.3 : 1,
                      transition: "all 0.3s",
                      alignItems: "start",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: c, fontFamily: "monospace" }}>
                        {g.schoen}
                      </div>
                      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
                        {g.intl}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 11, color: c, padding: "2px 6px", borderRadius: 4,
                      background: c + "15", textAlign: "center", alignSelf: "center",
                      whiteSpace: "nowrap",
                    }}>
                      {baseCrystal}
                    </div>
                    <div style={{
                      fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "monospace",
                      lineHeight: 1.6, wordBreak: "break-word",
                    }}>
                      {g.spaces}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{
              marginTop: 24, padding: 16, borderRadius: 10,
              background: "rgba(162,155,254,0.05)", border: "1px solid rgba(162,155,254,0.15)",
              fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.7,
            }}>
              <strong style={{ color: "#a29bfe" }}>Key insight:</strong> Polar point groups are subgroups of ∞m (the symmetry of a vector).
              They must lack inversion symmetry AND have a unique polar axis.
              The "with mirror" variants (Cₙᵥ) are the most common ferroelectric symmetries — BTO tetragonal is C₄ᵥ (4mm), BTO rhombohedral is C₃ᵥ (3m), HfO₂ orthorhombic is C₂ᵥ (mm2).
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
