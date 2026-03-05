import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';
import MuscleMap from '../components/MuscleMap';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [workout, setWorkout] = useState(null);
    const [stats, setStats] = useState({ strength: 85, stamina: 62, recovery: 34 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const savedUser = JSON.parse(localStorage.getItem('fitai_user') || '{}');
                const userId = savedUser.id || 1;

                const [workoutRes, statsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/trainer/today/${userId}`),
                    axios.get(`${API_BASE_URL}/risk/metrics/${userId}`)
                ]);

                setWorkout(workoutRes.data);
                setStats(statsRes.data);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <>
            {/* Daily Recommendation Section */}
            <section className="px-4 pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold tracking-tight">Generated for You</h2>
                    <span className="text-xs font-medium text-slate-500">Updated just now</span>
                </div>

                <div className="relative group overflow-hidden rounded-[2rem] bg-slate-900 shadow-2xl transition-all border border-white/10 mx-[-1px] hover:border-primary/50 duration-500">
                    <div
                        className="h-56 w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f18] via-[#0a0f18]/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-neon-green animate-pulse"></span>
                                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-neon-green">FitAI Recommended</span>
                            </div>
                            <h3 className="text-3xl font-black text-white italic tracking-tighter">
                                {workout?.focus ? workout.focus.toUpperCase() : "REST & RECOVER"}
                            </h3>

                            <div className="flex items-center gap-5 mt-2">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                                    <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                                    {workout?.duration_mins || 20} MIN
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                                    <span className="material-symbols-outlined text-sm text-neon-red">local_fire_department</span>
                                    {workout?.calories || 150} KCAL
                                </div>
                            </div>
                        </div>

                        {workout && !workout.completed ? (
                            <Link to={`/workout/active?id=${workout.id}`} className="mt-6 w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-primary/20 uppercase tracking-widest text-sm">
                                <span className="material-symbols-outlined font-bold">play_arrow</span>
                                Start Session
                            </Link>
                        ) : (
                            <div className="mt-6 w-full bg-[#0bda5e]/10 text-[#0bda5e] border border-[#0bda5e]/20 font-black py-4 rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                                <span className="material-symbols-outlined font-bold">check_circle</span>
                                Completed
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* AI Insights & Muscle Focus Group */}
            <section className="px-4 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Muscle Map Card */}
                    <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-6 border border-white/5 shadow-xl relative overflow-hidden group">
                        <div className="absolute -right-10 -top-10 size-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-500"></div>
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <div>
                                <h3 className="font-extrabold text-lg tracking-tight">Focus Target</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Anatomical Analysis</p>
                            </div>
                            <button onClick={() => navigate('/equipment')} className="bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-colors">
                                <span className="material-symbols-outlined text-primary">tune</span>
                            </button>
                        </div>
                        <div className="flex justify-center mb-4">
                            <MuscleMap
                                highlightedMuscles={(() => {
                                    const saved = JSON.parse(localStorage.getItem('fitai_user') || '{}');
                                    const focus = saved.targeted_muscle_groups?.[0] || 'full_body';
                                    const mapping = {
                                        'full_body': ['chest', 'back', 'quads'],
                                        'upper_body': ['chest', 'shoulders', 'triceps'],
                                        'lower_body': ['quads', 'hamstrings', 'glutes'],
                                        'core': ['abs']
                                    };
                                    return mapping[focus] || mapping['full_body'];
                                })()}
                                size="small"
                            />
                        </div>
                        <div className="mt-6 flex justify-between items-center relative z-10">
                            <span className="text-[11px] font-bold text-slate-400">
                                {(() => {
                                    const saved = JSON.parse(localStorage.getItem('fitai_user') || '{}');
                                    const focus = saved.targeted_muscle_groups?.[0] || 'full_body';
                                    return focus.replace('_', ' ').toUpperCase();
                                })()} • Focused
                            </span>
                            <button onClick={() => navigate('/mobility-test')} className="bg-primary/15 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all">
                                TEST MOBILITY
                            </button>
                        </div>
                    </div>

                    {/* FitAI Assistant Card */}
                    <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-[2rem] p-7 border border-white/10 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-8xl">smart_toy</span>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                                </div>
                                <h3 className="font-black text-lg italic tracking-tight">Fit<span className="text-primary">AI</span> Assistant</h3>
                            </div>
                            <p className="text-sm text-slate-300 font-medium leading-relaxed mb-8">
                                {(() => {
                                    const saved = JSON.parse(localStorage.getItem('fitai_user') || '{}');
                                    const goal = saved.fitness_goal || 'fitness';
                                    const equip = saved.equipment_preference === 'bodyweight' ? 'bodyweight routine' : 'equipment-based plan';
                                    const context = goal === 'lose_weight' ? 'fat-burning' : (goal === 'build_muscle' ? 'hypertrophy' : 'optimized');
                                    return `"I've synchronized your ${context} ${equip}. Since your recovery is at 34%, I've adjusted today's intensity to keep you on track without overtraining."`;
                                })()}
                            </p>
                        </div>

                        <div className="space-y-3 relative z-10">
                            <div className="flex items-center gap-3 p-3.5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                                <div className="size-8 rounded-full bg-neon-amber/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-neon-amber text-sm">warning</span>
                                </div>
                                <span className="text-[11px] font-bold text-slate-300 tracking-tight">Low CNS Readiness Detected</span>
                            </div>
                            <div className="flex items-center gap-3 p-3.5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                                <div className="size-8 rounded-full bg-neon-green/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-neon-green text-sm">check_circle</span>
                                </div>
                                <span className="text-[11px] font-bold text-slate-300 tracking-tight">Equipment Synced: Resistance Mode</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Performance Gauges */}
            <section className="px-4 mt-10">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-black tracking-tight uppercase">Biometric Hub</h3>
                    <div className="h-[2px] flex-1 bg-white/5 mx-4"></div>
                </div>
                <div className="grid grid-cols-3 gap-5">
                    {/* Strength */}
                    <div className="bg-slate-900/50 rounded-3xl p-5 flex flex-col items-center justify-center border border-white/5 mx-[-1px] group hover:border-primary/30 transition-colors">
                        <div className="relative size-20 flex items-center justify-center">
                            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                <path className="stroke-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="2.5"></path>
                                <path className="stroke-primary shadow-glow" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray={`${stats.strength}, 100`} strokeLinecap="round" strokeWidth="2.5"></path>
                            </svg>
                            <span className="absolute text-sm font-black text-white">{stats.strength}%</span>
                        </div>
                        <p className="mt-3 text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">Strength</p>
                    </div>

                    {/* Stamina */}
                    <div className="bg-slate-900/50 rounded-3xl p-5 flex flex-col items-center justify-center border border-white/5 mx-[-1px] group hover:border-[#0bda5e]/30 transition-colors">
                        <div className="relative size-20 flex items-center justify-center">
                            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                <path className="stroke-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="2.5"></path>
                                <path className="stroke-[#0bda5e]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray={`${stats.stamina}, 100`} strokeLinecap="round" strokeWidth="2.5"></path>
                            </svg>
                            <span className="absolute text-sm font-black text-white">{stats.stamina}%</span>
                        </div>
                        <p className="mt-3 text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">Stamina</p>
                    </div>

                    {/* Recovery */}
                    <div className="bg-slate-900/50 rounded-3xl p-5 flex flex-col items-center justify-center border border-white/5 mx-[-1px] group hover:border-neon-amber/30 transition-colors">
                        <div className="relative size-20 flex items-center justify-center">
                            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                <path className="stroke-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="2.5"></path>
                                <path className="stroke-neon-amber" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray={`${stats.recovery}, 100`} strokeLinecap="round" strokeWidth="2.5"></path>
                            </svg>
                            <span className="absolute text-sm font-black text-white">{stats.recovery}%</span>
                        </div>
                        <p className="mt-3 text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">Recovery</p>
                    </div>
                </div>
            </section>

            {/* Weekly Activity Feed */}
            <section className="px-4 mt-10 pb-12">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-black tracking-tight uppercase">FitAI Activity Feed</h3>
                    <button className="text-[10px] font-black tracking-widest text-primary">VIEW ALL</button>
                </div>
                <div className="space-y-4">
                    {[
                        { title: 'SQUAT SESSION', time: 'Yesterday', metric: '120kg Max', trend: '+5%', icon: 'fitness_center', color: 'text-primary' },
                        { title: 'CARDIO BLAST', time: '2 days ago', metric: '5.2km', trend: '+2%', icon: 'bolt', color: 'text-[#0bda5e]' }
                    ].map((prog, idx) => (
                        <div key={idx} className="bg-slate-900/40 p-5 rounded-[1.5rem] flex items-center justify-between border border-white/5 mx-[-1px] hover:bg-slate-900/60 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                    <span className={`material-symbols-outlined ${prog.color}`}>{prog.icon}</span>
                                </div>
                                <div className="flex flex-col">
                                    <p className="font-extrabold text-xs tracking-wider">{prog.title}</p>
                                    <p className="text-[10px] font-bold text-slate-500 mt-0.5">{prog.time} • <span className="text-slate-400">{prog.metric}</span></p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-neon-green font-black text-xs">{prog.trend}</span>
                                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">Progress</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
};

export default Dashboard;
