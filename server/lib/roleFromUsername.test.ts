import { describe, expect, it } from "vitest";
import { roleFromUsername } from "./roleFromUsername.js";

describe("roleFromUsername", () => {
  it.each([
    ["user", "user"],
    ["User", "user"],
    ["USER", "user"],
    ["uSeR", "user"],
    ["  user  ", "user"],
    ["\tuser\n", "user"],
  ])("maps %j to user", (input, expected) => {
    expect(roleFromUsername(input)).toBe(expected);
  });

  it.each([
    ["admin", "admin"],
    ["Admin", "admin"],
    ["ADMIN", "admin"],
    ["aDmIn", "admin"],
    ["  admin  ", "admin"],
  ])("maps %j to admin", (input, expected) => {
    expect(roleFromUsername(input)).toBe(expected);
  });

  it("rejects unknown usernames", () => {
    expect(roleFromUsername("root")).toBeNull();
    expect(roleFromUsername("")).toBeNull();
    expect(roleFromUsername("   ")).toBeNull();
    expect(roleFromUsername("superuser")).toBeNull();
    expect(roleFromUsername("administrator")).toBeNull();
  });
});
