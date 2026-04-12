// ============================================================
// 题目数据配置 · Questions Data
// 格式说明：
//   id      - 题目编号（与 Excel 对应）
//   text    - 题目正文
//   options - 选项数组，每项含：
//               label  - 选项字母 (A/B/C/D)
//               text   - 选项文字
//               tags   - 该选项给哪些维度加分
//                        可用标签：正义 邪恶 守序 混乱 淡然 浓烈 素食 荤食
// ============================================================

const QUESTIONS = [
  {
    id: 'Q1',
    text: '希望两人在一起干什么？',
    options: [
      { label: 'A', text: '拉手逛公园',   tags: ['正义', '守序', '素食'] },
      { label: 'B', text: '疯狂砰',        tags: ['浓烈', '荤食'] },
      { label: 'C', text: '殉情',          tags: ['邪恶', '浓烈'] },
      { label: 'D', text: '合作一首新歌',  tags: ['正义', '守序', '素食'] },
    ],
  },
  {
    id: 'Q2',
    text: '能接受拆家吗？',
    options: [
      { label: 'A', text: '完全不',             tags: ['守序'] },
      { label: 'B', text: '可以一点点',          tags: ['混乱'] },
      { label: 'C', text: '唠地开因趴',          tags: ['混乱', '荤食'] },
      { label: 'D', text: '地人的感情都很好',     tags: ['正义', '守序', '淡然'] },
    ],
  },
  {
    id: 'Q3',
    text: '对出轨的接受程度？',
    options: [
      { label: 'A', text: '能接受文艺作品和现实中的出轨事件',  tags: ['邪恶', '荤食'] },
      { label: 'B', text: '只能接受现实中的出轨事件',          tags: ['邪恶', '素食'] },
      { label: 'C', text: '只能接受文艺作品中的出轨事件',      tags: ['正义', '荤食'] },
      { label: 'D', text: '完全不能接受任何出轨事件',          tags: ['正义', '素食'] },
    ],
  },
  {
    id: 'Q4',
    text: '能接受逆家吗？',
    options: [
      { label: 'A', text: '不可以',       tags: ['守序'] },
      { label: 'B', text: '我更爱吃包橙', tags: ['混乱'] },
      { label: 'C', text: '不清楚',       tags: ['混乱'] },
      { label: 'D', text: '无差',         tags: ['混乱'] },
    ],
  },
  {
    id: 'Q5',
    text: '觉得两人的相处模式？',
    options: [
      { label: 'A', text: '赘婿小三锁死了别祸害其他人', tags: ['邪恶', '浓烈', '守序'] },
      { label: 'B', text: '两个小猫萌萌滴',             tags: ['正义', '守序', '素食'] },
      { label: 'C', text: '细水长流老夫老妻',           tags: ['正义', '守序', '淡然'] },
      { label: 'D', text: '小泡菜互相扶持辛苦了',       tags: ['正义'] },
    ],
  },
];
