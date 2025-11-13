export function buildFilterAndSort({ filters = {}, sortBy, sortOrder, allowedSort = [] }) {
  const where = [];
  const values = [];
  let idx = 1;

  if (filters.name) { where.push(`LOWER(name) like LOWER('%' || $${idx++} || '%')`); values.push(filters.name); }
  if (filters.email) { where.push(`LOWER(email) like LOWER('%' || $${idx++} || '%')`); values.push(filters.email); }
  if (filters.address) { where.push(`LOWER(address) like LOWER('%' || $${idx++} || '%')`); values.push(filters.address); }
  if (filters.role) { where.push(`role = $${idx++}`); values.push(filters.role); }

  const whereSql = where.length ? `where ${where.join(' and ')}` : '';

  let orderSql = '';
  if (sortBy && allowedSort.includes(sortBy)) {
    const dir = sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';
    orderSql = `order by ${sortBy} ${dir}`;
  }
  return { whereSql, orderSql, values };
}
