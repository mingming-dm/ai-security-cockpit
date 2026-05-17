import { getDetectionHistory } from '@/lib/db';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '20');
  return Response.json({ logs: getDetectionHistory('fraud', limit) });
}
