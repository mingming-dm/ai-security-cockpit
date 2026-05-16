/**
 * API 客户端 — 所有后端请求的统一入口
 */

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '网络错误' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // 健康检查
  health: () => request<{ status: string; name: string; version: string; aiProvider: string }>('/health'),

  // 内容风险检测
  detectContent: (text: string) =>
    request<any>('/content-detect/detect', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  // 提示词安全过滤
  filterPrompt: (prompt: string) =>
    request<any>('/prompt-filter/filter', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),

  // 诈骗识别
  detectFraud: (text: string) =>
    request<any>('/fraud-detect/detect', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  // 安全知识聊天
  securityChat: (message: string) =>
    request<{ reply: string }>('/security-chat/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  // 学习助手
  studyAsk: (query: string) =>
    request<{ reply: string }>('/study-assistant/ask', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  // 仪表盘统计
  dashboardStats: () => request<any>('/stats/dashboard'),

  // 最近检测
  recentDetections: (limit = 10) => request<any>(`/stats/recent-detections?limit=${limit}`),

  // 深度伪造案例
  deepfakeCases: (category = 'all') => request<any>(`/deepfake/cases?category=${category}`),

  // 深度伪造案例详情
  deepfakeCase: (id: number) => request<any>(`/deepfake/cases/${id}`),

  // 检测历史
  detectionHistory: (type: string, limit = 20) =>
    request<any>(`/${type}/history?limit=${limit}`),
};
