import React, { useEffect, useState } from "react";
import GaugeDisplay from "../components/GaugeDisplay";
import ControlPanel from "../components/ControlPanel";
import { getCurrentWeight } from "../api/sensor";
import topLogo from "../assets/lts-logo.png";

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
    <>
      {/* Logo fix, dreapta-sus */}
      <div className="brandCorner">
        <img src={topLogo} alt="LTS Logo" className="brandLogo" />
      </div>

      {/* Conținutul paginii */}
      <div
        style={{
          minHeight: "100vh",
          background: "#111",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <GaugeDisplay value={weight} />
        <ControlPanel
          onTare={() => alert("Tare executed")}
          onStart={() => setRunning(true)}
          onStop={() => setRunning(false)}
        />
      </div>
    </>
  );
}