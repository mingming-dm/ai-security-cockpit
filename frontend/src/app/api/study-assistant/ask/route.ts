import { studyAssistant } from '@/lib/ruleEngine';
import { addChatMessage } from '@/lib/db';

export async function POST(req: Request) {
  const { query } = await req.json();
  if (!query) return Response.json({ error: '请输入问题' }, { status: 400 });

  addChatMessage('study', 'user', query);
  const reply = studyAssistant(query);
  addChatMessage('study', 'assistant', reply);

  return Response.json({ reply });
}
