import axios from "axios";
import API_BASE from "./baseUrl";

// Funcție pentru a obține greutatea curentă de la senzorul HX711
export async function getCurrentWeight() {
  try {
    const res = await axios.get(`${API_BASE}/sensors/hx711`);
    const normalizedWeight = Number(res.data.weight_g);
    if (Number.isNaN(normalizedWeight)) {
      return null;
    }
    return Math.max(0, normalizedWeight);
  } catch (error) {
    console.error("Error fetching weight:", error);
    return null;
  }
}

export async function tareScale() {
  try {
    await axios.post(`${API_BASE}/sensors/hx711/tare`);
    return true;
  } catch (error) {
    console.error("Error calling tare:", error);
    return false;
  }
}

// Funcție pentru a obține nivelul semnalului Wi-Fi de la raspberry Pi
export async function getWifiSignal() {
  try {
    const res = await axios.get(`${API_BASE}/sensors/wifi`);
    return res.data.wifi_percent ?? 0;
  } catch (error) {
    console.error("Error fetching Wi-Fi signal:", error);
    return 0;
  }
}
