import { useEffect, useState } from "react";
import { getWifiSignal } from "../api/sensor";
import { useLanguage } from "../i18n/useLanguage";

function getWifiQualityKey(percent) {
  if (percent >= 80) return "status.wifiQuality.excellent";
  if (percent >= 60) return "status.wifiQuality.good";
  if (percent >= 40) return "status.wifiQuality.medium";
  if (percent >= 20) return "status.wifiQuality.low";
  return "status.wifiQuality.critical";
}

export default function Status() {
  const { locale, t } = useLanguage();
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
      <h2 className="page-title">{t("status.title")}</h2>
      <div className="info-grid">
        <article className="info-card">
          <p className="info-label">{t("status.wifiSignal")}</p>
          <p className="info-value">{wifi}%</p>
          <p className="info-note">{t(getWifiQualityKey(wifi))}</p>
        </article>

        <article className="info-card">
          <p className="info-label">{t("status.lastUpdate")}</p>
          <p className="info-value">
            {lastUpdate
              ? lastUpdate.toLocaleTimeString(locale, {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
              : "--:--:--"}
          </p>
          <p className="info-note">{t("status.refreshNote")}</p>
        </article>
      </div>
    </section>
  );
}
