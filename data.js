// 般若心経の全フレーズデータ（意味上の区切り・章ごとに分類）
// 漢字、ふりがな、現代語訳、意味グループ
const SUTRA_SECTIONS = [
  {
    id: 1,
    title: "第一章：序論（観音菩薩の覚り）",
    shortTitle: "一、序論",
    desc: "観自在菩薩が深い智慧によって、万物は空であると見極め、苦しみを乗り越えた宣言。",
    startIndex: 0,
    endIndex: 4
  },
  {
    id: 2,
    title: "第二章：空の本質（色即是空）",
    shortTitle: "二、色即是空",
    desc: "形あるものと空は表裏一体。心と物質の本質を説き明かす最も有名な段落。",
    startIndex: 5,
    endIndex: 10
  },
  {
    id: 3,
    title: "第三章：諸法の実相（一切皆空・不生不滅）",
    shortTitle: "三、諸法空相",
    desc: "生まれることも滅することもなく、感覚や迷いも、仏教の教え（四諦）すらも固定した実体はない。",
    startIndex: 11,
    endIndex: 25
  },
  {
    id: 4,
    title: "第四章：菩薩の境地（恐怖の超越と涅槃）",
    shortTitle: "四、心無罣礙",
    desc: "智慧に依ることで心にとらわれや恐れがなくなり、迷いを離れて完全な覚り（涅槃）に至る。",
    startIndex: 26,
    endIndex: 34
  },
  {
    id: 5,
    title: "第五章：大呪の賛嘆と真言（彼岸への賛歌）",
    shortTitle: "五、呪・真言",
    desc: "般若波羅蜜多こそが至高の真言。すべての苦しみを除き、彼岸へと至る真言（マントラ）の結び。",
    startIndex: 35,
    endIndex: 48
  }
];

const SUTRA_DATA = [
  // --- 第一章：序論 ---
  {
    id: 0,
    sectionId: 1,
    kanji: "摩訶般若波羅蜜多心経",
    ruby: "まかはんにゃはらみったしんぎょう",
    reading: "まか はんにゃ はらみった しんぎょう",
    meaning: "大いなる完全な智慧により彼岸へ至る神髄の教え。"
  },
  {
    id: 1,
    sectionId: 1,
    kanji: "観自在菩薩",
    ruby: "かんじざいぼさつ",
    reading: "かんじざいぼさつ",
    meaning: "観音菩薩（自由自在に人々を見守り救う菩薩）が、"
  },
  {
    id: 2,
    sectionId: 1,
    kanji: "行深般若波羅蜜多時",
    ruby: "ぎょうじんはんにゃはらみったじ",
    reading: "ぎょうじん はんにゃ はらみった じ",
    meaning: "深く完全な智慧を実践していたそのとき、"
  },
  {
    id: 3,
    sectionId: 1,
    kanji: "照見五蘊皆空",
    ruby: "しょうけんごうんかいくう",
    reading: "しょうけん ごうん かいくう",
    meaning: "人間を構成する五つの要素（五蘊）はすべて実体がない「空」であると見極め、"
  },
  {
    id: 4,
    sectionId: 1,
    kanji: "度一切苦厄",
    ruby: "どいっさいくやく",
    reading: "ど いっさい くやく",
    meaning: "すべての苦しみや災いを超越・克服した。"
  },

  // --- 第二章：空の本質 ---
  {
    id: 5,
    sectionId: 2,
    kanji: "舎利子",
    ruby: "しゃりし",
    reading: "しゃりし",
    meaning: "弟子シャーリプトラ（舎利弗）よ、"
  },
  {
    id: 6,
    sectionId: 2,
    kanji: "色不異空",
    ruby: "しきふいくう",
    reading: "しき ふいくう",
    meaning: "形ある物質（色）は、実体がないこと（空）と異なることはなく、"
  },
  {
    id: 7,
    sectionId: 2,
    kanji: "空不異色",
    ruby: "くうふいしき",
    reading: "くう ふいしき",
    meaning: "実体がないこと（空）は、形ある物質（色）と異なることはない。"
  },
  {
    id: 8,
    sectionId: 2,
    kanji: "色即是空",
    ruby: "しきそくぜくう",
    reading: "しき そくぜ くう",
    meaning: "物質的な形あるものは、そのまま「空」であり、"
  },
  {
    id: 9,
    sectionId: 2,
    kanji: "空即是色",
    ruby: "くうそくぜしき",
    reading: "くう そくぜ しき",
    meaning: "「空」であるものが、そのまま物質的な形となっている。"
  },
  {
    id: 10,
    sectionId: 2,
    kanji: "受想行識亦復如是",
    ruby: "じゅそうぎょうしきやくぶにょぜ",
    reading: "じゅ そう ぎょう しき やくぶ にょぜ",
    meaning: "感覚・想念・意志・識別という心の働きも、すべて同様である。"
  },

  // --- 第三章：諸法の実相 ---
  {
    id: 11,
    sectionId: 3,
    kanji: "舎利子",
    ruby: "しゃりし",
    reading: "しゃりし",
    meaning: "シャーリプトラよ、"
  },
  {
    id: 12,
    sectionId: 3,
    kanji: "是諸法空相",
    ruby: "ぜしょほうくうそう",
    reading: "ぜ しょほう くうそう",
    meaning: "あらゆる現象（諸法）は実体なき「空」の姿である。"
  },
  {
    id: 13,
    sectionId: 3,
    kanji: "不生不滅",
    ruby: "ふしょうふめつ",
    reading: "ふしょう ふめつ",
    meaning: "生じることもなく、滅することもなく、"
  },
  {
    id: 14,
    sectionId: 3,
    kanji: "不垢不浄",
    ruby: "ふくふじょう",
    reading: "ふく ふじょう",
    meaning: "汚れることもなく、清らかになることもなく、"
  },
  {
    id: 15,
    sectionId: 3,
    kanji: "不増不減",
    ruby: "ふぞうふげん",
    reading: "ふぞう ふげん",
    meaning: "増えることもなく、減ることもない。"
  },
  {
    id: 16,
    sectionId: 3,
    kanji: "是故空中",
    ruby: "ぜこくうちゅう",
    reading: "ぜこ くうちゅう",
    meaning: "それゆえに「空」の中には、"
  },
  {
    id: 17,
    sectionId: 3,
    kanji: "無色無受想行識",
    ruby: "むしきむじゅそうぎょうしき",
    reading: "むしき むじゅ そう ぎょう しき",
    meaning: "物質（色）もなく、感覚・想念・意志・識別（受想行識）もない。"
  },
  {
    id: 18,
    sectionId: 3,
    kanji: "無眼耳鼻舌身意",
    ruby: "むげんにびぜつしんい",
    reading: "む げん に び ぜつ しん い",
    meaning: "目・耳・鼻・舌・身体・心（六根）の固執もなく、"
  },
  {
    id: 19,
    sectionId: 3,
    kanji: "無色声香味触法",
    ruby: "むしきしょうこうみそくほう",
    reading: "む しき しょう こう み そく ほう",
    meaning: "視覚・聴覚・嗅覚・味覚・触覚・意識の対象（六境）もない。"
  },
  {
    id: 20,
    sectionId: 3,
    kanji: "無眼界乃至無意識界",
    ruby: "むげんかいないしむいしきかい",
    reading: "むげんかい ないし むいしきかい",
    meaning: "目の対象世界から意識の対象世界に至るまですべての実体がない。"
  },
  {
    id: 21,
    sectionId: 3,
    kanji: "無無明亦無無明尽",
    ruby: "むむみょうやくむむみょうじん",
    reading: "む むみょう やく む むみょうじん",
    meaning: "無知（無明）もなく、無知が尽きることもなく、"
  },
  {
    id: 22,
    sectionId: 3,
    kanji: "乃至無老死亦無老死尽",
    ruby: "ないしむろうしやくむろうしじん",
    reading: "ないし むろうし やく むろうしじん",
    meaning: "老いや死もなく、老いや死が尽きることもない。"
  },
  {
    id: 23,
    sectionId: 3,
    kanji: "無苦集滅道",
    ruby: "むくしゅうめつどう",
    reading: "む く しゅう めつ どう",
    meaning: "苦しみ、その原因、苦しみの滅、滅に至る道（四諦）という固定観念もなく、"
  },
  {
    id: 24,
    sectionId: 3,
    kanji: "無智亦無得",
    ruby: "むちやくむとく",
    reading: "むち やく むとく",
    meaning: "知ることもなく、また得るものもない。"
  },
  {
    id: 25,
    sectionId: 3,
    kanji: "以無所得故",
    ruby: "いむしょとくこ",
    reading: "い むしょとく こ",
    meaning: "何ひとつ執着して得るものがないがゆえに、"
  },

  // --- 第四章：菩薩の境地 ---
  {
    id: 26,
    sectionId: 4,
    kanji: "菩提薩埵",
    ruby: "ぼだいさった",
    reading: "ぼだいさった",
    meaning: "覚りを求める者（菩薩）は、"
  },
  {
    id: 27,
    sectionId: 4,
    kanji: "依般若波羅蜜多故",
    ruby: "えはんにゃはらみったこ",
    reading: "え はんにゃ はらみった こ",
    meaning: "完全な智慧（般若波羅蜜多）に依るがゆえに、"
  },
  {
    id: 28,
    sectionId: 4,
    kanji: "心無罣礙",
    ruby: "しんむけいげ",
    reading: "しん むけいげ",
    meaning: "心に何のわだかまり・妨げもなく、"
  },
  {
    id: 29,
    sectionId: 4,
    kanji: "無罣礙故無有恐怖",
    ruby: "むけいげこむうくふ",
    reading: "むけいげ こ むう くふ",
    meaning: "妨げがないからこそ、何ものも恐れることがなく、"
  },
  {
    id: 30,
    sectionId: 4,
    kanji: "遠離一切顛倒夢想",
    ruby: "おんりいっさいてんどうむそう",
    reading: "おんり いっさい てんどう むそう",
    meaning: "あらゆるあべこべな妄想・思い込みから遠く離れ、"
  },
  {
    id: 31,
    sectionId: 4,
    kanji: "究竟涅槃",
    ruby: "くきょうねはん",
    reading: "くきょう ねはん",
    meaning: "究極の安らぎ（涅槃）に至っている。"
  },
  {
    id: 32,
    sectionId: 4,
    kanji: "三世諸仏",
    ruby: "さんぜしょぶつ",
    reading: "さんぜ しょぶつ",
    meaning: "過去・現在・未来のすべての仏たちも、"
  },
  {
    id: 33,
    sectionId: 4,
    kanji: "依般若波羅蜜多故",
    ruby: "えはんにゃはらみったこ",
    reading: "え はんにゃ はらみった こ",
    meaning: "この完全な智慧に依るがゆえに、"
  },
  {
    id: 34,
    sectionId: 4,
    kanji: "得阿耨多羅三藐三菩提",
    ruby: "とくあのくたらさんみゃくさんぼだい",
    reading: "とく あのくたら さんみゃく さんぼだい",
    meaning: "この上ない最高の覚り（阿耨多羅三藐三菩提）を得られた。"
  },

  // --- 第五章：大呪の賛嘆と真言 ---
  {
    id: 35,
    sectionId: 5,
    kanji: "故知般若波羅蜜多",
    ruby: "こちはんにゃはらみった",
    reading: "こち はんにゃ はらみった",
    meaning: "それゆえに知るべきである。完全な智慧（般若波羅蜜多）は、"
  },
  {
    id: 36,
    sectionId: 5,
    kanji: "是大神呪",
    ruby: "ぜだいじんしゅ",
    reading: "ぜ だいじんしゅ",
    meaning: "偉大な力をもつ神秘の言葉であり、"
  },
  {
    id: 37,
    sectionId: 5,
    kanji: "是大明呪",
    ruby: "ぜだいみょうしゅ",
    reading: "ぜ だいみょうしゅ",
    meaning: "迷いの闇を照らす輝かしい真言であり、"
  },
  {
    id: 38,
    sectionId: 5,
    kanji: "是無上呪",
    ruby: "ぜむじょうしゅ",
    reading: "ぜ むじょうしゅ",
    meaning: "これ以上なき至高の真言であり、"
  },
  {
    id: 39,
    sectionId: 5,
    kanji: "是無等等呪",
    ruby: "ぜむとうどうしゅ",
    reading: "ぜ むとうどうしゅ",
    meaning: "比べるもののない比類なき真言である。"
  },
  {
    id: 40,
    sectionId: 5,
    kanji: "能除一切苦",
    ruby: "のうじょいっさいく",
    reading: "のうじょ いっさい く",
    meaning: "よく一切の苦しみを取り除き、"
  },
  {
    id: 41,
    sectionId: 5,
    kanji: "真実不虚",
    ruby: "しんじつふきょ",
    reading: "しんじつ ふきょ",
    meaning: "真実にして偽りがない。"
  },
  {
    id: 42,
    sectionId: 5,
    kanji: "故説般若波羅蜜多呪",
    ruby: "こせつはんにゃはらみったしゅ",
    reading: "こせつ はんにゃ はらみった しゅ",
    meaning: "そこで、般若波羅蜜多の真言を説く。"
  },
  {
    id: 43,
    sectionId: 5,
    kanji: "即説呪曰",
    ruby: "そくせつしゅわつ",
    reading: "そく せつ しゅ わつ",
    meaning: "すなわちその真言に曰く、"
  },
  {
    id: 44,
    sectionId: 5,
    kanji: "羯諦羯諦",
    ruby: "ぎゃていぎゃてい",
    reading: "ぎゃてい ぎゃてい",
    meaning: "往ける者よ、往ける者よ、（迷いの岸を去り）"
  },
  {
    id: 45,
    sectionId: 5,
    kanji: "波羅羯諦",
    ruby: "はらぎゃてい",
    reading: "はらぎゃてい",
    meaning: "彼岸へ往ける者よ、（覚りの彼岸へ渡り）"
  },
  {
    id: 46,
    sectionId: 5,
    kanji: "波羅僧羯諦",
    ruby: "はらそうぎゃてい",
    reading: "はらそうぎゃてい",
    meaning: "ともに彼岸へ完全に往ける者よ、"
  },
  {
    id: 47,
    sectionId: 5,
    kanji: "菩提薩婆訶",
    ruby: "ぼじそわか",
    reading: "ぼじ そわか",
    meaning: "覚りよ、幸いあれ！成就あれ！"
  },
  {
    id: 48,
    sectionId: 5,
    kanji: "般若心経",
    ruby: "はんにゃしんぎょう",
    reading: "はんにゃ しんぎょう",
    meaning: "ここに般若心経を結ぶ。"
  }
];
