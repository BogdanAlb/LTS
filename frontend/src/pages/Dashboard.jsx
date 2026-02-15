import { useCallback, useEffect, useState } from "react";
import { getCurrentWeight, tareScale } from "../api/sensor";
import ControlPanel from "../components/ControlPanel";
import GaugeDisplay from "../components/GaugeDisplay";

export default function Dashboard() {
  const [weight, setWeight] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState("");

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
    if (!message) {
      return undefined;
    }

    const timeoutId = setTimeout(() => setMessage(""), 2500);
    return () => clearTimeout(timeoutId);
  }, [message]);

  const handleStart = () => {
    if (isRunning) {
      return;
    }
    setIsRunning(true);
    setMessage("Live reading started");
  };

  const handleStop = () => {
    if (!isRunning) {
      return;
    }
    setIsRunning(false);
    setMessage("Reading stopped");
  };

  const handleTare = async () => {
    const ok = await tareScale();
    if (ok) {
      setWeight(0);
      setMessage("Tare done");
      return;
    }
    setMessage("Tare failed");
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
        {message && <div className="status-message">{message}</div>}
      </div>
    </section>
  );
}
