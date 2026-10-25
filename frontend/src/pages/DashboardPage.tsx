import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import {
  getVehiclesApi,
  searchVehiclesApi,
  purchaseVehicleApi,
  restockVehicleApi,
  createVehicleApi,
  updateVehicleApi,
  deleteVehicleApi,
} from "../api/client";
import { Vehicle } from "../types";
import { VehicleCard } from "../components/vehicles/VehicleCard";
import { FilterBar, FilterState } from "../components/vehicles/FilterBar";
import { VehicleModal } from "../components/vehicles/VehicleModal";
import { RestockModal } from "../components/vehicles/RestockModal";
import { DeleteModal } from "../components/vehicles/DeleteModal";

const initialFilterState: FilterState = {
  search: "",
  condition: "ALL",
  category: "ALL",
  fuelType: "ALL",
  minPrice: "",
  maxPrice: "",
};

export function DashboardPage() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modal states
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [selectedVehicleForEdit, setSelectedVehicleForEdit] = useState<Vehicle | null>(null);

  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedVehicleForRestock, setSelectedVehicleForRestock] = useState<Vehicle | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVehicleForDelete, setSelectedVehicleForDelete] = useState<Vehicle | null>(null);

  // Determine if active search/filter queries exist
  const hasActiveFilters = useMemo(() => {
    return (
      Boolean(filters.search.trim()) ||
      filters.condition !== "ALL" ||
      filters.category !== "ALL" ||
      filters.fuelType !== "ALL" ||
      Boolean(filters.minPrice) ||
      Boolean(filters.maxPrice)
    );
  }, [filters]);

  // Construct search query parameters
  const searchParams = useMemo(() => {
    const params: Record<string, unknown> = {};
    if (filters.search.trim()) {
      params.make = filters.search.trim();
    }
    if (filters.condition !== "ALL") {
      params.condition = filters.condition;
    }
    if (filters.category !== "ALL") {
      params.category = filters.category;
    }
    if (filters.fuelType !== "ALL") {
      params.fuelType = filters.fuelType;
    }
    if (filters.minPrice) {
      params.minPrice = Number(filters.minPrice);
    }
    if (filters.maxPrice) {
      params.maxPrice = Number(filters.maxPrice);
    }
    return params;
  }, [filters]);

  // Query: fetch inventory
  const {
    data: vehicles = [],
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["vehicles", searchParams, hasActiveFilters],
    queryFn: () => {
      if (hasActiveFilters) {
        return searchVehiclesApi(searchParams);
      }
      return getVehiclesApi();
    },
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Mutations
  const purchaseMutation = useMutation({
    mutationFn: (id: string) => purchaseVehicleApi(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      showToast(`Successfully purchased ${updated.year} ${updated.make} ${updated.model}!`);
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message ?? "Purchase failed", "error");
    },
  });

  const restockMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity?: number }) =>
      restockVehicleApi(id, quantity),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      showToast(`Restocked ${updated.year} ${updated.make} ${updated.model}!`);
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message ?? "Restock failed", "error");
    },
  });

  const createOrUpdateMutation = useMutation({
    mutationFn: (data: Partial<Vehicle>) => {
      if (selectedVehicleForEdit) {
        return updateVehicleApi(selectedVehicleForEdit.id, data);
      }
      return createVehicleApi(data);
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      showToast(
        selectedVehicleForEdit
          ? `Updated ${saved.make} ${saved.model}!`
          : `Added ${saved.make} ${saved.model} to inventory!`
      );
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message ?? "Failed to save vehicle", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVehicleApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      showToast("Vehicle deleted from inventory.");
      setIsDeleteModalOpen(false);
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message ?? "Delete failed", "error");
    },
  });

  // Handlers
  const handlePurchase = (vehicle: Vehicle) => {
    purchaseMutation.mutate(vehicle.id);
  };

  const handleOpenAdd = () => {
    setSelectedVehicleForEdit(null);
    setIsVehicleModalOpen(true);
  };

  const handleOpenEdit = (vehicle: Vehicle) => {
    setSelectedVehicleForEdit(vehicle);
    setIsVehicleModalOpen(true);
  };

  const handleOpenRestock = (vehicle: Vehicle) => {
    setSelectedVehicleForRestock(vehicle);
    setIsRestockModalOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    const v = vehicles.find((x) => x.id === id) ?? null;
    setSelectedVehicleForDelete(v);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-3 border transition-all animate-bounce ${
            toast.type === "success"
              ? "bg-surface-card text-emerald-400 border-emerald-500/40"
              : "bg-surface-card text-brand-light border-brand/50"
          }`}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner & Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-white">
            Vehicle Inventory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, inspect, and purchase from our real-time dealership stock.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-light text-white text-xs font-bold font-display uppercase tracking-wider shadow-lg shadow-brand/25 transition-all flex items-center gap-2"
          >
            <span>+ Add Vehicle</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(initialFilterState)}
      />

      {/* Main Vehicle Grid / Loading / Error States */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-96 rounded-2xl bg-surface-card animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 rounded-2xl bg-surface-card border border-brand/30 text-center">
          <p className="text-brand-light font-semibold text-sm">
            Failed to load vehicles from dealership inventory.
          </p>
          <p className="text-slate-400 text-xs mt-1">
            {(queryError as any)?.message ?? "An error occurred."}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 rounded-xl bg-surface border border-white/10 text-xs text-white hover:bg-surface-muted"
          >
            Retry Connection
          </button>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface-card border border-white/5 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center text-slate-500 mb-3">
            🔍
          </div>
          <h3 className="text-lg font-bold text-white font-display">
            No matching vehicles found
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            We couldn't find any cars matching your current search and filter criteria. Try adjusting your parameters.
          </p>
          <button
            onClick={() => setFilters(initialFilterState)}
            className="mt-4 px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold font-display uppercase tracking-wider"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              isAdmin={isAdmin}
              onPurchase={handlePurchase}
              onEdit={handleOpenEdit}
              onRestock={handleOpenRestock}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      )}

      {/* Admin Modals */}
      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        onSubmit={async (data) => {
          await createOrUpdateMutation.mutateAsync(data);
        }}
        initialVehicle={selectedVehicleForEdit}
      />

      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        onRestock={async (id, qty) => {
          await restockMutation.mutateAsync({ id, quantity: qty });
        }}
        vehicle={selectedVehicleForRestock}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          if (selectedVehicleForDelete) {
            await deleteMutation.mutateAsync(selectedVehicleForDelete.id);
          }
        }}
        vehicle={selectedVehicleForDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
