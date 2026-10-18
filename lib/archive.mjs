export function mergeArchive(snapshot, stored) {
  const records = new Map(snapshot.map((item) => [item.id, item]));
  for (const item of stored)
    records.set(item.id, { ...records.get(item.id), ...item });
  return [...records.values()].sort((a, b) => b.date.localeCompare(a.date));
}

// Keep completed learning records, but show an active repository in Projects.
export function archiveRecords(items, projects) {
  const activeRepos = new Set(projects.map(p => p.source).filter(url => url?.startsWith('https://github.com/')));
  return items.filter(item => item.source !== 'GitHub' || !activeRepos.has(item.url));
}
