import { NavLink, Outlet } from "react-router-dom";
import registry from "../registry.js";

export default function Layout() {
  return (
    <div className="app-shell">
      <nav className="topnav">
        <NavLink to="/" className="nav-brand">
          Ferroelectric Explorer
        </NavLink>
        <div className="nav-links">
          {registry.map((entry) => (
            <NavLink
              key={entry.slug}
              to={`/${entry.slug}`}
              className="nav-link"
              style={({ isActive }) =>
                isActive ? { color: entry.color, borderBottomColor: entry.color } : undefined
              }
            >
              {entry.title}
            </NavLink>
          ))}
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
