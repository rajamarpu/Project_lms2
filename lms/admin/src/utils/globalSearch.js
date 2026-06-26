export const SEARCH_CATEGORIES = ['Students', 'Teachers', 'Courses', 'Payments'];

export function groupResultsByCategory(results) {
  const grouped = Object.fromEntries(SEARCH_CATEGORIES.map((category) => [category, []]));
  for (const result of results) {
    if (grouped[result.category]) grouped[result.category].push(result);
  }
  return grouped;
}
