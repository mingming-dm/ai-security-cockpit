import { detectContentRisk } from '@/lib/ruleEngine';
import { addDetection } from '@/lib/db';

export async function POST(req: Request) {
  const { text } = await req.json();
  if (!text) return Response.json({ error: '请提供文本内容' }, { status: 400 });

  const result = detectContentRisk(text);
  addDetection('content', text, result.riskLevel);

  return Response.json(result);
}
