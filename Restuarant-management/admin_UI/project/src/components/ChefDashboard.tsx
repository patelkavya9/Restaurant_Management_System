
import React, { useEffect, useState } from 'react';

interface Order {
  id: string;
  table: string;
  items: string[];
  status: 'pending' | 'accepted' | 'completed';
  paymentId?: string;
  createdAt?: string;
}

interface ChefDashboardProps {
  chefId: string;
}

const ChefDashboard: React.FC<ChefDashboardProps> = ({ chefId }) => {

  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [acceptedOrders, setAcceptedOrders] = useState<Order[]>([]);

  // Poll for orders
  useEffect(() => {
    const poll = setInterval(() => {
      const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      setPendingOrders(storedOrders.filter((o: Order) => o.status === 'pending'));
      setAcceptedOrders(storedOrders.filter((o: Order) => o.status === 'accepted'));
    }, 1500);
    return () => clearInterval(poll);
  }, []);

  const acceptOrder = (order: Order) => {
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const updatedOrders = storedOrders.map((o: Order) =>
      o.id === order.id ? { ...o, status: 'accepted' } : o
    );
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    setPendingOrders(pendingOrders.filter(o => o.id !== order.id));
    setAcceptedOrders([...acceptedOrders, { ...order, status: 'accepted' }]);
  };

  const completeOrder = (order: Order) => {
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const updatedOrders = storedOrders.map((o: Order) =>
      o.id === order.id ? { ...o, status: 'completed' } : o
    );
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    setAcceptedOrders(acceptedOrders.filter(o => o.id !== order.id));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Chef Dashboard</h1>
        <div className="bg-white rounded-xl shadow p-6 mb-10 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2">Welcome, Chef <span className="text-orange-600">{chefId}</span></h2>
          <p className="text-gray-500">Manage and complete orders as they come in.</p>
        </div>

        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-4">Accepted Orders</h3>
          {acceptedOrders.length === 0 && <div className="text-gray-500 mb-8">No accepted orders.</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {acceptedOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow border border-gray-200 p-5 flex flex-col gap-2">
                <div className="font-semibold text-lg text-orange-700">Table #{order.table}</div>
                <div className="text-xs text-gray-500">Order ID: {order.id}</div>
                <div className="text-sm">Dishes: <span className="font-medium">{order.items.join(', ')}</span></div>
                <div className="text-xs text-gray-400">{order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</div>
                <button
                  className="mt-2 bg-orange-600 text-white py-1 rounded hover:bg-orange-700 transition"
                  onClick={() => completeOrder(order)}
                >
                  Mark as Completed
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Static bar for upcoming orders */}
      <div className="fixed left-0 bottom-0 z-40 w-full max-w-md bg-white border-t border-orange-300 shadow-lg rounded-tr-xl p-4 flex flex-col gap-2 m-4">
        <div className="font-bold text-orange-700 mb-2">Upcoming Orders</div>
        {pendingOrders.length === 0 && <div className="text-gray-400 text-sm">No upcoming orders.</div>}
        {pendingOrders.map(order => (
          <div key={order.id} className="flex flex-col gap-1 mb-2 border-b pb-2 last:border-0 last:pb-0">
            <div className="text-sm font-semibold">Table #{order.table}</div>
            <div className="text-xs text-gray-500">Order ID: {order.id}</div>
            <div className="text-xs">Dishes: {order.items.join(', ')}</div>
            <button
              className="mt-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition self-start"
              onClick={() => acceptOrder(order)}
            >
              Accept
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChefDashboard;
