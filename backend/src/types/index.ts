import type { Request } from "express";
import type { User } from "@supabase/supabase-js";

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  tagType?: "subject" | "absence";
  createdAt: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  totalClasses: number;
  passingGrade: number;
  tagId?: string;
  tag?: Tag;
  createdAt: string;
}

export interface Grade {
  id: string;
  userId: string;
  subjectId: string;
  value: number;
  weight: number;
  title?: string;
  createdAt: string;
}

export interface Absence {
  id: string;
  userId: string;
  subjectId: string;
  absenceDate: string;
  tagId?: string;
  tag?: Tag;
  createdAt: string;
}

export interface CreateSubjectBody {
  name: string;
  totalClasses: number;
  passingGrade: number;
  tagId?: string;
}

export interface UpdateSubjectBody {
  name?: string;
  totalClasses?: number;
  passingGrade?: number;
  tagId?: string;
}

export interface AddGradeBody {
  value: number;
  weight?: number;
  title?: string;
}

export interface UpdateGradeBody {
  value?: number;
  weight?: number;
  title?: string;
}

export interface AddAbsenceBody {
  absenceDate?: string;
  tagId?: string;
}

export interface UpdateAbsenceBody {
  absenceDate: string;
  tagId?: string;
}

export interface CreateTagBody {
  name: string;
  color?: string;
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
