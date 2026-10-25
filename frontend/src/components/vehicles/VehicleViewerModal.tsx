import { useEffect } from "react";
import { Vehicle } from "../../types";

interface VehicleViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onPurchase: (vehicle: Vehicle) => void;
}

export function VehicleViewerModal({
  isOpen,
  onClose,
  vehicle,
  onPurchase,
}: VehicleViewerModalProps) {
  useEffect(() => {
    // Dynamically lazy-load Google Model Viewer web component when modal opens
    if (isOpen && typeof window !== "undefined") {
      import("@google/model-viewer").catch((err) => {
        console.warn("Failed to load @google/model-viewer", err);
      });
    }
  }, [isOpen]);

  if (!isOpen || !vehicle) return null;

  const isUsed = vehicle.condition === "USED";
  const isOutOfStock = vehicle.quantity === 0;

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(vehicle.price));

  const purchaseButtonLabel = isOutOfStock
    ? isUsed
      ? "Sold out"
      : "Out of stock"
    : "Purchase";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-surface-card border border-white/10 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden text-white my-8 flex flex-col md:flex-row">
        {/* Left: 3D Viewer or 2D Fallback Stage */}
        <div className="flex-1 bg-surface-muted/60 relative min-h-[340px] md:min-h-[460px] flex flex-col items-center justify-center p-4">
          {vehicle.modelUrl ? (
            /* Interactive 3D Model Viewer */
            <div data-testid="3d-model-viewer" className="w-full h-full flex flex-col items-center justify-center">
              <model-viewer
                src={vehicle.modelUrl}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                camera-controls
                auto-rotate
                shadow-intensity="1"
                touch-action="pan-y"
                style={{ width: "100%", height: "380px" }}
              />
              <div className="absolute bottom-3 inset-x-4 flex justify-center">
                <span className="px-3 py-1 rounded-full bg-surface/80 backdrop-blur-md text-[11px] text-slate-300 border border-white/10 font-medium">
                  Click & drag to rotate 360° • Scroll to zoom
                </span>
              </div>
            </div>
          ) : (
            /* 2D High-Res Fallback Inspection View */
            <div
              data-testid="fallback-image-view"
              className="w-full h-full flex flex-col items-center justify-center text-center p-6"
            >
              {vehicle.imageUrl ? (
                <img
                  src={vehicle.imageUrl}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  className="max-h-[300px] w-auto rounded-xl object-contain shadow-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 py-12">
                  <svg className="w-20 h-20 opacity-30 stroke-current" fill="none" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9L2.1 11C1.4 11.2 1 11.8 1 12.5V16c0 .6.4 1 1 1h2m15 0a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm-15 0a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                  <span className="text-xs uppercase font-semibold mt-2 opacity-50">
                    2D Vehicle Studio
                  </span>
                </div>
              )}

              <div className="mt-4 px-3 py-1.5 rounded-xl bg-surface/80 border border-white/10 text-[11px] text-slate-400">
                3D model not available for this vehicle — displaying 2D photo inspection
              </div>
            </div>
          )}

          {/* Condition floating badge */}
          <div className="absolute top-4 left-4">
            {isUsed ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-accent text-surface font-display shadow-lg">
                Pre-owned
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-emerald-500 text-white font-display shadow-lg">
                NEW
              </span>
            )}
          </div>
        </div>

        {/* Right: Specifications & Purchase Sidebar */}
        <div className="w-full md:w-80 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10">
          <div>
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold font-display text-white">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {vehicle.category} • {vehicle.fuelType}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Direct Dealership Price
              </span>
              <div className="text-3xl font-extrabold text-white font-display mt-0.5">
                {formattedPrice}
              </div>
            </div>

            {/* Spec Sheet Table */}
            <div className="mt-6 space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Condition</span>
                <span className="font-semibold text-white">{vehicle.condition}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Inventory Status</span>
                <span className={`font-semibold ${isOutOfStock ? "text-red-400" : "text-emerald-400"}`}>
                  {isOutOfStock ? "Out of Stock" : `${vehicle.quantity} Available`}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Fuel Engine</span>
                <span className="font-semibold text-white">{vehicle.fuelType}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Body Class</span>
                <span className="font-semibold text-white">{vehicle.category}</span>
              </div>

              {isUsed && (
                <>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Verified Mileage</span>
                    <span className="font-semibold text-accent">
                      {vehicle.mileage?.toLocaleString()} mi
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Previous Owners</span>
                    <span className="font-semibold text-accent">
                      {vehicle.ownersCount} {vehicle.ownersCount === 1 ? "owner" : "owners"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-8 space-y-2">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => {
                onPurchase(vehicle);
                onClose();
              }}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider font-display shadow-lg transition-all ${
                isOutOfStock
                  ? "bg-surface-muted text-slate-500 border border-white/5 cursor-not-allowed"
                  : "bg-brand hover:bg-brand-light text-white shadow-brand/25 active:scale-95"
              }`}
            >
              {purchaseButtonLabel}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all text-center"
            >
              Close Inspection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
