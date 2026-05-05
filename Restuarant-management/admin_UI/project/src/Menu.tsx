import React, { useEffect, useMemo, useState } from 'react';
import { Dish } from './types/dish';

const getDishes = (): Dish[] => {
  return JSON.parse(localStorage.getItem('menuDishes') || '[]');
};

const getOrders = () => {
  return JSON.parse(localStorage.getItem('orders') || '[]');
};

const saveOrders = (orders: any[]) => {
  localStorage.setItem('orders', JSON.stringify(orders));
};

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const RAZORPAY_KEY_ID = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID;

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Menu: React.FC = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [table, setTable] = useState('');
  const [orderTickets, setOrderTickets] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  // Cart: { [dishId]: { dish, qty } }
  const [cart, setCart] = useState<{ [id: string]: { dish: Dish; qty: number } }>({});

  const totalAmount = useMemo(() => {
    return Object.values(cart).reduce((sum, { dish, qty }) => sum + dish.price * qty, 0);
  }, [cart]);

  useEffect(() => {
    setDishes(getDishes());
    setOrderTickets(
      getOrders().filter((o: any) => o.table === table && o.status !== 'completed')
    );
  }, [table]);

  // Poll for order status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setOrderTickets(
        getOrders().filter((o: any) => o.table === table && o.status !== 'completed')
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [table]);

  // Auto-detect table from URL (?table=) or localStorage
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('table') || localStorage.getItem('currentTable') || '';
      if (t) {
        setTable(t);
        localStorage.setItem('currentTable', t);
      }
    } catch {}
  }, []);

  const handleAddToCart = (dish: Dish) => {
    setCart(prev => {
      const next = { ...prev };
      if (!next[dish.id]) next[dish.id] = { dish, qty: 1 };
      return next;
    });
    setMessage(`${dish.name} added to cart!`);
    setTimeout(() => setMessage(''), 1200);
  };

  const handleRemoveFromCart = (dishId: string) => {
    setCart(prev => {
      const next = { ...prev };
      delete next[dishId];
      return next;
    });
  };

  const handleChangeQty = (dish: Dish, delta: number) => {
    setCart(prev => {
      const next = { ...prev };
      if (!next[dish.id] && delta > 0) {
        next[dish.id] = { dish, qty: 1 };
      } else if (next[dish.id]) {
        next[dish.id].qty += delta;
        if (next[dish.id].qty <= 0) delete next[dish.id];
      }
      return next;
    });
  };

  const placeLocalOrder = (paymentId: string) => {
    // Expand items by quantity
    const items: string[] = [];
    Object.values(cart).forEach(({ dish, qty }) => {
      for (let i = 0; i < qty; i++) items.push(dish.name);
    });
    const newOrder = {
      id: Date.now().toString(),
      table,
      items,
      status: 'pending',
      paymentId,
      createdAt: new Date().toISOString(),
    };
    const orders = getOrders();
    orders.push(newOrder);
    saveOrders(orders);
        setOrderTickets(
          orders.filter((o: any) => o.table === table && o.status !== 'completed')
        );
    setCart({});
  };

  const handleSimulatePay = () => {
    if (!table) {
      setMessage('Table not detected. Please scan QR again.');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    if (Object.keys(cart).length === 0) {
      setMessage('Cart is empty.');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    placeLocalOrder('PAYMENT_DEMO');
    setMessage('Demo payment simulated! Order placed.');
    setTimeout(() => setMessage(''), 2500);
  };

  const handlePlaceOrder = async () => {
    if (!table) {
      setMessage('Table not detected. Please scan QR again.');
      return;
    }
    if (Object.keys(cart).length === 0) {
      setMessage('Cart is empty.');
      return;
    }
    if (totalAmount < 1) {
      setMessage('Total must be at least ₹1 to pay.');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    // Basic validation for Razorpay key format (rzp_test_ or rzp_live_)
    const keyLooksValid = /^rzp_/.test(RAZORPAY_KEY_ID);
    if (!keyLooksValid) {
      // Offer to simulate if key is obviously invalid
      const proceedDemo = confirm('Razorpay key looks invalid for client-side checkout. Do you want to simulate payment instead?');
      if (proceedDemo) {
        handleSimulatePay();
        return;
      }
      // Continue anyway; may still work in some environments
    }
    // Load Razorpay
    const ok = await loadRazorpayScript();
    if (!ok || !window.Razorpay) {
      setMessage('Unable to load payment gateway.');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    const amountInPaise = Math.round(totalAmount * 100);
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: amountInPaise,
      currency: 'INR',
      name: 'Restaurant Demo',
      description: `Table ${table} order`,
      notes: { table },
      prefill: {
        name: 'Test User',
        email: 'test@example.com',
        contact: '9999999999',
      },
      theme: { color: '#ea580c' },
      handler: (response: any) => {
        // On payment success, create local order
        placeLocalOrder(response?.razorpay_payment_id || 'PAYMENT_TEST');
        setMessage('Payment successful! Order placed.');
        setTimeout(() => setMessage(''), 2500);
      },
      modal: {
        ondismiss: () => {
          setMessage('Payment cancelled. Order not placed.');
          setTimeout(() => setMessage(''), 2000);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (resp: any) {
      const err = resp?.error || {};
      const parts = [
        err.code && `Code: ${err.code}`,
        err.description && `Desc: ${err.description}`,
        err.reason && `Reason: ${err.reason}`,
        err.source && `Source: ${err.source}`,
        err.step && `Step: ${err.step}`,
      ].filter(Boolean);
      const details = parts.join(' | ');
      setMessage(details ? `Payment failed. ${details}` : 'Payment failed. Please try again.');
      setTimeout(() => setMessage(''), 2000);
    });
    rzp.open();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Menu</h1>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
        {dishes.map((dish, idx) => {
          const qty = cart[dish.id]?.qty || 0;
          return (
            <div key={dish.id} className="bg-white rounded shadow p-4 flex flex-col">
              <img src={dish.imageUrl} alt={dish.name} className="w-full h-40 object-cover rounded mb-3" />
              <h2 className="text-xl font-bold mb-1">{dish.name}</h2>
              <div className="text-gray-600 mb-2">{dish.description}</div>
              <div className="mb-2 text-sm text-gray-500">Category: {dish.category}</div>
              <div className="mb-2 text-sm text-gray-500">Price: ₹{dish.price}</div>
              <div className="mb-2 text-xs text-gray-400">{dish.isVegetarian ? 'Vegetarian' : dish.isVegan ? 'Vegan' : 'Non-Veg'}</div>
              <div className="flex items-center gap-2 mt-auto">
                {qty === 0 ? (
                  <button
                    className="bg-orange-600 text-white py-1 px-6 rounded hover:bg-orange-700 transition"
                    onClick={() => handleAddToCart(dish)}
                  >
                    Add
                  </button>
                ) : (
                  <>
                    <button
                      className="bg-gray-200 px-2 py-1 rounded text-lg font-bold"
                      onClick={() => handleChangeQty(dish, -1)}
                    >-</button>
                    <span className="w-6 text-center">{qty}</span>
                    <button
                      className="bg-gray-200 px-2 py-1 rounded text-lg font-bold"
                      onClick={() => handleChangeQty(dish, 1)}
                    >+</button>
                  </>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-2">#{idx + 1}</div>
            </div>
          );
        })}
      </div>

      {/* Cart Section */}
      <div className="max-w-2xl mx-auto bg-white rounded shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Cart</h2>
        <div className="mb-4 text-sm text-gray-700">Table: <span className="font-semibold">{table || 'Unknown'}</span></div>
        {Object.keys(cart).length === 0 && <div className="text-gray-500">Cart is empty.</div>}
        <ul className="mb-4">
          {Object.values(cart).map(({ dish, qty }) => (
            <li key={dish.id} className="flex justify-between items-center border-b py-2 last:border-0">
              <span>{dish.name} <span className="text-xs text-gray-500">x{qty}</span></span>
              <div className="flex items-center gap-2">
                <button
                  className="bg-gray-200 px-2 py-1 rounded text-lg font-bold"
                  onClick={() => handleChangeQty(dish, -1)}
                  disabled={qty === 1}
                >-</button>
                <span className="w-6 text-center">{qty}</span>
                <button
                  className="bg-gray-200 px-2 py-1 rounded text-lg font-bold"
                  onClick={() => handleChangeQty(dish, 1)}
                >+</button>
                <button
                  className="text-red-500 hover:underline text-xs ml-2"
                  onClick={() => handleRemoveFromCart(dish.id)}
                >Remove</button>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">Total: ₹{totalAmount.toFixed(2)}</div>
          <span className="text-xs text-gray-500">Test mode payment via Razorpay</span>
        </div>
        <button
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          onClick={handlePlaceOrder}
        >
          Pay & Place Order
        </button>
        <button
          className="w-full mt-2 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition text-sm"
          onClick={handleSimulatePay}
        >
          Simulate Payment (Demo)
        </button>
      </div>
      <div className="max-w-2xl mx-auto bg-white rounded shadow p-6 mt-8">
        <h2 className="text-xl font-bold mb-4">Your Orders</h2>
        {orderTickets.length === 0 && <div className="text-gray-500">No orders yet.</div>}
        <div className="space-y-4">
          {orderTickets.map(order => (
            <div key={order.id} className="border rounded p-4 flex flex-col gap-2 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="font-semibold">Order #{order.id}</div>
                <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-sm">Payment ID: <span className="font-mono">{order.paymentId}</span></div>
              <div className="text-sm">Dishes: {order.items.join(', ')}</div>
              <div className="text-sm">Status: <span className={
                order.status === 'pending' ? 'text-yellow-600' :
                order.status === 'accepted' ? 'text-blue-600' :
                order.status === 'completed' ? 'text-green-600' : ''
              }>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></div>
            </div>
          ))}
        </div>
        {message && <div className="mt-4 text-green-600 text-center">{message}</div>}
      </div>
    </div>
  );
};

export default Menu;