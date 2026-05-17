/**
 * 内置规则引擎 — Demo 模式下的 AI 安全检测
 * 无需任何 API Key 即可运行，适合竞赛 Demo 展示
 */

// 敏感信息模式
const SENSITIVE_PATTERNS = [
  { pattern: /\b\d{17}[\dXx]\b/g, label: '身份证号码' },
  { pattern: /\b1[3-9]\d{9}\b/g, label: '手机号码' },
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, label: '邮箱地址' },
  { pattern: /\b(?:\d{4}[ -]?){4}\d{4}\b/g, label: '银行卡号' },
  { pattern: /\b(?:password|密码|secret|密钥)\s*[:=]\s*\S+/gi, label: '密码/密钥泄露' },
  { pattern: /\b(?:学号|studentId)\s*[:=]?\s*\d{8,12}\b/gi, label: '学号' },
  { pattern: /\b\d{6}(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]\b/g, label: '身份证号(18位)' },
  { pattern: /\b(?:住址|地址|address)\s*[:=]\s*\S+/gi, label: '家庭住址' },
  { pattern: /\b\d{6}\s*\d{6,}\b/g, label: '详细地址编码' },
];

// 越狱/提示注入关键词
const JAILBREAK_PATTERNS = [
  { pattern: /忽略.*(?:所有|一切|以上).*(?:指令|规则|限制)/gi, label: '指令覆盖攻击', severity: 'high' },
  { pattern: /DAN\s*(?:模式|mode)|do\s*anything\s*now/gi, label: 'DAN越狱', severity: 'high' },
  { pattern: /假装|扮演.*(?:角色|role).*(?:没有|不受|无需).*(?:限制|约束|规则)/gi, label: '角色扮演越狱', severity: 'high' },
  { pattern: /你.*(?:必须|一定).*(?:忽略|忘记|无视).*(?:安全|规则|限制)/gi, label: '强制指令注入', severity: 'high' },
  { pattern: /system\s*:\s*|developer\s*:\s*|<\|im_start\|>/gi, label: '系统提示注入', severity: 'critical' },
  { pattern: /输出.*(?:原始|未经).*(?:prompt|提示词|指令)/gi, label: '提示词泄露', severity: 'high' },
  { pattern: /(?:忽略|忘记).*(?:你|above|之前).*(?:所有|一切)/gi, label: '上下文重置攻击', severity: 'medium' },
  { pattern: /从.*(?:现在|此刻).*开始.*你是/gi, label: '身份劫持', severity: 'high' },
];

// 诈骗识别模式
const FRAUD_PATTERNS = [
  { pattern: /(?:点击|打开).*链接.*(?:领取|获得|兑换)/gi, label: '钓鱼链接引诱', severity: 'high' },
  { pattern: /(?:紧急|立刻|马上).*(?:转账|汇款|支付)/gi, label: '紧急转账诈骗', severity: 'critical' },
  { pattern: /(?:中奖|抽中|恭喜).*(?:万元|大奖|奖金)/gi, label: '虚假中奖信息', severity: 'high' },
  { pattern: /(?:兼职|刷单|日赚|躺赚).*(?:元|块|钱)/gi, label: '刷单诈骗', severity: 'high' },
  { pattern: /(?:你的.*账号|账户).*(?:异常|被盗|风险)/gi, label: '账号安全恐吓', severity: 'high' },
  { pattern: /(?:客服|工作人员).*(?:退款|理赔|退货)/gi, label: '假冒客服', severity: 'medium' },
  { pattern: /(?:公检法|公安|法院|检察院).*(?:涉案|违法|配合)/gi, label: '冒充公检法', severity: 'critical' },
  { pattern: /(?:贷款|借款|借钱).*(?:无抵押|秒批|零利息)/gi, label: '虚假贷款', severity: 'high' },
  { pattern: /(?:交学费|交培训费|交书本费).*(?:转账|扫码)/gi, label: '校园缴费诈骗', severity: 'high' },
  { pattern: /AI\s*(?:换脸|合成|生成).*(?:视频|语音|照片).*(?:诈骗|骗取)/gi, label: 'AI诈骗关联', severity: 'critical' },
];

// 不良/违规言论模式
const OFFENSIVE_PATTERNS = [
  // 人身攻击与辱骂
  { pattern: /(?:傻[逼屄比叉]|[Ss][Bb]|煞笔|啥比|沙比|傻叉|傻X)/g, label: '辱骂性词汇', severity: 'high' },
  { pattern: /(?:尼玛|你[妈馬]|尼[码馬]|nmsl|cnm|草泥马|艹你|操你|草你|日你|干你[娘妈])/gi, label: '人身攻击/辱骂', severity: 'high' },
  { pattern: /(?:脑残|弱智|智障|白痴|废物|垃圾[东西玩意人货])/g, label: '侮辱性词汇', severity: 'high' },
  { pattern: /(?:滚[蛋出开吧]|给老子[滚爬]|去[死屎]吧|去你[妈嗎的]|滚犊子)/g, label: '攻击性驱赶语言', severity: 'high' },
  // 粗鄙/低俗词汇
  { pattern: /(?:[卧我]槽|我[靠操艹]|[卧我]去|尼玛|特么|他妈[的滴]|你丫|[卧我]日|kao|fuck|shit|damn|bitch)/gi, label: '粗鄙/低俗词汇', severity: 'medium' },
  { pattern: /(?:[鸡激][巴八]|[牛逼B]|[屌吊炸]|碉堡|屁[事股话])/g, label: '低俗口语', severity: 'medium' },
  // 歧视与仇恨言论
  { pattern: /(?:歧视|看不起|瞧不起).*(?:农村|外地|穷人|农民工|乡下)/g, label: '地域/阶层歧视', severity: 'critical' },
  { pattern: /(?:地域黑|河南人偷|东北人.*(?:粗鲁|野蛮)|上海人.*(?:小气|排外))/g, label: '地域攻击', severity: 'critical' },
  { pattern: /(?:女生.*(?:就该|活该|没用)|男生.*(?:就该|活该|没用)|娘炮|女拳|男拳)/g, label: '性别歧视/攻击', severity: 'critical' },
  { pattern: /(?:[胖肥].*(?:猪|死|丑)|长[得]?.*丑.*[死爆要命])/g, label: '外貌羞辱', severity: 'high' },
  // 威胁与恐吓
  { pattern: /(?:信不信.*(?:打[死你]|弄[死你]|[砍剁][了你])|你.*等着.*[瞧看]|放学.*别[走跑]|我[要就].*(?:弄死|打死|杀了|灭了)你)/g, label: '人身威胁/恐吓', severity: 'critical' },
  { pattern: /(?:曝光你|人肉你|查你.*[地址IP信息]|你[家爸妈父母].*地址)/g, label: '人肉搜索威胁', severity: 'critical' },
  // 骚扰与霸凌
  { pattern: /(?:约[吗不炮]|来[一几]发|上床|开房|做[爱我]|陪[我睡]|约不约|yp|ons)/gi, label: '骚扰性内容', severity: 'high' },
  { pattern: /(?:孤立你|别和.*[玩交]|不要.*理|大家.*孤立|全班.*针对)/g, label: '校园霸凌倾向', severity: 'critical' },
  // 自残与暴力
  { pattern: /(?:自杀|自残|割腕|跳楼|不想活|[活過]不下去了|我想[死]|活[着著]没意思)/g, label: '自残/自杀倾向', severity: 'critical' },
  { pattern: /(?:砍死|捅死|枪杀|炸[了掉]|放火|毒死|弄死|灭门)/g, label: '暴力倾向', severity: 'critical' },
  // 违法内容
  { pattern: /(?:代考|替考|买[答案題]|作弊[器具]|四六级[答案]|期末考试[答案])/g, label: '学术作弊', severity: 'high' },
  { pattern: /(?:[卖出售].*(?:毒品|冰毒|大麻|[摇搖頭]头丸|K粉)|吸毒|溜冰)/g, label: '毒品相关', severity: 'critical' },
  { pattern: /(?:网赌|赌博|下注|赌球|澳门[在線线]上|六合彩)/g, label: '赌博相关内容', severity: 'high' },
];

interface ScanResult {
  type: string;
  label: string;
  severity: string;
  matchCount: number;
  matched: string[];
}

interface AnalysisResult {
  riskScore: number;
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  findings: ScanResult[];
  summary: string;
  suggestions: string[];
}

function analyzePatterns(text: string, patterns: typeof SENSITIVE_PATTERNS): ScanResult[] {
  return patterns
    .map(({ pattern, label }) => {
      const matches = text.match(pattern) || [];
      return {
        type: 'sensitive_info',
        label,
        severity: 'medium',
        matchCount: matches.length,
        matched: [...new Set(matches)].slice(0, 3),
      };
    })
    .filter(r => r.matchCount > 0);
}

function analyzeJailbreak(text: string): ScanResult[] {
  return JAILBREAK_PATTERNS.map(({ pattern, label, severity }) => {
    const matches = text.match(pattern) || [];
    return {
      type: 'jailbreak',
      label,
      severity,
      matchCount: matches.length,
      matched: [...new Set(matches)].slice(0, 3),
    };
  }).filter(r => r.matchCount > 0);
}

function analyzeFraud(text: string): ScanResult[] {
  return FRAUD_PATTERNS.map(({ pattern, label, severity }) => {
    const matches = text.match(pattern) || [];
    return {
      type: 'fraud',
      label,
      severity,
      matchCount: matches.length,
      matched: [...new Set(matches)].slice(0, 3),
    };
  }).filter(r => r.matchCount > 0);
}

function analyzeOffensive(text: string): ScanResult[] {
  return OFFENSIVE_PATTERNS.map(({ pattern, label, severity }) => {
    const matches = text.match(pattern) || [];
    return {
      type: 'offensive',
      label,
      severity,
      matchCount: matches.length,
      matched: [...new Set(matches)].slice(0, 3),
    };
  }).filter(r => r.matchCount > 0);
}

function calculateRiskScore(findings: ScanResult[]): number {
  const severityWeights: Record<string, number> = {
    critical: 25,
    high: 15,
    medium: 8,
    low: 3,
  };
  let score = 0;
  for (const f of findings) {
    score += (severityWeights[f.severity] || 0) * f.matchCount;
  }
  return Math.min(100, score);
}

function getRiskLevel(score: number): 'safe' | 'low' | 'medium' | 'high' | 'critical' {
  if (score === 0) return 'safe';
  if (score <= 10) return 'low';
  if (score <= 30) return 'medium';
  if (score <= 60) return 'high';
  return 'critical';
}

function generateSummary(findings: ScanResult[], riskLevel: string): string {
  if (findings.length === 0) {
    return '✅ 未检测到明显风险，内容安全。';
  }
  const typeSummary = findings.map(f => f.label).join('、');
  return `⚠️ 检测到 ${findings.length} 类风险项：${typeSummary}。综合风险等级：【${riskLevel.toUpperCase()}】`;
}

function generateSuggestions(findings: ScanResult[]): string[] {
  const suggestions: string[] = [];
  const types = new Set(findings.map(f => f.type));

  if (types.has('sensitive_info')) {
    suggestions.push('🔐 建议对个人信息进行脱敏处理后再分享');
    suggestions.push('📋 提醒用户不要在 AI 对话中输入真实身份信息');
  }
  if (types.has('jailbreak')) {
    suggestions.push('🛡️ 检测到提示注入风险，建议加强 Prompt 安全策略');
    suggestions.push('⚙️ 可启用输入过滤器自动拦截此类恶意提示');
  }
  if (types.has('fraud')) {
    suggestions.push('🚨 此内容具有诈骗特征，建议立即举报并通知相关人员');
    suggestions.push('📞 如已受骗，请立即联系校园保卫处或拨打 110');
  }
  if (types.has('offensive')) {
    const hasCritical = findings.some(f => f.type === 'offensive' && f.severity === 'critical');
    suggestions.push('⚠️ 检测到不当言论，请立即停止此类发言');
    if (hasCritical) {
      suggestions.push('⛔ 内容涉及严重违规（威胁/歧视/霸凌），建议上报校园管理部门处理');
      suggestions.push('📞 如涉及人身安全威胁，请立即联系校园保卫处');
    } else {
      suggestions.push('💡 请注意网络文明用语，尊重他人，营造良好的交流氛围');
    }
    suggestions.push('📋 根据校园网络使用规范，此类言论可能导致纪律处分');
  }
  if (suggestions.length === 0) {
    suggestions.push('✨ 当前内容风险可控，继续保持良好的安全习惯');
  }

  return suggestions;
}

// 主检测函数
export function detectContentRisk(text: string): AnalysisResult {
  const findings = [
    ...analyzePatterns(text, SENSITIVE_PATTERNS),
    ...analyzeOffensive(text),
  ];
  const riskScore = calculateRiskScore(findings);
  const riskLevel = getRiskLevel(riskScore);

  return {
    riskScore,
    riskLevel,
    findings,
    summary: generateSummary(findings, riskLevel),
    suggestions: generateSuggestions(findings),
  };
}

export function detectPromptInjection(text: string): AnalysisResult {
  const findings = analyzeJailbreak(text);
  const riskScore = calculateRiskScore(findings);
  const riskLevel = getRiskLevel(riskScore);

  return {
    riskScore,
    riskLevel,
    findings,
    summary: generateSummary(findings, riskLevel),
    suggestions: generateSuggestions(findings),
  };
}

export function detectFraud(text: string): AnalysisResult {
  const findings = analyzeFraud(text);
  const riskScore = calculateRiskScore(findings);
  const riskLevel = getRiskLevel(riskScore);

  return {
    riskScore,
    riskLevel,
    findings,
    summary: generateSummary(findings, riskLevel),
    suggestions: generateSuggestions(findings),
  };
}

// AI 安全知识库（用于聊天助手）
const SECURITY_KNOWLEDGE: Record<string, string> = {
  '钓鱼邮件': '钓鱼邮件是网络攻击者伪装成可信来源发送的欺诈邮件。识别方法：\n1. 检查发件人邮箱域名是否正确\n2. 不要点击可疑链接\n3. 留意拼写错误和紧迫性语言\n4. 直接联系发件人确认',
  '密码安全': '校园账号密码安全建议：\n1. 使用至少12位包含大小写字母+数字+符号的密码\n2. 不同平台使用不同密码\n3. 启用双重认证(2FA)\n4. 密码管理器推荐：Bitwarden(开源免费)',
  'wifi安全': '校园 WiFi 安全提醒：\n1. 不要连接不明来源的免费 WiFi\n2. 使用校园 VPN 访问校内资源\n3. 避免在公共 WiFi 下登录重要账号\n4. 关闭手机 WiFi 自动连接功能',
  'ai诈骗': 'AI 诈骗常见形式：\n1. AI 语音克隆冒充亲友借钱\n2. AI 换脸视频冒充老师/领导\n3. ChatGPT 生成虚假学术通知\n防范：遇到转账请求，务必通过电话或当面二次确认！',
  '深度伪造': 'Deepfake（深度伪造）是利用深度学习技术生成或篡改人脸、声音的技术。识别技巧：\n1. 观察面部边缘是否模糊/闪烁\n2. 注意眨眼频率是否异常\n3. 检查光影是否一致\n4. 使用反向图像搜索验证',
  '数据泄露': '校园数据泄露防范：\n1. 不要在 AI 对话中上传包含个人信息的文档\n2. 定期清理浏览器缓存和 AI 对话记录\n3. 注意 APP 权限授予范围\n4. 使用文件加密工具保护敏感文档',
};

export function securityQA(question: string): string {
  const q = question.toLowerCase();
  for (const [keyword, answer] of Object.entries(SECURITY_KNOWLEDGE)) {
    if (q.includes(keyword.toLowerCase())) {
      return answer;
    }
  }
  return '我是校园网络安全助手，可以回答您关于密码安全、钓鱼邮件识别、WiFi安全、AI诈骗防范、深度伪造识别、数据隐私保护等问题。请问您想了解哪方面？';
}

// 安全学习辅助
export function studyAssistant(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('解题') || q.includes('题目') || q.includes('怎么做')) {
    return `📚 学习助手提示：

我理解你想解决这个问题。让我们按照以下思路来分析：

1️⃣ **理解题意**：先明确题目在问什么，关键信息是什么
2️⃣ **知识点定位**：这题考察的核心概念是什么
3️⃣ **分步推导**：逐步推理，而不是直接给答案
4️⃣ **验证答案**：用另一种方法检验结果

💡 请把具体题目发给我，我会引导你一步步推导，而不是直接给最终答案。记住：**"授人以鱼不如授人以渔"**。`;
  }

  if (q.includes('论文') || q.includes('写作')) {
    return `📝 学术写作辅助建议：

1. 请提供论文主题和大致框架
2. 我可以帮你：文献梳理、论证逻辑检查、语言润色建议
3. ⚠️ 注意：AI 生成的文本可能被检测工具识别，请务必：
   - 加入你自己的思考和观点
   - 重新组织语言和结构
   - 正确标注引用来源
4. 使用 AI 辅助写作本身不是作弊，但直接复制粘贴 AI 输出则可能违反学术诚信。`;
  }

  return `🤖 安全学习助手已就绪！

我是你在校园中的 AI 学习伙伴，可以：
- 📖 解释复杂概念
- 🧮 引导解题思路（不直接给答案）
- ✍️ 论文写作方法指导
- 📝 笔记整理和知识梳理
- 🌐 语言学习辅助

⚠️ 使用 AI 学习的注意事项：
1. AI 可能犯错，关键信息需要核实
2. 不要将个人信息或作业原文直接输入
3. AI 是辅助工具，思考的主体应该是你

请问你需要哪方面的学习帮助？`;
}
