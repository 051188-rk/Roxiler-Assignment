export default function SortableTh({ field, label, sortBy, sortOrder, onSort }) {
  const active = sortBy === field;
  const nextOrder = active && sortOrder === 'asc' ? 'desc' : 'asc';
  return (
    <th style={{ cursor:'pointer' }} onClick={() => onSort(field, nextOrder)}>
      {label} {active ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
    </th>
  );
}
