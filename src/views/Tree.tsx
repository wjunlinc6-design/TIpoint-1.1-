import React from 'react';
import { motion } from 'motion/react';
import { UserConfig } from '../types';
import { MAIN_TREE_IMG } from '../constants';
import { Droplet } from 'lucide-react';
import { StorageService } from '../lib/storage';
import { cn } from '../lib/utils';

interface TreeProps {
  config: UserConfig;
  onUpdateConfig: (config: UserConfig) => void;
}

export default function Tree({ config, onUpdateConfig }: TreeProps) {
  const sessions = StorageService.getFocusSessions();
  const todayMinutes = sessions
    .filter(s => s.status === 'completed' && new Date(s.endTime).toDateString() === new Date().toDateString())
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const handleWater = () => {
    const updated = { ...config, dailyWaterCount: config.dailyWaterCount + 1 };
    StorageService.saveUserConfig(updated);
    onUpdateConfig(updated);
  };

  return (
    <div className="relative w-full h-full overflow-hidden font-sans">
      {/* Background with subtle color blend */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 transition-opacity duration-1000"
        style={{ backgroundImage: `url(${config.userSceneUrl})` }}
      />
      <div className="absolute inset-0 bg-brand-bg/60 backdrop-blur-[2px]" />

      <div className="relative h-full flex flex-col p-8 text-brand-primary pb-[98px]">
        {/* Header */}
        <header className="flex justify-between items-center mt-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full border border-brand-outline-variant bg-brand-surface overflow-hidden shadow-sm">
              <img src={config.userAvatarUrl} alt="p" className="w-full h-full p-1" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] tracking-widest font-bold uppercase opacity-60 leading-none mb-1">Grower</span>
              <span className="text-sm font-bold tracking-tight leading-none">{config.userName}</span>
            </div>
          </div>
          
          <h1 className="font-display-lg text-4xl text-brand-primary tracking-[0.15em] font-light hidden xs:block">TIpoint</h1>

          <button 
            onClick={handleWater}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="text-brand-primary group-hover:opacity-70 transition-opacity p-2.5 bg-brand-gold/10 rounded-full">
              <Droplet size={20} strokeWidth={2} />
            </div>
            <span className="text-[10px] font-bold tracking-widest tabular-nums opacity-60">
              今日喝水：{config.dailyWaterCount}次
            </span>
          </button>
        </header>

        {/* Tree Visual Area */}
        <div className="flex-1 flex flex-col items-center justify-center relative -mt-10">
          <div className="absolute w-64 h-64 rounded-full bg-brand-gold/10 blur-[80px] -z-10" />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <img 
              src={MAIN_TREE_IMG} 
              alt="Tree" 
              className="w-48 h-48 object-contain drop-shadow-[0_25px_40px_rgba(115,92,0,0.15)]"
              referrerPolicy="no-referrer"
            />
            
            {/* TI Point Particles (Gold leaves) */}
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute top-1/4 right-1/4 w-2 h-2 bg-brand-gold rounded-full shadow-[0_0_8px_rgba(212,175,55,0.6)]" 
            />
            <motion.div 
              animate={{ y: [0, -15, 0] }} 
              transition={{ repeat: Infinity, duration: 4, delay: 0.5 }}
              className="absolute top-1/3 left-1/4 w-1.5 h-1.5 bg-brand-gold rounded-full shadow-[0_0_6px_rgba(212,175,55,0.6)]" 
            />
          </motion.div>

          <div className="mt-8 text-center flex flex-col items-center gap-1">
            <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-brand-outline opacity-70">Today's Growth</span>
            <div className="flex items-baseline gap-2">
              <span className="text-7xl font-sans font-light tracking-tight">{todayMinutes}</span>
              <span className="text-xl font-light opacity-60">TI</span>
            </div>
            
            <div className="progress-line w-48 mt-4 overflow-hidden rounded-full">
              <motion.div 
                className="progress-line-fill" 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (todayMinutes / 120) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
