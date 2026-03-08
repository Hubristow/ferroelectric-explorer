/**
 * Visualization registry — add new entries here to extend the site.
 *
 * Each entry defines:
 *   slug       – URL path segment (must be unique)
 *   title      – human-readable title shown on cards and page headers
 *   subtitle   – short description / tagline
 *   category   – grouping label (used for filtering on the homepage)
 *   color      – accent color for the card
 *   component  – lazy-loaded React component (must default-export the viz)
 */
import { lazy } from "react";

const registry = [
  /* ── Reference Tables ─────────────────────────────────────────────── */
  {
    slug: "phase-sequences",
    title: "Ferroelectric Phase Sequences",
    subtitle: "Space groups, point groups & crystal systems for each material phase",
    category: "Reference Tables",
    color: "#ffeaa7",
    component: lazy(() => import("./pages/PhaseSequences.jsx")),
  },
  {
    slug: "polar-point-groups",
    title: "Polar Point Groups & Space Groups",
    subtitle: "Schoenflies & International notation for the 10 polar point groups",
    category: "Reference Tables",
    color: "#74b9ff",
    component: lazy(() => import("./pages/PolarPointGroups.jsx")),
  },
  /* ── Phase Transitions ────────────────────────────────────────────── */
  {
    slug: "bto-phase-transitions",
    title: "BaTiO\u2083 Phase Transitions",
    subtitle: "Cubic \u2192 Tetragonal \u2192 Orthorhombic \u2192 Rhombohedral",
    category: "Phase Transitions",
    color: "#4ecdc4",
    component: lazy(() => import("./visualizations/BtoPhaseTransitions.jsx")),
  },
  {
    slug: "pto-phase-transition",
    title: "PbTiO\u2083 Phase Transition",
    subtitle: "Cubic \u2192 Tetragonal with large c/a distortion",
    category: "Phase Transitions",
    color: "#ff6b6b",
    component: lazy(() => import("./visualizations/PtoPhaseTransition.jsx")),
  },
  {
    slug: "cgb-phase-transition",
    title: "CsGeBr\u2083 Phase Transition",
    subtitle: "Cubic \u2192 Rhombohedral halide perovskite",
    category: "Phase Transitions",
    color: "#a29bfe",
    component: lazy(() => import("./visualizations/CgbPhaseTransition.jsx")),
  },
  {
    slug: "hfo2-phase-transitions",
    title: "HfO\u2082 Phase Transitions",
    subtitle: "Tetragonal \u2192 Monoclinic \u2192 Orthorhombic (ferroelectric)",
    category: "Phase Transitions",
    color: "#fd79a8",
    component: lazy(() => import("./visualizations/Hfo2PhaseTransitions.jsx")),
  },
];

export default registry;
