import type { NextFunction, Request, Response } from "express";

import { createAuthenticatedSupabaseClient } from "../config/supabase";
import type {
  Absence,
  AddAbsenceBody,
  AuthenticatedRequest,
  UpdateAbsenceBody,
} from "../types";

type AsyncRequestHandler<TParams = Record<string, string>, TBody = unknown> = (
  request: Request<TParams, unknown, TBody>,
  response: Response,
  next: NextFunction,
) => Promise<void>;

interface AbsenceRow {
  id: string;
  user_id: string;
  subject_id: string;
  absence_date: string;
  created_at: string;
}

const mapAbsenceRow = (row: AbsenceRow): Absence => {
  return {
    id: row.id,
    userId: row.user_id,
    subjectId: row.subject_id,
    absenceDate: row.absence_date,
    createdAt: row.created_at,
  };
};

const isNotFoundError = (code: string | undefined): boolean => {
  return code === "PGRST116";
};

const isPermissionError = (code: string | undefined): boolean => {
  return code === "42501";
};

const isUndefinedColumnError = (code: string | undefined): boolean => {
  return code === "42703";
};

const getAuthContext = <TParams, TBody>(
  request: AuthenticatedRequest<TParams, TBody>,
): { accessToken: string; userId: string } | null => {
  const { accessToken, user } = request;

  if (!accessToken || !user?.id) {
    return null;
  }

  return { accessToken, userId: user.id };
};

const getCurrentAbsenceDate = (): string => {
  return new Date().toISOString().slice(0, 10);
};

const isValidDateFormat = (date: string): boolean => {
  if (typeof date !== "string") {
    return false;
  }
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return false;
  }
  const parsedDate = new Date(date);
  return !Number.isNaN(parsedDate.getTime());
};

export const addAbsence: AsyncRequestHandler<
  { subjectId: string },
  AddAbsenceBody
> = async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest<
      { subjectId: string },
      AddAbsenceBody
    >;
    const authContext = getAuthContext(authenticatedRequest);

    if (!authContext) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const subjectId = authenticatedRequest.params.subjectId;

    if (!subjectId) {
      response.status(400).json({ message: "subjectId is required" });
      return;
    }

    const absenceDate =
      authenticatedRequest.body?.absenceDate || getCurrentAbsenceDate();

    if (!isValidDateFormat(absenceDate)) {
      response.status(400).json({
        message:
          "Invalid absenceDate format. Use YYYY-MM-DD format (e.g., 2024-01-15)",
      });
      return;
    }

    const supabase = createAuthenticatedSupabaseClient(authContext.accessToken);

    const { data: subjectExists, error: subjectError } = await supabase
      .from("subjects")
      .select("id")
      .eq("id", subjectId)
      .eq("user_id", authContext.userId)
      .maybeSingle<{ id: string }>();

    if (subjectError) {
      console.error("[ABSENCE] Failed to validate subject", {
        subjectId,
        userId: authContext.userId,
        code: subjectError.code,
        message: subjectError.message,
        details: subjectError.details,
      });

      if (isPermissionError(subjectError.code)) {
        response.status(403).json({ message: "Forbidden" });
        return;
      }

      if (isNotFoundError(subjectError.code)) {
        response.status(404).json({ message: "Subject not found" });
        return;
      }

      response.status(400).json({ message: "Failed to validate subject" });
      return;
    }

    if (!subjectExists) {
      response.status(404).json({ message: "Subject not found" });
      return;
    }

    const insertPayload = {
      user_id: authContext.userId,
      subject_id: subjectId,
      absence_date: absenceDate,
    };

    const { data: insertedWithDate, error: insertWithDateError } =
      await supabase
        .from("absences")
        .insert(insertPayload)
        .select("id, user_id, subject_id, absence_date, created_at")
        .single<AbsenceRow>();

    const { data, error } =
      insertWithDateError && isUndefinedColumnError(insertWithDateError.code)
        ? await supabase
            .from("absences")
            .insert({
              user_id: authContext.userId,
              subject_id: subjectId,
            })
            .select("id, user_id, subject_id, absence_date, created_at")
            .single<AbsenceRow>()
        : { data: insertedWithDate, error: insertWithDateError };

    if (error || !data) {
      if (error) {
        console.error("[ABSENCE] Failed to insert absence", {
          subjectId,
          userId: authContext.userId,
          code: error.code,
          message: error.message,
          details: error.details,
        });

        if (isPermissionError(error.code)) {
          response.status(403).json({ message: "Forbidden" });
          return;
        }
      }

      response.status(400).json({ message: "Failed to add absence" });
      return;
    }

    response.status(201).json(mapAbsenceRow(data));
  } catch (error) {
    next(error);
  }
};

export const getTotalAbsences: AsyncRequestHandler<{
  subjectId: string;
}> = async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest<{
      subjectId: string;
    }>;
    const authContext = getAuthContext(authenticatedRequest);

    if (!authContext) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const subjectId = authenticatedRequest.params.subjectId;

    if (!subjectId) {
      response.status(400).json({ message: "subjectId is required" });
      return;
    }

    const supabase = createAuthenticatedSupabaseClient(authContext.accessToken);

    const { count, error } = await supabase
      .from("absences")
      .select("id", { count: "exact", head: true })
      .eq("subject_id", subjectId)
      .eq("user_id", authContext.userId);

    if (error) {
      response.status(400).json({ message: "Failed to fetch absences" });
      return;
    }

    response.status(200).json({
      subjectId,
      totalAbsences: count ?? 0,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAbsence: AsyncRequestHandler<
  { absenceId: string },
  UpdateAbsenceBody
> = async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest<
      { absenceId: string },
      UpdateAbsenceBody
    >;
    const authContext = getAuthContext(authenticatedRequest);

    if (!authContext) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { absenceId } = authenticatedRequest.params;

    if (!absenceId) {
      response.status(400).json({ message: "absenceId is required" });
      return;
    }

    const { absenceDate } = authenticatedRequest.body;

    if (!absenceDate) {
      response.status(400).json({ message: "absenceDate is required" });
      return;
    }

    if (!isValidDateFormat(absenceDate)) {
      response.status(400).json({
        message:
          "Invalid absenceDate format. Use YYYY-MM-DD format (e.g., 2024-01-15)",
      });
      return;
    }

    const supabase = createAuthenticatedSupabaseClient(authContext.accessToken);

    const { data, error } = await supabase
      .from("absences")
      .update({ absence_date: absenceDate })
      .eq("id", absenceId)
      .eq("user_id", authContext.userId)
      .select("id, user_id, subject_id, absence_date, created_at")
      .single<AbsenceRow>();

    if (error && isNotFoundError(error.code)) {
      response.status(404).json({ message: "Absence not found" });
      return;
    }

    if (error || !data) {
      console.error("[ABSENCE] Failed to update absence", {
        absenceId,
        userId: authContext.userId,
        code: error?.code,
        message: error?.message,
      });

      response.status(400).json({ message: "Failed to update absence" });
      return;
    }

    response.status(200).json(mapAbsenceRow(data));
  } catch (error) {
    next(error);
  }
};

export const deleteAbsence: AsyncRequestHandler<{ absenceId: string }> = async (
  request,
  response,
  next,
) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest<{
      absenceId: string;
    }>;
    const authContext = getAuthContext(authenticatedRequest);

    if (!authContext) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { absenceId } = authenticatedRequest.params;

    if (!absenceId) {
      response.status(400).json({ message: "absenceId is required" });
      return;
    }

    const supabase = createAuthenticatedSupabaseClient(authContext.accessToken);

    const { data, error } = await supabase
      .from("absences")
      .delete()
      .eq("id", absenceId)
      .eq("user_id", authContext.userId)
      .select("id")
      .single<{ id: string }>();

    if (error && isNotFoundError(error.code)) {
      response.status(404).json({ message: "Absence not found" });
      return;
    }

    if (error || !data) {
      console.error("[ABSENCE] Failed to delete absence", {
        absenceId,
        userId: authContext.userId,
        code: error?.code,
        message: error?.message,
      });

      response.status(400).json({ message: "Failed to delete absence" });
      return;
    }

    response.status(200).json({ message: "Absence deleted" });
  } catch (error) {
    next(error);
  }
};
