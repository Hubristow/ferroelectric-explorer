import { Link } from "react-router-dom";

const phases = [
  {
    material: "BaTiO\u2083 (BTO)",
    slug: "bto-phase-transitions",
    rows: [
      { phase: "Cubic paraelectric", spaceGroup: "Pm\u03053m", pointGroup: "m\u03053m", crystal: "Cubic", temp: "> 393 K" },
      { phase: "Tetragonal ferroelectric", spaceGroup: "P4mm", pointGroup: "4mm", crystal: "Tetragonal", temp: "393\u2013278 K" },
      { phase: "Orthorhombic ferroelectric", spaceGroup: "Amm2", pointGroup: "mm2", crystal: "Orthorhombic", temp: "278\u2013183 K" },
      { phase: "Rhombohedral ferroelectric", spaceGroup: "R3m", pointGroup: "3m", crystal: "Trigonal", temp: "< 183 K" },
    ],
  },
  {
    material: "PbTiO\u2083 (PTO)",
    slug: "pto-phase-transition",
    rows: [
      { phase: "Cubic paraelectric", spaceGroup: "Pm\u03053m", pointGroup: "m\u03053m", crystal: "Cubic", temp: "> 763 K" },
      { phase: "Tetragonal ferroelectric", spaceGroup: "P4mm", pointGroup: "4mm", crystal: "Tetragonal", temp: "< 763 K" },
    ],
  },
  {
    material: "PbZrO\u2083 (PZO)",
    slug: null,
    rows: [
      { phase: "Cubic paraelectric", spaceGroup: "Pm\u03053m", pointGroup: "m\u03053m", crystal: "Cubic", temp: "> ~505 K" },
      { phase: "Antiferroelectric", spaceGroup: "Pbam", pointGroup: "mmm", crystal: "Orthorhombic", temp: "< ~505 K" },
      { phase: "(possible polar phases under field/strain)", spaceGroup: "Pba2 / Pca2\u2081", pointGroup: "mm2", crystal: "Orthorhombic", temp: "induced" },
    ],
  },
  {
    material: "CsGeBr\u2083 (CGB)",
    slug: "cgb-phase-transition",
    rows: [
      { phase: "Cubic paraelectric", spaceGroup: "Pm\u03053m", pointGroup: "m\u03053m", crystal: "Cubic", temp: "high T" },
      { phase: "Rhombohedral ferroelectric", spaceGroup: "R3m", pointGroup: "3m", crystal: "Trigonal", temp: "lower T" },
    ],
  },
  {
    material: "HfO\u2082 (ferroelectric phase)",
    slug: "hfo2-phase-transitions",
    rows: [
      { phase: "High-T phase", spaceGroup: "P4\u2082/nmc", pointGroup: "4/mmm", crystal: "Tetragonal", temp: "high T" },
      { phase: "Nonpolar monoclinic", spaceGroup: "P2\u2081/c", pointGroup: "2/m", crystal: "Monoclinic", temp: "room T bulk" },
      { phase: "Ferroelectric orthorhombic", spaceGroup: "Pca2\u2081", pointGroup: "mm2", crystal: "Orthorhombic", temp: "stabilized in films" },
    ],
  },
];

export default function PhaseSequences() {
  return (
    <div className="ref-page">
      <h1 className="ref-title">Ferroelectric Phase Sequences</h1>
      <p className="ref-subtitle">
        Phase order from high T → low T for common ferroelectric materials.
        Click a material name to view its interactive phase transition.
      </p>

      <div className="table-wrap">
        <table className="ref-table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Phase order (High T → Low T)</th>
              <th>Space Group</th>
              <th>Point Group</th>
              <th>Crystal System</th>
              <th>Approx Temp</th>
            </tr>
          </thead>
          <tbody>
            {phases.map((mat) =>
              mat.rows.map((row, i) => (
                <tr key={`${mat.material}-${i}`}>
                  {i === 0 ? (
                    <td rowSpan={mat.rows.length} className="material-cell">
                      {mat.slug ? (
                        <Link to={`/${mat.slug}`} className="material-link">
                          {mat.material}
                        </Link>
                      ) : (
                        <span className="material-nolink">{mat.material}</span>
                      )}
                    </td>
                  ) : null}
                  <td>{row.phase}</td>
                  <td className="mono">{row.spaceGroup}</td>
                  <td className="mono">{row.pointGroup}</td>
                  <td>{row.crystal}</td>
                  <td>{row.temp}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
