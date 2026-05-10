export type HealthStatus = {
  service: string;
  status: "ok" | "degraded";
  timestamp: string;
  dependencies?: Record<string, "ok" | "missing" | "error">;
};

export type CurrentUser = {
  id: string;
  email?: string;
  name?: string;
  roles: string[];
};
