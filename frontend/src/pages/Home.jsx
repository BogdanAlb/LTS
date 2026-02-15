import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/useLanguage";

export default function Home() {
  const { t } = useLanguage();

  const branches = [
    {
      title: t("home.branches.dashboard.title"),
      description: t("home.branches.dashboard.description"),
      to: "/dashboard",
    },
    {
      title: t("home.branches.graph.title"),
      description: t("home.branches.graph.description"),
      to: "/grafic",
    },
    {
      title: t("home.branches.status.title"),
      description: t("home.branches.status.description"),
      to: "/status",
    },
    {
      title: t("home.branches.settings.title"),
      description: t("home.branches.settings.description"),
      to: "/settings",
    },
  ];

  return (
    <section className="page">
      <h2 className="page-title">{t("home.title")}</h2>
      <p className="page-subtitle">{t("home.subtitle")}</p>
      <div className="feature-grid">
        {branches.map((branch) => (
          <Link key={branch.to} to={branch.to} className="feature-card">
            <h3>{branch.title}</h3>
            <p>{branch.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
