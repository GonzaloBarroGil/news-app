const BFF_BASE_URL =
  process.env["NEXT_PUBLIC_BFF_URL"] ?? "http://localhost:3001/api/v1";

interface ErrorResponse {
  readonly code: string;
  readonly message: string;
}

export class ApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "ApiError";
  }
}

export async function fetchBff<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${BFF_BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value);
    }
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    let errorData: ErrorResponse;
    try {
      errorData = (await response.json()) as ErrorResponse;
    } catch {
      throw new ApiError(
        "UNKNOWN",
        `Request failed with status ${response.status}`,
      );
    }
    throw new ApiError(errorData.code, errorData.message);
  }

  return response.json() as Promise<T>;
}
