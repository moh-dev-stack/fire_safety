import { describe, expect, it } from "vitest";
import { postLoginPath } from "./postLoginPath";

describe("postLoginPath", () => {
  it("sends user tier away from admin-only home to report", () => {
    expect(postLoginPath("/", "user")).toBe("/incidents");
    expect(postLoginPath("/incidents/log", "user")).toBe("/incidents");
    expect(postLoginPath("/help", "user")).toBe("/help");
    expect(postLoginPath("/training", "user")).toBe("/training");
  });

  it("preserves admin navigation targets", () => {
    expect(postLoginPath(undefined, "admin")).toBe("/");
    expect(postLoginPath("/incidents/log", "admin")).toBe("/incidents/log");
  });
});
