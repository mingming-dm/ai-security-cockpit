import { Router, Request, Response } from 'express';
import { detectFraud } from '../services/ruleEngine';
import { chatCompletion } from '../services/aiProvider';
import { getDb } from '../database';

const router = Router();

router.post('/detect', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: '请提供待检测的消息内容' });
    }
    if (text.length > 5000) {
      return res.status(400).json({ error: '文本长度超过限制' });
    }

    let aiAnalysis = '';
    try {
      aiAnalysis = await chatCompletion(
        `你是 AI 诈骗识别专家。分析以下消息是否具有诈骗特征：
        1. 是否有欺诈性话术
        2. 是否为 AI 生成的诈骗内容
        3. 利用了哪些心理操控手段
        请用中文分析，不超过150字。如果正常则回复"未发现诈骗特征"。`,
        text
      );
    } catch {}

    const result = detectFraud(text);

    const db = getDb();
    db.prepare(
      `INSERT INTO detection_logs (type, input_text, result_json, risk_level)
       VALUES ('fraud', ?, ?, ?)`
    ).run(text.substring(0, 500), JSON.stringify(result), result.riskLevel);

    const today = new Date().toISOString().split('T')[0];
    db.prepare(
      `INSERT INTO security_stats (date, total_scans, frauds_detected)
       VALUES (?, 1, ?)
       ON CONFLICT(date) DO UPDATE SET
       total_scans = total_scans + 1,
       frauds_detected = frauds_detected + ?`
    ).run(today, result.riskLevel !== 'safe' ? 1 : 0, result.riskLevel !== 'safe' ? 1 : 0);

    res.json({
      ...result,
      aiAnalysis: aiAnalysis || null,
    });
  } catch (err: any) {
    console.error('Fraud detect error:', err);
    res.status(500).json({ error: '检测服务异常' });
  }
});

router.get('/history', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const limit = parseInt(req.query.limit as string) || 20;
    const logs = db.prepare(
      `SELECT id, type, input_text, risk_level, created_at FROM detection_logs
       WHERE type = 'fraud' ORDER BY created_at DESC LIMIT ?`
    ).all(limit);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: '查询失败' });
  }
});

export default router;
