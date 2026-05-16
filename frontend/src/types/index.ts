// API 响应类型
export interface AnalysisResult {
  riskScore: number;
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  findings: ScanFinding[];
  summary: string;
  suggestions: string[];
  blocked?: boolean;
  aiAnalysis?: string | null;
}

export interface ScanFinding {
  type: string;
  label: string;
  severity: string;
  matchCount: number;
  matched: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface DashboardStats {
  today: DailyStats;
  total: TotalStats;
  trend: TrendItem[];
  securityScore: number;
  riskRatio: number;
}

export interface DailyStats {
  date: string;
  total_scans: number;
  risks_found: number;
  frauds_detected: number;
  prompts_blocked: number;
}

export interface TotalStats {
  total_scans: number;
  total_risks: number;
  total_frauds: number;
  total_blocked: number;
}

export interface TrendItem {
  date: string;
  total_scans: number;
  risks_found: number;
  frauds_detected: number;
  prompts_blocked: number;
}

export interface DeepfakeCase {
  id: number;
  title: string;
  category: string;
  riskLevel: string;
  description: string;
  identifyMethod: string;
  realCase: string;
}

export interface HealthStatus {
  status: string;
  name: string;
  version: string;
  aiProvider: string;
}
