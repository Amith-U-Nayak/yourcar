import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "../context/AuthContext";
import * as api from "../api/client";
import { Role, User } from "../types";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock API client
vi.mock("../api/client", () => ({
  loginApi: vi.fn(),
  registerApi: vi.fn(),
}));

function TestConsumer() {
  const { user, isAuthenticated, isAdmin, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? "authenticated" : "guest"}</div>
      <div data-testid="is-admin">{isAdmin ? "yes" : "no"}</div>
      <div data-testid="user-email">{user?.email ?? "none"}</div>
      <div data-testid="user-role">{user?.role ?? "none"}</div>
      <button onClick={() => login("test@yourcar.com", "password123")}>Do Login</button>
      <button onClick={logout}>Do Logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("provides initial guest state when localStorage is empty", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("auth-status")).toHaveTextContent("guest");
    expect(screen.getByTestId("is-admin")).toHaveTextContent("no");
    expect(screen.getByTestId("user-email")).toHaveTextContent("none");
  });

  it("hydrates auth state from localStorage if valid session exists", () => {
    const mockUser: User = { id: "123", email: "admin@yourcar.com", role: "ADMIN" as Role };
    localStorage.setItem("yourcar_token", "fake-jwt-token");
    localStorage.setItem("yourcar_user", JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("auth-status")).toHaveTextContent("authenticated");
    expect(screen.getByTestId("is-admin")).toHaveTextContent("yes");
    expect(screen.getByTestId("user-email")).toHaveTextContent("admin@yourcar.com");
  });

  it("updates state and localStorage on successful login", async () => {
    const mockUser: User = { id: "u-1", email: "test@yourcar.com", role: "USER" as Role };
    vi.mocked(api.loginApi).mockResolvedValueOnce({
      token: "new-jwt-token",
      user: mockUser,
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      await userEvent.click(screen.getByText("Do Login"));
    });

    expect(screen.getByTestId("auth-status")).toHaveTextContent("authenticated");
    expect(screen.getByTestId("user-email")).toHaveTextContent("test@yourcar.com");
    expect(localStorage.getItem("yourcar_token")).toBe("new-jwt-token");
  });

  it("clears user and token from state and localStorage on logout", async () => {
    const mockUser = { id: "u-1", email: "test@yourcar.com", role: "USER" };
    localStorage.setItem("yourcar_token", "existing-token");
    localStorage.setItem("yourcar_user", JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("auth-status")).toHaveTextContent("authenticated");

    await act(async () => {
      await userEvent.click(screen.getByText("Do Logout"));
    });

    expect(screen.getByTestId("auth-status")).toHaveTextContent("guest");
    expect(localStorage.getItem("yourcar_token")).toBeNull();
    expect(localStorage.getItem("yourcar_user")).toBeNull();
  });
});
