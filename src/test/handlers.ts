import { http, HttpResponse } from "msw";
import { allPermissions } from "@/data/types";

export const handlers = [
  http.get("/api/health", () => HttpResponse.json({ status: "ok" })),
  http.get("/api/permissions", () => HttpResponse.json(allPermissions)),
];
