const groups = [
  { schoenflies: "C1", international: "1", crystal: "Triclinic", spaceGroups: "P1" },
  { schoenflies: "C2", international: "2", crystal: "Monoclinic", spaceGroups: "P2, C2" },
  { schoenflies: "Cs", international: "m", crystal: "Monoclinic with mirror", spaceGroups: "Pm, Pc, Cm, Cc" },
  {
    schoenflies: "C2v",
    international: "mm2",
    crystal: "Orthorhombic",
    spaceGroups:
      "Pmm2, Pmc2\u2081, Pcc2, Pma2, Pca2\u2081, Pnc2, Pmn2\u2081, Pba2, Pna2\u2081, Pnn2, Cmm2, Cmc2\u2081, Ccc2, Amm2, Abm2, Ama2, Aba2",
  },
  { schoenflies: "C4", international: "4", crystal: "Tetragonal", spaceGroups: "P4, I4" },
  {
    schoenflies: "C4v",
    international: "4mm",
    crystal: "Tetragonal with mirror",
    spaceGroups: "P4mm, P4bm, P4\u2082cm, P4\u2082nm, I4mm, I4cm",
  },
  { schoenflies: "C3", international: "3", crystal: "Trigonal", spaceGroups: "P3" },
  { schoenflies: "C3v", international: "3m", crystal: "Trigonal with mirror", spaceGroups: "P3m1, P31m" },
  { schoenflies: "C6", international: "6", crystal: "Hexagonal", spaceGroups: "P6" },
  {
    schoenflies: "C6v",
    international: "6mm",
    crystal: "Hexagonal with mirror",
    spaceGroups: "P6mm, P6cc, P63cm, P63mc",
  },
];

export default function PolarPointGroups() {
  return (
    <div className="ref-page">
      <h1 className="ref-title">Polar Point Groups &amp; Space Groups</h1>
      <p className="ref-subtitle">
        The 10 polar point groups and their associated polar space groups in
        Schoenflies and International (Hermann-Mauguin) notation.
      </p>

      <div className="table-wrap">
        <table className="ref-table">
          <thead>
            <tr>
              <th>Schoenflies</th>
              <th>International (Point Group)</th>
              <th>Crystal system / type</th>
              <th>Polar space groups (examples)</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.schoenflies}>
                <td className="mono">{g.schoenflies}</td>
                <td className="mono">{g.international}</td>
                <td>{g.crystal}</td>
                <td className="mono">{g.spaceGroups}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
