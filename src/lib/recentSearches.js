function searchKey(entry) {
  return `${entry.name}|${entry.country}`.toLowerCase();
}
export function addSearch(list, entry, max = 5) {
  const withoutDuplicate = list.filter(
    (existing) => searchKey(existing) !== searchKey(entry),
  );
  return [entry, ...withoutDuplicate].slice(0, max);
}
