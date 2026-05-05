export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export async function fetchTables() {
  const res = await fetch(`${API_BASE}/api/tables`);
  if (!res.ok) throw new Error('Failed to fetch tables');
  return res.json();
}

export async function addTable(tableNumber: number) {
  const res = await fetch(`${API_BASE}/api/tables`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table_number: tableNumber }),
  });
  if (!res.ok) throw new Error('Failed to add table');
  return res.json();
}

export function qrImageUrl(tableNumber: number) {
  return `${API_BASE}/api/generate-qr/${tableNumber}`;
}
