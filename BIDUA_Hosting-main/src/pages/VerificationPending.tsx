import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Server, Mail, RefreshCw, CheckCircle, Clock, Loader2, ShieldCheck } from 'lucide-react';
import api from '../lib/api';

export function VerificationPending() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [status, setStatus] = useState<'idle' | 'loading' | 'verifying' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const [showEmailInput, setShowEmailInput] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Get email from sessionStorage (set during signup)
    useEffect(() => {
        const storedEmail = sessionStorage.getItem('verification_email');
        if (storedEmail) {
            setEmail(storedEmail);
        } else {
            setShowEmailInput(true);
        }
    }, []);

    // Handle OTP input
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Only take last character
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all digits are entered
        if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
            handleVerifyOtp(newOtp.join(''));
        }
    };

    // Handle backspace
    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Handle paste
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData.length === 6) {
            const newOtp = pastedData.split('');
            setOtp(newOtp);
            inputRefs.current[5]?.focus();
            handleVerifyOtp(pastedData);
        }
    };

    // Verify OTP
    const handleVerifyOtp = async (otpCode: string) => {
        if (!email) {
            setShowEmailInput(true);
            setStatus('error');
            setMessage('Please enter your email address');
            return;
        }

        setStatus('verifying');
        setMessage('');

        try {
            const response = await api.post<{ success: boolean; message: string }>(
                '/api/v1/auth/verify-otp',
                { email, otp: otpCode }
            );

            if (response.success) {
                setStatus('success');
                setMessage(response.message || 'Email verified successfully!');
                
                // Clear stored email
                sessionStorage.removeItem('verification_email');
                
                // Check for pending redirect (from checkout flow)
                const pendingRedirect = sessionStorage.getItem('pending_redirect');
                const pendingServerConfig = sessionStorage.getItem('pending_server_config');
                
                // Redirect after success
                setTimeout(() => {
                    if (pendingRedirect && pendingServerConfig) {
                        sessionStorage.removeItem('pending_redirect');
                        sessionStorage.removeItem('pending_server_config');
                        navigate(pendingRedirect, { 
                            state: { serverConfig: JSON.parse(pendingServerConfig) },
                            replace: true 
                        });
                    } else {
                        navigate('/login', { replace: true });
                    }
                }, 2000);
            } else {
                setStatus('error');
                setMessage(response.message || 'Invalid OTP code');
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (error: any) {
            setStatus('error');
            setMessage(error?.response?.data?.detail || error?.message || 'Failed to verify OTP');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        }
    };

    // Resend OTP
    const handleResend = async () => {
        if (cooldown > 0 || !email) return;

        setStatus('loading');
        setMessage('');

        try {
            const response = await api.post<{ success: boolean; message: string }>(
                '/api/v1/auth/resend-otp',
                { email }
            );

            setStatus('idle');
            setMessage(response.message || 'OTP sent successfully');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();

            // Start cooldown (60 seconds)
            setCooldown(60);
            const timer = setInterval(() => {
                setCooldown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (error: any) {
            setStatus('error');
            setMessage(error?.response?.data?.detail || error?.message || 'Failed to send OTP');
        }
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
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500/20 to-teal-500/20 mx-auto mb-4 flex items-center justify-center">
                            {status === 'success' ? (
                                <CheckCircle className="h-10 w-10 text-green-400" />
                            ) : (
                                <ShieldCheck className="h-10 w-10 text-cyan-400" />
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {status === 'success' ? 'Email Verified!' : 'Verify Your Email'}
                        </h2>
                        <p className="text-cyan-200">
                            {status === 'success' 
                                ? 'Redirecting to login...' 
                                : email 
                                    ? <>Enter the 6-digit code sent to <span className="font-semibold text-white">{email}</span></>
                                    : 'Enter the 6-digit code sent to your email'
                            }
                        </p>
                    </div>

                    {/* Status Messages */}
                    {message && status !== 'verifying' && (
                        <div className={`mb-6 px-4 py-3 rounded-lg text-sm flex items-center space-x-2 ${
                            status === 'success' 
                                ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                                : status === 'error'
                                    ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                                    : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300'
                        }`}>
                            {status === 'success' && <CheckCircle className="h-5 w-5 flex-shrink-0" />}
                            <span>{message}</span>
                        </div>
                    )}

                    {/* Email Input (if not stored) */}
                    {showEmailInput && status !== 'success' && (
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-200 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-800 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400"
                                placeholder="you@example.com"
                            />
                        </div>
                    )}

                    {/* OTP Input */}
                    {status !== 'success' && (
                        <div className="space-y-6">
                            <div className="flex justify-center space-x-3">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => { inputRefs.current[index] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={handlePaste}
                                        disabled={status === 'verifying'}
                                        className="w-12 h-14 text-center text-2xl font-bold bg-slate-800 border-2 border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-slate-600 disabled:opacity-50 transition-all"
                                        placeholder="•"
                                    />
                                ))}
                            </div>

                            {status === 'verifying' && (
                                <div className="flex justify-center">
                                    <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
                                </div>
                            )}

                            {/* Verify Button (manual trigger if auto-submit fails) */}
                            <button
                                onClick={() => handleVerifyOtp(otp.join(''))}
                                disabled={otp.some(d => !d) || status === 'verifying'}
                                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-teal-400 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/50 flex items-center justify-center space-x-2"
                            >
                                {status === 'verifying' ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Verifying...</span>
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="h-5 w-5" />
                                        <span>Verify Email</span>
                                    </>
                                )}
                            </button>

                            {/* Resend OTP */}
                            <div className="text-center">
                                <p className="text-sm text-slate-400 mb-2">Didn't receive the code?</p>
                                <button
                                    onClick={handleResend}
                                    disabled={status === 'loading' || cooldown > 0 || !email}
                                    className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1 mx-auto"
                                >
                                    {status === 'loading' ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Sending...</span>
                                        </>
                                    ) : cooldown > 0 ? (
                                        <>
                                            <Clock className="h-4 w-4" />
                                            <span>Resend in {cooldown}s</span>
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="h-4 w-4" />
                                            <span>Resend OTP</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    {status !== 'success' && (
                        <div className="mt-6 pt-6 border-t border-cyan-500/20">
                            <h3 className="text-sm font-semibold text-white mb-3">Tips</h3>
                            <ul className="space-y-2 text-sm text-slate-300">
                                <li className="flex items-start space-x-2">
                                    <span className="text-cyan-400">•</span>
                                    <span>Check your spam/junk folder if you don't see the email</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="text-cyan-400">•</span>
                                    <span>The OTP code expires in <strong>10 minutes</strong></span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="text-cyan-400">•</span>
                                    <span>You can paste the code directly into the input boxes</span>
                                </li>
                            </ul>
                        </div>
                    )}

                    {/* Back to Login */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-400">
                            Already verified?{' '}
                            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                                Sign in
                            </Link>
                        </p>
                    </div>
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
