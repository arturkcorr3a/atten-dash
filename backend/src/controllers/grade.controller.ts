import type { NextFunction, Request, Response } from "express";

import { createAuthenticatedSupabaseClient } from "../config/supabase";
import type {
  AddGradeBody,
  AuthenticatedRequest,
  Grade,
  UpdateGradeBody,
} from "../types";

type AsyncRequestHandler<TParams = Record<string, string>, TBody = unknown> = (
  request: Request<TParams, unknown, TBody>,
  response: Response,
  next: NextFunction,
) => Promise<void>;

interface GradeRow {
  id: string;
  user_id: string;
  subject_id: string;
  value?: number;
  weight?: number;
  title?: string;
  created_at: string;
}

const DEFAULT_ASSESSMENT_NAME = "Assessment";

const mapGradeRow = (
  row: GradeRow,
  fallback: { value: number; weight: number },
): Grade => {
  return {
    id: row.id,
    userId: row.user_id,
    subjectId: row.subject_id,
    value: typeof row.value === "number" ? row.value : fallback.value,
    weight: typeof row.weight === "number" ? row.weight : fallback.weight,
    ...(row.title && { title: row.title }),
    createdAt: row.created_at,
  };
};

const isNotFoundError = (code: string | undefined): boolean => {
  return code === "PGRST116";
};

const isPermissionError = (code: string | undefined): boolean => {
  return code === "42501";
};

const getMissingNotNullColumnName = (
  message: string | undefined,
): string | null => {
  if (!message) {
    return null;
  }

  const matched = /null value in column "([^"]+)"/.exec(message);

  return matched?.[1] ?? null;
};

const getCurrentIsoDate = (): string => {
  return new Date().toISOString().slice(0, 10);
};

const getLegacyRequiredGradeFieldValue = (
  columnName: string,
): string | null => {
  if (columnName === "assessment_name") {
    return "Assessment";
  }

  return null;
};

const getMissingSchemaColumnName = (
  message: string | undefined,
): string | null => {
  if (!message) {
    return null;
  }

  const matched = /Could not find the '([^']+)' column/.exec(message);

  return matched?.[1] ?? null;
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

export const addGrade: AsyncRequestHandler<
  { subjectId: string },
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
    const { value, weight, title } = authenticatedRequest.body;

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

    if (value < 0 || value > 100) {
      response
        .status(400)
        .json({ message: "Grade value must be between 0 and 100" });
      return;
    }

    const normalizedWeight = weight ?? 1;

    if (!isValidNumber(normalizedWeight) || normalizedWeight <= 0) {
      response.status(400).json({
        message: "Grade weight must be a valid number greater than 0",
      });
      return;
    }

    if (normalizedWeight > 100) {
      response.status(400).json({
        message: "Grade weight must be less than or equal to 100",
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
      console.error("[GRADE] Failed to validate subject", {
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

    const baseInsertPayload: Record<string, string | number> = {
      user_id: authContext.userId,
      subject_id: subjectId,
      grade_value: value,
      weight: normalizedWeight,
      assessment_name: DEFAULT_ASSESSMENT_NAME,
      ...(title && { title }),
    };

    const { data: firstInsertData, error: firstInsertError } = await supabase
      .from("grades")
      .insert(baseInsertPayload)
      .select(
        "id, user_id, subject_id, value:grade_value, weight, title, created_at",
      )
      .single<GradeRow>();

    const missingSchemaColumnName = getMissingSchemaColumnName(
      firstInsertError?.message,
    );
    const shouldRetryWithLegacyValueColumn =
      (firstInsertError?.code === "PGRST204" ||
        firstInsertError?.code === "42703") &&
      missingSchemaColumnName === "grade_value";

    const { data, error } = shouldRetryWithLegacyValueColumn
      ? await supabase
          .from("grades")
          .insert({
            user_id: authContext.userId,
            subject_id: subjectId,
            value,
            weight: normalizedWeight,
            ...(title && { title }),
          })
          .select("id, user_id, subject_id, value, weight, title, created_at")
          .single<GradeRow>()
      : { data: firstInsertData, error: firstInsertError };

    if (error || !data) {
      if (error) {
        console.error("[GRADE] Failed to insert grade", {
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

      response.status(400).json({ message: "Failed to add grade" });
      return;
    }

    response
      .status(201)
      .json(mapGradeRow(data, { value, weight: normalizedWeight }));
  } catch (error) {
    next(error);
  }
};

export const updateGrade: AsyncRequestHandler<
  { gradeId: string },
  UpdateGradeBody
> = async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest<
      { gradeId: string },
      UpdateGradeBody
    >;
    const authContext = getAuthContext(authenticatedRequest);

    if (!authContext) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { gradeId } = authenticatedRequest.params;

    if (!gradeId) {
      response.status(400).json({ message: "gradeId is required" });
      return;
    }

    const { value, weight, title } = authenticatedRequest.body;

    const updatePayload: {
      value?: number;
      weight?: number;
      grade_value?: number;
      title?: string;
    } = {};

    if (value !== undefined) {
      if (!isValidNumber(value)) {
        response
          .status(400)
          .json({ message: "Grade value must be a valid number" });
        return;
      }

      if (value < 0 || value > 100) {
        response
          .status(400)
          .json({ message: "Grade value must be between 0 and 100" });
        return;
      }

      updatePayload.value = value;
    }

    if (weight !== undefined) {
      if (!isValidNumber(weight) || weight <= 0) {
        response.status(400).json({
          message: "Grade weight must be a valid number greater than 0",
        });
        return;
      }

      if (weight > 100) {
        response.status(400).json({
          message: "Grade weight must be less than or equal to 100",
        });
        return;
      }

      updatePayload.weight = weight;
    }

    if (title !== undefined) {
      updatePayload.title = title;
    }

    if (Object.keys(updatePayload).length === 0) {
      response
        .status(400)
        .json({ message: "No valid fields provided for update" });
      return;
    }

    const supabase = createAuthenticatedSupabaseClient(authContext.accessToken);

    const updateData: Record<string, unknown> = {};

    if (updatePayload.value !== undefined) {
      updateData.grade_value = updatePayload.value;
    }

    if (updatePayload.weight !== undefined) {
      updateData.weight = updatePayload.weight;
    }

    if (updatePayload.title !== undefined) {
      updateData.title = updatePayload.title;
    }

    const { data, error } = await supabase
      .from("grades")
      .update(updateData)
      .eq("id", gradeId)
      .eq("user_id", authContext.userId)
      .select(
        "id, user_id, subject_id, value:grade_value, weight, title, created_at",
      )
      .single<GradeRow>();

    if (error && isNotFoundError(error.code)) {
      response.status(404).json({ message: "Grade not found" });
      return;
    }

    if (error || !data) {
      response.status(400).json({ message: "Failed to update grade" });
      return;
    }

    response.status(200).json(
      mapGradeRow(data, {
        value: data.value ?? 0,
        weight: data.weight ?? 1,
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const deleteGrade: AsyncRequestHandler<{ gradeId: string }> = async (
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
