import { createInfoPage } from './info-page-factory.js';

export default {
  create() {
    return createInfoPage({
      slug: 'about',
      title: 'About',
      lead: 'ペンギンげーむず！は、キッズ向けポータルとティーンズβを切り替えられるゲームサイトです。',
      sections: [
        {
          heading: 'このサイトについて',
          body: [
            'ブラウザで遊べるゲームだけでなく、学びや安全案内への導線をまとめるポータルとして設計しています。',
            'ペンギンの案内役を前面に出し、子どもでも迷いにくい構成を目指しています。',
          ],
        },
        {
          heading: 'ティーンズβについて',
          body: [
            '同じブランド内の別モードとして、ニュースや進路など情報ポータル寄りの導線を先行検証しています。',
          ],
        },
      ],
      links: [
        { label: '使い方', path: '/guide' },
        { label: 'お問い合わせ', path: '/contact' },
      ],
    });
  },
};
