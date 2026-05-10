import { Novu } from "@novu/node";
import type { JWTPayload } from "jose";
import { env } from "../env.js";

export const novu = env.NOVU_SECRET_KEY ? new Novu(env.NOVU_SECRET_KEY) : undefined;

export const NOVU_WORKFLOW_UPLOAD_CREATED = "upload-created";

export function getNovuStatus() {
  return novu ? ("ok" as const) : ("missing" as const);
}

export function isNovuEnabled() {
  return Boolean(novu);
}

type SubscriberPayload = JWTPayload & {
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
};

export async function identifySubscriber(payload: SubscriberPayload) {
  if (!novu || !payload.sub) return;

  try {
    await novu.subscribers.identify(payload.sub, {
      email: payload.email,
      firstName: payload.given_name ?? payload.name ?? payload.preferred_username,
      lastName: payload.family_name
    });
  } catch (error) {
    console.warn("[novu] identifySubscriber failed:", (error as Error).message);
  }
}

type UploadEventPayload = {
  uploadId: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
};

export async function triggerUploadCreated(subscriberId: string, payload: UploadEventPayload) {
  if (!novu) return;

  try {
    await novu.trigger(NOVU_WORKFLOW_UPLOAD_CREATED, {
      to: { subscriberId },
      payload
    });
  } catch (error) {
    console.warn("[novu] triggerUploadCreated failed:", (error as Error).message);
  }
}
