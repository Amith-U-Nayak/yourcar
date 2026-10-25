import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VehicleCard } from "../components/vehicles/VehicleCard";
import { Vehicle } from "../types";
import { vi, describe, it, expect } from "vitest";

const mockNewVehicle: Vehicle = {
  id: "v-new-1",
  make: "Tesla",
  model: "Model 3",
  category: "EV",
  price: 45000,
  quantity: 5,
  condition: "NEW",
  year: 2024,
  fuelType: "EV",
  imageUrl: "https://example.com/car.jpg",
};

const mockUsedVehicle: Vehicle = {
  id: "v-used-1",
  make: "Toyota",
  model: "Camry",
  category: "SEDAN",
  price: 22000,
  quantity: 1,
  condition: "USED",
  year: 2020,
  fuelType: "PETROL",
  mileage: 38500,
  ownersCount: 2,
};

describe("VehicleCard", () => {
  it("renders vehicle make, model, year, category, and formatted price", () => {
    render(<VehicleCard vehicle={mockNewVehicle} onPurchase={vi.fn()} />);

    expect(screen.getByText("2024 Tesla Model 3")).toBeInTheDocument();
    expect(screen.getByText("$45,000")).toBeInTheDocument();
    expect(screen.getByText("EV")).toBeInTheDocument();
  });

  it("renders 'NEW' badge and stock count for a new vehicle", () => {
    render(<VehicleCard vehicle={mockNewVehicle} onPurchase={vi.fn()} />);

    expect(screen.getByText("NEW")).toBeInTheDocument();
    expect(screen.getByText(/5 in stock/i)).toBeInTheDocument();
  });

  it("renders 'Pre-owned' badge with mileage and owner count for a used vehicle", () => {
    render(<VehicleCard vehicle={mockUsedVehicle} onPurchase={vi.fn()} />);

    expect(screen.getByText(/pre-owned/i)).toBeInTheDocument();
    expect(screen.getByText(/38,500 mi/i)).toBeInTheDocument();
    expect(screen.getByText(/2 owners/i)).toBeInTheDocument();
  });

  it("disables purchase button with 'Out of stock' when a NEW car has quantity 0", () => {
    const outOfStockNew: Vehicle = { ...mockNewVehicle, quantity: 0 };
    render(<VehicleCard vehicle={outOfStockNew} onPurchase={vi.fn()} />);

    const button = screen.getByRole("button", { name: /out of stock/i });
    expect(button).toBeDisabled();
  });

  it("disables purchase button with 'Sold out' when a USED car has quantity 0", () => {
    const soldUsed: Vehicle = { ...mockUsedVehicle, quantity: 0 };
    render(<VehicleCard vehicle={soldUsed} onPurchase={vi.fn()} />);

    const button = screen.getByRole("button", { name: /sold out/i });
    expect(button).toBeDisabled();
  });

  it("enables purchase button and triggers onPurchase when in stock", async () => {
    const onPurchase = vi.fn();
    render(<VehicleCard vehicle={mockNewVehicle} onPurchase={onPurchase} />);

    const button = screen.getByRole("button", { name: /purchase/i });
    expect(button).toBeEnabled();

    await userEvent.click(button);
    expect(onPurchase).toHaveBeenCalledWith(mockNewVehicle);
  });

  it("shows Admin action buttons (Edit, Restock, Delete) only when isAdmin is true", () => {
    const { rerender } = render(
      <VehicleCard
        vehicle={mockNewVehicle}
        isAdmin={false}
        onPurchase={vi.fn()}
        onEdit={vi.fn()}
        onRestock={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /restock/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();

    rerender(
      <VehicleCard
        vehicle={mockNewVehicle}
        isAdmin={true}
        onPurchase={vi.fn()}
        onEdit={vi.fn()}
        onRestock={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /restock/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });
});
