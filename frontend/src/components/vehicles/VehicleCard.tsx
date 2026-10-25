import { useState } from "react";
import { Vehicle } from "../../types";

interface VehicleCardProps {
  vehicle: Vehicle;
  isAdmin?: boolean;
  onPurchase: (vehicle: Vehicle) => void;
  onEdit?: (vehicle: Vehicle) => void;
  onRestock?: (vehicle: Vehicle) => void;
  onDelete?: (id: string) => void;
  onViewDetails?: (vehicle: Vehicle) => void;
}

export function VehicleCard({
  vehicle,
  isAdmin = false,
  onPurchase,
  onEdit,
  onRestock,
  onDelete,
  onViewDetails,
}: VehicleCardProps) {
  const [imgError, setImgError] = useState(false);
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
    <div className="group rounded-2xl bg-surface-card border border-white/5 hover:border-brand/40 shadow-xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-brand/10 hover:-translate-y-1">
      {/* Vehicle Media Header */}
      <div className="relative aspect-[16/10] bg-surface-muted/60 overflow-hidden flex items-center justify-center">
        {vehicle.imageUrl && !imgError ? (
          <img
            src={vehicle.imageUrl}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          /* Sleek automotive placeholder */
          <div className="flex flex-col items-center justify-center p-6 text-slate-500">
            <svg
              className="w-16 h-16 stroke-current opacity-40 group-hover:text-brand-light transition-colors"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9L2.1 11C1.4 11.2 1 11.8 1 12.5V16c0 .6.4 1 1 1h2m15 0a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm-15 0a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <span className="text-xs uppercase tracking-wider font-semibold mt-2 opacity-50">
              {vehicle.make}
            </span>
          </div>
        )}

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {/* Condition Badge */}
          {isUsed ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-accent/90 text-surface font-display shadow-md">
              Pre-owned
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500 text-white font-display shadow-md">
              NEW
            </span>
          )}

          {/* 3D Model Badge */}
          {vehicle.modelUrl && (
            <span className="px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-brand/90 text-white shadow-md flex items-center gap-1">
              <span>3D</span>
            </span>
          )}
        </div>

        {/* Category Pill */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface/80 backdrop-blur-md text-slate-300 border border-white/10">
            {vehicle.category}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title and Specs */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display font-bold text-lg text-white group-hover:text-brand-light transition-colors">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {vehicle.fuelType} • {vehicle.category}
              </p>
            </div>
            <div className="text-right">
              <span className="font-display font-extrabold text-xl text-white">
                {formattedPrice}
              </span>
            </div>
          </div>

          {/* Used Specific Stats or New Stock Status */}
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
            {isUsed ? (
              <div className="flex items-center gap-3 text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="font-semibold text-slate-200">
                    {vehicle.mileage?.toLocaleString()} mi
                  </span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="font-semibold text-slate-200">
                    {vehicle.ownersCount} {vehicle.ownersCount === 1 ? "owner" : "owners"}
                  </span>
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-400">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOutOfStock ? "bg-red-500" : "bg-emerald-400"
                  }`}
                />
                <span className="font-medium text-slate-300">
                  {isOutOfStock ? "0 in stock" : `${vehicle.quantity} in stock`}
                </span>
              </div>
            )}

            {/* Quick 3D view trigger if available */}
            {onViewDetails && (
              <button
                type="button"
                onClick={() => onViewDetails(vehicle)}
                className="text-[11px] font-semibold text-accent hover:text-accent-light transition-colors"
              >
                {vehicle.modelUrl ? "Inspect 3D →" : "View Details →"}
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="mt-5 space-y-2">
          {/* Purchase Button */}
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => onPurchase(vehicle)}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider font-display shadow-md transition-all ${
              isOutOfStock
                ? "bg-surface-muted text-slate-500 border border-white/5 cursor-not-allowed"
                : "bg-brand hover:bg-brand-light text-white shadow-brand/25 active:scale-95"
            }`}
          >
            {purchaseButtonLabel}
          </button>

          {/* Admin Operations Bar */}
          {isAdmin && (
            <div className="pt-2 flex items-center gap-2">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(vehicle)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-surface hover:bg-surface-muted text-slate-300 hover:text-white border border-white/10 text-[11px] font-semibold transition-all"
                >
                  Edit
                </button>
              )}
              {onRestock && (
                <button
                  type="button"
                  onClick={() => onRestock(vehicle)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-surface hover:bg-surface-muted text-accent border border-accent/20 text-[11px] font-semibold transition-all"
                >
                  Restock
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(vehicle.id)}
                  className="py-1.5 px-2.5 rounded-lg bg-surface hover:bg-red-950/40 text-red-400 border border-red-500/20 text-[11px] font-semibold transition-all"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
