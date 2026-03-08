import { Link } from "react-router-dom";
import registry from "../registry.js";

export default function PhaseTransitions() {
  const entries = registry.filter((e) => e.category === "Phase Transitions");

  return (
    <div className="home">
      <header className="hero">
        <h1>Phase Transitions</h1>
        <p className="hero-sub">
          Interactive 3D visualizations of ferroelectric crystal phase transitions.
        </p>
      </header>

      <div className="card-grid">
        {entries.map((entry) => (
          <Link
            key={entry.slug}
            to={`/${entry.slug}`}
            className="card"
            style={{ "--accent": entry.color }}
          >
            <div className="card-color-bar" />
            <h3 className="card-title">{entry.title}</h3>
            <p className="card-subtitle">{entry.subtitle}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
