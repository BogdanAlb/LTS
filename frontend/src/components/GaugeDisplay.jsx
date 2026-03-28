import { useLanguage } from "../i18n/useLanguage";

const GRAMS_TO_NEWTONS = 9.80665e-4;

function formatDisplayNumber(value, maximumFractionDigits) {
  if (Math.abs(value) < 1e-9) {
    return "0";
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
    useGrouping: true,
  })
    .format(value)
    .replaceAll(",", ".");
}

function formatValue(value, unit) {
  if (unit === "n") {
    const valueInNewtons = value * GRAMS_TO_NEWTONS;
    return formatDisplayNumber(valueInNewtons, 3);
  }

  return formatDisplayNumber(value, 2);
}

export default function GaugeDisplay({ value, unit = "g", className = "" }) {
  const { t } = useLanguage();
  const hasValue = typeof value === "number" && Number.isFinite(value);
  const displayClassName = ["gauge-display", className].filter(Boolean).join(" ");
  const unitLabel = t(`dashboard.units.${unit}`);
  const formattedValue = hasValue ? formatValue(value, unit) : "--";

  return (
    <div className={displayClassName}>
      <h2>{t("dashboard.liveWeight")}</h2>
      <div className={`weight-display ${hasValue ? "" : "small"}`}>
        {formattedValue} {unitLabel}
      </div>
    </div>
  );
}
