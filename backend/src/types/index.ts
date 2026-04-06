import type { Request } from "express";
import type { User } from "@supabase/supabase-js";

export interface Subject {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

export interface Grade {
  id: string;
  userId: string;
  subjectId: string;
  value: number;
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
}

export interface AddGradeBody {
  value: number;
}

export type AuthenticatedRequest<
  TParams = Record<string, string>,
  TBody = unknown,
> = Request<TParams, unknown, TBody> & {
  user: User;
  accessToken: string;
};
