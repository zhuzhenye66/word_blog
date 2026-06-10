

---

# 📘 "单词小英雄" — 二年级英语单词学习助手

## 设计计划书

---

## 一、产品概述

| 维度     | 决策                                                         |
| -------- | ------------------------------------------------------------ |
| **名称** | 单词小英雄 · Word Hero                                       |
| **用户** | 二年级学生（6-8岁），独立操作平板/电脑                       |
| **目标** | 每天自动推送 一个单元的新词 + 复习旧词，用艾宾浩斯曲线对抗遗忘 |
| **风格** | 小动物养成 + 闯关打卡 + 星星收集                             |
| **技术** | 单文件 HTML，localStorage 存所有数据，Web Speech API 发音    |

---

注：一个单元的标识是，images文件夹内图片命名前缀，图片命名规则是：单元-图片名.png，比如：u1-bread.png

## 二、页面结构（4 个主屏幕）

```
┌─────────────────────────────────────────────────┐
│                  底部导航栏                        │
│   🏠 首页   📚 词库   ✏️ 练习   🏆 成就           │
└─────────────────────────────────────────────────┘
```

### 🏠 屏幕 1：首页（每日中心）
```
┌──────────────────────────┐
│     🐣 你的小英雄宠物      │  ← 动物会随着打卡长大
│    （成长进度条）          │
│                          │
│  🔥 连续打卡：X 天        │
│  ⭐ 已掌握：X 个单词      │
│                          │
│  ┌──────────────────┐    │
│  │ 📅 今日任务        │    │
│  │ 🆕 新词：2 个      │    │
│  │ 🔁 复习：5 个      │    │
│  │ [开始学习 →]      │    │
│  └──────────────────┘    │
│                          │
│  ⚠️ 易错词提醒：         │
│  "bike" 错了 3 次 😢     │
└──────────────────────────┘
```

### 📚 屏幕 2：词库管理
```
┌──────────────────────────┐
│  [🔍 搜索] [+ 添加单词]   │
│  [📥 导入] [📤 导出]     │
│                          │
│  ┌─ 单词卡片 ─────────┐  │
│  │ 🚲 bike   自行车    │  │
│  │ 掌握度：●●●○      │  │
│  │ 错3次 | 下次复习：明天│  │
│  │ [编辑] [删除]       │  │
│  └────────────────────┘  │
│  （列表滚动）             │
└──────────────────────────┘
```

### ✏️ 屏幕 3：练习（核心）
```
┌──────────────────────────┐
│  今日进度：▓▓░░░░ 2/7    │
│                          │
│  ┌──────────────────┐    │
│  │  题型区（随机）    │    │
│  │                  │    │
│  │  🎯 看到中文意思   │    │
│  │  "自行车"         │    │
│  │                  │    │
│  │  [____] 拼写输入   │    │
│  │                  │    │
│  │  [确认] [🔊听发音] │    │
│  └──────────────────┘    │
│                          │
│  ✅ 答对：🎉 太棒了！+1⭐ → 1.2s 自动下一题  │
│  ❌ 答错：😊 正确答案是 bike               │
│          → 清空输入框，placeholder 提示抄写 │
│          → 自动朗读正确答案                 │
│          → [✍️ 我记住了，继续] 按钮出现    │
│          → 抄写正确 → ✅ 抄写正确！+0.5⭐  │
│          → 抄错3次 → 自动填入答案，1.2s 继续│
│          → 辨析题(E) 无需抄写，直接继续     │
└──────────────────────────┘
```

### 🏆 屏幕 4：成就 & 统计
```
┌──────────────────────────┐
│  🐣 → 🐤 → 🦊 → 🦁      │
│  动物进化阶段             │
│                          │
│  📊 易错单词 TOP 5       │
│  ┌──────────────────┐    │
│  │ bike  ❌❌❌      │    │
│  │ duck ❌❌         │    │
│  └──────────────────┘    │
│                          │
│  📅 打卡日历（月视图）     │
│  ✅✅✅⬜✅✅✅...       │
│                          │
│  🏅 成就徽章             │
│  · 坚持7天 · 掌握20词    │
└──────────────────────────┘
```

---

## 三、核心数据模型

```javascript
// 单词对象
Word {
  id: number,
  english: "bike",           // 英文拼写
  chinese: "自行车",          // 中文意思
  images: "🚲",               // 图片联系（图片来自项目内images文件夹，此处应该是图片相对路径）
  phonetic: "/baɪk/",        // 音标
  createdAt: timestamp,
  // 学习记录
  ebbingStage: 0,            // 艾宾浩斯阶段 0-6
  nextReviewDate: "2026-03-15",  // 下次复习日期
  correctCount: 0,
  errorCount: 0,
  lastReviewed: null,
  mastered: false            // 阶段6到达后标记已掌握
}

// 用户档案
UserProfile {
  streak: 0,                 // 连续打卡天数
  lastStudyDate: "2026-03-14",
  totalStars: 0,             // 总星星数
  animalLevel: 0,            // 宠物等级 0-5 (蛋→幼崽→小动物→大动物→神兽)
  wordsLearned: 0,
  wordsMastered: 0
}

// 易混淆字母对（默认 + 可扩展）
ConfusablePairs: [
  { letters: ["b", "d"], description: "b 和 d 辨析" },
  { letters: ["p", "q"], description: "p 和 q 辨析" }
]
```

### 艾宾浩斯复习间隔表

| 阶段 | 间隔   | 说明                   |
| ---- | ------ | ---------------------- |
| 0    | 当天   | 刚学的新词             |
| 1    | 1天后  | 第一次复习             |
| 2    | 2天后  | 第二次                 |
| 3    | 4天后  | 第三次                 |
| 4    | 7天后  | 第四次                 |
| 5    | 15天后 | 第五次                 |
| 6    | 30天后 | ✅ 已掌握，移出活跃复习 |

> **规则：** 答对 → 进阶到下一阶段；答错 → 退回阶段 0，错误次数 +1

---

## 四、6 种练习题型（随机混合）

| 题型                | 展示                        | 操作               | 适用场景      |
| ------------------- | --------------------------- | ------------------ | ------------- |
| **A. 看中文拼英文** | 显示 "自行车" + 图片        | 键盘/手写输入英文  | 拼写能力      |
| **B. 听发音拼单词** | 播放 "bike" 发音            | 输入英文拼写       | 听写能力      |
| **C. 字母排序**     | 显示乱序字母 "k i b e"      | 拖拽/点击排成 bike | 拼写结构      |
| **D. 字母填空**     | 显示 "b _ k e"              | 填入缺失字母 i     | 易错字母定位  |
| **E. 易混淆字母**   | 图片+发音，bike 还是 dike？ | 二选一 b 或 d      | b/d、p/q 辨析 |

> 每日练习中，随机混入所有题型，易混淆词额外增加题型 F 的权重。

---

## 四-附、答错处理策略（抄写重练）

回答错误时，不再自动跳转，而是引导小朋友亲手抄写一遍正确答案，加深记忆：

| 步骤 | 行为 | 说明 |
|------|------|------|
| 1. 显示答案 | 反馈区显示 `😊 正确答案是：bike` | 视觉展示 |
| 2. 朗读 | 自动调用 TTS 朗读正确单词 | 听觉强化 |
| 3. 清空输入 | 输入框清空，placeholder 变为 `请抄写：bike` | 引导抄写 |
| 4. 按钮切换 | `[确认]` 隐藏 → `[✍️ 我记住了，继续]` 显示 | 手动控制节奏 |
| 5. 校验抄写 | 比对输入与正确答案（忽略大小写/多余空格） | — |
| 6a. 抄写正确 | `✅ 抄写正确！+0.5 ⭐` → 推进下一题 | 奖励鼓励 |
| 6b. 抄写错误 | 提示剩余次数，再给机会（最多 3 次） | — |
| 6c. 3 次失败 | 自动填入正确答案，1.2s 后继续 | 保护体验，不卡死 |
| ℹ️ 辨析题 (E) | 二选一题型无输入框，直接显示 `[继续]` 按钮 | 特殊处理 |

> **设计理念：** 正确→保持流畅节奏自动跳转；错误→不慌不忙，抄一遍加深肌肉记忆。

---

## 五、激励系统

### 🐣 小动物成长线
```
⭐ 0-50   → 🥚 蛋宝宝
⭐ 51-120 → 🐣 小鸡（破壳啦）
⭐ 121-200→ 🐰 小兔子（蹦蹦跳）
⭐ 201-300→ 🦊 小狐狸（聪明伶俐）
⭐ 301-450→ 🦁 小狮子（单词之王）
⭐ 450+  → 🐉 小龙（传说英雄）
```

### 🏅 成就徽章
- 🌱 **初次学习**：完成第一次练习
- 🔥 **连续 3 天** / **连续 7 天** / **连续 21 天**
- 📘 **掌握 10 词** / **掌握 30 词** / **掌握 60 词**
- 🎯 **全对一天**：当日练习 100% 正确
- 🛡️ **纠错达人**：纠正一个之前常错的单词

---

## 六、技术方案

| 层           | 方案                                                         |
| ------------ | ------------------------------------------------------------ |
| **文件**     | 文件包含了 CSS、HTML 和 JS，word-hero.css — 所有样式，word-hero.js — 所有 JavaScript 逻辑，word-hero-final.html — HTML 结构 + 引用外部文件。<br />图片文件放在项目内images文件夹，每个单词都是一个.png文件， |
| **存储**     | `localStorage`，无需服务器                                   |
| **发音**     | Web Speech API（`speechSynthesis`），浏览器原生支持，简单可靠 |
| **导入导出** | JSON 文件导入/导出，方便你自行录入单词后分发                 |
| **兼容**     | Chrome / Edge / Safari 均可运行，平板触屏友好                |

### Web Speech API 发音（非常简单）
```javascript
function speakWord(word) {
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  utterance.rate = 0.8; // 慢速适合二年级
  speechSynthesis.speak(utterance);
}
```

明白！这个调整很合理，简化了规则也避免了短语的尴尬。让我更新计划。

---

## ✅ 最终规则确认

### 题型适配规则（按词条类型分流）

| 词条类型                                                     | 适用题型                       |
| ------------------------------------------------------------ | ------------------------------ |
| **单词**（english 不含空格/连字符），如 `bread`、`climb`、`kind` | **A、B、C、D、E** 全部题型随机 |
| **短语**（english 含空格或连字符），如 `brush my teeth`、`do paper-cutting`、`dim sum`、`fish ball` | **仅 A、B** 两种题型           |

### 判定规则（短语友好）
- 输入比对时**忽略大小写**
- 输入比对时**多个空格折叠为一个**、**去除首尾空格**
- 连字符 `-` 严格保留（如 `paper-cutting` 必须带 `-`）

### 数据模型简化
**不需要 `keyword` 字段了**（C/D/E 只在单字词上用，直接用 `english`）：

```javascript word-hero.js
const SEED_WORDS = [
  { id: 1,  unit: "u1", english: "baozi",              chinese: "包子",    image: "images/u1-baozi.png" },
  { id: 2,  unit: "u1", english: "bread",              chinese: "面包",    image: "images/u1-bread.png" },
  { id: 3,  unit: "u1", english: "cake",               chinese: "蛋糕",    image: "images/u1-cake.png" },
  { id: 4,  unit: "u1", english: "congee",             chinese: "粥",      image: "images/u1-congee.png" },
  { id: 5,  unit: "u1", english: "dim sum",            chinese: "点心",    image: "images/u1-dim_sum.png" },
  { id: 6,  unit: "u1", english: "fish ball",          chinese: "鱼丸",    image: "images/u1-fish_ball.png" },
  { id: 7,  unit: "u1", english: "rice",               chinese: "米饭",    image: "images/u1-rice.png" },
  { id: 8,  unit: "u2", english: "brush my teeth",     chinese: "刷我的牙",    image: "images/u2-brush.png" },
  { id: 9,  unit: "u2", english: "wash my face",       chinese: "洗我的脸",    image: "images/u2-face.png" },
  { id: 10, unit: "u2", english: "wash my hands",      chinese: "洗我的手",    image: "images/u2-wash_hands.png" },
  { id: 11, unit: "u3", english: "do paper-cutting",   chinese: "剪纸",    image: "images/u3-cutting.png" },
  { id: 12, unit: "u3", english: "kick a shuttlecock", chinese: "踢毽子",  image: "images/u3-kick.png" },
  { id: 13, unit: "u3", english: "do the lion dance",  chinese: "舞狮",    image: "images/u3-lion.png" },
  { id: 14, unit: "u4", english: "climb",              chinese: "爬",      image: "images/u4-climb.png" },
  { id: 15, unit: "u4", english: "fly",                chinese: "飞",      image: "images/u4-fly.png" },
  { id: 16, unit: "u4", english: "run",                chinese: "跑",      image: "images/u4-run.png" },
  { id: 17, unit: "u4", english: "walk",               chinese: "走",      image: "images/u4-walk.png" },
  { id: 18, unit: "u5", english: "helpful",            chinese: "乐于助人的；有帮助的", image: "images/u5-helpful.png" },
  { id: 19, unit: "u5", english: "kind",               chinese: "和善的；善良的",       image: "images/u5-kind.png" },
  { id: 20, unit: "u5", english: "warm",               chinese: "热情的；温暖的",       image: "images/u5-warm.png" },
  { id: 21, unit: "u6", english: "boy",                chinese: "男孩",    image: "images/u6-boy.png" },
  { id: 22, unit: "u6", english: "farm",               chinese: "农场",    image: "images/u6-farm.png" },
  { id: 23, unit: "u6", english: "farmer",             chinese: "农民",    image: "images/u6-farmer.png" },
  { id: 24, unit: "u6", english: "sleep",              chinese: "睡觉",    image: "images/u6-sleep.png" },
  { id: 25, unit: "u6", english: "wolf",               chinese: "狼",      image: "images/u6-wolf.png" }
];
```

---

## 📋 最终分步实现计划（确认版）

| 步骤       | 内容                                                         | 预计    |
| ---------- | ------------------------------------------------------------ | ------- |
| **Step 1** | 骨架：3 个文件 + 4 屏导航 + CSS 基础样式 + localStorage 工具 + 25 词种子数据 | ~250 行 |
| **Step 2** | 词库屏：按单元分组列表 + 搜索 + 增删改 + JSON 导入导出       | ~200 行 |
| **Step 3** | 艾宾浩斯调度：今日任务生成 + 阶段递进/回退 + 单元解锁        | ~120 行 |
| **Step 4** | 练习引擎：5 种题型（短语限 A/B）+ 答题反馈 + TTS 发音 + 完成打卡 | ~350 行 |
| **Step 5** | 首页屏：宠物等级 + 进度条 + 连续打卡 + 今日任务卡片 + 易错提醒 | ~120 行 |
| **Step 6** | 成就屏：动物进化 + 易错 TOP5 + 打卡日历 + 徽章面板           | ~180 行 |
| **Step 7** | 动画微交互：飞星、升级闪光、撒花、按压反馈                   | ~80 行  |

**总计** ≈ 1300 行代码，分布在 3 个文件中。

---

## 🚀 准备就绪

所有设计点已经清晰，没有遗留问题。请切换到 **Agent 模式**，我将开始 **Step 1**：

**Step 1 产出物：**
- `word-hero-final.html` — 4 屏 + 底部导航骨架
- `word-hero.css` — 配色、布局、导航样式（儿童友好暖色调）
- `word-hero.js` — 数据模型、localStorage 工具、Tab 切换、25 词种子数据初始化

完成后，您打开 HTML 即可看到 4 个屏幕之间的导航切换，词库屏会展示全部 25 个单词（仅展示，CRUD 在 Step 2）。

请切换到 Agent 模式以继续。🎯
