import axios from "axios";

const API_BASE = "http://192.168.0.183:8000"; // backend-ul FastAPI

export async function getCurrentWeight() {
  try {
    const res = await axios.get(`${API_BASE}/sensor/weight`);
    return res.data.weight;
  } catch (error) {
    console.error("Error fetching weight:", error);
    return null;
  }
}
