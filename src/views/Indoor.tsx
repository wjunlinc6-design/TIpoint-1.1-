import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TimerType, TimerStatus, FocusSession } from '../types';
import { StorageService } from '../lib/storage';
import { Play, Pause, Square, AlertTriangle, Droplet } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Indoor() {
  const [type, setType] = useState<TimerType>('countdown');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [elapsed, setElapsed] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [initialCountdown, setInitialCountdown] = useState(25 * 60);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Calibration and persistence
  useEffect(() => {
    const config = StorageService.getUserConfig();
    if (config.activeSession && config.activeSession.status === 'running') {
      const { type: sType, startTime, initialTimeSet } = config.activeSession;
      const diff = Math.floor((Date.now() - startTime) / 1000);
      
      setType(sType);
      setStatus('running');
      startTimeRef.current = startTime;

      if (sType === 'countdown') {
        setInitialCountdown(initialTimeSet);
        const remaining = initialTimeSet - diff;
        if (remaining <= 0) {
          completeSession(sType, startTime, initialTimeSet);
        } else {
          setTimeLeft(remaining);
        }
      } else {
        setElapsed(diff);
      }
    }
  }, []);

  const persistActiveSession = (s: TimerStatus, t: TimerType, initTime: number) => {
    const config = StorageService.getUserConfig();
    if (s === 'running') {
      config.activeSession = {
        type: t,
        startTime: startTimeRef.current || Date.now(),
        initialTimeSet: initTime,
        status: 'running'
      };
    } else {
      delete config.activeSession;
    }
    StorageService.saveUserConfig(config);
  };

  const startTimer = () => {
    if (status === 'paused') {
        setStatus('running');
        persistActiveSession('running', type, initialCountdown);
        return;
    }
    const now = Date.now();
    startTimeRef.current = now;
    setStatus('running');
    persistActiveSession('running', type, initialCountdown);
  };

  const pauseTimer = () => {
    setStatus('paused');
    persistActiveSession('paused', type, initialCountdown);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleStopClick = () => {
    // 3.3 Abandonment logic
    if (type === 'countdown' || (type === 'stopwatch' && elapsed < 10 * 60)) {
        setShowConfirm(true);
        setStatus('confirming');
    } else {
        // Stopwatch >= 10 mins: Complete directly
        completeSession(type, startTimeRef.current || Date.now() - (elapsed * 1000), elapsed);
    }
  };

  const completeSession = (t: TimerType, start: number, duration: number) => {
    const session: FocusSession = {
      id: Math.random().toString(36).substr(2, 9),
      type: t,
      startTime: start,
      endTime: Date.now(),
      durationMinutes: Math.max(1, Math.floor(duration / 60)), // Minimum 1 TI if completed
      status: 'completed'
    };
    StorageService.addFocusSession(session);
    resetTimer();
  };

  const discardSession = () => {
    resetTimer();
  };

  const resetTimer = () => {
    setStatus('idle');
    setTimeLeft(initialCountdown);
    setElapsed(0);
    setShowConfirm(false);
    startTimeRef.current = null;
    persistActiveSession('idle', type, initialCountdown);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (status === 'running') {
      timerRef.current = setInterval(() => {
        if (type === 'countdown') {
          setTimeLeft(prev => {
            if (prev <= 1) {
              completeSession(type, startTimeRef.current || Date.now() - (initialCountdown * 1000), initialCountdown);
              return 0;
            }
            return prev - 1;
          });
        } else {
          setElapsed(prev => prev + 1);
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, type, initialCountdown]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // SVG Progress calculation (Circumference = 2 * pi * 140 ~= 880)
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = type === 'countdown' 
    ? (timeLeft / initialCountdown) 
    : Math.min(1, elapsed / (60 * 60)); // Visual relative progress for stopwatch
  const offset = circumference - (progressPercent * circumference);

  const setPreset = (mins: number) => {
    if (status === 'idle') {
        const seconds = mins * 60;
        setInitialCountdown(seconds);
        setTimeLeft(seconds);
    }
  };

  const user = StorageService.getUserConfig();

  return (
    <div className="h-full flex flex-col items-center font-sans overflow-hidden py-10 selection:bg-brand-gold/20">
      {/* Tab Toggle as Top Bar */}
      <div className="flex items-center justify-center gap-8 w-full px-10 py-6 mb-4">
        <div className="flex items-center gap-2 bg-brand-surface/50 p-1 rounded-full border border-brand-outline-variant/30">
          <button
            onClick={() => { if (status === 'idle') setType('countdown'); }}
            className={cn(
              "text-[10px] tracking-[0.2em] uppercase font-bold transition-all px-6 py-2 rounded-full",
              type === 'countdown' ? "bg-white text-brand-primary shadow-sm" : "text-brand-outline/60 hover:text-brand-primary"
            )}
          >
            Countdown
          </button>
          <button
            onClick={() => { if (status === 'idle') setType('stopwatch'); }}
            className={cn(
              "text-[10px] tracking-[0.2em] uppercase font-bold transition-all px-6 py-2 rounded-full",
              type === 'stopwatch' ? "bg-white text-brand-primary shadow-sm" : "text-brand-outline/60 hover:text-brand-primary"
            )}
          >
            Stopwatch
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="w-full flex-1 flex flex-col items-center justify-center px-10 pb-[120px]">

        {/* Timer Display */}
        <div className="relative flex items-center justify-center w-48 h-48 mb-10">
          {/* Background Circle */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 300 300">
            <circle cx="150" cy="150" fill="none" r={radius} stroke="#eae1d4" strokeWidth="1.5" />
          </svg>
          
          {/* Progress Circle */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 300 300">
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2D4F1E" />
                <stop offset="100%" stopColor="#d4af37" />
              </linearGradient>
            </defs>
            <motion.circle
              cx="150" cy="150" fill="none" r={radius}
              stroke="url(#progressGradient)" strokeWidth="6" strokeLinecap="round"
              initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              style={{ strokeDasharray: circumference }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </svg>
          
          {/* Time Text */}
          <div className="text-center z-10 flex flex-col items-center">
            <span className="text-5xl font-sans font-extralight tracking-tight text-brand-primary leading-none">
              {type === 'countdown' ? formatTime(timeLeft) : formatTime(elapsed)}
            </span>
            <span className="text-[10px] tracking-[0.2em] text-brand-outline font-bold mt-4 uppercase opacity-60">
              {status === 'running' ? 'Focusing' : status === 'paused' ? 'Paused' : 'Remaining'}
            </span>
          </div>
        </div>

        {/* Duration Presets (Countdown only) */}
        <div className={cn("flex justify-center gap-4 mb-5 h-14 transition-all", type === 'stopwatch' ? "opacity-0 pointer-events-none" : "opacity-100")}>
          {[25, 35, 60].map(mins => (
            <button
              key={`preset-${mins}`}
              onClick={() => setPreset(mins)}
              disabled={status !== 'idle'}
              className={cn(
                "px-5 py-2.5 rounded-2xl border flex items-center justify-center transition-all",
                initialCountdown === mins * 60 
                    ? "border-brand-primary bg-brand-primary text-white shadow-lg" 
                    : "border-brand-outline-variant/30 text-brand-outline hover:border-brand-primary/50 bg-brand-surface"
              )}
            >
              <span className="text-sm font-bold tracking-widest">{mins}min</span>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-8 w-full">
          <button 
            onClick={status === 'running' ? pauseTimer : startTimer}
            disabled={status === 'idle'}
            className={cn(
                "w-16 h-16 flex flex-col items-center justify-center rounded-[24px] transition-all",
                status === 'idle' ? "opacity-30" : "bg-brand-surface border border-brand-outline/30 text-brand-outline hover:bg-brand-outline/10 hover:text-brand-primary"
            )}
          >
            {status === 'running' ? <Pause size={24} strokeWidth={2} /> : <Play size={24} strokeWidth={2} />}
            <span className="text-[10px] font-bold mt-1">{status === 'running' ? '暂停' : '继续'}</span>
          </button>
          
          <button
            onClick={startTimer}
            disabled={status === 'running'}
            className={cn(
                "w-24 h-24 rounded-[32px] flex flex-col items-center justify-center transition-all bg-brand-primary text-white shadow-xl shadow-brand-primary/30",
                status === 'running' ? "opacity-0 pointer-events-none absolute" : "active:scale-95"
            )}
          >
            <Play fill="currentColor" size={36} className="mb-1" />
            <span className="text-[12px] font-bold tracking-widest">开始</span>
          </button>
          
          <button 
            onClick={handleStopClick}
            disabled={status === 'idle'}
            className={cn(
                "w-16 h-16 flex flex-col items-center justify-center rounded-[24px] transition-all",
                status === 'idle' ? "opacity-30" : "bg-red-500/10 border border-red-500/30 text-red-600 hover:bg-red-500/20"
            )}
          >
            <Square size={20} strokeWidth={2.5} fill="currentColor" />
            <span className="text-[10px] font-bold mt-1">结束</span>
          </button>
        </div>
      </main>

      {/* Abandonment Dialog */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-brand-primary/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-brand-bg rounded-3xl p-10 w-full max-w-sm text-center border border-brand-outline-variant/30"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">放弃本次专注？</h3>
              <p className="text-brand-outline text-sm mb-10 leading-relaxed font-medium">
                {type === 'countdown' 
                    ? "确认中途结束？不计入数据。" 
                    : "不到 10 分钟或中途停止，\n数据将不会被计入统计成果中。"}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    setStatus(status === 'paused' ? 'paused' : 'running');
                  }}
                  className="w-full py-4 rounded-2xl bg-brand-primary text-white font-bold transition-all active:scale-95"
                >
                  继续努力
                </button>
                <button
                  onClick={discardSession}
                  className="w-full py-4 rounded-2xl bg-transparent border border-brand-outline-variant/50 text-red-500 font-bold transition-all active:scale-95"
                >
                  确认放弃
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

