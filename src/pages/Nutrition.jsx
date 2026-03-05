import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL, USER_ID } from '../api/config';

const Nutrition = () => {
    const [summary, setSummary] = useState(null);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loggedMeals, setLoggedMeals] = useState({});
    const [toastMsg, setToastMsg] = useState(null);
    const chatEndRef = useRef(null);
    const toastTimer = useRef(null);

    const fetchData = useCallback(async () => {
        try {
            const savedUser = JSON.parse(localStorage.getItem('fitai_user') || '{}');
            const userId = savedUser.id || 1;
            const res = await axios.get(`${API_BASE_URL}/nutrition/summary/${userId}`);
            setSummary(res.data);
        } catch (err) {
            console.error("Failed to fetch nutrition summary:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleLogMeal = useCallback(async (meal, idx) => {
        if (loggedMeals[idx] || loading) return;

        try {
            const savedUser = JSON.parse(localStorage.getItem('fitai_user') || '{}');
            const userId = savedUser.id || 1;

            await axios.post(`${API_BASE_URL}/nutrition/log`, {
                user_id: userId,
                name: meal.name,
                calories: meal.calories,
                protein: Math.round(meal.calories * 0.25 / 4), // Estimating macros if not provided
                carbs: Math.round(meal.calories * 0.45 / 4),
                fats: Math.round(meal.calories * 0.30 / 9)
            });

            setLoggedMeals(prev => ({ ...prev, [idx]: true }));
            clearTimeout(toastTimer.current);
            setToastMsg(`✓ ${meal.name} logged!`);
            toastTimer.current = setTimeout(() => setToastMsg(null), 2500);

            // Refresh summary to update progress bars
            fetchData();
        } catch (err) {
            console.error("Failed to log meal:", err);
            setToastMsg("✕ Error logging meal");
            toastTimer.current = setTimeout(() => setToastMsg(null), 2500);
        }
    }, [loggedMeals, loading, fetchData]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const sendMessage = async () => {
        if (!message.trim() || chatLoading) return;
        const userMsg = message.trim();
        setMessage('');
        setChatHistory(h => [...h, { role: 'user', text: userMsg }]);
        setChatLoading(true);
        try {
            const savedUser = JSON.parse(localStorage.getItem('fitai_user') || '{}');
            const userId = savedUser.id || 1;
            const res = await axios.post(`${API_BASE_URL}/nutrition/chat`, { user_id: userId, message: userMsg });
            setChatHistory(h => [...h, { role: 'ai', text: res.data.reply }]);
        } catch {
            setChatHistory(h => [...h, { role: 'ai', text: 'Sorry, unable to reach the AI nutritionist right now. Please try again.' }]);
        } finally {
            setChatLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') sendMessage();
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const protein = summary?.macros?.protein || {};
    const carbs = summary?.macros?.carbs || {};
    const fats = summary?.macros?.fats || {};

    return (
        <div className="min-h-screen bg-background-dark text-white relative overflow-hidden flex flex-col">
            {/* Background Accents */}
            <div className="absolute top-[-10%] right-[-20%] w-[100%] h-[50%] bg-[#0bda5e]/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="flex flex-col mb-6 pt-6 px-6 relative z-10">
                <h1 className="text-2xl font-black leading-tight tracking-tighter uppercase italic">Fit<span className="text-primary">AI</span> <span className="text-slate-500 font-normal not-italic">Diet</span></h1>
                <div className="flex items-center gap-2 mt-1">
                    <span className="size-1.5 rounded-full bg-[#0bda5e] shadow-[0_0_8px_#0bda5e]"></span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Meta-Nutrient Optimizer v1.0</span>
                </div>
            </div>

            <div className="px-6 relative z-10">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Daily Bio-Fuel Status</h2>
                    <span className="text-xs font-bold text-slate-100">{summary?.calories?.current || 0} / <span className="text-primary">{summary?.calories?.target || 0}</span> <span className="text-[10px] text-slate-500 font-normal uppercase">Kcal</span></span>
                </div>
                <div className="flex flex-wrap gap-3 mb-8">
                    {[
                        { label: 'Protein', current: protein.current, target: protein.target, color: 'bg-primary', glowColor: 'shadow-[0_0_15px_rgba(37,106,244,0.4)]' },
                        { label: 'Carbs', current: carbs.current, target: carbs.target, color: 'bg-[#fa6238]', glowColor: 'shadow-[0_0_15px_rgba(250,98,56,0.3)]' },
                        { label: 'Fats', current: fats.current, target: fats.target, color: 'bg-[#0bda5e]', glowColor: 'shadow-[0_0_15px_rgba(11,218,94,0.3)]' },
                    ].map(macro => (
                        <div key={macro.label} className="flex min-w-[100px] flex-1 flex-col gap-2 rounded-2xl p-4 bg-slate-900/40 backdrop-blur-xl border border-white/5 transition-transform hover:scale-[1.02]">
                            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">{macro.label}</p>
                            <p className="text-xl font-bold flex items-baseline gap-1">
                                <span>{macro.current}</span>
                                <span className="text-[10px] text-slate-500 font-normal">g</span>
                            </p>
                            <div className="w-full bg-white/5 h-1 rounded-full mt-1 overflow-hidden">
                                <div
                                    className={`${macro.color} h-full rounded-full ${macro.glowColor} transition-all duration-1000`}
                                    style={{ width: `${Math.min(100, Math.round((macro.current / macro.target) * 100))}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Meal Recommendations */}
            <div className="px-6 py-2 mb-64 relative z-10 flex-1 overflow-y-auto">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Neural Recommendations</h2>
                    <button onClick={fetchData} className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-xs">refresh</span>
                        <span>Re-Sync</span>
                    </button>
                </div>

                <div className="space-y-4">
                    {summary?.recommendations?.map((meal, idx) => (
                        <div key={idx} className="group relative rounded-[28px] overflow-hidden border border-white/5 bg-slate-900/20 backdrop-blur-xl hover:border-primary/30 transition-all duration-300">
                            <div className="p-5 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="size-1.5 rounded-full bg-primary animate-pulse"></div>
                                            <p className="text-primary text-[9px] font-black uppercase tracking-[0.2em]">{idx === 0 ? 'Optimal Selection' : 'Secondary Fuel'}</p>
                                        </div>
                                        <h3 className="text-lg font-bold leading-tight text-white group-hover:text-primary transition-colors">{meal.name}</h3>
                                    </div>
                                    <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-white/5 text-right">
                                        <p className="font-bold text-sm text-white">{meal.calories}</p>
                                        <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest">Kcal</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleLogMeal(meal, idx)}
                                    className={`w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 ${loggedMeals[idx]
                                        ? 'bg-[#0bda5e]/20 text-[#0bda5e] border border-[#0bda5e]/30 cursor-default'
                                        : 'bg-white text-background-dark hover:bg-primary hover:text-white shadow-lg'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-sm">{loggedMeals[idx] ? 'check_circle' : 'add_task'}</span>
                                    {loggedMeals[idx] ? 'Verified ✓' : 'Add to Log'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chat History */}
                {chatHistory.length > 0 && (
                    <div className="mt-8 space-y-4 px-1">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 text-center mb-6">Encrypted Comms Channel</p>
                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm leading-relaxed border shadow-2xl transition-all hover:scale-[1.01] ${msg.role === 'user'
                                    ? 'bg-primary border-white/10 text-white rounded-tr-none'
                                    : 'bg-slate-800/80 backdrop-blur-md border-white/5 text-slate-200 rounded-tl-none shadow-black/40'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {chatLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-800/50 backdrop-blur-md px-5 py-4 rounded-2xl rounded-tl-none flex gap-1.5 border border-white/5">
                                    <div className="size-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="size-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="size-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                )}
            </div>

            {/* Toast notification */}
            {toastMsg && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-[#0bda5e] text-background-dark font-black text-[10px] uppercase tracking-[0.2em] px-6 py-2.5 rounded-full shadow-[0_10px_30px_rgba(11,218,94,0.3)] animate-in fade-in zoom-in duration-300">
                    {toastMsg}
                </div>
            )}

            {/* AI Chat Interface Floating */}
            <div className="fixed bottom-24 left-6 right-6 z-50">
                <div className="rounded-3xl p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-primary/20 bg-slate-900/80 backdrop-blur-2xl">
                    <div className="flex items-center gap-3 mb-1 px-4 pt-2">
                        <div className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(37,106,244,0.6)] animate-pulse"></div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">FitAI Neural Interface</p>
                    </div>
                    <div className="relative p-1">
                        <input
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-5 pr-14 text-sm placeholder-slate-600 text-white outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                            placeholder="Consult Neural Nutritionist..."
                            type="text"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={chatLoading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={chatLoading || !message.trim()}
                            className="absolute right-2.5 top-2.5 size-11 bg-primary rounded-xl flex items-center justify-center text-white hover:bg-primary/80 transition-all shadow-lg active:scale-95 disabled:opacity-30"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Nutrition;
