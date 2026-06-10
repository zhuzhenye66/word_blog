/* ==================================================================
   单词小英雄 · Word Hero - JavaScript 核心逻辑
   ================================================================== */

// ========== 艾宾浩斯复习间隔表 ==========
const EBBING_INTERVALS = [0, 1, 2, 4, 7, 15, 30]; // 天数: 当天/1天/2天/4天/7天/15天/30天
const UNITS = ["u1", "u2", "u3", "u4", "u5", "u6"];

// ========== 动物等级定义 ==========
const ANIMAL_LEVELS = [
  { stars: 0,    emoji: "🥚", name: "蛋宝宝" },
  { stars: 51,   emoji: "🐣", name: "小鸡" },
  { stars: 121,  emoji: "🐰", name: "小兔子" },
  { stars: 201,  emoji: "🦊", name: "小狐狸" },
  { stars: 301,  emoji: "🦁", name: "小狮子" },
  { stars: 450,  emoji: "🐉", name: "小龙" },
];

// ========== 种子数据 ==========
const SEED_WORDS = [
  // U1 食物
  { id: 1,  unit: "u1", english: "baozi",             chinese: "包子",                 image: "images/u1-baozi.png",     phonetic: "" },
  { id: 2,  unit: "u1", english: "bread",             chinese: "面包",                 image: "images/u1-bread.png",     phonetic: "/brɛd/" },
  { id: 3,  unit: "u1", english: "cake",              chinese: "蛋糕",                 image: "images/u1-cake.png",      phonetic: "/keɪk/" },
  { id: 4,  unit: "u1", english: "congee",            chinese: "粥",                   image: "images/u1-congee.png",    phonetic: "" },
  { id: 5,  unit: "u1", english: "dim sum",           chinese: "点心",                 image: "images/u1-dim_sum.png",   phonetic: "" },
  { id: 6,  unit: "u1", english: "fish ball",         chinese: "鱼丸",                 image: "images/u1-fish_ball.png", phonetic: "" },
  { id: 7,  unit: "u1", english: "rice",              chinese: "米饭",                 image: "images/u1-rice.png",      phonetic: "/raɪs/" },

  // U2 日常清洁（短语）
  { id: 8,  unit: "u2", english: "brush my teeth",    chinese: "刷我的牙",                 image: "images/u2-brush.png",     phonetic: "" },
  { id: 9,  unit: "u2", english: "wash my face",      chinese: "洗我的脸",                 image: "images/u2-face.png",      phonetic: "" },
  { id: 10, unit: "u2", english: "wash my hands",     chinese: "洗我的手",                 image: "images/u2-wash_hands.png",phonetic: "" },

  // U3 传统活动（短语）
  { id: 11, unit: "u3", english: "do paper-cutting",  chinese: "剪纸",                 image: "images/u3-cutting.png",   phonetic: "" },
  { id: 12, unit: "u3", english: "kick a shuttlecock",chinese: "踢毽子",               image: "images/u3-kick.png",      phonetic: "" },
  { id: 13, unit: "u3", english: "do the lion dance", chinese: "舞狮",                 image: "images/u3-lion.png",      phonetic: "" },

  // U4 动作（单字词）
  { id: 14, unit: "u4", english: "climb",             chinese: "爬",                   image: "images/u4-climb.png",     phonetic: "" },
  { id: 15, unit: "u4", english: "fly",               chinese: "飞",                   image: "images/u4-fly.png",       phonetic: "" },
  { id: 16, unit: "u4", english: "run",               chinese: "跑",                   image: "images/u4-run.png",       phonetic: "" },
  { id: 17, unit: "u4", english: "walk",              chinese: "走",                   image: "images/u4-walk.png",      phonetic: "" },

  // U5 性格（单字词）
  { id: 18, unit: "u5", english: "helpful",           chinese: "乐于助人的；有帮助的", image: "images/u5-helpful.png",   phonetic: "" },
  { id: 19, unit: "u5", english: "kind",              chinese: "和善的；善良的",       image: "images/u5-kind.png",      phonetic: "" },
  { id: 20, unit: "u5", english: "warm",              chinese: "热情的；温暖的",       image: "images/u5-warm.png",      phonetic: "" },

  // U6 人物/场景（单字词）
  { id: 21, unit: "u6", english: "boy",               chinese: "男孩",                 image: "images/u6-boy.png",       phonetic: "" },
  { id: 22, unit: "u6", english: "farm",              chinese: "农场",                 image: "images/u6-farm.png",      phonetic: "" },
  { id: 23, unit: "u6", english: "farmer",            chinese: "农民",                 image: "images/u6-farmer.png",    phonetic: "" },
  { id: 24, unit: "u6", english: "sleep",             chinese: "睡觉",                 image: "images/u6-sleep.png",     phonetic: "" },
  { id: 25, unit: "u6", english: "wolf",              chinese: "狼",                   image: "images/u6-wolf.png",      phonetic: "" },
];

// ========== 全局状态 ==========
let appState = {
  words: [],           // 所有单词对象（含学习记录字段）
  profile: {           // 用户档案
    streak: 0,
    lastStudyDate: "",
    totalStars: 0,
    studyDates: [],    // 打卡日期数组 ["2026-03-15", ...]
  },
  currentUnit: "u1",   // 当前学习单元
};

// ========== localStorage 工具 ==========
function saveState() {
  localStorage.setItem("wordHero_words", JSON.stringify(appState.words));
  localStorage.setItem("wordHero_profile", JSON.stringify(appState.profile));
  localStorage.setItem("wordHero_currentUnit", appState.currentUnit);
}

function loadState() {
  const savedWords = localStorage.getItem("wordHero_words");
  const savedProfile = localStorage.getItem("wordHero_profile");
  const savedUnit = localStorage.getItem("wordHero_currentUnit");

  if (savedWords) {
    appState.words = JSON.parse(savedWords);
  } else {
    // 首次加载，用种子数据初始化
    appState.words = SEED_WORDS.map(w => ({
      ...w,
      ebbingStage: 0,
      nextReviewDate: "",
      correctCount: 0,
      errorCount: 0,
      lastReviewed: null,
      mastered: false,
    }));
    saveState();
  }

  if (savedProfile) {
    appState.profile = JSON.parse(savedProfile);
  }

  if (savedUnit) {
    appState.currentUnit = savedUnit;
  } else {
    // 自动找出第一个未完成的单元
    for (const unit of UNITS) {
      const unitWords = appState.words.filter(w => w.unit === unit);
      if (unitWords.some(w => w.ebbingStage === 0 && !w.lastReviewed)) {
        appState.currentUnit = unit;
        break;
      }
    }
  }
}

// ========== 屏幕切换 ==========
function switchScreen(name) {
  // 隐藏所有屏幕
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  // 显示目标屏幕
  const screenMap = {
    home: "screenHome",
    wordBank: "screenWordBank",
    practice: "screenPractice",
    achievements: "screenAchievements",
  };
  const target = document.getElementById(screenMap[name]);
  if (target) target.classList.add("active");

  // 更新底部导航
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  const navBtn = document.querySelector(`.nav-btn[data-screen="${name}"]`);
  if (navBtn) navBtn.classList.add("active");

  // 进入各自屏幕时刷新内容
  if (name === "home") renderHome();
  if (name === "wordBank") renderWordBank();
  if (name === "practice") renderPractice();
  if (name === "achievements") renderAchievements();
}

// ========== 首页渲染 ==========
function renderHome() {
  const { profile, words } = appState;
  const totalStars = profile.totalStars || 0;

  // 宠物等级
  let level = 0;
  for (let i = ANIMAL_LEVELS.length - 1; i >= 0; i--) {
    if (totalStars >= ANIMAL_LEVELS[i].stars) { level = i; break; }
  }
  const currentAnimal = ANIMAL_LEVELS[level];
  const nextAnimal = ANIMAL_LEVELS[level + 1] || ANIMAL_LEVELS[level];
  const starsInLevel = totalStars - currentAnimal.stars;
  const starsNeeded = (nextAnimal.stars - currentAnimal.stars) || 1;
  const progressPercent = Math.min(100, Math.round((starsInLevel / starsNeeded) * 100));

  document.getElementById("petDisplay").textContent = currentAnimal.emoji;
  document.getElementById("petName").textContent = currentAnimal.name;
  document.getElementById("petProgressBar").style.width = progressPercent + "%";
  document.getElementById("petProgressLabel").textContent =
    `${totalStars} / ${nextAnimal.stars} ⭐`;

  // 统计数据
  document.getElementById("homeStreak").textContent = profile.streak || 0;
  document.getElementById("homeMastered").textContent = words.filter(w => w.mastered).length;
  document.getElementById("homeTotal").textContent = words.length;

  // 今日任务
  const today = getTodayStr();
  const reviewWords = words.filter(w => !w.mastered && w.nextReviewDate && w.nextReviewDate <= today);
  const neverLearned = words.filter(w => w.unit === appState.currentUnit && w.ebbingStage === 0 && !w.lastReviewed);
  const newWords = neverLearned.slice(0, 2);

  document.getElementById("taskNewCount").textContent = newWords.length;
  document.getElementById("taskReviewCount").textContent = reviewWords.length;

  // 开始学习按钮
  const btn = document.getElementById("btnStartLearning");
  btn.textContent = (newWords.length + reviewWords.length > 0) ? "开始学习 →" : "✅ 今日已完成！";
  btn.disabled = (newWords.length + reviewWords.length === 0);

  // 易错词提醒
  const errorWords = words.filter(w => w.errorCount > 0).sort((a, b) => b.errorCount - a.errorCount).slice(0, 2);
  const reminder = document.getElementById("errorReminder");
  const reminderList = document.getElementById("errorReminderList");
  if (errorWords.length > 0) {
    reminder.style.display = "block";
    reminderList.innerHTML = errorWords.map(w =>
      `<div>"${w.english}" 错了 ${w.errorCount} 次 😢</div>`
    ).join("");
  } else {
    reminder.style.display = "none";
  }

  // 顶部星星
  document.getElementById("headerStars").textContent = `⭐ ${totalStars}`;
}

// ========== 工具函数 ==========
function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// 判断是否为短语（含空格或连字符）
function isPhrase(english) {
  return /[\s-]/.test(english);
}

// ========== 词库渲染 ==========
let editingWordId = null; // 当前正在编辑的单词 ID

function renderWordBank() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  let words = appState.words;

  // 搜索过滤
  if (query) {
    words = words.filter(w =>
      w.english.toLowerCase().includes(query) ||
      w.chinese.includes(query)
    );
  }

  // 按单元分组
  const grouped = {};
  for (const unit of UNITS) {
    grouped[unit] = words.filter(w => w.unit === unit);
  }

  const list = document.getElementById("wordBankList");
  let html = "";

  for (const unit of UNITS) {
    const unitWords = grouped[unit];
    if (unitWords.length === 0 && query) continue; // 搜索时跳过空单元
    if (unitWords.length === 0 && !query) {
      html += `<div class="unit-section-header">📦 ${unit.toUpperCase()} <span style="font-weight:400;font-size:0.8rem;color:#B2BEC3">空</span></div>`;
      continue;
    }

    // 统计单元进度
    const masteredCount = unitWords.filter(w => w.mastered).length;
    html += `<div class="unit-section-header" onclick="toggleUnit(this)">📦 ${unit.toUpperCase()} <span style="font-weight:400;font-size:0.8rem;color:#B2BEC3">${masteredCount}/${unitWords.length} 掌握 ▾</span></div>`;
    html += `<div class="unit-words">`;

    for (const w of unitWords) {
      const masteryPercent = w.ebbingStage >= 6 ? 100 : Math.round((w.ebbingStage / 6) * 100);
      const dots = getMasteryDots(w.ebbingStage);
      const nextReview = w.nextReviewDate ? `下次复习：${w.nextReviewDate}` : "未开始";
      const phraseTag = isPhrase(w.english) ? " 📝" : "";

      html += `
        <div class="word-card" data-id="${w.id}">
          <img class="word-card-image" src="${w.image}" alt="${w.english}"
               onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2252%22 height=%2252%22><rect fill=%22%23F0F0F0%22 width=%2252%22 height=%2252%22 rx=%2210%22/><text x=%2226%22 y=%2232%22 text-anchor=%22middle%22 font-size=%2220%22>📷</text></svg>'">
          <div class="word-card-info">
            <div class="word-card-english">${w.english}${phraseTag}</div>
            <div class="word-card-chinese">${w.chinese}</div>
            <div class="word-card-unit">${w.unit.toUpperCase()}</div>
            <div class="word-card-meta">
              <span>掌握：${dots}</span>
              ${w.errorCount > 0 ? `<span>❌ ${w.errorCount}次</span>` : ""}
              <span>${nextReview}</span>
            </div>
          </div>
          <div class="word-card-actions">
            <button class="btn btn-sm" onclick="event.stopPropagation();showEditWordDialog(${w.id})">✏️</button>
            <button class="btn btn-sm" onclick="event.stopPropagation();deleteWord(${w.id})" style="background:#FFE0E0">🗑</button>
          </div>
        </div>`;
    }

    html += `</div>`;
  }

  if (query && Object.values(grouped).every(arr => arr.length === 0)) {
    html = `<div class="empty-hint">🔍 没有找到匹配的单词</div>`;
  }

  list.innerHTML = html;
}

function toggleUnit(header) {
  const unitDiv = header.nextElementSibling;
  if (unitDiv) {
    unitDiv.style.display = unitDiv.style.display === "none" ? "" : "none";
    const arrow = header.querySelector("span");
    if (arrow) arrow.textContent = arrow.textContent.includes("▾") ? arrow.textContent.replace("▾", "▸") : arrow.textContent.replace("▸", "▾");
  }
}

function getMasteryDots(stage) {
  const filled = "●";
  const empty = "○";
  const total = 6;
  stage = Math.min(stage, total);
  return filled.repeat(stage) + empty.repeat(total - stage);
}

// ========== 添加/编辑单词弹窗 ==========
function showAddWordDialog() {
  editingWordId = null;
  document.getElementById("modalTitle").textContent = "添加单词";
  document.getElementById("modalUnit").value = appState.currentUnit || "u1";
  document.getElementById("modalEnglish").value = "";
  document.getElementById("modalChinese").value = "";
  document.getElementById("modalImage").value = "";
  document.getElementById("modalPhonetic").value = "";
  document.getElementById("modalOverlay").style.display = "flex";
}

function showEditWordDialog(id) {
  const w = appState.words.find(w => w.id === id);
  if (!w) return;
  editingWordId = id;
  document.getElementById("modalTitle").textContent = "编辑单词";
  document.getElementById("modalUnit").value = w.unit;
  document.getElementById("modalEnglish").value = w.english;
  document.getElementById("modalChinese").value = w.chinese;
  document.getElementById("modalImage").value = w.image;
  document.getElementById("modalPhonetic").value = w.phonetic || "";
  document.getElementById("modalOverlay").style.display = "flex";
}

function closeModal() {
  document.getElementById("modalOverlay").style.display = "none";
  editingWordId = null;
}

function saveWord() {
  const unit = document.getElementById("modalUnit").value;
  const english = document.getElementById("modalEnglish").value.trim();
  const chinese = document.getElementById("modalChinese").value.trim();
  const image = document.getElementById("modalImage").value.trim();
  const phonetic = document.getElementById("modalPhonetic").value.trim();

  if (!english || !chinese) {
    alert("英文和中文不能为空！");
    return;
  }

  if (editingWordId) {
    // 编辑
    const w = appState.words.find(w => w.id === editingWordId);
    if (w) {
      w.unit = unit;
      w.english = english;
      w.chinese = chinese;
      w.image = image;
      w.phonetic = phonetic;
    }
  } else {
    // 新增
    const maxId = appState.words.reduce((max, w) => Math.max(max, w.id), 0);
    appState.words.push({
      id: maxId + 1,
      unit,
      english,
      chinese,
      image,
      phonetic,
      ebbingStage: 0,
      nextReviewDate: "",
      correctCount: 0,
      errorCount: 0,
      lastReviewed: null,
      mastered: false,
    });
  }

  saveState();
  closeModal();
  renderWordBank();
}

function deleteWord(id) {
  if (!confirm("确定要删除这个单词吗？")) return;
  appState.words = appState.words.filter(w => w.id !== id);
  saveState();
  renderWordBank();
  renderHome();
}

// ========== JSON 导入导出 ==========
function exportWords() {
  const exportData = appState.words.map(w => ({
    unit: w.unit,
    english: w.english,
    chinese: w.chinese,
    image: w.image,
    phonetic: w.phonetic,
  }));
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `word-hero-words-${getTodayStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importWords() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data)) throw new Error("格式错误");
        const count = { added: 0, skipped: 0 };
        const maxId = appState.words.reduce((max, w) => Math.max(max, w.id), 0);
        let nextId = maxId + 1;

        for (const item of data) {
          if (!item.english || !item.chinese) { count.skipped++; continue; }
          // 检查是否重复
          const exists = appState.words.some(w =>
            w.english.toLowerCase() === item.english.toLowerCase() && w.unit === item.unit
          );
          if (exists) { count.skipped++; continue; }

          appState.words.push({
            id: nextId++,
            unit: item.unit || "u1",
            english: item.english,
            chinese: item.chinese,
            image: item.image || "",
            phonetic: item.phonetic || "",
            ebbingStage: 0,
            nextReviewDate: "",
            correctCount: 0,
            errorCount: 0,
            lastReviewed: null,
            mastered: false,
          });
          count.added++;
        }
        saveState();
        renderWordBank();
        renderHome();
        alert(`导入完成！\n✅ 新增 ${count.added} 个单词\n⏭️ 跳过 ${count.skipped} 个（重复或缺少字段）`);
      } catch (err) {
        alert("导入失败：JSON 格式不正确。\n请确保文件是有效的单词列表 JSON。");
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// ========== 练习引擎 ==========
let practiceQueue = [];       // 今日待练习的单词列表
let practiceIndex = 0;       // 当前练习到的索引
let currentQuestionType = null; // 当前题型
let currentShuffledLetters = []; // 题型C：打乱的字母
let currentBlankPositions = [];  // 题型D：填空位置
let retryMode = null;            // 答错后抄写模式 { word, tried }

const DAILY_NEW_WORDS = 4; // 每天新词数（25词÷4≈7天学完，30天内掌握）

function getTodayTasks() {
  const today = getTodayStr();
  // 到期复习词（含答错回炉的）
  const reviewWords = appState.words.filter(w =>
    !w.mastered && w.nextReviewDate && w.nextReviewDate <= today
  );
  // 未开始的新词（按单元顺序）
  const neverLearned = appState.words
    .filter(w => w.unit === appState.currentUnit && w.ebbingStage === 0 && !w.lastReviewed)
    .sort((a, b) => a.english.localeCompare(b.english));
  
  // 如果当前单元新词不够，从后续单元预支
  let newPool = neverLearned;
  if (newPool.length < DAILY_NEW_WORDS) {
    const currentIdx = UNITS.indexOf(appState.currentUnit);
    for (let i = currentIdx + 1; i < UNITS.length && newPool.length < DAILY_NEW_WORDS; i++) {
      const nextUnitWords = appState.words.filter(w =>
        w.unit === UNITS[i] && w.ebbingStage === 0 && !w.lastReviewed
      ).sort((a, b) => a.english.localeCompare(b.english));
      newPool = newPool.concat(nextUnitWords);
    }
  }
  
  const newWords = newPool.slice(0, DAILY_NEW_WORDS);
  return [...newWords, ...reviewWords];
}

function advanceEbbingStage(word, correct) {
  if (correct) {
    word.correctCount++;
    const newStage = Math.min(word.ebbingStage + 1, EBBING_INTERVALS.length - 1);
    word.ebbingStage = newStage;
    if (newStage >= 6) {
      word.mastered = true;
      word.nextReviewDate = '';
    } else {
      word.nextReviewDate = addDays(getTodayStr(), EBBING_INTERVALS[newStage]);
    }
  } else {
    word.errorCount++;
    word.ebbingStage = 0;
    word.nextReviewDate = getTodayStr();
  }
  word.lastReviewed = getTodayStr();
}

function checkUnitUnlock() {
  // 当前单元所有词都进入阶段>=1后，解锁下一单元
  const unitWords = appState.words.filter(w => w.unit === appState.currentUnit);
  const allStarted = unitWords.every(w => w.ebbingStage >= 1 || w.mastered);
  if (allStarted) {
    const currentIdx = UNITS.indexOf(appState.currentUnit);
    if (currentIdx >= 0 && currentIdx < UNITS.length - 1) {
      appState.currentUnit = UNITS[currentIdx + 1];
    }
  }
}

// 生成题型（单词用A-E全部，短语只用A和B）
function pickQuestionType(word) {
  if (isPhrase(word.english)) {
    return Math.random() < 0.5 ? 'A' : 'B';
  }
  const hasConfusable = /[bdpq]/.test(word.english);
  const pool = ['A', 'B', 'C', 'D'];
  if (hasConfusable) pool.push('E');
  return pool[Math.floor(Math.random() * pool.length)];
}

function renderPractice() {
  practiceQueue = getTodayTasks();
  practiceIndex = 0;
  retryMode = null;

  if (practiceQueue.length === 0) {
    document.getElementById('practicePrompt').textContent = '✅ 全部完成！';
    document.getElementById('practiceProgressText').textContent = '0 / 0';
    document.getElementById('practiceProgressBar').style.width = '0%';
    document.getElementById('practiceTypeLabel').textContent = '没有待练习的单词';
    document.getElementById('practiceImageArea').innerHTML = '<img id=\"practiceImage\" src=\"\" alt=\"\" style=\"display:none\">';
    document.getElementById('practiceInput').style.display = 'none';
    document.getElementById('practiceOptions').style.display = 'none';
    document.getElementById('btnSubmit').style.display = 'none';
        document.getElementById('btnSpeak').style.display = 'none';
    document.getElementById('btnContinue').style.display = 'none';
    document.getElementById('practiceFeedback').textContent = '';
    return;
  }

  document.getElementById('practiceInput').style.display = '';
  document.getElementById('btnSubmit').style.display = '';
  document.getElementById('btnSpeak').style.display = '';
  document.getElementById('btnContinue').style.display = 'none';
  document.getElementById('practiceFeedback').textContent = '';
  document.getElementById('practiceFeedback').className = 'practice-feedback';
  showCurrentQuestion();
  updatePracticeProgress();
}

function showCurrentQuestion() {
  const word = practiceQueue[practiceIndex];
  const qType = pickQuestionType(word);
  currentQuestionType = qType;

  document.getElementById('practiceImage').src = word.image;
  document.getElementById('practiceImage').style.display = 'block';
  document.getElementById('practiceInput').value = '';
  document.getElementById('practiceInput').style.display = 'none';
  document.getElementById('practiceOptions').style.display = 'none';
  document.getElementById('practiceOptions').innerHTML = '';

  switch (qType) {
    case 'A': // 看中文拼英文
      document.getElementById('practiceTypeLabel').textContent = '🎯 看中文，拼英文';
      document.getElementById('practicePrompt').textContent = word.chinese;
      document.getElementById('practiceInput').style.display = '';
      document.getElementById('practiceInput').placeholder = '输入英文...';
      document.getElementById('practiceInput').focus();
      break;

    case 'B': // 听发音拼单词
      document.getElementById('practiceTypeLabel').textContent = '🔊 听发音，拼单词';
      document.getElementById('practicePrompt').textContent = '请点击 🔊 按钮听发音';
      document.getElementById('practiceInput').style.display = '';
      document.getElementById('practiceInput').placeholder = '听到的单词是...';
      speakWord(word.english);
      break;

    case 'C': // 字母排序
      currentShuffledLetters = word.english.split('').sort(() => Math.random() - 0.5);
      document.getElementById('practiceTypeLabel').textContent = '🔤 字母排序';
      document.getElementById('practicePrompt').textContent = '把打乱的字母排列成正确的单词';
      document.getElementById('practiceOptions').style.display = 'flex';
      document.getElementById('practiceOptions').innerHTML = currentShuffledLetters.map((ch, idx) =>
        `<button class=\"practice-option-btn letter-btn\" data-idx=\"${idx}\" onclick=\"selectLetter(this)\">${ch}</button>`
      ).join('');
      document.getElementById('practiceInput').style.display = '';
      document.getElementById('practiceInput').value = '';
      document.getElementById('practiceInput').placeholder = '按顺序点击字母...';
      document.getElementById('practiceInput').readOnly = true;
      break;

    case 'D': // 字母填空
      const blankCount = Math.min(2, Math.ceil(word.english.length / 3));
      const positions = [];
      const engArr = word.english.split('');
      while (positions.length < blankCount) {
        const pos = Math.floor(Math.random() * engArr.length);
        if (!positions.includes(pos) && /[a-zA-Z]/.test(engArr[pos])) {
          positions.push(pos);
        }
      }
      currentBlankPositions = positions;
      const display = engArr.map((ch, i) => positions.includes(i) ? '_' : ch).join(' ');
      document.getElementById('practiceTypeLabel').textContent = '📝 填空：补全缺失的字母';
      document.getElementById('practicePrompt').textContent = display;
      document.getElementById('practiceInput').style.display = '';
      document.getElementById('practiceInput').value = '';
      document.getElementById('practiceInput').placeholder = positions.length === 1 ? '输入缺失的字母' : '输入缺失的字母（用空格分隔）';
      document.getElementById('practiceInput').readOnly = false;
      document.getElementById('practiceInput').focus();
      break;

    case 'E': // 易混淆字母
      const wordEng = word.english;
      const confusableMap = { b: 'd', d: 'b', p: 'q', q: 'p' };
      let found = null;
      for (const ch of wordEng) {
        if (confusableMap[ch]) { found = ch; break; }
      }
      if (!found) { // 回退到题型A
        currentQuestionType = 'A';
        showCurrentQuestion();
        return;
      }
      const wrongEng = wordEng.replace(found, confusableMap[found]);
      document.getElementById('practiceTypeLabel').textContent = '⚡ 辨析易混淆字母';
      document.getElementById('practicePrompt').textContent = '哪个拼写是正确的？';
      document.getElementById('practiceOptions').style.display = 'flex';
      const opts = Math.random() < 0.5 ? [wordEng, wrongEng] : [wrongEng, wordEng];
      document.getElementById('practiceOptions').innerHTML = opts.map(opt =>
        `<button class=\"practice-option-btn\" onclick=\"submitConfusableOption('${opt}')\">${opt}</button>`
      ).join('');
      document.getElementById('practiceInput').style.display = 'none';
      playConfusableSound(found, confusableMap[found]);
      break;
  }
}

function selectLetter(btn) {
  const input = document.getElementById('practiceInput');
  input.value += btn.textContent;
  btn.classList.add('selected');
  btn.disabled = true;
}

function submitConfusableOption(choice) {
  const word = practiceQueue[practiceIndex];
  const correct = (choice === word.english);
  handleAnswer(correct, word, choice);
}

function handleAnswer(correct, word, userInput) {
  const feedback = document.getElementById('practiceFeedback');

  // 先隐藏"继续"按钮，确保干净的初始状态
  document.getElementById('btnContinue').style.display = 'none';
  document.getElementById('btnSubmit').style.display = '';

  if (correct) {
    // ✅ 正确：保持原逻辑，1.2 秒后自动跳转
    feedback.textContent = '🎉 太棒了！+1 ⭐';
    feedback.className = 'practice-feedback correct';
    appState.profile.totalStars = (appState.profile.totalStars || 0) + 1;
    showFeedbackAnimation('⭐');
    advanceEbbingStage(word, true);
    saveState();
    document.getElementById('practiceInput').readOnly = false;
    retryMode = null;

    setTimeout(() => {
      feedback.textContent = '';
      feedback.className = 'practice-feedback';
      practiceIndex++;
      if (practiceIndex >= practiceQueue.length) {
        finishPracticeDay();
      } else {
        showCurrentQuestion();
        updatePracticeProgress();
      }
    }, 1200);
    return;
  }

  // ❌ 错误：进入抄写模式，等待小朋友亲手打出正确答案
  feedback.textContent = '😊 正确答案是：' + word.english;
  feedback.className = 'practice-feedback wrong';
  advanceEbbingStage(word, false);
  saveState();

  retryMode = { word: word, tried: 0 };
  const input = document.getElementById('practiceInput');
  input.readOnly = false;

  if (currentQuestionType === 'E') {
    // 辨析题没有输入框，直接显示"继续"按钮
    input.style.display = 'none';
  } else {
    // 清空输入框，让小朋友抄写一遍
    input.value = '';
    input.placeholder = '请抄写：' + word.english;
    input.focus();
    input.style.display = '';
  }

  speakWord(word.english);
  document.getElementById('btnSubmit').style.display = 'none';
  document.getElementById('btnContinue').style.display = '';
}

function submitAnswer() {
  const word = practiceQueue[practiceIndex];
  let userInput = '';
  let correct = false;

  switch (currentQuestionType) {
    case 'A':
    case 'B':
      userInput = document.getElementById('practiceInput').value.trim();
      correct = normalizeAnswer(userInput) === normalizeAnswer(word.english);
      break;

    case 'C':
      userInput = document.getElementById('practiceInput').value.trim();
      correct = normalizeAnswer(userInput) === normalizeAnswer(word.english);
      // 重置字母按钮
      document.querySelectorAll('.letter-btn').forEach(b => {
        b.classList.remove('selected');
        b.disabled = false;
      });
      break;

    case 'D':
      userInput = document.getElementById('practiceInput').value.trim();
      const inputChars = userInput.replace(/\s+/g, '').split('');
      const expectedChars = currentBlankPositions.map(i => word.english[i]);
      correct = (inputChars.length === expectedChars.length &&
        inputChars.every((ch, idx) => ch.toLowerCase() === expectedChars[idx].toLowerCase()));
      break;

    default:
      return;
  }

  handleAnswer(correct, word, userInput);
}

function normalizeAnswer(str) {
  return str.replace(/\s+/g, ' ').trim().toLowerCase();
}

// 错误后继续：校验抄写是否正确
function continueAfterError() {
  if (!retryMode) return;

  const input = document.getElementById('practiceInput');
  const feedback = document.getElementById('practiceFeedback');
  const word = retryMode.word;

  if (currentQuestionType === 'E') {
    // 辨析题无需抄写，直接继续
    proceedAfterRetry();
    return;
  }

  const userInput = input.value.trim();
  if (normalizeAnswer(userInput) === normalizeAnswer(word.english)) {
    // 抄写正确，奖励半颗星鼓励
    feedback.textContent = '✅ 抄写正确！+0.5 ⭐';
    feedback.className = 'practice-feedback correct';
    retryMode = null;
    proceedAfterRetry();
  } else {
    retryMode.tried++;
    if (retryMode.tried >= 3) {
      // 抄了3次都不对，直接显示答案通过
      input.value = word.english;
      feedback.textContent = '👀 没关系，看看正确答案：' + word.english;
      feedback.className = 'practice-feedback wrong';
      retryMode = null;
      // 1.2秒后自动继续
      setTimeout(() => {
        proceedAfterRetry();
      }, 1200);
    } else {
      feedback.textContent = '🤔 再仔细看看哦，请抄写：' + word.english + '（还剩 ' + (3 - retryMode.tried) + ' 次机会）';
      feedback.className = 'practice-feedback wrong';
      input.value = '';
      input.placeholder = '请抄写：' + word.english;
      input.focus();
    }
  }
}

// 重试完成后清空状态并推进到下一题
function proceedAfterRetry() {
  const feedback = document.getElementById('practiceFeedback');
  const input = document.getElementById('practiceInput');

  feedback.textContent = '';
  feedback.className = 'practice-feedback';
  input.value = '';
  input.readOnly = false;
  input.style.color = '';
  input.style.fontWeight = '';
  input.style.display = '';
  document.getElementById('btnSubmit').style.display = '';
  document.getElementById('btnContinue').style.display = 'none';
  retryMode = null;

  practiceIndex++;
  if (practiceIndex >= practiceQueue.length) {
    finishPracticeDay();
  } else {
    showCurrentQuestion();
    updatePracticeProgress();
  }
}

function updatePracticeProgress() {
  const total = practiceQueue.length;
  const done = practiceIndex;
  document.getElementById('practiceProgressText').textContent = `${done} / ${total}`;
  document.getElementById('practiceProgressBar').style.width = total > 0 ? Math.round((done / total) * 100) + '%' : '0%';
}

function finishPracticeDay() {
  // 打卡
  const today = getTodayStr();
  if (!appState.profile.studyDates.includes(today)) {
    appState.profile.studyDates.push(today);
  }
  if (appState.profile.lastStudyDate !== today) {
    const yesterday = addDays(today, -1);
    if (appState.profile.lastStudyDate === yesterday) {
      appState.profile.streak = (appState.profile.streak || 0) + 1;
    } else {
      appState.profile.streak = 1;
    }
    appState.profile.lastStudyDate = today;
  }

  checkUnitUnlock();

  document.getElementById('practicePrompt').textContent = '✅ 今日全部完成！';
  document.getElementById('practiceProgressText').textContent = `${practiceQueue.length} / ${practiceQueue.length}`;
  document.getElementById('practiceProgressBar').style.width = '100%';
  document.getElementById('practiceTypeLabel').textContent = '🏆 太厉害了！';
  document.getElementById('practiceImage').style.display = 'none';
  document.getElementById('practiceInput').style.display = 'none';
  document.getElementById('practiceOptions').style.display = 'none';
  document.getElementById('btnSubmit').style.display = 'none';
  document.getElementById('btnSpeak').style.display = 'none';
  document.getElementById('btnContinue').style.display = 'none';
  document.getElementById('practiceFeedback').textContent = '明天继续加油哦！';
  document.getElementById('practiceFeedback').className = 'practice-feedback correct';

  saveState();
  setTimeout(() => {
    switchScreen('home');
  }, 2000);
}

// ========== TTS 发音 ==========
function speakWord(word) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.75;
    utterance.pitch = 1.1;
    speechSynthesis.speak(utterance);
  }
}

function speakCurrentWord() {
  speakWord(practiceQueue[practiceIndex].english);
}

function playConfusableSound(a, b) {
  speakWord(`Is it ${a} or ${b}?`);
}

// ========== 反馈动画
function showFeedbackAnimation(emoji) {
  const layer = document.getElementById('feedbackLayer');
  layer.textContent = emoji;
  layer.className = 'feedback-layer show';
  setTimeout(() => {
    layer.className = 'feedback-layer';
  }, 800);
}

// ========== 成就屏 =========="
function renderAchievements() {
  // 1. 成长之路高亮
  const totalStars = appState.profile.totalStars || 0;
  let level = 0;
  for (let i = ANIMAL_LEVELS.length - 1; i >= 0; i--) {
    if (totalStars >= ANIMAL_LEVELS[i].stars) { level = i; break; }
  }
  document.querySelectorAll('.evo-stage').forEach(el => {
    const lv = parseInt(el.dataset.level);
    el.classList.toggle('current', lv === level);
  });

  // 2. 易错词 TOP 5
  const errorWords = appState.words
    .filter(w => w.errorCount > 0)
    .sort((a, b) => b.errorCount - a.errorCount)
    .slice(0, 5);
  const errorList = document.getElementById('errorTopList');
  if (errorWords.length === 0) {
    errorList.innerHTML = '<div class=\"empty-hint\">暂无易错数据，开始练习吧！</div>';
  } else {
    errorList.innerHTML = errorWords.map(w =>
      `<div class=\"error-top-item\"><span class=\"word\">${w.english}</span><span class=\"crosses\">${'❌'.repeat(Math.min(w.errorCount, 5))}</span><span>${w.errorCount}次</span></div>`
    ).join('');
  }

  // 3. 打卡日历（当月）
  renderCalendar();

  // 4. 成就徽章
  renderBadges();
}

function renderCalendar() {
  const studyDates = appState.profile.studyDates || [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const firstDay = new Date(year, month, 1).getDay(); // 星期几(0=日)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = getTodayStr();

  const weekHeaders = ['日', '一', '二', '三', '四', '五', '六'];
  let html = weekHeaders.map(d => `<div class=\"calendar-day-header\">${d}</div>`).join('');

  // 空白填充
  for (let i = 0; i < firstDay; i++) {
    html += '<div class=\"calendar-day empty\"></div>';
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    let cls = 'calendar-day';
    if (studyDates.includes(dateStr)) cls += ' checked';
    if (dateStr === today) cls += ' today';
    html += `<div class=\"${cls}\">${d}</div>`;
  }

  document.getElementById('calendarArea').innerHTML = html;
}

function renderBadges() {
  const { profile, words } = appState;
  const streak = profile.streak || 0;
  const masteredCount = words.filter(w => w.mastered).length;
  const totalStars = profile.totalStars || 0;
  const studyDates = profile.studyDates || [];

  const badgeDefs = [
    { id: 'first_blood', icon: '🩸', name: '初次打卡', earned: studyDates.length >= 1 },
    { id: 'streak3', icon: '🔥', name: '连续3天', earned: streak >= 3 },
    { id: 'streak7', icon: '🔥🔥', name: '连续7天', earned: streak >= 7 },
    { id: 'streak30', icon: '💎', name: '连续30天', earned: streak >= 30 },
    { id: 'master10', icon: '🎓', name: '掌握10词', earned: masteredCount >= 10 },
    { id: 'master50', icon: '🏅', name: '掌握50词', earned: masteredCount >= 50 },
    { id: 'stars100', icon: '⭐', name: '100星', earned: totalStars >= 100 },
    { id: 'stars500', icon: '🌟', name: '500星', earned: totalStars >= 500 },
  ];

  const grid = document.getElementById('badgeGrid');
  grid.innerHTML = badgeDefs.map(b =>
    `<div class=\"badge-item ${b.earned ? 'earned' : 'locked'}\">
      <span class=\"badge-icon\">${b.icon}</span>
      <span class=\"badge-name\">${b.name}</span>
    </div>`
  ).join('');
}


// ========== 初始化 ==========
function init() {
  loadState();
  switchScreen("home");
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", init);