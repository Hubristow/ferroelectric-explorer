import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import VizPage from "./pages/VizPage.jsx";
import registry from "./registry.js";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
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
