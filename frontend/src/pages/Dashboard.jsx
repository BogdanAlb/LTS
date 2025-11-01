import React, { useEffect, useState } from "react";
import GaugeDisplay from "../components/GaugeDisplay";
import ControlPanel from "../components/ControlPanel";
import { getCurrentWeight } from "../api/sensor";
import logo from "../assets/lts-logo.png"; // <— import logo

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
    <div className="h-screen" style={{background:"#111", color:"#fff", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
      {/* Header cu logo */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
        <img src={logo} alt="LTS" style={{ height:64, width:"auto" }} />
        <h1 style={{ margin:0, fontSize:28, fontWeight:700 }}>LTS Industrial Kiosk</h1>
      </div>

      <GaugeDisplay value={weight} />
      <ControlPanel
        onTare={() => alert("Tare executed")}
        onStart={() => setRunning(true)}
        onStop={() => setRunning(false)}
      />
    </div>
  );
}