import { describe, expect, it } from "vitest";
import { postLoginPath } from "./postLoginPath";

describe("postLoginPath", () => {
  it("sends user tier to home or allowed paths, not admin-only routes", () => {
    expect(postLoginPath("/", "user")).toBe("/");
    expect(postLoginPath("/incidents/log", "user")).toBe("/");
    expect(postLoginPath("/help", "user")).toBe("/help");
    expect(postLoginPath("/training", "user")).toBe("/training");
    expect(postLoginPath("/team", "user")).toBe("/");
  });

  it("preserves admin navigation targets", () => {
    expect(postLoginPath(undefined, "admin")).toBe("/");
    expect(postLoginPath("/incidents/log", "admin")).toBe("/incidents/log");
  });
});
