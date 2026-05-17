export async function GET() {
  return Response.json({
    status: 'ok',
    name: '智盾校园 AI 安全驾驶舱',
    version: '1.1.0',
    aiProvider: process.env.AI_PROVIDER || 'demo',
    timestamp: new Date().toISOString(),
  });
}
