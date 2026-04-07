import type { NextFunction, Request, Response } from "express";

import { supabase } from "../config/supabase";
import type { AuthenticatedRequest } from "../types";

const extractBearerToken = (
  authorizationHeader: string | undefined,
): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

export const authMiddleware = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const accessToken = extractBearerToken(request.header("Authorization"));

    if (!accessToken) {
      console.warn("[AUTH] Missing or invalid Authorization header", {
        method: request.method,
        path: request.originalUrl,
      });
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      console.warn("[AUTH] Failed to validate user token", {
        method: request.method,
        path: request.originalUrl,
        supabaseError: error?.message,
      });
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = data.user;
    authenticatedRequest.accessToken = accessToken;

    next();
  } catch (error) {
    console.error("[AUTH] Unexpected authentication middleware error", {
      method: request.method,
      path: request.originalUrl,
      error,
    });
    response.status(401).json({ message: "Unauthorized" });
  }
};
