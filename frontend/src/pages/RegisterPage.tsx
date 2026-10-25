import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/common/Logo";
import { Role } from "../types";

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("USER");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(email, password, role);
      navigate("/");
    } catch (err: any) {
      const message =
        err.response?.data?.message ??
        "Failed to register. Please check your details.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Logo size="large" />
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-white font-display">
          Create a new account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-medium text-brand-light hover:text-white transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-card py-8 px-4 shadow-xl border border-white/5 sm:rounded-2xl sm:px-10">
          {error && (
            <div
              data-testid="register-error"
              className="mb-6 p-4 rounded-xl bg-red-950/40 border border-brand/50 text-brand-light text-sm flex items-start gap-3"
            >
              <svg
                className="w-5 h-5 shrink-0 text-brand mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="reg-email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="amith@example.com"
                  className="block w-full rounded-xl border border-white/10 bg-surface px-4 py-3 text-white placeholder-slate-500 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Password (min 6 characters)
              </label>
              <div className="mt-2">
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-white/10 bg-surface px-4 py-3 text-white placeholder-slate-500 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="role-select"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Account Role
              </label>
              <div className="mt-2">
                <select
                  id="role-select"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="block w-full rounded-xl border border-white/10 bg-surface px-4 py-3 text-white shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand text-sm transition-all"
                >
                  <option value="USER">Customer (USER)</option>
                  <option value="ADMIN">Dealership Admin (ADMIN)</option>
                </select>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Admins have permissions to add, edit, delete, and restock vehicles.
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-brand/25 text-sm font-bold text-white bg-brand hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50 transition-all uppercase tracking-wider font-display"
              >
                {loading ? "Creating account..." : "Register"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
