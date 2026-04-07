import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

interface UpdatePasswordFormState {
  password: string;
  confirmPassword: string;
}

const INITIAL_UPDATE_PASSWORD_FORM_STATE: UpdatePasswordFormState = {
  password: "",
  confirmPassword: "",
};

export function UpdatePassword() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState<UpdatePasswordFormState>(
    INITIAL_UPDATE_PASSWORD_FORM_STATE,
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formState.password.length < 6) {
      toast.error("Password must contain at least 6 characters.");
      return;
    }

    if (formState.password !== formState.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Invalid or expired reset link. Please request a new one.");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: formState.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password updated successfully. Please login again.");
      await navigate("/login", { replace: true });
    } catch {
      toast.error("Unable to update password right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Update Password
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Set a new password to recover your AttenDash account.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="update-password"
            >
              New password
            </label>
            <input
              id="update-password"
              type="password"
              autoComplete="new-password"
              required
              value={formState.password}
              onChange={(event) => {
                setFormState((previousState) => ({
                  ...previousState,
                  password: event.target.value,
                }));
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="update-confirm-password"
            >
              Confirm new password
            </label>
            <input
              id="update-confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={formState.confirmPassword}
              onChange={(event) => {
                setFormState((previousState) => ({
                  ...previousState,
                  confirmPassword: event.target.value,
                }));
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400"
              placeholder="Repeat new password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Updating..." : "Update password"}
          </button>

          <p className="text-center text-sm text-slate-600">
            Back to{" "}
            <Link
              to="/login"
              className="font-medium text-slate-900 underline underline-offset-2"
            >
              login
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
