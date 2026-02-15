import { NavLink, Outlet } from "react-router-dom";
import topLogo from "../assets/lts-logo.png";
import StatusBar from "../components/StatusBar";
import { useLanguage } from "../i18n/useLanguage";

export default function MainLayout() {
  const { t } = useLanguage();

  const navItems = [
    { to: "/", label: t("layout.nav.home") },
    { to: "/dashboard", label: t("layout.nav.dashboard") },
    { to: "/grafic", label: t("layout.nav.graph") },
    { to: "/status", label: t("layout.nav.status") },
    { to: "/settings", label: t("layout.nav.settings") },
  ];

  return (
    <div className="app-shell">
      <StatusBar />

      <header className="main-header">
        <div className="brand-block">
          <img src={topLogo} alt="LTS Logo" className="brand-logo" />
          <div>
            <p className="brand-title">{t("appName")}</p>
            <p className="brand-subtitle">{t("layout.subtitle")}</p>
          </div>
        </div>

        <nav className="main-nav" aria-label={t("layout.navigationAria")}>
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
