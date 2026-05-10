import type { HealthStatus } from "@fullstack/types";

export type ApiClientOptions = {
  baseUrl: string;
  accessToken?: string;
};

export function createApiClient({ baseUrl, accessToken }: ApiClientOptions) {
  const request = async <T>(path: string): Promise<T> => {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  };

  return {
    health: () => request<HealthStatus>("/health"),
    flaskHealth: () => request<HealthStatus>("/health/flask")
  };
}
