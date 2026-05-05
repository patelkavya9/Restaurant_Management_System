import React from 'react';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Dish } from '../../types/dish';

interface DishCardProps {
  dish: Dish;
  onEdit: (dish: Dish) => void;
  onDelete: (dishId: string) => void;
  onToggleAvailability: (dishId: string) => void;
}

const DishCard: React.FC<DishCardProps> = ({ dish, onEdit, onDelete, onToggleAvailability }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={dish.imageUrl}
          alt={dish.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            dish.isAvailable 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {dish.isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{dish.name}</h3>
          <span className="text-lg font-bold text-orange-600">${dish.price.toFixed(2)}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{dish.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            {dish.category}
          </span>
          
          <div className="flex space-x-1">
            {dish.isVegetarian && <span className="w-2 h-2 bg-green-500 rounded-full" title="Vegetarian"></span>}
            {dish.isVegan && <span className="w-2 h-2 bg-green-600 rounded-full" title="Vegan"></span>}
            {dish.isGlutenFree && <span className="w-2 h-2 bg-blue-500 rounded-full" title="Gluten Free"></span>}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(dish)}
            className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </button>
          
          <button
            onClick={() => onToggleAvailability(dish.id)}
            className="bg-gray-50 text-gray-600 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {dish.isAvailable ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          
          <button
            onClick={() => onDelete(dish.id)}
            className="bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DishCard;