import type { ErrorRequestHandler } from "express";

interface HttpError extends Error {
  status?: number;
  statusCode?: number;
}

const isValidStatusCode = (statusCode: number): boolean => {
  return Number.isInteger(statusCode) && statusCode >= 400 && statusCode <= 599;
};

export const errorHandler: ErrorRequestHandler = (
  error,
  request,
  response,
  _next,
) => {
  const typedError = error as HttpError;
  const candidateStatusCode = typedError.statusCode ?? typedError.status;
  const statusCode =
    typeof candidateStatusCode === "number" &&
    isValidStatusCode(candidateStatusCode)
      ? candidateStatusCode
      : 500;
  const message =
    statusCode >= 500
      ? "Internal server error"
      : typedError.message || "Unexpected error";

  console.error("[ERROR] Unhandled request error", {
    method: request.method,
    path: request.originalUrl,
    statusCode,
    errorName: typedError.name,
    errorMessage: typedError.message,
    stack: typedError.stack,
  });

  response.status(statusCode).json({
    statusCode,
    message,
  });
};
