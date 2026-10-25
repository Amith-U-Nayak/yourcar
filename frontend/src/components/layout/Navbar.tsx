import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Logo } from "../common/Logo";

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-card bg-surface/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Logo />

        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Inventory
              </Link>

              {/* User badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-card border border-white/10 text-xs">
                <span className="text-slate-300 max-w-[140px] truncate">
                  {user?.email}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                    isAdmin
                      ? "bg-accent/20 text-accent border border-accent/40"
                      : "bg-brand/20 text-brand-light border border-brand/40"
                  }`}
                >
                  {user?.role}
                </span>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-card border border-transparent hover:border-white/10 transition-all"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold px-4 py-2 rounded-lg bg-brand hover:bg-brand-light text-white shadow-md shadow-brand/20 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
