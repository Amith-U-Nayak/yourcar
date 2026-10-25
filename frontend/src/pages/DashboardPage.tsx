import { useAuth } from "../context/AuthContext";

export function DashboardPage() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-surface-card via-surface-muted to-surface-card p-8 border border-white/10 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/20 border border-brand/40 text-brand-light text-xs font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-brand-light animate-ping" />
            Live Dealership Inventory
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            Welcome back,{" "}
            <span className="text-brand-light">{user?.email?.split("@")[0]}</span>!
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base">
            "New or pre-owned, right on target." Explore our complete fleet of
            sedans, SUVs, trucks, and performance EVs.
          </p>
        </div>

        {/* Decorative background wheel graphic */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 opacity-10 pointer-events-none">
          <svg width="320" height="320" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="44" stroke="#FFFFFF" strokeWidth="6" />
            <circle cx="50" cy="50" r="14" fill="#FFB300" />
            <path
              d="M 22 22 Q 50 42 78 78"
              stroke="#FFFFFF"
              strokeWidth="6"
              strokeDasharray="6 3"
            />
            <path
              d="M 78 22 Q 50 58 22 78"
              stroke="#FFFFFF"
              strokeWidth="6"
              strokeDasharray="6 3"
            />
          </svg>
        </div>
      </div>

      {/* Quick Stats / Info Placeholder (populated in Phase 7) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-surface-card p-6 rounded-2xl border border-white/5 shadow-md">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Account Status
          </div>
          <div className="text-2xl font-bold text-white font-display mt-2 flex items-center gap-2">
            <span>{isAdmin ? "Admin Dealership" : "Verified Customer"}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAdmin
              ? "Full inventory write and restock access"
              : "Standard vehicle purchase privileges"}
          </p>
        </div>

        <div className="bg-surface-card p-6 rounded-2xl border border-white/5 shadow-md">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Catalogue
          </div>
          <div className="text-2xl font-bold text-white font-display mt-2">
            New & Pre-Owned
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Certified multi-point inspected fleet
          </p>
        </div>

        <div className="bg-surface-card p-6 rounded-2xl border border-white/5 shadow-md">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Interactive View
          </div>
          <div className="text-2xl font-bold text-accent font-display mt-2">
            3D Viewer Ready
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Inspect models with full 360° rotation
          </p>
        </div>
      </div>
    </div>
  );
}
