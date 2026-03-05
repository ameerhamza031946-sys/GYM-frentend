import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';

const NOTIFICATIONS = [
    {
        id: 1,
        icon: 'warning',
        iconColor: 'text-neon-amber',
        bgColor: 'bg-neon-amber/10',
        title: 'Recovery Warning',
        body: 'Your CNS readiness is at 34%. Reduce workout intensity today.',
        time: 'Just now',
        unread: true,
    },
    {
        id: 2,
        icon: 'fitness_center',
        iconColor: 'text-primary',
        bgColor: 'bg-primary/10',
        title: 'Workout Ready',
        body: 'Your AI-generated session is ready. Low Intensity Routine.',
        time: '5 min ago',
        unread: true,
    },
    {
        id: 3,
        icon: 'restaurant',
        iconColor: 'text-[#0bda5e]',
        bgColor: 'bg-[#0bda5e]/10',
        title: 'Nutrition Tip',
        body: 'You are 35g short of your daily protein goal. Try adding salmon.',
        time: '1 hr ago',
        unread: false,
    },
    {
        id: 4,
        icon: 'insights',
        iconColor: 'text-primary',
        bgColor: 'bg-primary/10',
        title: 'Weekly Progress',
        body: 'Strength score up +12% this month. Keep it up!',
        time: 'Yesterday',
        unread: false,
    },
];

const SEARCH_ITEMS = [
    { label: 'FitAI Dashboard', icon: 'bolt', path: '/' },
    { label: 'Workouts / Form Check', icon: 'fitness_center', path: '/workouts' },
    { label: 'AI Nutritionist', icon: 'restaurant', path: '/nutrition' },
    { label: 'Performance Insights', icon: 'insights', path: '/insights' },
    { label: 'Start Workout', icon: 'play_circle', path: '/workout/active' },
];

const Layout = ({ user, onLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchOpen, setSearchOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [currentWorkout, setCurrentWorkout] = useState(null);
    const searchInputRef = useRef(null);

    const unreadCount = notifications.filter(n => n.unread).length;

    const isActive = (path) => location.pathname === path ? 'text-primary' : 'text-slate-500';
    const isFilled = (path) => location.pathname === path ? 'fill-1' : '';

    const filteredItems = SEARCH_ITEMS.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase())
    );

    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })));

    // Auto-focus search input when opened
    useEffect(() => {
        if (searchOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 50);
        } else {
            setQuery('');
        }
    }, [searchOpen]);

    // Close all panels on route change
    useEffect(() => {
        setSearchOpen(false);
        setNotifOpen(false);
        setProfileOpen(false);
    }, [location.pathname]);

    // Fetch dynamic data
    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;
            try {
                const [alertRes, workoutRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/risk/alerts/${user.id}`),
                    axios.get(`${API_BASE_URL}/trainer/today/${user.id}`)
                ]);

                setCurrentWorkout(workoutRes.data);

                if (alertRes.data.has_warning) {
                    setNotifications([{
                        id: 'biometric-alert',
                        icon: 'warning',
                        iconColor: 'text-neon-amber',
                        bgColor: 'bg-neon-amber/10',
                        title: 'Biometric Advisory',
                        body: alertRes.data.message,
                        time: 'Just now',
                        unread: true
                    }]);
                } else {
                    // Fallback or static welcome notifs if desired
                    setNotifications(NOTIFICATIONS.slice(1));
                }
            } catch (err) {
                console.error("Layout data fetch error:", err);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [user.id]);

    return (
        <div className="bg-[#101622] text-slate-100 min-h-screen flex flex-col" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

            {/* ── Header ── */}
            <header className="sticky top-0 z-50 px-4 py-4 flex items-center justify-between border-b border-white/5" style={{ background: 'rgba(27,35,51,0.7)', backdropFilter: 'blur(12px)' }}>
                <div className="flex items-center gap-3 relative">
                    {/* Clickable avatar */}
                    <button
                        onClick={() => { setProfileOpen(o => !o); setSearchOpen(false); setNotifOpen(false); }}
                        className="size-10 rounded-full bg-[#256af4]/20 flex items-center justify-center border border-[#256af4]/30 hover:ring-2 hover:ring-[#256af4]/50 transition-all shrink-0"
                    >
                        <span className="material-symbols-outlined text-[#256af4] text-xl">person</span>
                    </button>

                    {/* Profile dropdown */}
                    {profileOpen && (
                        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)}>
                            <div className="absolute top-[73px] left-4 w-64 bg-[#1b2333] border border-white/10 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                                <div className="px-4 py-4 border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-[#256af4]/20 flex items-center justify-center border border-[#256af4]/30">
                                            <span className="material-symbols-outlined text-[#256af4]">person</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{user?.name || 'Athlete'}</p>
                                            <p className="text-[11px] text-slate-400 truncate">{user?.email || ''}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="py-2">
                                    <div className="px-4 py-2 flex items-center gap-3 text-xs text-slate-400">
                                        <span className="material-symbols-outlined text-[#0bda5e] text-base">verified</span>
                                        Elite Status Member
                                    </div>
                                    <button
                                        onClick={() => { setProfileOpen(false); onLogout(); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-red-400 transition-colors text-sm font-bold"
                                    >
                                        <span className="material-symbols-outlined text-base">logout</span>
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <h1 className="text-xl font-bold leading-none tracking-tight">FitAI</h1>
                        <p className="text-[10px] uppercase tracking-widest text-[#256af4] font-bold">Hackathon Prototype v1.0</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Search Button */}
                    <button
                        onClick={() => { setSearchOpen(o => !o); setNotifOpen(false); }}
                        className={`p-2 rounded-full transition-colors ${searchOpen ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-slate-400'}`}
                    >
                        <span className="material-symbols-outlined">search</span>
                    </button>
                    {/* Notifications Button */}
                    <button
                        onClick={() => { setNotifOpen(o => !o); setSearchOpen(false); }}
                        className={`p-2 rounded-full transition-colors relative ${notifOpen ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-slate-400'}`}
                    >
                        <span className="material-symbols-outlined">notifications</span>
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 size-4 bg-[#256af4] rounded-full text-[9px] font-bold flex items-center justify-center text-white">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* ── Search Dropdown ── */}
            {searchOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setSearchOpen(false)}>
                    <div
                        className="absolute top-[73px] left-4 right-4 bg-[#1b2333] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Input */}
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                            <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search workouts, diet, insights…"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                            />
                            {query && (
                                <button onClick={() => setQuery('')}>
                                    <span className="material-symbols-outlined text-slate-500 text-lg">close</span>
                                </button>
                            )}
                        </div>
                        {/* Results */}
                        <div className="py-2">
                            {filteredItems.length === 0 ? (
                                <p className="text-center text-slate-500 text-sm py-4">No results found</p>
                            ) : (
                                filteredItems.map(item => (
                                    <button
                                        key={item.path}
                                        onClick={() => { navigate(item.path); setSearchOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left transition-colors"
                                    >
                                        <div className="size-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-primary text-base">{item.icon}</span>
                                        </div>
                                        <span className="text-sm font-medium text-slate-200">{item.label}</span>
                                        <span className="material-symbols-outlined text-slate-600 text-base ml-auto">arrow_forward_ios</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Notifications Dropdown ── */}
            {notifOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)}>
                    <div
                        className="absolute top-[73px] left-4 right-4 bg-[#1b2333] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                            <span className="font-bold text-sm">Notifications</span>
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} className="text-primary text-xs font-bold hover:underline">
                                    Mark all read
                                </button>
                            )}
                        </div>
                        {/* List */}
                        <div className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto">
                            {notifications.map(n => (
                                <div
                                    key={n.id}
                                    className={`flex items-start gap-3 px-4 py-3 transition-colors ${n.unread ? 'bg-white/5' : 'hover:bg-white/3'}`}
                                >
                                    <div className={`size-9 shrink-0 rounded-xl ${n.bgColor} flex items-center justify-center mt-0.5`}>
                                        <span className={`material-symbols-outlined text-base ${n.iconColor}`}>{n.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-bold truncate">{n.title}</p>
                                            {n.unread && <span className="size-2 rounded-full bg-primary shrink-0"></span>}
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{n.body}</p>
                                        <p className="text-[10px] text-slate-600 mt-1">{n.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-28">
                <Outlet />
            </main>

            {/* ── Bottom Navigation ── */}
            <nav className="fixed bottom-0 left-0 right-0 border-t border-white/5 px-6 pb-6 pt-3 flex justify-between items-center z-50" style={{ background: 'rgba(27,35,51,0.9)', backdropFilter: 'blur(12px)' }}>
                <Link to="/" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/')}`}>
                    <span className={`material-symbols-outlined ${isFilled('/')}`}>bolt</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Coach</span>
                </Link>
                <Link to="/workouts" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/workouts')}`}>
                    <span className={`material-symbols-outlined ${isFilled('/workouts')}`}>fitness_center</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Workouts</span>
                </Link>

                {/* Floating Add Button */}
                <div className="relative -mt-10">
                    <Link
                        to={currentWorkout ? `/workout/active?id=${currentWorkout.id}` : "/workouts"}
                        className="bg-[#256af4] size-14 rounded-full shadow-[0_0_20px_rgba(37,106,244,0.5)] flex items-center justify-center border-4 border-[#101622]"
                    >
                        <span className="material-symbols-outlined text-white text-3xl">{currentWorkout ? 'play_arrow' : 'add'}</span>
                    </Link>
                </div>

                <Link to="/insights" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/insights')}`}>
                    <span className={`material-symbols-outlined ${isFilled('/insights')}`}>insights</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Insights</span>
                </Link>
                <Link to="/nutrition" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/nutrition')}`}>
                    <span className={`material-symbols-outlined ${isFilled('/nutrition')}`}>restaurant</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Diet</span>
                </Link>
            </nav>
        </div>
    );
};

export default Layout;
