import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="app-shell">
      <nav className="topnav">
        <NavLink to="/" className="nav-brand">
          Ferroelectric Explorer
        </NavLink>
        <div className="nav-links">
          <NavLink to="/phase-transitions" className="nav-link">
            Phase Transitions
          </NavLink>
          <NavLink to="/phase-sequences" className="nav-link">
            Ferroelectric Table
          </NavLink>
          <NavLink to="/polar-point-groups" className="nav-link">
            Polar &amp; Space Groups
          </NavLink>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
