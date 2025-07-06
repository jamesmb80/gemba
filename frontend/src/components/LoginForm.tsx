import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LoadingSpinner } from './ui/LoadingSpinner';

const LoginForm: React.FC<{ onLoginSuccess?: () => void }> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setEmail('');
      setPassword('');
      if (onLoginSuccess) onLoginSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          autoComplete="email"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          autoComplete="current-password"
          required
        />
      </div>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      <button
        type="submit"
        className="w-full bg-blue-800 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center"
        disabled={loading}
      >
        {loading ? <LoadingSpinner size="sm" /> : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;
