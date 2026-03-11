import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import PhaseTransitions from "./pages/PhaseTransitions.jsx";
import VizPage from "./pages/VizPage.jsx";
import registry from "./registry.js";

const PhaseSequences = lazy(() => import("./pages/PhaseSequences.jsx"));
const PolarPointGroups = lazy(() => import("./pages/PolarPointGroups.jsx"));
const MaterialProperties = lazy(() => import("./pages/MaterialProperties.jsx"));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="phase-transitions" element={<PhaseTransitions />} />
        <Route
          path="phase-sequences"
          element={
            <Suspense fallback={<div className="loading">Loading...</div>}>
              <PhaseSequences />
            </Suspense>
          }
        />
        <Route
          path="polar-point-groups"
          element={
            <Suspense fallback={<div className="loading">Loading...</div>}>
              <PolarPointGroups />
            </Suspense>
          }
        />
        <Route
          path="material-properties"
          element={
            <Suspense fallback={<div className="loading">Loading...</div>}>
              <MaterialProperties />
            </Suspense>
          }
        />
        {registry.map((entry) => (
          <Route
            key={entry.slug}
            path={entry.slug}
            element={
              <Suspense fallback={<div className="loading">Loading...</div>}>
                <VizPage entry={entry} />
              </Suspense>
            }
          />
        ))}
      </Route>
    </Routes>
  );
}
