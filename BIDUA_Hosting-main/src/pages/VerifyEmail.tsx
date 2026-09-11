import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Server, CheckCircle, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import api from '../lib/api';

export function VerifyEmail() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-verified'>('loading');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState<string | null>(null);

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link');
                return;
            }

            try {
                const response = await api.get<{ success: boolean; message: string; email?: string }>(
                    `/api/v1/auth/verify-email/${token}`
                );

                if (response.success) {
                    if (response.message === 'Email already verified') {
                        setStatus('already-verified');
                    } else {
                        setStatus('success');
                    }
                    setMessage(response.message);
                    setEmail(response.email || null);
                } else {
                    setStatus('error');
                    setMessage(response.message || 'Verification failed');
                }
            } catch (error: any) {
                setStatus('error');
                const errorMessage = error?.response?.data?.detail || error?.message || 'Verification failed. The link may be expired or invalid.';
                setMessage(errorMessage);
            }
        };

        verifyEmail();
    }, [token]);

    const handleContinue = () => {
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
                    {/* Loading State */}
                    {status === 'loading' && (
                        <div className="text-center py-8">
                            <Loader2 className="h-16 w-16 text-cyan-400 animate-spin mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-2">Verifying your email...</h2>
                            <p className="text-cyan-200">Please wait while we verify your email address.</p>
                        </div>
                    )}

                    {/* Success State */}
                    {status === 'success' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 rounded-full bg-green-500/20 mx-auto mb-6 flex items-center justify-center">
                                <CheckCircle className="h-12 w-12 text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Email Verified! 🎉</h2>
                            <p className="text-cyan-200 mb-2">{message}</p>
                            {email && (
                                <p className="text-sm text-slate-400 mb-6">
                                    <Mail className="inline h-4 w-4 mr-1" /> {email}
                                </p>
                            )}
                            <p className="text-slate-300 mb-6">
                                Your account is now fully activated. You can now log in and access all features.
                            </p>
                            <button
                                onClick={handleContinue}
                                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-teal-400 transition shadow-lg shadow-cyan-500/50 flex items-center justify-center space-x-2"
                            >
                                <span>Continue to Login</span>
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        </div>
                    )}

                    {/* Already Verified State */}
                    {status === 'already-verified' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 rounded-full bg-blue-500/20 mx-auto mb-6 flex items-center justify-center">
                                <CheckCircle className="h-12 w-12 text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Already Verified</h2>
                            <p className="text-cyan-200 mb-6">{message}</p>
                            <p className="text-slate-300 mb-6">
                                Your email was already verified. You can log in to your account.
                            </p>
                            <button
                                onClick={handleContinue}
                                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-teal-400 transition shadow-lg shadow-cyan-500/50 flex items-center justify-center space-x-2"
                            >
                                <span>Go to Login</span>
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        </div>
                    )}

                    {/* Error State */}
                    {status === 'error' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 rounded-full bg-red-500/20 mx-auto mb-6 flex items-center justify-center">
                                <XCircle className="h-12 w-12 text-red-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
                            <p className="text-red-300 mb-6">{message}</p>
                            <div className="space-y-3">
                                <Link
                                    to="/verification-pending"
                                    className="block w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-teal-400 transition text-center shadow-lg shadow-cyan-500/50"
                                >
                                    Request New Verification Link
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
