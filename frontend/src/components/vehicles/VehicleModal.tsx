import React, { useState, useEffect } from "react";
import { Vehicle, Category, Condition, FuelType } from "../../types";

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Vehicle>) => Promise<void>;
  initialVehicle?: Vehicle | null;
}

const CATEGORIES: Category[] = ["SUV", "SEDAN", "HATCHBACK", "COUPE", "TRUCK", "EV"];
const FUEL_TYPES: FuelType[] = ["PETROL", "DIESEL", "EV", "HYBRID"];

export function VehicleModal({
  isOpen,
  onClose,
  onSubmit,
  initialVehicle,
}: VehicleModalProps) {
  const isEdit = Boolean(initialVehicle);

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState<Category>("SEDAN");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [condition, setCondition] = useState<Condition>("NEW");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [fuelType, setFuelType] = useState<FuelType>("PETROL");
  const [imageUrl, setImageUrl] = useState("");
  const [modelUrl, setModelUrl] = useState("");
  const [mileage, setMileage] = useState("");
  const [ownersCount, setOwnersCount] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialVehicle) {
      setMake(initialVehicle.make);
      setModel(initialVehicle.model);
      setCategory(initialVehicle.category);
      setPrice(String(initialVehicle.price));
      setQuantity(String(initialVehicle.quantity));
      setCondition(initialVehicle.condition);
      setYear(String(initialVehicle.year));
      setFuelType(initialVehicle.fuelType);
      setImageUrl(initialVehicle.imageUrl ?? "");
      setModelUrl(initialVehicle.modelUrl ?? "");
      setMileage(initialVehicle.mileage !== null && initialVehicle.mileage !== undefined ? String(initialVehicle.mileage) : "");
      setOwnersCount(initialVehicle.ownersCount !== null && initialVehicle.ownersCount !== undefined ? String(initialVehicle.ownersCount) : "1");
    } else {
      setMake("");
      setModel("");
      setCategory("SEDAN");
      setPrice("");
      setQuantity("1");
      setCondition("NEW");
      setYear(String(new Date().getFullYear()));
      setFuelType("PETROL");
      setImageUrl("");
      setModelUrl("");
      setMileage("");
      setOwnersCount("1");
    }
    setError(null);
  }, [initialVehicle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Domain validation
    const numPrice = Number(price);
    const numQty = Number(quantity);
    const numYear = Number(year);

    if (numPrice <= 0) {
      setError("Price must be a positive number");
      return;
    }

    if (condition === "USED") {
      if (numQty > 1) {
        setError("Quantity for used vehicles must be 0 or 1");
        return;
      }
      if (!mileage || Number(mileage) < 0) {
        setError("Mileage is required for used vehicles");
        return;
      }
      if (!ownersCount || Number(ownersCount) < 0) {
        setError("Owners count is required for used vehicles");
        return;
      }
    }

    setLoading(true);
    try {
      const payload: Partial<Vehicle> = {
        make,
        model,
        category,
        price: numPrice,
        quantity: numQty,
        condition,
        year: numYear,
        fuelType,
        imageUrl: imageUrl.trim() || null,
        modelUrl: modelUrl.trim() || null,
        mileage: condition === "USED" ? Number(mileage) : null,
        ownersCount: condition === "USED" ? Number(ownersCount) : null,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to save vehicle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface-card border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl p-6 sm:p-8 my-8 text-white">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h2 className="text-xl font-bold font-display">
            {isEdit ? "Edit Vehicle" : "Add Vehicle to Inventory"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-brand/50 text-brand-light text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Condition toggle (New vs Used) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Condition *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCondition("NEW");
                  if (Number(quantity) === 0) setQuantity("1");
                }}
                className={`py-2 px-4 rounded-xl text-xs font-bold font-display uppercase tracking-wider border transition-all ${
                  condition === "NEW"
                    ? "bg-brand text-white border-brand shadow-md shadow-brand/20"
                    : "bg-surface border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                New Vehicle
              </button>
              <button
                type="button"
                onClick={() => {
                  setCondition("USED");
                  setQuantity("1");
                }}
                className={`py-2 px-4 rounded-xl text-xs font-bold font-display uppercase tracking-wider border transition-all ${
                  condition === "USED"
                    ? "bg-accent text-surface border-accent shadow-md shadow-accent/20"
                    : "bg-surface border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                Pre-Owned (Used)
              </button>
            </div>
          </div>

          {/* Make & Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Make *
              </label>
              <input
                type="text"
                required
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="e.g. Tesla, Toyota"
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-white/10 text-sm focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Model *
              </label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Model 3, Camry"
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-white/10 text-sm focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          {/* Year, Category, Fuel Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Year *
              </label>
              <input
                type="number"
                required
                min={1900}
                max={new Date().getFullYear() + 1}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-white/10 text-sm focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-white/10 text-sm focus:border-brand focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Fuel Type *
              </label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-white/10 text-sm focus:border-brand focus:outline-none"
              >
                {FUEL_TYPES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Price ($ USD) *
              </label>
              <input
                type="number"
                required
                min={1}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 35000"
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-white/10 text-sm focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Stock Quantity * {condition === "USED" && "(0 or 1 for Used)"}
              </label>
              <input
                type="number"
                required
                min={0}
                max={condition === "USED" ? 1 : undefined}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-white/10 text-sm focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          {/* Used Car Specifics: Mileage and Owners Count */}
          {condition === "USED" && (
            <div className="p-4 rounded-xl bg-surface border border-accent/20 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-accent uppercase tracking-wider mb-1">
                  Mileage (miles) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  placeholder="e.g. 42000"
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-card border border-white/10 text-sm focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-accent uppercase tracking-wider mb-1">
                  Previous Owners Count *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={ownersCount}
                  onChange={(e) => setOwnersCount(e.target.value)}
                  placeholder="e.g. 1"
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-card border border-white/10 text-sm focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Optional Media URLs */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Photo URL (Optional)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl bg-surface border border-white/10 text-xs focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                3D Model GLB URL (Optional for 3D View)
              </label>
              <input
                type="url"
                value={modelUrl}
                onChange={(e) => setModelUrl(e.target.value)}
                placeholder="https://example.com/car.glb"
                className="w-full px-3 py-2 rounded-xl bg-surface border border-white/10 text-xs focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-surface transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-brand hover:bg-brand-light text-white text-xs font-bold font-display uppercase tracking-wider shadow-lg shadow-brand/20 disabled:opacity-50 transition-all"
            >
              {loading ? "Saving..." : isEdit ? "Update Vehicle" : "Add to Fleet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
