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

// ── Quiz state ────────────────────────────────────────────
let state = {};

function resetState() {
  state = {
    index: 0,
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
  const q     = QUESTIONS[state.index];
  const total = QUESTIONS.length;
  const pct   = (state.index / total) * 100;

  $('progress-fill').style.width = pct + '%';
  $('progress-label').textContent = `${state.index + 1} / ${total}`;
  $('question-id').textContent    = q.id;
  $('question-text').textContent  = q.text;

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

  // Accumulate scores
  for (const tag of opt.tags) {
    const m = TAG_MAP[tag];
    if (!m) continue;
    if (m.sign > 0) state.scores[m.dim].pos++;
    else            state.scores[m.dim].neg++;
  }

  // Short delay for visual feedback, then advance
  setTimeout(() => {
    state.index++;
    if (state.index >= QUESTIONS.length) {
      showResult();
    } else {
      renderQuestion();
    }
  }, 320);
}

// ── Show result ───────────────────────────────────────────
function showResult() {
  const maxScores = calcMaxScores(QUESTIONS);
  const code      = buildCode(state.scores, maxScores);
  const result    = RESULTS[code] || {
    cn:    code,
    desc:  '（结果描述待填充）',
    color: '#888888',
    text:  '#ffffff',
  };

  // Theme the card
  const card = $('result-card');
  card.style.backgroundColor = result.color;
  card.style.color            = result.text;

  $('result-code').textContent = code;
  $('result-cn').textContent   = result.cn;
  $('result-desc').textContent = result.desc;

  // Illustration
  const imgWrap = $('result-img-wrap');
  if (result.img) {
    imgWrap.innerHTML = `<img src="${result.img}" alt="${result.cn}" class="result-img" />`;
    imgWrap.style.display = 'block';
  } else {
    imgWrap.innerHTML = '';
    imgWrap.style.display = 'none';
  }

  // Score breakdown
  renderScoreBreakdown(maxScores, result.text);

  showScreen('screen-result');
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

  $('btn-retry').addEventListener('click', () => {
    showScreen('screen-start');
  });
}

init();
