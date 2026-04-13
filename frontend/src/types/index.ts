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
  absenceDate: string;
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
}

export interface UpdateSubjectPayload {
  name?: string;
  totalClasses?: number;
  passingGrade?: number;
}

export interface AddGradePayload {
  value: number;
  weight?: number;
}

export interface UpdateGradePayload {
  value?: number;
  weight?: number;
}

export interface UpdateAbsencePayload {
  absenceDate: string;
}
