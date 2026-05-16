'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { DashboardStats } from '@/types';

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      setError('');
      const data = await api.dashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || '无法获取数据');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-cyan-500/30 border-t-cyan-400 animate-spin" />
          <p className="text-gray-400">正在加载安全驾驶舱...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center glass-card p-8 max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-400 mb-2">连接异常</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={loadStats} className="cyber-btn">
            🔄 重新连接
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 标题区 */}
      <div className="mb-8 animate-slide-in">
        <div className="flex items-center gap-3 mb-2">
          <span className="status-dot online" />
          <span className="text-sm text-gray-400">系统运行正常 · 实时监控中</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white glow-text">
          🛡️ AI 安全驾驶舱
        </h1>
        <p className="text-gray-400 mt-2">
          实时监控校园 AI 安全态势 · 一站式安全防护平台
        </p>
      </div>

      {/* 四大核心指标 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5 card-hover-glow animate-slide-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">🛡️</span>
            <div className={`text-3xl font-bold ${(stats?.securityScore || 0) >= 80 ? 'text-green-400' : (stats?.securityScore || 0) >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
              {stats?.securityScore ?? '--'}
            </div>
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">安全评分</p>
          <div className="mt-2 w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${stats?.securityScore || 0}%`,
                background: `linear-gradient(90deg, #10b981, #00d4ff)`,
              }}
            />
          </div>
        </div>

        <div className="glass-card p-5 card-hover-glow animate-slide-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">📊</span>
            <div className="text-3xl font-bold text-cyan-400">{stats?.today.total_scans || 0}</div>
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">今日扫描次数</p>
          <p className="text-xs text-gray-500 mt-1">累计 {stats?.total.total_scans || 0} 次</p>
        </div>

        <div className="glass-card p-5 card-hover-glow animate-slide-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">⚠️</span>
            <div className="text-3xl font-bold text-yellow-400">{stats?.today.risks_found || 0}</div>
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">今日风险发现</p>
          <p className="text-xs text-gray-500 mt-1">风险率 {stats?.riskRatio || 0}%</p>
        </div>

        <div className="glass-card p-5 card-hover-glow animate-slide-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">🚫</span>
            <div className="text-3xl font-bold text-purple-400">{stats?.today.prompts_blocked || 0}</div>
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">恶意提示词拦截</p>
          <p className="text-xs text-gray-500 mt-1">累计 {stats?.total.total_blocked || 0} 次</p>
        </div>
      </div>

      {/* 功能卡片 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <FeatureCard
          href="/content-detect"
          icon="🔍"
          title="AI 内容风险检测"
          desc="智能识别文本中的个人隐私、敏感信息、数据泄露等风险"
          color="cyan"
          delay="0.5s"
        />
        <FeatureCard
          href="/prompt-filter"
          icon="🛡️"
          title="提示词安全过滤"
          desc="实时检测越狱攻击、提示注入、身份劫持等恶意 Prompt"
          color="purple"
          delay="0.6s"
        />
        <FeatureCard
          href="/fraud-detect"
          icon="🚨"
          title="AI 诈骗识别"
          desc="识别 AI 生成的钓鱼消息、语音诈骗、虚假通知等"
          color="red"
          delay="0.7s"
        />
        <FeatureCard
          href="/deepfake"
          icon="🎭"
          title="深度伪造科普馆"
          desc="了解 Deepfake 原理、识别方法和真实案例"
          color="yellow"
          delay="0.8s"
        />
        <FeatureCard
          href="/security-chat"
          icon="💬"
          title="网络安全知识助手"
          desc="对话式校园安全知识问答：WiFi安全、密码管理等"
          color="green"
          delay="0.9s"
        />
        <FeatureCard
          href="/study-assistant"
          icon="📚"
          title="AI 安全学习助手"
          desc="在安全护栏内辅助学习，引导思考而非给答案"
          color="blue"
          delay="1s"
        />
      </div>

      {/* 最近检测动态 */}
      <RecentDetections />
    </div>
  );
}

function FeatureCard({
  href,
  icon,
  title,
  desc,
  color,
  delay,
}: {
  href: string;
  icon: string;
  title: string;
  desc: string;
  color: string;
  delay: string;
}) {
  const colorMap: Record<string, string> = {
    cyan: 'border-cyan-500/20 hover:border-cyan-400/50',
    purple: 'border-purple-500/20 hover:border-purple-400/50',
    red: 'border-red-500/20 hover:border-red-400/50',
    yellow: 'border-yellow-500/20 hover:border-yellow-400/50',
    green: 'border-green-500/20 hover:border-green-400/50',
    blue: 'border-blue-500/20 hover:border-blue-400/50',
  };

  return (
    <Link
      href={href}
      className={`glass-card p-6 card-hover-glow border ${colorMap[color] || ''} animate-slide-in cursor-pointer block`}
      style={{ animationDelay: delay }}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
    </Link>
  );
}

function RecentDetections() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.recentDetections(5).then(data => {
      setLogs(data.logs || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const typeLabels: Record<string, { icon: string; label: string }> = {
    content: { icon: '🔍', label: '内容检测' },
    prompt: { icon: '🛡️', label: '提示词过滤' },
    fraud: { icon: '🚨', label: '诈骗识别' },
  };

  const riskColors: Record<string, string> = {
    safe: 'bg-green-500/20 text-green-400 border-green-500/30',
    low: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    medium: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    critical: 'bg-red-700/20 text-red-500 border-red-500/30',
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="shimmer h-6 w-48 mb-4 rounded" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="shimmer h-12 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 animate-slide-in" style={{ animationDelay: '1.1s' }}>
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        最近检测动态
      </h3>
      {logs.length === 0 ? (
        <p className="text-gray-500 text-center py-6">暂无检测记录，开始使用安全检测功能吧</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log: any, i: number) => (
            <div
              key={log.id || i}
              className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg">{typeLabels[log.type]?.icon || '📋'}</span>
                <div className="min-w-0">
                  <p className="text-sm text-gray-300 truncate max-w-[300px]">{log.input_text}</p>
                  <p className="text-xs text-gray-500">{typeLabels[log.type]?.label || log.type}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full border whitespace-nowrap ml-3 ${riskColors[log.risk_level] || ''}`}>
                {log.risk_level}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
