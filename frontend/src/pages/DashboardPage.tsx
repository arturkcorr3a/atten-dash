import toast from "react-hot-toast";
import { useAuth } from "../context/useAuth";

export function DashboardPage() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("You have been signed out.");
    } catch {
      toast.error("Unable to sign out right now. Please try again.");
    }
  };

  return (
    <main className="p-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Welcome, {user?.email ?? "student"}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void handleSignOut();
          }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700"
        >
          Sign out
        </button>
      </header>
    </main>
  );
}
