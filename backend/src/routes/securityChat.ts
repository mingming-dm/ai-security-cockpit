import { Router, Request, Response } from 'express';
import { securityQA } from '../services/ruleEngine';
import { chatCompletion } from '../services/aiProvider';
import { getDb } from '../database';

const router = Router();

router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: '请输入消息' });
    }

    // 先尝试规则引擎
    let reply = securityQA(message);

    // 如果规则引擎没有匹配，尝试 AI
    if (reply.includes('请问您想了解哪方面')) {
      try {
        reply = await chatCompletion(
          `你是校园网络安全助手，服务于大学生群体。
          你的知识范围：网络安全基础、密码管理、钓鱼邮件识别、WiFi安全、AI诈骗防范、深度伪造识别、数据隐私保护、校园信息安全政策。
          请用亲切友好的语气回答，每次控制在200字以内。如果不确定，诚实告知并建议咨询学校信息技术中心。`,
          message
        );
      } catch {
        // AI 不可用，使用默认回复
        reply = `关于「${message.substring(0, 30)}」的问题，我目前的知识库可能覆盖不全。

        建议你可以：
        1. 📖 查阅校园信息中心的安全指南
        2. 🔍 搜索国家网络安全宣传周相关资料
        3. 📞 联系学校信息技术中心获取帮助

        我可以详细回答以下方面的问题：密码安全、钓鱼邮件识别、WiFi安全、AI诈骗防范、深度伪造识别、数据隐私保护。`;
      }
    }

    // 保存聊天记录
    const db = getDb();
    db.prepare(
      `INSERT INTO chat_history (session_type, role, content) VALUES ('security_chat', 'user', ?)`
    ).run(message);
    db.prepare(
      `INSERT INTO chat_history (session_type, role, content) VALUES ('security_chat', 'assistant', ?)`
    ).run(reply);

    res.json({ reply });
  } catch (err: any) {
    console.error('Security chat error:', err);
    res.status(500).json({ error: '聊天服务异常' });
  }
});

router.get('/history', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const limit = parseInt(req.query.limit as string) || 50;
    const history = db.prepare(
      `SELECT role, content, created_at FROM chat_history
       WHERE session_type = 'security_chat' ORDER BY created_at DESC LIMIT ?`
    ).all(limit);
    res.json({ history: history.reverse() });
  } catch (err) {
    res.status(500).json({ error: '查询失败' });
  }
});

export default router;
