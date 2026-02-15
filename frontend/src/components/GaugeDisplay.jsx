import { useLanguage } from "../i18n/useLanguage";

export default function GaugeDisplay({ value }) {
  const { t } = useLanguage();
  const hasValue = typeof value === "number";

  return (
    <div className="gauge-display">
      <h2>{t("dashboard.liveWeight")}</h2>
      <div className={`weight-display ${hasValue ? "" : "small"}`}>
        {hasValue ? `${value} g` : "-- g"}
      </div>
    </div>
  );
}
