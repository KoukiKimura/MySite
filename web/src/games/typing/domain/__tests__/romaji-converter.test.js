import { describe, it, expect } from 'vitest';
import { decompose, getNPatterns, getTsuPatterns, buildMatchData } from '../services/romaji-converter.js';

describe('decompose', () => {
  it('基本的な分解', () => {
    expect(decompose('あいう')).toEqual(['あ', 'い', 'う']);
  });

  it('拗音を2文字チャンクにする', () => {
    expect(decompose('でんしゃ')).toEqual(['で', 'ん', 'しゃ']);
  });

  it('促音を単独チャンクにする', () => {
    expect(decompose('がっこう')).toEqual(['が', 'っ', 'こ', 'う']);
  });

  it('複合パターン', () => {
    expect(decompose('ちゅうしゃじょう')).toEqual(['ちゅ', 'う', 'しゃ', 'じょ', 'う']);
  });
});

describe('getNPatterns', () => {
  it('文末は nn のみ', () => {
    expect(getNPatterns(null)).toEqual(['nn']);
  });

  it('次が母音かな -> nn のみ', () => {
    expect(getNPatterns('あ')).toEqual(['nn']);
    expect(getNPatterns('い')).toEqual(['nn']);
  });

  it('次が な行 -> nn のみ', () => {
    expect(getNPatterns('な')).toEqual(['nn']);
    expect(getNPatterns('に')).toEqual(['nn']);
  });

  it('次が や行 -> nn のみ', () => {
    expect(getNPatterns('や')).toEqual(['nn']);
  });

  it('次が子音始まり -> n と nn の両方', () => {
    expect(getNPatterns('か')).toEqual(['n', 'nn']);
    expect(getNPatterns('さ')).toEqual(['n', 'nn']);
    expect(getNPatterns('しゃ')).toEqual(['n', 'nn']); // しゃ の先頭は し
  });
});

describe('getTsuPatterns', () => {
  it('次パターンなし -> xtu/xtsu', () => {
    expect(getTsuPatterns([])).toEqual(['xtu', 'xtsu']);
  });

  it('っか -> kka, xtuka, xtsuka', () => {
    const patterns = getTsuPatterns(['ka']);
    expect(patterns).toContain('kka');
    expect(patterns).toContain('xtuka');
    expect(patterns).toContain('xtsuka');
  });

  it('っち -> tti, cchi, xtu/xtsu バリアント', () => {
    const patterns = getTsuPatterns(['ti', 'chi']);
    expect(patterns).toContain('tti');
    expect(patterns).toContain('cchi');
    expect(patterns).toContain('xtuti');
    expect(patterns).toContain('xtsuti');
  });
});

describe('buildMatchData', () => {
  it('「でんしゃ」の照合データ', () => {
    const data = buildMatchData('でんしゃ');
    expect(data).toHaveLength(3);
    expect(data[0]).toEqual({ kana: 'で', patterns: ['de'] });
    expect(data[1].kana).toBe('ん');
    // ん の次は しゃ → 子音始まり → n と nn
    expect(data[1].patterns).toEqual(['n', 'nn']);
    expect(data[2]).toEqual({ kana: 'しゃ', patterns: ['sya', 'sha'] });
  });

  it('「がっこう」の照合データ', () => {
    const data = buildMatchData('がっこう');
    expect(data).toHaveLength(3); // が, っこ(結合), う
    expect(data[0]).toEqual({ kana: 'が', patterns: ['ga'] });
    expect(data[1].kana).toBe('っこ');
    expect(data[1].patterns).toContain('kko');
    expect(data[2]).toEqual({ kana: 'う', patterns: ['u'] });
  });

  it('文末の「ん」は nn のみ', () => {
    const data = buildMatchData('ほん');
    const nEntry = data.find((d) => d.kana === 'ん');
    expect(nEntry.patterns).toEqual(['nn']);
  });
});
