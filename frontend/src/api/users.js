import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://192.168.0.183:8000";

function withActor(actorId) {
  return {
    headers: {
      "X-Actor-Id": actorId,
    },
  };
}

function extractErrorMessage(error, fallback) {
  return error?.response?.data?.detail ?? fallback;
}

export async function getUsers() {
  try {
    const response = await axios.get(`${API_BASE}/users`);
    return response.data ?? [];
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to load users."));
  }
}

export async function addUser({ username, role, actorId }) {
  try {
    const response = await axios.post(
      `${API_BASE}/users`,
      { username, role },
      withActor(actorId),
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to create user."));
  }
}

export async function removeUser({ userId, actorId }) {
  try {
    await axios.delete(`${API_BASE}/users/${userId}`, withActor(actorId));
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to delete user."));
  }
}
