import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VehicleViewerModal } from "../components/vehicles/VehicleViewerModal";
import { Vehicle } from "../types";
import { vi, describe, it, expect } from "vitest";

const mock3DVehicle: Vehicle = {
  id: "v-3d-1",
  make: "Tesla",
  model: "Model 3",
  category: "EV",
  price: 45000,
  quantity: 3,
  condition: "NEW",
  year: 2024,
  fuelType: "EV",
  imageUrl: "https://example.com/car.jpg",
  modelUrl: "/models/sample-car.glb",
};

const mockNo3DVehicle: Vehicle = {
  id: "v-no-3d",
  make: "Toyota",
  model: "Camry",
  category: "SEDAN",
  price: 22000,
  quantity: 0,
  condition: "USED",
  year: 2020,
  fuelType: "PETROL",
  imageUrl: "https://example.com/camry.jpg",
  modelUrl: null,
  mileage: 40000,
  ownersCount: 1,
};

describe("VehicleViewerModal", () => {
  it("does not render when isOpen is false", () => {
    const { container } = render(
      <VehicleViewerModal
        isOpen={false}
        onClose={vi.fn()}
        vehicle={mock3DVehicle}
        onPurchase={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders 3D interactive viewer with instructions when modelUrl is provided", () => {
    render(
      <VehicleViewerModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={mock3DVehicle}
        onPurchase={vi.fn()}
      />
    );

    expect(screen.getByText("2024 Tesla Model 3")).toBeInTheDocument();
    expect(screen.getByText(/360°/i)).toBeInTheDocument();
    expect(screen.getByTestId("3d-model-viewer")).toBeInTheDocument();
  });

  it("renders fallback image and badge when modelUrl is missing", () => {
    render(
      <VehicleViewerModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={mockNo3DVehicle}
        onPurchase={vi.fn()}
      />
    );

    expect(screen.getByText("2020 Toyota Camry")).toBeInTheDocument();
    expect(screen.getByText(/3d model not available/i)).toBeInTheDocument();
    expect(screen.getByTestId("fallback-image-view")).toBeInTheDocument();
  });

  it("renders full vehicle specs sheet (mileage, owners, fuelType, price)", () => {
    render(
      <VehicleViewerModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={mockNo3DVehicle}
        onPurchase={vi.fn()}
      />
    );

    expect(screen.getByText("$22,000")).toBeInTheDocument();
    expect(screen.getByText(/40,000 mi/i)).toBeInTheDocument();
    expect(screen.getByText(/1 owner/i)).toBeInTheDocument();
  });

  it("disables purchase button when vehicle is out of stock / sold out", () => {
    render(
      <VehicleViewerModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={mockNo3DVehicle}
        onPurchase={vi.fn()}
      />
    );

    const btn = screen.getByRole("button", { name: /sold out/i });
    expect(btn).toBeDisabled();
  });

  it("triggers onPurchase when in-stock vehicle is purchased from modal", async () => {
    const onPurchase = vi.fn();
    render(
      <VehicleViewerModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={mock3DVehicle}
        onPurchase={onPurchase}
      />
    );

    const btn = screen.getByRole("button", { name: /purchase/i });
    expect(btn).toBeEnabled();

    await userEvent.click(btn);
    expect(onPurchase).toHaveBeenCalledWith(mock3DVehicle);
  });
});
