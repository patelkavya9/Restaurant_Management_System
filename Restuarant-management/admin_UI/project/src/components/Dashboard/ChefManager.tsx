import React, { useState } from 'react';
import { Chef } from '../../types/chef';

const getChefs = (): Chef[] => {
  return JSON.parse(localStorage.getItem('chefs') || '[]');
};

const saveChefs = (chefs: Chef[]) => {
  localStorage.setItem('chefs', JSON.stringify(chefs));
};

const ChefManager: React.FC = () => {
  const [chefs, setChefs] = useState<Chef[]>(getChefs());
  const [form, setForm] = useState({ chefId: '', name: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddChef = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.chefId || !form.name || !form.password) {
      setError('All fields are required');
      return;
    }
    if (chefs.some(c => c.chefId === form.chefId)) {
      setError('Chef ID already exists');
      return;
    }
    const newChef: Chef = { ...form };
    const updatedChefs = [...chefs, newChef];
    setChefs(updatedChefs);
    saveChefs(updatedChefs);
    setForm({ chefId: '', name: '', password: '' });
    setError('');
  };

  const handleDeleteChef = (chefId: string) => {
    if (window.confirm('Delete this chef?')) {
      const updatedChefs = chefs.filter(c => c.chefId !== chefId);
      setChefs(updatedChefs);
      saveChefs(updatedChefs);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Chef Management</h2>
      <form onSubmit={handleAddChef} className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          name="chefId"
          placeholder="Chef ID"
          value={form.chefId}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
        />
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Chef</button>
      </form>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="py-2">Chef ID</th>
            <th className="py-2">Name</th>
            <th className="py-2">Password</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {chefs.map(chef => (
            <tr key={chef.chefId}>
              <td className="py-2">{chef.chefId}</td>
              <td className="py-2">{chef.name}</td>
              <td className="py-2">{chef.password}</td>
              <td className="py-2">
                <button
                  onClick={() => handleDeleteChef(chef.chefId)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChefManager;
