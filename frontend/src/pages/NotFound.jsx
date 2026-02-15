import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/useLanguage";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <section className="page not-found">
      <h2 className="page-title">{t("notFound.title")}</h2>
      <p className="page-subtitle">{t("notFound.subtitle")}</p>
      <Link to="/" className="back-link">
        {t("notFound.backHome")}
      </Link>
    </section>
  );
}
