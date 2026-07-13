import React from "react";
import { Sparkles, History, Layers } from "lucide-react";

interface HeaderProps {
  onToggleHistory: () => void;
  hasHistory: boolean;
  onReset: () => void;
}

export default function Header({ onToggleHistory, hasHistory, onReset }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200 bg-stone-50/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onReset} id="header-logo-container">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-900 text-stone-100 shadow-sm" id="header-logo">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight text-stone-900 uppercase">
              Brand Builder
            </h1>
            <p className="text-xs font-mono text-stone-500">
              Visual Consistency Engine
            </p>
          </div>
        </div>

        {/* Action Controls & Model Status */}
        <div className="flex items-center space-x-4">
          <div className="hidden items-center space-x-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 border border-amber-200/50 sm:flex" id="model-status-badge">
            <Sparkles className="h-3 w-3 text-amber-600" />
            <span>Powered by Nano-Banana</span>
          </div>

          <button
            onClick={onToggleHistory}
            className="relative flex items-center space-x-2 rounded-full border border-stone-200 bg-white px-4 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-all shadow-sm"
            id="toggle-history-btn"
          >
            <History className="h-4 w-4 text-stone-500" />
            <span>Campaigns</span>
            {hasHistory && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
