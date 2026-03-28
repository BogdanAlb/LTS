import { useLanguage } from "../i18n/useLanguage";

export default function GaugeDisplay({ value, className = "" }) {
  const { t } = useLanguage();
  const hasValue = typeof value === "number";
  const displayClassName = ["gauge-display", className].filter(Boolean).join(" ");

  return (
    <div className={displayClassName}>
      <h2>{t("dashboard.liveWeight")}</h2>
      <div className={`weight-display ${hasValue ? "" : "small"}`}>
        {hasValue ? `${value} g` : "-- g"}
      </div>
    </div>
  );
}
