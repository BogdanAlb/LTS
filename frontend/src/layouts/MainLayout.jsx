import { NavLink, Outlet, useLocation } from "react-router-dom";
import topLogo from "../assets/lts-logo.png";
import { useSession } from "../auth/useSession";
import StatusBar from "../components/StatusBar";
import { useLanguage } from "../i18n/useLanguage";

export default function MainLayout() {
  const { t } = useLanguage();
  const { isAuthenticated, logout, user } = useSession();
  const location = useLocation();
  const isLoginRoute = !isAuthenticated && location.pathname === "/";

  const navItems = [
    { to: "/", label: t("layout.nav.home") },
    { to: "/dashboard", label: t("layout.nav.dashboard") },
    { to: "/grafic", label: t("layout.nav.graph") },
    { to: "/reparatur", label: t("layout.nav.reparatur") },
    { to: "/status", label: t("layout.nav.status") },
    { to: "/settings", label: t("layout.nav.settings") },
  ];

  return (
    <div className={`app-shell${isLoginRoute ? " login-shell" : ""}`}>
      <StatusBar />

      <header className={`main-header${isLoginRoute ? " login-header" : ""}`}>
        <div className={`brand-block${isLoginRoute ? " login-brand-block" : ""}`}>
          <img
            src={topLogo}
            alt="LTS Logo"
            className={`brand-logo${isLoginRoute ? " login-brand-logo" : ""}`}
          />
          <div>
            <p className={`brand-title${isLoginRoute ? " login-brand-title" : ""}`}>{t("appName")}</p>
          </div>
        </div>

        {isAuthenticated ? (
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
        ) : null}

        {isAuthenticated && user ? (
          <div className="session-panel">
            <span className="session-user">
              {t("layout.loggedInAs")}: <strong>{user.username}</strong>
            </span>
            <button type="button" className="session-logout" onClick={logout}>
              {t("layout.logout")}
            </button>
          </div>
        ) : null}
      </header>

      <main className={`main-content${isLoginRoute ? " login-main-content" : ""}`}>
        <Outlet />
      </main>
    </div>
  );
}
