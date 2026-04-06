import type { RequestHandler } from "express";

import { createAuthenticatedSupabaseClient } from "../config/supabase";
import type { AddGradeBody, AuthenticatedRequest, Grade } from "../types";

interface GradeRow {
  id: string;
  user_id: string;
  subject_id: string;
  value: number;
  created_at: string;
}

const mapGradeRow = (row: GradeRow): Grade => {
  return {
    id: row.id,
    userId: row.user_id,
    subjectId: row.subject_id,
    value: row.value,
    createdAt: row.created_at,
  };
};

const isNotFoundError = (code: string | undefined): boolean => {
  return code === "PGRST116";
};

const isValidNumber = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value);
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

export const addGrade: RequestHandler<
  { subjectId: string },
  unknown,
  AddGradeBody
> = async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest<
      { subjectId: string },
      AddGradeBody
    >;
    const authContext = getAuthContext(authenticatedRequest);

    if (!authContext) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const subjectId = authenticatedRequest.params.subjectId;
    const { value } = authenticatedRequest.body;

    if (!subjectId) {
      response.status(400).json({ message: "subjectId is required" });
      return;
    }

    if (!isValidNumber(value)) {
      response
        .status(400)
        .json({ message: "Grade value must be a valid number" });
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
      .from("grades")
      .insert({
        user_id: authContext.userId,
        subject_id: subjectId,
        value,
      })
      .select("id, user_id, subject_id, value, created_at")
      .single<GradeRow>();

    if (error || !data) {
      response.status(400).json({ message: "Failed to add grade" });
      return;
    }

    response.status(201).json(mapGradeRow(data));
  } catch (error) {
    next(error);
  }
};

export const deleteGrade: RequestHandler<{ gradeId: string }> = async (
  request,
  response,
  next,
) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest<{
      gradeId: string;
    }>;
    const authContext = getAuthContext(authenticatedRequest);

    if (!authContext) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const gradeId = authenticatedRequest.params.gradeId;

    if (!gradeId) {
      response.status(400).json({ message: "gradeId is required" });
      return;
    }

    const supabase = createAuthenticatedSupabaseClient(authContext.accessToken);

    const { data, error } = await supabase
      .from("grades")
      .delete()
      .eq("id", gradeId)
      .eq("user_id", authContext.userId)
      .select("id")
      .single<{ id: string }>();

    if (error && isNotFoundError(error.code)) {
      response.status(404).json({ message: "Grade not found" });
      return;
    }

    if (error || !data) {
      response.status(400).json({ message: "Failed to delete grade" });
      return;
    }

    response.status(200).json({ message: "Grade deleted" });
  } catch (error) {
    next(error);
  }
};
