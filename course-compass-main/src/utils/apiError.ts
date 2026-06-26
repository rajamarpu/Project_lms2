type ApiErrorShape = { response?: { status?: number; data?: { error?: string } }; message?: string };

export function apiErrorMessage(error: unknown, fallback = "Request failed. Please try again.") {
  if (typeof error !== "object" || error === null) return fallback;
  const candidate = error as ApiErrorShape;
  const status = candidate.response?.status;
  
  if (!candidate.response?.data) {
    if (status === 402) return "Payment required. This may indicate an issue with your account status.";
    if (status === 401) return "Invalid credentials or session expired. Please try again.";
    if (status && !candidate.response?.data) return `Request failed with status ${status}. Please check your connection and try again.`;
  }
  
  return candidate.response?.data?.error || candidate.message || fallback;
}
