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

export interface SubjectWithDetails extends Subject {
  grades: Grade[];
  absences: Absence[];
  totalAbsences: number;
  averageGrade: number;
}

export interface SubjectCardData {
  subject: SubjectWithDetails;
  currentAverage: number;
  passingGrade: number;
  totalAbsences: number;
  totalClasses: number;
}

export interface CreateSubjectPayload {
  name: string;
  totalClasses: number;
  passingGrade: number;
  tagId?: string;
}

export interface UpdateSubjectPayload {
  name?: string;
  totalClasses?: number;
  passingGrade?: number;
  tagId?: string;
}

export interface AddGradePayload {
  value: number;
  weight?: number;
  title?: string;
}

export interface UpdateGradePayload {
  value?: number;
  weight?: number;
  title?: string;
}

export interface AddAbsencePayload {
  absenceDate: string;
  tagId?: string;
}

export interface UpdateAbsencePayload {
  absenceDate: string;
  tagId?: string;
}

export interface CreateTagPayload {
  name: string;
  color?: string;
}
