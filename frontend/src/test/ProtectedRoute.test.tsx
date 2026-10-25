import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute, AdminRoute } from "../components/auth/ProtectedRoute";
import { AuthContext } from "../context/AuthContext";
import { describe, it, expect } from "vitest";

function renderWithAuth(
  ui: React.ReactElement,
  authValue: any,
  initialPath = "/protected"
) {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/" element={<div>Home Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Protected Secret</div>} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<div>Admin Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("Route Protection", () => {
  it("redirects unauthenticated user to /login", () => {
    renderWithAuth(
      <div />,
      {
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        token: null,
        login: async () => {},
        register: async () => {},
        logout: () => {},
      },
      "/protected"
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Secret")).not.toBeInTheDocument();
  });

  it("renders protected content when user is authenticated", () => {
    renderWithAuth(
      <div />,
      {
        isAuthenticated: true,
        isAdmin: false,
        user: { id: "1", email: "user@yourcar.com", role: "USER" },
        token: "jwt",
        login: async () => {},
        register: async () => {},
        logout: () => {},
      },
      "/protected"
    );

    expect(screen.getByText("Protected Secret")).toBeInTheDocument();
  });

  it("denies regular USER access to AdminRoute (redirects to /)", () => {
    renderWithAuth(
      <div />,
      {
        isAuthenticated: true,
        isAdmin: false,
        user: { id: "1", email: "user@yourcar.com", role: "USER" },
        token: "jwt",
        login: async () => {},
        register: async () => {},
        logout: () => {},
      },
      "/admin"
    );

    expect(screen.getByText("Home Page")).toBeInTheDocument();
    expect(screen.queryByText("Admin Dashboard")).not.toBeInTheDocument();
  });

  it("allows ADMIN access to AdminRoute", () => {
    renderWithAuth(
      <div />,
      {
        isAuthenticated: true,
        isAdmin: true,
        user: { id: "2", email: "admin@yourcar.com", role: "ADMIN" },
        token: "jwt",
        login: async () => {},
        register: async () => {},
        logout: () => {},
      },
      "/admin"
    );

    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
  });
});
