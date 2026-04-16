import { describe, expect, it } from 'vitest';
import { buildFeaturedOrder, buildRecommendationIds } from './recommendation-service.js';

const defaults = [
  {
    id: 'typing',
    title: 'タイピング',
    description: 'ローマ字で遊ぶ',
    category: 'games',
    gameId: 'typing',
    baseScore: 5,
    tags: ['タイピング'],
    keywords: ['ローマ字'],
  },
  {
    id: 'guide',
    title: 'ガイド',
    description: '安全に使う',
    category: 'support',
    kind: 'safety',
    baseScore: 1,
    tags: ['安全'],
    keywords: ['ガイド'],
  },
  {
    id: 'news',
    title: 'ニュース',
    description: '話題を見る',
    category: 'news',
    baseScore: 3,
    tags: ['話題'],
    keywords: ['ニュース'],
  },
];

describe('recommendation-service', () => {
  it('履歴や記録がないときは基本スコア順で返す', () => {
    expect(buildRecommendationIds({ mode: 'kids', defaults })).toEqual(['guide', 'typing', 'news']);
  });

  it('履歴と記録があると関連するカードを優先する', () => {
    const recommendationIds = buildRecommendationIds({
      mode: 'teens',
      defaults,
      history: [{ query: 'ニュース', route: '/teens/news', category: 'news' }],
      records: [{ gameId: 'typing', siteMode: 'teens', score: 9000 }],
      profile: {
        recommendedFeatureIds: ['news'],
        preferredCategories: ['news'],
        boostKeywords: ['ニュース'],
      },
    });

    expect(recommendationIds[0]).toBe('news');
    expect(recommendationIds).toContain('typing');
  });

  it('buildFeaturedOrder が score を付けて降順に並べる', () => {
    const ordered = buildFeaturedOrder({
      mode: 'kids',
      defaults,
      history: [{ query: 'ローマ字', route: '/kids/games', category: 'games' }],
    });

    expect(ordered[0]).toEqual(expect.objectContaining({ id: 'typing' }));
    expect(ordered[0].score).toBeGreaterThanOrEqual(ordered[1].score);
  });
});
