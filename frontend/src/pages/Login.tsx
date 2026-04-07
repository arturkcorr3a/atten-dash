import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

interface LoginFormState {
  email: string;
  password: string;
}

const INITIAL_FORM_STATE: LoginFormState = {
  email: "",
  password: "",
};

export function Login() {
  const navigate = useNavigate();
  const [formState, setFormState] =
    useState<LoginFormState>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formState.email.trim(),
        password: formState.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Welcome back to AttenDash!");
      await navigate("/dashboard", { replace: true });
    } catch {
      toast.error("Unable to login right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Login</h1>
        <p className="mt-2 text-sm text-slate-600">
          Access your attendance dashboard.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400"
              placeholder="student@example.com"
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formState.password}
              onChange={(event) => {
                setFormState((previousState) => ({
                  ...previousState,
                  password: event.target.value,
                }));
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400"
              placeholder="••••••••"
            />
          </div>

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-slate-700 underline underline-offset-2"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-slate-900 underline underline-offset-2"
            >
              Create one
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
