import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AVATAR_OPTIONS, SCENE_OPTIONS, TREE_BIRTH_IMG, WILDERNESS_URL, generateRandomName } from '../constants';
import { UserConfig } from '../types';
import { StorageService } from '../lib/storage';
import { ArrowRight, Check, RefreshCw, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface OnboardingProps {
  onComplete: (config: UserConfig) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = React.useState(1);
  const [config, setConfig] = React.useState<UserConfig>({
    isOnboarded: false,
    userName: generateRandomName(),
    userAvatarUrl: AVATAR_OPTIONS[0],
    userSceneUrl: SCENE_OPTIONS[0].url,
    dailyWaterCount: 0,
    lastWaterDate: new Date().toISOString().split('T')[0],
  });

  const nextStep = () => setStep(s => s + 1);

  const handleFinish = () => {
    const finalConfig = { ...config, isOnboarded: true };
    StorageService.saveUserConfig(finalConfig);
    onComplete(finalConfig);
  };

  const randomizeName = () => {
    setConfig(prev => ({ ...prev, userName: generateRandomName() }));
  };

  return (
    <div className="absolute inset-0 bg-brand-bg z-50 flex flex-col font-sans overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 flex flex-col p-10 justify-center items-center text-center relative"
          >
            <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-brand-outline mb-6">Identity</span>
            <h1 className="text-2xl font-light text-brand-primary mb-2">认识一下，你是</h1>
            <div className="flex items-center gap-4 mb-16 w-full max-w-xs">
              <div className="flex-1 text-2xl font-sans font-light text-brand-gold tracking-tight border-b border-brand-outline-variant/30 py-4 truncate">
                {config.userName}
              </div>
              <button 
                onClick={randomizeName}
                className="p-4 rounded-full hover:bg-brand-surface transition-colors"
                title="Randomize Name"
              >
                <RefreshCw size={20} className="text-brand-outline" />
              </button>
            </div>

            <p className="text-brand-outline text-xs tracking-widest uppercase mb-8 font-medium">选择一个伙伴</p>
            <div className="grid grid-cols-3 gap-6 mb-16 w-full max-w-xs">
              {AVATAR_OPTIONS.map((url) => (
                <button
                  key={url}
                  onClick={() => setConfig({ ...config, userAvatarUrl: url })}
                  className={cn(
                    "relative aspect-square rounded-full border transition-all duration-500 overflow-hidden",
                    config.userAvatarUrl === url ? "border-brand-gold bg-brand-gold/5 scale-110 shadow-xl shadow-brand-gold/10" : "border-brand-outline-variant/20 bg-brand-surface opacity-40"
                  )}
                >
                  <img src={url} alt="Avatar" className="w-full h-full p-2" referrerPolicy="no-referrer" />
                  {config.userAvatarUrl === url && (
                    <div className="absolute inset-0 border-2 border-brand-gold rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="absolute bottom-16 left-0 right-0 flex justify-center">
              <button
                onClick={nextStep}
                className="px-16 py-4 bg-brand-primary text-white rounded-full font-bold tracking-[0.2em] text-sm active:scale-95 transition-all shadow-xl shadow-brand-primary/20"
              >
                下一步
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col p-10 justify-center items-center relative"
          >
            <div className="text-center mb-12">
               <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-brand-outline mb-4 block">Landscape</span>
               <h1 className="text-2xl font-light text-brand-primary">你想在哪里种下<br/>你的第一棵树？</h1>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-md">
              {SCENE_OPTIONS.map((scene) => (
                <button
                  key={scene.name}
                  onClick={() => setConfig({ ...config, userSceneUrl: scene.url })}
                  className={cn(
                    "aspect-square flex flex-col rounded-3xl border transition-all overflow-hidden relative group",
                    config.userSceneUrl === scene.url ? "border-brand-gold scale-105 shadow-2xl" : "border-brand-outline-variant/10 opacity-60 grayscale-[50%]"
                  )}
                >
                  <img src={scene.url} alt={scene.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/80 via-transparent flex items-end p-4">
                    <span className="text-white text-[10px] font-bold tracking-widest uppercase">{scene.name}</span>
                  </div>
                  {config.userSceneUrl === scene.url && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-brand-gold rounded-full flex items-center justify-center">
                      <Check className="text-white" size={12} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setConfig({ ...config, userSceneUrl: WILDERNESS_URL })}
              className={cn(
                "text-center text-[10px] tracking-widest uppercase font-bold mb-12 transition-colors",
                config.userSceneUrl === WILDERNESS_URL ? "text-brand-gold" : "text-brand-outline/40 hover:text-brand-outline"
              )}
            >
              ✨ 不设定区域，相信旷野 ✨
            </button>

            <div className="absolute bottom-16 left-0 right-0 flex justify-center">
              <button
                onClick={nextStep}
                className="px-16 py-4 w-full max-w-xs bg-brand-primary text-white rounded-full font-bold tracking-[0.2em] text-sm active:scale-95 transition-all shadow-xl shadow-brand-primary/20"
              >
                下一步
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-10 relative"
          >
            <motion.div
              initial={{ scale: 0.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="mb-12 relative"
            >
              <div className="absolute inset-0 bg-brand-gold/10 blur-[60px] rounded-full scale-150" />
              <img src={TREE_BIRTH_IMG} alt="Birth" className="w-64 h-64 object-contain relative" referrerPolicy="no-referrer" />
            </motion.div>
            <h1 className="text-4xl font-sans font-light tracking-widest text-brand-primary mb-4 text-center">树木诞生</h1>
            <p className="text-brand-outline text-center max-w-xs mb-16 font-light leading-relaxed">
              一颗属于你的专注之种已经萌发
            </p>
            <div className="absolute bottom-16 left-0 right-0 flex justify-center">
              <button
                onClick={nextStep}
                className="px-16 py-4 w-full max-w-xs bg-brand-primary text-white rounded-full font-bold tracking-[0.2em] text-sm active:scale-95 transition-all shadow-xl"
              >
                下一步
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <div className="absolute inset-0 z-[60] flex flex-col">
             <div className="flex-1 bg-brand-primary/95 backdrop-blur-xl flex flex-col items-center justify-center p-10 text-white relative">
                <div className="w-full max-w-sm flex flex-col items-center">
                   <div className="w-20 h-20 bg-brand-gold/20 border border-brand-gold/30 rounded-full flex items-center justify-center mb-10">
                      <RefreshCw className="text-brand-gold animate-spin-slow" size={32} />
                   </div>
                   <h2 className="text-3xl font-light tracking-[0.1em] mb-4 text-center">专注时刻</h2>
                   <p className="text-white/60 text-center leading-relaxed font-light mb-12">
                     点击开始，让时间为你生长。<br/>开启一段沉浸式的时光。
                   </p>
                </div>
                <div className="absolute bottom-16 left-0 right-0 flex justify-center">
                  <button
                    onClick={nextStep}
                    className="px-16 py-4 w-full max-w-xs bg-white text-brand-primary rounded-full font-bold text-sm tracking-[0.2em] active:scale-95 transition-all shadow-2xl"
                  >
                    下一步
                  </button>
                </div>
             </div>
          </div>
        )}

        {step === 5 && (
          <div className="absolute inset-0 z-[70] flex flex-col">
             <div className="flex-1 bg-brand-bg flex flex-col items-center justify-center p-10 relative">
                <div className="text-center">
                   <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-10"
                   >
                     <div className="w-32 h-32 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto border border-brand-gold/20">
                        <Check className="text-brand-gold" size={48} strokeWidth={1} />
                     </div>
                   </motion.div>
                   <h2 className="text-5xl font-sans font-light tracking-tighter text-brand-primary mb-6">现在开始了~</h2>
                   <p className="text-brand-outline font-light max-w-[200px] mx-auto leading-relaxed text-sm">
                     你的专注森林<br/>由你亲手点亮
                   </p>
                </div>
                <div className="absolute bottom-16 left-0 right-0 flex justify-center">
                  <button
                    onClick={handleFinish}
                    className="px-16 py-4 w-full max-w-xs bg-brand-primary text-white rounded-full font-bold text-sm tracking-[0.2em] active:scale-95 transition-all shadow-xl shadow-brand-primary/20"
                  >
                    下一步
                  </button>
                </div>
             </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
