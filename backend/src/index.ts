import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import contentDetectRouter from './routes/contentDetect';
import promptFilterRouter from './routes/promptFilter';
import fraudDetectRouter from './routes/fraudDetect';
import securityChatRouter from './routes/securityChat';
import studyAssistantRouter from './routes/studyAssistant';
import statsRouter from './routes/stats';
import deepfakeRouter from './routes/deepfake';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// 请求日志
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

// API 路由
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    name: '智盾校园 AI 安全驾驶舱',
    version: '1.0.0',
    aiProvider: process.env.AI_PROVIDER || 'demo',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/content-detect', contentDetectRouter);
app.use('/api/prompt-filter', promptFilterRouter);
app.use('/api/fraud-detect', fraudDetectRouter);
app.use('/api/security-chat', securityChatRouter);
app.use('/api/study-assistant', studyAssistantRouter);
app.use('/api/stats', statsRouter);
app.use('/api/deepfake', deepfakeRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'API 端点不存在' });
});

// 启动服务
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════');
  console.log('  🛡️  智盾校园 · AI 安全驾驶舱');
  console.log('  Campus AI Security Cockpit');
  console.log('═══════════════════════════════════════════');
  console.log(`  ✅ 后端服务已启动: http://localhost:${PORT}`);
  console.log(`  🤖 AI 模式: ${process.env.AI_PROVIDER || 'demo'}`);
  console.log(`  📊 健康检查: http://localhost:${PORT}/api/health`);
  console.log('═══════════════════════════════════════════');
});

export default app;
