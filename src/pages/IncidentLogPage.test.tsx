import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { IncidentRow } from "../model/incident";
import { IncidentLogPage } from "./IncidentLogPage";

describe("IncidentLogPage", () => {
  const fetchMock = vi.fn();

  const sampleRows: IncidentRow[] = [
    {
      id: 1,
      created_at: "2026-07-24T12:00:00.000Z",
      incident_date: "2026-07-24",
      incident_time: "10:30",
      incident_type: "Other",
      severity: "Medium",
      location: "Entrance / Gate A",
      description: "Smoke near tent.",
      actions_taken: "Cleared.",
      reporter_name: "Patrol",
      reporter_contact: null,
      department: "Patrol north",
      incident_w3w: "filled.count.soak",
      image_urls: [
        "https://ex.public.blob.vercel-storage.com/unique-segment-a/photo1.png",
        "https://ex.public.blob.vercel-storage.com/unique-segment-b/photo2.png",
      ],
    },
  ];

  beforeEach(() => {
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("/api/incidents") && !url.includes("export")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(sampleRows),
        } as Response);
      }
      return Promise.reject(new Error(`unexpected fetch ${url}`));
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows a photos region and enlarge buttons when image_urls are set", async () => {
    render(
      <MemoryRouter>
        <IncidentLogPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole("region", { name: /incident #1 photos/i })).toBeInTheDocument();
    });

    const enlarge = screen.getAllByRole("button", { name: /enlarge incident #1 photo/i });
    expect(enlarge).toHaveLength(2);
  });

  it("opens a lightbox and returns with Back to log", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <IncidentLogPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole("region", { name: /incident #1 photos/i })).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", { name: /enlarge incident #1 photo 1/i }),
    );

    expect(screen.getByRole("dialog", { name: /incident #1 photo 1/i })).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /incident #1 photo 1/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /back to log/i }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("filters rows when search matches a substring of an image URL", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <IncidentLogPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Smoke near tent/i)).toBeInTheDocument();
    });

    const search = screen.getByPlaceholderText(
      /Text in description, location, reporter/i,
    );
    await user.type(search, "unique-segment-b");

    await waitFor(() => {
      expect(screen.getByText(/Smoke near tent/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/No incidents match/i)).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "does-not-exist-in-urls");

    await waitFor(() => {
      expect(screen.getByText(/No incidents match/i)).toBeInTheDocument();
    });
  });
});
