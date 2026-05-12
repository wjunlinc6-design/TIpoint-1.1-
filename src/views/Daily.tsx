import React, { useState } from 'react';
import { motion } from 'motion/react';
import { StorageService } from '../lib/storage';
import { format, isSameDay, startOfWeek, addDays, isSameMonth, startOfMonth, eachDayOfInterval, addMonths, addYears, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Droplet, Clock, Target, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

type ViewTab = 'week' | 'month' | 'year' | 'total';

export default function Daily() {
  const [view, setView] = useState<ViewTab>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const sessions = StorageService.getFocusSessions();
  const config = StorageService.getUserConfig();

  const completedSessions = sessions.filter(s => s.status === 'completed');

  const getWaterForDate = (d: Date) => {
    const dr = format(d, 'yyyy-MM-dd');
    if (isSameDay(d, new Date())) return config.dailyWaterCount;
    return config.waterHistory?.[dr] || 0;
  };

  const getSessionsForDate = (d: Date) => completedSessions.filter(s => isSameDay(new Date(s.endTime), d));

  const totalFocusMinutes = completedSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  let totalWaterIntakes = config.dailyWaterCount;
  if (config.waterHistory) {
      Object.entries(config.waterHistory).forEach(([dateStr, count]) => {
          if (dateStr !== format(new Date(), 'yyyy-MM-dd')) {
              totalWaterIntakes += count;
          }
      });
  }

  // Selected date stats
  const dailySessions = getSessionsForDate(selectedDate);
  const dailyMins = dailySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const dailyWater = getWaterForDate(selectedDate);

  // Time navigation handlers
  const handlePrev = () => {
      if (view === 'week') setSelectedDate(addDays(selectedDate, -7));
      if (view === 'month') setSelectedDate(addMonths(selectedDate, -1));
      if (view === 'year') setSelectedDate(addYears(selectedDate, -1));
  };
  const handleNext = () => {
      if (view === 'week') setSelectedDate(addDays(selectedDate, 7));
      if (view === 'month') setSelectedDate(addMonths(selectedDate, 1));
      if (view === 'year') setSelectedDate(addYears(selectedDate, 1));
  };

  // Calendar arrays
  const weekStart = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  const monthStart = startOfMonth(selectedDate);
  const calendarStartDate = startOfWeek(monthStart);
  const calendarDays = eachDayOfInterval({ start: calendarStartDate, end: addDays(calendarStartDate, 41) });

  return (
    <div className="h-full bg-brand-bg flex flex-col p-8 font-sans overflow-y-auto pb-[98px] selection:bg-brand-gold/20">
      {/* Top Header */}
      <div className="mt-8 flex justify-between items-center w-full mb-8 px-1 relative">
        <div className="w-11 h-11 rounded-full bg-brand-surface border border-brand-outline-variant/30 flex items-center justify-center overflow-hidden shadow-sm">
          <img src={config.userAvatarUrl} className="w-full h-full p-2" alt="p" />
        </div>
        <h2 className="text-brand-primary tracking-[0.2em] font-light text-xl uppercase absolute left-1/2 -translate-x-1/2">Daily</h2>
        <div className="text-brand-primary opacity-60">
            <Droplet size={20} strokeWidth={1.5} />
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex bg-brand-surface/40 backdrop-blur-md p-1 rounded-2xl mb-8 border border-brand-outline-variant/10">
        {(['week', 'month', 'year', 'total'] as ViewTab[]).map(t => (
          <button
            key={t}
            onClick={() => setView(t)}
            className={cn(
                "flex-1 py-2 text-[10px] tracking-widest uppercase font-bold transition-all rounded-xl",
                view === t ? "bg-white text-brand-primary shadow-sm" : "text-brand-outline/40 hover:text-brand-primary/60"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Date Navigation */}
      {view !== 'total' && (
      <section className="flex flex-col items-center mb-8">
        <div className="flex items-center justify-between w-full max-w-[260px] mb-6">
          <button onClick={handlePrev} className="text-brand-outline hover:text-brand-primary p-2">
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col items-center">
            {view === 'month' && (
              <>
                <span className="text-4xl font-sans font-light tracking-widest text-brand-primary">{format(selectedDate, 'MMM')}</span>
                <span className="text-xs tracking-[0.2em] font-bold text-brand-outline/60 uppercase">{format(selectedDate, 'yyyy')}</span>
              </>
            )}
            {view === 'week' && (
              <>
                <span className="text-3xl font-sans font-light tracking-widest text-brand-primary">Week {format(weekStart, 'd')}</span>
                <span className="text-[10px] tracking-[0.2em] font-bold text-brand-outline/60 uppercase">{format(selectedDate, 'MMM yyyy')}</span>
              </>
            )}
            {view === 'year' && (
               <span className="text-4xl font-sans font-light tracking-widest text-brand-primary">{format(selectedDate, 'yyyy')}</span>
            )}
          </div>
          <button onClick={handleNext} className="text-brand-outline hover:text-brand-primary p-2">
            <ChevronRight size={24} />
          </button>
        </div>
        <div className="h-[1px] w-16 bg-brand-outline-variant/30" />
      </section>
      )}

      {/* Month View Calendar Grid */}
      {view === 'month' && (
        <div className="grid grid-cols-7 gap-y-3 mb-10 px-2 w-full max-w-sm mx-auto">
            {['S','M','T','W','T','F','S'].map((d, idx) => (
              <span key={`month-day-${idx}`} className="text-[10px] font-bold text-brand-outline/40 text-center mb-2">{d}</span>
            ))}
            {calendarDays.map((date, idx) => {
                const hasData = getSessionsForDate(date).length > 0;
                const isSelected = isSameDay(date, selectedDate);
                const isCurrentMonth = isSameMonth(date, selectedDate);
                const isDayToday = isToday(date);
                
                return (
                    <button
                        key={`calendar-day-${idx}`}
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                            "flex flex-col items-center justify-center p-2 rounded-xl transition-all relative font-light mx-auto w-11 h-11",
                            isSelected ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20" : 
                            (isDayToday ? "border border-brand-primary/30 text-brand-primary bg-brand-surface" : 
                            (isCurrentMonth ? "text-brand-primary hover:bg-brand-surface" : "text-brand-outline/30"))
                        )}
                    >
                    <span className="text-sm font-light leading-none">{format(date, 'd')}</span>
                    {hasData && !isSelected && (
                        <div className="absolute bottom-1 w-1.5 h-1.5 bg-brand-forest rounded-full opacity-60" />
                    )}
                    {hasData && isSelected && (
                        <div className="absolute bottom-1 w-1.5 h-1.5 bg-white rounded-full opacity-90" />
                    )}
                    </button>
                );
            })}
        </div>
      )}

      {/* Week View Calendar Grid */}
      {view === 'week' && (
        <div className="grid grid-cols-7 gap-1 mb-10 px-2 w-full max-w-sm mx-auto">
            {['S','M','T','W','T','F','S'].map((d, idx) => (
            <span key={`week-header-${idx}`} className="text-[10px] font-bold text-brand-outline/40 text-center mb-4">{d}</span>
            ))}
            {weekDays.map((date, idx) => {
            const hasData = getSessionsForDate(date).length > 0;
            const isSelected = isSameDay(date, selectedDate);
            const isDayToday = isToday(date);
            
            return (
                <button
                key={`weekday-${idx}`}
                onClick={() => setSelectedDate(date)}
                className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-xl transition-all relative font-light mx-auto w-11 h-11",
                    isSelected ? "bg-brand-primary text-white shadow-md" : 
                    (isDayToday ? "border border-brand-primary/30 text-brand-primary" : "text-brand-primary hover:bg-brand-surface")
                )}
                >
                <span className="text-sm font-light leading-none">{format(date, 'd')}</span>
                {hasData && !isSelected && (
                    <div className="absolute bottom-1 w-1 h-1 bg-brand-forest rounded-full opacity-60" />
                )}
                {hasData && isSelected && (
                    <div className="absolute bottom-1 w-1 h-1 bg-white rounded-full opacity-90" />
                )}
                </button>
            );
            })}
        </div>
      )}


      {/* Detail View for selected date (Applies to week/month/year) */}
      {view !== 'total' && (
      <div className="w-full flex-1 flex flex-col items-center w-full max-w-sm mx-auto">
         {/* Details Header */}
         <div className="flex items-center w-full gap-4 mb-6">
            <div className="h-[1px] flex-1 bg-brand-outline-variant/30" />
            <span className="text-[10px] font-bold text-brand-outline/50 tracking-[0.2em] uppercase">
                {format(selectedDate, 'MMM d, yyyy')}
            </span>
            <div className="h-[1px] flex-1 bg-brand-outline-variant/30" />
         </div>

         {/* Summary Cards */}
         <div className="grid grid-cols-3 gap-3 w-full mb-8">
            <div className="bg-brand-surface/50 rounded-[20px] p-4 flex flex-col items-center justify-center border border-brand-outline-variant/20 shadow-sm">
                <span className="text-[10px] tracking-widest font-bold text-brand-outline mb-2">时长</span>
                <span className="text-xl font-light text-brand-primary">
                    {dailyMins >= 60 ? `${Math.floor(dailyMins / 60)}h ` : ''}{dailyMins % 60}<span className="text-[10px] font-bold opacity-50 ml-0.5">m</span>
                </span>
            </div>
            <div className="bg-brand-surface/50 rounded-[20px] p-4 flex flex-col items-center justify-center border border-brand-outline-variant/20 shadow-sm">
                <span className="text-[10px] tracking-widest font-bold text-brand-outline mb-2">有效</span>
                <span className="text-xl font-light text-brand-primary">{dailySessions.length} <span className="text-[10px] font-bold opacity-50 ml-0.5">次</span></span>
            </div>
            <div className="bg-brand-surface/50 rounded-[20px] p-4 flex flex-col items-center justify-center border border-brand-outline-variant/20 shadow-sm">
                <span className="text-[10px] tracking-widest font-bold text-brand-outline mb-2">喝水</span>
                <span className="text-xl font-light text-brand-primary">{dailyWater} <span className="text-[10px] font-bold opacity-50 ml-0.5">次</span></span>
            </div>
         </div>

         {/* List */}
         <div className="w-full space-y-3 pb-8">
            {dailySessions.length === 0 ? (
                <div className="text-center py-10 text-brand-outline/40 text-xs font-light italic">今日无专注记录</div>
            ) : (
                dailySessions.slice().reverse().map(session => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        key={session.id} 
                        className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-brand-outline-variant/10 shadow-sm"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-brand-forest/5 flex items-center justify-center border border-brand-forest/10">
                                <CheckCircle2 size={18} className="text-brand-forest" strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-brand-primary">
                                    {session.type === 'countdown' ? '倒计时专注' : '正计时专注'}
                                </span>
                                <span className="text-[10px] tracking-widest text-brand-outline mt-0.5 opacity-60">
                                    {format(new Date(session.startTime), 'HH:mm')} - {format(new Date(session.endTime), 'HH:mm')}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xl font-light text-brand-primary tabular-nums tracking-tight">+{session.durationMinutes}</span>
                            <span className="text-[8px] font-bold text-brand-outline uppercase tracking-widest opacity-40">Min</span>
                        </div>
                    </motion.div>
                ))
            )}
         </div>
      </div>
      )}

      {/* Aggregate View 'total' */}
      {view === 'total' && (
      <div className="w-full flex-1 flex flex-col items-center w-full max-w-sm mx-auto mt-4">
         <div className="grid grid-rows-3 gap-4 w-full">
            <div className="bg-brand-surface/80 rounded-[32px] p-8 flex flex-col justify-center border border-brand-outline-variant/20 shadow-md">
                <span className="text-[10px] tracking-[0.2em] font-bold text-brand-outline uppercase mb-2">Total Focus Time</span>
                <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-6xl font-light text-brand-primary tracking-tight">
                        {totalFocusMinutes >= 60 ? `${Math.floor(totalFocusMinutes / 60)}h ` : ''}{totalFocusMinutes % 60}m
                    </span>
                </div>
            </div>
            <div className="bg-brand-surface/80 rounded-[32px] p-8 flex flex-col justify-center border border-brand-outline-variant/20 shadow-md">
                <span className="text-[10px] tracking-[0.2em] font-bold text-brand-outline uppercase mb-2">Total Completed</span>
                <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-6xl font-light text-brand-primary tracking-tight">{completedSessions.length}</span>
                    <span className="text-sm text-brand-outline font-bold">times</span>
                </div>
            </div>
            <div className="bg-brand-surface/80 rounded-[32px] p-8 flex flex-col justify-center border border-brand-outline-variant/20 shadow-md">
                <span className="text-[10px] tracking-[0.2em] font-bold text-brand-outline uppercase mb-2">Total Water</span>
                <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-6xl font-light text-brand-primary tracking-tight">{totalWaterIntakes}</span>
                    <span className="text-sm text-brand-outline font-bold">times</span>
                </div>
            </div>
         </div>
      </div>
      )}

    </div>
  );
}
