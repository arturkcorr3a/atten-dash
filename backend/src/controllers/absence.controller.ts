import type { RequestHandler } from "express";

import { createAuthenticatedSupabaseClient } from "../config/supabase";
import type { Absence, AuthenticatedRequest } from "../types";

interface AbsenceRow {
  id: string;
  user_id: string;
  subject_id: string;
  created_at: string;
}

const mapAbsenceRow = (row: AbsenceRow): Absence => {
  return {
    id: row.id,
    userId: row.user_id,
    subjectId: row.subject_id,
    createdAt: row.created_at,
  };
};

const isNotFoundError = (code: string | undefined): boolean => {
  return code === "PGRST116";
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

export const addAbsence: RequestHandler<{ subjectId: string }> = async (
  request,
  response,
  next,
) => {
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

    const { data: subjectExists, error: subjectError } = await supabase
      .from("subjects")
      .select("id")
      .eq("id", subjectId)
      .eq("user_id", authContext.userId)
      .single<{ id: string }>();

    if (subjectError && isNotFoundError(subjectError.code)) {
      response.status(404).json({ message: "Subject not found" });
      return;
    }

    if (subjectError || !subjectExists) {
      response.status(400).json({ message: "Failed to validate subject" });
      return;
    }

    const { data, error } = await supabase
      .from("absences")
      .insert({
        user_id: authContext.userId,
        subject_id: subjectId,
      })
      .select("id, user_id, subject_id, created_at")
      .single<AbsenceRow>();

    if (error || !data) {
      response.status(400).json({ message: "Failed to add absence" });
      return;
    }

    response.status(201).json(mapAbsenceRow(data));
  } catch (error) {
    next(error);
  }
};

export const getTotalAbsences: RequestHandler<{ subjectId: string }> = async (
  request,
  response,
  next,
) => {
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
