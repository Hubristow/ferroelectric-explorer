/* ── All 32 crystallographic point groups ─────────────────────────── */
const allGroups = [
  // Triclinic
  { schoenflies: "C1", international: "1", crystal: "Triclinic", polar: true, spaceGroups: "P1" },
  { schoenflies: "Ci", international: "\u03051", crystal: "Triclinic", polar: false, spaceGroups: "P\u03051" },

  // Monoclinic
  { schoenflies: "C2", international: "2", crystal: "Monoclinic", polar: true, spaceGroups: "P2, P2\u2081, C2" },
  { schoenflies: "Cs", international: "m", crystal: "Monoclinic", polar: true, spaceGroups: "Pm, Pc, Cm, Cc" },
  { schoenflies: "C2h", international: "2/m", crystal: "Monoclinic", polar: false, spaceGroups: "P2/m, P2\u2081/m, C2/m, P2/c, P2\u2081/c, C2/c" },

  // Orthorhombic
  { schoenflies: "D2", international: "222", crystal: "Orthorhombic", polar: false, spaceGroups: "P222, P222\u2081, P2\u20812\u20812, P2\u20812\u20812\u2081, C222\u2081, C222, F222, I222, I2\u20812\u20812\u2081" },
  { schoenflies: "C2v", international: "mm2", crystal: "Orthorhombic", polar: true, spaceGroups: "Pmm2, Pmc2\u2081, Pcc2, Pma2, Pca2\u2081, Pnc2, Pmn2\u2081, Pba2, Pna2\u2081, Pnn2, Cmm2, Cmc2\u2081, Ccc2, Amm2, Ama2, Aba2" },
  { schoenflies: "D2h", international: "mmm", crystal: "Orthorhombic", polar: false, spaceGroups: "Pmmm, Pnnn, Pccm, Pban, Pmma, Pbam, Pccn, Cmcm, Cmmm, Fmmm, Immm" },

  // Tetragonal
  { schoenflies: "C4", international: "4", crystal: "Tetragonal", polar: true, spaceGroups: "P4, P4\u2081, P4\u2082, P4\u2083, I4, I4\u2081" },
  { schoenflies: "S4", international: "\u03054", crystal: "Tetragonal", polar: false, spaceGroups: "P\u03054, I\u03054" },
  { schoenflies: "C4h", international: "4/m", crystal: "Tetragonal", polar: false, spaceGroups: "P4/m, P4\u2082/m, P4/n, P4\u2082/n, I4/m, I4\u2081/a" },
  { schoenflies: "D4", international: "422", crystal: "Tetragonal", polar: false, spaceGroups: "P422, P42\u20812, P4\u2081\u20812, P4\u208222, P4\u2082\u20812, I422, I4\u2081\u20812" },
  { schoenflies: "C4v", international: "4mm", crystal: "Tetragonal", polar: true, spaceGroups: "P4mm, P4bm, P4\u2082cm, P4\u2082nm, P4cc, P4nc, P4\u2082mc, P4\u2082bc, I4mm, I4cm, I4\u2081md, I4\u2081cd" },
  { schoenflies: "D2d", international: "\u030542m", crystal: "Tetragonal", polar: false, spaceGroups: "P\u030542m, P\u030542c, P\u03054b2, P\u03054n2, I\u030542m, I\u030542d" },
  { schoenflies: "D4h", international: "4/mmm", crystal: "Tetragonal", polar: false, spaceGroups: "P4/mmm, P4/mcc, P4/nbm, P4/nnc, P4\u2082/mmc, P4\u2082/nmc, I4/mmm, I4/mcm, I4\u2081/amd, I4\u2081/acd" },

  // Trigonal
  { schoenflies: "C3", international: "3", crystal: "Trigonal", polar: true, spaceGroups: "P3, P3\u2081, P3\u2082, R3" },
  { schoenflies: "C3i", international: "\u03053", crystal: "Trigonal", polar: false, spaceGroups: "P\u03053, R\u03053" },
  { schoenflies: "D3", international: "32", crystal: "Trigonal", polar: false, spaceGroups: "P312, P321, P3\u2081\u20812, P3\u20812\u20811, R32" },
  { schoenflies: "C3v", international: "3m", crystal: "Trigonal", polar: true, spaceGroups: "P3m1, P31m, P3c1, P31c, R3m, R3c" },
  { schoenflies: "D3d", international: "\u03053m", crystal: "Trigonal", polar: false, spaceGroups: "P\u030531m, P\u03053m1, P\u030531c, P\u03053c1, R\u03053m, R\u03053c" },

  // Hexagonal
  { schoenflies: "C6", international: "6", crystal: "Hexagonal", polar: true, spaceGroups: "P6, P6\u2081, P6\u2085, P6\u2082, P6\u2084, P6\u2083" },
  { schoenflies: "C3h", international: "\u03056", crystal: "Hexagonal", polar: false, spaceGroups: "P\u03056" },
  { schoenflies: "C6h", international: "6/m", crystal: "Hexagonal", polar: false, spaceGroups: "P6/m, P6\u2083/m" },
  { schoenflies: "D6", international: "622", crystal: "Hexagonal", polar: false, spaceGroups: "P622, P6\u2081\u20812, P6\u2082\u20812, P6\u2083\u20812, P6\u2084\u20812, P6\u2085\u20812" },
  { schoenflies: "C6v", international: "6mm", crystal: "Hexagonal", polar: true, spaceGroups: "P6mm, P6cc, P6\u2083cm, P6\u2083mc" },
  { schoenflies: "D3h", international: "\u03056m2", crystal: "Hexagonal", polar: false, spaceGroups: "P\u03056m2, P\u03056c2, P\u030562m, P\u030562c" },
  { schoenflies: "D6h", international: "6/mmm", crystal: "Hexagonal", polar: false, spaceGroups: "P6/mmm, P6/mcc, P6\u2083/mcm, P6\u2083/mmc" },

  // Cubic
  { schoenflies: "T", international: "23", crystal: "Cubic", polar: false, spaceGroups: "P23, F23, I23, P2\u20813, I2\u20813" },
  { schoenflies: "Th", international: "m\u03053", crystal: "Cubic", polar: false, spaceGroups: "Pm\u03053, Pn\u03053, Fm\u03053, Fd\u03053, Im\u03053, Pa\u03053, Ia\u03053" },
  { schoenflies: "O", international: "432", crystal: "Cubic", polar: false, spaceGroups: "P432, P4\u2082\u208132, F432, F4\u2081\u208132, I432, P4\u2083\u208132, P4\u2081\u208132, I4\u2081\u208132" },
  { schoenflies: "Td", international: "\u030543m", crystal: "Cubic", polar: false, spaceGroups: "P\u030543m, F\u030543m, I\u030543m, P\u030543n, F\u030543c, I\u030543d" },
  { schoenflies: "Oh", international: "m\u03053m", crystal: "Cubic", polar: false, spaceGroups: "Pm\u03053m, Pn\u03053n, Pm\u03053n, Pn\u03053m, Fm\u03053m, Fm\u03053c, Fd\u03053m, Fd\u03053c, Im\u03053m, Ia\u03053d" },
];

/* ── Ferroelectric-relevant point/space groups ───────────────────── */
const ferroGroups = [
  {
    category: "Polar (ferroelectric allowed)",
    note: "These point groups lack an inversion center and have a unique polar axis — spontaneous polarization is symmetry-allowed.",
    rows: [
      { pointGroup: "1 (C1)", crystal: "Triclinic", spaceGroups: "P1", examples: "BiFeO\u2083 (strained)" },
      { pointGroup: "2 (C2)", crystal: "Monoclinic", spaceGroups: "P2, P2\u2081, C2", examples: "KH\u2082PO\u2084 (KDP)" },
      { pointGroup: "m (Cs)", crystal: "Monoclinic", spaceGroups: "Pm, Pc, Cm, Cc", examples: "Rochelle salt" },
      { pointGroup: "mm2 (C2v)", crystal: "Orthorhombic", spaceGroups: "Pca2\u2081, Pna2\u2081, Amm2, Pba2", examples: "HfO\u2082 (Pca2\u2081), BaTiO\u2083 (Amm2), KNbO\u2083" },
      { pointGroup: "4 (C4)", crystal: "Tetragonal", spaceGroups: "P4, I4", examples: "\u2014" },
      { pointGroup: "4mm (C4v)", crystal: "Tetragonal", spaceGroups: "P4mm, P4bm, I4mm", examples: "BaTiO\u2083 (P4mm), PbTiO\u2083 (P4mm), PZT" },
      { pointGroup: "3 (C3)", crystal: "Trigonal", spaceGroups: "P3, R3", examples: "\u2014" },
      { pointGroup: "3m (C3v)", crystal: "Trigonal", spaceGroups: "R3m, R3c, P3m1", examples: "BaTiO\u2083 (R3m), LiNbO\u2083 (R3c), BiFeO\u2083 (R3c), CsGeBr\u2083 (R3m)" },
      { pointGroup: "6 (C6)", crystal: "Hexagonal", spaceGroups: "P6, P6\u2083", examples: "\u2014" },
      { pointGroup: "6mm (C6v)", crystal: "Hexagonal", spaceGroups: "P6\u2083mc, P6mm", examples: "ZnO (wurtzite, pyroelectric)" },
    ],
  },
  {
    category: "Non-polar parent phases (paraelectric)",
    note: "These centrosymmetric groups are the high-temperature parent phases from which ferroelectric phases emerge upon cooling.",
    rows: [
      { pointGroup: "m\u03053m (Oh)", crystal: "Cubic", spaceGroups: "Pm\u03053m", examples: "BaTiO\u2083, PbTiO\u2083, CsGeBr\u2083, PbZrO\u2083 (paraelectric)" },
      { pointGroup: "4/mmm (D4h)", crystal: "Tetragonal", spaceGroups: "P4\u2082/nmc", examples: "HfO\u2082 / ZrO\u2082 (high-T)" },
      { pointGroup: "2/m (C2h)", crystal: "Monoclinic", spaceGroups: "P2\u2081/c", examples: "HfO\u2082 (monoclinic, nonpolar bulk)" },
      { pointGroup: "mmm (D2h)", crystal: "Orthorhombic", spaceGroups: "Pbam, Pbcm", examples: "PbZrO\u2083 (antiferroelectric)" },
    ],
  },
];

export default function PolarPointGroups() {
  return (
    <div className="ref-page">
      <h1 className="ref-title">Point Groups &amp; Space Groups</h1>
      <p className="ref-subtitle">
        All 32 crystallographic point groups and their associated space groups,
        plus a ferroelectric-focused reference.
      </p>

      {/* ── Ferroelectric-relevant table ──────────────────────────────── */}
      <h2 className="ref-section-title">Ferroelectric-Relevant Groups</h2>

      {ferroGroups.map((section) => (
        <div key={section.category} style={{ marginBottom: "2rem" }}>
          <h3 className="ref-section-subtitle">{section.category}</h3>
          <p className="ref-note">{section.note}</p>
          <div className="table-wrap" style={{ marginBottom: "1.5rem" }}>
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Point Group</th>
                  <th>Crystal System</th>
                  <th>Common Space Groups</th>
                  <th>Material Examples</th>
                </tr>
              </thead>
              <tbody>
                {section.rows.map((r) => (
                  <tr key={r.pointGroup}>
                    <td className="mono">{r.pointGroup}</td>
                    <td>{r.crystal}</td>
                    <td className="mono">{r.spaceGroups}</td>
                    <td>{r.examples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* ── Full 32 point groups table ───────────────────────────────── */}
      <h2 className="ref-section-title">All 32 Crystallographic Point Groups</h2>
      <p className="ref-note" style={{ marginBottom: "1.5rem" }}>
        Polar point groups (which permit spontaneous polarization) are highlighted.
      </p>

      <div className="table-wrap">
        <table className="ref-table">
          <thead>
            <tr>
              <th>Schoenflies</th>
              <th>International</th>
              <th>Crystal System</th>
              <th>Polar</th>
              <th>Space Groups (common examples)</th>
            </tr>
          </thead>
          <tbody>
            {allGroups.map((g) => (
              <tr key={g.schoenflies} className={g.polar ? "row-polar" : ""}>
                <td className="mono">{g.schoenflies}</td>
                <td className="mono">{g.international}</td>
                <td>{g.crystal}</td>
                <td>{g.polar ? "Yes" : "\u2014"}</td>
                <td className="mono space-groups-cell">{g.spaceGroups}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
