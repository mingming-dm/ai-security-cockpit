import { Router, Request, Response } from 'express';
import { getDb } from '../database';

const router = Router();

// 深度伪造案例数据
const DEEPFAKE_CASES = [
  {
    id: 1,
    title: 'AI 语音克隆冒充亲友诈骗',
    category: '语音伪造',
    riskLevel: 'critical',
    description: '犯罪分子利用 AI 语音合成技术，仅需3-10秒的音频样本，就能克隆出一个人的声音。已有大学生收到"同学"AI语音借款请求被骗的案例。',
    identifyMethod: '1. 注意语音中的机械感和不自然的停顿\n2. 回拨电话确认身份\n3. 设置亲友间专属暗号\n4. 大额转账必须面谈或视频确认',
    realCase: '2024年，某高校学生收到"室友"微信语音消息称遇到紧急情况需要借款5000元。语音听起来很真实，但事后证实是诈骗分子利用社交媒体上的语音信息合成的AI假声音。',
  },
  {
    id: 2,
    title: 'AI 换脸视频面试诈骗',
    category: '视频伪造',
    riskLevel: 'high',
    description: 'Deepfake 技术可以实时换脸，诈骗者利用此技术在视频通话中冒充招聘方或校方人员，骗取学生个人信息和费用。',
    identifyMethod: '1. 观察面部边缘是否有模糊或闪烁\n2. 让对方面部侧转或用手遮挡面部\n3. 观察眨眼频率是否自然\n4. 注意肤色与颈部是否一致',
    realCase: '某高校大四学生在求职过程中，通过视频面试"通过"了一家"知名企业"，缴纳了"培训费"后无法联系。事后发现面试视频中的HR是AI换脸伪造的。',
  },
  {
    id: 3,
    title: 'AI 生成虚假学术通知',
    category: '内容伪造',
    riskLevel: 'medium',
    description: '利用 ChatGPT 等工具生成看似官方的学术会议通知、论文录用通知、竞赛获奖通知等，诱导学生支付注册费。',
    identifyMethod: '1. 在官方网站核实信息\n2. 检查发件人邮箱是否为官方域名\n3. 注意通知的语气是否过于急迫\n4. 咨询导师或学校相关部门',
    realCase: '多名研究生收到了一封"国际学术会议"的论文录用通知，排版精美，内容专业，但会议网站是假的，注册费被骗。',
  },
  {
    id: 4,
    title: 'AI 伪造校园通知诈骗',
    category: '文本伪造',
    riskLevel: 'high',
    description: '诈骗者使用 AI 生成看似官方的校园通知（缴费通知、奖学金公示、选课提醒等），诱导学生点击钓鱼链接或转账。',
    identifyMethod: '1. 所有官方通知都会在学校官网/OA系统同步发布\n2. 检查落款单位是否真实存在\n3. 注意链接域名是否为学校官方域名\n4. 拨打学校公开电话核实',
    realCase: '某高校多名学生收到"教务处"发送的"补缴学费通知"短信，要求24小时内转账到指定账户，否则将被退学处理。后证实为AI生成的批量诈骗短信。',
  },
  {
    id: 5,
    title: '深度伪造技术原理科普',
    category: '技术科普',
    riskLevel: 'low',
    description: 'Deepfake 核心技术是 GAN（生成对抗网络），由生成器和判别器两个神经网络相互博弈。生成器创造假内容，判别器尝试识别真假。经过数百万次训练后，生成器可以创造出以假乱真的内容。',
    identifyMethod: '技术层面的检测方法：\n1. 频域分析：检测图像在频率域中的异常\n2. 生物信号分析：心跳、脉搏引起的面部微变化\n3. 光照一致性检测\n4. 元数据分析：检查文件的 EXIF 信息',
    realCase: '学术界正在积极研发 Deepfake 检测工具，包括 Microsoft Video Authenticator、Deepware Scanner 等，但技术攻防是持续的军备竞赛。',
  },
];

router.get('/cases', (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    let cases = DEEPFAKE_CASES;
    if (category && category !== 'all') {
      cases = cases.filter(c => c.category === category);
    }
    res.json({ cases, total: cases.length });
  } catch (err) {
    res.status(500).json({ error: '查询失败' });
  }
});

router.get('/cases/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const caseItem = DEEPFAKE_CASES.find(c => c.id === id);
    if (!caseItem) {
      return res.status(404).json({ error: '案例未找到' });
    }
    res.json({ case: caseItem });
  } catch (err) {
    res.status(500).json({ error: '查询失败' });
  }
});

export default router;
