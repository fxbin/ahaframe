# AhaFrame zh-CN 本土化规范 — v1.0

Status: active editorial contract for `release/zh-cn-v1`  
Parent: #42  
Milestone: #44

## 1. 目标

AhaFrame 中文版不是英文站的逐句翻译，而是面向中文技术用户的**语义等价重写**。

中文文本必须同时满足：

1. 技术含义不变；
2. Failure-first 学习路径不变；
3. 工程边界不被语言模糊；
4. 中文读起来像一位工程师在给另一位工程师解释系统；
5. 不为了“全中文”而发明行业里并不存在的术语。

English remains the conceptual reference. Chinese copy may change sentence order, information density, examples, headings, and rhythm when that improves naturalness without changing the claim.

---

## 2. Review model

本规范采用 `roundtable-forge` 的四席评审模型：

- **AI Engineering Educator**：守住技术正确性、层级边界、失败模式与因果关系；
- **Chinese Technical Editor**：守住中文语法、术语一致性、标点、节奏与可读性；
- **Product / UX Localization Writer**：守住操作性文案、认知负荷、CTA 与界面长度；
- **i18n / SEO Engineer**：守住 locale、route、metadata、hreflang、analytics 与未来扩展性。

Runtime claim: `soft_orchestration_only`。这是结构化 AI 评审，不代表真实专家、机构或个人背书。

> 本圆桌讨论由 AI 生成，所有角色发言均基于公开资料的推演与思想实验，不代表任何真实个人、机构或版权角色的官方立场。所涉及虚构角色归属其各自权利人，仅供个人学习与交流使用，请勿用于商业目的或对外冒充真实人物观点。请仔细甄别内容。

---

## 3. Voice

中文 AhaFrame 的默认声音：

> 技术扎实、表达克制、先讲因果，再讲结论。

### 应该这样写

- 短句优先，但不把技术逻辑切碎；
- 先说“发生了什么”，再说“为什么”，最后说“工程上怎么决定”；
- 允许保留熟悉的英文术语；
- 用“失败条件 / 边界 / 权衡”替代空泛总结；
- CTA 使用动词，尽量控制在 2–8 个汉字；
- 标题表达问题或结果，不堆概念名词。

### 避免

- 赋能、抓手、闭环、全链路、降本增效、重塑、颠覆、革命性；
- “通过……来实现……”连续套句；
- “使得用户能够……”一类机器翻译结构；
- 无必要的“进行 / 实现 / 完成 / 相关 / 相应”；
- 为了对齐英文结构而使用不自然的长定语；
- 把英文名词逐个汉化后重新拼接。

---

## 4. Terminology glossary

下表是 v1 锁定词汇。除非 PR 明确提出 glossary change，否则正文应遵守。

| English | zh-CN preferred | First meaningful use | Notes |
|---|---|---|---|
| Prompt | Prompt / 提示词 | `Prompt（提示词）` when teaching the basic term | 在 “Prompt Engineering” 层级名中保留 Prompt，避免把 prompt 与 instruction 混为一谈 |
| Prompt Engineering | Prompt 工程 | `Prompt 工程` | 不用“提示词工程学” |
| Context | 上下文 | `上下文（Context）` only when needed | 正文默认“上下文” |
| Context Engineering | 上下文工程 | — | 强调检索、压缩、记忆、窗口预算等工程责任 |
| Context Window | 上下文窗口 | `上下文窗口（Context Window）` | 后文只写“上下文窗口” |
| Agent | Agent / 智能体 | `Agent（智能体）` | 技术页面优先 Agent；面向宽泛用户时可用“智能体” |
| Agent Harness | Agent Harness（运行约束层） | 保留英文 + 一次解释 | 暂不发明单一中文名；含工具、权限、校验、审批、终止等运行时约束 |
| Harness Engineering | Harness 工程 | 首次附“运行约束与可靠性” | 层级名保留 Harness，避免误译为“框架” |
| Loop | Loop / 迭代循环 | `Loop（迭代循环）` | 指单个 Agent 的局部决策—行动—观察—恢复循环 |
| Loop Engineering | Loop 工程 | — | 与 Graph 的全局编排严格区分 |
| Graph | Graph / 工作流图 | `Graph（工作流图）` | 当重点是 topology/orchestration 时可写“编排图” |
| Graph Engineering | Graph 工程 | 首次附“工作流编排” | 不等于“多 Agent” |
| Evaluation | 评测 | `评测（Evaluation）` | 当强调体系或层级时可保留 Evaluation |
| Evaluation Engineering | 评测工程 | — | 重点是证据、切片、门槛与发布决策 |
| RAG | RAG | `RAG（检索增强生成）` | 后文直接 RAG |
| Retrieval | 检索 | — | 不用“召回”替代全部 retrieval；召回只用于 recall 语境 |
| Reranker | 重排序器 / Reranker | `Reranker（重排序器）` | 控件空间不足时保留 Reranker |
| Tool Calling | 工具调用 | — | 与“函数调用”按具体 API 语境区分 |
| Checkpoint | 检查点 | — | Lab 中保存对比状态的稳定译法 |
| Preset | 预设 | — | 如“可靠性预设” |
| Failure Mode | 失败模式 | — | 不写“故障模式”，除非具体硬件/系统故障语境 |
| Failure Diagnosis | 失败诊断 | — | 诊断文本应指向根因和责任层 |
| Trade-off | 权衡 | — | 需要时写“取舍”；避免“权衡取舍”重复 |
| Baseline | 基线 | — | 表示对比基准状态 |
| Release Gate | 发布门槛 / 发布 Gate | 首次可双语 | UI 空间有限时可用“发布 Gate” |
| SHIP | SHIP | 旁边解释“可以发布” | 决策枚举值保持英文，不改内部语义 |
| BLOCK | BLOCK | 旁边解释“阻止发布” | 同上 |
| INCONCLUSIVE | INCONCLUSIVE | 旁边解释“证据不足，无法判断” | 不译成“失败” |
| Synthetic Metrics | 教学模拟指标 | 首次附“不是实际基准测试结果” | 禁止称为“真实性能指标” |
| Strong Aha | Strong Aha / 强 Aha | 内部分析保留 `Strong Aha` | 用户界面不必暴露内部指标名 |

### 不要强制统一的词

以下词按上下文选择，不做机械一对一映射：

- `Graph`：工作流图 / 编排图 / Graph；
- `Agent`：Agent / 智能体；
- `Prompt`：Prompt / 提示词；
- `Evaluation`：评测 / Evaluation；
- `Gate`：门槛 / Gate。

规则：**概念边界优先于词面统一。**

---

## 5. Six-layer canonical wording

英文：

```text
Prompt shapes behavior.
Context shapes knowledge.
Harness shapes reliability.
Loop shapes iteration.
Graph shapes orchestration.
Evaluation proves whether it works.
```

中文 v1 推荐表达：

```text
Prompt 决定行为如何被引导。
上下文决定系统能看到什么信息。
Harness 决定运行时能否可靠受控。
Loop 决定一次任务如何持续迭代。
Graph 决定多个步骤如何被编排。
评测决定我们有没有证据证明它真的可用。
```

说明：这里不追求逐词对齐，而是明确每一层的工程责任。后续页面如果缩短句子，仍必须保留这些责任边界。

### 必须守住的边界

- Prompt ≠ Context：写得更清楚不能补回缺失知识；
- Prompt ≠ Harness：文字约束不能替代真实权限、校验、审批和终止机制；
- Harness ≠ Loop：Harness 负责运行约束，Loop 负责局部迭代；
- Loop ≠ Graph：Loop 是局部循环，Graph 是全局步骤/分支/并行/汇合编排；
- Evaluation ≠ Fix：评测发现问题，不等于自动修复候选系统。

---

## 6. Learning model wording

`SEE → PLAY → BREAK → AHA → BUILD` 保留英文视觉标签，因为它属于品牌化学习循环。

中文解释建议：

- **SEE**：先把原本看不见的系统状态呈现出来；
- **PLAY**：改变一个参数，观察结果如何变化；
- **BREAK**：主动触发失败，让隐藏假设暴露出来；
- **AHA**：把原因、结果和工程边界连起来；
- **BUILD**：把这个心智模型带回真实架构与发布决策。

不要译成五个孤立口号。

---

## 7. UI copy rules

### Buttons / CTA

优先：

```text
开始学习
打开实验
查看失败原因
应用预设
与基线对比
保存检查点
加入内测
```

避免：

```text
点击此处开始您的学习之旅
立即体验我们的交互式实验功能
```

### Controls

格式优先：

```text
最大步数
重试次数
超时时间
是否校验结果
人工审批位置
```

不要为了与英文长度一致而缩成难懂缩写。

### Metrics

数字卡片必须区分：

- 事实状态；
- 教学模拟指标；
- 发布决策。

`Reliability 82` 这类值如果来自确定性教学模型，必须在页面附近保留“教学模拟指标”披露。

---

## 8. Failure diagnosis writing pattern

失败诊断使用三段式：

```text
症状：发生了什么？
原因：是哪一个工程责任出了问题？
边界：这一层能修什么，不能修什么？
```

示例：

> **症状**：Agent 遵循了更明确的退款指令，但仍然可以直接执行高风险工具。  
> **原因**：Prompt 解决了行为表达问题，却没有改变工具权限。  
> **边界**：这里需要 Harness 中的权限、校验或审批机制，而不是继续堆 Prompt。

避免只写：

> 当前配置存在风险，请优化参数。

---

## 9. Synthetic metric disclosure

推荐标准文案：

> **这些数值是教学模拟指标。** 它们用于展示参数变化与工程权衡，不代表真实模型、供应商或生产系统的基准测试结果。

短版：

> 教学模拟指标，不是实际基准测试结果。

禁止：

- “模型准确率提升到 92%”——如果不是实测；
- “生产可靠性达到 95 分”——如果是 deterministic simulation。

---

## 10. Punctuation and typography

- 中文正文使用全角标点：`，。；：？！`；
- 英文代码、枚举、路径、变量使用半角标点；
- 中英文之间保持一个可读空格：`调整 Top-K 后`、`Agent 会重试`；
- 数字与中文单位按正常中文习惯：`8 分钟`、`3 次重试`；
- URL、代码、事件名不翻译；
- 不在中文标题末尾加句号；
- 不连续使用多个括号解释术语；首次解释后应自然阅读。

---

## 11. Analytics and invariant language

以下属于工程契约，不做中文化重命名：

```text
scenario IDs
actions
metric keys
preset IDs
checkpoint IDs
analytics event names
strongAha calculation
SHIP / BLOCK / INCONCLUSIVE enum values
```

中文只改变 presentation label / explanation。

例如：

```text
meaningful_interaction   ✅ 保持
meaningful_interaction_zh ❌ 禁止
```

---

## 12. High-value copy review gate

以下内容在最终合并前必须经过四席 Roundtable review：

- 首页 Hero / tagline；
- 六层 AI Engineering Stack；
- 每个 Lab 的 Core Aha；
- failure diagnosis；
- Prompt vs Context / Harness vs Loop / Loop vs Graph 边界；
- Integrated Build 的架构与 release decision；
- Synthetic Metrics 披露；
- Aha feedback 问题与选项；
- Pricing / Early Access 承诺。

Review 输出至少回答：

1. 技术含义有没有漂移？
2. 中文有没有翻译腔？
3. UI 是否过长或模糊？
4. 是否破坏 locale / SEO / analytics 工程契约？

---

## 13. PR acceptance checklist

中文内容 PR 在进入 `release/zh-cn-v1` 前逐项检查：

### Technical fidelity

- [ ] 没有改变 scenario / action / metric / formula 的语义；
- [ ] 没有把一个层的问题错误归到另一个层；
- [ ] Core Aha 与英文概念结论一致；
- [ ] Synthetic Metrics 披露仍然明确。

### Natural Chinese

- [ ] 不是逐句对应英文；
- [ ] 没有明显“通过……来实现……”机器翻译结构；
- [ ] 没有企业黑话；
- [ ] 英文术语保留是因为更自然，而不是漏翻；
- [ ] 标题、CTA、控件在手机宽度下可读。

### Terminology

- [ ] 使用本文件 glossary；
- [ ] 首次出现的专业术语按规则解释；
- [ ] 没有自行创造新的 Agent / Harness / Graph 译名；
- [ ] 若需要修改 glossary，PR 中显式列出变更理由。

### Product / analytics

- [ ] 没有新增中文专用 analytics event；
- [ ] 没有改变内部枚举；
- [ ] 用户可见承诺与英文版本等价，不夸大功能。

---

## 14. Change policy

本文件是 zh-CN 内容的版本化 source of truth。

修改核心术语或六层定义时：

1. PR 必须说明旧词、新词、影响页面；
2. 评估是否需要全站迁移；
3. 不允许同一概念在不同 Lab 中长期存在两个冲突译法；
4. Merge 前至少完成 Technical + Chinese Editor 两个视角复核。

如果只是单句润色、不改变术语和技术含义，不需要升级 glossary version。
