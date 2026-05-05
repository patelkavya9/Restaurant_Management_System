import React, { useEffect, useMemo, useState } from 'react';
import { Plus, QrCode } from 'lucide-react';
import { addTable, fetchTables, qrImageUrl } from '../../lib/api';

interface TableInfo {
  table_number: number;
  qr_generated: boolean;
  status: 'available' | 'occupied' | 'reserved';
}

const TablesManager: React.FC = () => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableNumber, setTableNumber] = useState<string>('');
  const [error, setError] = useState<string>('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchTables();
      setTables(data.tables || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onAdd = async () => {
    const n = parseInt(tableNumber, 10);
    if (!n || n <= 0) {
      setError('Please enter a valid positive table number');
      return;
    }
    try {
      setLoading(true);
      await addTable(n);
      await load();
      setTableNumber('');
    } catch (e: any) {
      setError(e.message || 'Failed to add table');
    } finally {
      setLoading(false);
    }
  };

  const sortedTables = useMemo(() => tables.slice().sort((a, b) => a.table_number - b.table_number), [tables]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Tables</h2>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Add Table Number</label>
            <input
              type="number"
              min={1}
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g. 21"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <button
            onClick={onAdd}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-medium px-4 py-2 rounded-lg disabled:opacity-60"
          >
            <Plus className="w-4 h-4" /> Add Table
          </button>
        </div>
        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-4">QR Codes</h3>
        {loading && <div className="text-gray-600">Loading...</div>}
        {!loading && sortedTables.length === 0 && (
          <div className="text-gray-600">No tables yet. Add one above.</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedTables.map((t) => (
            <div key={t.table_number} className="border rounded-lg p-4 flex flex-col items-center bg-gray-50">
              <div className="font-semibold mb-2">Table #{t.table_number}</div>
              <div className="text-xs text-gray-500 mb-3">Status: {t.status}</div>
              <div className="w-40 h-40 bg-white border rounded flex items-center justify-center overflow-hidden">
                {t.qr_generated ? (
                  <img
                    alt={`QR for table ${t.table_number}`}
                    src={qrImageUrl(t.table_number)}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <QrCode className="w-10 h-10" />
                    <span className="text-xs mt-1">QR Not Generated</span>
                  </div>
                )}
              </div>
              <a
                href={qrImageUrl(t.table_number)}
                target="_blank"
                rel="noreferrer"
                className="mt-3 text-xs text-orange-700 hover:underline"
              >
                Open QR in new tab
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TablesManager;
