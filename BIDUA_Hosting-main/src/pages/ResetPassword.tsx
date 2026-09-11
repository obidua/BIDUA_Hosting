import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Server, CheckCircle, XCircle, Loader2, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import api from '../lib/api';

export function ResetPassword() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [tokenMessage, setTokenMessage] = useState('');
    const [email, setEmail] = useState<string | null>(null);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setValidating(false);
                setTokenValid(false);
                setTokenMessage('Invalid reset link');
                return;
            }

            try {
                const response = await api.get<{ valid: boolean; message: string; email?: string }>(
                    `/api/v1/auth/verify-reset-token/${token}`
                );

                setTokenValid(response.valid);
                setTokenMessage(response.message);
                setEmail(response.email || null);
            } catch (error: any) {
                setTokenValid(false);
                setTokenMessage(error?.response?.data?.detail || 'Invalid or expired reset link');
            } finally {
                setValidating(false);
            }
        };

        verifyToken();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setStatus('loading');

        try {
            await api.post<{ success: boolean; message: string }>(
                '/api/v1/auth/reset-password',
                {
                    token,
                    new_password: newPassword
                }
            );

            setStatus('success');
        } catch (error: any) {
            setStatus('error');
            setError(error?.response?.data?.detail || error?.message || 'Failed to reset password');
        }
    };

    const handleGoToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-950 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center space-x-2 text-white mb-6">
                        <Server className="h-10 w-10 text-cyan-400 animate-serverPulse" />
                        <span className="text-2xl font-bold">BIDUA Hosting</span>
                    </Link>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl shadow-2xl p-8 border border-cyan-500/30">
                    {/* Validating State */}
                    {validating && (
                        <div className="text-center py-8">
                            <Loader2 className="h-16 w-16 text-cyan-400 animate-spin mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-2">Verifying reset link...</h2>
                            <p className="text-cyan-200">Please wait</p>
                        </div>
                    )}

                    {/* Invalid Token State */}
                    {!validating && !tokenValid && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 rounded-full bg-red-500/20 mx-auto mb-6 flex items-center justify-center">
                                <XCircle className="h-12 w-12 text-red-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Invalid Reset Link</h2>
                            <p className="text-red-300 mb-6">{tokenMessage}</p>
                            <div className="space-y-3">
                                <Link
                                    to="/forgot-password"
                                    className="block w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-teal-400 transition text-center shadow-lg shadow-cyan-500/50"
                                >
                                    Request New Reset Link
                                </Link>
                                <Link
                                    to="/login"
                                    className="block w-full px-6 py-3 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 transition text-center border border-cyan-500/30"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Success State */}
                    {!validating && status === 'success' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 rounded-full bg-green-500/20 mx-auto mb-6 flex items-center justify-center">
                                <CheckCircle className="h-12 w-12 text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Password Reset Successfully! 🎉</h2>
                            <p className="text-green-300 mb-2">Your password has been changed.</p>
                            <p className="text-slate-300 mb-6">You can now log in with your new password.</p>
                            <button
                                onClick={handleGoToLogin}
                                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-teal-400 transition shadow-lg shadow-cyan-500/50 flex items-center justify-center space-x-2"
                            >
                                <span>Go to Login</span>
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        </div>
                    )}

                    {/* Reset Form State */}
                    {!validating && tokenValid && status !== 'success' && (
                        <>
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-orange-500/20 mx-auto mb-4 flex items-center justify-center">
                                    <Lock className="h-8 w-8 text-orange-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Reset Your Password</h2>
                                {email && (
                                    <p className="text-cyan-200 text-sm">
                                        for {email}
                                    </p>
                                )}
                            </div>

                            {error && (
                                <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 pr-12 bg-slate-800 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400"
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 pr-12 bg-slate-800 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400"
                                            placeholder="Confirm new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'loading' || !newPassword || !confirmPassword}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-teal-400 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/50 flex items-center justify-center space-x-2"
                                >
                                    {status === 'loading' ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Resetting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="h-5 w-5" />
                                            <span>Reset Password</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                {/* Help Text */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-400">
                        Need help?{' '}
                        <Link to="/contact" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                            Contact Support
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
