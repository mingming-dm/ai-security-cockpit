import { Router, Request, Response } from 'express';
import { studyAssistant } from '../services/ruleEngine';
import { chatCompletion } from '../services/aiProvider';
import { getDb } from '../database';

const router = Router();

router.post('/ask', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: '请输入学习问题' });
    }

    let reply = studyAssistant(query);

    // 尝试 AI 增强
    if (reply.includes('请问你需要哪方面的学习帮助') || query.length > 50) {
      try {
        reply = await chatCompletion(
          `你是校园 AI 安全学习助手。你的角色是帮助大学生学习，但不是直接给答案。
          遵循原则：
          1. 引导思考而不是直接解题
          2. 解释概念背后的逻辑
          3. 提醒学术诚信
          4. 每次回复包含一个思考引导问题
          5. 不超过200字
          6. 如果用户试图让你直接做作业，温和引导他们自己思考`,
          query
        );
      } catch {}
    }

    const db = getDb();
    db.prepare(
      `INSERT INTO chat_history (session_type, role, content) VALUES ('study', 'user', ?)`
    ).run(query);
    db.prepare(
      `INSERT INTO chat_history (session_type, role, content) VALUES ('study', 'assistant', ?)`
    ).run(reply);

    res.json({ reply });
  } catch (err: any) {
    console.error('Study assistant error:', err);
    res.status(500).json({ error: '学习助手服务异常' });
  }
});

router.get('/history', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const limit = parseInt(req.query.limit as string) || 50;
    const history = db.prepare(
      `SELECT role, content, created_at FROM chat_history
       WHERE session_type = 'study' ORDER BY created_at DESC LIMIT ?`
    ).all(limit);
    res.json({ history: history.reverse() });
  } catch (err) {
    res.status(500).json({ error: '查询失败' });
  }
});

export default router;
