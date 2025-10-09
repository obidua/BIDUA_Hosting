import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Server, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-white mb-6">
            <Server className="h-10 w-10 text-cyan-400" />
            <span className="text-2xl font-bold">BIDUA Hosting</span>
          </Link>
          <div className="flex items-center justify-center mb-4">
            <ShieldCheck className="h-12 w-12 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Admin Portal</h2>
          <p className="text-cyan-200">Secure administrative access</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl shadow-2xl p-8 border border-cyan-500/30">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400"
                placeholder="admin@biduahosting.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-teal-400 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/50"
            >
              {loading ? 'Signing in...' : 'Admin Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Regular user?{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                User Login
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-cyan-500/20">
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
              <p className="text-xs font-semibold text-cyan-300 mb-3 flex items-center">
                <ShieldCheck className="h-4 w-4 mr-2" />
                Demo Admin Credentials
              </p>
              <div className="space-y-2">
                <div className="bg-slate-800/50 rounded px-3 py-2">
                  <p className="text-xs text-slate-400 mb-1">Email</p>
                  <p className="text-sm text-white font-mono">admin@biduahosting.com</p>
                </div>
                <div className="bg-slate-800/50 rounded px-3 py-2">
                  <p className="text-xs text-slate-400 mb-1">Password</p>
                  <p className="text-sm text-white font-mono">admin123</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Note: Create this admin account first through the signup process, then update the role to 'admin' in the database.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-cyan-500/20">
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <p className="text-xs font-semibold text-orange-300 mb-2">Security Notice</p>
              <p className="text-xs text-slate-400">
                This is a secure admin portal. All login attempts are monitored and logged. Unauthorized access attempts will be reported.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
