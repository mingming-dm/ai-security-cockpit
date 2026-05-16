import { Router, Request, Response } from 'express';
import { detectContentRisk } from '../services/ruleEngine';
import { chatCompletion } from '../services/aiProvider';
import { getDb } from '../database';

const router = Router();

router.post('/detect', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: '请提供待检测文本' });
    }
    if (text.length > 10000) {
      return res.status(400).json({ error: '文本长度超过限制(10000字符)' });
    }

    // 尝试使用 AI 增强检测
    let aiAnalysis = '';
    try {
      aiAnalysis = await chatCompletion(
        `你是校园 AI 安全检测专家。分析以下文本是否包含：
        1. 个人隐私信息（身份证、手机号、地址等）
        2. 敏感校园数据（学号、成绩等）
        3. 不适合公开的内部信息
        请用中文简要分析，不超过150字。`,
        text
      );
    } catch {
      // AI 不可用时使用规则引擎
    }

    const result = detectContentRisk(text);

    // 保存检测日志
    const db = getDb();
    db.prepare(
      `INSERT INTO detection_logs (type, input_text, result_json, risk_level)
       VALUES ('content', ?, ?, ?)`
    ).run(text.substring(0, 500), JSON.stringify(result), result.riskLevel);

    // 更新统计
    const today = new Date().toISOString().split('T')[0];
    db.prepare(
      `INSERT INTO security_stats (date, total_scans, risks_found)
       VALUES (?, 1, ?)
       ON CONFLICT(date) DO UPDATE SET
       total_scans = total_scans + 1,
       risks_found = risks_found + ?`
    ).run(today, result.riskLevel !== 'safe' ? 1 : 0, result.riskLevel !== 'safe' ? 1 : 0);

    res.json({
      ...result,
      aiEnhanced: !!aiAnalysis,
      aiAnalysis: aiAnalysis || null,
    });
  } catch (err: any) {
    console.error('Content detect error:', err);
    res.status(500).json({ error: '检测服务异常' });
  }
});

// 获取检测历史
router.get('/history', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const limit = parseInt(req.query.limit as string) || 20;
    const logs = db.prepare(
      `SELECT id, type, input_text, risk_level, created_at FROM detection_logs
       WHERE type = 'content' ORDER BY created_at DESC LIMIT ?`
    ).all(limit);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: '查询失败' });
  }
});

export default router;
