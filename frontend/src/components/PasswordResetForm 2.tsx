import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LoadingSpinner } from './ui/LoadingSpinner';

const PasswordResetForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Password reset email sent! Please check your inbox.');
      setEmail('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Reset Password</h2>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
      </div>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      {success && <div className="mb-2 text-green-600">{success}</div>}
      <button
        type="submit"
        className="w-full bg-blue-800 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center"
        disabled={loading}
      >
        {loading ? <LoadingSpinner size="sm" /> : 'Send Reset Email'}
      </button>
    </form>
  );
};

export default PasswordResetForm; 