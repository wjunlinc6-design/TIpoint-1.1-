import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StorageService } from '../lib/storage';
import { format, isSameDay, startOfWeek, addDays, isSameMonth, startOfMonth, eachDayOfInterval, addMonths, addYears, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Droplet, Clock, Target, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

type ViewTab = 'week' | 'month' | 'year' | 'total';

function SessionListItem({ session, tagName, onLongPress }: { session: any, tagName?: string, onLongPress: () => void }) {
  const timerRef = React.useRef<any>(null);

  const startPress = () => {
    timerRef.current = setTimeout(() => {
      onLongPress();
      timerRef.current = null;
    }, 1000);
  };

  const cancelPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-brand-outline-variant/10 shadow-sm transition-all select-none active:scale-[0.98]"
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <div className="flex items-center gap-4 pointer-events-none">
        <div className="w-10 h-10 rounded-full bg-brand-forest/5 flex items-center justify-center border border-brand-forest/10 shrink-0">
            <CheckCircle2 size={18} className="text-brand-forest" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-brand-primary">
                  {session.type === 'countdown' ? '倒计时专注' : '正计时专注'}
              </span>
              {tagName && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-brand-surface border border-brand-outline-variant/30 text-brand-primary/80 lowercase">
                  {tagName}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-widest text-brand-outline mt-0.5 opacity-60">
                {format(new Date(session.startTime), 'HH:mm')} - {format(new Date(session.endTime), 'HH:mm')}
            </span>
        </div>
      </div>
      <div className="flex flex-col items-end pointer-events-none shrink-0">
          <span className="text-xl font-light text-brand-primary tabular-nums tracking-tight">+{session.durationMinutes}</span>
          <span className="text-[8px] font-bold text-brand-outline uppercase tracking-widest opacity-40">Min</span>
      </div>
    </motion.div>
  );
}

export default function Daily() {
  const [view, setView] = useState<ViewTab>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refresh, setRefresh] = useState(0);
  const [actionSession, setActionSession] = useState<any>(null);
  const [deleteConfirmSession, setDeleteConfirmSession] = useState<any>(null);
  const [taggingSession, setTaggingSession] = useState<any>(null);
  const [showCustomTagInput, setShowCustomTagInput] = useState(false);
  const [customTagValue, setCustomTagValue] = useState('');
  
  const sessions = StorageService.getFocusSessions();
  const config = StorageService.getUserConfig();
  const tags = StorageService.getTags();

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

  // Tag usage stats for Total view
  const tagStats = React.useMemo(() => {
     if (tags.length === 0) return [];
     const stats = new Map<string, number>();
     completedSessions.forEach(s => {
         const tId = s.tagId || 'uncategorized';
         stats.set(tId, (stats.get(tId) || 0) + s.durationMinutes);
     });
     return Array.from(stats.entries())
       .filter(([id]) => id !== 'uncategorized')
       .map(([id, mins]) => ({
           id,
           name: tags.find(t => t.id === id)?.name || 'Unknown',
           mins
       }))
       .filter(t => t.mins > 0)
       .sort((a, b) => b.mins - a.mins);
  }, [completedSessions, tags]);

  return (
    <div className="h-full bg-brand-bg flex flex-col p-8 font-sans overflow-y-auto pb-[98px] selection:bg-brand-gold/20">
      {/* Top Header */}
      <div className="mt-8 flex justify-center items-center w-full mb-8 px-1 relative">
        <h2 className="text-brand-primary tracking-[0.2em] font-light text-xl uppercase">Daily</h2>
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
                    <SessionListItem 
                        key={session.id} 
                        session={session} 
                        tagName={tags.find(t => t.id === session.tagId)?.name}
                        onLongPress={() => setActionSession(session)} 
                    />
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
                {tagStats.length > 0 && (
                   <div className="mt-6 flex flex-col gap-2 pt-6 border-t border-brand-outline-variant/20">
                     {tagStats.map(ts => (
                         <div key={ts.id} className="flex items-center justify-between">
                            <span className="text-sm font-bold text-brand-primary/80">{ts.name}</span>
                            <span className="text-sm text-brand-outline">{ts.mins >= 60 ? `${Math.floor(ts.mins / 60)}h ` : ''}{ts.mins % 60}m</span>
                         </div>
                     ))}
                   </div>
                )}
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

      <AnimatePresence>
        {actionSession && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-brand-bg/60 backdrop-blur-sm"
              onClick={() => setActionSession(null)}
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-brand-surface w-full max-w-[1200px] mx-auto rounded-t-3xl border-t border-brand-outline-variant/30 flex flex-col p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-brand-outline-variant/30 rounded-full mx-auto mb-8" />
              
              <button 
                onClick={() => {
                   setTaggingSession(actionSession);
                   setActionSession(null);
                }}
                className="w-full py-4 bg-brand-bg rounded-xl text-brand-primary font-bold mb-3 active:scale-[0.98] transition-transform"
              >
                Category (分类)
              </button>

              <button 
                onClick={() => {
                   setDeleteConfirmSession(actionSession);
                   setActionSession(null);
                }}
                className="w-full py-4 bg-red-50 text-red-600 rounded-xl font-bold mb-3 active:scale-[0.98] transition-transform shrink-0"
              >
                Delete (删除)
              </button>

              <button 
                onClick={() => setActionSession(null)}
                className="w-full py-4 bg-brand-bg rounded-xl text-brand-outline font-bold mt-2 active:scale-[0.98] transition-transform shrink-0"
              >
                取消
              </button>
            </motion.div>
          </div>
        )}

        {taggingSession && (
          <div className="fixed inset-0 z-[110] flex flex-col justify-end">
             <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-brand-bg/60 backdrop-blur-sm"
              onClick={() => { setTaggingSession(null); setShowCustomTagInput(false); }}
             />
             <motion.div 
               initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 300 }}
               className="relative bg-brand-surface w-full max-w-[1200px] mx-auto rounded-t-3xl border-t border-brand-outline-variant/30 flex flex-col p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl overflow-hidden max-h-[80vh]"
             >
               <div className="w-12 h-1.5 bg-brand-outline-variant/30 rounded-full mx-auto mb-6" />
               <h3 className="text-xl font-light text-brand-primary mb-6 shrink-0">Select Category</h3>
               
               <div className="flex-1 overflow-y-auto w-full mb-6 py-2">
                 <div className="flex flex-wrap gap-3">
                   {tags.map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => {
                            StorageService.updateFocusSession({ ...taggingSession, tagId: tag.id });
                            setTaggingSession(null);
                            setRefresh(r => r + 1);
                        }}
                        className={cn(
                            "px-5 py-3 rounded-full border text-sm transition-all font-bold",
                            taggingSession.tagId === tag.id ? "bg-brand-primary text-white border-brand-primary shadow-md" : "bg-white text-brand-primary border-brand-outline-variant/20 hover:border-brand-primary/50"
                        )}
                      >
                        {tag.name}
                      </button>
                   ))}
                   
                   {!showCustomTagInput && (
                      <button
                        onClick={() => { setShowCustomTagInput(true); setCustomTagValue(''); }}
                        className="px-5 py-3 rounded-full border border-dashed border-brand-outline text-brand-outline text-sm transition-all font-bold hover:bg-white"
                      >
                         + Custom
                      </button>
                   )}
                 </div>

                 {showCustomTagInput && (
                    <div className="mt-6 flex bg-white p-2 rounded-2xl border border-brand-outline-variant/30">
                        <input 
                           type="text" 
                           autoFocus
                           className="flex-1 bg-transparent px-4 font-bold text-brand-primary outline-none" 
                           placeholder="Tag name (Eng)" 
                           value={customTagValue}
                           onChange={e => setCustomTagValue(e.target.value.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 15))}
                        />
                        <button
                           className="bg-brand-primary text-white px-6 py-3 rounded-xl font-bold ml-2 active:scale-95 transition-all"
                           onClick={() => {
                               if (customTagValue.trim()) {
                                   const newTag = { id: crypto.randomUUID(), name: customTagValue.trim() };
                                   StorageService.addTag(newTag);
                                   StorageService.updateFocusSession({ ...taggingSession, tagId: newTag.id });
                                   setTaggingSession(null);
                                   setShowCustomTagInput(false);
                                   setRefresh(r => r + 1);
                               }
                           }}
                        >
                           Add
                        </button>
                    </div>
                 )}
               </div>

               <button 
                  onClick={() => {
                      if (taggingSession.tagId) {
                          StorageService.updateFocusSession({ ...taggingSession, tagId: undefined });
                          setRefresh(r => r + 1);
                      }
                      setTaggingSession(null);
                      setShowCustomTagInput(false);
                  }}
                  className="w-full py-4 bg-brand-bg rounded-xl text-brand-outline font-bold mt-2 hover:text-brand-primary transition-colors shrink-0"
                >
                  Clear Category
                </button>
             </motion.div>
          </div>
        )}

        {deleteConfirmSession && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-brand-bg/80 backdrop-blur-md"
              onClick={() => setDeleteConfirmSession(null)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-brand-surface w-full max-w-sm rounded-[32px] p-8 flex flex-col items-center border border-brand-outline-variant/20 shadow-2xl"
            >
              <h3 className="text-xl font-light text-brand-primary mb-4">删除记录</h3>
              <p className="text-sm font-light text-brand-outline text-center mb-8">
                确定要删除这条专注记录吗？<br/>删除后将同步扣减相关统计数据。
              </p>
              <div className="flex w-full gap-4">
                <button 
                  onClick={() => setDeleteConfirmSession(null)}
                  className="flex-1 py-3.5 bg-brand-bg rounded-xl text-brand-outline font-bold transition-all active:scale-[0.98]"
                >
                  取消
                </button>
                <button 
                  onClick={() => {
                    StorageService.deleteFocusSession(deleteConfirmSession.id);
                    setDeleteConfirmSession(null);
                    setRefresh(r => r + 1);
                  }}
                  className="flex-1 py-3.5 bg-red-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-500/20 active:scale-[0.98]"
                >
                  确认删除
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
