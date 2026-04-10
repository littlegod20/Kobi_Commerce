import type { RequestHandler } from "express";
import cors from "cors";
import helmet from "helmet";

export function createCors(clientUrl: string): RequestHandler {
  return cors({
    origin: clientUrl,
    credentials: true,
  });
}

export function createHelmet(): RequestHandler {
  return helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  });
}

