import { createApiClient } from "@fullstack/api-client";

const api = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
});

export default async function HomePage() {
  let apiStatus = "not checked";

  try {
    const health = await api.health();
    apiStatus = `${health.service}: ${health.status}`;
  } catch {
    apiStatus = "Node API is not reachable yet";
  }

  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">Universal fullstack starter</p>
        <h1>Next.js + Expo + Node + Flask</h1>
        <p>
          Local infra is ready for MySQL, Redis, MinIO/S3, Keycloak, and Novu.
          Start Docker first, then run the apps you need.
        </p>
        <div className="status">Node API: {apiStatus}</div>
      </section>
    </main>
  );
}
