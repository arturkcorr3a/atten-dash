import type { SubjectCardData } from "../types";

interface SubjectCardProps {
  data: SubjectCardData;
  onLogGrade: (subjectId: string) => void;
  onLogAbsence: (subjectId: string) => void;
  onEditSubject: (subjectId: string) => void;
  onDeleteSubject: (subjectId: string) => void;
  isDeleting: boolean;
}

const CLOSE_TO_LIMIT_THRESHOLD = 0.8;

const getAbsenceLimit = (totalClasses: number): number => {
  return Math.floor(totalClasses * 0.25);
};

const getAbsenceBadgeClassName = (
  totalAbsences: number,
  allowedAbsences: number,
): string => {
  if (allowedAbsences <= 0) {
    return totalAbsences > 0
      ? "bg-red-100 text-red-700"
      : "bg-green-100 text-green-700";
  }

  if (totalAbsences > allowedAbsences) {
    return "bg-red-100 text-red-700";
  }

  const closeToLimitCount = Math.max(
    1,
    Math.floor(allowedAbsences * CLOSE_TO_LIMIT_THRESHOLD),
  );

  if (totalAbsences >= closeToLimitCount) {
    return "bg-yellow-100 text-yellow-700";
  }

  return "bg-green-100 text-green-700";
};

const getGradeClassName = (
  currentAverage: number,
  passingGrade: number,
): string => {
  return currentAverage >= passingGrade ? "text-green-600" : "text-red-600";
};

const formatGrade = (value: number): string => {
  return value.toFixed(2);
};

export function SubjectCard({
  data,
  onLogGrade,
  onLogAbsence,
  onEditSubject,
  onDeleteSubject,
  isDeleting,
}: Readonly<SubjectCardProps>) {
  const { subject, currentAverage, passingGrade, totalAbsences, totalClasses } =
    data;

  const allowedAbsences = getAbsenceLimit(totalClasses);
  const gradeClassName = getGradeClassName(currentAverage, passingGrade);
  const absenceClassName = getAbsenceBadgeClassName(
    totalAbsences,
    allowedAbsences,
  );

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">{subject.name}</h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={`Edit ${subject.name}`}
            onClick={() => {
              onEditSubject(subject.id);
            }}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"
          >
            ✏️
          </button>

          <button
            type="button"
            aria-label={`Delete ${subject.name}`}
            onClick={() => {
              onDeleteSubject(subject.id);
            }}
            disabled={isDeleting}
            className="rounded-md border border-red-200 px-2 py-1 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "..." : "🗑️"}
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
          <span className="text-sm text-slate-600">Average / Passing</span>
          <span className={`text-sm font-semibold ${gradeClassName}`}>
            {formatGrade(currentAverage)} / {formatGrade(passingGrade)}
          </span>
        </div>

        <div
          className={`flex items-center justify-between rounded-lg p-3 ${absenceClassName}`}
        >
          <span className="text-sm">Absences / Allowed</span>
          <span className="text-sm font-semibold">
            {totalAbsences} / {allowedAbsences}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              onLogGrade(subject.id);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Log Grade
          </button>

          <button
            type="button"
            onClick={() => {
              onLogAbsence(subject.id);
            }}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Log Absence
          </button>
        </div>
      </div>
    </article>
  );
}
