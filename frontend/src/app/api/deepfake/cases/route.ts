import { getDeepfakeCases } from '@/lib/db';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get('category') || 'all';
  return Response.json({ cases: getDeepfakeCases(category) });
}
