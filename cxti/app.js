// ============================================================
// CP粉成分测试 · Quiz Engine
//
// 维度标签 → 维度映射
//   正义/邪恶  →  B维度  (Z正 / E邪)
//   守序/混乱  →  A维度  (X序 / L乱)
//   淡然/浓烈  →  C维度  (D淡 / N浓)
//   素食/荤食  →  D维度  (S素 / H荤)
//
// 结果编码顺序：B + C + A + D
// 计分方法：中位数基准判定法
//   θ = (P_max − N_max) / 2
//   net = p − n，若 net > θ 则正极，否则负极
//
// 特殊逻辑：Q21（special:true）
//   选 D「完全不认同」→ 直接跳转 SMYC 隐藏人格
//   其余选项          → 正常结算 Q1–Q20 得分
// ============================================================

'use strict';

// ── Tag → dimension mapping ───────────────────────────────
const TAG_MAP = {
  '正义': { dim: 'B', sign:  1 },
  '邪恶': { dim: 'B', sign: -1 },
  '守序': { dim: 'A', sign:  1 },
  '混乱': { dim: 'A', sign: -1 },
  '淡然': { dim: 'C', sign:  1 },
  '浓烈': { dim: 'C', sign: -1 },
  '素食': { dim: 'D', sign:  1 },
  '荤食': { dim: 'D', sign: -1 },
  // aliases
  '肉食': { dim: 'D', sign: -1 },
  '淡':   { dim: 'C', sign:  1 },
  '浓':   { dim: 'C', sign: -1 },
};

// ── Calculate max possible scores from the question pool ──
function calcMaxScores(questions) {
  const max = {
    A: { pos: 0, neg: 0 },
    B: { pos: 0, neg: 0 },
    C: { pos: 0, neg: 0 },
    D: { pos: 0, neg: 0 },
  };
  for (const q of questions) {
    for (const opt of q.options) {
      for (const tag of opt.tags) {
        const m = TAG_MAP[tag];
        if (!m) continue;
        if (m.sign > 0) max[m.dim].pos++;
        else            max[m.dim].neg++;
      }
    }
  }
  return max;
}

// ── Median-threshold classification ───────────────────────
// Returns true if positive side wins
function classifyDim(earned, max) {
  const net = earned.pos - earned.neg;
  const theta = (max.pos - max.neg) / 2;
  return net > theta;
}

// ── Build 4-letter result code ─────────────────────────────
// Code order: B + C + A + D
function buildCode(scores, maxScores) {
  const B = classifyDim(scores.B, maxScores.B) ? 'Z' : 'E'; // Z=正  E=邪
  const C = classifyDim(scores.C, maxScores.C) ? 'D' : 'N'; // D=淡  N=浓
  const A = classifyDim(scores.A, maxScores.A) ? 'X' : 'L'; // X=序  L=乱
  const D = classifyDim(scores.D, maxScores.D) ? 'S' : 'H'; // S=素  H=荤
  return B + C + A + D;
}

// ── Fisher-Yates shuffle（返回新数组，不修改原数组）────────
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Quiz state ────────────────────────────────────────────
let state = {};

function resetState() {
  // Q21（special）固定压在末尾；其余题目随机混排
  const normal  = QUESTIONS.filter(q => !q.special);
  const special = QUESTIONS.filter(q =>  q.special);
  state = {
    index:    0,
    queue:    [...shuffle(normal), ...special],
    history:  [],   // 每答一题 push 该选项的 tags 副本，用于返回上一题时逆向扣分
    nickname: ($('nickname-input').value || '').trim(),
    scores: {
      A: { pos: 0, neg: 0 },
      B: { pos: 0, neg: 0 },
      C: { pos: 0, neg: 0 },
      D: { pos: 0, neg: 0 },
    },
  };
}

// ── DOM helpers ───────────────────────────────────────────
function $(id) { return document.getElementById(id); }

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
}

// ── Render current question ───────────────────────────────
function renderQuestion() {
  const q     = state.queue[state.index];
  const total = state.queue.length;
  const pct   = (state.index / total) * 100;

  $('progress-fill').style.width  = pct + '%';
  $('progress-label').textContent = `${state.index + 1} / ${total}`;
  $('question-id').textContent    = 'Q' + (state.index + 1);  // 始终顺序显示
  $('question-text').textContent  = q.text;

  // 返回按钮：第一题隐藏
  $('btn-back').style.display = state.index > 0 ? '' : 'none';

  const list = $('options-list');
  list.innerHTML = '';

  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `
      <span class="opt-label">${opt.label}</span>
      <span class="opt-text">${opt.text}</span>
    `;
    btn.addEventListener('click', () => handleAnswer(opt, btn));
    list.appendChild(btn);
  });
}

// ── Handle option selection ───────────────────────────────
function handleAnswer(opt, btn) {
  // Prevent double-tap
  $('options-list').querySelectorAll('.option-btn').forEach(b => {
    b.style.pointerEvents = 'none';
  });
  btn.classList.add('selected');

  const q = state.queue[state.index];

  // ── Q21 特殊跳转：选 D「完全不认同」→ 直接进入隐藏人格 SMYC
  if (q.special && opt.label === 'D') {
    setTimeout(() => {
      renderResult('SMYC', RESULTS['SMYC']);
    }, 320);
    return;
  }

  // 记录本题答案（用于返回时逆向扣分）
  state.history.push(opt.tags.slice());

  // Accumulate scores（special题其余选项 tags 为空，自然跳过）
  for (const tag of opt.tags) {
    const m = TAG_MAP[tag];
    if (!m) continue;
    if (m.sign > 0) state.scores[m.dim].pos++;
    else            state.scores[m.dim].neg++;
  }

  // Short delay for visual feedback, then advance
  setTimeout(() => {
    state.index++;
    if (state.index >= state.queue.length) {
      showResult();
    } else {
      renderQuestion();
    }
  }, 320);
}

// ── Handle back button ────────────────────────────────────
function handleBack() {
  if (state.index === 0) return;

  // 逆向扣除上一题的得分
  const lastTags = state.history.pop();
  for (const tag of lastTags) {
    const m = TAG_MAP[tag];
    if (!m) continue;
    if (m.sign > 0) state.scores[m.dim].pos--;
    else            state.scores[m.dim].neg--;
  }

  state.index--;
  renderQuestion();
}

// ── Render result card ────────────────────────────────────
function renderResult(code, result) {
  // Theme the card
  const card = $('result-card');
  card.style.backgroundColor = result.color;
  card.style.color            = result.text;

  // 昵称行
  const nickEl = $('result-nickname');
  if (state.nickname) {
    nickEl.textContent   = state.nickname + ' 的 CXTI 是：';
    nickEl.style.display = '';
  } else {
    nickEl.textContent   = '';
    nickEl.style.display = 'none';
  }

  $('result-code').textContent = code;

  // 人格名称（有则显示，无则隐藏）
  const nameEl = $('result-name');
  if (result.name) {
    nameEl.textContent   = result.name;
    nameEl.style.display = '';
  } else {
    nameEl.textContent   = '';
    nameEl.style.display = 'none';
  }

  $('result-cn').textContent   = result.cn;
  $('result-desc').textContent = result.desc;

  // Illustration
  const imgWrap = $('result-img-wrap');
  if (result.img) {
    imgWrap.innerHTML    = `<img src="${result.img}" alt="${result.name || result.cn}" class="result-img" />`;
    imgWrap.style.display = 'block';
  } else {
    imgWrap.innerHTML    = '';
    imgWrap.style.display = 'none';
  }

  // Score breakdown
  const maxScores = calcMaxScores(QUESTIONS);
  renderScoreBreakdown(maxScores);

  showScreen('screen-result');
}

// ── Show result（正常结算路径）────────────────────────────
function showResult() {
  const maxScores = calcMaxScores(QUESTIONS);
  const code      = buildCode(state.scores, maxScores);
  const result    = RESULTS[code] || {
    cn:    code,
    name:  '',
    desc:  '（结果描述待填充）',
    color: '#888888',
    text:  '#ffffff',
  };
  renderResult(code, result);
}

// ── Score breakdown UI ────────────────────────────────────
const DIM_LABELS = {
  B: { pos: '正义', neg: '邪恶' },
  A: { pos: '守序', neg: '混乱' },
  C: { pos: '淡然', neg: '浓烈' },
  D: { pos: '素食', neg: '荤食' },
};

function renderScoreBreakdown(maxScores) {
  const container = $('result-scores');
  container.innerHTML = '';

  ['B', 'A', 'C', 'D'].forEach(dim => {
    const s   = state.scores[dim];
    const mx  = maxScores[dim];
    const lbl = DIM_LABELS[dim];
    const posWins = classifyDim(s, mx);
    const winner  = posWins ? lbl.pos : lbl.neg;
    const winPct  = posWins
      ? (mx.pos > 0 ? Math.round(s.pos / mx.pos * 100) : 50)
      : (mx.neg > 0 ? Math.round(s.neg / mx.neg * 100) : 50);

    const el = document.createElement('div');
    el.className = 'score-dim';
    el.innerHTML = `
      <div class="score-dim-name">${lbl.pos} / ${lbl.neg}</div>
      <div class="score-dim-value">${winner}</div>
      <div class="score-bar-wrap">
        <div class="score-bar-fill" style="width:${winPct}%"></div>
      </div>
    `;
    container.appendChild(el);
  });
}

// ── Init ──────────────────────────────────────────────────
function init() {
  $('total-count').textContent = QUESTIONS.length;

  $('btn-start').addEventListener('click', () => {
    resetState();
    renderQuestion();
    showScreen('screen-question');
  });

  $('btn-back').addEventListener('click', handleBack);

  $('btn-retry').addEventListener('click', () => {
    showScreen('screen-start');
  });

  // 保存图片（html2canvas）
  $('btn-save').addEventListener('click', () => {
    const card = $('result-card');
    html2canvas(card, { scale: 2, useCORS: true }).then(canvas => {
      const link     = document.createElement('a');
      const filename = state.nickname ? `CXTI_${state.nickname}` : 'CXTI结果';
      link.download  = filename + '.png';
      link.href      = canvas.toDataURL('image/png');
      link.click();
    });
  });
}

init();
