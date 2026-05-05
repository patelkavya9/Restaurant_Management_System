import React, { useState } from 'react';

interface ChefSignInProps {
  onSignIn: (chefId: string) => void;
}

const ChefSignIn: React.FC<ChefSignInProps> = ({ onSignIn }) => {
  const [chefId, setChefId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Get chefs from localStorage
    const chefs = JSON.parse(localStorage.getItem('chefs') || '[]');
    const chef = chefs.find((c: any) => c.chefId === chefId && c.password === password);
    if (chef) {
      setError('');
      onSignIn(chefId);
    } else {
      setError('Invalid Chef ID or Password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-6 text-center">Chef Sign In</h2>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Chef ID</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded"
            value={chefId}
            onChange={e => setChefId(e.target.value)}
            autoFocus
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Sign In
        </button>
      </form>
    </div>
  );
};

export default ChefSignIn;
