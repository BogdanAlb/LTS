import React, { useEffect, useState } from "react";
import GaugeDisplay from "../components/GaugeDisplay";
import ControlPanel from "../components/ControlPanel";
import { getCurrentWeight } from "../api/sensor";

export default function Dashboard() {
  const [weight, setWeight] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(async () => {
        const w = await getCurrentWeight();
        setWeight(w);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [running]);

  return (
    <div className="h-screen bg-gray-800 text-white flex flex-col items-center justify-center">
      <GaugeDisplay value={weight} />
      <ControlPanel
        onTare={() => alert("Tare executed")}
        onStart={() => setRunning(true)}
        onStop={() => setRunning(false)}
      />
    </div>
  );
}
