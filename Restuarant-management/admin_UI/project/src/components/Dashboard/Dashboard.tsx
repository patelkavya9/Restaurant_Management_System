import React from 'react';
import { DollarSign, ShoppingBag, UtensilsCrossed, Users } from 'lucide-react';
import StatsCard from './StatsCard';
import ChefManager from './ChefManager';

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$12,426',
      change: '+12.5%',
      isPositive: true,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Orders Today',
      value: '89',
      change: '+8.2%',
      isPositive: true,
      icon: ShoppingBag,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Dishes',
      value: '42',
      change: '+2.1%',
      isPositive: true,
      icon: UtensilsCrossed,
      color: 'bg-orange-500',
    },
    {
      title: 'Customers',
      value: '1,234',
      change: '+15.3%',
      isPositive: true,
      icon: Users,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening at your restaurant today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">Order #00{item}2</p>
                    <p className="text-sm text-gray-500">Table {item}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${(Math.random() * 50 + 20).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{item} min ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Dishes</h3>
          <div className="space-y-4">
            {['Grilled Salmon', 'Margherita Pizza', 'Caesar Salad', 'Beef Burger'].map((dish, index) => (
              <div key={dish} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-medium text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{dish}</p>
                    <p className="text-sm text-gray-500">{Math.floor(Math.random() * 50 + 10)} orders</p>
                  </div>
                </div>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${Math.random() * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chef Management Section */}
      <ChefManager />
    </div>
  );
};

export default Dashboard;