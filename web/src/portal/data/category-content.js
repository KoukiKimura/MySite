import { SiteMode } from '../../shared/state/site-mode.js';

export const CATEGORY_MASTER = {
  [SiteMode.KIDS]: [
    { id: 'games', label: 'ゲーム', icon: '🎮', description: 'あそべるゲームとスコア挑戦の入口' },
    { id: 'learn', label: 'まなぶ', icon: '📘', description: 'ことばや学びの入口をまとめたカテゴリ' },
    { id: 'animals', label: 'どうぶつ', icon: '🐧', description: 'いきものや自然をしらべる入口' },
    { id: 'sports', label: 'スポーツ', icon: '⚽', description: '体を動かす話題やルールの入口' },
    { id: 'music', label: '音楽', icon: '🎵', description: 'うたやリズムを楽しむ入口' },
    { id: 'drawing', label: 'おえかき', icon: '🎨', description: 'つくる・描く遊びの入口' },
  ],
  [SiteMode.TEENS]: [
    { id: 'news', label: 'ニュース', icon: '📰', description: '要約付きで話題を拾うカテゴリ' },
    { id: 'study', label: '学び', icon: '📚', description: '勉強法やAI活用のヒント' },
    { id: 'music', label: '音楽', icon: '🎧', description: '放課後の音や話題曲の入口' },
    { id: 'after-school', label: '放課後', icon: '🎒', description: '部活や趣味を束ねるカテゴリ' },
    { id: 'career', label: '進路', icon: '🧭', description: '将来や進学の入口' },
  ],
};

export const CATEGORY_CONTENT = {
  [SiteMode.KIDS]: {
    games: {
      title: 'ゲーム',
      icon: '🎮',
      description: 'いま遊べるゲームや、次に追加したい遊びをまとめています。',
      searchPlaceholder: 'ゲームやキーワードをさがそう',
      keywords: ['タイピング', 'ブロック崩し', 'スコア', 'ランキング'],
      featureItems: [
        {
          id: 'kids-games-typing',
          title: 'タイピングでスコアアタック',
          description: 'ローマ字を打ってスコアに挑戦。最初に試しやすい公開中コンテンツです。',
          linkPath: '/games/typing',
          mode: 'kids',
          tone: 'sunny',
          category: 'games',
          gameId: 'typing',
          tags: ['タイピング', 'スコア'],
          keywords: ['ローマ字', 'キーボード'],
          baseScore: 10,
        },
        {
          id: 'kids-games-ranking',
          title: 'ランキングでみんなの記録を見る',
          description: '端末内の成績をまとめて見返し、次の目標を決めやすくします。',
          linkPath: '/ranking',
          mode: 'kids',
          tone: 'mint',
          category: 'games',
          kind: 'support',
          tags: ['ランキング', '記録'],
          keywords: ['スコア', 'ベスト'],
          baseScore: 7,
        },
      ],
      listItems: [
        {
          title: 'ブロック崩しも公開中',
          description: 'マウス操作で遊べる5ステージ制のアクションゲームです。',
          linkPath: '/games/breakout',
          badge: 'Play',
          tags: ['ブロック崩し', 'アクション'],
        },
        {
          title: 'PCで遊ぶともっと快適',
          description: 'キーボード操作のゲームは PC からの利用をおすすめしています。',
          linkPath: '/guide',
          badge: 'Guide',
          tags: ['遊び方', 'PC推奨'],
        },
      ],
      gameIds: ['typing', 'breakout'],
      sidebarLinks: [
        { title: '保護者向け案内', description: '安全方針と保存データの扱いを確認できます。', path: '/parents' },
        { title: '使い方', description: 'ゲームの探し方やモード切替をまとめています。', path: '/guide' },
      ],
      recommendationIds: ['kids-home-typing', 'kids-home-parents'],
    },
    learn: {
      title: 'まなぶ',
      icon: '📘',
      description: 'ことば、しらべ学習、自由研究につながる入口を集めています。',
      searchPlaceholder: 'ことばや学びのテーマをさがそう',
      keywords: ['ことば', '自由研究', 'しらべる', 'ローマ字'],
      featureItems: [
        {
          id: 'kids-learn-words',
          title: 'ことばあそびの入口',
          description: '語彙やローマ字を楽しく扱う特集の案内です。',
          linkPath: '/games/typing',
          mode: 'kids',
          tone: 'mint',
          category: 'learn',
          gameId: 'typing',
          tags: ['ことば', 'ローマ字'],
          keywords: ['文字', '学び'],
          baseScore: 9,
        },
        {
          id: 'kids-learn-guide',
          title: '学び方ガイド',
          description: '検索、カテゴリ、人気キーワードの使い方をやさしく案内します。',
          linkPath: '/guide',
          mode: 'kids',
          tone: 'sunny',
          category: 'learn',
          kind: 'safety',
          tags: ['使い方', '安心'],
          keywords: ['ガイド', '検索'],
          baseScore: 6,
        },
      ],
      listItems: [
        {
          title: '自由研究メモを準備中',
          description: '観察・実験・まとめ方を探せるページを今後追加します。',
          badge: 'Mock',
          tags: ['自由研究', '理科'],
        },
      ],
      gameIds: ['typing'],
      sidebarLinks: [
        { title: '掲載基準', description: 'どんな内容を載せるかの基準を確認できます。', path: '/policy/content' },
        { title: 'プライバシー', description: '端末内保存の扱いをまとめています。', path: '/policy/privacy' },
      ],
      recommendationIds: ['kids-home-guide', 'kids-home-typing'],
    },
    animals: {
      title: 'どうぶつ',
      icon: '🐧',
      description: 'いきものや自然をしらべるための入口です。',
      searchPlaceholder: 'どうぶつや自然のテーマをさがそう',
      keywords: ['ペンギン', '海', '南極', '観察'],
      featureItems: [
        {
          id: 'kids-animals-penguin',
          title: 'ペンギン図鑑の入口',
          description: '住んでいる場所や種類を楽しく見分けるための案内です。',
          mode: 'kids',
          tone: 'sky',
          category: 'animals',
          tags: ['ペンギン', '図鑑'],
          keywords: ['南極', '生きもの'],
          baseScore: 8,
        },
      ],
      listItems: [
        {
          title: '観察メモをつくろう',
          description: '見つけたことを言葉にする練習に向いたカテゴリです。',
          badge: 'Idea',
          tags: ['観察', 'メモ'],
        },
      ],
      gameIds: [],
      sidebarLinks: [
        { title: '外部リンク注意', description: '外部サイトに進む前の確認ポイントです。', path: '/safety/links' },
      ],
      recommendationIds: ['kids-home-parents'],
    },
    sports: {
      title: 'スポーツ',
      icon: '⚽',
      description: 'ルールや応援の話題を入口カードとして整理しています。',
      searchPlaceholder: 'スポーツの話題をさがそう',
      keywords: ['サッカー', '野球', '応援', 'ルール'],
      featureItems: [
        {
          id: 'kids-sports-cheer',
          title: '応援のことばをおぼえる',
          description: '試合を見る前にルールや言葉を確認する導線です。',
          mode: 'kids',
          tone: 'coral',
          category: 'sports',
          tags: ['応援', 'ことば'],
          keywords: ['ルール', 'スポーツ'],
          baseScore: 7,
        },
      ],
      listItems: [
        {
          title: '体を動かすきっかけ作り',
          description: '遊ぶ前のストレッチや準備の案内も追加予定です。',
          badge: 'Plan',
          tags: ['準備', '運動'],
        },
      ],
      gameIds: [],
      sidebarLinks: [
        { title: '保護者向け案内', description: '外で遊ぶときの見守り方もまとめています。', path: '/parents' },
      ],
      recommendationIds: ['kids-home-parents'],
    },
    music: {
      title: '音楽',
      icon: '🎵',
      description: '歌やリズムの話題を楽しむための入口です。',
      searchPlaceholder: 'うたやリズムをさがそう',
      keywords: ['リズム', 'うた', 'ピアノ', 'BGM'],
      featureItems: [
        {
          id: 'kids-music-rhythm',
          title: 'リズムであそぶ入口',
          description: '音の数え方やテンポを楽しむ特集カードです。',
          mode: 'kids',
          tone: 'sunny',
          category: 'music',
          tags: ['リズム', 'うた'],
          keywords: ['テンポ', '音楽'],
          baseScore: 7,
        },
      ],
      listItems: [
        {
          title: 'ことばと音の練習',
          description: 'タイピングと相性のよい、テンポよく覚える遊びも準備中です。',
          badge: 'Mock',
          tags: ['ことば', 'テンポ'],
        },
      ],
      gameIds: ['typing'],
      sidebarLinks: [
        { title: '使い方', description: '人気キーワードからもカテゴリを移動できます。', path: '/guide' },
      ],
      recommendationIds: ['kids-home-typing'],
    },
    drawing: {
      title: 'おえかき',
      icon: '🎨',
      description: '描く、つくる、色を楽しむ入口をまとめたカテゴリです。',
      searchPlaceholder: 'おえかきや工作をさがそう',
      keywords: ['おえかき', '色', '工作', 'ドット絵'],
      featureItems: [
        {
          id: 'kids-drawing-lab',
          title: 'つくるラボの入口',
          description: 'ドット絵や工作のテーマをまとめて追加する予定です。',
          mode: 'kids',
          tone: 'coral',
          category: 'drawing',
          tags: ['工作', 'アート'],
          keywords: ['ドット絵', '色'],
          baseScore: 7,
        },
      ],
      listItems: [
        {
          title: '色で気分を伝えてみよう',
          description: '描いたものを言葉にする遊びにも広げられるカテゴリです。',
          badge: 'Idea',
          tags: ['色', '表現'],
        },
      ],
      gameIds: [],
      sidebarLinks: [
        { title: '掲載基準', description: '画像や表現の掲載基準はこちらです。', path: '/policy/content' },
      ],
      recommendationIds: ['kids-home-guide'],
    },
  },
  [SiteMode.TEENS]: {
    news: {
      title: 'ニュース',
      icon: '📰',
      description: '短く読める話題カードをまとめたカテゴリです。',
      searchPlaceholder: '気になる話題をさがす',
      keywords: ['要約', '話題', 'テクノロジー', '社会'],
      featureItems: [
        {
          id: 'teens-news-digest',
          title: '1分ニュースダイジェスト',
          description: 'ニュースの概要を短くつかむためのモックカードです。',
          mode: 'teens',
          tone: 'navy',
          category: 'news',
          tags: ['ニュース', '要約'],
          keywords: ['話題', '時事'],
          baseScore: 10,
        },
      ],
      listItems: [
        {
          title: '真偽確認のメモ',
          description: '情報をうのみにしないための確認ポイントを追加予定です。',
          badge: 'Guide',
          tags: ['安全', '確認'],
        },
      ],
      gameIds: [],
      sidebarLinks: [
        { title: '外部リンク注意', description: 'ニュース先リンクを見る前に確認したい項目です。', path: '/safety/links' },
      ],
      recommendationIds: ['teens-home-news', 'teens-home-career'],
    },
    study: {
      title: '学び',
      icon: '📚',
      description: '勉強法や AI 活用のヒントをまとめるカテゴリです。',
      searchPlaceholder: '勉強法や学びをさがす',
      keywords: ['勉強法', 'AI', '復習', 'ノート'],
      featureItems: [
        {
          id: 'teens-study-ai',
          title: 'AI とことばラボ',
          description: '難しすぎない説明で技術トピックへ入る入口案です。',
          mode: 'teens',
          tone: 'mint',
          category: 'study',
          tags: ['AI', '学び'],
          keywords: ['テクノロジー', '復習'],
          baseScore: 9,
        },
      ],
      listItems: [
        {
          title: 'タイピングで基礎体力づくり',
          description: '入力速度を整えたいときは共通ゲームも活用できます。',
          linkPath: '/games/typing',
          badge: 'Play',
          tags: ['タイピング', '基礎'],
        },
      ],
      gameIds: ['typing'],
      sidebarLinks: [
        { title: '使い方', description: 'モード切替と検索の違いをまとめています。', path: '/guide' },
      ],
      recommendationIds: ['teens-home-study', 'teens-home-ranking'],
    },
    music: {
      title: '音楽',
      icon: '🎧',
      description: '放課後の音楽体験や話題曲を扱うカテゴリです。',
      searchPlaceholder: '音楽や放課後の話題をさがす',
      keywords: ['プレイリスト', '話題曲', '部活', 'リズム'],
      featureItems: [
        {
          id: 'teens-music-playlist',
          title: 'プレイリストメモ',
          description: '気分やシーンごとに音楽を切り替える想定の入口です。',
          mode: 'teens',
          tone: 'coral',
          category: 'music',
          tags: ['音楽', '放課後'],
          keywords: ['プレイリスト', '話題曲'],
          baseScore: 8,
        },
      ],
      listItems: [
        {
          title: '集中モードの切替',
          description: '勉強と休憩を切り替えるテーマも今後追加予定です。',
          badge: 'Mock',
          tags: ['集中', '休憩'],
        },
      ],
      gameIds: [],
      sidebarLinks: [
        { title: '掲載基準', description: '扱う表現や外部導線の基準をまとめています。', path: '/policy/content' },
      ],
      recommendationIds: ['teens-home-news'],
    },
    'after-school': {
      title: '放課後',
      icon: '🎒',
      description: '部活や趣味をまとめるカテゴリです。',
      searchPlaceholder: '放課後のテーマをさがす',
      keywords: ['部活', '趣味', '友達', '放課後'],
      featureItems: [
        {
          id: 'teens-afterschool-topic',
          title: '放課後トピック',
          description: '部活や趣味を軽く見渡すためのモックカードです。',
          mode: 'teens',
          tone: 'sunny',
          category: 'after-school',
          tags: ['部活', '趣味'],
          keywords: ['放課後', '友達'],
          baseScore: 8,
        },
      ],
      listItems: [
        {
          title: '気分転換に共通ゲーム',
          description: '短時間で切り替えたいときの共通ゲーム導線も残しています。',
          linkPath: '/games/breakout',
          badge: 'Play',
          tags: ['ゲーム', 'リフレッシュ'],
        },
      ],
      gameIds: ['breakout'],
      sidebarLinks: [
        { title: 'プライバシー', description: '端末内保存と削除方法はこちらです。', path: '/policy/privacy' },
      ],
      recommendationIds: ['teens-home-ranking'],
    },
    career: {
      title: '進路',
      icon: '🧭',
      description: '将来や進学の入口をメモできるカテゴリです。',
      searchPlaceholder: '進路や将来のテーマをさがす',
      keywords: ['高校', '大学', '将来', 'メモ'],
      featureItems: [
        {
          id: 'teens-career-board',
          title: '進路メモボード',
          description: '興味や選択肢を軽く残していくための入口です。',
          mode: 'teens',
          tone: 'navy',
          category: 'career',
          tags: ['進路', '将来'],
          keywords: ['高校', '大学'],
          baseScore: 10,
        },
      ],
      listItems: [
        {
          title: '相談の入口を整理中',
          description: '大人への相談や問い合わせ導線も後から追加できる設計です。',
          linkPath: '/contact',
          badge: 'Contact',
          tags: ['相談', '問い合わせ'],
        },
      ],
      gameIds: [],
      sidebarLinks: [
        { title: 'お問い合わせ', description: '掲載内容に関する相談窓口はこちらです。', path: '/contact' },
      ],
      recommendationIds: ['teens-home-career', 'teens-home-study'],
    },
  },
};

export function getCategories(mode) {
  return CATEGORY_MASTER[mode] ?? [];
}

export function getCategoryMeta(mode, category) {
  return getCategories(mode).find(item => item.id === category) ?? null;
}

export function getCategoryContent(mode, category) {
  return CATEGORY_CONTENT[mode]?.[category] ?? null;
}

export function isValidCategory(mode, category) {
  return Boolean(getCategoryMeta(mode, category));
}
