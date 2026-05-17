import { getDeepfakeCase } from '@/lib/db';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return Response.json({ error: '无效的 ID' }, { status: 400 });
  const caseData = getDeepfakeCase(id);
  if (!caseData) return Response.json({ error: '案例不存在' }, { status: 404 });
  return Response.json(caseData);
}
