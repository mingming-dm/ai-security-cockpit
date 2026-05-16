import { Router, Request, Response } from 'express';
import { getDb } from '../database';

const router = Router();

router.get('/dashboard', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];

    // 今日统计
    const todayStats = db.prepare(
      `SELECT * FROM security_stats WHERE date = ?`
    ).get(today) as any;

    // 累计统计
    const totalStats = db.prepare(`
      SELECT
        COALESCE(SUM(total_scans), 0) as total_scans,
        COALESCE(SUM(risks_found), 0) as total_risks,
        COALESCE(SUM(frauds_detected), 0) as total_frauds,
        COALESCE(SUM(prompts_blocked), 0) as total_blocked
      FROM security_stats
    `).get() as any;

    // 近7天趋势
    const trend = db.prepare(`
      SELECT date, total_scans, risks_found, frauds_detected, prompts_blocked
      FROM security_stats
      WHERE date >= date('now', '-7 days')
      ORDER BY date ASC
    `).all() as any[];

    // 安全评分 (基于风险比例)
    const totalScans = totalStats.total_scans || 1;
    const riskRatio = totalStats.total_risks / totalScans;
    const securityScore = Math.max(0, Math.round(100 - riskRatio * 100));

    res.json({
      today: todayStats || {
        date: today,
        total_scans: 0,
        risks_found: 0,
        frauds_detected: 0,
        prompts_blocked: 0,
      },
      total: totalStats,
      trend,
      securityScore,
      riskRatio: Math.round(riskRatio * 100),
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: '统计查询失败' });
  }
});

router.get('/recent-detections', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const limit = parseInt(req.query.limit as string) || 10;
    const logs = db.prepare(
      `SELECT id, type, input_text, risk_level, created_at FROM detection_logs
       ORDER BY created_at DESC LIMIT ?`
    ).all(limit);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: '查询失败' });
  }
});

export default router;
