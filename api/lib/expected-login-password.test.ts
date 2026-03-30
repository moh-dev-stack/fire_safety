import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOGIN_PASSWORD,
  expectedLoginPassword,
} from "./expected-login-password";

describe("expectedLoginPassword", () => {
  it("defaults to 1234 when AUTH_PASSWORD is absent", () => {
    expect(expectedLoginPassword({})).toBe(DEFAULT_LOGIN_PASSWORD);
  });

  it("defaults to 1234 when AUTH_PASSWORD is empty or whitespace-only", () => {
    expect(expectedLoginPassword({ AUTH_PASSWORD: "" })).toBe(
      DEFAULT_LOGIN_PASSWORD,
    );
    expect(expectedLoginPassword({ AUTH_PASSWORD: "   " })).toBe(
      DEFAULT_LOGIN_PASSWORD,
    );
  });

  it("uses non-empty AUTH_PASSWORD after trim", () => {
    expect(expectedLoginPassword({ AUTH_PASSWORD: "secret" })).toBe("secret");
    expect(expectedLoginPassword({ AUTH_PASSWORD: "  x  " })).toBe("x");
  });
});
