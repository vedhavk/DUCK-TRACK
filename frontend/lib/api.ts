/**
 * api.ts – centralised fetch wrapper for the DuckTrack FastAPI backend.
 * Backend base URL: http://127.0.0.1:8000
 */

export const API_BASE = "http://127.0.0.1:8000";

// ── Token helpers (localStorage) ─────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("dt_token");
}

export function setToken(token: string): void {
  localStorage.setItem("dt_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("dt_token");
  localStorage.removeItem("dt_user");
  localStorage.removeItem("dt_role");
}

export function getRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("dt_role");
}

export function setRole(role: string): void {
  localStorage.setItem("dt_role", role);
}

export function getUser(): FarmerOut | VetOut | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("dt_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setUser(user: FarmerOut | VetOut): void {
  localStorage.setItem("dt_user", JSON.stringify(user));
}

// ── Shared types ──────────────────────────────────────────────────────────────

export interface FarmerOut {
  id: number;
  name: string;
  pin_code: string;
  email: string;
  district: string;
  state: string;
}

export interface VetOut {
  id: number;
  name: string;
  pin_code: string;
  email: string;
  district: string;
  state: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: FarmerOut | VetOut;
}

export interface AlertHistoryRecord {
  id: number;
  latitude: number;
  longitude: number;
  pin_code: string;
  prediction: string;
  file_type: string;
  alert_sent: string;
  created_at: string;
  heatmap_url?: string;
}

export interface OutbreakRecord {
  id: number;
  latitude: number;
  longitude: number;
  pin_code: string;
  reported_by: string;
  reporter_name: string;
  file_type: string;
  alert_sent: string;
  created_at: string;
}

export interface UploadResult {
  filename: string;
  file_type: string;
  prediction: string;
  confidence: number;
  latitude: number;
  longitude: number;
  pin_code: string;
  alerts_sent: { farmers: string[]; vets: string[] } | null;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body?.detail ?? detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

// ── Farmer endpoints ──────────────────────────────────────────────────────────

export async function farmerRegister(data: {
  name: string;
  pin_code: string;
  email: string;
  district: string;
  state: string;
  password: string;
}): Promise<FarmerOut> {
  const res = await fetch(`${API_BASE}/farmer/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<FarmerOut>(res);
}

export async function farmerLogin(
  email: string,
  password: string
): Promise<AuthToken> {
  // FastAPI OAuth2PasswordRequestForm expects form-encoded body
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch(`${API_BASE}/farmer/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  return handleResponse<AuthToken>(res);
}

export async function farmerMe(): Promise<FarmerOut> {
  const res = await fetch(`${API_BASE}/farmer/me`, {
    headers: { ...authHeaders(), "Content-Type": "application/json" },
  });
  return handleResponse<FarmerOut>(res);
}

export async function farmerHistory(): Promise<AlertHistoryRecord[]> {
  const res = await fetch(`${API_BASE}/farmer/history`, {
    headers: { ...authHeaders(), "Content-Type": "application/json" },
  });
  return handleResponse<AlertHistoryRecord[]>(res);
}

// ── Veterinary endpoints ──────────────────────────────────────────────────────

export async function vetRegister(data: {
  name: string;
  pin_code: string;
  email: string;
  district: string;
  state: string;
  password: string;
}): Promise<VetOut> {
  const res = await fetch(`${API_BASE}/veterinary/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<VetOut>(res);
}

export async function vetLogin(
  email: string,
  password: string
): Promise<AuthToken> {
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch(`${API_BASE}/veterinary/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  return handleResponse<AuthToken>(res);
}

export async function vetMe(): Promise<VetOut> {
  const res = await fetch(`${API_BASE}/veterinary/me`, {
    headers: { ...authHeaders(), "Content-Type": "application/json" },
  });
  return handleResponse<VetOut>(res);
}

export async function vetHistory(): Promise<AlertHistoryRecord[]> {
  const res = await fetch(`${API_BASE}/veterinary/history`, {
    headers: { ...authHeaders(), "Content-Type": "application/json" },
  });
  return handleResponse<AlertHistoryRecord[]>(res);
}

// ── Upload endpoint ───────────────────────────────────────────────────────────

export async function uploadFile(
  file: File,
  latitude: number,
  longitude: number,
  pin_code: string
): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);
  form.append("latitude", String(latitude));
  form.append("longitude", String(longitude));
  form.append("pin_code", pin_code);

  const res = await fetch(`${API_BASE}/upload/`, {
    method: "POST",
    headers: authHeaders(), // NOTE: do NOT set Content-Type; browser sets multipart boundary
    body: form,
  });
  return handleResponse<UploadResult>(res);
}

// ── Outbreak history (vet) ────────────────────────────────────────────────────

export async function getOutbreakHistory(): Promise<OutbreakRecord[]> {
  const res = await fetch(`${API_BASE}/upload/outbreak-history`, {
    headers: { ...authHeaders(), "Content-Type": "application/json" },
  });
  return handleResponse<OutbreakRecord[]>(res);
}

// ── Profile update endpoints ──────────────────────────────────────────────────

export interface ProfileUpdate {
  name?: string;
  pin_code?: string;
  district?: string;
  state?: string;
}

export async function farmerUpdateMe(data: ProfileUpdate): Promise<FarmerOut> {
  const res = await fetch(`${API_BASE}/farmer/me`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<FarmerOut>(res);
}

export async function vetUpdateMe(data: ProfileUpdate): Promise<VetOut> {
  const res = await fetch(`${API_BASE}/veterinary/me`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<VetOut>(res);
}

// ── Duck yearly count endpoints ───────────────────────────────────────────────

export interface DuckYearlyCount {
  id: number;
  year: number;
  duck_count: number;
  updated_at: string | null;
}

export async function getDuckCounts(): Promise<DuckYearlyCount[]> {
  const res = await fetch(`${API_BASE}/farmer/duck-counts`, {
    headers: { ...authHeaders(), "Content-Type": "application/json" },
  });
  return handleResponse<DuckYearlyCount[]>(res);
}

export async function upsertDuckCount(
  year: number,
  duck_count: number
): Promise<DuckYearlyCount> {
  const res = await fetch(`${API_BASE}/farmer/duck-counts`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ year, duck_count }),
  });
  return handleResponse<DuckYearlyCount>(res);
}

export async function deleteDuckCount(year: number): Promise<void> {
  const res = await fetch(`${API_BASE}/farmer/duck-counts/${year}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok && res.status !== 204) {
    await handleResponse<void>(res);
  }
}

export async function getFarmersOverview(): Promise<{
  farmer_id: number;
  name: string;
  email: string;
  district: string;
  state: string;
  pin_code: string;
  latest_duck_count: number;
  latest_count_year: number | null;
}[]> {
  const res = await fetch(`${API_BASE}/veterinary/farmers-overview`, {
    headers: { ...authHeaders(), "Content-Type": "application/json" },
  });
  return handleResponse(res);
}

export type DiseaseMapLocation = {
  farm_name: string;
  latitude: number;
  longitude: number;
  disease: string;
  date_detected: string;
};

export async function getDiseaseMap(): Promise<DiseaseMapLocation[]> {
  const res = await fetch(`${API_BASE}/veterinary/disease-map`, {
    headers: { ...authHeaders(), "Content-Type": "application/json" },
  });
  return handleResponse(res);
}
