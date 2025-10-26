import React, { useState, useEffect } from "react";

export default function StatusBar() {
  const [time, setTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Actualizează ora la fiecare secundă
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Ascultă schimbările de conexiune
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const formattedTime = time.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formattedDate = time.toLocaleDateString("ro-RO", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div className="status-bar">
      <div className="status-content">
        <span className="date">{formattedDate}</span>
        <span className="time">{formattedTime}</span>
        <span className={`wifi ${isOnline ? "online" : "offline"}`}>
          {isOnline ? "🟢 Online" : "🔴 Offline"}
        </span>
      </div>
    </div>
  );
}