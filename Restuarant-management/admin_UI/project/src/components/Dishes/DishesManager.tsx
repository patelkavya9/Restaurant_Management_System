import React, { useState, useEffect } from 'react';
import { Plus, Grid, List } from 'lucide-react';
import { Dish, DishFormData } from '../../types/dish';
import DishCard from './DishCard';
import DishForm from './DishForm';

const DishesManager: React.FC = () => {
  const defaultDishes: Dish[] = [
    {
      id: '1',
      name: 'Grilled Salmon',
      description: 'Fresh Atlantic salmon grilled to perfection with lemon herbs and seasonal vegetables',
      price: 24.99,
      category: 'Main Courses',
      imageUrl: 'https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg?auto=compress&cs=tinysrgb&w=400',
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: true,
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'Margherita Pizza',
      description: 'Classic Italian pizza with fresh mozzarella, tomatoes, and basil on our homemade dough',
      price: 18.50,
      category: 'Pizza',
      imageUrl: 'https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=400',
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      createdAt: new Date(),
    },
    {
      id: '3',
      name: 'Quinoa Buddha Bowl',
      description: 'Nutritious bowl with quinoa, roasted vegetables, avocado, and tahini dressing',
      price: 16.99,
      category: 'Salads',
      imageUrl: 'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=400',
      isAvailable: true,
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      createdAt: new Date(),
    },
    {
      id: '4',
      name: 'Paneer Tikka',
      description: 'Indian cottage cheese marinated and grilled with spices',
      price: 14.99,
      category: 'Starters',
      imageUrl: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?auto=compress&cs=tinysrgb&w=400',
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: true,
      createdAt: new Date(),
    },
    {
      id: '5',
      name: 'Chicken Biryani',
      description: 'Aromatic basmati rice cooked with chicken and spices',
      price: 19.99,
      category: 'Main Courses',
      imageUrl: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?auto=compress&cs=tinysrgb&w=400',
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      createdAt: new Date(),
    },
  ];

  // On first load, if no dishes in localStorage, use defaultDishes
  const [dishes, setDishes] = useState<Dish[]>(() => {
    const stored = localStorage.getItem('menuDishes');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('menuDishes', JSON.stringify(defaultDishes));
    return defaultDishes;
  });

  // Sync dishes to menuDishes in localStorage for Menu UI
  useEffect(() => {
    localStorage.setItem('menuDishes', JSON.stringify(dishes));
  }, [dishes]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = ['All', ...Array.from(new Set(dishes.map(dish => dish.category)))];

  const filteredDishes = filterCategory === 'All' 
    ? dishes 
    : dishes.filter(dish => dish.category === filterCategory);

  const handleAddDish = (formData: DishFormData) => {
    const newDish: Dish = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      imageUrl: formData.imageUrl || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      isAvailable: formData.isAvailable,
      isVegetarian: formData.isVegetarian,
      isVegan: formData.isVegan,
      isGlutenFree: formData.isGlutenFree,
      createdAt: new Date(),
    };
    setDishes(prev => [newDish, ...prev]);
  };

  const handleEditDish = (formData: DishFormData) => {
    if (!editingDish) return;
    
    setDishes(prev => prev.map(dish => 
      dish.id === editingDish.id 
        ? {
            ...dish,
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            category: formData.category,
            imageUrl: formData.imageUrl || dish.imageUrl,
            isAvailable: formData.isAvailable,
            isVegetarian: formData.isVegetarian,
            isVegan: formData.isVegan,
            isGlutenFree: formData.isGlutenFree,
          }
        : dish
    ));
    setEditingDish(null);
  };

  const handleDeleteDish = (dishId: string) => {
    if (window.confirm('Are you sure you want to delete this dish?')) {
      setDishes(prev => prev.filter(dish => dish.id !== dishId));
    }
  };

  const handleToggleAvailability = (dishId: string) => {
    setDishes(prev => prev.map(dish =>
      dish.id === dishId ? { ...dish, isAvailable: !dish.isAvailable } : dish
    ));
  };

  const openEditForm = (dish: Dish) => {
    setEditingDish(dish);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingDish(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dish Management</h1>
          <p className="text-gray-600">Manage your restaurant's menu items</p>
        </div>
        
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2 shadow-sm"
        >
          <Plus className="h-5 w-5" />
          <span>Add Item</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-orange-100 text-orange-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-orange-100 text-orange-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map(dish => (
            <DishCard
              key={dish.id}
              dish={dish}
              onEdit={openEditForm}
              onDelete={handleDeleteDish}
              onToggleAvailability={handleToggleAvailability}
            />
          ))}
        </div>

        {filteredDishes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No dishes found in this category</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
            >
              Add your first dish
            </button>
          </div>
        )}
      </div>

      <DishForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editingDish ? handleEditDish : handleAddDish}
        dish={editingDish}
      />
    </div>
  );
};

export default DishesManager;