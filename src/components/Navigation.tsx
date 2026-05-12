import React from 'react';
import { CircleDot, Timer, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavigationProps {
  activeTab: 'indoor' | 'tree' | 'daily';
  onTabChange: (tab: 'indoor' | 'tree' | 'daily') => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: 'indoor', name: 'Indoor', icon: Timer },
    { id: 'tree', name: 'Tree', icon: CircleDot },
    { id: 'daily', name: 'Daily', icon: Calendar },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] bg-brand-bg/95 backdrop-blur-xl border-t border-brand-outline-variant/30 flex items-center justify-around h-[98px] px-6 z-40 rounded-t-[32px] shadow-[0_-20px_40px_rgba(115,92,0,0.05)]">
      {tabs.map(({ id, name, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={cn(
            "flex flex-col items-center justify-center transition-all duration-300 w-20 h-full -mt-4",
            activeTab === id ? "text-brand-primary" : "text-brand-outline opacity-40 hover:opacity-100"
          )}
        >
          <div className={cn(
            "transition-transform duration-300 flex items-center justify-center mb-1",
            activeTab === id ? "scale-[1.1]" : "scale-100"
          )}>
            <Icon size={26} strokeWidth={activeTab === id ? 2.5 : 1.5} />
          </div>
          <span className={cn(
            "text-[10px] tracking-[0.2em] uppercase transition-all duration-300",
            activeTab === id ? "font-bold scale-[1.1] translate-y-0.5" : "font-normal scale-100"
          )}>
            {name}
          </span>
        </button>
      ))}
    </nav>
  );
}
