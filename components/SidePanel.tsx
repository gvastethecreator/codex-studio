import React, { useState } from 'react';
import { Settings, Bug, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidePanelProps {
  position: 'left' | 'right';
  label?: string;
  children?: React.ReactNode;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  position,
  label = 'DASHBOARD',
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  // Determine icon based on state and position
  // Collapsed: Show Identity Icon (Bug/Settings)
  // Expanded: Show Collapse Direction (Chevron)
  const Icon = isCollapsed
    ? position === 'left'
      ? Bug
      : Settings
    : position === 'left'
      ? ChevronLeft
      : ChevronRight;

  return (
    <aside
      className={`
        hidden md:flex flex-col h-[calc(100%-1rem)] my-auto transition-all duration-400 ease-out-expo relative z-20 group
        ${isCollapsed ? 'w-14 bg-transparent border-transparent shadow-none pointer-events-none' : 'w-64 lg:w-80 bg-black/80 backdrop-blur-sm border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.2)] pointer-events-auto'}
        ${position === 'left' ? 'ml-2 lg:ml-2' : 'mr-2 lg:mr-2'}
        rounded-2xl
        overflow-hidden
        ${!isCollapsed && 'hover:border-white/10 hover:shadow-[0_30px_60px_rgba(0,0,0,0.4)]'}
      `}
    >
      {/* Header / Toggle Area */}
      <div
        className={`
        h-14 w-full flex items-center px-4 transition-all duration-300
        ${isCollapsed ? 'justify-center border-none' : 'justify-between border-b border-white/5'}
      `}
      >
        {!isCollapsed && (
          <div className="flex gap-1.5 opacity-40">
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
          </div>
        )}

        {!isCollapsed && (
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest absolute left-1/2 -translate-x-1/2 pointer-events-none">
            {label}
          </span>
        )}

        <button
          onClick={toggleCollapse}
          className={`p-2.5 rounded-xl transition-all active:scale-90 pointer-events-auto z-10 cursor-pointer
                ${
                  isCollapsed
                    ? 'text-zinc-500 hover:text-white bg-black/80 backdrop-blur-sm border border-white/10 shadow-lg'
                    : 'text-zinc-600 hover:text-white bg-white/5 ml-auto'
                }
            `}
          title={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
        >
          <Icon size={18} strokeWidth={2} />
        </button>
      </div>

      {/* Contenido Principal */}
      <div
        className={`
        flex-1 p-4 lg:p-5 relative flex flex-col gap-5 overflow-y-auto custom-scrollbar transition-all duration-300 delay-100
        ${isCollapsed ? 'opacity-0 invisible scale-95 translate-y-4' : 'opacity-100 visible scale-100 translate-y-0'}
      `}
      >
        {children}
      </div>

      {/* Footer Decorativo */}
      <div
        className={`h-10 w-full flex items-center justify-center opacity-20 transition-all duration-300 ${isCollapsed ? 'opacity-0' : 'border-t border-white/5'}`}
      >
        <div
          className={`h-0.5 bg-zinc-800 rounded-full transition-all duration-500 ${isCollapsed ? 'w-0' : 'w-16'}`}
        />
      </div>
    </aside>
  );
};
