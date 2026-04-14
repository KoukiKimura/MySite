function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase();
}

function buildSearchIndex(item) {
  return [
    item.title,
    item.description,
    item.badge,
    item.category,
    ...(item.tags ?? []),
    ...(item.keywords ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function matchesTab(item, activeTab = 'all') {
  if (!activeTab || activeTab === 'all') {
    return true;
  }

  return item.category === activeTab;
}

export function matchesQuery(item, query = '') {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return true;
  }

  return buildSearchIndex(item).includes(normalizedQuery);
}

export function filterCollection(items, { query = '', activeTab = 'all' } = {}) {
  return items.filter(item => matchesTab(item, activeTab) && matchesQuery(item, query));
}

export function countMatches(...collections) {
  return collections.reduce((sum, items) => sum + items.length, 0);
}
