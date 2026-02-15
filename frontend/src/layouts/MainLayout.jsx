import { NavLink, Outlet } from "react-router-dom";
import topLogo from "../assets/lts-logo.png";
import StatusBar from "../components/StatusBar";

const navItems = [
  { to: "/", label: "Principal" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/status", label: "Status" },
  { to: "/settings", label: "Setari" },
];

export default function MainLayout() {
  return (
    <div className="app-shell">
      <StatusBar />

      <header className="main-header">
        <div className="brand-block">
          <img src={topLogo} alt="LTS Logo" className="brand-logo" />
          <div>
            <p className="brand-title">LTS Weight Monitor</p>
            <p className="brand-subtitle">Structura clara pe pagina principala si ramuri</p>
          </div>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              end={item.to === "/"}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
