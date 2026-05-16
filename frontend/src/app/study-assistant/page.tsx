'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUERIES = [
  '请帮我理解梯度下降算法',
  '如何写好一篇学术论文？',
  '什么是强化学习？',
  '帮我理清微积分的核心概念',
  '英语作文的结构应该如何安排？',
];

export default function StudyAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '📚 你好！我是 AI 安全学习助手。\n\n我的角色是帮助你学习，而不是替你完成作业。\n\n我可以帮你：\n📖 解释复杂概念\n🧮 引导解题思路\n✍️ 论文写作方法\n📝 知识梳理和总结\n\n⚠️ 使用提醒：\n• AI 可能犯错，关键信息请核实\n• 不要输入个人隐私信息\n• 学术诚信第一：思考的主体应该是你\n\n开始提问吧！',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await api.studyAsk(text);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，学习助手服务暂时不可用。请检查后端服务是否已启动。',
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-5rem)] flex flex-col">
      <div className="mb-6 animate-slide-in shrink-0">
        <h1 className="text-3xl font-bold text-white glow-text mb-2">📚 AI 安全学习助手</h1>
        <p className="text-gray-400">
          在安全护栏内使用 AI 辅助学习——引导思考，培养能力
        </p>
      </div>

      <div className="glass-card flex-1 flex flex-col min-h-0 animate-slide-in">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} message-animate`}
            >
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 ml-12'
                  : 'bg-white/[0.03] border border-white/[0.08] mr-12'
              }`}>
                <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start message-animate">
              <div className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-2xl mr-12">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 1 && (
          <div className="px-6 pb-4">
            <p className="text-xs text-gray-500 mb-2">💡 试试这些问题：</p>
            <div className="flex gap-2 flex-wrap">
              {SUGGESTED_QUERIES.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 hover:border-purple-500/40 hover:text-purple-400 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入你的学习问题..."
              className="cyber-input flex-1"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="cyber-btn px-6 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? '⏳' : '📤'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
