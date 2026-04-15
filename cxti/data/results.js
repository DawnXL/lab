// ============================================================
// 人格结果数据配置 · Results Data（0415版）
// ============================================================

const ARCHETYPES = {
  '信仰狂热型': {
    title: '城堡原教旨主义',
    desc: '不拆不逆是底线，甚至是法律。正义系：觉得这对"天经地义必须在一起"；邪恶系：觉得"他们就该这样BE才完美"不管甜还是刀，都只认这一对，世界可以毁灭，这对不能乱。'
  },
  '混乱快乐型': {
    title: '杂食狂欢派',
    desc: '可以有本命，但绝不会只吃一个。拆逆？来都来了；BE/HE？都能嗑出花。享受排列组合的快乐，时常会自己做饭，甚至端出一桌满汉全席。这类人是同人圈的气氛组+生产力核心。'
  },
  '佛系体验型': {
    title: '随缘吃饭人',
    desc: '"你们吵你们的，我只是来吃饭的"——有粮就吃，没有就算。不太会为CP情绪大起大落，看到好东西会开心，但不会深陷，是同人圈最稳定的存在。'
  },
  '低调洁癖型': {
    title: '隐士守序党',
    desc: '这类人很像"影子读者"，只吃固定CP（甚至很冷门），几乎不参与讨论，默默收藏、默默嗑，安静守护自己的小宇宙。'
  }
};

const RESULTS = {
  // ── 正浓系列 · Yellow ──────────────────────────────────────
  ZNLS: {
    cn: '正浓乱素',
    name: '小泡菜',
    archetype: '混乱快乐型',
    desc: '主题曲：一起吃苦的幸福\n往事一幕幕会将我们搂住\n——大概是团偏吧，有很多种打动你的感情，但挚爱这一种',
    color: '#F2C12E', text: '#1A3560',
    img: 'images/ZNLS.jpg'
  },
  ZNLH: {
    cn: '正浓乱荤',
    name: '魅魔臣仆',
    archetype: '混乱快乐型',
    desc: '主题曲：rhythm after summer\n彼此交融 我们成为一体\n——爸红误入公共浴室，两人害怕得开始砰了',
    color: '#F2C12E', text: '#1A3560',
    img: 'images/ZNLH.jpg'
  },
  ZNXS: {
    cn: '正浓序素',
    name: '城堡卫士',
    archetype: '信仰狂热型',
    desc: '主题曲：love is u\n你是比星辰更闪耀的暮光\n——鉴定为赛级爸红丝，完全正心诚意地爱着爸妈，笑与泪都是珍藏',
    color: '#F2C12E', text: '#1A3560',
    img: 'images/ZNXS.jpg'
  },
  ZNXH: {
    cn: '正浓序荤',
    name: '公猫配种专家',
    archetype: '信仰狂热型',
    desc: '主题曲：overdrop\n一滴甘霖让我心急如焚\n——只渴望彼此，创世的电光降临在冰原，万物由此诞生',
    color: '#F2C12E', text: '#1A3560',
    img: 'images/ZNXH.jpg'
  },

  // ── 正淡系列 · Lavender ────────────────────────────────────
  ZDLS: {
    cn: '正淡乱素',
    name: '游食欧妈',
    archetype: '佛系体验型',
    desc: '主题曲：花曜日\n你是将我解救的万能钥匙\n——好像是团粉，只觉得这两个人相处模式很好，食之无味',
    color: '#B5C9E2', text: '#1A3560',
    img: 'images/ZDLS.jpg'
  },
  ZDLH: {
    cn: '正淡乱荤',
    name: '泡菜炒肉',
    archetype: '佛系体验型',
    desc: '主题曲：touch it\n你的手势使我摇摇欲坠\n——馋丫头啥肉都吃来者不拒了',
    color: '#B5C9E2', text: '#1A3560',
    img: 'images/ZDLH.jpg'
  },
  ZDXS: {
    cn: '正淡序素',
    name: '城堡普通居民',
    archetype: '低调洁癖型',
    desc: "主题曲：i don't even mind\n在月光下憧憬你\n——喜欢配平文学，尊重他们的关系性，是相处很舒服的朋友",
    color: '#B5C9E2', text: '#1A3560',
    img: 'images/ZDXS.jpg'
  },
  ZDXH: {
    cn: '正淡序荤',
    name: '邻人',
    archetype: '低调洁癖型',
    desc: '主题曲：let me in\n让我进入你怀抱的海洋\n——你眼里的他们像住隔壁的小情侣，偶尔觉得很温馨，但只是旁观',
    color: '#B5C9E2', text: '#1A3560',
    img: 'images/ZDXH.jpg'
  },

  // ── 邪浓系列 · Red ─────────────────────────────────────────
  ENLS: {
    cn: '邪浓乱素',
    name: '恨之海',
    archetype: '混乱快乐型',
    desc: '主题曲：失忆蝴蝶\n只差半步成诗\n——是梦中捉不到的蝴蝶掠影，字典里夹着破败秋叶，一切无从印证',
    color: '#C93040', text: '#FAE8EA',
    img: 'images/ENLS.jpg'
  },
  ENLH: {
    cn: '邪浓乱荤',
    name: '吸血鬼',
    archetype: '混乱快乐型',
    desc: '主题曲：漩涡\n卷起那热吻背后万尺风波\n——一晌贪欢，地上泼洒的红酒渍，枕边的乱云',
    color: '#C93040', text: '#FAE8EA',
    img: 'images/ENLH.jpg'
  },
  ENXS: {
    cn: '邪浓序素',
    name: '古堡怨灵',
    archetype: '信仰狂热型',
    desc: '主题曲：四月后的离别\n让我们做最后的道别\n——谁被困在那个春天，眼泪织成锁链',
    color: '#C93040', text: '#FAE8EA',
    img: 'images/ENXS.jpg'
  },
  ENXH: {
    cn: '邪浓序荤',
    name: '狂宴者',
    archetype: '信仰狂热型',
    desc: '主题曲：lost paradise\n是非界限模糊不清 此刻这里只有我们别无他人\n——烧成齑粉后用血融合，一起吞下罪孽的果实',
    color: '#C93040', text: '#FAE8EA',
    img: 'images/ENXH.jpg'
  },

  // ── 邪淡系列 · Green ───────────────────────────────────────
  EDLS: {
    cn: '邪淡乱素',
    name: '迷茫者',
    archetype: '佛系体验型',
    desc: '主题曲：你要结婚了\n如题\n——弯恋直好难吃啊',
    color: '#8EBD8A', text: '#1A3A1A',
    img: 'images/EDLS.jpg'
  },
  EDLH: {
    cn: '邪淡乱荤',
    name: '杂食者',
    archetype: '佛系体验型',
    desc: '主题曲：朝你大胯捏一把\n假烟假酒假朋友\n——大家都是那种朋友，爱过吗？谁知道',
    color: '#8EBD8A', text: '#1A3A1A',
    img: 'images/EDLH.jpg'
  },
  EDXS: {
    cn: '邪淡序素',
    name: '命苦者',
    archetype: '低调洁癖型',
    desc: '主题曲：我的好兄弟\n朋友的情谊啊比天还高比地还辽阔\n——没什么张力纯哥们吧',
    color: '#8EBD8A', text: '#1A3A1A',
    img: 'images/EDXS.jpg'
  },
  EDXH: {
    cn: '邪淡序荤',
    name: '吃瓜者',
    archetype: '低调洁癖型',
    desc: '主题曲：吴哥窟\n越要退出越向你生命移动\n——韩产浪漫，感觉不道德',
    color: '#8EBD8A', text: '#1A3A1A',
    img: 'images/EDXH.jpg'
  },

  // ── 隐藏人格 · 审美异常 ────────────────────────────────────
  SMYC: {
    cn: '审美异常',
    name: '审美异常者',
    archetype: '审美异常者', // Special case
    desc: '主题曲：Hey Mama\n——你是独特的！你喜欢金钟大这个造型！',
    color: '#055F5F', text: '#E0F4F4',
    img: 'images/SMYC.jpg'
  }
};
