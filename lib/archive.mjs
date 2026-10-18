export function mergeArchive(snapshot, stored) {
  const records = new Map(snapshot.map((item) => [item.id, item]));
  for (const item of stored)
    records.set(item.id, { ...records.get(item.id), ...item });
  return [...records.values()].sort((a, b) => b.date.localeCompare(a.date));
}
