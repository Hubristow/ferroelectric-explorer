/**
 * PbZrO3 structures, all mapped onto the same 40-atom (√2 × 2√2 × 2) cell so
 * that every phase can be morphed into every other, atom by atom.
 *
 * Cartesian frame: pseudocubic axes. "Pseudocubic coords" put ideal Pb on the
 * integers, Zr on the body centers and O on the face centers.
 *
 * Sources
 *  Pbam: 10 K neutron data as tabulated by Baker et al., arXiv:2102.08856,
 *        Table III. Its O 8i y is printed 0.7378; 0.7622 is used here, which
 *        agrees with their DFT columns and with Table 3 of the PbZrO3
 *        study at orbi.uliege.be/handle/2268/262140 after an origin change
 *        (0.7378 would give an unphysical 1.83 Å Zr–O bond).
 *  R3m:  LDA a, angle and displacements, same orbi study, Table 7. Assigning
 *        its O1/O2 to parallel/perpendicular follows the soft-mode eigenvector
 *        in Ghosez et al., cond-mat/9901246.
 *        (the PBE R3m entry agm011649937 in Alexandria shows the same ordering).
 *  P4mm: relaxed PBEsol structure, Alexandria database entry agm002228878;
 *        polarization from arXiv:1307.7645 (LDA).
 *  R3c:  cell from arXiv:2406.09011, Table AI (PBEsol, hexagonal a = 5.8412,
 *        c = 14.4261 Å); tilt 5.6° and P = 66 µC/cm² from the orbi study
 *        (GGA-WC). No published coordinates were found, so positions are
 *        RECONSTRUCTED: the R3m polar pattern scaled to P, plus a rigid
 *        antiphase rotation, reading 5.6° as the total angle about [111].
 *        P varies by study: 102 in 1307.7645, ~58 in arXiv:2402.14176.
 *  Energies: arXiv:1407.8405, Table I (meV/f.u. above Pbam).
 */

const D2R = Math.PI / 180;
const A_CUBIC = 4.16;
const P4MM = { a: 4.1135, c: 4.2595 };
// Off-site z shifts (Å) relative to Pb
const P4MM_DZ = { Pb: 0, Zr: -0.2954, Opar: -0.4508, Operp: -0.6298 };
const P4MM_O_MEAN = (P4MM_DZ.Opar + 2 * P4MM_DZ.Operp) / 3;
const R3M = { a: 4.127, alpha: 89.5 };
const R3C = { hexA: 5.8412, hexC: 14.4261, tilt: 5.6, polarScale: 0.82 };
const PBAM = { a: 5.8736, b: 11.777, c: 8.1909 };

// Relative to Pb, fractional, per Cartesian component (R3m).
const SOFT = { Pb: 0, Zr: -0.0489, Opar: -0.0649, Operp: -0.0935 };
const SOFT_O_MEAN = (SOFT.Opar + 2 * SOFT.Operp) / 3;

export const PHASES = [
  {
    name: "Cubic", label: "Pm3̄m · Oₕ", energy: 375, tag: "observed > ~505 K", color: "#706b63",
    desc: "Paraelectric parent phase. Zr centered, no octahedral tilts, no net polarization. It is unstable at low temperature toward both polar distortions and octahedral rotations.",
    cell: { a: A_CUBIC, b: A_CUBIC, c: A_CUBIC, alpha: 90, beta: 90, gamma: 90 },
    polarDir: null, polarization: "= 0", lattice: "a=b=c", source: "X-ray (high T)",
  },
  {
    name: "Tetragonal FE", label: "P4mm · C₄ᵥ", energy: 124, tag: "hypothetical · DFT", color: "#2a9d8f",
    desc: "Purely polar, untilted phase with P ∥ [001], c/a ≈ 1.04. The same symmetry as PbTiO₃'s ground state, but in PZO it is the least favorable of these polar phases. It is dominated by Pb moving against the O cage, with a smaller Zr shift.",
    cell: { a: P4MM.a, b: P4MM.a, c: P4MM.c, alpha: 90, beta: 90, gamma: 90 },
    polarDir: [0, 0, 1], polarization: "≈ 78 µC/cm²", lattice: "a=b≠c", source: "PBEsol (P: LDA)",
  },
  {
    name: "Rhombohedral FE", label: "R3m · C₃ᵥ", energy: 58, tag: "metastable · debated near Tc", color: "#7b68ae",
    desc: "Purely polar, untilted phase with P ∥ [111]: the lowest-energy ferroelectric without octahedral tilts. An R3m phase has been reported in a few-kelvin window just below the cubic phase, but the identity of that intermediate phase is still debated.",
    cell: { a: R3M.a, b: R3M.a, c: R3M.a, alpha: R3M.alpha, beta: R3M.alpha, gamma: R3M.alpha },
    polarDir: [1, 1, 1], polarization: "≈ 80 µC/cm²", lattice: "a=b=c, α≠90°", source: "LDA",
  },
  {
    name: "Tilted FE", label: "R3c · C₃ᵥ", energy: 7, tag: "metastable · field-induced candidate", color: "#b85c7a",
    desc: "P ∥ [111] like R3m, but the ZrO₆ octahedra also rotate a⁻a⁻a⁻ about the polar axis, alternating in sign between neighbors. The tilts lower the energy to within a few meV/f.u. of Pbam, making R3c the usual candidate for the field-induced ferroelectric phase.",
    cell: { a: 4.1418, b: 4.1418, c: 4.1418, alpha: 89.7, beta: 89.7, gamma: 89.7 },
    polarDir: [1, 1, 1], polarization: "≈ 66 µC/cm²", lattice: "pseudocubic; 10-atom primitive", source: "PBEsol cell · positions approximate",
  },
  {
    name: "Orthorhombic AFE", label: "Pbam · D₂ₕ", energy: 0, tag: "observed < ~505 K", color: "#c4952a",
    desc: "Antiferroelectric ground state. Pb ions shift along ±a (pseudocubic ⟨110⟩) in an ↑↑↓↓ pattern along b, so the dipoles cancel. ZrO₆ octahedra rotate a⁻a⁻c⁰. The primitive cell has 40 atoms.",
    cell: { ...PBAM, alpha: 90, beta: 90, gamma: 90 },
    polarDir: null, antipolar: true, polarization: "= 0 (antipolar)", lattice: "a≠b≠c", source: "Neutron, 10 K",
  },
];

const S = Math.SQRT1_2;
/** Pbam fractional vector -> Cartesian in the pseudocubic frame. */
const pbamCart = ([x, y, z]) => [
  S * (x * PBAM.a + y * PBAM.b), S * (-x * PBAM.a + y * PBAM.b), z * PBAM.c,
];
/** Box fraction <-> pseudocubic coords (box origin on an ideal Pb site). */
export const boxToPc = ([x, y, z]) => [x + 2 * y, -x + 2 * y, 2 * z];
const pcToBox = ([p, q, r]) => [(p - q) / 2, (p + q) / 4, r / 2];

// Ideal / refined fractional coordinates of the Pbam asymmetric unit.
const ASYM = [
  ["Pb", [0.75, 0.875, 0], [0.6991, 0.8772, 0]],
  ["Pb", [0.25, 0.125, 0.5], [0.2944, 0.1294, 0.5]],
  ["Zr", [0.25, 0.875, 0.25], [0.2414, 0.8752, 0.2486]],
  ["O", [0, 0, 0.75], [0, 0, 0.7707]],
  ["O", [0, 0.5, 0.75], [0, 0.5, 0.7974]],
  ["O", [0.75, 0.125, 0.5], [0.6989, 0.0956, 0.5]],
  ["O", [0.75, 0.125, 0], [0.7244, 0.156, 0]],
  ["O", [0.5, 0.75, 0.75], [0.5317, 0.7622, 0.7202]],
];
const OPS = [1, -1].flatMap((m) => [
  [1, 1, m, 0], [-1, -1, m, 0], [1, -1, m, 0.5], [-1, 1, m, 0.5],
]);
const wrap = (v) => v - Math.round(v);
const PBAM_SITES = [];
ASYM.forEach(([el, ideal, real]) => OPS.forEach(([sx, sy, sz, t]) => {
  const site = [sx * ideal[0] + t, sy * ideal[1] + t, sz * ideal[2]];
  const disp = [
    sx * (real[0] - ideal[0]), sy * (real[1] - ideal[1]), sz * (real[2] - ideal[2]),
  ];
  const dup = PBAM_SITES.some((s) => s.el === el
    && s.site.every((v, i) => Math.abs(wrap(v - site[i])) < 1e-6));
  if (!dup) PBAM_SITES.push({ el, site, disp });
}));
export { PBAM_SITES };

const ORIGIN = [0.25, 0.125, 0];
function pbamDisp(el, pc) {
  const f = pcToBox(pc).map((v, i) => v + ORIGIN[i]);
  const hit = PBAM_SITES.find((s) => s.el === el
    && s.site.every((v, i) => Math.abs(wrap(v - f[i])) < 1e-4));
  if (!hit) throw new Error(`No Pbam site for ${el} at ${pc}`);
  return pbamCart(hit.disp);
}

/** Symmetric lattice matrix with stretch l1 along [111] and l2 normal to it. */
const stretch111 = (l1, l2) => ({ diag: (l1 + 2 * l2) / 3, off: (l1 - l2) / 3 });
const apply = (m, v) => [0, 1, 2].map((i) => v.reduce(
  (s, x, j) => s + x * (i === j ? m.diag : m.off), 0));
const cosA = Math.cos(R3M.alpha * D2R);
const R3M_LAT = stretch111(R3M.a * Math.sqrt(1 + 2 * cosA), R3M.a * Math.sqrt(1 - cosA));
const R3C_LAT = stretch111(R3C.hexC / 2 / Math.sqrt(3), R3C.hexA / Math.SQRT2);

/** Lattice (undistorted-site) position in Å for each phase. */
export function latticePos(phase, pc) {
  const [p, q, r] = pc;
  if (phase === 0) return pc.map((v) => v * A_CUBIC);
  if (phase === 1) return [p * P4MM.a, q * P4MM.a, r * P4MM.c];
  if (phase === 2) return apply(R3M_LAT, pc);
  if (phase === 3) return apply(R3C_LAT, pc);
  return pbamCart(pcToBox(pc));
}

const isHalf = (v) => Math.abs(Math.abs(v % 1) - 0.5) < 1e-6;

/** Off-site displacement in Å; polar phases keep the O-cage centroid fixed. */
export function displacement(phase, el, pc) {
  if (phase === 0) return [0, 0, 0];
  if (phase === 4) return pbamDisp(el, pc);
  const normal = pc.findIndex((v) => !isHalf(v)); // Zr–O bond axis for O
  const kind = (axis) => (el !== "O" ? el : axis === normal ? "Opar" : "Operp");
  if (phase === 1) return [0, 0, P4MM_DZ[kind(2)] - P4MM_O_MEAN];
  const polar = [0, 1, 2].map((i) => SOFT[kind(i)] - SOFT_O_MEAN);
  if (phase === 2) return apply(R3M_LAT, polar);
  const d = polar.map((v) => v * R3C.polarScale);
  if (el === "O") {
    // Rotation of the octahedron on the −½ side: ω × r, sign alternating by
    // cell parity; its neighbor across this O gives the identical shift.
    const zr = pc.map((v, i) => (i === normal ? v - 0.5 : v));
    const parity = Math.round(zr[0] + zr[1] + zr[2] - 1.5);
    const w = (parity % 2 ? -1 : 1) * Math.tan(R3C.tilt * D2R) / Math.sqrt(3);
    d[(normal + 1) % 3] += w * 0.5;
    d[(normal + 2) % 3] -= w * 0.5;
  }
  return apply(R3C_LAT, d);
}

/** Corner order: bit 0 = a, bit 1 = b, bit 2 = c. */
const corners = (fn) => Array.from({ length: 8 }, (_, i) => fn([i & 1, (i >> 1) & 1, i >> 2]));
export const BOX_CORNERS = corners(boxToPc);
/** One perovskite unit, fully inside the box. */
export const UNIT_CORNERS = corners(([x, y, z]) => [1 + x, y, z]);

/** Every atom drawn: the closed box plus the O needed to finish octahedra. */
export function buildAtoms() {
  const atoms = [];
  const index = new Map();
  const add = (el, pc) => {
    const key = pc.join();
    if (!index.has(key)) {
      index.set(key, atoms.length);
      atoms.push({
        el, pc,
        inUnit: pc[0] >= 1 && pc[0] <= 2 && pc[1] >= 0 && pc[1] <= 1 && pc[2] <= 1,
      });
    }
    return index.get(key);
  };
  const inBox = (pc) => pcToBox(pc).every((v) => v > -1e-6 && v < 1 + 1e-6);
  const octahedra = [];
  for (let p = -1; p <= 4; p++) for (let q = -2; q <= 3; q++) for (let r = 0; r <= 2; r++) {
    const pb = [p, q, r];
    if (inBox(pb)) add("Pb", pb);
    const zr = [p + 0.5, q + 0.5, r + 0.5];
    if (inBox(zr)) {
      const center = add("Zr", zr);
      const o = [];
      for (let ax = 0; ax < 3; ax++) for (const s of [0.5, -0.5]) {
        const pos = [...zr];
        pos[ax] += s;
        o.push(add("O", pos)); // order: +x −x +y −y +z −z
      }
      octahedra.push({ center, o, inUnit: atoms[center].inUnit });
    }
    for (const op of [[p + 0.5, q + 0.5, r], [p + 0.5, q, r + 0.5], [p, q + 0.5, r + 0.5]]) {
      if (inBox(op)) add("O", op);
    }
  }
  return { atoms, octahedra };
}
