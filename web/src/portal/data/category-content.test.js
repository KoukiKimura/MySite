import { describe, expect, it } from 'vitest';
import { CATEGORY_MASTER, getCategoryContent, isValidCategory } from './category-content.js';

describe('CATEGORY_MASTER', () => {
  it('kids と teens のカテゴリが定義されている', () => {
    expect(CATEGORY_MASTER.kids.map(item => item.id)).toEqual(
      expect.arrayContaining(['games', 'learn', 'animals', 'sports', 'music', 'drawing']),
    );
    expect(CATEGORY_MASTER.teens.map(item => item.id)).toEqual(
      expect.arrayContaining(['news', 'study', 'music', 'after-school', 'career']),
    );
  });

  it('カテゴリ詳細が取得でき、未定義カテゴリは false になる', () => {
    expect(getCategoryContent('kids', 'games')).toEqual(expect.objectContaining({ title: 'ゲーム' }));
    expect(isValidCategory('teens', 'news')).toBe(true);
    expect(isValidCategory('kids', 'invalid')).toBe(false);
  });
});
