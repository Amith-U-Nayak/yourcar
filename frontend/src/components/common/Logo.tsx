import { Link } from "react-router-dom";

export function Logo({ showTagline = true, size = "default" }: { showTagline?: boolean; size?: "small" | "default" | "large" }) {
  const isLarge = size === "large";
  const isSmall = size === "small";

  return (
    <Link to="/" className="flex items-center gap-3 group text-decoration-none">
      {/* Cricket-ball-as-wheel Brand Mark */}
      <div
        className={`relative rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-brand/30 transition-transform group-hover:rotate-12 duration-300 ${
          isLarge ? "w-14 h-14" : isSmall ? "w-8 h-8" : "w-10 h-10"
        } bg-gradient-to-br from-brand-light via-brand to-brand-dark border-2 border-white/20`}
        aria-label="Yourcar logo"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-1.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Wheel rim */}
          <circle cx="50" cy="50" r="44" stroke="#FFFFFF" strokeWidth="3" opacity="0.4" />
          {/* Central hub */}
          <circle cx="50" cy="50" r="10" fill="#FFB300" />
          {/* Cricket ball primary seam with stitch dash */}
          <path
            d="M 22 22 Q 50 42 78 78"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeDasharray="4 2.5"
            strokeLinecap="round"
          />
          {/* Cricket ball reverse seam */}
          <path
            d="M 78 22 Q 50 58 22 78"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeDasharray="4 2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-baseline">
          <span
            className={`font-display font-bold tracking-tight text-white ${
              isLarge ? "text-3xl" : isSmall ? "text-lg" : "text-2xl"
            }`}
          >
            Your<span className="text-brand-light">car</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-accent ml-1 animate-pulse" />
        </div>

        {showTagline && (
          <span className="text-[10px] tracking-wider uppercase text-slate-400 font-medium">
            New or pre-owned, right on target.
          </span>
        )}
      </div>
    </Link>
  );
}
