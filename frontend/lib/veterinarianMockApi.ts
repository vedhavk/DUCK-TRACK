const API_BASE = "/api/veterinarian";

export interface VetHealthStat {
  id: string;
  label: string;
  value: string;
  helper: string;
  accent: string;
}

export interface VetAlert {
  id: number;
  duckId: number;
  issue: string;
  priority: "High Priority" | "Medium Priority";
  detectedAgo: string;
  border: string;
  badge: string;
}

export interface BehaviorMetric {
  label: string;
  duration: number;
}

export interface DetectionImage {
  id: number;
  imageUrl: string;
  status: "Healthy" | "Alert";
  capturedAt: string;
}

export interface MedicalReport {
  id: number;
  title: string;
  date: string;
  status: "Critical" | "Complete" | "Review";
}

async function requestJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function requestBlob(path: string): Promise<Blob> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.blob();
}

export async function getVetHealthStats(): Promise<VetHealthStat[]> {
  return requestJson<VetHealthStat[]>("/health-stats");
}

export async function getVetAlerts(): Promise<VetAlert[]> {
  return requestJson<VetAlert[]>("/alerts");
}

export async function getBehaviorMetrics(): Promise<BehaviorMetric[]> {
  return requestJson<BehaviorMetric[]>("/behavior-metrics");
}

export async function getDetectionImages(): Promise<DetectionImage[]> {
  return requestJson<DetectionImage[]>("/detections");
}

export async function getMedicalReports(): Promise<MedicalReport[]> {
  return requestJson<MedicalReport[]>("/reports");
}

export async function downloadVetReport(reportId: number): Promise<Blob> {
  return requestBlob(`/reports/${reportId}/download`);
}

export async function generateVetSummaryReport(): Promise<Blob> {
  return requestBlob("/reports/summary/download");
}
