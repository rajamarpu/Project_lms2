type ApiErrorShape = { response?: { data?: { error?: string } }; message?: string };

export function apiErrorMessage(error: unknown, fallback = "Request failed. Please try again.") {
  if (typeof error !== "object" || error === null) return fallback;
  const candidate = error as ApiErrorShape;
  return candidate.response?.data?.error || candidate.message || fallback;
}
