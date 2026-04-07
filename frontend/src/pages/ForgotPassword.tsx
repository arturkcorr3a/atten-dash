import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";

interface ForgotPasswordFormState {
  email: string;
}

const INITIAL_FORGOT_PASSWORD_FORM_STATE: ForgotPasswordFormState = {
  email: "",
};

export function ForgotPassword() {
  const [formState, setFormState] = useState<ForgotPasswordFormState>(
    INITIAL_FORGOT_PASSWORD_FORM_STATE,
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const redirectTo = `${globalThis.location.origin}/update-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(
        formState.email.trim(),
        {
          redirectTo,
        },
      );

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password reset email sent. Please check your inbox.");
      setFormState(INITIAL_FORGOT_PASSWORD_FORM_STATE);
    } catch {
      toast.error("Unable to send reset email right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Forgot Password
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter your account email to receive a password reset link.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="forgot-password-email"
            >
              Email
            </label>
            <input
              id="forgot-password-email"
              type="email"
              autoComplete="email"
              required
              value={formState.email}
              onChange={(event) => {
                setFormState({ email: event.target.value });
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400"
              placeholder="student@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
          </button>

          <p className="text-center text-sm text-slate-600">
            Remembered your password?{" "}
            <Link
              to="/login"
              className="font-medium text-slate-900 underline underline-offset-2"
            >
              Back to login
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
