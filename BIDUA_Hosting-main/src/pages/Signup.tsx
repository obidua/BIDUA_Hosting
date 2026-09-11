import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Server, CheckCircle, XCircle, Loader2, RefreshCw, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

export function Signup() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referralCheckLoading, setReferralCheckLoading] = useState(false);
  const [referralValid, setReferralValid] = useState<boolean | null>(null);
  const [referralInviter, setReferralInviter] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Verification State
  const [emailVerified, setEmailVerified] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpStatus, setOtpStatus] = useState<'idle' | 'sending' | 'verifying' | 'success' | 'error'>('idle');
  const [otpMessage, setOtpMessage] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect logged-in users to their intended destination
  useEffect(() => {
    if (user) {
      const serverConfig = location.state?.serverConfig;
      const redirectUrl = searchParams.get('redirect');

      if (serverConfig && redirectUrl) {
        navigate(decodeURIComponent(redirectUrl), { state: { serverConfig }, replace: true });
      } else if (redirectUrl) {
        navigate(decodeURIComponent(redirectUrl), { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate, location.state, searchParams]);

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [searchParams]);

  // Validate referral code when it changes
  useEffect(() => {
    let active = true;
    const check = async () => {
      if (!referralCode) {
        setReferralValid(null);
        setReferralInviter(null);
        return;
      }
      setReferralCheckLoading(true);
      try {
        const resp = await api.get<{ valid: boolean; inviter?: { full_name?: string; email?: string }; code?: string }>(`/api/v1/affiliate/validate-code?code=${encodeURIComponent(referralCode)}`);
        if (!active) return;
        setReferralValid(Boolean(resp?.valid));
        setReferralInviter(resp?.inviter?.full_name || resp?.inviter?.email || null);
      } catch {
        if (!active) return;
        setReferralValid(null);
        setReferralInviter(null);
      } finally {
        if (active) setReferralCheckLoading(false);
      }
    };
    const t = setTimeout(check, 250);
    return () => { active = false; clearTimeout(t); };
  }, [referralCode]);

  // Reset OTP state when email changes
  useEffect(() => {
    if (emailVerified || showOtpInput) {
      setEmailVerified(false);
      setShowOtpInput(false);
      setOtp(['', '', '', '', '', '']);
      setOtpMessage('');
      setOtpStatus('idle');
    }
  }, [email]);

  // Send OTP to email
  const handleSendOtp = async () => {
    if (!email || otpCooldown > 0) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setOtpMessage('Please enter a valid email address');
      setOtpStatus('error');
      return;
    }

    setOtpStatus('sending');
    setOtpMessage('');

    try {
      const response = await api.post<{ success: boolean; message: string }>(
        '/api/v1/auth/send-signup-otp',
        { email }
      );

      setOtpStatus('idle');
      setShowOtpInput(true);
      setOtpMessage(response.message || 'OTP sent to your email');
      inputRefs.current[0]?.focus();

      // Start cooldown (60 seconds)
      setOtpCooldown(60);
      const timer = setInterval(() => {
        setOtpCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: unknown) {
      setOtpStatus('error');
      
      // Extract error message from various error formats
      let errorMessage = 'Failed to send OTP';
      
      if (error instanceof Error) {
        // Check for "user already exists" error
        if (error.message.toLowerCase().includes('already exists')) {
          errorMessage = 'An account with this email already exists. Please log in instead.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setOtpMessage(errorMessage);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits are entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

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
    setOtpStatus('verifying');
    setOtpMessage('');

    try {
      const response = await api.post<{ success: boolean; message: string }>(
        '/api/v1/auth/verify-signup-otp',
        { email, otp: otpCode }
      );

      if (response.success) {
        setOtpStatus('success');
        setEmailVerified(true);
        setOtpMessage('Email verified successfully!');
      } else {
        setOtpStatus('error');
        setOtpMessage(response.message || 'Invalid OTP');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error: unknown) {
      setOtpStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Invalid OTP';
      setOtpMessage(errorMessage);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email is verified
    if (!emailVerified) {
      setError('Please verify your email address first');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, fullName, referralCode);

      const successMessage = referralCode && referralValid
        ? `🎉 Account created successfully! Welcome to BIDUA Hosting! You were referred by ${referralInviter || 'a member'}.`
        : '🎉 Account created successfully! Welcome to BIDUA Hosting!';

      sessionStorage.setItem('registration_success', 'true');
      sessionStorage.setItem('registration_message', successMessage);

      const serverConfig = location.state?.serverConfig;
      const redirectUrl = searchParams.get('redirect');

      if (serverConfig && redirectUrl) {
        navigate(decodeURIComponent(redirectUrl), { state: { serverConfig }, replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      let message = 'Failed to create account';
      if (err instanceof Error) {
        if (err.message.includes('already exists')) {
          message = 'An account with this email already exists. Please log in or use a different email.';
        } else {
          message = err.message;
        }
      }
      setError(message);
    } finally {
      setLoading(false);
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
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-cyan-200">Start your cloud hosting journey today</p>
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
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400"
                placeholder="John Doe"
              />
            </div>

            {/* Email with OTP Verification */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={emailVerified}
                  className={`w-full px-4 py-3 pr-24 bg-slate-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400 ${
                    emailVerified ? 'border-green-500/50 bg-green-500/5' : 'border-cyan-500/30'
                  }`}
                  placeholder="you@example.com"
                />
                {emailVerified ? (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-xs font-medium">Verified</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={!email || otpStatus === 'sending' || otpCooldown > 0}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-cyan-500/20 text-cyan-400 text-xs font-semibold rounded-md hover:bg-cyan-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {otpStatus === 'sending' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : otpCooldown > 0 ? (
                      `${otpCooldown}s`
                    ) : (
                      'Verify'
                    )}
                  </button>
                )}
              </div>

              {/* Email Error Message - shows errors like "user already exists" */}
              {otpStatus === 'error' && otpMessage && !showOtpInput && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <XCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{otpMessage}</span>
                </p>
              )}

              {/* OTP Input */}
              {showOtpInput && !emailVerified && (
                <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-cyan-500/20">
                  <p className="text-sm text-cyan-200 mb-3 text-center">
                    Enter the 6-digit code sent to your email
                  </p>
                  
                  <div className="flex justify-center space-x-2 mb-3">
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
                        disabled={otpStatus === 'verifying'}
                        className="w-10 h-12 text-center text-xl font-bold bg-slate-700 border-2 border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white disabled:opacity-50 transition-all"
                      />
                    ))}
                  </div>

                  {otpStatus === 'verifying' && (
                    <div className="flex justify-center mb-2">
                      <Loader2 className="h-5 w-5 text-cyan-400 animate-spin" />
                    </div>
                  )}

                  {otpMessage && (
                    <p className={`text-xs text-center ${otpStatus === 'error' ? 'text-red-400' : otpStatus === 'success' ? 'text-green-400' : 'text-cyan-300'}`}>
                      {otpMessage}
                    </p>
                  )}

                  <div className="flex justify-center mt-3">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpCooldown > 0 || otpStatus === 'sending'}
                      className="text-xs text-cyan-400 hover:text-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      {otpCooldown > 0 ? (
                        <>
                          <Clock className="h-3 w-3" />
                          <span>Resend in {otpCooldown}s</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3" />
                          <span>Resend Code</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 bg-slate-800 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400"
                  placeholder="••••••••"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 bg-slate-800 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400"
                  placeholder="••••••••"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>


            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Referral Code (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 pr-12 bg-slate-800 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400 uppercase"
                  placeholder="Enter referral code"
                />
                {referralCode && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {referralCheckLoading && (
                      <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
                    )}
                    {!referralCheckLoading && referralValid === true && (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    )}
                    {!referralCheckLoading && referralValid === false && (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                )}
              </div>
              {referralCode && referralValid === true && referralInviter && (
                <div className="mt-2 flex items-center space-x-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <div className="text-sm text-green-300">
                    <span className="font-semibold">Valid referral code</span>
                    <span className="text-green-400"> • </span>
                    <span>You'll be referred by </span>
                    <span className="font-semibold text-green-200">{referralInviter}</span>
                  </div>
                </div>
              )}
              {referralCode && !referralCheckLoading && referralValid === false && (
                <div className="mt-2 flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                  <div className="text-sm text-red-300">
                    <span className="font-semibold">Invalid or inactive referral code.</span>
                    <span className="text-red-400"> You can still sign up without it.</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                required
                className="w-4 h-4 text-cyan-500 border-cyan-500/30 rounded focus:ring-cyan-500 bg-slate-800 mt-1"
              />
              <label className="ml-2 text-sm text-slate-300">
                I agree to the{' '}
                <Link to="/terms" className="text-cyan-400 hover:text-cyan-300">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-cyan-400 hover:text-cyan-300">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !emailVerified}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-teal-400 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/50"
            >
              {loading ? 'Creating account...' : !emailVerified ? 'Verify email to continue' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
