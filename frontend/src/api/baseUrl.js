const envBase = import.meta.env.VITE_API_BASE_URL?.trim();

function getRuntimeDefaultBaseUrl() {
  if (typeof window === "undefined") {
    return "http://localhost:8000";
  }

  return `${window.location.protocol}//${window.location.hostname}:8000`;
}

const API_BASE = (envBase && envBase.length > 0 ? envBase : getRuntimeDefaultBaseUrl())
  .replace(/\/+$/, "");

export default API_BASE;
