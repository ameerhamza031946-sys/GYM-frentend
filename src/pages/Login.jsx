import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';

const Login = ({ onLogin }) => {
    const [tab, setTab] = useState('login'); // 'login' | 'signup'
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [typoHint, setTypoHint] = useState('');

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setError('');

        if (name === 'email') {
            if (value.toLowerCase().includes('@gamil.com')) {
                setTypoHint('Did you mean @gmail.com?');
            } else {
                setTypoHint('');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const email = form.email.toLowerCase().trim();
        const password = form.password;

        if (!email || !password) {
            setError('Please fill in all required fields.');
            return;
        }
        if (tab === 'signup' && !form.name) {
            setError('Please enter your name.');
            return;
        }

        setLoading(true);

        try {
            const endpoint = tab === 'login' ? '/auth/login' : '/auth/register';
            const payload = tab === 'login'
                ? { email, password }
                : { name: form.name.trim(), email, password };

            const requestUrl = `${API_BASE_URL}${endpoint}`;
            console.log(`DEBUG: Sending auth request to ${requestUrl}`, payload);

            const response = await axios.post(requestUrl, payload, { timeout: 10000 });
            console.log("DEBUG: Login Response Status:", response.status);
            const authData = response.data;
            let user = authData;

            if (authData.access_token) {
                localStorage.setItem('fitai_token', authData.access_token);
                user = authData.user;
            }

            console.log("DEBUG: Auth success:", user);

            localStorage.setItem('fitai_user', JSON.stringify(user));
            onLogin(user);
            setLoading(false);

            if (user.onboarding_completed) {
                navigate('/');
            } else {
                navigate('/onboarding');
            }
        } catch (err) {
            console.error("DEBUG: Auth error object:", err);
            let errMsg = 'Authentication failed. Please try again.';

            if (err.code === 'ECONNABORTED') {
                errMsg = 'Request timed out. Please check if the server is running.';
            } else if (err.response) {
                const detail = err.response.data?.detail;
                if (detail === 'Invalid email or password' && tab === 'login') {
                    errMsg = 'Email not found or password incorrect. If you haven\'t created an account yet, please switch to the "Sign Up" tab.';
                } else {
                    errMsg = detail || `Error: ${err.response.status}`;
                }
            } else if (err.request) {
                errMsg = 'Server unreachable. Please check your connection.';
            } else {
                errMsg = err.message;
            }

            setError(errMsg);
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
            style={{ fontFamily: "'Space Grotesk', sans-serif", background: '#0d1320' }}
        >
            {/* Background glow blobs */}
            <div className="absolute top-[-80px] left-[-60px] w-72 h-72 bg-[#256af4]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-60px] right-[-40px] w-64 h-64 bg-[#0bda5e]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 w-full max-w-sm px-6">

                {/* Logo */}
                <div className="flex flex-col items-center mb-10">
                    <div className="size-16 rounded-2xl bg-[#256af4]/20 border border-[#256af4]/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(37,106,244,0.3)]">
                        <span className="material-symbols-outlined text-[#256af4] text-4xl">bolt</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter italic">Fit<span className="text-[#256af4]">AI</span></h1>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#256af4] font-bold mt-1">Personal AI Trainer</p>
                </div>

                {/* Tab switcher */}
                <div className="flex bg-slate-900/50 backdrop-blur-xl rounded-2xl p-1 mb-8 border border-white/5 shadow-2xl">
                    {['login', 'signup'].map(t => (
                        <button
                            key={t}
                            onClick={() => { setTab(t); setError(''); }}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all capitalize ${tab === t
                                ? 'bg-primary text-white shadow-[0_5px_20px_rgba(37,106,244,0.4)]'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {t === 'login' ? 'Sign In' : 'Sign Up'}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {tab === 'signup' && (
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 text-xl">person</span>
                            <input
                                name="name"
                                type="text"
                                placeholder="Full Name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full bg-[#1b2333] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-[#256af4] focus:ring-1 focus:ring-[#256af4] transition-all"
                            />
                        </div>
                    )}

                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 text-xl">mail</span>
                        <input
                            name="email"
                            type="email"
                            placeholder="Email Address"
                            value={form.email}
                            onChange={handleChange}
                            className={`w-full bg-[#1b2333] border ${typoHint ? 'border-yellow-500/50' : 'border-white/10'} rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-[#256af4] focus:ring-1 focus:ring-[#256af4] transition-all`}
                        />
                        {typoHint && (
                            <p className="text-[10px] text-yellow-500 mt-1 ml-4 flex items-center gap-1 animate-pulse">
                                <span className="material-symbols-outlined text-[12px]">info</span>
                                {typoHint}
                            </p>
                        )}
                    </div>

                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 text-xl">lock</span>
                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full bg-[#1b2333] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-[#256af4] focus:ring-1 focus:ring-[#256af4] transition-all"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                            <span className="material-symbols-outlined text-red-400 text-base">error</span>
                            <p className="text-red-400 text-xs font-medium">{error}</p>
                        </div>
                    )}

                    {tab === 'login' && (
                        <div className="flex justify-end">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setError('Demo Mode: Reset link simulated. Check your "email" for test instructions.');
                                    setTimeout(() => setError(''), 4000);
                                }}
                                type="button"
                                className="text-xs text-[#256af4] font-medium hover:underline px-2 py-1"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#256af4] hover:bg-[#256af4]/90 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-[#256af4]/30 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                <span className="text-sm">Authenticating...</span>
                            </div>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-base">
                                    {tab === 'login' ? 'login' : 'person_add'}
                                </span>
                                {tab === 'login' ? 'Sign In' : 'Create Account'}
                            </>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-xs text-slate-600 font-medium">or continue with</span>
                    <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Demo login */}
                <button
                    type="button"
                    onClick={async (e) => {
                        e.preventDefault();
                        setError('');
                        setLoading(true);
                        try {
                            const demoCreds = {
                                email: 'test@vibe.com',
                                password: 'password123'
                            };
                            console.log("DEBUG: Attempting demo login...", demoCreds);
                            const res = await axios.post(`${API_BASE_URL}/auth/login`, demoCreds, { timeout: 5000 });
                            const authData = res.data;
                            let user = authData;
                            if (authData.access_token) {
                                localStorage.setItem('fitai_token', authData.access_token);
                                user = authData.user;
                            }
                            console.log("DEBUG: Demo login success:", user);
                            localStorage.setItem('fitai_user', JSON.stringify(user));
                            onLogin(user);
                            navigate('/');
                        } catch (err) {
                            console.error("DEBUG: Demo login error:", err);
                            const detail = err.response?.data?.detail || err.message;
                            setError(`Demo Login Failed: ${detail}`);
                        } finally {
                            setLoading(false);
                        }
                    }}
                    className="w-full bg-[#1b2333] border border-white/10 hover:border-[#256af4]/40 hover:bg-[#1b2333]/80 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    disabled={loading}
                >
                    <span className="material-symbols-outlined text-neon-blue text-base">bolt</span>
                    Try Demo Account
                </button>

                <p className="text-center text-xs text-slate-600 mt-8">
                    By continuing you agree to our{' '}
                    <span className="text-[#256af4] cursor-pointer hover:underline">Terms</span>
                    {' & '}
                    <span className="text-[#256af4] cursor-pointer hover:underline">Privacy Policy</span>
                </p>
            </div>
        </div>
    );
};

export default Login;
