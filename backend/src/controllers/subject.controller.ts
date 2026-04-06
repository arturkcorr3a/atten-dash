import type { RequestHandler } from "express";

import { createAuthenticatedSupabaseClient } from "../config/supabase";
import type {
  AuthenticatedRequest,
  CreateSubjectBody,
  Subject,
} from "../types";

interface SubjectRow {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

const mapSubjectRow = (row: SubjectRow): Subject => {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
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

export const createSubject: RequestHandler<
  Record<string, string>,
  unknown,
  CreateSubjectBody
> = async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest<
      Record<string, string>,
      CreateSubjectBody
    >;
    const authContext = getAuthContext(authenticatedRequest);

    if (!authContext) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const name = authenticatedRequest.body.name?.trim();

    if (!name) {
      response.status(400).json({ message: "Subject name is required" });
      return;
    }

    const supabase = createAuthenticatedSupabaseClient(authContext.accessToken);

    const { data, error } = await supabase
      .from("subjects")
      .insert({
        user_id: authContext.userId,
        name,
      })
      .select("id, user_id, name, created_at")
      .single<SubjectRow>();

    if (error || !data) {
      response.status(400).json({ message: "Failed to create subject" });
      return;
    }

    response.status(201).json(mapSubjectRow(data));
  } catch (error) {
    next(error);
  }
};

export const getSubjects: RequestHandler = async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest;
    const authContext = getAuthContext(authenticatedRequest);

    if (!authContext) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const supabase = createAuthenticatedSupabaseClient(authContext.accessToken);

    const { data, error } = await supabase
      .from("subjects")
      .select("id, user_id, name, created_at")
      .eq("user_id", authContext.userId)
      .order("created_at", { ascending: false });

    if (error) {
      response.status(400).json({ message: "Failed to fetch subjects" });
      return;
    }

    const subjects = (data ?? []).map((row) =>
      mapSubjectRow(row as SubjectRow),
    );

    response.status(200).json(subjects);
  } catch (error) {
    next(error);
  }
};

export const getSubjectById: RequestHandler<{ subjectId: string }> = async (
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

    const { data, error } = await supabase
      .from("subjects")
      .select("id, user_id, name, created_at")
      .eq("id", subjectId)
      .eq("user_id", authContext.userId)
      .single<SubjectRow>();

    if (error && isNotFoundError(error.code)) {
      response.status(404).json({ message: "Subject not found" });
      return;
    }

    if (error || !data) {
      response.status(400).json({ message: "Failed to fetch subject" });
      return;
    }

    response.status(200).json(mapSubjectRow(data));
  } catch (error) {
    next(error);
  }
};

export const deleteSubject: RequestHandler<{ subjectId: string }> = async (
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

    const { data, error } = await supabase
      .from("subjects")
      .delete()
      .eq("id", subjectId)
      .eq("user_id", authContext.userId)
      .select("id")
      .single<{ id: string }>();

    if (error && isNotFoundError(error.code)) {
      response.status(404).json({ message: "Subject not found" });
      return;
    }

    if (error || !data) {
      response.status(400).json({ message: "Failed to delete subject" });
      return;
    }

    response.status(200).json({ message: "Subject deleted" });
  } catch (error) {
    next(error);
  }
};
