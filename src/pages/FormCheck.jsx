import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';
import MuscleMap from '../components/MuscleMap';
import { initDetector, detectPose, getSquatFormFeedback } from '../services/PoseDetection';

const FormCheck = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const workoutId = searchParams.get('id');
    const [seconds, setSeconds] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [cameraMode, setCameraMode] = useState('user');
    const [showSettings, setShowSettings] = useState(false);
    const [neuralView, setNeuralView] = useState(false);

    // Pose Detection State
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [workout, setWorkout] = useState(null);
    const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
    const [feedback, setFeedback] = useState({ status: 'SCANNING', message: 'Initializing AI...', color: 'text-slate-400' });
    const [poseDetected, setPoseDetected] = useState(false);
    const [reps, setReps] = useState(0);
    const [heartRateEnabled, setHeartRateEnabled] = useState(true);

    // Lab Settings Integration
    const [labSettings, setLabSettings] = useState(null);
    useEffect(() => {
        const saved = localStorage.getItem('fitai_lab_settings');
        if (saved) setLabSettings(JSON.parse(saved));
    }, []);

    // Rep Counting Logic
    const [formState, setFormState] = useState('UP'); // 'UP' or 'DOWN'

    useEffect(() => {
        if (feedback.status === 'OPTIMAL' && formState === 'UP') {
            setFormState('DOWN');
        } else if (feedback.status === 'HIGH' && formState === 'DOWN') {
            setFormState('UP');
            setReps(prev => prev + 1);
        }
    }, [feedback, formState]);

    useEffect(() => {
        let interval = null;
        if (!isPaused) {
            interval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPaused]);

    useEffect(() => {
        const fetchWorkout = async () => {
            if (!workoutId) return;
            try {
                const res = await axios.get(`${API_BASE_URL}/trainer/workout/${workoutId}`);
                setWorkout(res.data);
            } catch (err) {
                console.error("Failed to fetch workout", err);
            }
        };
        fetchWorkout();
    }, [workoutId]);

    // Setup Video and Pose Detection
    useEffect(() => {
        let stream = null;
        let animationFrame = null;

        const startCamera = async () => {
            if (!cameraEnabled) return;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: cameraMode }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play();
                        startDetection();
                    };
                }
            } catch (err) {
                console.error("Camera access denied", err);
                setFeedback({ status: 'ERROR', message: 'Camera access required', color: 'text-neon-red' });
            }
        };

        const startDetection = async () => {
            await initDetector();
            const detect = async () => {
                if (videoRef.current && !isPaused && cameraEnabled) {
                    const pose = await detectPose(videoRef.current);
                    if (pose) {
                        setPoseDetected(true);
                        const fb = getSquatFormFeedback(pose);
                        setFeedback(fb);
                    } else {
                        setPoseDetected(false);
                        setFeedback({ status: 'SCANNING', message: 'Syncing AI Vision...', color: 'text-slate-400' });
                    }
                }
                if (cameraEnabled) {
                    animationFrame = requestAnimationFrame(detect);
                }
            };
            detect();
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [isPaused, cameraEnabled, cameraMode]);

    const [showMuscleMap, setShowMuscleMap] = useState(true);

    const toggleCameraMode = () => {
        setCameraMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    const handleComplete = async () => {
        if (!workoutId) {
            navigate('/');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/trainer/complete`, {
                workout_id: parseInt(workoutId)
            });
            navigate('/');
        } catch (err) {
            console.error("Failed to complete workout", err);
            navigate('/');
        }
    };

    const formatTime = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const renderMedia = (url, name) => {
        if (!url) {
            url = "https://www.youtube.com/watch?v=gcNh17Ckjgg";
        }

        const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
        const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');

        if (isYoutube) {
            const videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
            return (
                <iframe
                    className="h-full w-full border-0"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={name}
                ></iframe>
            );
        }

        if (isVideo) {
            return (
                <video
                    className="h-full w-full object-cover"
                    src={url}
                    autoPlay
                    loop
                    muted
                    playsInline
                />
            );
        }

        // Default to Image/GIF
        return (
            <img
                src={url}
                alt={name}
                className="h-full w-full object-cover opacity-80"
                onError={(e) => {
                    e.target.src = "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/31a97d100994191.5f154db23999e.gif";
                }}
            />
        );
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-background-dark border-x border-slate-800/50 pb-40">
            {/* Top Navigation Overlay */}
            <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 bg-gradient-to-b from-background-dark/80 to-transparent">
                <button onClick={() => navigate(-1)} className="flex items-center justify-center rounded-full size-10 bg-slate-900/40 backdrop-blur-md border border-slate-700/50 text-slate-100 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined">arrow_back_ios_new</span>
                </button>
                <div className="flex flex-col items-center">
                    <h2 className="text-white text-lg font-bold leading-tight tracking-tight uppercase">Live Session</h2>
                    <div className="flex items-center gap-2">
                        {!isPaused && <span className="size-2 rounded-full bg-neon-red animate-pulse"></span>}
                        <span className={`text-xs font-bold tracking-widest uppercase ${isPaused ? 'text-slate-500' : 'text-neon-red'}`}>
                            {isPaused ? 'Paused' : formatTime(seconds)}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCameraEnabled(!cameraEnabled)}
                        className={`flex items-center justify-center rounded-full size-10 backdrop-blur-md border border-slate-700/50 text-slate-100 transition-all active:scale-95 ${cameraEnabled ? 'bg-slate-900/40' : 'bg-neon-red/20 border-neon-red/50 text-neon-red'}`}
                        title={cameraEnabled ? "Disable Lens" : "Enable Lens"}
                    >
                        <span className="material-symbols-outlined">
                            {cameraEnabled ? 'videocam' : 'videocam_off'}
                        </span>
                    </button>
                    <button
                        onClick={() => {
                            setNeuralView(!neuralView);
                            if (!neuralView) {
                                // Refresh lab settings on toggle
                                const saved = localStorage.getItem('fitai_lab_settings');
                                if (saved) setLabSettings(JSON.parse(saved));
                            }
                        }}
                        className={`flex items-center justify-center rounded-full size-10 backdrop-blur-md border border-slate-700/50 text-slate-100 transition-all active:scale-95 ${neuralView ? 'bg-primary shadow-[0_0_15px_rgba(37,106,244,0.6)]' : 'bg-slate-900/40'}`}
                        title="Toggle Neural View"
                    >
                        <span className="material-symbols-outlined">visibility</span>
                    </button>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`flex items-center justify-center rounded-full size-10 backdrop-blur-md border border-slate-700/50 text-slate-100 transition-all active:scale-95 ${showSettings ? 'bg-primary' : 'bg-slate-900/40'}`}
                    >
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                </div>
            </div>

            {/* Settings Menu Overlay */}
            {showSettings && (
                <div className="absolute top-20 right-6 left-6 z-[60] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-4 duration-200">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Session Settings</p>
                    <div className="space-y-3">
                        <button
                            onClick={() => { setCameraEnabled(!cameraEnabled); setShowSettings(false); }}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
                        >
                            <span className="text-sm font-bold text-white">Camera Tracking</span>
                            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${cameraEnabled ? 'bg-primary' : 'bg-slate-700'}`}>
                                <div className={`size-4 bg-white rounded-full transition-transform ${cameraEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                        </button>
                        <button
                            onClick={() => setShowMuscleMap(!showMuscleMap)}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
                        >
                            <span className="text-sm font-bold text-white">Anatomical Overlay</span>
                            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${showMuscleMap ? 'bg-[#0bda5e]' : 'bg-slate-700'}`}>
                                <div className={`size-4 bg-white rounded-full transition-transform ${showMuscleMap ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Top View Section: Side-by-Side Instructional and Live */}
            <div className="flex h-[300px] w-full bg-black border-b border-white/5 mt-20 shrink-0">
                {/* Side 1: Instructional Video/GIF */}
                <div className="relative flex-1 bg-slate-900 overflow-hidden border-r border-white/10">
                    {renderMedia(workout?.exercises?.[currentExerciseIdx]?.video_url, workout?.exercises?.[currentExerciseIdx]?.name)}
                    {workout?.exercises?.[currentExerciseIdx] && (
                        <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded text-[8px] font-bold text-white uppercase tracking-widest border border-white/10 z-10">
                            Guide: {workout.exercises[currentExerciseIdx].name}
                        </div>
                    )}
                </div>

                {/* Side 2: Live Camera Feed */}
                <div className="relative flex-1 bg-black overflow-hidden">
                    {cameraEnabled ? (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="h-full w-full object-cover grayscale-[20%] brightness-75 mirror-mode"
                            style={{ transform: cameraMode === 'user' ? 'scaleX(-1)' : 'none' }}
                        />
                    ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center bg-slate-950">
                            <span className="material-symbols-outlined text-4xl text-slate-800 mb-2 animate-pulse">videocam_off</span>
                            <p className="text-[8px] text-slate-500 font-bold tracking-widest uppercase">Paused</p>
                        </div>
                    )}
                    <div className={`absolute bottom-3 right-3 px-2 py-1 rounded text-[8px] font-bold text-white uppercase tracking-widest border transition-all duration-500 ${neuralView ? 'bg-primary border-primary shadow-[0_0_10px_rgba(37,106,244,0.5)]' : 'bg-primary/60 border-primary/20'}`}>
                        {neuralView ? `NEURAL FEED / ${labSettings?.gear?.toUpperCase() || 'DEFAULT'}` : 'Live Feed'}
                    </div>
                    {neuralView && (
                        <div className="absolute inset-0 pointer-events-none z-10">
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary/20 animate-scan"></div>
                            <div className="absolute inset-0 bg-primary/5 mix-blend-overlay"></div>
                            {labSettings?.env && (
                                <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded border border-white/10 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[10px] text-primary">landscape</span>
                                    <span className="text-[8px] text-slate-300 font-black uppercase tracking-widest">{labSettings.env}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Guidance Overlay */}
            <div className="px-6 py-4 -mt-6 relative z-20 shrink-0">
                <div className="bg-primary/20 backdrop-blur-xl border border-primary/30 rounded-2xl p-4 flex items-center gap-4 shadow-[0_0_20px_rgba(37,106,244,0.2)]">
                    <div className="size-12 shrink-0 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 animate-pulse">
                        <span className="material-symbols-outlined text-3xl">smart_toy</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-primary text-[10px] font-extrabold uppercase tracking-[0.2em] mb-0.5">FitAI Feedback</p>
                        <p className={`text-base font-bold leading-tight ${feedback.color}`}>{feedback.message}</p>
                    </div>
                </div>
            </div>

            {/* Metrics Section */}
            <div className="flex-1 px-6 space-y-4 overflow-y-auto pb-64 no-scrollbar mt-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Reps</span>
                            <span className="material-symbols-outlined text-primary text-sm">rebase_edit</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-white text-3xl font-bold">{reps}</span>
                            <span className="text-slate-500 text-sm">/15</span>
                        </div>
                        <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(reps / 15) * 100}%` }}></div>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Target</span>
                            <span className="material-symbols-outlined text-neon-green text-sm">track_changes</span>
                        </div>
                        <p className="text-white text-sm font-bold truncate">{workout?.exercises?.[currentExerciseIdx]?.name || "Loading..."}</p>
                        <p className="text-slate-500 text-[10px] uppercase font-bold mt-1">Set 1 of 3</p>
                    </div>
                </div>

                <button
                    onClick={() => setReps(r => r + 1)}
                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all active:scale-95 text-sm uppercase tracking-widest border border-white/5 mb-8"
                >
                    Log Rep Manually
                </button>
            </div>

            {/* Bottom Controls */}
            <div className="fixed bottom-24 left-0 right-0 max-w-[430px] mx-auto px-6 py-4 bg-gradient-to-t from-background-dark via-background-dark/95 to-transparent z-40">
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsPaused(!isPaused)}
                        className="flex-1 flex items-center justify-center rounded-2xl h-14 bg-slate-800 text-white font-bold border border-white/10 gap-2 transition-transform active:scale-95"
                    >
                        <span className="material-symbols-outlined">{isPaused ? 'play_arrow' : 'pause'}</span>
                        {isPaused ? 'RESUME' : 'PAUSE'}
                    </button>
                    <button
                        onClick={handleComplete}
                        disabled={loading}
                        className="flex-[1.5] bg-[#0bda5e] text-black font-black h-14 rounded-2xl transition-transform active:scale-95 flex justify-center items-center gap-2 shadow-lg shadow-[#0bda5e]/20"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-4 border-black/30 border-t-black rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">check_circle</span>
                                FINISH
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FormCheck;
