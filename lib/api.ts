export const API_BASE_URL = "https://property-backend.memcommerce.shop";

type ErrorDetail = { msg?: unknown; } | undefined;

type ErrorPayload = {
  detail?: unknown;
  message?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function extractErrorMessage(payload: unknown): string {
  if (!payload) return "Unexpected error occurred.";
  if (typeof payload === "string") return payload;

  if (isRecord(payload)) {
    if (typeof payload.detail === "string") return payload.detail;

    if (Array.isArray(payload.detail) && payload.detail.length > 0) {
      const first = payload.detail[0] as ErrorDetail;
      if (isRecord(first) && typeof first.msg === "string") return first.msg;
    }

    if (typeof payload.message === "string") return payload.message;
  }

  return "Unable to complete the request.";
}

export async function fetchWithError<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const contentType = response.headers.get("content-type");
  const hasJson = contentType?.includes("application/json");
  const payload = hasJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(extractErrorMessage(payload as ErrorPayload));
  }

  return payload as T;
}
