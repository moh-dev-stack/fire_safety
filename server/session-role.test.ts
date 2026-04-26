/** jose signing uses Web Crypto; avoid jsdom test env for this file. */
// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";
import { createSessionToken, getSessionRoleFromToken } from "./lib/session.js";

beforeAll(() => {
  process.env.SESSION_SECRET = "test-secret-123456";
});

describe("session JWT role", () => {
  it("round-trips admin and user roles", async () => {
    const adminTok = await createSessionToken("admin");
    const userTok = await createSessionToken("user");
    expect(await getSessionRoleFromToken(adminTok)).toBe("admin");
    expect(await getSessionRoleFromToken(userTok)).toBe("user");
  });

  it("rejects tokens without a valid role claim", async () => {
    const { SignJWT } = await import("jose");
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET!);
    const bad = await new SignJWT({ auth: "jalsa-fire-safety" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);
    expect(await getSessionRoleFromToken(bad)).toBeNull();
  });
});
