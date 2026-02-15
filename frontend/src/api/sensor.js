import axios from "axios";

const API_BASE = "http://192.168.0.183:8000"; // backend-ul FastAPI


// Funcție pentru a obține greutatea curentă de la senzorul HX711
export async function getCurrentWeight() {
  try {
    const res = await axios.get(`${API_BASE}/sensors/hx711`);
    return res.data.weight_g;
  } catch (error) {
    console.error("Error fetching weight:", error);
    return null;
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