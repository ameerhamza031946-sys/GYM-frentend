import React from 'react';

const Profile = ({ user }) => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-black italic uppercase tracking-tighter mb-6">User Profile</h1>
            <div className="bg-slate-900/40 rounded-3xl p-6 border border-white/5 space-y-4">
                <div className="flex items-center gap-4">
                    <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                        <span className="material-symbols-outlined text-primary text-4xl">person</span>
                    </div>
                    <div>
                        <p className="text-xl font-bold text-white">{user?.name || 'Athlete'}</p>
                        <p className="text-sm text-slate-500">{user?.email || 'No email provided'}</p>
                    </div>
                </div>
                <div className="pt-4 border-t border-white/5 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Subscription Status</p>
                    <div className="flex items-center gap-2 text-neon-green">
                        <span className="material-symbols-outlined text-sm">verified</span>
                        <span className="text-sm font-bold">FitAI Elite (Active)</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 px-1">Settings</h3>
                <button className="w-full bg-slate-900/40 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400">notifications</span>
                        <span className="text-sm font-medium">Notification Preferences</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-600">chevron_right</span>
                </button>
                <button className="w-full bg-slate-900/40 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400">security</span>
                        <span className="text-sm font-medium">Privacy & Security</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-600">chevron_right</span>
                </button>
            </div>
        </div>
    );
};

export default Profile;
