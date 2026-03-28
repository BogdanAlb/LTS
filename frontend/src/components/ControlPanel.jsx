import { useLanguage } from "../i18n/useLanguage";

export default function ControlPanel({
  onTare,
  onStart,
  onStop,
  isRunning = false,
  onExport,
  onToggleUnit,
  unitToggleLabel = "",
  unitToggleAriaLabel = "",
  className = "",
}) {
  const { t } = useLanguage();
  const rowClassName = ["button-row", className].filter(Boolean).join(" ");
  const handleMeasurementToggle = isRunning ? onStop : onStart;
  const measurementButtonLabel = isRunning
    ? t("dashboard.actions.stop")
    : t("dashboard.actions.start");
  const measurementButtonClassName = isRunning ? "stop" : "start";

  return (
    <div className={rowClassName}>
      <button type="button" onClick={onTare} className="tare">
        {t("dashboard.actions.tare")}
      </button>
      {(typeof onStart === "function" || typeof onStop === "function") && (
        <button
          type="button"
          onClick={handleMeasurementToggle}
          className={measurementButtonClassName}
          disabled={typeof handleMeasurementToggle !== "function"}
        >
          {measurementButtonLabel}
        </button>
      )}
      {typeof onToggleUnit === "function" && (
        <button
          type="button"
          onClick={onToggleUnit}
          className="unit-toggle"
          aria-label={unitToggleAriaLabel || unitToggleLabel}
        >
          {unitToggleLabel}
        </button>
      )}
      {typeof onExport === "function" && (
        <button type="button" onClick={onExport} className="export">
          {t("graph.actions.export")}
        </button>
      )}
    </div>
  );
}
