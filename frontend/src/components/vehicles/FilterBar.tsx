import { Category, Condition, FuelType } from "../../types";

export interface FilterState {
  search: string;
  condition: "ALL" | Condition;
  category: "ALL" | Category;
  fuelType: "ALL" | FuelType;
  minPrice: string;
  maxPrice: string;
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (updated: FilterState) => void;
  onReset: () => void;
}

const CATEGORIES: Category[] = ["SUV", "SEDAN", "HATCHBACK", "COUPE", "TRUCK", "EV"];
const FUEL_TYPES: FuelType[] = ["PETROL", "DIESEL", "EV", "HYBRID"];

export function FilterBar({ filters, onChange, onReset }: FilterBarProps) {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, [e.target.name]: e.target.value });
  };

  const handleConditionChange = (condition: "ALL" | Condition) => {
    onChange({ ...filters, condition });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-surface-card rounded-2xl p-5 border border-white/5 shadow-xl space-y-4">
      {/* Top Search & Condition Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleTextChange}
            placeholder="Search make, model, e.g. Tesla, Camry..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
          />
        </div>

        {/* Condition Toggle Switch */}
        <div className="flex items-center p-1 rounded-xl bg-surface border border-white/10 shrink-0 w-full md:w-auto">
          <button
            type="button"
            onClick={() => handleConditionChange("ALL")}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold font-display uppercase tracking-wider transition-all ${
              filters.condition === "ALL"
                ? "bg-brand text-white shadow-md shadow-brand/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => handleConditionChange("NEW")}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold font-display uppercase tracking-wider transition-all ${
              filters.condition === "NEW"
                ? "bg-brand text-white shadow-md shadow-brand/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            New
          </button>
          <button
            type="button"
            onClick={() => handleConditionChange("USED")}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold font-display uppercase tracking-wider transition-all ${
              filters.condition === "USED"
                ? "bg-brand text-white shadow-md shadow-brand/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Pre-owned
          </button>
        </div>
      </div>

      {/* Secondary Filters: Category, Fuel, Price Range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-white/5">
        {/* Category Select */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Body Category
          </label>
          <select
            name="category"
            value={filters.category}
            onChange={handleSelectChange}
            className="w-full px-3 py-2 rounded-xl bg-surface border border-white/10 text-white text-xs focus:outline-none focus:border-brand transition-all"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Fuel Type Select */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Fuel Engine
          </label>
          <select
            name="fuelType"
            value={filters.fuelType}
            onChange={handleSelectChange}
            className="w-full px-3 py-2 rounded-xl bg-surface border border-white/10 text-white text-xs focus:outline-none focus:border-brand transition-all"
          >
            <option value="ALL">All Fuel Types</option>
            {FUEL_TYPES.map((ft) => (
              <option key={ft} value={ft}>
                {ft}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Min Price ($)
          </label>
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleTextChange}
            placeholder="e.g. 15000"
            className="w-full px-3 py-2 rounded-xl bg-surface border border-white/10 text-white text-xs focus:outline-none focus:border-brand transition-all"
          />
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Max Price ($)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleTextChange}
              placeholder="e.g. 50000"
              className="flex-1 px-3 py-2 rounded-xl bg-surface border border-white/10 text-white text-xs focus:outline-none focus:border-brand transition-all"
            />
            <button
              type="button"
              onClick={onReset}
              className="px-3 py-2 rounded-xl bg-surface hover:bg-surface-muted border border-white/10 text-slate-400 hover:text-white text-xs font-semibold transition-all shrink-0"
              title="Reset all filters"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
