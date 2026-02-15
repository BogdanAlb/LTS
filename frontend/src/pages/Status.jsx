import { useEffect, useState } from "react";
import { getWifiSignal } from "../api/sensor";

function getWifiQuality(percent) {
  if (percent >= 80) return "Foarte bun";
  if (percent >= 60) return "Bun";
  if (percent >= 40) return "Mediu";
  if (percent >= 20) return "Slab";
  return "Critic";
}

export default function Status() {
  const [wifi, setWifi] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    let active = true;

    const loadWifi = async () => {
      const value = await getWifiSignal();
      if (!active) {
        return;
      }
      setWifi(value ?? 0);
      setLastUpdate(new Date());
    };

    loadWifi();
    const poller = setInterval(loadWifi, 5000);

    return () => {
      active = false;
      clearInterval(poller);
    };
  }, []);

  return (
    <section className="page">
      <h2 className="page-title">Status Sistem</h2>
      <div className="info-grid">
        <article className="info-card">
          <p className="info-label">Semnal Wi-Fi</p>
          <p className="info-value">{wifi}%</p>
          <p className="info-note">{getWifiQuality(wifi)}</p>
        </article>

        <article className="info-card">
          <p className="info-label">Ultima actualizare</p>
          <p className="info-value">
            {lastUpdate
              ? lastUpdate.toLocaleTimeString("ro-RO", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
              : "--:--:--"}
          </p>
          <p className="info-note">Refresh automat la 5 secunde</p>
        </article>
      </div>
    </section>
  );
}
