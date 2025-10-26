import axios from "axios";

const API_BASE = "http://192.168.0.183:8000"; // adresa Raspberry Pi

export async function getCurrentWeight() {
  try {
    const res = await axios.get(`${API_BASE}/sensors/hx711`);
    return res.data.weight_g;
  } catch (error) {
    console.error("Error fetching weight:", error);
    return null;
  }
}