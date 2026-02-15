import { useLanguage } from "../i18n/useLanguage";

export default function ControlPanel({ onTare, onStart, onStop, onExport }) {
  const { t } = useLanguage();

  return (
    <div className="button-row">
      <button type="button" onClick={onTare} className="tare">
        {t("dashboard.actions.tare")}
      </button>
      <button type="button" onClick={onStart} className="start">
        {t("dashboard.actions.start")}
      </button>
      <button type="button" onClick={onStop} className="stop">
        {t("dashboard.actions.stop")}
      </button>
      {typeof onExport === "function" && (
        <button type="button" onClick={onExport} className="export">
          {t("graph.actions.export")}
        </button>
      )}
    </div>
  );
}
