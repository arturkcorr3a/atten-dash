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
  _request,
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

  response.status(statusCode).json({
    statusCode,
    message,
  });
};
