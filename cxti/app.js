// ============================================================
// C(X)TI-CP粉属性测试 · Omega Engine (OMG版)
// ============================================================

'use strict';

// ── Tag → dimension mapping ───────────────────────────────
const TAG_MAP = {
  '正义': { dim: 'B', sign: 1 },
  '邪恶': { dim: 'B', sign: -1 },
  '守序': { dim: 'A', sign: 1 },
  '混乱': { dim: 'A', sign: -1 },
  '淡然': { dim: 'C', sign: 1 },
  '浓烈': { dim: 'C', sign: -1 },
  '素食': { dim: 'D', sign: 1 },
  '荤食': { dim: 'D', sign: -1 },
  '肉食': { dim: 'D', sign: -1 }, // Alias
};

const DIM_LABELS = {
  B: { pos: '正义', neg: '邪恶', codePos: 'Z', codeNeg: 'E', descPos: '城堡就该锁死，不管外界怎么说都无所谓！', descNeg: '他们已经BE了，路过吃一口，但是他们BE了。' },
  A: { pos: '守序', neg: '混乱', codePos: 'X', codeNeg: 'L', descPos: '不拆不逆，城堡反过来了就是废区一片！', descNeg: '偶尔或者能接受拆逆，还有其他关系好的人嘛！都是同人不用那么计较。' },
  C: { pos: '淡然', neg: '浓烈', codePos: 'D', codeNeg: 'N', descPos: '有饭可以吃一口，但路过不一定吃。', descNeg: '对于是否能吃上饭非常在意，如果没有合适的产出，会主动约稿或者自己试图生产。' },
  D: { pos: '素食', neg: '荤食', codePos: 'S', codeNeg: 'H', descPos: '倾向于清水或者纯爱，情感链接比肉体重要。', descNeg: '开车！开车！给我像红牛和梅奔一样冲！！' },
};

// ── Quiz State ────────────────────────────────────────────
let state = {
  index: 0,
  queue: [],
  history: [],      // Elements: { tags: [], isFeedbackSkipped: boolean }
  nickname: '',
  feedback: {},     // { questionId: "feedback text" } (E option)
  likes: {},        // { questionId: true }
  dislikes: {},     // { questionId: true }
  overallRating: '',
  resultCode: '',
  scores: {
    A: { pos: 0, neg: 0 },
    B: { pos: 0, neg: 0 },
    C: { pos: 0, neg: 0 },
    D: { pos: 0, neg: 0 },
  }
};

// ── Fisher-Yates shuffle ──────────────────────────────────
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function calcMaxScores(questions) {
  const max = { A: { pos: 0, neg: 0 }, B: { pos: 0, neg: 0 }, C: { pos: 0, neg: 0 }, D: { pos: 0, neg: 0 } };
  for (const q of questions) {
    if (q.special) continue;
    q.options.forEach(opt => {
      opt.tags.forEach(tag => {
        const m = TAG_MAP[tag];
        if (m) {
          if (m.sign > 0) max[m.dim].pos++;
          else max[m.dim].neg++;
        }
      });
    });
  }
  return max;
}

function classifyDim(earned, max) {
  const net = earned.pos - earned.neg;
  const theta = (max.pos - max.neg) / 2;
  return net > theta;
}

// ── DOM Helpers ───────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const showScreen = (id) => {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
  window.scrollTo(0, 0);
};

// ── Quiz Logic ────────────────────────────────────────────

function resetState() {
  const normal = QUESTIONS.filter(q => !q.special);
  const special = QUESTIONS.filter(q => q.special);

  let rawNick = $('nickname-input').value.trim();
  state = {
    index: 0,
    queue: [...shuffle(normal), ...special],
    history: [],
    nickname: rawNick === '' ? '不愿透露姓名的城堡批' : rawNick,
    feedback: {},
    likes: {},
    dislikes: {},
    overallRating: '',
    resultCode: '',
    scores: {
      A: { pos: 0, neg: 0 }, B: { pos: 0, neg: 0 }, C: { pos: 0, neg: 0 }, D: { pos: 0, neg: 0 }
    }
  };
}

function renderQuestion() {
  const q = state.queue[state.index];
  const total = state.queue.length;

  // Progress
  const pct = (state.index / total) * 100;
  $('progress-fill').style.width = pct + '%';
  $('progress-label').textContent = `${state.index + 1} / ${total}`;

  $('question-id').textContent = 'Q' + (state.index + 1);
  $('question-text').textContent = q.text;

  // Header Feedback Icons
  $('btn-q-like').classList.toggle('active', !!state.likes[q.id]);
  $('btn-q-dislike').classList.toggle('active', !!state.dislikes[q.id]);

  // Back button visibility
  $('btn-prev').style.display = state.index === 0 ? 'none' : 'flex';

  // Reset Feedback UI (E option)
  $('btn-e-option').classList.remove('active');
  $('e-feedback-area').classList.remove('active');
  $('e-feedback-input').value = state.feedback[q.id] || '';
  $('btn-e-submit').classList.remove('selected', 'shake');

  // Render options
  const list = $('options-list');
  list.innerHTML = '';
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<span class="opt-label">${opt.label}</span><span>${opt.text}</span>`;

    // Highlight immediately on press
    btn.onpointerdown = () => {
      list.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    };

    // Advance on release
    btn.onclick = () => handleAnswer(opt, btn);
    list.appendChild(btn);
  });
}

function handleAnswer(opt, btn) {
  const q = state.queue[state.index];

  // Highlight effect
  btn.classList.add('selected');

  // Clear E-feedback state
  $('btn-e-option').classList.remove('active');
  $('e-feedback-area').classList.remove('active');

  setTimeout(() => {
    // Handle special Q36 jump
    if (q.special && opt.label === 'D') {
      renderResult('SMYC', RESULTS['SMYC']);
      return;
    }

    // Record scores
    opt.tags.forEach(tag => {
      const m = TAG_MAP[tag];
      if (m) {
        if (m.sign > 0) state.scores[m.dim].pos++;
        else state.scores[m.dim].neg++;
      }
    });
    state.history.push({ tags: opt.tags.slice(), isFeedbackSkipped: false });

    advance();
  }, 200);
}

function handleEFeedback(btn) {
  const q = state.queue[state.index];
  const feedbackText = $('e-feedback-input').value.trim();

  if (btn) btn.classList.add('selected');

  setTimeout(() => {
    state.feedback[q.id] = feedbackText;
    state.history.push({ tags: [], isFeedbackSkipped: true });
    advance();
  }, 200);
}

function toggleLikeDislike(type) {
  const q = state.queue[state.index];
  if (type === 'like') {
    state.likes[q.id] = !state.likes[q.id];
    if (state.likes[q.id]) state.dislikes[q.id] = false;
  } else {
    state.dislikes[q.id] = !state.dislikes[q.id];
    if (state.dislikes[q.id]) state.likes[q.id] = false;
  }
  $('btn-q-like').classList.toggle('active', !!state.likes[q.id]);
  $('btn-q-dislike').classList.toggle('active', !!state.dislikes[q.id]);
}

function advance() {
  state.index++;
  if (state.index >= state.queue.length) {
    showResult();
  } else {
    renderQuestion();
  }
}

function handlePrev() {
  if (state.index === 0) return;
  state.index--;

  const last = state.history.pop();
  if (last && !last.isFeedbackSkipped) {
    // Reverse scores
    last.tags.forEach(tag => {
      const m = TAG_MAP[tag];
      if (m) {
        if (m.sign > 0) state.scores[m.dim].pos--;
        else state.scores[m.dim].neg--;
      }
    });
  }

  // Do NOT remove feedback/likes/dislikes on prev to allow correction
  renderQuestion();
}

// ── Result Logic ──────────────────────────────────────────

function showResult() {
  const maxScores = calcMaxScores(QUESTIONS);

  // Building Code (B C A D order)
  const codeB = classifyDim(state.scores.B, maxScores.B) ? 'Z' : 'E';
  const codeC = classifyDim(state.scores.C, maxScores.C) ? 'D' : 'N';
  const codeA = classifyDim(state.scores.A, maxScores.A) ? 'X' : 'L';
  const codeD = classifyDim(state.scores.D, maxScores.D) ? 'S' : 'H';
  const code = codeB + codeC + codeA + codeD;
  state.resultCode = code;

  const result = RESULTS[code] || { cn: code, name: code, archetype: '未知', desc: '暂无描述', color: '#888', text: '#fff' };
  renderResult(code, result);
}

function renderResult(code, result) {
  const card = $('result-card');
  card.style.backgroundColor = result.color;
  card.style.color = result.text;

  $('result-nickname').textContent = state.nickname;
  $('result-name').textContent = result.name || result.cn;
  $('result-cn').textContent = result.cn;
  $('result-code').textContent = code;

  const imgWrap = $('result-img-wrap');
  if (result.img) {
    imgWrap.innerHTML = `<img src="${result.img}" alt="${result.name}" class="result-img">`;
    imgWrap.style.display = 'block';
  } else {
    imgWrap.style.display = 'none';
  }

  $('result-desc').textContent = result.desc;

  // Archetype (Centered)
  const isSMYC = (code === 'SMYC');
  const arcName = result.archetype;

  if (isSMYC) {
    // Hidden Identity Rendering
    $('archetype-section').querySelector('.archetype-prefix').textContent = '';
    $('archetype-tag').textContent = '审美异常者';
    $('archetype-title').textContent = '你不属于四大类型之一';
    $('archetype-title').style.display = 'block';
    $('archetype-desc').textContent = '系统识别到用户在“Hey Mama是金钟大最不可理喻的造型”一题中选择了“完全不认同”，直接触发隐藏判定，无视其他条件直接进入此词条。';
    $('btn-expand-arc').textContent = '点击查看其他四大型说明';
    $('archetype-section').style.display = 'block';
  } else {
    // Normal Identity Rendering
    const arc = ARCHETYPES[arcName];
    if (arc) {
      $('archetype-section').querySelector('.archetype-prefix').textContent = '你属于四大类型中的：';
      $('archetype-tag').textContent = `${arcName} · ${arc.title}`;
      $('archetype-title').style.display = 'none';
      $('archetype-desc').textContent = arc.desc;
      $('btn-expand-arc').textContent = '查看其他三大型';
      $('archetype-section').style.display = 'block';
    } else {
      $('archetype-section').style.display = 'none';
    }
  }

  // Expansion list logic
  const otherArcsWrap = $('other-arcs-wrap');
  otherArcsWrap.style.display = 'none';

  otherArcsWrap.innerHTML = '';
  Object.keys(ARCHETYPES).forEach(key => {
    // If SMYC, show all four; If normal, show other three
    if (!key.startsWith('@') && (isSMYC || key !== arcName)) {
      const data = ARCHETYPES[key];
      const item = document.createElement('div');
      item.className = 'other-arc-item';
      item.innerHTML = `
              <span class="other-arc-tag">${key} · ${data.title}</span>
              <p class="other-arc-desc">${data.desc}</p>
          `;
      otherArcsWrap.appendChild(item);
    }
  });

  // Reset rating selection
  state.overallRating = '';
  document.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('active'));

  // Dimensions
  renderDimensionBars();

  showScreen('screen-result');
}

function renderDimensionBars() {
  const maxScores = calcMaxScores(QUESTIONS);
  const wrap = $('dims-wrap');
  wrap.innerHTML = '';

  const order = ['B', 'A', 'C', 'D'];

  order.forEach(dimKey => {
    const dim = DIM_LABELS[dimKey];
    const s = state.scores[dimKey];
    const max = maxScores[dimKey];

    const isPos = classifyDim(s, max);
    const pRate = max.pos > 0 ? (s.pos / max.pos) : 0;
    const nRate = max.neg > 0 ? (s.neg / max.neg) : 0;
    const totalRate = pRate + nRate;
    const barPct = totalRate > 0 ? (nRate / totalRate) * 100 : 50;

    const item = document.createElement('div');
    item.className = 'dim-item';
    const fillStyle = isPos
      ? `width: ${100 - barPct}%; left: 0;`
      : `width: ${barPct}%; right: 0;`;

    item.innerHTML = `
      <div class="dim-bar-header">
        <span class="dim-label ${isPos ? 'active' : ''}">${dim.pos}</span>
        <span class="dim-label ${!isPos ? 'active' : ''}">${dim.neg}</span>
      </div>
      <div class="dim-track">
        <div class="dim-fill" style="${fillStyle}"></div>
      </div>
      <div class="dim-desc-label">${isPos ? dim.descPos : dim.descNeg}</div>
    `;
    wrap.appendChild(item);
  });
}

// ── Copy Feedback ─────────────────────────────────────────

function copyFeedback() {
  const ratingText = state.overallRating || "(未评)";
  let text = `${state.resultCode} ${ratingText}\n`;

  const liked = Object.keys(state.likes).filter(k => state.likes[k]).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
  const disliked = Object.keys(state.dislikes).filter(k => state.dislikes[k]).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
  const answers = Object.keys(state.feedback).filter(k => state.feedback[k]).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));

  text += `喜欢的题：${liked.length > 0 ? liked.join(',') : '无'}\n`;
  text += `不喜欢的题：${disliked.length > 0 ? disliked.join(',') : '无'}\n`;

  if (answers.length > 0) {
    text += `其他答案：\n`;
    answers.forEach(qid => {
      text += `${qid}: ${state.feedback[qid]}\n`;
    });
  } else {
    text += `其他答案：无\n`;
  }

  navigator.clipboard.writeText(text).then(() => {
    const toast = $('toast');
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 2000);
  });
}

// ── Init ──────────────────────────────────────────────────

function init() {
  $('q-stats').textContent = `20题，4大维度，17种结果（含1种隐藏人格）`;

  $('btn-start').onclick = () => {
    showScreen('screen-instructions');
  };

  $('btn-agree-start').onclick = () => {
    resetState();
    renderQuestion();
    showScreen('screen-question');
  };

  $('btn-prev').onclick = handlePrev;
  $('btn-retry').onclick = () => showScreen('screen-start');
  $('btn-copy-feedback').onclick = copyFeedback;

  // Header Feedback Icons
  $('btn-q-like').onclick = () => toggleLikeDislike('like');
  $('btn-q-dislike').onclick = () => toggleLikeDislike('dislike');

  // E Feedback Toggle
  $('btn-e-option').onclick = () => {
    const isActive = $('btn-e-option').classList.toggle('active');
    $('e-feedback-area').classList.toggle('active', isActive);
    if (isActive) {
      $('options-list').querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
      $('e-feedback-input').focus();
    }
  };

  $('btn-e-submit').onclick = () => {
    const val = $('e-feedback-input').value.trim();
    if (val.length === 0) {
      const btn = $('btn-e-submit');
      btn.classList.add('shake');
      setTimeout(() => btn.classList.remove('shake'), 400);
      return;
    }
    handleEFeedback($('btn-e-submit'));
  };

  // Archetype expand toggle
  $('btn-expand-arc').onclick = () => {
    const wrap = $('other-arcs-wrap');
    const isHidden = wrap.style.display === 'none';
    wrap.style.display = isHidden ? 'block' : 'none';
    $('btn-expand-arc').textContent = isHidden ? '收起' : '查看其他三大型';
  };

  // Overall Rating buttons
  document.querySelectorAll('.rating-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.overallRating = btn.getAttribute('data-val');
    };
  });

  // Image Save
  $('btn-save-img').onclick = function () {
    const card = $('result-card');
    const btn = this;
    const originalText = btn.textContent;
    btn.textContent = '生成中...';
    btn.disabled = true;

    html2canvas(card, {
      scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', scrollY: -window.scrollY
    }).then(canvas => {
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

        // 显示预览层供移动端长按保存
        $('overlay-img-container').innerHTML = `<img src="${dataUrl}" alt="Result">`;
        $('result-overlay').style.display = 'flex';

      } catch (e) {
        alert('由于浏览器安全限制，图片生成失败。您可以尝试截图保存。');
      }
      btn.textContent = originalText; btn.disabled = false;
    }).catch(err => {
      alert('生成图片失败，请重试');
      btn.textContent = originalText; btn.disabled = false;
    });
  };

  $('btn-close-overlay').onclick = () => {
    $('result-overlay').style.display = 'none';
  };
}

document.addEventListener('DOMContentLoaded', init);
