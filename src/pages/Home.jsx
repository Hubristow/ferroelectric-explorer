import { Link } from "react-router-dom";
import registry from "../registry.js";

export default function Home() {
  const categories = [...new Set(registry.map((e) => e.category))];

  return (
    <div className="home">
      <header className="hero">
        <h1>Ferroelectric Explorer</h1>
        <p className="hero-sub">
          Interactive 3D visualizations of ferroelectric crystal structures and
          phase transitions.
        </p>
      </header>

      {categories.map((cat) => (
        <section key={cat} className="category-section">
          <h2 className="category-title">{cat}</h2>
          <div className="card-grid">
            {registry
              .filter((e) => e.category === cat)
              .map((entry) => (
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
        </section>
      ))}
    </div>
  );
}
