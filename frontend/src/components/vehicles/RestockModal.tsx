import React, { useState } from "react";
import { Vehicle } from "../../types";

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestock: (vehicleId: string, quantity: number) => Promise<void>;
  vehicle: Vehicle | null;
}

export function RestockModal({
  isOpen,
  onClose,
  onRestock,
  vehicle,
}: RestockModalProps) {
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !vehicle) return null;

  const isUsed = vehicle.condition === "USED";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const numQty = isUsed ? 1 : Number(quantity);
      await onRestock(vehicle.id, numQty);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to restock vehicle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface-card border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6 text-white">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h2 className="text-lg font-bold font-display">
            {isUsed ? "Relist Used Vehicle" : "Restock Vehicle Stock"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        <p className="mt-3 text-sm text-slate-300">
          Vehicle: <span className="font-semibold text-white">{vehicle.year} {vehicle.make} {vehicle.model}</span>
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          Current Stock: <span className="text-white font-bold">{vehicle.quantity}</span> unit(s)
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-brand/50 text-brand-light text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {isUsed ? (
            <div className="p-3.5 rounded-xl bg-surface border border-accent/20 text-xs text-slate-300">
              <span className="font-semibold text-accent">Used vehicle relisting:</span> This action will relist this unique vehicle back into active inventory with a stock quantity of 1.
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Units to add to inventory *
              </label>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-white/10 text-sm focus:border-brand focus:outline-none"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-accent hover:bg-accent-light text-surface text-xs font-bold font-display uppercase tracking-wider shadow-lg shadow-accent/20 disabled:opacity-50"
            >
              {loading ? "Processing..." : isUsed ? "Relist (Set Qty 1)" : `Add +${quantity} Units`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
