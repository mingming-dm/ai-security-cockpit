'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DeepfakeCase } from '@/types';

export default function DeepfakePage() {
  const [cases, setCases] = useState<DeepfakeCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DeepfakeCase | null>(null);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    loadCases();
  }, [category]);

  async function loadCases() {
    setLoading(true);
    try {
      const data = await api.deepfakeCases(category);
      setCases(data.cases || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const categories = ['all', '语音伪造', '视频伪造', '内容伪造', '文本伪造', '技术科普'];

  const riskColors: Record<string, string> = {
    critical: 'border-red-500/30 bg-red-500/10 text-red-400',
    high: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
    medium: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
    low: 'border-green-500/30 bg-green-500/10 text-green-400',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 animate-slide-in">
        <h1 className="text-3xl font-bold text-white glow-text mb-2">🎭 深度伪造科普馆</h1>
        <p className="text-gray-400">了解 Deepfake 技术原理、识别方法和真实案例，提升防范意识</p>
      </div>

      {/* 技术简介卡片 */}
      <div className="gradient-border mb-8 animate-slide-in">
        <div className="p-6 rounded-2xl bg-cyber-card">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="text-5xl">🧠</div>
            <div className="flex-1 min-w-[250px]">
              <h2 className="text-xl font-bold text-white mb-3">什么是 Deepfake？</h2>
              <p className="text-gray-300 leading-relaxed text-sm">
                Deepfake（深度伪造）是利用深度学习技术（主要是 GAN 生成对抗网络）来生成或篡改人脸、声音、视频的 AI 技术。
                生成器创造虚假内容，判别器尝试识别真假——两者在对抗中不断进化，最终生成的假内容足以以假乱真。
              </p>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/15">
                  <div className="text-xl font-bold text-cyan-400">3-10秒</div>
                  <div className="text-xs text-gray-500">语音克隆所需样本</div>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/15">
                  <div className="text-xl font-bold text-purple-400">99%+</div>
                  <div className="text-xs text-gray-500">高精度伪造识别难度</div>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/15">
                  <div className="text-xl font-bold text-yellow-400">5x</div>
                  <div className="text-xs text-gray-500">年增长率</div>
                </div>
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/15">
                  <div className="text-xl font-bold text-red-400">数亿</div>
                  <div className="text-xs text-gray-500">年损失金额(元)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 分类过滤器 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 animate-slide-in">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setSelected(null); }}
            className={`text-xs px-4 py-2 rounded-full border whitespace-nowrap transition-all ${
              category === cat
                ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40'
                : 'border-gray-700 text-gray-400 hover:border-gray-500'
            }`}
          >
            {cat === 'all' ? '📂 全部' : cat}
          </button>
        ))}
      </div>

      {/* 案例列表 */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card p-6 shimmer h-48" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelected(c)}
              className={`glass-card p-6 cursor-pointer card-hover-glow animate-slide-in transition-all ${
                selected?.id === c.id ? 'neon-border' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-white text-lg">{c.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${riskColors[c.riskLevel]}`}>
                  {c.riskLevel.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-3 line-clamp-3">{c.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400">{c.category}</span>
                <span className="text-xs text-cyan-400">点击查看详情 →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 案例详情弹窗 */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelected(null)}>
          <div className="glass-card p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-slide-in"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{selected.title}</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${riskColors[selected.riskLevel]}`}>
                {selected.riskLevel.toUpperCase()}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                {selected.category}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-cyan-400 mb-2">📖 原理说明</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{selected.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-green-400 mb-2">🔍 识别方法</h3>
                <pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {selected.identifyMethod}
                </pre>
              </div>

              <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                <h3 className="text-sm font-bold text-red-400 mb-2">📋 真实案例</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{selected.realCase}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
