const API_BASE = "/api/farmer";

export interface Report {
  id: number;
  title: string;
  date: string;
  summary?: string;
  fileName?: string;
  ducks: number;
  healthy: number;
  diseased?: number;
  type: "weekly" | "daily" | "monthly";
}

export interface ActivityData {
  time: string;
  active: number;
}

export interface ActivityMetric {
  id: string;
  label: string;
  value: string | number;
  status: "high" | "normal" | "low" | "active";
  icon: string;
  color: string;
}

export interface FarmDashboardCameraFeed {
  imageUrl: string;
  statusLabel: string;
  description: string;
  actionLabel: string;
}

export interface FarmDashboardStat {
  id: string;
  label: string;
  value: string;
  helper?: string;
  valueClassName?: string;
  helperClassName?: string;
}

export interface FarmDashboardResponse {
  cameraFeed: FarmDashboardCameraFeed;
  stats: FarmDashboardStat[];
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

export async function getReports(): Promise<Report[]> {
  return requestJson<Report[]>("/reports");
}

export async function getActivityData(): Promise<ActivityData[]> {
  return requestJson<ActivityData[]>("/activity");
}

export async function getActivityMetrics(): Promise<ActivityMetric[]> {
  return requestJson<ActivityMetric[]>("/activity/metrics");
}

export async function getFarmDashboardData(): Promise<FarmDashboardResponse> {
  const [activityData, reports] = await Promise.all([
    getActivityData(),
    getReports(),
  ]);

  const totalDucks = reports[0]?.ducks ?? 0;
  const healthyDucks = reports[0]?.healthy ?? 0;
  const averageActivity =
    activityData.length > 0
      ? Math.round(
          activityData.reduce((sum, item) => sum + item.active, 0) /
            activityData.length,
        )
      : 0;

  return {
    cameraFeed: {
      imageUrl:
        "https://images.unsplash.com/photo-1557064774-3a5d5b6f0f26?auto=format&fit=crop&w=1600&q=80",
      statusLabel: "Live monitoring active",
      description: "Farm camera is connected and streaming",
      actionLabel: "View Live Stream",
    },
    stats: [
      {
        id: "total-ducks",
        label: "Total Ducks",
        value: `${totalDucks}`,
        valueClassName: "text-slate-800",
      },
      {
        id: "healthy-ducks",
        label: "Healthy Ducks",
        value: `${healthyDucks}`,
        helper: "Based on latest report",
        valueClassName: "text-green-600",
        helperClassName: "text-green-600",
      },
      {
        id: "avg-activity",
        label: "Average Activity",
        value: `${averageActivity}`,
        helper: "Active ducks per time slot",
        valueClassName: "text-blue-600",
        helperClassName: "text-blue-600",
      },
    ],
  };
}

export async function downloadReport(reportId: number): Promise<Blob> {
  return requestBlob(`/reports/${reportId}/download`);
}

export async function generateLatestReport(): Promise<void> {
  const reports = await getReports();
  const latestReport = reports[0];

  if (!latestReport) {
    return;
  }

  const blob = await downloadReport(latestReport.id);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    latestReport.fileName ??
    `${latestReport.title.replace(/\s+/g, "_")}_${latestReport.date}.txt`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
