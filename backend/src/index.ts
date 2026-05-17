import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import { getDb } from './database';
import { seedDemoData } from './seed';
import contentDetectRouter from './routes/contentDetect';
import promptFilterRouter from './routes/promptFilter';
import fraudDetectRouter from './routes/fraudDetect';
import securityChatRouter from './routes/securityChat';
import studyAssistantRouter from './routes/studyAssistant';
import statsRouter from './routes/stats';
import deepfakeRouter from './routes/deepfake';

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

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

// 生产环境：serve 前端静态文件
if (isProduction) {
  const frontendOut = path.join(__dirname, '..', '..', 'frontend', 'out');
  app.use(express.static(frontendOut));
  // SPA fallback: 所有非 API 路由返回 index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    const filePath = path.join(frontendOut, req.path === '/' ? 'index.html' : req.path, 'index.html');
    res.sendFile(filePath, (err) => {
      if (err) {
        // fallback to root index.html for SPA routing
        res.sendFile(path.join(frontendOut, 'index.html'));
      }
    });
  });
}

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'API 端点不存在' });
});

// 初始化数据库并种子数据
function initDatabase() {
  const db = getDb();
  // 检查是否已有数据，无数据则自动种子
  const row = db.prepare('SELECT COUNT(*) as count FROM security_stats').get() as any;
  if (row.count === 0) {
    console.log('🌱 数据库为空，自动生成演示数据...');
    seedDemoData(db);
  } else {
    console.log('📊 数据库已有数据，跳过种子');
  }
}

// 启动服务
initDatabase();

app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════');
  console.log('  🛡️  智盾校园 · AI 安全驾驶舱');
  console.log('  Campus AI Security Cockpit');
  console.log('═══════════════════════════════════════════');
  console.log(`  ✅ 服务已启动: http://localhost:${PORT}`);
  console.log(`  🤖 AI 模式: ${process.env.AI_PROVIDER || 'demo'}`);
  console.log(`  🌍 环境: ${isProduction ? '生产' : '开发'}`);
  if (isProduction) {
    console.log(`  🎨 前端静态文件已就绪`);
  }
  console.log('═══════════════════════════════════════════');
});

export default app;
