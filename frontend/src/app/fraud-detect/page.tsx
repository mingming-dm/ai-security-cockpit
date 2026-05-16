'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

const DEMO_FRAUDS = [
  { label: '中奖诈骗', text: '恭喜！您在校园活动中获得一等奖10万元！请点击链接 http://fake-url.com 填写银行卡信息领取奖金，过期作废！' },
  { label: '假冒客服', text: '您好，我是淘宝客服，您购买的订单出现问题需要退款，请加我QQ号 123456 指导您操作。' },
  { label: '刷单兼职', text: '急招大学生兼职！日赚500-1000元，时间自由，只需要手机刷单即可，零门槛，零风险，学生优先！' },
  { label: '冒充公检法', text: '你好，我是市公安局的，你的身份证涉嫌一起案件，请配合调查，立即将资金转移到安全账户：6222 0000 1111 2222' },
  { label: '助学贷款诈骗', text: '各位同学，学校新推出的助学贷款项目，无抵押秒批零利息，请将申请费和保证金转账至以下账号。' },
  { label: 'AI语音诈骗', text: '（微信语音消息）喂，是我，我用别人手机打的。我现在遇到点急事需要5000块钱，你能不能先转给我？我明天还你。别打电话，我现在不方便接。' },
];

export default function FraudDetectPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleDetect() {
    if (!text.trim()) return;
    try {
      setLoading(true);
      setError('');
      setResult(null);
      const data = await api.detectFraud(text);
      setResult(data);
    } catch (err: any) {
      setError(err.message || '检测失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8 animate-slide-in">
        <h1 className="text-3xl font-bold text-white glow-text mb-2">🚨 AI 诈骗识别</h1>
        <p className="text-gray-400">
          智能识别各种 AI 生成的诈骗内容：钓鱼消息、语音诈骗、虚假通知、刷单骗局等
        </p>
      </div>

      {/* 警告横幅 */}
      <div className="glass-card p-4 mb-6 border-red-500/30 bg-red-500/5 animate-slide-in">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-red-400 font-bold text-sm">校园诈骗高发警示</p>
            <p className="text-xs text-gray-400 mt-1">
              2024年至今，全国高校已发生多起 AI 语音克隆诈骗案件。
              遇到转账请求，务必通过电话或当面二次确认！
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 mb-6 animate-slide-in">
        <div className="flex gap-2 mb-4 flex-wrap">
          {DEMO_FRAUDS.map((s, i) => (
            <button
              key={i}
              onClick={() => { setText(s.text); setResult(null); setError(''); }}
              className="text-xs px-3 py-1.5 rounded-full border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
            >
              {s.label}
            </button>
          ))}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="请粘贴可疑消息、短信、邮件内容或语音转文字..."
          rows={5}
          className="cyber-input resize-none"
        />

        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-gray-500">{text.length}/5000 字符</span>
          <button
            onClick={handleDetect}
            disabled={loading || !text.trim()}
            className="cyber-btn disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ 分析中...' : '🚨 诈骗检测'}
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-card p-4 mb-6 border-red-500/30 animate-fade-in">
          <p className="text-red-400">⚠️ {error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4 animate-slide-in">
          <div className={`glass-card p-6 border-2 ${
            result.riskLevel === 'safe'
              ? 'border-green-500/50 bg-green-500/5'
              : result.riskLevel === 'low'
              ? 'border-yellow-500/50 bg-yellow-500/5'
              : 'border-red-500/50 bg-red-500/5'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">检测结果</h3>
              <span className={`text-sm font-bold px-3 py-1 rounded-full border ${
                result.riskLevel === 'safe' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                result.riskLevel === 'low' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                result.riskLevel === 'medium' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                'bg-red-500/20 text-red-400 border-red-500/30'
              }`}>
                {result.riskLevel === 'safe' ? '✅ 安全' :
                 result.riskLevel === 'low' ? '⚠️ 低风险' :
                 result.riskLevel === 'medium' ? '⚠️ 可疑' :
                 result.riskLevel === 'high' ? '🚨 高危诈骗' : '🔴 确认诈骗'}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">诈骗风险评分</span>
                <span className="font-bold text-red-400">{result.riskScore}/100</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-red-500 transition-all duration-1000"
                  style={{ width: `${result.riskScore}%` }} />
              </div>
            </div>

            <p className="text-gray-300">{result.summary}</p>

            {result.aiAnalysis && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-400 mb-1">🤖 AI 深度分析</p>
                <p className="text-sm text-gray-300">{result.aiAnalysis}</p>
              </div>
            )}
          </div>

          {result.findings.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-4">🔍 检测到的诈骗特征</h3>
              <div className="space-y-3">
                {result.findings.map((f: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{f.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        f.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        f.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>{f.severity.toUpperCase()}</span>
                    </div>
                    <p className="text-xs text-gray-400">匹配次数: {f.matchCount}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass-card p-6 border-green-500/20">
            <h3 className="text-lg font-bold text-green-400 mb-3">🛡️ 防范建议</h3>
            <ul className="space-y-2">
              {result.suggestions.map((s: string, i: number) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span> {s}
                </li>
              ))}
              <li className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-green-400 mt-0.5">📞</span>
                校园保卫处 24 小时反诈热线：请查询学校官网获取
              </li>
            </ul>
          </div>
        </div>
      )}

      {!result && !loading && !error && (
        <div className="glass-card p-12 text-center animate-fade-in">
          <div className="text-5xl mb-4">🚨</div>
          <h3 className="text-lg font-bold text-white mb-2">AI 诈骗识别就绪</h3>
          <p className="text-gray-400">粘贴可疑消息或选择示例，AI 将分析其诈骗特征</p>
        </div>
      )}
    </div>
  );
}
