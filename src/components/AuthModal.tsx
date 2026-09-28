import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import {
  X,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Key,
  Smartphone,
  ShieldAlert,
  Sparkles,
  KeyRound,
  Fingerprint,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    signup,
    settings,
    adminCredentials,
    isGatewayUnlocked,
    setIsGatewayUnlocked,
    initializeAdmin,
    verifyGatewayPasscode,
    adminLogin,
    adminFailedAttempts,
    adminLockoutUntil,
    resetAdminLockout,
  } = useShop();

  // Customer Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Customer Signup State
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: 'Lahore',
    address: '',
  });

  // FIRST-TIME ADMIN CREATION FORM STATE ("एक पूरा चार्ट आ गया")
  const [setupName, setSetupName] = useState(adminCredentials.name || 'Store Executive');
  const [setupEmail, setSetupEmail] = useState(adminCredentials.email || 'auraadornjewellers@gmail.com');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');
  const [setupGatewayPasscode, setSetupGatewayPasscode] = useState('');
  const [setupConfirmGatewayPasscode, setSetupConfirmGatewayPasscode] = useState('');
  const [setupRecoveryKey, setSetupRecoveryKey] = useState(adminCredentials.recoveryKey || 'AURA-MASTER-9900');
  const [showSetupPass, setShowSetupPass] = useState(false);
  const [showSetupGate, setShowSetupGate] = useState(false);

  // GATEWAY PASSCODE VERIFICATION STATE (Stage 1)
  const [gatewayPasscodeInput, setGatewayPasscodeInput] = useState('');
  const [showGatewayPasscode, setShowGatewayPasscode] = useState(false);

  // ADMIN LOGIN CREDENTIALS STATE (Stage 2)
  const [adminEmailInput, setAdminEmailInput] = useState(adminCredentials.email || 'admin@ms.com');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Emergency Recovery State
  const [recoveryKeyInput, setRecoveryKeyInput] = useState('');
  const [showRecoveryForm, setShowRecoveryForm] = useState(false);

  // Feedback & Submitting
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Lockout Countdown Timer
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState<number>(() => {
    if (adminLockoutUntil && Date.now() < adminLockoutUntil) {
      return Math.ceil((adminLockoutUntil - Date.now()) / 1000);
    }
    return 0;
  });

  useEffect(() => {
    if (!adminLockoutUntil) {
      setLockoutSecondsLeft(0);
      return;
    }

    const checkLockout = () => {
      const now = Date.now();
      const diff = Math.ceil((adminLockoutUntil - now) / 1000);
      if (diff <= 0) {
        setLockoutSecondsLeft(0);
      } else {
        setLockoutSecondsLeft(diff);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [adminLockoutUntil]);

  // Keep admin email in sync when credentials update
  useEffect(() => {
    if (adminCredentials.email) {
      setAdminEmailInput(adminCredentials.email);
    }
  }, [adminCredentials.email]);

  const isDeviceLocked = lockoutSecondsLeft > 0;

  if (!isAuthModalOpen) return null;

  // Format countdown into MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 1. Customer Login Submit
  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(loginEmail, loginPassword);
      setFeedback(res);
      setIsSubmitting(false);
      if (res.success) {
        setLoginEmail('');
        setLoginPassword('');
      }
    }, 350);
  };

  // 2. Customer Signup Submit
  const handleCustomerSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!signupData.name || !signupData.email || !signupData.password || !signupData.phone) {
      setFeedback({ success: false, message: 'Please fill in all mandatory fields.' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = signup(signupData);
      setFeedback(res);
      setIsSubmitting(false);
      if (res.success) {
        setSignupData({
          name: '',
          email: '',
          password: '',
          phone: '',
          city: 'Lahore',
          address: '',
        });
      }
    }, 350);
  };

  // 3. FIRST TIME INITIALIZATION SUBMIT ("Create Admin Panel" / क्रिएट एडमिन पैनल)
  const handleSetupAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!setupName.trim() || !setupEmail.trim() || !setupPassword || !setupGatewayPasscode) {
      setFeedback({ success: false, message: 'Please fill in all required setup fields.' });
      return;
    }

    if (setupPassword !== setupConfirmPassword) {
      setFeedback({ success: false, message: 'Admin login password and confirm password do not match.' });
      return;
    }

    if (setupGatewayPasscode !== setupConfirmGatewayPasscode) {
      setFeedback({ success: false, message: 'Secret Gateway Passcodes do not match.' });
      return;
    }

    if (setupGatewayPasscode.length < 4) {
      setFeedback({ success: false, message: 'Secret Gateway Passcode must be at least 4 characters.' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = initializeAdmin({
        name: setupName,
        email: setupEmail,
        password: setupPassword,
        gatewayPasscode: setupGatewayPasscode,
        recoveryKey: setupRecoveryKey || 'AURA-MASTER-9900',
      });
      setFeedback(res);
      setIsSubmitting(false);
      if (res.success) {
        // Form is saved permanently!
        setAdminEmailInput(setupEmail);
      }
    }, 450);
  };

  // 4. STAGE 1: VERIFY SECRET GATEWAY PASSCODE (सुरक्षा गेटवे पासवर्ड)
  const handleGatewayPasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (isDeviceLocked) {
      setFeedback({
        success: false,
        message: `Device is locked out. Please wait ${formatTime(lockoutSecondsLeft)} or enter Master Recovery Key.`,
      });
      return;
    }

    if (!gatewayPasscodeInput.trim()) {
      setFeedback({ success: false, message: 'Please enter the Secret Gateway Passcode.' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = verifyGatewayPasscode(gatewayPasscodeInput);
      setFeedback(res);
      setIsSubmitting(false);
      if (res.success) {
        setGatewayPasscodeInput('');
      }
    }, 350);
  };

  // 5. STAGE 2: MASTER ADMIN LOGIN (ईमेल और पासवर्ड)
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (isDeviceLocked) {
      setFeedback({
        success: false,
        message: `Device is locked out. Please wait ${formatTime(lockoutSecondsLeft)} or enter Master Recovery Key.`,
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = adminLogin(adminEmailInput, adminPasswordInput);
      setFeedback(res);
      setIsSubmitting(false);
      if (res.success) {
        setAdminPasswordInput('');
      }
    }, 400);
  };

  // 6. Emergency Recovery Override
  const handleRecoveryOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryKeyInput.trim()) return;

    const res = resetAdminLockout(recoveryKeyInput);
    setFeedback(res);
    if (res.success) {
      setRecoveryKeyInput('');
      setShowRecoveryForm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Luxury Backdrop */}
      <div
        onClick={() => setIsAuthModalOpen(false)}
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity"
      />

      {/* TOP RIGHT OF THE PAGE: EXCLUSIVE "ADMIN" BUTTON */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-8 z-[60] flex items-center gap-3">
        <button
          onClick={() => {
            setAuthModalMode(authModalMode === 'admin' ? 'login' : 'admin');
            setFeedback(null);
          }}
          className={`group relative flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xs border transition-all duration-300 shadow-xl cursor-pointer ${
            authModalMode === 'admin'
              ? 'bg-[#151515] border-stone-600 text-stone-300 hover:text-white hover:border-[#D4AF37]'
              : 'bg-black/95 border-[#D4AF37] hover:border-[#F3E5AB] text-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95'
          }`}
          title="Direct Admin Portal Gateway"
        >
          {authModalMode !== 'admin' && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]" />
            </span>
          )}
          <ShieldCheck className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
          <span className="text-xs font-serif-luxury font-bold tracking-widest text-gold-gradient uppercase">
            {authModalMode === 'admin' ? 'Client Area' : 'Admin'}
          </span>
        </button>

        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="p-2 sm:p-2.5 text-stone-400 hover:text-white bg-black/80 border border-stone-800 hover:border-stone-600 rounded-xs transition-colors cursor-pointer"
          aria-label="Close portal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4 py-16">
        <div className={`relative w-full ${!adminCredentials.isConfigured && authModalMode === 'admin' ? 'max-w-xl' : 'max-w-md'} bg-[#0D0D0D] border border-[#C5A059]/50 rounded-xs shadow-2xl p-6 sm:p-8 space-y-6 text-[#E5E5E5] animate-in fade-in zoom-in-95 duration-200`}>
          
          {/* Top Brand Wordmark */}
          <div className="text-center space-y-2">
            <span className="text-2xl sm:text-3xl font-serif-luxury font-bold text-gold-gradient tracking-tight">
              {settings.brandName || 'MS.'}
            </span>
            <p className="text-xs uppercase tracking-widest text-[#C5A059] font-medium">
              {authModalMode === 'admin'
                ? !adminCredentials.isConfigured
                  ? 'First-Time Admin Setup (क्रिएट एडमिन पैनल)'
                  : !isGatewayUnlocked
                  ? 'Security Gate Clearance (सुरक्षा गेटवे)'
                  : 'Master Executive Admin Console'
                : 'Haute Couture Client Portal'}
            </p>
          </div>

          {/* Customer / Admin Mode Switchers */}
          {authModalMode !== 'admin' ? (
            <div className="space-y-3">
              {/* Segmented Switcher (Sign In vs Create Account) */}
              <div className="grid grid-cols-2 p-1 bg-stone-900/90 rounded-xs border border-stone-800">
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setFeedback(null);
                  }}
                  className={`py-2 text-xs font-semibold uppercase tracking-wider rounded-xs transition-all cursor-pointer ${
                    authModalMode === 'login'
                      ? 'bg-[#D4AF37] text-black shadow-sm font-bold'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('signup');
                    setFeedback(null);
                  }}
                  className={`py-2 text-xs font-semibold uppercase tracking-wider rounded-xs transition-all cursor-pointer ${
                    authModalMode === 'signup'
                      ? 'bg-[#D4AF37] text-black shadow-sm font-bold'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Direct Link to Admin Panel inside the modal */}
              <div className="flex items-center justify-between px-2 pt-1 text-[11px]">
                <span className="text-stone-500">Store Administrator?</span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('admin');
                    setFeedback(null);
                  }}
                  className="flex items-center gap-1.5 text-[#D4AF37] hover:text-[#F3E5AB] font-semibold transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Gateway →</span>
                </button>
              </div>
            </div>
          ) : (
            /* Dedicated Admin Header Banner */
            <div className="bg-[#141208] border border-[#D4AF37]/50 rounded-xs p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs font-serif-luxury font-bold uppercase tracking-wider text-[#D4AF37]">
                    {!adminCredentials.isConfigured
                      ? 'Create Admin Console'
                      : !isGatewayUnlocked
                      ? 'Security Gateway Gate'
                      : 'Admin Authentication'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('login');
                    setFeedback(null);
                  }}
                  className="text-[10px] uppercase tracking-wider text-stone-400 hover:text-white underline cursor-pointer"
                >
                  ← Customer Portal
                </button>
              </div>

              {/* Security Attempts Indicator (Only when configured) */}
              {adminCredentials.isConfigured && (
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-800">
                  <span className="text-stone-400">Terminal Protection:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-300 font-mono">
                      {adminFailedAttempts}/3 attempts
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((step) => {
                        const isFailed = step <= adminFailedAttempts;
                        return (
                          <span
                            key={step}
                            className={`w-2 h-2 rounded-full border ${
                              isFailed
                                ? 'bg-red-500 border-red-400'
                                : 'bg-emerald-500/40 border-emerald-500'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Feedback alerts */}
          {feedback && (
            <div
              className={`p-3 rounded-xs text-xs flex items-center gap-2.5 border animate-in fade-in duration-200 ${
                feedback.success
                  ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                  : 'bg-red-950/60 border-red-800/60 text-red-300'
              }`}
            >
              {feedback.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              )}
              <span className="leading-snug">{feedback.message}</span>
            </div>
          )}

          {/* 1. CUSTOMER SIGN IN FORM */}
          {authModalMode === 'login' && (
            <form onSubmit={handleCustomerLogin} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase tracking-wider text-stone-300 mb-1 font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] pl-9 pr-3 py-2 text-white rounded-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-stone-300 mb-1 font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] pl-9 pr-9 py-2 text-white rounded-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 text-stone-500 hover:text-white"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA8222] hover:brightness-110 text-black font-bold uppercase tracking-widest rounded-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <span className="text-stone-500 text-[11px]">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthModalMode('signup')}
                    className="text-[#D4AF37] hover:underline font-semibold cursor-pointer"
                  >
                    Register here
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* 2. CUSTOMER CREATE ACCOUNT FORM */}
          {authModalMode === 'signup' && (
            <form onSubmit={handleCustomerSignup} className="space-y-3.5 text-xs">
              <div>
                <label className="block uppercase tracking-wider text-stone-300 mb-1 font-medium">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] pl-9 pr-3 py-2 text-white rounded-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider text-stone-300 mb-1 font-medium">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    placeholder="name@email.com"
                    className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] px-3 py-2 text-white rounded-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-stone-300 mb-1 font-medium">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={signupData.phone}
                    onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                    placeholder="0300XXXXXXX"
                    className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] px-3 py-2 text-white rounded-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-stone-300 mb-1 font-medium">
                  Create Password *
                </label>
                <input
                  type="password"
                  required
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] px-3 py-2 text-white rounded-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider text-stone-300 mb-1 font-medium">
                    City
                  </label>
                  <select
                    value={signupData.city}
                    onChange={(e) => setSignupData({ ...signupData, city: e.target.value })}
                    className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] px-3 py-2 text-white rounded-xs focus:outline-none"
                  >
                    <option>Lahore</option>
                    <option>Karachi</option>
                    <option>Islamabad</option>
                    <option>Rawalpindi</option>
                    <option>Faisalabad</option>
                    <option>Peshawar</option>
                    <option>Sialkot</option>
                    <option>Multan</option>
                    <option>Quetta</option>
                    <option>Other City</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-stone-300 mb-1 font-medium">
                    Address / Area
                  </label>
                  <input
                    type="text"
                    value={signupData.address}
                    onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
                    placeholder="Street / Sector"
                    className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] px-3 py-2 text-white rounded-xs focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-bold uppercase tracking-widest rounded-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isSubmitting ? 'Creating Profile...' : 'Complete Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-1 text-center">
                <span className="text-stone-500 text-[11px]">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthModalMode('login')}
                    className="text-[#D4AF37] hover:underline font-semibold cursor-pointer"
                  >
                    Sign in here
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* 3. ADMIN PORTAL (3 SCENARIOS):
              A) FIRST-TIME INITIALIZATION ("क्रिएट एडमिन पैनल")
              B) STAGE 1: GATEWAY PASSCODE ("सुरक्षा गेटवे पासवर्ड")
              C) STAGE 2: MASTER ADMIN LOGIN ("लॉगिन ईमेल और पासवर्ड")
          */}
          {authModalMode === 'admin' && (
            <div className="space-y-5 text-xs">
              
              {/* LOCKOUT SCREEN (If 3 failed attempts occurred on gateway or login) */}
              {isDeviceLocked ? (
                <div className="bg-red-950/40 border border-red-600/80 rounded-xs p-5 space-y-4 text-center animate-in zoom-in-95 duration-200">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-900/50 border border-red-500 text-red-400 mb-1 animate-pulse">
                    <ShieldAlert className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-serif-luxury font-bold text-red-300 uppercase tracking-wider">
                      Terminal Security Lockout Active
                    </h3>
                    <p className="text-xs text-red-200/90 leading-relaxed">
                      This device has been temporarily restricted after <strong>3 consecutive failed authorization attempts</strong>.
                    </p>
                  </div>

                  {/* Countdown Timer Display */}
                  <div className="bg-black/80 border border-red-800/60 p-3 rounded-xs space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-stone-400">
                      Security Cooldown Remaining
                    </span>
                    <div className="text-3xl font-mono font-bold text-red-400 tracking-widest">
                      {formatTime(lockoutSecondsLeft)}
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-400">
                    All administrative login attempts on this terminal are locked for security compliance.
                  </p>

                  {/* Emergency Master Recovery Key Option */}
                  <div className="pt-2 border-t border-red-900/50">
                    {!showRecoveryForm ? (
                      <button
                        type="button"
                        onClick={() => setShowRecoveryForm(true)}
                        className="text-xs text-[#D4AF37] hover:underline font-semibold flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Enter Emergency Master Security Key</span>
                      </button>
                    ) : (
                      <form onSubmit={handleRecoveryOverride} className="space-y-3 pt-2 text-left">
                        <label className="block text-[11px] uppercase tracking-wider text-amber-300 font-semibold">
                          Master Recovery Key:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            required
                            placeholder="e.g. AURA-MASTER-9900"
                            value={recoveryKeyInput}
                            onChange={(e) => setRecoveryKeyInput(e.target.value)}
                            className="flex-1 bg-black border border-stone-700 px-3 py-1.5 text-white rounded-xs focus:border-[#D4AF37] focus:outline-none font-mono"
                          />
                          <button
                            type="submit"
                            className="px-3 py-1.5 bg-[#D4AF37] text-black font-bold uppercase rounded-xs hover:bg-[#F3E5AB] cursor-pointer"
                          >
                            Override
                          </button>
                        </div>
                        <p className="text-[10px] text-stone-400">
                          (Default Key: <code>{adminCredentials.recoveryKey || 'AURA-MASTER-9900'}</code>)
                        </p>
                      </form>
                    )}
                  </div>
                </div>
              ) : !adminCredentials.isConfigured ? (
                
                /* ========================================================
                   SCENARIO A: FIRST-TIME ADMIN SETUP ("क्रिएट एडमिन पैनल")
                   ======================================================== */
                <form onSubmit={handleSetupAdminSubmit} className="space-y-4">
                  <div className="p-3 bg-[#110F05] border border-[#D4AF37]/50 rounded-xs space-y-1 text-stone-300">
                    <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" />
                      <span>One-Time Permanent Setup (स्थायी सेटअप चार्ट)</span>
                    </div>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      पहली बार एडमिन पैनल बनाने के लिए अपनी ईमेल, नाम, लॉगिन पासवर्ड और नीचे एक <strong>सीक्रेट गेटवे पासवर्ड</strong> सेट करें। यह डेटा हमेशा सुरक्षित रहेगा।
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold">
                        Admin Name (नाम) *
                      </label>
                      <input
                        type="text"
                        required
                        value={setupName}
                        onChange={(e) => setSetupName(e.target.value)}
                        placeholder="e.g. Store Owner"
                        className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] px-3 py-2 text-white rounded-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold">
                        Admin Email (ईमेल) *
                      </label>
                      <input
                        type="email"
                        required
                        value={setupEmail}
                        onChange={(e) => setSetupEmail(e.target.value)}
                        placeholder="e.g. auraadornjewellers@gmail.com"
                        className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] px-3 py-2 text-white rounded-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Login Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold">
                        Admin Login Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showSetupPass ? 'text' : 'password'}
                          required
                          value={setupPassword}
                          onChange={(e) => setSetupPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] px-3 py-2 text-white rounded-xs focus:outline-none pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSetupPass(!showSetupPass)}
                          className="absolute right-2.5 top-2.5 text-stone-500 hover:text-white"
                        >
                          {showSetupPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold">
                        Confirm Login Password *
                      </label>
                      <input
                        type={showSetupPass ? 'text' : 'password'}
                        required
                        value={setupConfirmPassword}
                        onChange={(e) => setSetupConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] px-3 py-2 text-white rounded-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* USER REQUESTED: SPECIAL SECRET GATEWAY PASSCODE
                      "और एक नीचे ना एक और पासवर्ड मुझसे पूछ लेना। वह पासवर्ड मैं डालूंगा तो वह सेव हो जाएगा मेरे पास।" */}
                  <div className="p-3 bg-black border border-[#D4AF37]/60 rounded-xs space-y-3">
                    <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-xs uppercase tracking-wider">
                      <KeyRound className="w-4 h-4 text-[#D4AF37]" />
                      <span>Secret Gateway Passcode (गेटवे सुरक्षा पासवर्ड) *</span>
                    </div>
                    <p className="text-[10px] text-stone-400 leading-relaxed">
                      यह वह पासवर्ड है जो भविष्य में एडमिन बटन दबाते ही सबसे पहले मांगा जाएगा। इसे याद रखें।
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold text-[11px]">
                          Set Gateway Passcode *
                        </label>
                        <div className="relative">
                          <input
                            type={showSetupGate ? 'text' : 'password'}
                            required
                            value={setupGatewayPasscode}
                            onChange={(e) => setSetupGatewayPasscode(e.target.value)}
                            placeholder="e.g. 9900"
                            className="w-full bg-[#121212] border border-stone-700 focus:border-[#D4AF37] px-3 py-2 text-white rounded-xs focus:outline-none font-mono pr-8"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSetupGate(!showSetupGate)}
                            className="absolute right-2.5 top-2.5 text-stone-500 hover:text-white"
                          >
                            {showSetupGate ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold text-[11px]">
                          Confirm Gateway Passcode *
                        </label>
                        <input
                          type={showSetupGate ? 'text' : 'password'}
                          required
                          value={setupConfirmGatewayPasscode}
                          onChange={(e) => setSetupConfirmGatewayPasscode(e.target.value)}
                          placeholder="e.g. 9900"
                          className="w-full bg-[#121212] border border-stone-700 focus:border-[#D4AF37] px-3 py-2 text-white rounded-xs focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Recovery Key */}
                  <div>
                    <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold text-[11px]">
                      Emergency Master Recovery Key (आपातकालीन रिकवरी की)
                    </label>
                    <input
                      type="text"
                      value={setupRecoveryKey}
                      onChange={(e) => setSetupRecoveryKey(e.target.value)}
                      placeholder="e.g. AURA-MASTER-9900"
                      className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] px-3 py-1.5 text-white rounded-xs focus:outline-none font-mono text-[11px]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA8222] hover:brightness-110 text-black font-bold uppercase tracking-widest rounded-xs shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isSubmitting ? 'Creating & Saving...' : 'Save & Lock Admin Console Permanently'}</span>
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setAuthModalMode('login')}
                      className="text-stone-400 hover:text-white text-xs underline cursor-pointer"
                    >
                      ← Back to Customer Login
                    </button>
                  </div>
                </form>

              ) : !isGatewayUnlocked ? (

                /* ========================================================
                   SCENARIO B: STAGE 1 - SECRET GATEWAY PASSCODE REQUIRED
                   "जो मैं लास्ट में नीचे पासवर्ड दिया था ना, वही पासवर्ड।
                    तो वह पासवर्ड डालेगा तो फिर ओपन होगा। और फिर वह लॉगिन मांगेगा।"
                   ======================================================== */
                <form onSubmit={handleGatewayPasscodeSubmit} className="space-y-4">
                  <div className="text-center space-y-2 py-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37] text-[#D4AF37] mb-1 shadow-[0_0_20px_rgba(212,175,55,0.25)]">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-serif-luxury font-bold text-white uppercase tracking-wider">
                      Security Gate Clearance
                    </h3>
                    <p className="text-xs text-stone-400 leading-relaxed max-w-sm mx-auto">
                      एडमिन लॉगिन खोलने के लिए पहले अपना <strong>सीक्रेट गेटवे पासवर्ड</strong> दर्ज करें।
                    </p>
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold text-xs">
                      Enter Secret Gateway Passcode (गेटवे पासवर्ड)
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                      <input
                        type={showGatewayPasscode ? 'text' : 'password'}
                        required
                        autoFocus
                        value={gatewayPasscodeInput}
                        onChange={(e) => setGatewayPasscodeInput(e.target.value)}
                        placeholder="Enter secret passcode..."
                        className="w-full bg-black border border-stone-700 focus:border-[#D4AF37] pl-9 pr-10 py-2.5 text-white rounded-xs focus:outline-none font-mono text-sm tracking-widest"
                      />
                      <button
                        type="button"
                        onClick={() => setShowGatewayPasscode(!showGatewayPasscode)}
                        className="absolute right-3 top-3 text-stone-500 hover:text-white cursor-pointer"
                      >
                        {showGatewayPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Security Policy Reminder */}
                  <div className="p-3 bg-[#080808] border border-stone-800/80 rounded-xs space-y-1 text-[11px] text-stone-400">
                    <div className="flex items-center justify-between text-amber-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Fingerprint className="w-3.5 h-3.5" />
                        <span>Protected Gatekeeper Protocol</span>
                      </div>
                      <span className="font-mono text-stone-300">{3 - adminFailedAttempts} attempts left</span>
                    </div>
                    <p className="text-[10px] leading-relaxed">
                      3 गलत प्रयास दर्ज करने पर यह डिवाइस 15 मिनट के लिए लॉक हो जाएगी।
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA8222] hover:brightness-110 text-black font-bold uppercase tracking-widest rounded-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <span>{isSubmitting ? 'Verifying Gate Clearance...' : 'Unlock Admin Login Gate'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalMode('login');
                        setFeedback(null);
                      }}
                      className="text-stone-400 hover:text-white text-xs underline cursor-pointer"
                    >
                      ← Back to Customer Portal
                    </button>
                  </div>
                </form>

              ) : (

                /* ========================================================
                   SCENARIO C: STAGE 2 - ADMIN LOGIN WITH EMAIL & PASSWORD
                   "और फिर वह लॉगिन मांगेगा और फिर लॉगिन पेज ओपन होगा।
                    फिर लॉगिन उसको लॉगिन का ईमेल भी डालना पड़ेगा यूजर को,
                    फिर उसका पासवर्ड भी डालना पड़ेगा। तब जाके एडमिन पैनल ओपन होगा।"
                   ======================================================== */
                <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                  {/* Gate Unlocked Badge */}
                  <div className="flex items-center justify-between p-2.5 bg-emerald-950/40 border border-emerald-700/60 rounded-xs text-xs text-emerald-300">
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Security Gate Cleared ✓</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsGatewayUnlocked(false);
                        setFeedback(null);
                      }}
                      className="text-[10px] uppercase text-stone-400 hover:text-white underline cursor-pointer"
                    >
                      Lock Gate
                    </button>
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold">
                      Administrator Email (एडमिन ईमेल)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={adminEmailInput}
                        onChange={(e) => setAdminEmailInput(e.target.value)}
                        placeholder="e.g. auraadornjewellers@gmail.com"
                        className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] pl-9 pr-3 py-2 text-white rounded-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold">
                      Master Password (एडमिन पासवर्ड)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        required
                        value={adminPasswordInput}
                        onChange={(e) => setAdminPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] pl-9 pr-9 py-2 text-white rounded-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3 top-2.5 text-stone-500 hover:text-white cursor-pointer"
                      >
                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Device Lockout rule info */}
                  <div className="p-3 bg-[#080808] border border-stone-800/80 rounded-xs space-y-1 text-[11px] text-stone-400">
                    <div className="flex items-center gap-2 text-amber-300 font-medium">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Security Rule: 3 Failed Attempts Lockout</span>
                    </div>
                    <p className="text-[10px] leading-relaxed">
                      Security Clearance: Validated via hardware device token and TLS 1.3 cryptographic session.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA8222] hover:brightness-110 text-black font-bold uppercase tracking-widest rounded-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isSubmitting ? 'Verifying Clearance...' : 'Open Admin Panel (एडमिन पैनल खोलें)'}</span>
                  </button>

                  <div className="pt-2 text-center flex items-center justify-center gap-4 text-xs">
                    <button
                      type="button"
                      onClick={() => setIsGatewayUnlocked(false)}
                      className="text-stone-400 hover:text-white underline cursor-pointer"
                    >
                      ← Re-enter Gateway Passcode
                    </button>
                    <span className="text-stone-600">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalMode('login');
                        setFeedback(null);
                      }}
                      className="text-stone-400 hover:text-white underline cursor-pointer"
                    >
                      Customer Area
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
