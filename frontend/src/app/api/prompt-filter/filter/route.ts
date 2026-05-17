import { detectPromptInjection } from '@/lib/ruleEngine';
import { addDetection } from '@/lib/db';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  if (!prompt) return Response.json({ error: '请提供 Prompt 内容' }, { status: 400 });

  const result = detectPromptInjection(prompt);
  addDetection('prompt', prompt, result.riskLevel);

  return Response.json(result);
}
