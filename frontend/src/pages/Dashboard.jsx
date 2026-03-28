import { useCallback, useEffect, useState } from "react";
import { getCurrentWeight, tareScale } from "../api/sensor";
import ControlPanel from "../components/ControlPanel";
import GaugeDisplay from "../components/GaugeDisplay";
import { useLanguage } from "../i18n/useLanguage";

export default function Dashboard() {
  const { t } = useLanguage();
  const [weight, setWeight] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [messageKey, setMessageKey] = useState("");
  const [displayUnit, setDisplayUnit] = useState("g");

  const fetchWeight = useCallback(async () => {
    const value = await getCurrentWeight();
    if (value !== null) {
      setWeight(value);
    }
  }, []);

  useEffect(() => {
    let poller;

    if (isRunning) {
      fetchWeight();
      poller = setInterval(fetchWeight, 300);
    }

    return () => {
      if (poller) {
        clearInterval(poller);
      }
    };
  }, [fetchWeight, isRunning]);

  useEffect(() => {
    if (!messageKey) {
      return undefined;
    }

    const timeoutId = setTimeout(() => setMessageKey(""), 2500);
    return () => clearTimeout(timeoutId);
  }, [messageKey]);


  const handleTare = async () => {
    const ok = await tareScale();
    if (ok) {
      setWeight(0);
      setIsRunning(true);
      setMessageKey("dashboard.messages.tareDone");
      return;
    }
    setMessageKey("dashboard.messages.tareFailed");
  };

  const handleToggleUnit = () => {
    setDisplayUnit((current) => (current === "g" ? "n" : "g"));
  };

  return (
    <section className="page dashboard-page">
      <div className="dashboard-panel">
        <div className="dashboard-live-layout">
          <GaugeDisplay value={weight} unit={displayUnit} className="dashboard-gauge-display" />
          <ControlPanel
            onTare={handleTare}
            onToggleUnit={handleToggleUnit}
            unitToggleLabel={t(`dashboard.units.${displayUnit === "g" ? "n" : "g"}`)}
            unitToggleAriaLabel={t("dashboard.actions.changeUnit")}
            className="dashboard-controls"
          />
        </div>
        {messageKey && <div className="status-message">{t(messageKey)}</div>}
      </div>
    </section>
  );
}
