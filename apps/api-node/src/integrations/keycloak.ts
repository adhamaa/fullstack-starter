import { createRemoteJWKSet, jwtVerify } from "jose";
import type { Request, Response, NextFunction } from "express";
import { env } from "../env.js";

const jwks = createRemoteJWKSet(new URL(`${env.KEYCLOAK_ISSUER}/protocol/openid-connect/certs`));

export async function verifyAccessToken(token: string) {
  return jwtVerify(token, jwks, {
    issuer: env.KEYCLOAK_ISSUER,
    audience: env.KEYCLOAK_AUDIENCE
  });
}

export async function requireAuth(request: Request, response: Response, next: NextFunction) {
  const header = request.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

  if (!token) {
    response.status(401).json({ error: "missing bearer token" });
    return;
  }

  try {
    const { payload } = await verifyAccessToken(token);
    response.locals.user = payload;
    next();
  } catch {
    response.status(401).json({ error: "invalid bearer token" });
  }
}
