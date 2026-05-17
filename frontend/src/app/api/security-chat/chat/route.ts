import { securityQA } from '@/lib/ruleEngine';
import { addChatMessage } from '@/lib/db';

export async function POST(req: Request) {
  const { message } = await req.json();
  if (!message) return Response.json({ error: '请输入消息' }, { status: 400 });

  addChatMessage('security_chat', 'user', message);
  const reply = securityQA(message);
  addChatMessage('security_chat', 'assistant', reply);

  return Response.json({ reply });
}
