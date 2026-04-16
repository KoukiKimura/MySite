import { createInfoPage } from './info-page-factory.js';

export default {
  create() {
    return createInfoPage({
      slug: 'safety',
      title: '外部リンク注意',
      lead: '外部サイトへ移動する前に確認したいポイントをまとめています。',
      sections: [
        {
          heading: 'キッズ向け',
          body: [
            '保護者と一緒にリンク先を確認し、知らない入力フォームや広告を開かないようにしてください。',
            '外部リンクは段階的に追加予定で、強い安全フィルタを前提に設計しています。',
          ],
        },
        {
          heading: 'ティーンズβ向け',
          body: [
            'ニュースや話題を扱う場合でも、情報の出典と更新日を確認する前提で利用してください。',
            '不審なダウンロードや個人情報入力を促すリンクには進まないでください。',
          ],
        },
      ],
      links: [
        { label: '掲載基準', path: '/policy/content' },
        { label: '保護者向け案内', path: '/parents' },
      ],
    });
  },
};
