import { useLanguage } from "../i18n/useLanguage";

const routes = [
  { path: "/", descriptionKey: "settings.routeDescriptions.home" },
  { path: "/dashboard", descriptionKey: "settings.routeDescriptions.dashboard" },
  { path: "/grafic", descriptionKey: "settings.routeDescriptions.graph" },
  { path: "/status", descriptionKey: "settings.routeDescriptions.status" },
  { path: "/settings", descriptionKey: "settings.routeDescriptions.settings" },
];

export default function Settings() {
  const { language, setLanguage, supportedLanguages, t } = useLanguage();

  return (
    <section className="page">
      <h2 className="page-title">{t("settings.title")}</h2>
      <p className="page-subtitle">
        {t("settings.subtitle")} <code>VITE_API_BASE_URL</code>.
      </p>

      <div className="info-card">
        <p className="info-label">{t("settings.language")}</p>
        <div className="language-buttons">
          {supportedLanguages.map((code) => (
            <button
              key={code}
              type="button"
              className={`language-button${language === code ? " active" : ""}`}
              onClick={() => setLanguage(code)}
            >
              {t(`settings.languageNames.${code}`)}
            </button>
          ))}
        </div>
        <p className="info-note">
          {t("settings.selectedLanguage")}: {t(`settings.languageNames.${language}`)}
        </p>
      </div>

      <div className="info-card">
        <p className="info-label">{t("settings.routes")}</p>
        <ul className="route-list">
          {routes.map((route) => (
            <li key={route.path}>
              <code>{route.path}</code> - {t(route.descriptionKey)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
