import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "../components/Modal";
import { QuickTagCreate } from "../components/QuickTagCreate";
import { SubjectCard } from "../components/SubjectCard";
import { useAuth } from "../context/useAuth";
import { api, tagApi } from "../services/api";
import type {
  AddGradePayload,
  CreateSubjectPayload,
  Subject,
  SubjectCardData,
  SubjectWithDetails,
  Tag,
  UpdateSubjectPayload,
} from "../types";

const DEFAULT_PASSING_GRADE = 7;
const DEFAULT_TOTAL_CLASSES = 60;

interface ApiErrorResponse {
  message?: string;
}

interface AddSubjectFormState {
  name: string;
  totalClasses: number;
  passingGrade: number;
  tagId?: string;
}

interface LogGradeFormState {
  value: string;
  weight: string;
  title: string;
}

interface EditSubjectFormState {
  name: string;
  totalClasses: number;
  passingGrade: number;
  tagId?: string;
}

const INITIAL_ADD_SUBJECT_FORM_STATE: AddSubjectFormState = {
  name: "",
  totalClasses: DEFAULT_TOTAL_CLASSES,
  passingGrade: DEFAULT_PASSING_GRADE,
};

const INITIAL_LOG_GRADE_FORM_STATE: LogGradeFormState = {
  value: "",
  weight: "",
  title: "",
};

const INITIAL_EDIT_SUBJECT_FORM_STATE: EditSubjectFormState = {
  name: "",
  totalClasses: DEFAULT_TOTAL_CLASSES,
  passingGrade: DEFAULT_PASSING_GRADE,
};

const getErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (!axios.isAxiosError(error)) {
    return fallbackMessage;
  }

  const responseData = error.response?.data as ApiErrorResponse | undefined;

  return responseData?.message ?? fallbackMessage;
};

const toCreateSubjectPayload = (
  formState: AddSubjectFormState,
): CreateSubjectPayload => {
  const payload: CreateSubjectPayload = {
    name: formState.name.trim(),
    totalClasses: formState.totalClasses,
    passingGrade: formState.passingGrade,
  };

  if (formState.tagId) {
    payload.tagId = formState.tagId;
  }

  return payload;
};

const toUpdateSubjectPayload = (
  formState: EditSubjectFormState,
): UpdateSubjectPayload => {
  return toCreateSubjectPayload(formState);
};

const toAddGradePayload = (formState: LogGradeFormState): AddGradePayload => {
  const parsedValue = Number(formState.value);
  const parsedWeight = Number(formState.weight);

  const payload: AddGradePayload = {
    value: parsedValue,
  };

  if (formState.weight.trim() && Number.isFinite(parsedWeight)) {
    payload.weight = parsedWeight;
  }

  if (formState.title.trim()) {
    payload.title = formState.title.trim();
  }

  return payload;
};

const toEditSubjectFormState = (
  subject: SubjectWithDetails,
): EditSubjectFormState => {
  return {
    name: subject.name,
    totalClasses: subject.totalClasses,
    passingGrade: subject.passingGrade,
    tagId: subject.tagId,
  };
};

const validateSubjectPayload = (
  payload: CreateSubjectPayload | UpdateSubjectPayload,
): string | null => {
  if (!payload.name?.trim()) {
    return "Subject name is required.";
  }

  if (!payload.totalClasses || payload.totalClasses <= 0) {
    return "Total classes must be greater than zero.";
  }

  if (payload.passingGrade === undefined || payload.passingGrade < 0) {
    return "Passing grade cannot be negative.";
  }

  return null;
};

// eslint-disable sonarjs/cognitive-complexity
export function Dashboard() {
  const { user, signOut } = useAuth();
  const [subjects, setSubjects] = useState<SubjectWithDetails[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isQuickTagModalOpen, setIsQuickTagModalOpen] =
    useState<boolean>(false);
  const [quickTagContext, setQuickTagContext] = useState<"subject" | "absence">(
    "subject",
  ); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] =
    useState<boolean>(false);
  const [isLogGradeModalOpen, setIsLogGradeModalOpen] =
    useState<boolean>(false);
  const [isLogAbsenceModalOpen, setIsLogAbsenceModalOpen] =
    useState<boolean>(false);
  const [isEditSubjectModalOpen, setIsEditSubjectModalOpen] =
    useState<boolean>(false);
  const [isDeleteSubjectModalOpen, setIsDeleteSubjectModalOpen] =
    useState<boolean>(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null,
  );
  const [isSubmittingAddSubject, setIsSubmittingAddSubject] =
    useState<boolean>(false);
  const [isSubmittingGrade, setIsSubmittingGrade] = useState<boolean>(false);
  const [isSubmittingAbsence, setIsSubmittingAbsence] =
    useState<boolean>(false);
  const [isSubmittingUpdateSubject, setIsSubmittingUpdateSubject] =
    useState<boolean>(false);
  const [isSubmittingDeleteSubject, setIsSubmittingDeleteSubject] =
    useState<boolean>(false);
  const [addSubjectErrorMessage, setAddSubjectErrorMessage] = useState<
    string | null
  >(null);
  const [logGradeErrorMessage, setLogGradeErrorMessage] = useState<
    string | null
  >(null);
  const [logAbsenceErrorMessage, setLogAbsenceErrorMessage] = useState<
    string | null
  >(null);
  const [editSubjectErrorMessage, setEditSubjectErrorMessage] = useState<
    string | null
  >(null);
  const [deleteSubjectErrorMessage, setDeleteSubjectErrorMessage] = useState<
    string | null
  >(null);
  const [addSubjectFormState, setAddSubjectFormState] =
    useState<AddSubjectFormState>(INITIAL_ADD_SUBJECT_FORM_STATE);
  const [editSubjectFormState, setEditSubjectFormState] =
    useState<EditSubjectFormState>(INITIAL_EDIT_SUBJECT_FORM_STATE);
  const [logGradeFormState, setLogGradeFormState] = useState<LogGradeFormState>(
    INITIAL_LOG_GRADE_FORM_STATE,
  );

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [subjectResponse, tagsResponse] = await Promise.all([
        api.get<SubjectWithDetails[]>("/api/subjects"),
        tagApi.getAll("subject"),
      ]);
      setSubjects(subjectResponse.data);
      setTags(tagsResponse);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to load subjects."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  const handleTagCreated = (
    newTag: Tag,
    tagType: "subject" | "absence",
  ): void => {
    if (tagType === "subject") {
      setTags((prevTags) => [...prevTags, newTag]);
    }
  };

  const selectedSubject = useMemo<SubjectWithDetails | null>(() => {
    if (!selectedSubjectId) {
      return null;
    }

    return subjects.find((subject) => subject.id === selectedSubjectId) ?? null;
  }, [selectedSubjectId, subjects]);

  const openLogGradeModal = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setLogGradeErrorMessage(null);
    setLogGradeFormState(INITIAL_LOG_GRADE_FORM_STATE);
    setIsLogGradeModalOpen(true);
  };

  const openLogAbsenceModal = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setLogAbsenceErrorMessage(null);
    setIsLogAbsenceModalOpen(true);
  };

  const closeAddSubjectModal = () => {
    if (isSubmittingAddSubject) {
      return;
    }

    setAddSubjectErrorMessage(null);
    setAddSubjectFormState(INITIAL_ADD_SUBJECT_FORM_STATE);
    setIsAddSubjectModalOpen(false);
  };

  const closeLogGradeModal = () => {
    if (isSubmittingGrade) {
      return;
    }

    setLogGradeErrorMessage(null);
    setLogGradeFormState(INITIAL_LOG_GRADE_FORM_STATE);
    setSelectedSubjectId(null);
    setIsLogGradeModalOpen(false);
  };

  const closeLogAbsenceModal = () => {
    if (isSubmittingAbsence) {
      return;
    }

    setLogAbsenceErrorMessage(null);
    setSelectedSubjectId(null);
    setIsLogAbsenceModalOpen(false);
  };

  const closeEditSubjectModal = () => {
    if (isSubmittingUpdateSubject) {
      return;
    }

    setEditSubjectErrorMessage(null);
    setEditSubjectFormState(INITIAL_EDIT_SUBJECT_FORM_STATE);
    setSelectedSubjectId(null);
    setIsEditSubjectModalOpen(false);
  };

  const closeDeleteSubjectModal = () => {
    if (isSubmittingDeleteSubject) {
      return;
    }

    setDeleteSubjectErrorMessage(null);
    setSelectedSubjectId(null);
    setIsDeleteSubjectModalOpen(false);
  };

  const openEditSubjectModal = (subjectId: string) => {
    const subject = subjects.find((item) => item.id === subjectId);

    if (!subject) {
      return;
    }

    setSelectedSubjectId(subjectId);
    setEditSubjectErrorMessage(null);
    setEditSubjectFormState(toEditSubjectFormState(subject));
    setIsEditSubjectModalOpen(true);
  };

  const openDeleteSubjectModal = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setDeleteSubjectErrorMessage(null);
    setIsDeleteSubjectModalOpen(true);
  };

  const handleAddSubjectSubmit = async (
    event: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setAddSubjectErrorMessage(null);

    const payload = toCreateSubjectPayload(addSubjectFormState);

    const validationMessage = validateSubjectPayload(payload);

    if (validationMessage) {
      setAddSubjectErrorMessage(validationMessage);
      return;
    }

    setIsSubmittingAddSubject(true);

    try {
      await api.post<Subject>("/api/subjects", payload);

      closeAddSubjectModal();
      await fetchDashboardData();
    } catch (error) {
      setAddSubjectErrorMessage(
        getErrorMessage(error, "Failed to create subject."),
      );
    } finally {
      setIsSubmittingAddSubject(false);
    }
  };

  const handleLogGradeSubmit = async (
    event: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setLogGradeErrorMessage(null);

    if (!selectedSubjectId) {
      setLogGradeErrorMessage("Please select a subject first.");
      return;
    }

    const payload = toAddGradePayload(logGradeFormState);

    if (!Number.isFinite(payload.value)) {
      setLogGradeErrorMessage("Grade value must be a valid number.");
      return;
    }

    if (payload.value < 0 || payload.value > 10) {
      setLogGradeErrorMessage("Grade value must be between 0 and 10.");
      return;
    }

    const weight = payload.weight ?? 1;

    if (!Number.isFinite(weight) || weight <= 0) {
      setLogGradeErrorMessage("Weight must be greater than zero.");
      return;
    }

    setIsSubmittingGrade(true);

    try {
      await api.post(`/api/subjects/${selectedSubjectId}/grades`, {
        value: payload.value,
        weight,
      });

      closeLogGradeModal();
      await fetchDashboardData();
    } catch (error) {
      setLogGradeErrorMessage(getErrorMessage(error, "Failed to log grade."));
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  const handleLogAbsenceConfirm = async () => {
    if (!selectedSubjectId) {
      setLogAbsenceErrorMessage("Please select a subject first.");
      return;
    }

    setLogAbsenceErrorMessage(null);
    setIsSubmittingAbsence(true);

    try {
      await api.post(`/api/subjects/${selectedSubjectId}/absences`);
      closeLogAbsenceModal();
      await fetchDashboardData();
    } catch (error) {
      setLogAbsenceErrorMessage(
        getErrorMessage(error, "Failed to log absence."),
      );
    } finally {
      setIsSubmittingAbsence(false);
    }
  };

  const handleEditSubjectSubmit = async (
    event: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setEditSubjectErrorMessage(null);

    if (!selectedSubjectId) {
      setEditSubjectErrorMessage("Please select a subject first.");
      return;
    }

    const payload = toUpdateSubjectPayload(editSubjectFormState);
    const validationMessage = validateSubjectPayload(payload);

    if (validationMessage) {
      setEditSubjectErrorMessage(validationMessage);
      return;
    }

    setIsSubmittingUpdateSubject(true);

    try {
      await api.put<Subject>(`/api/subjects/${selectedSubjectId}`, payload);
      closeEditSubjectModal();
      await fetchDashboardData();
    } catch (error) {
      setEditSubjectErrorMessage(
        getErrorMessage(error, "Failed to update subject."),
      );
    } finally {
      setIsSubmittingUpdateSubject(false);
    }
  };

  const handleDeleteSubjectConfirm = async () => {
    if (!selectedSubjectId) {
      setDeleteSubjectErrorMessage("Please select a subject first.");
      return;
    }

    setDeleteSubjectErrorMessage(null);
    setIsSubmittingDeleteSubject(true);

    try {
      await api.delete(`/api/subjects/${selectedSubjectId}`);
      closeDeleteSubjectModal();
      await fetchDashboardData();
    } catch (error) {
      setDeleteSubjectErrorMessage(
        getErrorMessage(error, "Failed to delete subject."),
      );
    } finally {
      setIsSubmittingDeleteSubject(false);
    }
  };

  const cardData = useMemo<SubjectCardData[]>(() => {
    return subjects.map((subject) => ({
      subject,
      currentAverage: subject.averageGrade,
      passingGrade: subject.passingGrade,
      totalAbsences: subject.totalAbsences,
      totalClasses: subject.totalClasses,
    }));
  }, [subjects]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("You have been signed out.");
    } catch {
      toast.error("Unable to sign out right now. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center">
              <img
                src="/logo2.png"
                alt="AttenDash Logo"
                className="mr-3 h-7 w-auto sm:h-8"
              />
              {/* <h1 className="text-2xl font-semibold text-slate-900">
                AttenDash
              </h1> */}
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Welcome, {user?.email ?? "student"}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setAddSubjectErrorMessage(null);
                setIsAddSubjectModalOpen(true);
              }}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Add Subject
            </button>

            <button
              type="button"
              onClick={() => {
                void handleSignOut();
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Sign out
            </button>
          </div>
        </header>

        {isLoading ? (
          <p className="text-sm text-slate-600">Loading subjects...</p>
        ) : null}

        {!isLoading && errorMessage ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {!isLoading && !errorMessage && cardData.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
            No subjects yet. Use "Add Subject" to start tracking.
          </div>
        ) : null}

        {!isLoading && !errorMessage && cardData.length > 0 ? (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cardData.map((item) => (
              <SubjectCard
                key={item.subject.id}
                data={item}
                onLogGrade={openLogGradeModal}
                onLogAbsence={openLogAbsenceModal}
                onEditSubject={openEditSubjectModal}
                onDeleteSubject={openDeleteSubjectModal}
                isDeleting={
                  isSubmittingDeleteSubject &&
                  selectedSubjectId === item.subject.id
                }
              />
            ))}
          </section>
        ) : null}
      </div>

      <Modal
        isOpen={isAddSubjectModalOpen}
        title="Add Subject"
        onClose={closeAddSubjectModal}
      >
        <form className="space-y-4" onSubmit={handleAddSubjectSubmit}>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="subject-name"
            >
              Name
            </label>
            <input
              id="subject-name"
              type="text"
              required
              value={addSubjectFormState.name}
              onChange={(event) => {
                setAddSubjectFormState((previousState) => ({
                  ...previousState,
                  name: event.target.value,
                }));
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-400"
              placeholder="Linear Algebra"
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="subject-total-classes"
            >
              Total Classes
            </label>
            <input
              id="subject-total-classes"
              type="number"
              min={1}
              step={1}
              required
              value={addSubjectFormState.totalClasses}
              onChange={(event) => {
                setAddSubjectFormState((previousState) => ({
                  ...previousState,
                  totalClasses: Number(event.target.value),
                }));
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="subject-passing-grade"
            >
              Passing Grade
            </label>
            <input
              id="subject-passing-grade"
              type="number"
              min={0}
              max={10}
              step={0.1}
              required
              value={addSubjectFormState.passingGrade}
              onChange={(event) => {
                setAddSubjectFormState((previousState) => ({
                  ...previousState,
                  passingGrade: Number(event.target.value),
                }));
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="subject-tag"
            >
              Tag (optional)
            </label>
            <div className="flex gap-2">
              <select
                id="subject-tag"
                value={addSubjectFormState.tagId ?? ""}
                onChange={(event) => {
                  setAddSubjectFormState((previousState) => ({
                    ...previousState,
                    tagId: event.target.value || undefined,
                  }));
                }}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-400"
              >
                <option value="">None</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setQuickTagContext("subject");
                  setIsQuickTagModalOpen(true);
                }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 hover:bg-slate-100"
                title="Create a new tag"
              >
                +
              </button>
            </div>
          </div>

          {addSubjectErrorMessage ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {addSubjectErrorMessage}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={closeAddSubjectModal}
              disabled={isSubmittingAddSubject}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingAddSubject}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {isSubmittingAddSubject ? "Saving..." : "Create Subject"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditSubjectModalOpen}
        title="Edit Subject"
        onClose={closeEditSubjectModal}
      >
        <form className="space-y-4" onSubmit={handleEditSubjectSubmit}>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="edit-subject-name"
            >
              Name
            </label>
            <input
              id="edit-subject-name"
              type="text"
              required
              value={editSubjectFormState.name}
              onChange={(event) => {
                setEditSubjectFormState((previousState) => ({
                  ...previousState,
                  name: event.target.value,
                }));
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="edit-subject-total-classes"
            >
              Total Classes
            </label>
            <input
              id="edit-subject-total-classes"
              type="number"
              min={1}
              step={1}
              required
              value={editSubjectFormState.totalClasses}
              onChange={(event) => {
                setEditSubjectFormState((previousState) => ({
                  ...previousState,
                  totalClasses: Number(event.target.value),
                }));
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="edit-subject-passing-grade"
            >
              Passing Grade
            </label>
            <input
              id="edit-subject-passing-grade"
              type="number"
              min={0}
              max={10}
              step={0.1}
              required
              value={editSubjectFormState.passingGrade}
              onChange={(event) => {
                setEditSubjectFormState((previousState) => ({
                  ...previousState,
                  passingGrade: Number(event.target.value),
                }));
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="edit-subject-tag"
            >
              Tag (optional)
            </label>
            <div className="flex gap-2">
              <select
                id="edit-subject-tag"
                value={editSubjectFormState.tagId ?? ""}
                onChange={(event) => {
                  setEditSubjectFormState((previousState) => ({
                    ...previousState,
                    tagId: event.target.value || undefined,
                  }));
                }}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-400"
              >
                <option value="">None</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setQuickTagContext("subject");
                  setIsQuickTagModalOpen(true);
                }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 hover:bg-slate-100"
                title="Create a new tag"
              >
                +
              </button>
            </div>
          </div>

          {editSubjectErrorMessage ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {editSubjectErrorMessage}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={closeEditSubjectModal}
              disabled={isSubmittingUpdateSubject}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingUpdateSubject}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {isSubmittingUpdateSubject ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteSubjectModalOpen}
        title="Delete Subject"
        onClose={closeDeleteSubjectModal}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {`This will permanently remove ${selectedSubject?.name ?? "this subject"}.`}
          </p>

          {deleteSubjectErrorMessage ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {deleteSubjectErrorMessage}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={closeDeleteSubjectModal}
              disabled={isSubmittingDeleteSubject}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                void handleDeleteSubjectConfirm();
              }}
              disabled={isSubmittingDeleteSubject}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500 disabled:opacity-60"
            >
              {isSubmittingDeleteSubject ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isLogGradeModalOpen}
        title="Log Grade"
        onClose={closeLogGradeModal}
      >
        <form className="space-y-4" onSubmit={handleLogGradeSubmit}>
          <p className="text-sm text-slate-600">
            Subject:{" "}
            <span className="font-medium text-slate-900">
              {selectedSubject?.name ?? "-"}
            </span>
          </p>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="grade-value"
            >
              Grade Value
            </label>
            <input
              id="grade-value"
              type="number"
              min={0}
              max={10}
              step={0.1}
              required
              value={logGradeFormState.value}
              onChange={(event) => {
                setLogGradeFormState((previousState) => ({
                  ...previousState,
                  value: event.target.value,
                }));
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="grade-weight"
            >
              Weight (optional)
            </label>
            <input
              id="grade-weight"
              type="number"
              min={0.1}
              step={0.1}
              value={logGradeFormState.weight}
              onChange={(event) => {
                setLogGradeFormState((previousState) => ({
                  ...previousState,
                  weight: event.target.value,
                }));
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-400"
              placeholder="1"
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="grade-title"
            >
              Title (optional)
            </label>
            <input
              id="grade-title"
              type="text"
              value={logGradeFormState.title}
              onChange={(event) => {
                setLogGradeFormState((previousState) => ({
                  ...previousState,
                  title: event.target.value,
                }));
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-400"
              placeholder="e.g., Midterm, Final, Quiz"
            />
          </div>

          {logGradeErrorMessage ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {logGradeErrorMessage}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={closeLogGradeModal}
              disabled={isSubmittingGrade}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingGrade}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {isSubmittingGrade ? "Saving..." : "Save Grade"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isLogAbsenceModalOpen}
        title="Log Absence"
        onClose={closeLogAbsenceModal}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {`Confirm one absence for ${selectedSubject?.name ?? "this subject"}?`}
          </p>

          {logAbsenceErrorMessage ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {logAbsenceErrorMessage}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={closeLogAbsenceModal}
              disabled={isSubmittingAbsence}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                void handleLogAbsenceConfirm();
              }}
              disabled={isSubmittingAbsence}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {isSubmittingAbsence ? "Saving..." : "Confirm"}
            </button>
          </div>
        </div>
      </Modal>

      <QuickTagCreate
        isOpen={isQuickTagModalOpen}
        onClose={() => setIsQuickTagModalOpen(false)}
        onTagCreated={handleTagCreated}
        tagType={quickTagContext}
      />
    </main>
  );
}
