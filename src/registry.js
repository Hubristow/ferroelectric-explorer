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
  {
    slug: "bto-phase-transitions",
    title: "BaTiO\u2083 Phase Transitions",
    subtitle: "Cubic \u2192 Tetragonal \u2192 Orthorhombic \u2192 Rhombohedral",
    category: "Phase Transitions",
    color: "#2a9d8f",
    component: lazy(() => import("./visualizations/BtoPhaseTransitions.jsx")),
  },
  {
    slug: "pto-phase-transition",
    title: "PbTiO\u2083 Phase Transition",
    subtitle: "Cubic \u2192 Tetragonal with large c/a distortion",
    category: "Phase Transitions",
    color: "#c44d3f",
    component: lazy(() => import("./visualizations/PtoPhaseTransition.jsx")),
  },
  {
    slug: "cgb-phase-transition",
    title: "CsGeBr\u2083 Phase Transition",
    subtitle: "Cubic \u2192 Rhombohedral halide perovskite",
    category: "Phase Transitions",
    color: "#7b68ae",
    component: lazy(() => import("./visualizations/CgbPhaseTransition.jsx")),
  },
  {
    slug: "hfo2-phase-transitions",
    title: "HfO\u2082 Phase Transitions",
    subtitle: "Tetragonal \u2192 Monoclinic \u2192 Orthorhombic (ferroelectric)",
    category: "Phase Transitions",
    color: "#b85c7a",
    component: lazy(() => import("./visualizations/Hfo2PhaseTransitions.jsx")),
  },
];

export default registry;
