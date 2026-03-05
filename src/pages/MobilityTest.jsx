import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';

const MobilityTest = () => {
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSaveResult = async (val) => {
        setLoading(true);
        try {
            const savedUser = JSON.parse(localStorage.getItem('fitai_user') || '{}');
            const userId = savedUser.id || 1;
            await axios.put(`${API_BASE_URL}/users/${userId}`, {
                mobility_test_results: { hip_adduction: val, date: new Date().toISOString() }
            });
            setResult(val);
            setTimeout(() => navigate('/equipment'), 1500);
        } catch (error) {
            console.error("Error saving mobility result:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-dark text-white p-6 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-[-10%] left-[20%] w-[100%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

            <header className="flex items-center justify-between mb-8 relative z-10">
                <button onClick={() => navigate(-1)} className="flex items-center justify-center rounded-full size-10 bg-slate-900/40 backdrop-blur-md border border-slate-700/50 text-slate-100 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined">arrow_back_ios_new</span>
                </button>
                <h1 className="text-xl font-bold tracking-tighter uppercase italic">Fit<span className="text-primary">AI</span> <span className="text-slate-500 font-normal not-italic">Bios</span></h1>
                <div className="size-10"></div>
            </header>

            <div className="relative z-10 bg-slate-900/30 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 shadow-2xl overflow-hidden">
                {/* Visual Guide Header */}
                <div className="flex justify-center mb-8">
                    <div className="bg-primary/10 border border-primary/20 text-primary px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                        Kinetic Analysis Mode
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="flex flex-col items-center">
                        <div className="relative size-32 rounded-full p-1 bg-gradient-to-tr from-primary to-transparent mb-4">
                            <div className="size-full bg-slate-900 rounded-full overflow-hidden border-2 border-slate-900">
                                <img src="https://images.unsplash.com/photo-1552526849-6bb6293306db?q=80&w=300&auto=format&fit=crop" alt="High mobility" className="object-cover w-full h-full grayscale-[40%] brightness-90 hover:grayscale-0 transition-all duration-500" />
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase text-center leading-tight">Optimal Range</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="relative size-32 rounded-full p-1 bg-gradient-to-tr from-slate-700 to-transparent mb-4">
                            <div className="size-full bg-slate-900 rounded-full overflow-hidden border-2 border-slate-900">
                                <img src="https://images.unsplash.com/photo-1574680094855-40ad36bc2939?q=80&w=300&auto=format&fit=crop" alt="Low mobility" className="object-cover w-full h-full grayscale-[40%] brightness-75 transition-all duration-500" />
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase text-center leading-tight">Limited Range</p>
                    </div>
                </div>

                <div className="text-center mb-10">
                    <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-2 font-display">Bio-Test 01</p>
                    <h2 className="font-black text-2xl uppercase tracking-tight text-white italic">Hip Adduction</h2>
                </div>

                <div className="bg-white/5 rounded-3xl p-6 border border-white/5 mb-10">
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">
                        Sit on the floor, press your heels together, and let gravity pull your knees down. Measure the distance between your <span className="text-white font-bold">heels and groin.</span>
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => handleSaveResult('greater')}
                        className={`group relative h-16 rounded-2xl border transition-all duration-300 overflow-hidden
                            ${result === 'greater' ? 'border-primary bg-primary/20 shadow-[0_0_20px_rgba(37,106,244,0.3)]' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                    >
                        <span className={`relative z-10 font-black uppercase tracking-widest text-xs ${result === 'greater' ? 'text-white' : 'text-slate-500'}`}>Greater</span>
                        {result === 'greater' && <div className="absolute inset-0 bg-primary/20 animate-pulse"></div>}
                    </button>
                    <button
                        onClick={() => handleSaveResult('less')}
                        className={`group relative h-16 rounded-2xl border transition-all duration-300 overflow-hidden
                            ${result === 'less' ? 'border-primary bg-primary/20 shadow-[0_0_20px_rgba(37,106,244,0.3)]' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                    >
                        <span className={`relative z-10 font-black uppercase tracking-widest text-xs ${result === 'less' ? 'text-white' : 'text-slate-500'}`}>Less</span>
                        {result === 'less' && <div className="absolute inset-0 bg-primary/20 animate-pulse"></div>}
                    </button>
                </div>
            </div>

            <div className="mt-8 px-4 flex flex-col items-center gap-6">
                {loading && (
                    <div className="flex items-center gap-3">
                        <div className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Syncing Bio-Data...</span>
                    </div>
                )}

                {result && !loading && (
                    <div className="bg-[#0bda5e]/10 border border-[#0bda5e]/20 text-[#0bda5e] px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                        Analysis Complete. Calibrating Plan.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MobilityTest;
