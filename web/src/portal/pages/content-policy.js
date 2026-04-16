import { createInfoPage } from './info-page-factory.js';

export default {
  create() {
    return createInfoPage({
      slug: 'policy',
      title: 'コンテンツ掲載基準',
      lead: '年齢に合った内容だけを扱うための基準をまとめています。',
      sections: [
        {
          heading: 'キッズモード',
          body: [
            '性的表現、過度な暴力、危険行為の誘導、SNS への強い導線は掲載対象から除外します。',
            'やさしい言葉と見失いにくい導線を優先します。',
          ],
        },
        {
          heading: 'ティーンズβ',
          body: [
            '一般ニュースや音楽、学びの話題は扱いますが、詐欺やウイルス誘導など危険な内容は除外します。',
            'モック段階でも外部導線を増やしすぎず、内部カード中心で検証します。',
          ],
        },
        {
          heading: '画像と表現',
          body: [
            '画像アセットは年齢適合性レビューを前提とし、必要に応じて差し替えます。',
          ],
        },
      ],
      links: [
        { label: 'プライバシー', path: '/policy/privacy' },
        { label: '外部リンク注意', path: '/safety/links' },
      ],
    });
  },
};
