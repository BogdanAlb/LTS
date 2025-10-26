import React, { useState, useEffect } from "react";
import { getWifiSignal } from "../api/sensor";

export default function StatusBar() {
  const [time, setTime] = useState(new Date());
  const [wifi, setWifi] = useState(0);

  // Actualizează ora
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Actualizează semnalul Wi-Fi la fiecare 5 secunde
  useEffect(() => {
    const updateWifi = async () => {
      const value = await getWifiSignal();
      setWifi(value);
    };
    updateWifi();
    const interval = setInterval(updateWifi, 5000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = time.toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const formattedDate = time.toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Creează indicatorul grafic Wi-Fi (▂▄▆█)
  const getWifiBars = (percent) => {
    if (percent >= 80) return "▂▄▆█";
    if (percent >= 60) return "▂▄▆░";
    if (percent >= 40) return "▂▄░░";
    if (percent >= 20) return "▂░░░";
    return "░░░░";
  };

  const wifiColor =
    wifi >= 80 ? "#10b981" : wifi >= 50 ? "#facc15" : "#ef4444";

  return (
    <div className="status-bar">
      <div className="status-content">
        <span className="wifi" style={{ color: wifiColor }}>
          {getWifiBars(wifi)} {wifi}%
        </span>
        <span className="date">{formattedDate}</span>
        <span className="time">{formattedTime}</span>
      </div>
    </div>
  );
}