import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SITE_LOCATIONS } from "../model/incident";
import { ReportIncidentPage } from "./ReportIncidentPage";

function renderReport() {
  return render(
    <MemoryRouter>
      <ReportIncidentPage />
    </MemoryRouter>,
  );
}

describe("ReportIncidentPage", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    fetchMock.mockImplementation(
      (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? input : input.toString();
        if (url.includes("/api/incidents/draft")) {
          if (init?.method === "PUT" || init?.method === "DELETE") {
            return Promise.resolve({ ok: true, status: 204 } as Response);
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ draft: null }),
          } as Response);
        }
        if (url.includes("/api/incidents") && init?.method === "POST") {
          const body = JSON.parse(init.body as string);
          expect(body).toEqual({
            incident_date: "2026-07-24",
            incident_time: "10:30",
            incident_type: "Other",
            severity: "Medium",
            location: "Entrance / Gate A",
            description: "Smoke near catering tent.",
            actions_taken: "Area cleared.",
            reporter_name: "Sam Duty",
          });
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                id: 42,
                created_at: new Date().toISOString(),
                image_urls: [],
              }),
          });
        }
        return Promise.reject(
          new Error(`unexpected fetch ${url} ${init?.method ?? "GET"}`),
        );
      },
    );
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("submits a valid report and calls POST /api/incidents", async () => {
    const user = userEvent.setup();
    renderReport();

    await user.selectOptions(
      screen.getByLabelText(/Incident date \(Jalsa days\)/i),
      "2026-07-24",
    );
    await user.selectOptions(
      screen.getByLabelText(/^Time on site/i),
      "10:30",
    );
    await user.selectOptions(
      screen.getByLabelText(/Fire & safety category/i),
      "Other",
    );
    await user.selectOptions(screen.getByLabelText(/^Severity/i), "Medium");
    await user.selectOptions(
      screen.getByLabelText(/Location on site/i),
      "Entrance / Gate A",
    );
    await user.type(
      screen.getByLabelText(/What happened/i),
      "Smoke near catering tent.",
    );
    await user.type(screen.getByLabelText(/Actions taken/i), "Area cleared.");
    await user.type(screen.getByLabelText(/^Your name/i), "Sam Duty");

    await user.click(screen.getByRole("button", { name: /Submit fire/ }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Incident reported\. It appears under Incident log\./,
        ),
      ).toBeInTheDocument();
    });

    const posts = fetchMock.mock.calls.filter(
      (c) => typeof c[0] === "string" && (c[0] as string).includes("/api/incidents"),
    );
    expect(posts.length).toBeGreaterThanOrEqual(1);
    const postInit = posts.find((c) => (c[1] as RequestInit)?.method === "POST");
    expect(postInit).toBeDefined();
  });

  it("lists every site location in the dropdown", () => {
    renderReport();
    for (const loc of SITE_LOCATIONS) {
      expect(screen.getByRole("option", { name: loc })).toBeInTheDocument();
    }
  });
});
