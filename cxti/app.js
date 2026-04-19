// ============================================================
// C(X)TI-CP粉属性测试 · 正式版
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

// ── 四大型配色（按 archetype 分，替代原按字母分的配色）────
const ARCHETYPE_COLORS = {
  '信仰狂热型': { bg: '#F5BEC1', text: '#1A3560' },  // 淡玫红
  '低调洁癖型': { bg: '#CBC4E6', text: '#1A3560' },  // 淡紫
  '混乱快乐型': { bg: '#F6E5A5', text: '#1A3560' },  // 淡黄
  '佛系体验型': { bg: '#BDD0EE', text: '#1A3560' },  // 淡蓝
};

// ── 画廊布局配置 ──────────────────────────────────────────
const GALLERY_ROWS = [
  { archetype: '信仰狂热型', codes: ['ZNXS', 'ZNXH', 'ENXS', 'ENXH'], colorClass: 'arc-red' },
  { archetype: '低调洁癖型', codes: ['ZDXS', 'ZDXH', 'EDXS', 'EDXH'], colorClass: 'arc-purple' },
  { archetype: '混乱快乐型', codes: ['ZNLS', 'ZNLH', 'ENLS', 'ENLH'], colorClass: 'arc-yellow' },
  { archetype: '佛系体验型', codes: ['ZDLS', 'ZDLH', 'EDLS', 'EDLH'], colorClass: 'arc-blue' },
];

// ── 人格编码字母 → 维度名称 ──────────────────────────────
const CODE_DIM_MAP = {
  Z: '正义', E: '邪恶', N: '浓烈', D: '淡然',
  X: '守序', L: '混乱', S: '素食', H: '荤食'
};

// ── Quiz State ────────────────────────────────────────────
let state = {
  index: 0,
  queue: [],
  history: [],   // Elements: { tags: [] }
  nickname: '',
  resultCode: '',
  scores: {
    A: { pos: 0, neg: 0 },
    B: { pos: 0, neg: 0 },
    C: { pos: 0, neg: 0 },
    D: { pos: 0, neg: 0 },
  },
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
    resultCode: '',
    scores: {
      A: { pos: 0, neg: 0 }, B: { pos: 0, neg: 0 }, C: { pos: 0, neg: 0 }, D: { pos: 0, neg: 0 }
    },
  };
}

function renderQuestion() {
  if (document.activeElement) {
    document.activeElement.blur();
  }

  const q = state.queue[state.index];
  const total = state.queue.length;

  // Progress
  const pct = (state.index / total) * 100;
  $('progress-fill').style.width = pct + '%';
  $('progress-label').textContent = `${state.index + 1} / ${total}`;

  $('question-id').textContent = q.id;
  $('question-text').textContent = q.text;

  // Back button visibility
  $('btn-prev').style.display = state.index === 0 ? 'none' : 'flex';

  // Render options — click directly scores and advances
  const list = $('options-list');
  list.innerHTML = '';
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<span class="opt-label">${opt.label}</span><span>${opt.text}</span>`;

    btn.onclick = () => {
      // 特判 SMYC
      if (q.special && opt.label === 'D') {
        renderResult('SMYC', RESULTS['SMYC']);
        return;
      }
      // 计分
      opt.tags.forEach(tag => {
        const m = TAG_MAP[tag];
        if (m) {
          if (m.sign > 0) state.scores[m.dim].pos++;
          else state.scores[m.dim].neg++;
        }
      });
      state.history.push({ tags: opt.tags.slice() });
      advance();
    };
    list.appendChild(btn);
  });
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
  if (last) {
    // Reverse scores
    last.tags.forEach(tag => {
      const m = TAG_MAP[tag];
      if (m) {
        if (m.sign > 0) state.scores[m.dim].pos--;
        else state.scores[m.dim].neg--;
      }
    });
  }

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

  // 配色：按四大型
  if (code === 'SMYC') {
    card.style.backgroundColor = result.color;
    card.style.color = result.text;
  } else {
    const arcColors = ARCHETYPE_COLORS[result.archetype] || { bg: result.color, text: result.text };
    card.style.backgroundColor = arcColors.bg;
    card.style.color = arcColors.text;
  }

  $('result-nickname').textContent = state.nickname;
  $('result-name').textContent = result.name || result.cn;

  const imgWrap = $('result-img-wrap');
  if (result.img) {
    imgWrap.innerHTML = `<img src="${result.img}" alt="${result.name}" class="result-img">`;
    imgWrap.style.display = 'block';
  } else {
    imgWrap.style.display = 'none';
  }

  $('result-desc').textContent = result.desc;

  // Archetype
  const isSMYC = (code === 'SMYC');
  const arcName = result.archetype;

  if (isSMYC) {
    $('archetype-section').querySelector('.archetype-prefix').textContent = '';
    $('archetype-tag').textContent = '审美异常者';
    $('archetype-title').textContent = '你不属于四大类型之一';
    $('archetype-title').style.display = 'block';
    $('archetype-desc').textContent = '系统识别到用户在"Hey Mama是金钟大最不可理喻的造型"一题中选择了"完全不认同"，触发隐藏判定，无视其他条件直接进入此词条。';
    $('btn-expand-arc').textContent = '点击查看其他四大型说明';
    $('archetype-section').style.display = 'block';
  } else {
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

  // Expansion list
  const otherArcsWrap = $('other-arcs-wrap');
  otherArcsWrap.style.display = 'none';
  otherArcsWrap.innerHTML = '';
  Object.keys(ARCHETYPES).forEach(key => {
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

    // 两侧百分比在该维度对内合计为100%
    const pPct = totalRate > 0 ? Math.round((pRate / totalRate) * 100) : 50;
    const nPct = 100 - pPct;

    const item = document.createElement('div');
    item.className = 'dim-item';
    const fillStyle = isPos
      ? `width: ${100 - barPct}%; left: 0;`
      : `width: ${barPct}%; right: 0;`;

    item.innerHTML = `
      <div class="dim-bar-header">
        <span class="dim-label ${isPos ? 'active' : ''}">${dim.pos}（${pPct}%）</span>
        <span class="dim-label ${!isPos ? 'active' : ''}">${dim.neg}（${nPct}%）</span>
      </div>
      <div class="dim-track">
        <div class="dim-fill" style="${fillStyle}"></div>
      </div>
      <div class="dim-desc-label">${isPos ? dim.descPos : dim.descNeg}</div>
    `;
    wrap.appendChild(item);
  });
}

// ── All Profiles Gallery ──────────────────────────────────

function renderAllProfiles() {
  const gallery = $('profiles-gallery');
  gallery.innerHTML = '';

  // 四大型行
  GALLERY_ROWS.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = `archetype-row ${row.colorClass}`;

    const grid = document.createElement('div');
    grid.className = 'profiles-grid';
    row.codes.forEach(code => {
      const r = RESULTS[code];
      const thumb = document.createElement('div');
      thumb.className = 'profile-thumb';
      thumb.innerHTML = `
        <img src="${r.img}" alt="${r.name}" class="thumb-img">
        <span class="thumb-name">${r.name}</span>
      `;
      thumb.onclick = () => openProfileDetail(code);
      grid.appendChild(thumb);
    });
    rowEl.appendChild(grid);
    gallery.appendChild(rowEl);
  });

  // SMYC 行（灰色，标签为 ？？？？？）
  const smycRow = document.createElement('div');
  smycRow.className = 'archetype-row arc-grey';

  const smycGrid = document.createElement('div');
  smycGrid.className = 'profiles-grid';

  const smycThumb = document.createElement('div');
  smycThumb.className = 'profile-thumb';
  smycThumb.innerHTML = `
    <img src="${RESULTS['SMYC'].img}" alt="？" class="thumb-img">
    <span class="thumb-name">？？？？？</span>
  `;
  smycThumb.onclick = () => openProfileDetail('SMYC_GALLERY');
  smycGrid.appendChild(smycThumb);
  smycRow.appendChild(smycGrid);
  gallery.appendChild(smycRow);

  showScreen('screen-all-profiles');
}

function openProfileDetail(code) {
  const isSmycGallery = (code === 'SMYC_GALLERY');
  const r = isSmycGallery ? RESULTS['SMYC'] : RESULTS[code];
  const card = $('profile-detail-card');

  // 配色：按四大型
  if (isSmycGallery) {
    card.style.backgroundColor = r.color;
    card.style.color = r.text;
  } else {
    const arcColors = ARCHETYPE_COLORS[r.archetype] || { bg: r.color, text: r.text };
    card.style.backgroundColor = arcColors.bg;
    card.style.color = arcColors.text;
  }

  // 标题
  $('detail-name').textContent = isSmycGallery ? '？？？？？' : r.name;

  // 图片
  const imgWrap = $('detail-img-wrap');
  if (r.img) {
    imgWrap.innerHTML = `<img src="${r.img}" alt="${r.name}" class="result-img">`;
    imgWrap.style.display = 'block';
  } else {
    imgWrap.style.display = 'none';
  }

  // 描述
  $('detail-desc').textContent = isSmycGallery
    ? '主题曲：？？？？？！——？？？？！？？？？？？？！'
    : r.desc;

  // 四大型部分
  const arcSection = $('detail-archetype-section');
  const arcPrefix = arcSection.querySelector('.archetype-prefix');
  if (isSmycGallery) {
    arcPrefix.textContent = '';
    $('detail-archetype-tag').textContent = '你不属于四大类型之一';
    $('detail-archetype-desc').textContent = '系统识别到用户在部分题目中选择异常，触发隐藏判定，无视其他条件直接进入此词条。';
  } else {
    arcPrefix.textContent = '所属四大型：';
    const arc = ARCHETYPES[r.archetype];
    $('detail-archetype-tag').textContent = `${r.archetype} · ${arc ? arc.title : ''}`;
    $('detail-archetype-desc').textContent = arc ? arc.desc : '';
  }

  // 八维倾向（文字版）
  const dimsEl = $('detail-dims-text');
  if (isSmycGallery) {
    dimsEl.textContent = '八维倾向：？？？？？';
  } else {
    const dims = code.split('').map(c => CODE_DIM_MAP[c] || c).join('，');
    dimsEl.textContent = `八维倾向：${dims}`;
  }

  showScreen('screen-profile-detail');
}

// ── Init ──────────────────────────────────────────────────

function init() {
  $('q-stats').textContent = `${QUESTIONS.length}题，4大维度，17种结果（含1种隐藏人格）`;

  $('btn-start').onclick = () => {
    resetState();
    renderQuestion();
    showScreen('screen-question');
  };

  $('btn-prev').onclick = handlePrev;
  $('btn-retry').onclick = () => showScreen('screen-start');

  // Archetype expand toggle
  $('btn-expand-arc').onclick = () => {
    const wrap = $('other-arcs-wrap');
    const isHidden = wrap.style.display === 'none';
    wrap.style.display = isHidden ? 'block' : 'none';
    $('btn-expand-arc').textContent = isHidden ? '收起' : '查看其他三大型';
  };

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

  // Gallery navigation
  $('btn-view-profiles').onclick = () => renderAllProfiles();
  $('btn-back-to-result').onclick = () => showScreen('screen-result');
  $('btn-back-to-profiles').onclick = () => showScreen('screen-all-profiles');
}

document.addEventListener('DOMContentLoaded', init);
