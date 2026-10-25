import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterBar, FilterState } from "../components/vehicles/FilterBar";
import { vi, describe, it, expect } from "vitest";

const initialFilters: FilterState = {
  search: "",
  condition: "ALL",
  category: "ALL",
  fuelType: "ALL",
  minPrice: "",
  maxPrice: "",
};

describe("FilterBar", () => {
  it("renders search input, condition toggles, and category selects", () => {
    render(<FilterBar filters={initialFilters} onChange={vi.fn()} onReset={vi.fn()} />);

    expect(screen.getByPlaceholderText(/search make, model/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^all$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^new$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^pre-owned$/i })).toBeInTheDocument();
  });

  it("calls onChange when search input is typed into", async () => {
    const onChange = vi.fn();
    render(<FilterBar filters={initialFilters} onChange={onChange} onReset={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText(/search make, model/i);
    await userEvent.type(searchInput, "Tesla");

    expect(onChange).toHaveBeenCalled();
  });

  it("calls onChange with updated condition when toggle is clicked", async () => {
    const onChange = vi.fn();
    render(<FilterBar filters={initialFilters} onChange={onChange} onReset={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: /^pre-owned$/i }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ condition: "USED" }));
  });

  it("calls onReset when Reset Filters button is clicked", async () => {
    const onReset = vi.fn();
    const activeFilters: FilterState = { ...initialFilters, search: "Toyota", condition: "USED" };

    render(<FilterBar filters={activeFilters} onChange={vi.fn()} onReset={onReset} />);

    await userEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect(onReset).toHaveBeenCalled();
  });
});
