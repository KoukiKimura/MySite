import { createInfoPage } from './info-page-factory.js';

export default {
  create() {
    return createInfoPage({
      slug: 'guide',
      title: '使い方',
      lead: 'トップ、カテゴリ、検索、ランキングの基本的な使い方をまとめています。',
      sections: [
        {
          heading: '1. トップから探す',
          body: [
            'トップの検索欄に言葉を入れると、特集カードとゲーム一覧をその場で絞り込めます。',
            '人気キーワードやカテゴリレールを使うと、目的に近いページへすぐ移動できます。',
          ],
        },
        {
          heading: '2. サイトを切り替える',
          body: [
            'ヘッダーの `キッズ` と `ティーンズβ` を押すと、同じブランド内の別モードへ切り替わります。',
            '選んだモードは端末内に保存され、次回アクセス時も復元されます。',
          ],
        },
        {
          heading: '3. ログインとランキング',
          body: [
            'ログインはモック実装で、表示名と好みのモードを端末内に保存します。',
            'プレイ結果はランキングページで見返せます。',
          ],
        },
      ],
      links: [
        { label: '保護者向け案内', path: '/parents' },
        { label: 'ランキング', path: '/ranking' },
      ],
    });
  },
};
