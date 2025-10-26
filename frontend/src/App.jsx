import React, { useState, useEffect } from "react";
import GaugeDisplay from "./components/GaugeDisplay";
import ControlPanel from "./components/ControlPanel";
import { getCurrentWeight } from "./api/sensor";

export default function App() {
  const [weight, setWeight] = useState(null);
  const [intervalId, setIntervalId] = useState(null);

  // Funcția pentru actualizarea valorii
  const fetchWeight = async () => {
    const value = await getCurrentWeight();
    console.log("Weight received:", value); // vezi în consola Safari
    if (value !== null) setWeight(value);
  };

  // Pornește actualizarea automată
  const handleStart = () => {
    if (!intervalId) {
      const id = setInterval(fetchWeight, 500); // la 0.5s
      setIntervalId(id);
    }
  };

  // Oprește actualizarea
  const handleStop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  // Resetează tara
  const handleTare = async () => {
    await fetch("http://192.168.0.183:8000/sensors/hx711", { method: "POST" })
      .then(() => console.log("Tare requested"))
      .catch((err) => console.error("Tare error:", err));
  };

  // Curățare la demontare
  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800">
      <GaugeDisplay value={weight} />
      <ControlPanel onTare={handleTare} onStart={handleStart} onStop={handleStop} />
    </div>
  );
}