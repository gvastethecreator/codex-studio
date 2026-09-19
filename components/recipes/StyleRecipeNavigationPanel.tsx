import { IconChevronLeft as ChevronLeft } from '@tabler/icons-react';
import React from 'react';

import type { StyleTabId } from './styleTabRouting';

export type StyleTheme = { color: string; bg: string; border: string; text: string };

export interface StyleRecipeNavigationItem {
  id: string;
  label: string;
  caption: string;
  countLabel: string;
  tabId: StyleTabId;
  theme: StyleTheme;
  icon: React.ReactNode;
}

export interface StyleRecipeNavigationSection {
  id: string;
  title: string;
  items: StyleRecipeNavigationItem[];
}

export interface StyleRecipeNavigationPanelProps {
  sections: StyleRecipeNavigationSection[];
  activeTabId: StyleTabId;
  onOpen: (tabId: StyleTabId) => void;
  onClose: () => void;
}

export function StyleRecipeNavigationPanel({
  sections,
  activeTabId,
  onOpen,
  onClose,
}: StyleRecipeNavigationPanelProps) {
  return (
    <aside data-style-detail-navigation className="hidden min-h-0 min-w-0 lg:block">
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[6px] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-[color:var(--wb-line)] px-3">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[color:var(--wb-muted)]">
              Style Map
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-style-detail-navigation-toggle
            className="flex size-7 shrink-0 items-center justify-center rounded-[6px] border border-[color:var(--wb-line)] bg-white/[0.035] text-[color:var(--wb-muted)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)]"
            aria-label="Hide style map"
            title="Hide style map"
          >
            <ChevronLeft size={14} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2 custom-scrollbar">
          {sections.map((section) => (
            <div key={section.id} className="mb-3 last:mb-0">
              <div className="mb-1.5 flex items-center gap-2 px-1">
                <span className="h-px flex-1 bg-white/6" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[color:var(--wb-dim)]">
                  {section.title}
                </span>
                <span className="h-px flex-1 bg-white/6" />
              </div>
              <div className="flex flex-col gap-1">
                {section.items.map((item) => {
                  const active = activeTabId === item.tabId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-style-detail-nav-item={item.tabId}
                      data-style-detail-nav-active={active ? 'true' : 'false'}
                      onClick={() => onOpen(item.tabId)}
                      className={`group/nav flex min-h-9 w-full items-center gap-2 rounded-[6px] border px-2 py-1.5 text-left outline-none transition-[background-color,border-color,transform,color] duration-150 focus-visible:ring-2 focus-visible:ring-white/30 ${
                        active
                          ? 'border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] text-[color:var(--wb-ink)]'
                          : 'border-transparent bg-transparent text-[color:var(--wb-muted)] hover:border-[color:var(--wb-border)] hover:bg-white/[0.045] hover:text-[color:var(--wb-ink)]'
                      }`}
                    >
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded-[5px] border border-[color:var(--wb-line)] bg-white/[0.035] ${item.theme.text}`}
                      >
                        {item.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-[10px] font-black uppercase tracking-normal ${
                            active ? item.theme.text : 'text-[color:var(--wb-ink)] group-hover/nav:text-[color:var(--wb-ink)]'
                          }`}
                        >
                          {item.label}
                        </span>
                        <span className="block truncate text-[9px] font-medium text-[color:var(--wb-dim)]">
                          {item.caption}
                        </span>
                      </span>
                      <span
                        className={`rounded-[5px] border border-[color:var(--wb-line)] px-1.5 py-0.5 text-[8px] font-black tabular-nums ${active ? `${item.theme.bg} text-[color:var(--wb-ink)]` : 'bg-white/[0.035] text-[color:var(--wb-muted)]'}`}
                        style={
                          active
                            ? ({ '--tw-bg-opacity': '0.68' } as React.CSSProperties)
                            : undefined
                        }
                      >
                        {item.countLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
