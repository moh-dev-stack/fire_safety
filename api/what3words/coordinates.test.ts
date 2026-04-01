import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../lib/auth.js", () => ({
  isAuthenticated: vi.fn(() => Promise.resolve(true)),
}));

describe("what3words coordinates handler (smoke)", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    process.env.W3W_API_KEY = "smoke-test-key";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.W3W_API_KEY;
    vi.resetModules();
  });

  it("reads lat/lng from URL when query is empty (Express-style request)", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          words: "filled.count.soak",
          nearestPlace: "Smoke Town",
          country: "GB",
        }),
    });

    const { default: handler } = await import("./coordinates.ts");
    const jsonMock = vi.fn();
    const statusMock = vi.fn(() => ({ json: jsonMock }));

    await handler(
      {
        method: "GET",
        headers: {},
        url: "/api/what3words/coordinates?lat=51.5208&lng=-0.1955",
        query: {},
      } as never,
      { status: statusMock } as never,
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("convert-to-3wa");
    expect(calledUrl).toContain(encodeURIComponent("51.5208"));
    expect(calledUrl).toContain(encodeURIComponent("-0.1955"));

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      words: "filled.count.soak",
      nearestPlace: "Smoke Town",
      country: "GB",
    });
  });

  it("maps what3words error message to 400", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      text: async () =>
        JSON.stringify({
          error: { code: "InvalidKey", message: "Authentication failed; invalid API key" },
        }),
    });

    const { default: handler } = await import("./coordinates.ts");
    const jsonMock = vi.fn();
    const statusMock = vi.fn(() => ({ json: jsonMock }));

    await handler(
      {
        method: "GET",
        headers: {},
        url: "/api/what3words/coordinates?lat=10&lng=20",
        query: {},
      } as never,
      { status: statusMock } as never,
    );

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "Authentication failed; invalid API key",
    });
  });
});
