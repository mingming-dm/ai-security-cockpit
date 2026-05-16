'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { AnalysisResult } from '@/types';

const DEMO_SAMPLES = [
  { label: '安全文本', text: '人工智能技术正在改变教育方式，为学生提供个性化学习体验。' },
  { label: '含手机号', text: '你好，我的手机号是13812345678，请帮我查一下课程安排。我的学号是2021001234。' },
  { label: '含身份证号', text: '报名需要提供身份证号：110101200001011234，家庭住址：北京市海淀区中关村南大街5号院3号楼201。' },
  { label: '含银行卡号', text: '请把退款打到我的账户：6222 0210 0123 4567，密码是123456，谢谢。' },
];

export default function ContentDetectPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleDetect() {
    if (!text.trim()) return;
    try {
      setLoading(true);
      setError('');
      setResult(null);
      const data = await api.detectContent(text);
      setResult(data);
    } catch (err: any) {
      setError(err.message || '检测失败');
    } finally {
      setLoading(false);
    }
  }

  function handleSample(sample: string) {
    setText(sample);
    setResult(null);
    setError('');
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8 animate-slide-in">
        <h1 className="text-3xl font-bold text-white glow-text mb-2">🔍 AI 内容风险检测</h1>
        <p className="text-gray-400">检测文本中的个人隐私泄露、敏感信息、数据安全风险</p>
      </div>

      {/* 输入区 */}
      <div className="glass-card p-6 mb-6 animate-slide-in">
        <div className="flex gap-2 mb-4 flex-wrap">
          {DEMO_SAMPLES.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSample(s.text)}
              className="text-xs px-3 py-1.5 rounded-full border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 transition-all"
            >
              {s.label}
            </button>
          ))}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="请输入待检测的文本内容..."
          rows={5}
          className="cyber-input resize-none"
        />

        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-gray-500">{text.length}/10000 字符</span>
          <button
            onClick={handleDetect}
            disabled={loading || !text.trim()}
            className="cyber-btn disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ 检测中...' : '🔍 开始检测'}
          </button>
        </div>
      </div>

      {/* 错误 */}
      {error && (
        <div className="glass-card p-4 mb-6 border-red-500/30 animate-fade-in">
          <p className="text-red-400 flex items-center gap-2">⚠️ {error}</p>
        </div>
      )}

      {/* 结果 */}
      {result && (
        <div className="space-y-4 animate-slide-in">
          {/* 风险评分 */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">检测结果</h3>
              <RiskBadge level={result.riskLevel} />
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">风险评分</span>
                <span className={`font-bold risk-${result.riskLevel}`}>{result.riskScore}/100</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    result.riskScore <= 10 ? 'bg-green-500' :
                    result.riskScore <= 30 ? 'bg-yellow-500' :
                    result.riskScore <= 60 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${result.riskScore}%` }}
                />
              </div>
            </div>

            <p className="text-gray-300 mb-4">{result.summary}</p>

            {result.aiAnalysis && (
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 mb-4">
                <p className="text-xs text-purple-400 mb-1">🤖 AI 增强分析</p>
                <p className="text-sm text-gray-300">{result.aiAnalysis}</p>
              </div>
            )}
          </div>

          {/* 发现详情 */}
          {result.findings.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-4">发现的风险项</h3>
              <div className="space-y-3">
                {result.findings.map((f, i) => (
                  <div key={i} className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{f.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        f.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        f.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {f.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">匹配次数: {f.matchCount}</p>
                    {f.matched.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {f.matched.map((m, j) => (
                          <code key={j} className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-300 font-mono">
                            {m}
                          </code>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 建议 */}
          <div className="glass-card p-6 border-green-500/20">
            <h3 className="text-lg font-bold text-green-400 mb-3">💡 安全建议</h3>
            <ul className="space-y-2">
              {result.suggestions.map((s, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 空状态 */}
      {!result && !loading && !error && (
        <div className="glass-card p-12 text-center animate-fade-in">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-bold text-white mb-2">等待检测</h3>
          <p className="text-gray-400">
            输入文本或点击上方示例数据，AI 将自动检测其中的隐私和风险内容
          </p>
        </div>
      )}
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const config: Record<string, { color: string; text: string }> = {
    safe: { color: 'bg-green-500/20 text-green-400 border-green-500/30', text: '✅ 安全' },
    low: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', text: '⚠️ 低风险' },
    medium: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', text: '⚠️ 中风险' },
    high: { color: 'bg-red-500/20 text-red-400 border-red-500/30', text: '🚨 高风险' },
    critical: { color: 'bg-red-700/20 text-red-500 border-red-500/30', text: '🔴 严重风险' },
  };
  const c = config[level] || config.safe;
  return (
    <span className={`text-xs px-3 py-1 rounded-full border font-medium ${c.color}`}>
      {c.text}
    </span>
  );
}
