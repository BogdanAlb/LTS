import { useLanguage } from "../i18n/useLanguage";

export default function ControlPanel({ onTare, onStart, onStop }) {
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
    </div>
  );
}
