function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase();
}

function tokenize(values = []) {
  return values
    .flatMap(value => String(value ?? '').split(/\s+/))
    .map(token => normalizeText(token))
    .filter(Boolean);
}

function buildSearchSpace(item) {
  return tokenize([
    item.title,
    item.description,
    item.category,
    ...(item.tags ?? []),
    ...(item.keywords ?? []),
  ]);
}

function collectHistoryTokens(history = []) {
  return history.reduce((tokens, entry) => {
    tokenize([entry.query, entry.category, entry.route]).forEach(token => tokens.push(token));
    return tokens;
  }, []);
}

function scoreByHistory(item, historyTokens) {
  const haystack = buildSearchSpace(item);
  return historyTokens.reduce((score, token) => {
    return haystack.includes(token) ? score + 3 : score;
  }, 0);
}

function scoreByRecords(item, records = []) {
  return records.reduce((score, record) => {
    const recordMode = record.siteMode ?? record.mode;
    if (item.gameId && record.gameId === item.gameId) {
      return score + 6;
    }

    if (recordMode && recordMode === item.category) {
      return score + 2;
    }

    return score;
  }, 0);
}

function scoreByProfile(item, profile) {
  if (!profile) {
    return 0;
  }

  let score = 0;
  if (profile.recommendedFeatureIds?.includes(item.id)) {
    score += 8;
  }

  if (profile.preferredCategories?.includes(item.category)) {
    score += 4;
  }

  const haystack = buildSearchSpace(item);
  for (const keyword of profile.boostKeywords ?? []) {
    if (haystack.includes(normalizeText(keyword))) {
      score += 2;
    }
  }

  return score;
}

function scoreByMode(item, mode) {
  if (mode === 'kids' && item.kind === 'safety') {
    return 5;
  }

  if (mode === 'teens' && ['news', 'music', 'career'].includes(item.category)) {
    return 2;
  }

  return 0;
}

function buildScoreMap({ history = [], records = [], profile = null, mode, defaults = [] }) {
  const historyTokens = collectHistoryTokens(history);
  const scoreMap = new Map();

  defaults.forEach(item => {
    const score = (item.baseScore ?? 0)
      + scoreByHistory(item, historyTokens)
      + scoreByRecords(item, records)
      + scoreByProfile(item, profile)
      + scoreByMode(item, mode);

    scoreMap.set(item.id, score);
  });

  return scoreMap;
}

export function buildRecommendationIds({ history = [], records = [], profile = null, mode, defaults = [] }) {
  const scoreMap = buildScoreMap({ history, records, profile, mode, defaults });

  return defaults
    .slice()
    .sort((left, right) => {
      const scoreDiff = (scoreMap.get(right.id) ?? 0) - (scoreMap.get(left.id) ?? 0);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return left.title.localeCompare(right.title, 'ja');
    })
    .map(item => item.id);
}

export function buildFeaturedOrder({ history = [], records = [], profile = null, mode, defaults = [] }) {
  const scoreMap = buildScoreMap({ history, records, profile, mode, defaults });

  return defaults
    .map(item => ({ ...item, score: scoreMap.get(item.id) ?? 0 }))
    .sort((left, right) => {
      const scoreDiff = right.score - left.score;
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return left.title.localeCompare(right.title, 'ja');
    });
}
