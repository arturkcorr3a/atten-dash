import type { Request } from "express";
import type { User } from "@supabase/supabase-js";

export interface Subject {
  id: string;
  userId: string;
  name: string;
  totalClasses: number;
  passingGrade: number;
  createdAt: string;
}

export interface Grade {
  id: string;
  userId: string;
  subjectId: string;
  value: number;
  weight: number;
  createdAt: string;
}

export interface Absence {
  id: string;
  userId: string;
  subjectId: string;
  createdAt: string;
}

export interface CreateSubjectBody {
  name: string;
  totalClasses: number;
  passingGrade: number;
}

export interface UpdateSubjectBody {
  name?: string;
  totalClasses?: number;
  passingGrade?: number;
}

export interface AddGradeBody {
  value: number;
  weight?: number;
}

export interface UpdateGradeBody {
  value?: number;
  weight?: number;
}

export interface SubjectWithDetails extends Subject {
  grades: Grade[];
  absences: Absence[];
  totalAbsences: number;
  averageGrade: number;
}

export type AuthenticatedRequest<
  TParams = Record<string, string>,
  TBody = unknown,
> = Request<TParams, unknown, TBody> & {
  user: User;
  accessToken: string;
};
