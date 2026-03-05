import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL, USER_ID } from '../api/config';

const steps = [
    {
        id: 'goal',
        title: 'What is your primary fitness goal?',
        subtitle: "We'll tailor your plan to help you achieve this.",
        options: [
            { id: 'lose_weight', label: 'Lose Weight', icon: 'weight', image: '/lose_weight_option_1772471015745.png' },
            { id: 'build_muscle', label: 'Build Muscle', icon: 'fitness_center', image: '/build_muscle_option_1772471440865.png' },
            { id: 'flexibility', label: 'Improve Flexibility', icon: 'accessibility_new', image: '/flexibility_option_1772471513634.png' },
            { id: 'endurance', label: 'Boost Endurance', icon: 'speed', image: '/endurance_option_1772471596038.png' }
        ]
    },
    {
        id: 'gender',
        title: 'What is your gender?',
        options: [
            { id: 'male', label: 'Male', icon: 'man', image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=600' },
            { id: 'female', label: 'Female', icon: 'woman', image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=600' },
            { id: 'other', label: 'Other', icon: 'person', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=600' }
        ]
    },
    {
        id: 'age',
        title: 'How old are you?',
        options: [
            { id: '18-24', label: '18-24' },
            { id: '25-34', label: '25-34' },
            { id: '35-44', label: '35-44' },
            { id: '45-54', label: '45-54' },
            { id: '55+', label: '55+' }
        ]
    },
    {
        id: 'level',
        title: "What's your fitness level?",
        options: [
            { id: 'beginner', label: 'Beginner', icon: 'stairs', image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?q=80&w=600' },
            { id: 'intermediate', label: 'Intermediate', icon: 'trending_up', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600' },
            { id: 'advanced', label: 'Advanced', icon: 'speed', image: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=600' }
        ]
    },
    {
        id: 'equipment',
        title: 'What equipment do you have access to?',
        options: [
            { id: 'bodyweight', label: 'Bodyweight Only', icon: 'accessibility', image: '/bodyweight_option_1772471624596.png' },
            { id: 'dumbbells', label: 'Dumbbells', icon: 'exercise', image: '/dumbbells_option_1772471708967.png' },
            { id: 'full_gym', label: 'Full Gym', icon: 'fitness_center', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600' },
            { id: 'resistance_bands', label: 'Resistance Bands', icon: 'layers', image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=600' }
        ]
    },
    {
        id: 'focus',
        title: 'Which muscle groups to focus on?',
        subtitle: 'Select your primary target for this week.',
        options: [
            { id: 'full_body', label: 'Full Body', icon: 'body_system', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600' },
            { id: 'upper_body', label: 'Upper Body', icon: 'person_raised_hand', image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600' },
            { id: 'lower_body', label: 'Lower Body', icon: 'directions_walk', image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?q=80&w=600' },
            { id: 'core', label: 'Core & Abs', icon: 'grid_view', image: '/core_abs_custom.png' }
        ]
    },
    {
        id: 'mobility',
        title: 'How is your mobility today?',
        subtitle: 'Quick assessment to prevent injuries.',
        options: [
            { id: 'great', label: 'Feeling Flexible', icon: 'sentiment_very_satisfied', image: '/flexible_custom.png' },
            { id: 'stiff', label: 'A Bit Stiff', icon: 'sentiment_neutral', image: '/stiff_custom.png' },
            { id: 'pain', label: 'Minor Aches', icon: 'warning', image: '/aches_custom.png' }
        ]
    },
    {
        id: 'frequency',
        title: 'How often do you plan to train?',
        subtitle: 'We will create a schedule that fits your life.',
        options: [
            { id: '1-2', label: '1-2 Days / Week', image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600' },
            { id: '3-4', label: '3-4 Days / Week', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600' },
            { id: '5+', label: '5+ Days / Week', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600' }
        ]
    },
    {
        id: 'nutrition',
        title: 'Choose your nutrition path',
        subtitle: 'Your diet fuels your results.',
        options: [
            { id: 'balanced', label: 'Balanced Diet', icon: 'restaurant', image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=600' },
            { id: 'keto', label: 'Keto / Low Carb', icon: 'egg', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=600' },
            { id: 'vegan', label: 'Plant Based / Vegan', icon: 'eco', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600' },
            { id: 'high_protein', label: 'High Protein', icon: 'bakery_dining', image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?q=80&w=600' }
        ]
    }
];

const Onboarding = ({ onComplete }) => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [selections, setSelections] = useState({});
    const [loading, setLoading] = useState(false);

    const handleOptionSelect = (optionId) => {
        const stepId = steps[currentStep].id;
        const newSelections = { ...selections, [stepId]: optionId };
        setSelections(newSelections);

        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleFinish(newSelections);
        }
    };

    const handleFinish = async (finalSelections) => {
        setLoading(true);
        try {
            const savedUser = JSON.parse(localStorage.getItem('fitai_user') || '{}');
            const userId = savedUser.id || 1;
            await axios.put(`${API_BASE_URL}/users/${userId}`, {
                fitness_goal: finalSelections.goal,
                gender: finalSelections.gender,
                age_range: finalSelections.age,
                fitness_level: finalSelections.level,
                equipment_preference: finalSelections.equipment,
                targeted_muscle_groups: [finalSelections.focus],
                mobility_test_results: { overall: finalSelections.mobility },
                training_frequency: finalSelections.frequency,
                nutrition_goal: finalSelections.nutrition,
                onboarding_completed: true
            });

            // Update local user data
            localStorage.setItem('fitai_user', JSON.stringify({
                ...savedUser,
                ...finalSelections,
                targeted_muscle_groups: [finalSelections.focus],
                onboarding_completed: true
            }));

            if (onComplete) onComplete();
            navigate('/mobility-test');
        } catch (error) {
            console.error("Error saving onboarding data:", error);
            alert("Something went wrong saving your profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const step = steps[currentStep];
    const progress = ((currentStep + 1) / steps.length) * 100;

    return (
        <div className="min-h-screen bg-background-dark text-white flex flex-col p-6 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-[-10%] left-[-20%] w-[100%] h-[50%] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-20%] w-[100%] h-[50%] bg-neon-red/5 blur-[120px] rounded-full pointer-events-none"></div>

            <header className="flex items-center gap-4 mb-8 relative z-10">
                <button
                    onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
                    className={`flex items-center justify-center rounded-full size-10 bg-slate-900/40 backdrop-blur-md border border-slate-700/50 text-slate-100 transition-opacity ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                    <span className="material-symbols-outlined">arrow_back_ios_new</span>
                </button>
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex gap-1 h-1 flex-1 bg-slate-800 rounded-full overflow-hidden mr-4">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{currentStep + 1}/{steps.length}</span>
                    </div>
                </div>
            </header>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col relative z-10"
                >
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">
                        {step.title}
                    </h1>
                    {step.subtitle && (
                        <p className="text-slate-400 font-medium mb-8">
                            {step.subtitle}
                        </p>
                    )}

                    <div className={`flex-1 grid ${step.options.some(o => o.image) ? 'grid-cols-2 gap-4' : 'flex flex-col gap-4'} mt-4`}>
                        {step.options.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleOptionSelect(option.id)}
                                className={`group relative overflow-hidden flex ${step.options.some(o => o.image) ? 'flex-col h-48' : 'flex-row items-center justify-between p-6'} bg-slate-900/30 backdrop-blur-md rounded-3xl border border-white/5 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 text-left`}
                            >
                                {option.image ? (
                                    <>
                                        <img
                                            src={option.image}
                                            alt={option.label}
                                            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity grayscale-[30%] group-hover:grayscale-0"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                                        <div className="mt-auto p-4 relative z-10 w-full">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-black uppercase tracking-widest text-white">{option.label}</span>
                                                {option.icon && (
                                                    <span className="material-symbols-outlined text-primary text-sm">{option.icon}</span>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors">
                                            {option.label}
                                        </span>
                                        {option.icon && (
                                            <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">
                                                {option.icon}
                                            </span>
                                        )}
                                    </>
                                )}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>

            {loading && (
                <div className="fixed inset-0 bg-background-dark/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-6 text-center">
                    <div className="relative size-48 mb-10 mt-[-10vh]">
                        {/* Outer rotating ring */}
                        <div className="absolute inset-0 border-2 border-primary/10 rounded-full"></div>
                        <motion.div
                            className="absolute inset-0 border-t-4 border-primary rounded-full shadow-[0_0_20px_rgba(37,106,244,0.4)]"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />

                        {/* Inner pulsing ring */}
                        <div className="absolute inset-6 border border-white/5 rounded-full flex items-center justify-center bg-slate-950/50 shadow-inner">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_70%)] opacity-20"></div>
                            <span className="material-symbols-outlined text-6xl text-primary animate-pulse drop-shadow-[0_0_15px_rgba(37,106,244,0.6)]">smart_toy</span>
                        </div>

                        {/* Orbiting particles */}
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute size-2 bg-primary rounded-full shadow-[0_0_10px_var(--color-primary)]"
                                animate={{
                                    rotate: 360,
                                    scale: [1, 1.2, 1]
                                }}
                                transition={{
                                    rotate: { duration: 3 + i, repeat: Infinity, ease: "linear" },
                                    scale: { duration: 1, repeat: Infinity }
                                }}
                                style={{ inset: -10, transformOrigin: 'center' }}
                            />
                        ))}
                    </div>

                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-2">Neural Synthesis</h2>
                    <p className="text-primary font-black uppercase tracking-[0.25em] text-[10px] mb-12 animate-pulse">
                        FitAI Engine is calibrating your profile
                    </p>

                    <div className="w-56 space-y-4">
                        {[
                            { text: 'Analyzing Biometric Data', delay: 0 },
                            { text: 'Optimizing Recovery Cycles', delay: 0.8 },
                            { text: 'Synthesizing Training Path', delay: 1.6 }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: item.delay }}
                                className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest"
                            >
                                <div className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]"></div>
                                <span className="flex-1 text-left">{item.text}</span>
                                <span className="material-symbols-outlined text-neon-green text-sm">check_circle</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Onboarding;
