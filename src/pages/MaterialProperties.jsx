import { Link } from "react-router-dom";

const materials = [
  {
    name: "CsGeBr\u2083 (CGB)",
    slug: "cgb-phase-transition",
    latticeConstant: 10.408905,
    bornEffectiveCharge: 6.568,
  },
  {
    name: "BaTiO\u2083 (BTO)",
    slug: "bto-phase-transitions",
    latticeConstant: 7.4713,
    bornEffectiveCharge: 12.336,
  },
  {
    name: "PbTiO\u2083 (PTO)",
    slug: "pto-phase-transition",
    latticeConstant: 7.35551,
    bornEffectiveCharge: 9.147,
  },
];

export default function MaterialProperties() {
  return (
    <div className="ref-page">
      <h1 className="ref-title">Material Properties</h1>
      <p className="ref-subtitle">
        Lattice constants and Born effective charges for select ferroelectric perovskites.
      </p>

      <div className="table-wrap">
        <table className="ref-table">
          <thead>
            <tr>
              <th>Property</th>
              {materials.map((m) => (
                <th key={m.name}>{m.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="material-cell">Lattice Constant (a.u.)</td>
              {materials.map((m) => (
                <td key={m.name} className="mono">{m.latticeConstant}</td>
              ))}
            </tr>
            <tr>
              <td className="material-cell">Born Effective Charge (Z*)</td>
              {materials.map((m) => (
                <td key={m.name} className="mono">{m.bornEffectiveCharge}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
