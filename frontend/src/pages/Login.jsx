import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { backendAPI } from '../services/api';
import logo from "../assets/secureseatsmall.png";

// --- Premium Custom SVG Icons ---
const MailIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const TicketLogo = () => (
  <img
    src={logo}
    alt="SecureSeat Logo"
    className="h-80 w-auto object-contain transition-transform duration-300 group-hover:scale-110"
  />
);

const LockIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-6 h-6 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Login = ({ user }) => {
    const navigate = useNavigate();
    const [isLoginMode, setIsLoginMode] = useState(true);
    
    // Form States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Captcha state
    const [captcha, setCaptcha] = useState({ num1: 0, num2: 0 });
    const [userCaptcha, setUserCaptcha] = useState('');

    // The Bouncer
    useEffect(() => {
      if (user) {
        navigate('/', { replace: true });
      }
    }, [user, navigate]);

    const generateCaptcha = () => {
        setCaptcha({
            num1: Math.floor(Math.random() * 10) + 1,
            num2: Math.floor(Math.random() * 10) + 1
        });
        setUserCaptcha('');
    };

    useEffect(() => {
        if (!isLoginMode) generateCaptcha();
    }, [isLoginMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isLoginMode) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
            if (!passwordRegex.test(password)) {
                setError('Password must be at least 8 chars long, include uppercase, lowercase, number, and special char.');
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match.');
                return;
            }
            if (parseInt(userCaptcha) !== captcha.num1 + captcha.num2) {
                setError('Incorrect Security Challenge answer. Please try again.');
                generateCaptcha();
                return;
            }
        }

        setIsLoading(true);

        try {
            if (isLoginMode) {
                await backendAPI.post('/auth/login', { email, password });
            } else {
                await backendAPI.post('/auth/register', { name, email, password, role: 'User' });
            }

            // Force a reload to trigger the App.jsx user auth check
            window.location.href = '/';
            
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen font-['Inter',sans-serif] bg-[#e2e9f0]">
            
            {/* ── LEFT HALF: Branding & Logo ── */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 flex-col justify-center items-center p-12 overflow-hidden shadow-2xl z-10">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/30 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center text-center animate-[fadeIn_0.6s_ease-out]">
                    <TicketLogo/>
                    <h1 className="text-5xl font-black text-white tracking-tight mb-4 drop-shadow-md">
                        <span className="text-4xl md:text-5xl font-black text-white tracking-tight group-hover:text-blue-400 transition-colors">
                            Secure<span className="text-blue-500">Seat</span>
                        </span>
                    </h1>
                    <p className="text-xl text-blue-200 font-medium max-w-lg leading-relaxed drop-shadow-sm mt-2">
                        The ultimate premium platform to book, manage, and verify your live event tickets with absolute security.
                    </p>
                </div>
            </div>

            {/* ── RIGHT HALF: Form Data ── */}
            <div className="w-full lg:w-1/2 flex justify-center items-center p-6 md:p-12 relative">
                
                <div className="w-full max-w-[540px] bg-white rounded-[2.5rem] shadow-2xl shadow-slate-300/60 border border-slate-100 p-10 md:p-14 animate-[fadeUp_0.4s_ease-out]">
                    
                    {/* ── Header ── */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mb-6 border border-blue-100 shadow-sm">
                            <LockIcon />
                        </div>
                        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                            {isLoginMode ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-slate-500 text-base font-medium">
                            {isLoginMode ? 'Enter your details to access your tickets.' : 'Sign up to start booking premium seats.'}
                        </p>
                    </div>
                    
                    {/* ── Error Message ── */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-base font-medium mb-8 flex items-start gap-3 animate-[fadeUp_0.3s_ease-out]">
                            <ErrorIcon />
                            <span>{error}</span>
                        </div>
                    )}
                    
                    {/* ── Form ── */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {!isLoginMode && (
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-['JetBrains_Mono']">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                                        <UserIcon />
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="John Doe" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        required 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-14 pr-5 py-4 text-slate-900 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-['JetBrains_Mono']">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                                    <MailIcon />
                                </div>
                                <input 
                                    type="email" 
                                    placeholder="you@example.com" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-14 pr-5 py-4 text-slate-900 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-['JetBrains_Mono']">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                                    <LockIcon />
                                </div>
                                <input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-14 pr-5 py-4 text-slate-900 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                            {!isLoginMode && (
                                <p className="text-xs mt-2 leading-relaxed text-slate-500 font-medium">
                                    Password must be at least 8 chars long, include uppercase, lowercase, number, and special character.
                                </p>
                            )}
                        </div>

                        {!isLoginMode && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-['JetBrains_Mono']">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                                            <LockIcon />
                                        </div>
                                        <input 
                                            type="password" 
                                            placeholder="••••••••" 
                                            value={confirmPassword} 
                                            onChange={(e) => setConfirmPassword(e.target.value)} 
                                            required 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-14 pr-5 py-4 text-slate-900 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-['JetBrains_Mono']">
                                        Security Challenge
                                    </label>
                                    <div className="flex gap-4 items-center">
                                        <div className="px-5 py-4 rounded-xl font-bold text-xl select-none bg-slate-100 text-slate-700 border border-slate-200 min-w-[140px] text-center">
                                            {captcha.num1} + {captcha.num2} = ?
                                        </div>
                                        <input 
                                            type="number" 
                                            placeholder="Answer" 
                                            value={userCaptcha} 
                                            onChange={(e) => setUserCaptcha(e.target.value)} 
                                            required 
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className={`mt-6 w-full text-white font-bold text-xl py-5 px-6 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg ${
                                isLoading 
                                    ? 'bg-slate-400 cursor-not-allowed' 
                                    : 'bg-slate-900 hover:bg-blue-600 shadow-slate-900/20 transform hover:-translate-y-1 cursor-pointer'
                            }`}
                        >
                            {isLoading ? (
                                <div className="w-7 h-7 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                isLoginMode ? 'Sign In' : 'Create Account'
                            )}
                        </button>
                    </form>

                    {/* ── Toggle Mode ── */}
                    <div className="mt-10 text-center border-t border-slate-100 pt-8">
                        <p className="text-slate-500 text-base font-medium">
                            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                            <button 
                                type="button"
                                onClick={() => {
                                    setIsLoginMode(!isLoginMode);
                                    setError('');
                                }}
                                className="font-bold text-blue-600 hover:text-blue-700 transition-colors focus:outline-none cursor-pointer"
                            >
                                {isLoginMode ? "Sign up here" : "Sign in here"}
                            </button>
                        </p>
                    </div>

                </div>
            </div>

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default Login;