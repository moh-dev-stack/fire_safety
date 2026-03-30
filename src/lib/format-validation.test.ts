import { describe, expect, it } from "vitest";
import { formatFlattenedZodError } from "./format-validation";

describe("formatFlattenedZodError", () => {
  it("joins form and field messages with field labels", () => {
    const text = formatFlattenedZodError({
      formErrors: ["Invalid payload"],
      fieldErrors: {
        location: ["Pick a location from the list"],
        incident_time: ["Pick a time from the list"],
      },
    });
    expect(text).toContain("Invalid payload");
    expect(text).toContain("Location on site: Pick a location from the list");
    expect(text).toContain("Time on site: Pick a time from the list");
  });
});
