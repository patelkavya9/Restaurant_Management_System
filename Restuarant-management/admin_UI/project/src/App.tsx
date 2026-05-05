import { useState } from 'react';
import SignIn from './components/SignIn';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import DishesManager from './components/Dishes/DishesManager';
import ChefManager from './components/Dashboard/ChefManager';
import TablesManager from './components/Tables/TablesManager';


function App() {
  const [activeTab, setActiveTab] = useState('dishes');
  const [signedIn, setSignedIn] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'dishes':
        return <DishesManager />;
      case 'tables':
        return <TablesManager />;
      case 'orders':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Orders Management</h2>
            <p className="text-gray-600">Orders management functionality coming soon...</p>
          </div>
        );
      case 'chefs':
        return <ChefManager />;
      case 'customers':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Management</h2>
            <p className="text-gray-600">Customer management functionality coming soon...</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h2>
            <p className="text-gray-600">Analytics dashboard coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">Settings panel coming soon...</p>
          </div>
        );
      default:
        return <DishesManager />;
    }
  };

  if (!signedIn) {
    return <SignIn onSignIn={() => setSignedIn(true)} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;