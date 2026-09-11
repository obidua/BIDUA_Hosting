import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Server, Mail, ArrowLeft, CheckCircle, Loader2, Lock, Eye, EyeOff, ArrowRight, RefreshCw } from 'lucide-react';
import api from '../lib/api';

type Step = 'email' | 'otp' | 'password' | 'success';

export function ForgotPassword() {
    const navigate = useNavigate();
    
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Handle OTP input
    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) {
            // Handle paste
            const pastedValue = value.slice(0, 6);
            const newOtp = [...otp];
            for (let i = 0; i < pastedValue.length && i + index < 6; i++) {
                if (/^\d$/.test(pastedValue[i])) {
                    newOtp[index + i] = pastedValue[i];
                }
            }
            setOtp(newOtp);
            const nextIndex = Math.min(index + pastedValue.length, 5);
            otpRefs.current[nextIndex]?.focus();
        } else if (/^\d$/.test(value) || value === '') {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            
            if (value && index < 5) {
                otpRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    // Step 1: Send OTP to email
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setError('');
        setMessage('');

        try {
            await api.post<{ success: boolean; message: string }>(
                '/api/v1/auth/send-reset-otp',
                { email }
            );

            setMessage('If this email exists, a password reset OTP has been sent.');
            setStep('otp');
            startResendCooldown();
        } catch (error: any) {
            // For security, always show success message
            setMessage('If this email exists, a password reset OTP has been sent.');
            setStep('otp');
            startResendCooldown();
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join('');
        
        if (otpString.length !== 6) {
            setError('Please enter the complete 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post<{ success: boolean; message: string }>(
                '/api/v1/auth/verify-reset-otp',
                { email, otp: otpString }
            );

            setStep('password');
        } catch (error: any) {
            setError(error?.response?.data?.detail || 'Invalid OTP code');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e: React.FormEvent) => {
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

        setLoading(true);

        try {
            await api.post<{ success: boolean; message: string }>(
                '/api/v1/auth/reset-password-with-otp',
                { 
                    email, 
                    otp: otp.join(''),
                    new_password: newPassword 
                }
            );

            setStep('success');
        } catch (error: any) {
            setError(error?.response?.data?.detail || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;

        setLoading(true);
        setError('');

        try {
            await api.post('/api/v1/auth/send-reset-otp', { email });
            setMessage('A new OTP has been sent to your email.');
            setOtp(['', '', '', '', '', '']);
            startResendCooldown();
        } catch (error: any) {
            setError('Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    const startResendCooldown = () => {
        setResendCooldown(60);
        const interval = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-950 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center space-x-2 text-white mb-6">
                        <Server className="h-10 w-10 text-cyan-400 animate-serverPulse" />
                        <span className="text-2xl font-bold">BIDUA Hosting</span>
                    </Link>
                    <h2 className="text-3xl font-bold text-white mb-2">Forgot Password?</h2>
                    <p className="text-cyan-200">
                        {step === 'email' && 'Enter your email to reset your password'}
                        {step === 'otp' && 'Enter the 6-digit code sent to your email'}
                        {step === 'password' && 'Create a new password for your account'}
                        {step === 'success' && 'Your password has been reset!'}
                    </p>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl shadow-2xl p-8 border border-cyan-500/30">
                    
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {message && step === 'otp' && (
                        <div className="mb-6 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">
                            {message}
                        </div>
                    )}

                    {/* Step 1: Email Input */}
                    {step === 'email' && (
                        <>
                            <div className="mb-6">
                                <div className="w-16 h-16 rounded-full bg-orange-500/20 mx-auto mb-4 flex items-center justify-center">
                                    <Mail className="h-8 w-8 text-orange-400" />
                                </div>
                                <p className="text-slate-300 text-center text-sm">
                                    Enter your email address and we'll send you a code to reset your password
                                </p>
                            </div>

                            <form onSubmit={handleSendOtp} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-slate-800 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400"
                                        placeholder="you@example.com"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !email}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-teal-400 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/50 flex items-center justify-center space-x-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="h-5 w-5" />
                                            <span>Send Reset Code</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 'otp' && (
                        <>
                            <div className="mb-6">
                                <div className="w-16 h-16 rounded-full bg-cyan-500/20 mx-auto mb-4 flex items-center justify-center">
                                    <Lock className="h-8 w-8 text-cyan-400" />
                                </div>
                                <p className="text-slate-300 text-center text-sm">
                                    We sent a verification code to <span className="text-cyan-400 font-semibold">{email}</span>
                                </p>
                            </div>

                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-200 mb-3 text-center">
                                        Enter 6-digit Code
                                    </label>
                                    <div className="flex justify-center gap-2">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={(el) => (otpRefs.current[index] = el)}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                className="w-12 h-14 text-center text-2xl font-bold bg-slate-800 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                                            />
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || otp.join('').length !== 6}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-teal-400 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/50 flex items-center justify-center space-x-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Verifying...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ArrowRight className="h-5 w-5" />
                                            <span>Verify Code</span>
                                        </>
                                    )}
                                </button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={resendCooldown > 0 || loading}
                                        className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                        <span>
                                            {resendCooldown > 0 
                                                ? `Resend in ${resendCooldown}s` 
                                                : 'Resend Code'}
                                        </span>
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep('email');
                                        setOtp(['', '', '', '', '', '']);
                                        setError('');
                                        setMessage('');
                                    }}
                                    className="w-full text-center text-slate-400 hover:text-white text-sm"
                                >
                                    Change email address
                                </button>
                            </form>
                        </>
                    )}

                    {/* Step 3: New Password */}
                    {step === 'password' && (
                        <>
                            <div className="mb-6">
                                <div className="w-16 h-16 rounded-full bg-green-500/20 mx-auto mb-4 flex items-center justify-center">
                                    <Lock className="h-8 w-8 text-green-400" />
                                </div>
                                <p className="text-slate-300 text-center text-sm">
                                    Create a new password for your account
                                </p>
                            </div>

                            <form onSubmit={handleResetPassword} className="space-y-6">
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
                                    disabled={loading || !newPassword || !confirmPassword}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-teal-400 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/50 flex items-center justify-center space-x-2"
                                >
                                    {loading ? (
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

                    {/* Step 4: Success */}
                    {step === 'success' && (
                        <div className="text-center py-4">
                            <div className="w-20 h-20 rounded-full bg-green-500/20 mx-auto mb-6 flex items-center justify-center">
                                <CheckCircle className="h-12 w-12 text-green-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Password Reset Successfully! 🎉</h3>
                            <p className="text-green-300 mb-2">Your password has been changed.</p>
                            <p className="text-slate-300 mb-6">You can now log in with your new password.</p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-teal-400 transition shadow-lg shadow-cyan-500/50 flex items-center justify-center space-x-2"
                            >
                                <span>Go to Login</span>
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        </div>
                    )}

                    {/* Back to Login Link (for non-success states) */}
                    {step !== 'success' && (
                        <div className="mt-6 text-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 font-semibold text-sm"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Back to Login</span>
                            </Link>
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
