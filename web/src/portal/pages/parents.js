import { createInfoPage } from './info-page-factory.js';

export default {
  create() {
    return createInfoPage({
      slug: 'parents',
      title: '保護者向け案内',
      lead: '安全方針、保存データ、問い合わせ導線をまとめています。',
      sections: [
        {
          heading: 'サイトの狙い',
          body: [
            'キッズ向けの入口を明確にし、遊びと学びのどちらにも迷わず進める構成を目指しています。',
            'ティーンズβは同じブランド内の別モードとして試作し、情報量の多い導線を検証しています。',
          ],
        },
        {
          heading: '安全方針',
          body: [
            '外部リンクを増やす前提で、注意ページと掲載基準ページを常にたどれる構成にしています。',
            'お問い合わせ導線をフッターと関連ページに配置し、保護者からの連絡先を確保しています。',
          ],
        },
        {
          heading: '保存されるデータ',
          body: [
            'ログイン状態、検索履歴、おすすめプロフィール、プレイ記録は端末内の localStorage に保存されます。',
            '外部サーバーへの同期や会員管理は現段階では行っていません。',
          ],
        },
      ],
      links: [
        { label: '使い方', path: '/guide' },
        { label: 'プライバシー', path: '/policy/privacy' },
        { label: 'お問い合わせ', path: '/contact' },
      ],
    });
  },
};
