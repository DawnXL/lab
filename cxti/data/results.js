// ============================================================
// 人格结果数据配置 · Results Data
// 编码规则（B + C + A + D 顺序）：
//   B维度：Z = 正义(正)  E = 邪恶(邪)
//   C维度：N = 浓烈(浓)  D = 淡然(淡)
//   A维度：X = 守序(序)  L = 混乱(乱)
//   D维度：S = 素食(素)  H = 荤食(荤)
//
// 颜色体系：
//   ZN 正浓 → 黄色  #F2C12E
//   ZD 正淡 → 淡蓝  #B5C9E2
//   EN 邪浓 → 红色  #C93040
//   ED 邪淡 → 绿色  #8EBD8A
// ============================================================

const RESULTS = {

  // ── 正浓系列 · Yellow ─────────────────────────────────────
  ZNLS: {
    cn: '正浓乱素',
    desc: '主题曲：一起吃苦的幸福\n往事一幕幕会将我们搂住',
    color: '#F2C12E', text: '#1A3560',
    img: 'images/ZNLS.jpg',
  },
  ZNLH: {
    cn: '正浓乱荤',
    desc: '主题曲：rhythm after summer\n彼此交融，我们成为一体',
    color: '#F2C12E', text: '#1A3560',
  },
  ZNXS: {
    cn: '正浓序素',
    desc: '主题曲：love is u\n你是比星辰更闪耀的暮光',
    color: '#F2C12E', text: '#1A3560',
  },
  ZNXH: {
    cn: '正浓序荤',
    desc: '主题曲：overdrop\n一滴甘霖让我心急如焚',
    color: '#F2C12E', text: '#1A3560',
  },

  // ── 正淡系列 · Lavender ───────────────────────────────────
  ZDLS: {
    cn: '正淡乱素',
    desc: '主题曲：花曜日\n你是将我解救的万能钥匙',
    color: '#B5C9E2', text: '#1A3560',
  },
  ZDLH: {
    cn: '正淡乱荤',
    desc: '主题曲：touch it\n你的手势使我摇摇欲坠',
    color: '#B5C9E2', text: '#1A3560',
  },
  ZDXS: {
    cn: '正淡序素',
    desc: "主题曲：i don't even mind\n在月光下憧憬你",
    color: '#B5C9E2', text: '#1A3560',
    img: 'images/ZDXS.jpg',
  },
  ZDXH: {
    cn: '正淡序荤',
    desc: '主题曲：let me in\n让我进入你怀抱的海洋',
    color: '#B5C9E2', text: '#1A3560',
  },

  // ── 邪浓系列 · Red ────────────────────────────────────────
  ENLS: {
    cn: '邪浓乱素',
    desc: '主题曲：失忆蝴蝶\n只差半步成诗',
    color: '#C93040', text: '#FAE8EA',
  },
  ENLH: {
    cn: '邪浓乱荤',
    desc: '主题曲：漩涡\n卷起那热吻背后万尺风波',
    color: '#C93040', text: '#FAE8EA',
  },
  ENXS: {
    cn: '邪浓序素',
    desc: '主题曲：四月后的离别\n让我们做最后的道别',
    color: '#C93040', text: '#FAE8EA',
  },
  ENXH: {
    cn: '邪浓序荤',
    desc: '主题曲：lost paradise\n是非界限模糊不清，此刻这里只有我们',
    color: '#C93040', text: '#FAE8EA',
  },

  // ── 邪淡系列 · Green ──────────────────────────────────────
  EDLS: {
    cn: '邪淡乱素',
    desc: '主题曲：你要结婚了\n如题',
    color: '#8EBD8A', text: '#1A3A1A',
    img: 'images/EDLS.jpg',
  },
  EDLH: {
    cn: '邪淡乱荤',
    desc: '主题曲：朝你大胯捏一把\n假烟假酒假朋友',
    color: '#8EBD8A', text: '#1A3A1A',
  },
  EDXS: {
    cn: '邪淡序素',
    desc: '主题曲：我的好兄弟\n朋友的情谊啊比天还高比地还辽阔',
    color: '#8EBD8A', text: '#1A3A1A',
  },
  EDXH: {
    cn: '邪淡序荤',
    desc: '主题曲：吴哥窟\n越要退出越向你生命移动',
    color: '#8EBD8A', text: '#1A3A1A',
  },
};
