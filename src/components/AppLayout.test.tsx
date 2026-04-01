import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthContext, type AuthContextValue } from "../auth/auth-context";
import { AppLayout } from "./AppLayout";

function wrap(
  auth: AuthContextValue,
  initialEntry = "/incidents",
) {
  return (
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/incidents" element={<div />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

const baseAuth: AuthContextValue = {
  ready: true,
  authenticated: true,
  role: "admin",
  login: vi.fn(),
  logout: vi.fn(),
  refresh: vi.fn(),
};

describe("AppLayout", () => {
  afterEach(() => cleanup());

  it("hides team and log for user tier", () => {
    render(
      wrap({
        ...baseAuth,
        role: "user",
      }),
    );
    expect(screen.queryByRole("link", { name: /^Team$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^Log$/i })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /^Report$/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /^Help$/i }).length).toBeGreaterThan(0);
  });

  it("shows full nav for admin", () => {
    render(wrap(baseAuth));
    expect(screen.getAllByRole("link", { name: /^Team$/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /^Log$/i }).length).toBeGreaterThan(0);
  });
});
