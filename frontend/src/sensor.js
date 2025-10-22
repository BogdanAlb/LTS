import axios from "axios";

const API_BASE = "http://192.168.0.183:8000"; // adresa backend-ului FastAPI

export async function getCurrentWeight() {
  try {
    const response = await axios.get(`${API_BASE}/sensor/weight`);
    return response.data.weight;
  } catch (error) {
    console.error("Error fetching weight:", error);
    return null;
  }
}
