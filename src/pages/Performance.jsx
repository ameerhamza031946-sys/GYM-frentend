import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';
import MuscleMap from '../components/MuscleMap';

const Performance = () => {
    const [metrics, setMetrics] = useState(null);
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('analytics');
    // Load Lab Settings from Local Storage
    const savedLab = JSON.parse(localStorage.getItem('fitai_lab_settings') || '{}');
    const [selectedGear, setSelectedGear] = useState(savedLab.gear || 'Pro Compression');
    const [selectedEnv, setSelectedEnv] = useState(savedLab.env || 'Titan Gym');
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [refinementIntensity, setRefinementIntensity] = useState(savedLab.intensity || 84);
    const [textureDetail, setTextureDetail] = useState(savedLab.texture || 92);
    const [referenceContinuity, setReferenceContinuity] = useState(savedLab.continuity || 100);
    const [identityAnchor, setIdentityAnchor] = useState(savedLab.anchor ?? true);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const labSettings = {
            gear: selectedGear,
            env: selectedEnv,
            intensity: refinementIntensity,
            texture: textureDetail,
            continuity: referenceContinuity,
            anchor: identityAnchor
        };
        localStorage.setItem('fitai_lab_settings', JSON.stringify(labSettings));
    }, [selectedGear, selectedEnv, refinementIntensity, textureDetail, referenceContinuity, identityAnchor]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const savedUser = JSON.parse(localStorage.getItem('fitai_user') || '{}');
                const userId = savedUser.id || 1;
                const [metricsRes, alertRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/risk/metrics/${userId}`),
                    axios.get(`${API_BASE_URL}/risk/alerts/${userId}`)
                ]);
                setMetrics(metricsRes.data);
                if (alertRes.data.has_warning) setAlert(alertRes.data);
            } catch (err) {
                console.error("Failed to load performance data", err);
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
            {/* Tabs */}
            <div className="px-4 pt-4 border-b border-slate-200 dark:border-slate-800 relative z-10 bg-background-dark/80 backdrop-blur-md">
                <div className="flex gap-8 overflow-x-auto no-scrollbar">
                    {['analytics', 'history', 'insights', 'lab'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-[11px] font-black tracking-[0.2em] border-b-2 transition-all uppercase whitespace-nowrap ${activeTab === tab
                                ? 'border-primary text-primary drop-shadow-[0_0_8px_rgba(37,106,244,0.5)]'
                                : 'border-transparent text-slate-500'
                                }`}
                        >
                            {tab === 'lab' ? 'Vision Lab' : tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* ─── ANALYTICS TAB ─── */}
            {activeTab === 'analytics' && (
                <>
                    {/* Performance Section */}
                    <div className="px-5 py-8 space-y-6">
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Biometric Velocity</p>
                            </div>
                            <div className="flex items-baseline gap-3">
                                <p className="text-5xl font-black italic tracking-tighter">{metrics?.strength || 0}%</p>
                                <span className="bg-[#0bda5e]/10 text-[#0bda5e] text-[10px] font-black px-3 py-1 rounded-xl border border-[#0bda5e]/20 tracking-widest uppercase">
                                    +12% TREND
                                </span>
                            </div>
                        </div>

                        {/* Custom Graph */}
                        <div className="relative w-full h-56 bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2rem] overflow-hidden p-6 border border-white/5 shadow-2xl mx-[-1px] group">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,106,244,0.05),transparent)] pointer-events-none"></div>
                            <svg className="absolute inset-x-0 bottom-0 w-full h-[140px]" preserveAspectRatio="none" viewBox="0 0 400 150">
                                <defs>
                                    <linearGradient id="chartGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                                        <stop offset="0%" stopColor="#256af4" stopOpacity="0.4"></stop>
                                        <stop offset="100%" stopColor="#256af4" stopOpacity="0"></stop>
                                    </linearGradient>
                                </defs>
                                <g className="opacity-10 group-hover:opacity-20 transition-opacity duration-700">
                                    <line stroke="white" strokeWidth="0.5" x1="0" x2="400" y1="30" y2="30"></line>
                                    <line stroke="white" strokeWidth="0.5" x1="0" x2="400" y1="75" y2="75"></line>
                                    <line stroke="white" strokeWidth="0.5" x1="0" x2="400" y1="120" y2="120"></line>
                                </g>
                                <path className="animate-pulse-slow" d="M0 120 Q 50 110, 80 40 T 150 60 T 220 30 T 300 80 T 400 20 V 150 H 0 Z" fill="url(#chartGradient)"></path>
                                <path d="M0 120 Q 50 110, 80 40 T 150 60 T 220 30 T 300 80 T 400 20" fill="none" stroke="#256af4" strokeLinecap="round" strokeWidth="4" className="filter drop-shadow-[0_0_8px_rgba(37,106,244,0.5)]"></path>
                            </svg>
                            <div className="absolute bottom-4 left-6 right-6 flex justify-between z-10">
                                <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">Feb 01</span>
                                <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">Feb 15</span>
                                <span className="text-[10px] font-black text-primary tracking-widest uppercase">Live</span>
                            </div>
                        </div>
                    </div>

                    {/* Injury Risk Section */}
                    <div className="px-5 py-8 bg-slate-900/40 backdrop-blur-xl border-y border-white/5">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black italic tracking-tighter uppercase">Biometric Hub</h3>
                            <div className="h-[2px] w-12 bg-primary/20"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-950/80 p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <span className="material-symbols-outlined text-6xl">verified_user</span>
                                </div>
                                <div className="relative size-32">
                                    <svg className="size-full transform -rotate-90">
                                        <circle className="text-slate-900" cx="64" cy="64" fill="transparent" r="56" stroke="currentColor" strokeWidth="10"></circle>
                                        <circle
                                            className="text-primary"
                                            cx="64" cy="64" fill="transparent" r="56"
                                            stroke="currentColor"
                                            strokeDasharray={`${3.518 * (metrics?.recovery || 0)} 351.8`}
                                            strokeDashoffset="0"
                                            strokeLinecap="round"
                                            strokeWidth="10"
                                            style={{ filter: "drop-shadow(0 0 10px rgba(37,106,244,0.4))" }}
                                        ></circle>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-black italic tracking-tighter">{metrics?.recovery || 0}%</span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest mt-1 ${(metrics?.recovery || 0) > 50 ? 'text-[#0bda5e]' : 'text-neon-amber'}`}>
                                            READY
                                        </span>
                                    </div>
                                </div>
                                <p className="mt-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Readiness Index</p>
                            </div>

                            <div className="space-y-3">
                                {alert ? (
                                    <div className="bg-neon-amber/10 border border-neon-amber/20 p-3 rounded-lg flex items-center gap-3">
                                        <span className="material-symbols-outlined text-neon-amber text-lg">warning</span>
                                        <div>
                                            <p className="text-xs font-bold">Recovery Alert</p>
                                            <p className="text-[10px] text-slate-500">Low CNS readiness</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg flex items-center gap-3">
                                        <span className="material-symbols-outlined text-[#0bda5e] text-lg">check_circle</span>
                                        <div>
                                            <p className="text-xs font-bold">All Clear</p>
                                            <p className="text-[10px] text-slate-500">Good recovery state</p>
                                        </div>
                                    </div>
                                )}
                                <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                                    <div>
                                        <p className="text-xs font-bold">Lower Back</p>
                                        <p className="text-[10px] text-slate-500">Optimal mobility</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Recovery Recommendation */}
                    <div className="p-4 space-y-4 pb-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">FitAI Recommendations</h3>
                        </div>
                        <div className="bg-primary p-4 rounded-2xl text-white relative overflow-hidden mx-[-1px]">
                            <div className="relative z-10 flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 bg-white/20 w-fit px-2 py-0.5 rounded-full mb-1">
                                        <span className="material-symbols-outlined text-xs">auto_awesome</span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider">
                                            {alert ? 'Priority Recovery' : 'Keep Pushing'}
                                        </span>
                                    </div>
                                    <h4 className="text-xl font-bold leading-tight">
                                        {alert ? 'Active Recovery: 15min Yoga Flow' : "Strength Training: You're in top form!"}
                                    </h4>
                                    <p className="text-white/80 text-xs font-medium max-w-[180px]">
                                        {alert ? 'Targeting knee mobility and hamstring flexibility.' : 'Maintain consistency for peak performance.'}
                                    </p>
                                    <button
                                        onClick={() => navigate('/workouts')}
                                        className="mt-4 bg-white text-primary px-4 py-2 rounded-lg font-bold text-sm shadow-xl active:scale-95 transition-transform"
                                    >
                                        {alert ? 'Start Recovery' : 'View Plan'}
                                    </button>
                                </div>
                                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 shrink-0">
                                    <span className="material-symbols-outlined text-5xl">{alert ? 'self_improvement' : 'fitness_center'}</span>
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                        </div>
                    </div>
                </>
            )}

            {/* ─── HISTORY TAB ─── */}
            {activeTab === 'history' && (
                <div className="p-5 space-y-4 pb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black italic tracking-tighter uppercase text-white/90">Session Archives</h3>
                        <span className="text-[10px] font-black text-primary tracking-widest">FILTER: ALL</span>
                    </div>
                    {metrics?.weekly_progress?.length > 0 ? (
                        metrics.weekly_progress.map((prog, idx) => (
                            <div key={idx} className="flex items-center gap-5 bg-slate-900/40 p-5 rounded-[2rem] border border-white/5 hover:bg-slate-900/60 transition-all group">
                                <div className="size-14 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                                    <span className="material-symbols-outlined text-primary text-2xl font-bold">fitness_center</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-black tracking-tight text-white/90">{prog.title}</p>
                                    <p className="text-[11px] font-bold text-slate-500 mt-0.5">{prog.time} • <span className="text-slate-400 font-black">{prog.metric}</span></p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-neon-green font-black italic text-sm">{prog.trend}</span>
                                    <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Velocity</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-24 bg-slate-950/50 rounded-[3rem] border border-white/5 border-dashed">
                            <span className="material-symbols-outlined text-6xl text-slate-800 mb-4 block">history_toggle_off</span>
                            <p className="font-black text-slate-600 uppercase tracking-widest text-xs">No Data Streams Detected</p>
                        </div>
                    )}
                </div>
            )}

            {/* ─── INSIGHTS TAB ─── */}
            {activeTab === 'insights' && (
                <div className="p-5 space-y-6 pb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black italic tracking-tighter uppercase text-white/90">AI Cognitive Core</h3>
                    </div>

                    {/* Strength card */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2rem] border border-white/10 p-7 shadow-2xl relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <span className="material-symbols-outlined text-7xl">military_tech</span>
                        </div>
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="size-12 rounded-xl bg-primary/20 border border-primary/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-xl font-bold">fitness_center</span>
                            </div>
                            <div>
                                <p className="text-sm font-black text-white italic tracking-tight uppercase">Strength Matrix</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Neuromuscular Logic</p>
                            </div>
                            <span className="ml-auto text-3xl font-black italic text-primary tracking-tighter">{metrics?.strength || 0}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-800/50 rounded-full overflow-hidden relative z-10">
                            <div className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,106,244,0.5)]" style={{ width: `${metrics?.strength || 0}%` }}></div>
                        </div>
                    </div>

                    {/* Stamina card */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2rem] border border-white/10 p-7 shadow-2xl relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <span className="material-symbols-outlined text-7xl">bolt</span>
                        </div>
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="size-12 rounded-xl bg-[#0bda5e]/20 border border-[#0bda5e]/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[#0bda5e] text-xl font-bold">lightning_bolt</span>
                            </div>
                            <div>
                                <p className="text-sm font-black text-white italic tracking-tight uppercase">Metabolic Engine</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Endurance Capacity</p>
                            </div>
                            <span className="ml-auto text-3xl font-black italic text-[#0bda5e] tracking-tighter">{metrics?.stamina || 0}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-800/50 rounded-full overflow-hidden relative z-10">
                            <div className="h-full bg-[#0bda5e] rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(11,218,94,0.3)]" style={{ width: `${metrics?.stamina || 0}%` }}></div>
                        </div>
                    </div>

                    {/* Recovery card */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2rem] border border-white/10 p-7 shadow-2xl relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <span className="material-symbols-outlined text-7xl">spa</span>
                        </div>
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="size-12 rounded-xl bg-neon-amber/20 border border-neon-amber/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-neon-amber text-xl font-bold">bedtime</span>
                            </div>
                            <div>
                                <p className="text-sm font-black text-white italic tracking-tight uppercase">System Restoration</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">CNS Readiness</p>
                            </div>
                            <span className="ml-auto text-3xl font-black italic text-neon-amber tracking-tighter">{metrics?.recovery || 0}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-800/50 rounded-full overflow-hidden relative z-10">
                            <div className="h-full bg-neon-amber rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,183,0,0.3)]" style={{ width: `${metrics?.recovery || 0}%` }}></div>
                        </div>
                        {alert && (
                            <div className="mt-6 p-4 bg-neon-amber/10 border border-neon-amber/20 rounded-2xl relative z-10 flex items-start gap-3">
                                <span className="material-symbols-outlined text-neon-amber text-sm font-bold mt-0.5">warning</span>
                                <p className="text-[11px] font-bold text-neon-amber/90 leading-relaxed uppercase tracking-tight">ADVISORY: {alert.message}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ─── VISION LAB TAB ─── */}
            {activeTab === 'lab' && (
                <div className="p-5 space-y-6 pb-20">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-black italic tracking-tighter uppercase text-white/90">FitAI Vision Lab</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setIsSynthesizing(true);
                                    setToast('Neural layers synthesized!');
                                    setTimeout(() => setIsSynthesizing(false), 2000);
                                    setTimeout(() => setToast(null), 3500);
                                }}
                                className="bg-primary px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-[0_0_15px_rgba(37,106,244,0.4)] active:scale-95 transition-all hover:brightness-110"
                            >
                                {isSynthesizing ? 'Synthesizing...' : 'Apply All'}
                            </button>
                        </div>
                    </div>

                    {/* Synthesis Result Preview */}
                    <div className="relative h-64 bg-slate-950 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl group">
                        <img
                            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800"
                            className={`w-full h-full object-cover transition-all duration-700 ${isSynthesizing ? 'blur-md grayscale brightness-50 scale-105' : 'brightness-75'}`}
                            alt="Reference"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                        {/* Synthesis HUD Overlay */}
                        <div className="absolute inset-x-6 bottom-6 flex justify-between items-end z-20">
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-primary mb-1">Target Persona</p>
                                <p className="text-sm font-black uppercase tracking-tight text-white mb-2">{selectedGear} <span className="text-slate-500 mx-1">/</span> {selectedEnv}</p>
                                <div className="flex gap-2">
                                    <span className="size-1 rounded-full bg-neon-green animate-pulse"></span>
                                    <span className="size-1 rounded-full bg-neon-green/40"></span>
                                    <span className="size-1 rounded-full bg-neon-green/20"></span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black italic text-primary uppercase leading-none">Reference</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Continuity: {referenceContinuity}%</p>
                            </div>
                        </div>

                        {/* Loading/Synthesis Overlay */}
                        {isSynthesizing && (
                            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-primary/10 backdrop-blur-sm">
                                <div className="absolute top-0 left-0 w-full h-1 bg-primary/40 animate-scan"></div>
                                <div className="relative size-20">
                                    <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping"></div>
                                    <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-3xl font-black">bolt</span>
                                    </div>
                                </div>
                                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-white animate-pulse">Syncing Neural Layers</p>
                            </div>
                        )}

                        <div className="absolute top-4 right-4 text-[9px] font-black text-white/20 uppercase tracking-[0.3em] rotate-90 origin-right">Ref: Alpha_PR7</div>
                    </div>

                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed mb-6 px-2">
                        Simulating advanced neural parameters. Profiles are applied to your Live Form analysis and Progress Photos.
                    </p>

                    {/* Body Reshaping Slider */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-6 space-y-6">
                        <div className="flex justify-between items-center px-2">
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-300">Body Adjustment</h4>
                                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">Refining Joint Trajectories</p>
                            </div>
                            <span className="text-primary font-black italic text-[10px] uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Precision Active</span>
                        </div>

                        <div className="bg-slate-950/50 rounded-[2rem] p-8 border border-white/5 relative group">
                            <div className="absolute inset-0 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #256af4 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                            <MuscleMap
                                highlightedMuscles={metrics?.focus_joints || ['shoulder_l', 'shoulder_r']}
                                onMuscleClick={(id) => alert(`Calibrating Neural Node: ${id}`)}
                                size="large"
                            />
                        </div>

                        <div className="space-y-4 px-2">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span>Refinement Intensity</span>
                                <span className="text-primary">{refinementIntensity}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={refinementIntensity}
                                onChange={(e) => setRefinementIntensity(parseInt(e.target.value))}
                                className="w-full accent-primary h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Smart Swap Toggle */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-6 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 mb-4">Smart Swap (Garment Synthesis)</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {['Pro Compression', 'Aero Mesh', 'Thermal Shield', 'Neural Layer'].map(gear => (
                                <button
                                    key={gear}
                                    onClick={() => setSelectedGear(gear)}
                                    className={`p-3 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedGear === gear ? 'bg-primary/20 border-primary text-white shadow-[0_0_10px_rgba(37,106,244,0.3)]' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/30'}`}
                                >
                                    {gear}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Background Synthesis */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-6 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 mb-4">Background Synthesis (Environment)</h4>
                        <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                            {[
                                { name: 'Titan Gym', icon: 'fitness_center' },
                                { name: 'Cyber Neon', icon: 'bolt' },
                                { name: 'Peak Alt', icon: 'landscape' },
                                { name: 'Zen Flow', icon: 'spa' }
                            ].map(env => (
                                <div key={env.name} onClick={() => setSelectedEnv(env.name)} className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group">
                                    <div className={`size-16 rounded-2xl border flex items-center justify-center transition-all ${selectedEnv === env.name ? 'bg-primary/20 border-primary shadow-[0_0_10px_rgba(37,106,244,0.3)]' : 'bg-white/5 border-white/10 group-hover:border-white/30'}`}>
                                        <span className={`material-symbols-outlined ${selectedEnv === env.name ? 'text-primary' : 'text-slate-500'}`}>{env.icon}</span>
                                    </div>
                                    <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${selectedEnv === env.name ? 'text-primary' : 'text-slate-500'}`}>{env.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Advanced Refinement Parameters */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-6 space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-300">Advanced Neural Parameters</h4>

                        <div className="space-y-6">
                            <div className="space-y-3 px-1">
                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400">Texture Detail Retention</span>
                                    <span className="text-primary">{textureDetail}%</span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={textureDetail}
                                        onChange={(e) => setTextureDetail(parseInt(e.target.value))}
                                        className="w-full accent-primary h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 size-1 bg-primary/40 rounded-full"></div>
                                    <div className="absolute top-1/2 -right-1 -translate-y-1/2 size-1 bg-primary/40 rounded-full"></div>
                                </div>
                            </div>

                            <div className="space-y-3 px-1">
                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400">Reference Continuity (Facial)</span>
                                    <span className={`text-primary tracking-tighter shadow-[0_0_10px_var(--color-primary)] ${identityAnchor ? 'opacity-50' : ''}`}>
                                        {referenceContinuity}%
                                    </span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        disabled={identityAnchor}
                                        value={referenceContinuity}
                                        onChange={(e) => setReferenceContinuity(parseInt(e.target.value))}
                                        className={`w-full accent-primary h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer ${identityAnchor ? 'cursor-not-allowed opacity-30 grayscale' : ''}`}
                                    />
                                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 size-1 bg-primary/40 rounded-full"></div>
                                    <div className="absolute top-1/2 -right-1 -translate-y-1/2 size-1 bg-primary/40 rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <div
                                onClick={() => setIdentityAnchor(!identityAnchor)}
                                className={`flex items-center gap-3 p-3 border rounded-2xl cursor-pointer transition-all ${identityAnchor ? 'bg-primary/10 border-primary/30' : 'bg-slate-950/40 border-white/5 opacity-60'}`}
                            >
                                <span className={`material-symbols-outlined text-sm ${identityAnchor ? 'text-primary animate-pulse' : 'text-slate-500'}`}>
                                    {identityAnchor ? 'enhanced_encryption' : 'no_encryption'}
                                </span>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed select-none">
                                    <span className={identityAnchor ? 'text-white' : 'text-slate-500'}>Identity Anchor {identityAnchor ? 'Active' : 'Disabled'}</span>:
                                    {identityAnchor
                                        ? " Reference Continuity locked to ensure biometric data integrity."
                                        : " Security protocols bypassed. Manual continuity adjustments enabled."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast feedback */}
            {toast && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] px-8 py-3 rounded-full shadow-[0_10px_30px_rgba(37,106,244,0.4)] animate-in fade-in zoom-in duration-300">
                    {toast}
                </div>
            )}
        </>
    );
};

export default Performance;
