import { describe, expect, it } from 'vitest';
import { countMatches, filterCollection, matchesQuery, matchesTab } from './home-filters.js';

const sampleItems = [
  {
    title: 'タイピングペンギン',
    description: 'ローマ字を練習できるゲーム',
    badge: '人気',
    category: 'play',
    tags: ['タイピング', 'ことば'],
    keywords: ['ローマ字', 'キーボード'],
  },
  {
    title: '自由研究ナビ',
    description: '理科の題材を探せるモック',
    badge: 'Mock',
    category: 'learn',
    tags: ['理科'],
    keywords: ['自由研究', '実験'],
  },
];

describe('home-filters', () => {
  it('activeTab が all のときは全件一致する', () => {
    expect(filterCollection(sampleItems, { activeTab: 'all' })).toHaveLength(2);
  });

  it('タブでカテゴリを絞り込める', () => {
    expect(matchesTab(sampleItems[0], 'play')).toBe(true);
    expect(matchesTab(sampleItems[1], 'play')).toBe(false);
  });

  it('タイトル以外の tags と keywords でも検索できる', () => {
    expect(matchesQuery(sampleItems[0], 'キーボード')).toBe(true);
    expect(matchesQuery(sampleItems[1], '自由研究')).toBe(true);
  });

  it('検索とタブを組み合わせて件数を数えられる', () => {
    const playResults = filterCollection(sampleItems, { activeTab: 'play', query: 'タイピング' });
    const learnResults = filterCollection(sampleItems, { activeTab: 'learn', query: '理科' });

    expect(countMatches(playResults, learnResults)).toBe(2);
  });
});
