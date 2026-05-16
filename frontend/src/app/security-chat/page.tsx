'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  '如何识别钓鱼邮件？',
  '我的密码怎样才安全？',
  '校园公共 WiFi 要注意什么？',
  'AI 诈骗有哪些常见形式？',
  'Deepfake 怎么识别？',
  '如何防止个人数据泄露？',
];

export default function SecurityChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 你好！我是校园网络安全助手。\n\n我可以回答你关于以下方面的问题：\n🔐 密码安全\n📧 钓鱼邮件识别\n📶 校园 WiFi 安全\n🤖 AI 诈骗防范\n🎭 深度伪造识别\n🔒 数据隐私保护\n\n请随时向我提问！',
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
      const data = await api.securityChat(text);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，服务暂时不可用。请检查后端服务是否已启动。',
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleSuggested(q: string) {
    setInput(q);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-5rem)] flex flex-col">
      <div className="mb-6 animate-slide-in shrink-0">
        <h1 className="text-3xl font-bold text-white glow-text mb-2">💬 网络安全知识助手</h1>
        <p className="text-gray-400">对话式校园安全知识问答，你的随身安全顾问</p>
      </div>

      {/* 聊天区 */}
      <div className="glass-card flex-1 flex flex-col min-h-0 animate-slide-in">
        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} message-animate`}
            >
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 ml-12'
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
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 建议问题 */}
        {messages.length <= 1 && (
          <div className="px-6 pb-4">
            <p className="text-xs text-gray-500 mb-2">💡 试试这些问题：</p>
            <div className="flex gap-2 flex-wrap">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggested(q)}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 hover:border-cyan-500/40 hover:text-cyan-400 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 输入框 */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入你的安全问题..."
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
