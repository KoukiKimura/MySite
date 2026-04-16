import { createInfoPage } from './info-page-factory.js';

export default {
  create() {
    return createInfoPage({
      slug: 'privacy',
      title: 'プライバシーポリシー',
      lead: 'このサイトは現段階で個人情報を外部サーバーへ送信しません。',
      sections: [
        {
          heading: '保存先',
          body: [
            'ログイン状態、検索履歴、おすすめプロフィール、プレイ記録は localStorage に保存されます。',
            '保存データは同じ端末とブラウザの中だけで利用されます。',
          ],
        },
        {
          heading: '保存対象',
          body: [
            '表示名、モード設定、検索履歴、プレイ結果を保存します。',
            'パスワードの生値は保存しません。',
          ],
        },
        {
          heading: '削除と今後の拡張',
          body: [
            '履歴削除やおすすめリセットは今後の操作導線として拡張予定です。',
            'DB 導入後の監査ログや管理者確認機能は別フェーズで実装します。',
          ],
        },
      ],
      links: [
        { label: '保護者向け案内', path: '/parents' },
        { label: 'お問い合わせ', path: '/contact' },
      ],
    });
  },
};
