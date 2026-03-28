import { useLanguage } from "../i18n/useLanguage";

export default function ControlPanel({ onTare, onExport, className = "" }) {
  const { t } = useLanguage();
  const rowClassName = ["button-row", className].filter(Boolean).join(" ");

  return (
    <div className={rowClassName}>
      <button type="button" onClick={onTare} className="tare">
        {t("dashboard.actions.tare")}
      </button>
      {typeof onExport === "function" && (
        <button type="button" onClick={onExport} className="export">
          {t("graph.actions.export")}
        </button>
      )}
    </div>
  );
}
