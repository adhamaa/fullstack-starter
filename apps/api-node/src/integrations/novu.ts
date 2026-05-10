import { Novu } from "@novu/node";
import { env } from "../env.js";

export const novu = env.NOVU_SECRET_KEY ? new Novu(env.NOVU_SECRET_KEY) : undefined;

export function getNovuStatus() {
  return novu ? "ok" as const : "missing" as const;
}
