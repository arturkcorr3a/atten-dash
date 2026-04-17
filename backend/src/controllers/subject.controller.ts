import type { NextFunction, Request, Response } from "express";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createAuthenticatedSupabaseClient } from "../config/supabase";
import type {
  Absence,
  AuthenticatedRequest,
  CreateSubjectBody,
  Grade,
  Subject,
  SubjectWithDetails,
  UpdateSubjectBody,
} from "../types";

type AsyncRequestHandler<TParams = Record<string, string>, TBody = unknown> = (
  request: Request<TParams, unknown, TBody>,
  response: Response,
  next: NextFunction,
) => Promise<void>;

const DEFAULT_TOTAL_CLASSES = 60;
const DEFAULT_PASSING_GRADE = 7;
const DEFAULT_GRADE_WEIGHT = 1;

interface SubjectRow {
  id: string;
  user_id: string;
  name: string;
  total_classes?: number | null;
  passing_grade?: number | null;
  tag_id?: string | null;
  tags?:
    | {
        id: string;
        user_id: string;
        name: string;
        color: string;
        created_at: string;
      }[]
    | null;
  created_at: string;
}

interface GradeRow {
  id: string;
  user_id: string;
  subject_id: string;
  value: number;
  weight?: number | null;
  title?: string | null;
  created_at: string;
}

interface AbsenceRow {
  id: string;
  user_id: string;
  subject_id: string;
  absence_date: string;
  tag_id?: string | null;
  tags?:
    | {
        id: string;
        user_id: string;
        name: string;
        color: string;
        created_at: string;
      }[]
    | null;
  created_at: string;
}

interface SubjectWithRelationsRow extends SubjectRow {
  grades?: GradeRow[] | null;
  absences?: AbsenceRow[] | null;
}

const mapSubjectRow = (row: SubjectRow): Subject => {
  const totalClasses =
    typeof row.total_classes === "number"
      ? row.total_classes
      : DEFAULT_TOTAL_CLASSES;
  const passingGrade =
    typeof row.passing_grade === "number"
      ? row.passing_grade
      : DEFAULT_PASSING_GRADE;

  // Handle tags as either object (one-to-one from Supabase) or array (one-to-many)
  let tagObject = null;
  if (row.tags) {
    if (Array.isArray(row.tags) && row.tags.length > 0) {
      tagObject = row.tags[0];
    } else if (!Array.isArray(row.tags) && typeof row.tags === "object") {
      tagObject = row.tags;
    }
  }

  if (row.tag_id || tagObject) {
    console.log(`[SUBJECTS] mapSubjectRow for ${row.id}:`, {
      tag_id: row.tag_id,
      tagsType: Array.isArray(row.tags) ? "array" : typeof row.tags,
      tagObject: tagObject
        ? { id: tagObject.id, name: tagObject.name, color: tagObject.color }
        : null,
    });
  }

  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    totalClasses,
    passingGrade,
    ...(row.tag_id && { tagId: row.tag_id }),
    ...(tagObject && {
      tag: {
        id: tagObject.id,
        userId: tagObject.user_id,
        name: tagObject.name,
        color: tagObject.color,
        createdAt: tagObject.created_at,
      },
    }),
    createdAt: row.created_at,
  };
};

const mapGradeRow = (row: GradeRow): Grade => {
  const weight =
    typeof row.weight === "number" ? row.weight : DEFAULT_GRADE_WEIGHT;

  return {
    id: row.id,
    userId: row.user_id,
    subjectId: row.subject_id,
    value: row.value,
    weight,
    ...(row.title && { title: row.title }),
    createdAt: row.created_at,
  };
};

const mapAbsenceRow = (row: AbsenceRow): Absence => {
  // Handle tags as either object (one-to-one from Supabase) or array (one-to-many)
  let tagObject = null;
  if (row.tags) {
    if (Array.isArray(row.tags) && row.tags.length > 0) {
      tagObject = row.tags[0];
    } else if (!Array.isArray(row.tags) && typeof row.tags === "object") {
      tagObject = row.tags;
    }
  }

  return {
    id: row.id,
    userId: row.user_id,
    subjectId: row.subject_id,
    absenceDate: row.absence_date,
    ...(row.tag_id && { tagId: row.tag_id }),
    ...(tagObject && {
      tag: {
        id: tagObject.id,
        userId: tagObject.user_id,
        name: tagObject.name,
        color: tagObject.color,
        createdAt: tagObject.created_at,
      },
    }),
    createdAt: row.created_at,
  };
};

const calculateAverageGrade = (grades: Grade[]): number => {
  if (grades.length === 0) {
    return 0;
  }

  const weightedSum = grades.reduce((accumulator, grade) => {
    return accumulator + grade.value * grade.weight;
  }, 0);

  const totalWeight = grades.reduce((accumulator, grade) => {
    return accumulator + grade.weight;
  }, 0);

  if (totalWeight <= 0) {
    return 0;
  }

  return weightedSum / totalWeight;
};

const mapSubjectWithRelationsRow = (
  row: SubjectWithRelationsRow,
): SubjectWithDetails => {
  const mappedSubject = mapSubjectRow(row);

  if (row.tags && row.tags.length > 0) {
    console.log(`[SUBJECTS] Tags found for subject ${row.id}:`, row.tags);
  } else if (row.tag_id) {
    console.log(
      `[SUBJECTS] WARNING: tag_id set (${row.tag_id}) but tags array empty for subject ${row.id}`,
    );
  }

  const grades = (row.grades ?? []).map(mapGradeRow);
  const absences = (row.absences ?? []).map(mapAbsenceRow);

  return {
    ...mappedSubject,
    grades,
    absences,
    totalAbsences: absences.length,
    averageGrade: calculateAverageGrade(grades),
  };
};

const isNotFoundError = (code: string | undefined): boolean => {
  return code === "PGRST116";
};

const isValidNumber = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value);
};

export const getAuthContext = <TParams, TBody>(
  request: AuthenticatedRequest<TParams, TBody>,
): { accessToken: string; userId: string } | null => {
  const { accessToken, user } = request;

  if (!accessToken || !user?.id) {
    return null;
  }

  return { accessToken, userId: user.id };
};

const toSubjectRowsWithDefaults = (
  rows: Array<Omit<SubjectRow, "total_classes" | "passing_grade">>,
): SubjectRow[] => {
  return rows.map((row) => ({
    ...row,
    total_classes: DEFAULT_TOTAL_CLASSES,
    passing_grade: DEFAULT_PASSING_GRADE,
  }));
};

const toGradeRowsWithDefaults = (
  rows: Array<Omit<GradeRow, "weight">>,
): GradeRow[] => {
  return rows.map((row) => ({
    ...row,
    weight: DEFAULT_GRADE_WEIGHT,
  }));
};

const fetchSubjectRowsWithFallback = async (
  supabase: SupabaseClient,
  userId: string,
): Promise<SubjectRow[] | null> => {
  const { data, error } = await supabase
    .from("subjects")
    .select(
      "id, user_id, name, total_classes, passing_grade, tag_id, created_at, tags(id, user_id, name, color, created_at)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!error) {
    return (data ?? []) as SubjectRow[];
  }

  const { data: legacyData, error: legacyError } = await supabase
    .from("subjects")
    .select("id, user_id, name, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (legacyError) {
    return null;
  }

  return toSubjectRowsWithDefaults(
    (legacyData ?? []) as Array<
      Omit<SubjectRow, "total_classes" | "passing_grade">
    >,
  );
};

const fetchGradeRowsWithFallback = async (
  supabase: SupabaseClient,
  userId: string,
  subjectIds: string[],
): Promise<GradeRow[]> => {
  const { data, error } = await supabase
    .from("grades")
    .select("id, user_id, subject_id, value:grade_value, weight, created_at")
    .eq("user_id", userId)
    .in("subject_id", subjectIds);

  if (!error) {
    return (data ?? []) as GradeRow[];
  }

  const { data: legacyData, error: legacyError } = await supabase
    .from("grades")
    .select("id, user_id, subject_id, value, created_at")
    .eq("user_id", userId)
    .in("subject_id", subjectIds);

  if (legacyError) {
    return [];
  }

  return toGradeRowsWithDefaults(
    (legacyData ?? []) as Array<Omit<GradeRow, "weight">>,
  );
};

export const createSubject: AsyncRequestHandler<
  Record<string, string>,
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
    const { totalClasses, passingGrade, tagId } = authenticatedRequest.body;

    if (!name) {
      response.status(400).json({ message: "Subject name is required" });
      return;
    }

    if (!isValidNumber(totalClasses) || totalClasses <= 0) {
      response.status(400).json({
        message: "totalClasses must be a valid number greater than 0",
      });
      return;
    }

    if (!isValidNumber(passingGrade) || passingGrade < 0) {
      response
        .status(400)
        .json({ message: "passingGrade must be a valid non-negative number" });
      return;
    }

    const supabase = createAuthenticatedSupabaseClient(authContext.accessToken);

    const { data, error } = await supabase
      .from("subjects")
      .insert({
        user_id: authContext.userId,
        name,
        total_classes: totalClasses,
        passing_grade: passingGrade,
        ...(tagId && { tag_id: tagId }),
      })
      .select(
        "id, user_id, name, total_classes, passing_grade, tag_id, created_at, tags(id, user_id, name, color, created_at)",
      )
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

export const getSubjects: AsyncRequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest;
    const authContext = getAuthContext(authenticatedRequest);

    if (!authContext) {
      console.log("[SUBJECTS] No auth context found");
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    console.log(
      "[SUBJECTS] getSubjects called for userId:",
      authContext.userId,
    );

    const supabase = createAuthenticatedSupabaseClient(authContext.accessToken);

    console.log("[SUBJECTS] Querying with nested relations");

    const { data, error } = await supabase
      .from("subjects")
      .select(
        "id, user_id, name, total_classes, passing_grade, tag_id, created_at, tags(id, user_id, name, color, created_at), grades(id, user_id, subject_id, value:grade_value, weight, title, created_at), absences(id, user_id, subject_id, absence_date, tag_id, created_at, tags(id, user_id, name, color, created_at))",
      )
      .eq("user_id", authContext.userId)
      .order("created_at", { ascending: false });

    console.log("[SUBJECTS] Query response", {
      hasError: !!error,
      dataCount: (data ?? []).length,
      errorCode: error?.code,
      errorMessage: error?.message,
    });

    if (!error) {
      console.log("[SUBJECTS] Primary query succeeded, processing data");
      const subjects = (data ?? []).map((row) => {
        console.log(`[SUBJECTS] Processing subject ${row.id}:`, {
          tag_id: row.tag_id,
          tags: row.tags,
          hasTags: !!row.tags && row.tags.length > 0,
        });
        return mapSubjectWithRelationsRow(row as SubjectWithRelationsRow);
      });

      console.log("[SUBJECTS] Returning subjects with nested data", {
        count: subjects.length,
        sample: subjects.length > 0 ? subjects[0] : null,
      });

      response.status(200).json(subjects);
      return;
    }

    console.log("[SUBJECTS] Query failed, attempting fallback");

    const normalizedSubjectRows = await fetchSubjectRowsWithFallback(
      supabase,
      authContext.userId,
    );

    if (!normalizedSubjectRows) {
      console.log("[SUBJECTS] Fallback also failed, returning empty array");
      response.status(200).json([]);
      return;
    }

    const subjectIds = normalizedSubjectRows.map((subject) => subject.id);

    if (subjectIds.length === 0) {
      response.status(200).json([]);
      return;
    }

    const normalizedGradeRows = await fetchGradeRowsWithFallback(
      supabase,
      authContext.userId,
      subjectIds,
    );

    const { data: absenceRows, error: absenceError } = await supabase
      .from("absences")
      .select(
        "id, user_id, subject_id, absence_date, tag_id, created_at, tags(id, user_id, name, color, created_at)",
      )
      .eq("user_id", authContext.userId)
      .in("subject_id", subjectIds);

    const safeAbsenceRows = absenceError ? [] : (absenceRows ?? []);

    const gradesBySubjectId = normalizedGradeRows.reduce<
      Record<string, Grade[]>
    >((accumulator, row) => {
      const mappedGrade = mapGradeRow(row);
      const currentGrades = accumulator[mappedGrade.subjectId] ?? [];

      accumulator[mappedGrade.subjectId] = [...currentGrades, mappedGrade];

      return accumulator;
    }, {});

    const absencesBySubjectId = safeAbsenceRows.reduce<
      Record<string, Absence[]>
    >((accumulator, row) => {
      const mappedAbsence = mapAbsenceRow(row as AbsenceRow);
      const currentAbsences = accumulator[mappedAbsence.subjectId] ?? [];

      accumulator[mappedAbsence.subjectId] = [
        ...currentAbsences,
        mappedAbsence,
      ];

      return accumulator;
    }, {});

    const subjects = normalizedSubjectRows.map((subjectRow) => {
      console.log(`[SUBJECTS] Fallback: Processing subject ${subjectRow.id}:`, {
        tag_id: subjectRow.tag_id,
        tags: subjectRow.tags,
        hasTags: !!subjectRow.tags && subjectRow.tags.length > 0,
      });

      const subject = mapSubjectRow(subjectRow);
      const grades = gradesBySubjectId[subject.id] ?? [];
      const absences = absencesBySubjectId[subject.id] ?? [];

      return {
        ...subject,
        grades,
        absences,
        totalAbsences: absences.length,
        averageGrade: calculateAverageGrade(grades),
      };
    });

    console.log("[SUBJECTS] Returning subjects from fallback", {
      count: subjects.length,
    });

    response.status(200).json(subjects);
  } catch (error) {
    console.error("[SUBJECTS] Unexpected error", {
      error: error instanceof Error ? error.message : String(error),
    });
    next(error);
  }
};

export const getSubjectById: AsyncRequestHandler<{
  subjectId: string;
}> = async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest<{
      subjectId: string;
    }>;
    const authContext = getAuthContext(authenticatedRequest);

    if (!authContext) {
      console.log("[SUBJECT] No auth context found");
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const subjectId = authenticatedRequest.params.subjectId;

    console.log("[SUBJECT] getSubjectById called", {
      subjectId,
      userId: authContext.userId,
    });

    if (!subjectId) {
      console.log("[SUBJECT] subjectId is missing");
      response.status(400).json({ message: "subjectId is required" });
      return;
    }

    const supabase = createAuthenticatedSupabaseClient(authContext.accessToken);

    console.log(
      "[SUBJECT] Querying Supabase for subject with nested relations",
    );

    // First, try to fetch without nested relations to check if the subject exists and is accessible
    const { data: subjectOnlyData, error: subjectOnlyError } = await supabase
      .from("subjects")
      .select(
        "id, user_id, name, total_classes, passing_grade, tag_id, created_at",
      )
      .eq("id", subjectId)
      .single();

    console.log("[SUBJECT] Subject-only query response", {
      hasError: !!subjectOnlyError,
      hasData: !!subjectOnlyData,
      errorCode: subjectOnlyError?.code,
      errorMessage: subjectOnlyError?.message,
      dataId: subjectOnlyData?.id,
    });

    if (subjectOnlyError || !subjectOnlyData) {
      console.error("[SUBJECT] Subject not found or not accessible", {
        subjectId,
        userId: authContext.userId,
        code: subjectOnlyError?.code,
        message: subjectOnlyError?.message,
        details: subjectOnlyError?.details,
      });

      response.status(404).json({ message: "Subject not found" });
      return;
    }

    // Now fetch the full data with nested relations
    const { data, error } = await supabase
      .from("subjects")
      .select(
        `id, user_id, name, total_classes, passing_grade, tag_id, created_at,
         tags(id, user_id, name, color, created_at),
         grades(id, user_id, subject_id, value:grade_value, weight, title, created_at),
         absences(id, user_id, subject_id, absence_date, tag_id, created_at, tags(id, user_id, name, color, created_at))`,
      )
      .eq("id", subjectId)
      .eq("user_id", authContext.userId)
      .single<SubjectWithRelationsRow>();

    console.log("[SUBJECT] Supabase response with nested relations", {
      hasError: !!error,
      hasData: !!data,
      errorCode: error?.code,
      errorMessage: error?.message,
      dataId: data?.id,
      gradesCount: (data?.grades ?? []).length,
      absencesCount: (data?.absences ?? []).length,
    });

    if (error || !data) {
      console.error("[SUBJECT] Failed to fetch subject with nested relations", {
        subjectId,
        userId: authContext.userId,
        code: error?.code,
        message: error?.message,
        details: error?.details,
      });

      response.status(400).json({ message: "Failed to fetch subject" });
      return;
    }

    const subjectWithDetails = mapSubjectWithRelationsRow(data);

    console.log("[SUBJECT] Mapped subject with details", {
      id: subjectWithDetails.id,
      name: subjectWithDetails.name,
      gradesCount: subjectWithDetails.grades.length,
      absencesCount: subjectWithDetails.absences.length,
      averageGrade: subjectWithDetails.averageGrade,
    });

    // Sort absences by absence_date in descending order (most recent first)
    subjectWithDetails.absences.sort(
      (a, b) =>
        new Date(b.absenceDate).getTime() - new Date(a.absenceDate).getTime(),
    );

    response.status(200).json(subjectWithDetails);
  } catch (error) {
    console.error("[SUBJECT] Unexpected error in getSubjectById", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    next(error);
  }
};

export const updateSubject: AsyncRequestHandler<
  { subjectId: string },
  UpdateSubjectBody
> = async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest<
      { subjectId: string },
      UpdateSubjectBody
    >;
    const authContext = getAuthContext(authenticatedRequest);

    if (!authContext) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { subjectId } = authenticatedRequest.params;

    if (!subjectId) {
      response.status(400).json({ message: "subjectId is required" });
      return;
    }

    const { name, totalClasses, passingGrade, tagId } =
      authenticatedRequest.body;

    const updatePayload: {
      name?: string;
      total_classes?: number;
      passing_grade?: number;
      tag_id?: string | null;
    } = {};

    if (typeof name === "string") {
      const trimmedName = name.trim();

      if (!trimmedName) {
        response.status(400).json({ message: "Subject name cannot be empty" });
        return;
      }

      updatePayload.name = trimmedName;
    }

    if (totalClasses !== undefined) {
      if (!isValidNumber(totalClasses) || totalClasses <= 0) {
        response.status(400).json({
          message: "totalClasses must be a valid number greater than 0",
        });
        return;
      }

      updatePayload.total_classes = totalClasses;
    }

    if (passingGrade !== undefined) {
      if (!isValidNumber(passingGrade) || passingGrade < 0) {
        response.status(400).json({
          message: "passingGrade must be a valid non-negative number",
        });
        return;
      }

      updatePayload.passing_grade = passingGrade;
    }

    if (tagId !== undefined) {
      updatePayload.tag_id = tagId || null;
    }

    if (Object.keys(updatePayload).length === 0) {
      response
        .status(400)
        .json({ message: "No valid fields provided for update" });
      return;
    }

    const supabase = createAuthenticatedSupabaseClient(authContext.accessToken);

    const { data, error } = await supabase
      .from("subjects")
      .update(updatePayload)
      .eq("id", subjectId)
      .eq("user_id", authContext.userId)
      .select(
        "id, user_id, name, total_classes, passing_grade, tag_id, created_at, tags(id, user_id, name, color, created_at)",
      )
      .single<SubjectRow>();

    if (error && isNotFoundError(error.code)) {
      response.status(404).json({ message: "Subject not found" });
      return;
    }

    if (error || !data) {
      response.status(400).json({ message: "Failed to update subject" });
      return;
    }

    response.status(200).json(mapSubjectRow(data));
  } catch (error) {
    next(error);
  }
};

export const deleteSubject: AsyncRequestHandler<{ subjectId: string }> = async (
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
