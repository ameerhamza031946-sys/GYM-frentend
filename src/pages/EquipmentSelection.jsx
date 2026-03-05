import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';

const EquipmentSelection = () => {
    const navigate = useNavigate();
    const [selection, setSelection] = useState('gym');
    const [selectedTools, setSelectedTools] = useState([]);
    const [loading, setLoading] = useState(false);

    const equipments = [
        { id: 'gym', label: 'Gym', icon: 'fitness_center', color: 'bg-blue-600' },
        { id: 'home', label: 'Home', icon: 'home', color: 'bg-orange-400' }
    ];

    const resistanceTools = [
        { id: 'barbells', name: 'Barbells', icon: 'line_weight' },
        { id: 'bench', name: 'Bench', icon: 'living' },
        { id: 'cables', name: 'Cables and Pulleys', icon: 'settings_input_component' },
        { id: 'dumbbells', name: 'Dumbbells', icon: 'exercise' },
        { id: 'glute_ham', name: 'Glute Ham Bench', icon: 'chair_alt' },
        { id: 'rings', name: 'Gymnastic Rings', icon: 'panorama_fish_eye' },
        { id: 'kettlebells', name: 'Kettlebells', icon: 'shopping_bag' },
        { id: 'machines', name: 'Machines', icon: 'vibration' }
    ];

    const toggleTool = (toolId) => {
        setSelectedTools(prev =>
            prev.includes(toolId)
                ? prev.filter(id => id !== toolId)
                : [...prev, toolId]
        );
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const savedUser = JSON.parse(localStorage.getItem('fitai_user') || '{}');
            const userId = savedUser.id || 1;
            await axios.put(`${API_BASE_URL}/users/${userId}`, {
                equipment_preference: selection,
                available_equipment: selectedTools
            });

            localStorage.setItem('fitai_user', JSON.stringify({
                ...savedUser,
                equipment_preference: selection,
                available_equipment: selectedTools
            }));

            navigate('/dashboard');
        } catch (error) {
            console.error("Error saving equipment preference:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-dark text-white p-6 pb-40 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-[-10%] left-[-20%] w-[100%] h-[50%] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-20%] w-[100%] h-[50%] bg-neon-red/5 blur-[120px] rounded-full pointer-events-none"></div>

            <header className="flex items-center justify-between mb-8 relative z-10">
                <button onClick={() => navigate(-1)} className="flex items-center justify-center rounded-full size-10 bg-slate-900/40 backdrop-blur-md border border-slate-700/50 text-slate-100 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined">arrow_back_ios_new</span>
                </button>
                <h1 className="text-xl font-bold tracking-tighter uppercase italic">Fit<span className="text-primary">AI</span> <span className="text-slate-500 font-normal not-italic">Gear</span></h1>
                <div className="size-10"></div> {/* Spacer */}
            </header>

            <div className="relative z-10 mb-8">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Training Environment</p>
                <div className="grid grid-cols-2 gap-4">
                    {equipments.map(eq => (
                        <button
                            key={eq.id}
                            onClick={() => setSelection(eq.id)}
                            className={`relative p-6 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all duration-300 border overflow-hidden group
                                ${selection === eq.id
                                    ? 'border-primary/50 bg-primary/10 shadow-[0_0_30px_rgba(37,106,244,0.15)] scale-[1.02]'
                                    : 'border-slate-800/50 bg-slate-900/30 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 hover:bg-slate-900/50'}`}
                        >
                            <div className={`size-16 rounded-2xl flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 duration-500
                                ${selection === eq.id ? (eq.id === 'gym' ? 'bg-primary' : 'bg-neon-red') : 'bg-slate-800'}`}>
                                <span className="material-symbols-outlined text-3xl text-white">{eq.icon}</span>
                            </div>
                            <span className={`font-black uppercase tracking-widest text-xs ${selection === eq.id ? 'text-white' : 'text-slate-500'}`}>{eq.label}</span>

                            {selection === eq.id && (
                                <div className="absolute top-2 right-2">
                                    <div className="size-2 rounded-full bg-white animate-pulse"></div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative z-10 mb-6 pb-20">
                <div className="flex items-center justify-between mb-4 px-1">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Available Resistance</p>
                    <span className="text-[10px] font-bold text-primary">SCANNING...</span>
                </div>
                <div className="space-y-3">
                    {resistanceTools.map((tool, idx) => (
                        <div key={idx} className={`group flex items-center justify-between p-4 bg-slate-900/20 backdrop-blur-md rounded-2xl border transition-all ${selectedTools.includes(tool.id) ? 'border-primary/50 bg-primary/5' : 'border-white/5 hover:border-primary/30 hover:bg-primary/5'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`size-10 rounded-xl flex items-center justify-center border transition-all ${selectedTools.includes(tool.id) ? 'bg-primary/20 border-primary/30' : 'bg-slate-800/50 border-white/5 group-hover:bg-primary/20 group-hover:border-primary/30'}`}>
                                    <span className={`material-symbols-outlined transition-colors ${selectedTools.includes(tool.id) ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`}>{tool.icon}</span>
                                </div>
                                <span className="text-sm font-bold text-slate-100 tracking-tight">{tool.name}</span>
                            </div>
                            <button
                                onClick={() => toggleTool(tool.id)}
                                className={`text-[9px] font-black uppercase tracking-widest border rounded-full px-4 py-1.5 transition-all ${selectedTools.includes(tool.id) ? 'bg-primary text-white border-primary' : 'text-slate-500 border-slate-700/50 hover:bg-white/5 hover:text-white'}`}>
                                {selectedTools.includes(tool.id) ? 'Added' : 'Configure'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="fixed bottom-24 left-0 right-0 p-6 bg-gradient-to-t from-background-dark via-background-dark/90 to-transparent z-50">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full h-16 rounded-full bg-primary text-white font-black uppercase tracking-[0.2em] shadow-[0_10px_40px_rgba(37,106,244,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    {loading ? (
                        <div className="size-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <span>Calibrate Plan</span>
                            <span className="material-symbols-outlined text-xl">bolt</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default EquipmentSelection;
