import React from 'react';

const MuscleMap = ({ highlightedMuscles = [], onMuscleClick, size = "large" }) => {
    // Muscle groups mapping to SVG paths/shapes
    // For simplicity in this demo, we'll use a stylized icon-based representation
    // in a real app, this would be a full SVG anatomical map

    const muscleGroups = [
        { id: 'chest', label: 'Chest', pos: 'top-[30%] left-[40%]' },
        { id: 'abs', label: 'Abs', pos: 'top-[45%] left-[45%]' },
        { id: 'shoulders', label: 'Shoulders', pos: 'top-[28%] left-[30%]' },
        { id: 'biceps', label: 'Biceps', pos: 'top-[35%] left-[25%]' },
        { id: 'triceps', label: 'Triceps', pos: 'top-[35%] left-[70%]' },
        { id: 'quads', label: 'Quads', pos: 'top-[65%] left-[40%]' },
        { id: 'hamstrings', label: 'Hamstrings', pos: 'top-[65%] left-[60%]' },
        { id: 'glutes', label: 'Glutes', pos: 'top-[55%] left-[50%]' },
        { id: 'back', label: 'Back', pos: 'top-[40%] left-[55%]' },
    ];

    const joints = [
        { id: 'shoulder_l', pos: 'top-[28%] left-[32%]' },
        { id: 'shoulder_r', pos: 'top-[28%] left-[62%]' },
        { id: 'elbow_l', pos: 'top-[42%] left-[25%]' },
        { id: 'elbow_r', pos: 'top-[42%] left-[75%]' },
        { id: 'hip_l', pos: 'top-[52%] left-[38%]' },
        { id: 'hip_r', pos: 'top-[52%] left-[62%]' },
        { id: 'knee_l', pos: 'top-[72%] left-[35%]' },
        { id: 'knee_r', pos: 'top-[72%] left-[65%]' },
    ];

    return (
        <div className={`relative ${size === 'large' ? 'h-96 w-64' : 'h-48 w-32'} mx-auto overflow-hidden`}>
            {/* Base Body Outlines */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <span className="material-symbols-outlined text-[300px] text-slate-500 flex justify-center mt-[-40px]">
                    accessibility_new
                </span>
            </div>

            {/* Muscle Overlays */}
            {muscleGroups.map(muscle => {
                const isActive = highlightedMuscles.includes(muscle.id);
                return (
                    <button
                        key={muscle.id}
                        onClick={() => onMuscleClick && onMuscleClick(muscle.id)}
                        className={`absolute ${muscle.pos} rounded-full transition-all duration-300 flex items-center justify-center p-2
                            ${isActive
                                ? 'bg-neon-red shadow-[0_0_15px_rgba(255,82,82,0.6)] scale-110 z-10'
                                : 'bg-slate-700/50 hover:bg-slate-600'
                            }`}
                        title={muscle.label}
                    >
                        <div className={`size-2 rounded-full ${isActive ? 'bg-white' : 'bg-slate-400'}`}></div>
                    </button>
                );
            })}

            {/* Joint Nodes */}
            {size === 'large' && joints.map(joint => {
                const isSelected = highlightedMuscles.includes(joint.id);
                return (
                    <button
                        key={joint.id}
                        onClick={() => onMuscleClick && onMuscleClick(joint.id)}
                        className={`absolute ${joint.pos} size-4 rounded-full border-2 transition-all duration-300 z-20 flex items-center justify-center
                            ${isSelected
                                ? 'bg-primary border-white shadow-[0_0_10px_rgba(37,106,244,0.8)] scale-125'
                                : 'bg-background-dark/80 border-slate-500 hover:border-primary'
                            }`}
                    >
                        <div className={`size-1 rounded-full ${isSelected ? 'bg-white' : 'bg-slate-500'}`}></div>
                    </button>
                );
            })}

            {/* Visual labels for major groups */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 flex-wrap">
                {highlightedMuscles.slice(0, 3).map(m => (
                    <span key={m} className="text-[8px] font-bold uppercase tracking-tighter bg-neon-red/20 text-neon-red px-2 py-0.5 rounded border border-neon-red/30">
                        {m}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default MuscleMap;
