export interface AdminMetric {
  id: string;
  label: string;
  value: string;
  helper?: string;
}

export interface DetectionResult {
  id: number;
  label: string;
  confidence: number;
  status: "detected" | "idle";
}

export interface DatasetItem {
  id: number;
  name: string;
  images: number;
  updatedAt: string;
}

export interface TrainingRun {
  id: number;
  model: string;
  status: "Running" | "Completed" | "Queued";
  progress: number;
}

export interface PerformanceRow {
  id: number;
  metric: string;
  value: string;
  trend: string;
}

export interface UserRow {
  id: number;
  name: string;
  role: "Admin" | "Veterinarian" | "Farmer";
  status: "Active" | "Pending";
}

export const adminMetrics: AdminMetric[] = [
  { id: "status", label: "Status", value: "Idle" },
  { id: "detected", label: "Ducks Detected", value: "0" },
  { id: "confidence", label: "Confidence", value: "0%", helper: "High" },
  { id: "fps", label: "FPS", value: "0", helper: "Frames/sec" },
];

export const detectionResults: DetectionResult[] = [
  { id: 1, label: "No active detection", confidence: 0, status: "idle" },
];

export const datasets: DatasetItem[] = [
  {
    id: 1,
    name: "Duck Disease Training Set",
    images: 4280,
    updatedAt: "Mar 13, 2026",
  },
  {
    id: 2,
    name: "Healthy Duck Validation Set",
    images: 1460,
    updatedAt: "Mar 12, 2026",
  },
  {
    id: 3,
    name: "Farm Camera Test Set",
    images: 980,
    updatedAt: "Mar 10, 2026",
  },
];

export const trainingRuns: TrainingRun[] = [
  { id: 1, model: "YOLOv8n-cls", status: "Running", progress: 68 },
  { id: 2, model: "YOLOv8m", status: "Completed", progress: 100 },
  { id: 3, model: "YOLOv8n Transfer", status: "Queued", progress: 12 },
];

export const performanceRows: PerformanceRow[] = [
  { id: 1, metric: "Precision", value: "94.5%", trend: "+1.2%" },
  { id: 2, metric: "Recall", value: "92.8%", trend: "+0.8%" },
  { id: 3, metric: "F1 Score", value: "93.6%", trend: "+1.0%" },
  { id: 4, metric: "Inference Speed", value: "23 ms", trend: "-2 ms" },
];

export const users: UserRow[] = [
  { id: 1, name: "Asha Kumar", role: "Admin", status: "Active" },
  { id: 2, name: "Dr. Nikhil Raj", role: "Veterinarian", status: "Active" },
  { id: 3, name: "Farmer Joseph", role: "Farmer", status: "Pending" },
  { id: 4, name: "Farmer Deepa", role: "Farmer", status: "Active" },
];
