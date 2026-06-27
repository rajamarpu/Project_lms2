const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const explicitBackendUrl = import.meta.env.VITE_BACKEND_URL || "";

const backendOrigin = (() => {
  if (explicitBackendUrl) {
    return explicitBackendUrl.replace(/\/$/, "");
  }

  if (/^https?:\/\//i.test(apiUrl)) {
    return apiUrl.replace(/\/api\/?$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
})();

export const resolveMediaUrl = (value?: string | null) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }
  if (value.startsWith("/")) {
    return `${backendOrigin}${value}`;
  }
  return value;
};
