import React, { useState, useEffect } from "react";
import GaugeDisplay from "./components/GaugeDisplay";
import ControlPanel from "./components/ControlPanel";
import { getCurrentWeight } from "./api/sensor";
import "./App.css";

export default function App() {
  const [weight, setWeight] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const [message, setMessage] = useState("");

  // Funcția pentru actualizarea valorii
  const fetchWeight = async () => {
    const value = await getCurrentWeight();
    console.log("Weight received:", value); // vezi în consola Safari
    if (value !== null) setWeight(value);
  };

  // Pornește actualizarea automată
  const handleStart = () => {
  if (!intervalId) {
    const id = setInterval(fetchWeight, 500);
    setIntervalId(id);
    setMessage("Live reading started 🔄");
    setTimeout(() => setMessage(""), 2000);
  }
};

  const handleStop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      setMessage("Reading stopped ⏸️");
      setTimeout(() => setMessage(""), 2000);
  }
};

  // Resetează tara
const handleTare = async () => {
  try {
    const res = await fetch("http://192.168.0.183:8000/sensors/hx711/tare", {
      method: "POST",
    });
    if (res.ok) {
      console.log("Tare requested successfully");
      setMessage("Tare done ✅");
      setWeight(0);
    } else {
      console.error("Tare failed:", res.status);
      setMessage("Tare failed ❌");
    }
  } catch (err) {
    console.error("Tare error:", err);
    setMessage("Tare error ❌");
  }

  // ascunde mesajul după 3 secunde
  setTimeout(() => setMessage(""), 3000);
};

  // Curățare la demontare
  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  return (
  <div className="app-container">
    <h2>Live Weight</h2>
    <div className="weight-display">
      {weight !== null ? `${weight} g` : "-- g"}
    </div>
    <div className="flex gap-4">
      <button onClick={handleTare} className="tare">Tare</button>
      <button onClick={handleStart} className="start">Start</button>
      <button onClick={handleStop} className="stop">Stop</button>
    </div>
    {message && <div className="status-message">{message}</div>}
  </div>
);
}