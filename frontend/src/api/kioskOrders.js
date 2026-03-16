import axios from "axios";
import API_BASE from "./baseUrl";

function extractErrorMessage(error, fallback) {
  return error?.response?.data?.detail ?? fallback;
}

export async function getKioskOrders(limit = 10) {
  try {
    const response = await axios.get(`${API_BASE}/kiosk/orders`, {
      params: { limit },
    });
    return response.data ?? [];
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to load kiosk orders."));
  }
}

export async function submitKioskOrder(payload) {
  try {
    const response = await axios.post(`${API_BASE}/kiosk/orders`, payload);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to send form to kiosk."));
  }
}
