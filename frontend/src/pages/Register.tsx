import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";

interface RegisterFormState {
  email: string;
  password: string;
  confirmPassword: string;
}

const INITIAL_REGISTER_FORM_STATE: RegisterFormState = {
  email: "",
  password: "",
  confirmPassword: "",
};

export function Register() {
  const [formState, setFormState] = useState<RegisterFormState>(
    INITIAL_REGISTER_FORM_STATE,
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
      const { error } = await supabase.auth.signUp({
        email: formState.email.trim(),
        password: formState.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setFormState(INITIAL_REGISTER_FORM_STATE);
      toast.success(
        "Registration successful! Please check your email to confirm your account.",
      );
    } catch {
      toast.error("Unable to register right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Create account
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Start tracking your subjects and attendance.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="register-email"
            >
              Email
            </label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              required
              value={formState.email}
              onChange={(event) => {
                setFormState((previousState) => ({
                  ...previousState,
                  email: event.target.value,
                }));
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
              placeholder="student@example.com"
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="register-password"
            >
              Password
            </label>
            <input
              id="register-password"
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="register-confirm-password"
            >
              Confirm password
            </label>
            <input
              id="register-confirm-password"
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
              placeholder="Repeat password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating..." : "Create account"}
          </button>

          <p className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-slate-900 underline underline-offset-2"
            >
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
