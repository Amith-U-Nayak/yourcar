import { Vehicle } from "../../types";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  vehicle: Vehicle | null;
  loading?: boolean;
}

export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  vehicle,
  loading = false,
}: DeleteModalProps) {
  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface-card border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6 text-white">
        <h2 className="text-lg font-bold font-display text-red-400">
          Delete Vehicle from Inventory
        </h2>

        <p className="mt-3 text-sm text-slate-300">
          Are you sure you want to permanently delete{" "}
          <span className="font-semibold text-white">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </span>{" "}
          from the inventory?
        </p>
        <p className="mt-1 text-xs text-slate-500">
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-display uppercase tracking-wider shadow-lg shadow-red-600/30 disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Confirm Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
