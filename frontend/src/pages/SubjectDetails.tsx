import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Modal } from "../components/Modal";
import { QuickTagCreate } from "../components/QuickTagCreate";
import { TagChip } from "../components/TagChip";
import { api, tagApi } from "../services/api";
import type {
  Absence,
  AddAbsencePayload,
  Grade,
  SubjectWithDetails,
  Tag,
  UpdateAbsencePayload,
  UpdateGradePayload,
} from "../types";

interface ApiErrorResponse {
  message?: string;
}

interface GradeFormState {
  value: string;
  weight: string;
  title: string;
}

interface AbsenceFormState {
  absenceDate: string;
  tagId: string;
}

interface EditingGrade {
  id: string;
  value: string;
  weight: string;
  title: string;
}

interface EditingAbsence {
  id: string;
  absenceDate: string;
  tagId: string;
}

const DEFAULT_GRADE_WEIGHT = "1";

const INITIAL_GRADE_FORM_STATE: GradeFormState = {
  value: "",
  weight: DEFAULT_GRADE_WEIGHT,
  title: "",
};

const INITIAL_ABSENCE_FORM_STATE: AbsenceFormState = {
  absenceDate: new Date().toISOString().slice(0, 10),
  tagId: "",
};

const getErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (!axios.isAxiosError(error)) {
    return fallbackMessage;
  }

  const responseData = error.response?.data as ApiErrorResponse | undefined;

  return responseData?.message ?? fallbackMessage;
};

const formatDateForDisplay = (dateString: string): string => {
  // Parse YYYY-MM-DD format without timezone conversion
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

const getGradeStatusColor = (
  currentAverage: number,
  passingGrade: number,
): string => {
  return currentAverage >= passingGrade ? "text-green-600" : "text-red-600";
};

export function SubjectDetails() {
  const { id: subjectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [subject, setSubject] = useState<SubjectWithDetails | null>(null);

  const [absenceTags, setAbsenceTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeletingGrade, setIsDeletingGrade] = useState<string | null>(null);
  const [isDeletingAbsence, setIsDeletingAbsence] = useState<string | null>(
    null,
  );
  const [isQuickTagModalOpen, setIsQuickTagModalOpen] =
    useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [quickTagContext, setQuickTagContext] = useState<"subject" | "absence">(
    "subject",
  );

  const [isAddGradeModalOpen, setIsAddGradeModalOpen] =
    useState<boolean>(false);
  const [gradeFormState, setGradeFormState] = useState<GradeFormState>(
    INITIAL_GRADE_FORM_STATE,
  );
  const [editingGrade, setEditingGrade] = useState<EditingGrade | null>(null);

  const [isAddAbsenceModalOpen, setIsAddAbsenceModalOpen] =
    useState<boolean>(false);
  const [absenceFormState, setAbsenceFormState] = useState<AbsenceFormState>(
    INITIAL_ABSENCE_FORM_STATE,
  );
  const [editingAbsence, setEditingAbsence] = useState<EditingAbsence | null>(
    null,
  );

  const fetchSubjectDetails = useCallback(async (): Promise<void> => {
    if (!subjectId) {
      return;
    }

    try {
      setIsLoading(true);
      const [subjectResponse, , absenceTagsResponse] = await Promise.all([
        api.get<SubjectWithDetails>(`/api/subjects/${subjectId}`),
        tagApi.getAll("subject"),
        tagApi.getAll("absence"),
      ]);
      setSubject(subjectResponse.data);
      setAbsenceTags(absenceTagsResponse);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Failed to load subject details. Please try again.",
      );
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    void fetchSubjectDetails();
  }, [fetchSubjectDetails]);

  const handleTagCreated = (
    newTag: Tag,
    tagType: "subject" | "absence",
  ): void => {
    if (tagType === "absence") {
      setAbsenceTags((prevTags) => [...prevTags, newTag]);
    }
  };

  const averageGradeColor = useMemo(() => {
    if (!subject) {
      return "";
    }

    return getGradeStatusColor(subject.averageGrade, subject.passingGrade);
  }, [subject]);

  const handleAddGradeSubmit = async (
    event: React.SyntheticEvent<HTMLFormElement>,
  ): Promise<void> => {
    // eslint-disable-next-line sonarjs/cognitive-complexity
    event.preventDefault();

    if (!subjectId || !subject) {
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingGrade) {
        const updatePayload: UpdateGradePayload = {};

        if (gradeFormState.value) {
          updatePayload.value = Number.parseFloat(gradeFormState.value);
        }

        if (
          gradeFormState.weight &&
          gradeFormState.weight !== DEFAULT_GRADE_WEIGHT
        ) {
          updatePayload.weight = Number.parseFloat(gradeFormState.weight);
        }

        if (gradeFormState.title.trim()) {
          updatePayload.title = gradeFormState.title.trim();
        }

        if (Object.keys(updatePayload).length === 0) {
          toast.error("No changes to update");
          return;
        }

        await api.put(`/api/grades/${editingGrade.id}`, updatePayload);
        toast.success("Grade updated successfully!");
      } else {
        const gradePayload = {
          value: Number.parseFloat(gradeFormState.value),
          weight: gradeFormState.weight
            ? Number.parseFloat(gradeFormState.weight)
            : undefined,
          title: gradeFormState.title.trim() || undefined,
        };

        await api.post(`/api/subjects/${subjectId}/grades`, gradePayload);
        toast.success("Grade added successfully!");
      }

      setGradeFormState(INITIAL_GRADE_FORM_STATE);
      setEditingGrade(null);
      setIsAddGradeModalOpen(false);
      await fetchSubjectDetails();
    } catch (error) {
      const message = getErrorMessage(
        error,
        editingGrade
          ? "Failed to update grade. Please try again."
          : "Failed to add grade. Please try again.",
      );
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditGrade = (grade: Grade): void => {
    setEditingGrade({
      id: grade.id,
      value: grade.value.toString(),
      weight: grade.weight.toString(),
      title: grade.title ?? "",
    });
    setGradeFormState({
      value: grade.value.toString(),
      weight: grade.weight.toString(),
      title: grade.title ?? "",
    });
    setIsAddGradeModalOpen(true);
  };

  const handleDeleteGrade = async (gradeId: string): Promise<void> => {
    try {
      setIsDeletingGrade(gradeId);
      await api.delete(`/api/grades/${gradeId}`);
      toast.success("Grade deleted successfully!");
      await fetchSubjectDetails();
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Failed to delete grade. Please try again.",
      );
      toast.error(message);
    } finally {
      setIsDeletingGrade(null);
    }
  };

  const handleAddAbsenceSubmit = async (
    event: React.SyntheticEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (!subjectId || !subject) {
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingAbsence) {
        const updatePayload: UpdateAbsencePayload = {
          absenceDate: absenceFormState.absenceDate,
        };

        if (absenceFormState.tagId) {
          updatePayload.tagId = absenceFormState.tagId;
        }

        await api.put(`/api/absences/${editingAbsence.id}`, updatePayload);
        toast.success("Absence updated successfully!");
      } else {
        const absencePayload: AddAbsencePayload = {
          absenceDate: absenceFormState.absenceDate,
        };

        if (absenceFormState.tagId) {
          absencePayload.tagId = absenceFormState.tagId;
        }

        await api.post(`/api/subjects/${subjectId}/absences`, absencePayload);
        toast.success("Absence recorded successfully!");
      }

      setAbsenceFormState(INITIAL_ABSENCE_FORM_STATE);
      setEditingAbsence(null);
      setIsAddAbsenceModalOpen(false);
      await fetchSubjectDetails();
    } catch (error) {
      const message = getErrorMessage(
        error,
        editingAbsence
          ? "Failed to update absence. Please try again."
          : "Failed to add absence. Please try again.",
      );
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAbsence = (absence: Absence): void => {
    setEditingAbsence({
      id: absence.id,
      absenceDate: absence.absenceDate,
      tagId: absence.tagId ?? "",
    });
    setAbsenceFormState({
      absenceDate: absence.absenceDate,
      tagId: absence.tagId ?? "",
    });
    setIsAddAbsenceModalOpen(true);
  };

  const handleDeleteAbsence = async (absenceId: string): Promise<void> => {
    try {
      setIsDeletingAbsence(absenceId);
      await api.delete(`/api/absences/${absenceId}`);
      toast.success("Absence deleted successfully!");
      await fetchSubjectDetails();
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Failed to delete absence. Please try again.",
      );
      toast.error(message);
    } finally {
      setIsDeletingAbsence(null);
    }
  };

  const closeGradeModal = (): void => {
    setIsAddGradeModalOpen(false);
    setGradeFormState(INITIAL_GRADE_FORM_STATE);
    setEditingGrade(null);
  };

  const closeAbsenceModal = (): void => {
    setIsAddAbsenceModalOpen(false);
    setAbsenceFormState(INITIAL_ABSENCE_FORM_STATE);
    setEditingAbsence(null);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg text-slate-600">Loading subject details...</p>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
        <p className="mb-4 text-lg text-slate-600">Subject not found</p>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-900">
              {subject.name}
            </h1>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-600">Current Average</p>
              <p className={`text-2xl font-bold ${averageGradeColor}`}>
                {subject.averageGrade.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-600">Passing Grade</p>
              <p className="text-2xl font-bold text-slate-900">
                {subject.passingGrade}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-600">Total Absences</p>
              <p className="text-2xl font-bold text-slate-900">
                {subject.totalAbsences}
              </p>
            </div>
          </div>
        </div>

        {/* Grades Section */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Grades</h2>
            <button
              type="button"
              onClick={() => {
                setEditingGrade(null);
                setGradeFormState(INITIAL_GRADE_FORM_STATE);
                setIsAddGradeModalOpen(true);
              }}
              className="rounded-md bg-slate-900 px-3 py-1 text-sm font-medium text-white hover:bg-slate-800"
            >
              + Add Grade
            </button>
          </div>

          {subject.grades.length === 0 ? (
            <p className="text-sm text-slate-500">No grades recorded yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-2 text-left font-semibold text-slate-600">
                      Title
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-slate-600">
                      Value
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-slate-600">
                      Weight
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {subject.grades.map((grade) => (
                    <tr
                      key={grade.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-2 font-medium text-slate-900">
                        {grade.title ? (
                          <span>{grade.title}</span>
                        ) : (
                          <span className="italic text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-slate-900">
                        {grade.value.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-slate-900">
                        {grade.weight}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditGrade(grade)}
                            className="text-blue-600 hover:text-blue-700"
                            aria-label="Edit grade"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGrade(grade.id)}
                            disabled={isDeletingGrade === grade.id}
                            className="text-red-600 hover:text-red-700 disabled:opacity-50"
                            aria-label="Delete grade"
                          >
                            {isDeletingGrade === grade.id ? "..." : "🗑️"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Absences Section */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Absences</h2>
            <button
              type="button"
              onClick={() => {
                setEditingAbsence(null);
                setAbsenceFormState(INITIAL_ABSENCE_FORM_STATE);
                setIsAddAbsenceModalOpen(true);
              }}
              className="rounded-md bg-slate-900 px-3 py-1 text-sm font-medium text-white hover:bg-slate-800"
            >
              + Add Absence
            </button>
          </div>

          {subject.absences.length === 0 ? (
            <p className="text-sm text-slate-500">No absences recorded yet</p>
          ) : (
            <div className="space-y-2">
              {subject.absences.map((absence) => (
                <div
                  key={absence.id}
                  className="flex items-center justify-between rounded-md border border-slate-200 p-3 hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-2">
                    <p className="font-medium text-slate-900">
                      {formatDateForDisplay(absence.absenceDate)}
                    </p>
                    {absence.tag && <TagChip tag={absence.tag} size="sm" />}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditAbsence(absence)}
                      className="text-blue-600 hover:text-blue-700"
                      aria-label="Edit absence"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAbsence(absence.id)}
                      disabled={isDeletingAbsence === absence.id}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50"
                      aria-label="Delete absence"
                    >
                      {isDeletingAbsence === absence.id ? "..." : "🗑️"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grade Modal */}
      <Modal
        isOpen={isAddGradeModalOpen}
        title={editingGrade ? "Edit Grade" : "Add Grade"}
        onClose={closeGradeModal}
      >
        <form onSubmit={handleAddGradeSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="grade-value"
              className="block text-sm font-medium text-slate-700"
            >
              Grade Value
            </label>
            <input
              id="grade-value"
              type="number"
              step="0.01"
              min="0"
              max="100"
              required
              value={gradeFormState.value}
              onChange={(event) =>
                setGradeFormState({
                  ...gradeFormState,
                  value: event.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., 8.5"
            />
          </div>

          <div>
            <label
              htmlFor="grade-weight"
              className="block text-sm font-medium text-slate-700"
            >
              Weight (optional)
            </label>
            <input
              id="grade-weight"
              type="number"
              step="0.01"
              min="0.01"
              max="100"
              value={gradeFormState.weight}
              onChange={(event) =>
                setGradeFormState({
                  ...gradeFormState,
                  weight: event.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., 1"
            />
          </div>

          <div>
            <label
              htmlFor="grade-title"
              className="block text-sm font-medium text-slate-700"
            >
              Title (optional)
            </label>
            <input
              id="grade-title"
              type="text"
              value={gradeFormState.title}
              onChange={(event) =>
                setGradeFormState({
                  ...gradeFormState,
                  title: event.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., Midterm, Final, Quiz"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !gradeFormState.value}
              className="flex-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {(() => {
                if (isSubmitting) return "Saving...";
                return editingGrade ? "Update" : "Add";
              })()}
            </button>
            <button
              type="button"
              onClick={closeGradeModal}
              className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Absence Modal */}
      <Modal
        isOpen={isAddAbsenceModalOpen}
        title={editingAbsence ? "Edit Absence" : "Record Absence"}
        onClose={closeAbsenceModal}
      >
        <form onSubmit={handleAddAbsenceSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="absence-date"
              className="block text-sm font-medium text-slate-700"
            >
              Absence Date
            </label>
            <input
              id="absence-date"
              type="date"
              required
              value={absenceFormState.absenceDate}
              onChange={(event) =>
                setAbsenceFormState((prevState) => ({
                  ...prevState,
                  absenceDate: event.target.value,
                }))
              }
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="absence-tag"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Tag (optional)
            </label>
            <div className="flex gap-2">
              <select
                id="absence-tag"
                value={absenceFormState.tagId}
                onChange={(event) =>
                  setAbsenceFormState((prevState) => ({
                    ...prevState,
                    tagId: event.target.value,
                  }))
                }
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">None</option>
                {absenceTags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setQuickTagContext("absence");
                  setIsQuickTagModalOpen(true);
                }}
                className="px-3 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors font-medium"
                title="Create new tag"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {(() => {
                if (isSubmitting) return "Saving...";
                return editingAbsence ? "Update" : "Record";
              })()}
            </button>
            <button
              type="button"
              onClick={closeAbsenceModal}
              className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <QuickTagCreate
        isOpen={isQuickTagModalOpen}
        onClose={() => setIsQuickTagModalOpen(false)}
        onTagCreated={handleTagCreated}
        tagType={quickTagContext}
      />
    </div>
  );
}
