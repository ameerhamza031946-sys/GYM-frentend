import React from 'react';

const Favorites = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-black italic uppercase tracking-tighter mb-6">Saved Workouts</h1>
            <div className="flex flex-col items-center justify-center py-20 bg-slate-950/50 rounded-[3rem] border border-white/5 border-dashed">
                <div className="size-20 rounded-full bg-slate-900 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-slate-700 text-4xl">favorite</span>
                </div>
                <p className="font-black text-slate-600 uppercase tracking-widest text-xs">No Favorites Yet</p>
                <p className="text-slate-500 text-sm mt-2 text-center max-w-[200px]">
                    Tap the heart icon on any session to save it for later.
                </p>
                <button className="mt-8 bg-primary/10 text-primary border border-primary/20 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                    EXPLORE SESSIONS
                </button>
            </div>
        </div>
    );
};

export default Favorites;
