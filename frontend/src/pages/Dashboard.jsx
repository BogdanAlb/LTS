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
      poller = setInterval(fetchWeight, 500);
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

  const handleStart = () => {
    if (isRunning) {
      return;
    }
    setIsRunning(true);
    setMessageKey("dashboard.messages.started");
  };

  const handleStop = () => {
    if (!isRunning) {
      return;
    }
    setIsRunning(false);
    setMessageKey("dashboard.messages.stopped");
  };

  const handleTare = async () => {
    const ok = await tareScale();
    if (ok) {
      setWeight(0);
      setMessageKey("dashboard.messages.tareDone");
      return;
    }
    setMessageKey("dashboard.messages.tareFailed");
  };

  return (
    <section className="page">
      <div className="dashboard-panel">
        <GaugeDisplay value={weight} />
        <ControlPanel
          onTare={handleTare}
          onStart={handleStart}
          onStop={handleStop}
        />
        {messageKey && <div className="status-message">{t(messageKey)}</div>}
      </div>
    </section>
  );
}
