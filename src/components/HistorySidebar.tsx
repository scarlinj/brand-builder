import React from "react";
import { Folder, Trash2, Calendar, ChevronRight, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BrandProject } from "../types";

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: BrandProject[];
  onSelectProject: (project: BrandProject) => void;
  onDeleteProject: (id: string) => void;
}

export default function HistorySidebar({
  isOpen,
  onClose,
  projects,
  onSelectProject,
  onDeleteProject,
}: HistorySidebarProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-slate-900/95 border-l border-white/10 shadow-2xl flex flex-col backdrop-blur-md text-slate-300"
          >
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b border-white/10 bg-slate-950/40 px-5 shadow-xs">
              <div className="flex items-center space-x-2.5">
                <Folder className="h-5 w-5 text-indigo-400" />
                <h3 className="font-display text-base font-bold text-white uppercase tracking-wider">
                  Brand Campaigns
                </h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-full bg-white/5 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Campaign List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
                  <div className="rounded-full bg-slate-950 p-3 mb-3 border border-white/5">
                    <Folder className="h-6 w-6 text-slate-600" />
                  </div>
                  <h4 className="font-display text-sm font-semibold text-slate-300">No campaigns yet</h4>
                  <p className="mt-1.5 text-xs text-slate-400 max-w-[200px] leading-relaxed">
                    Once you configure a product profile, your generated brand assets will show up here.
                  </p>
                </div>
              ) : (
                projects.map((proj) => {
                  const successfulShots = proj.shots.filter((s) => s.status === "success").length;

                  return (
                    <div
                      key={proj.id}
                      className="group relative rounded-xl border border-white/5 bg-slate-900/30 p-4 shadow-sm hover:border-white/20 hover:bg-slate-900/50 transition duration-300"
                    >
                      <div
                        onClick={() => {
                          onSelectProject(proj);
                          onClose();
                        }}
                        className="cursor-pointer space-y-2.5"
                      >
                        {/* Title and Badge */}
                        <div className="flex items-start justify-between pr-6">
                          <div>
                            <h4 className="font-display text-sm font-bold text-white group-hover:text-indigo-400 transition">
                              {proj.product.brandName}
                            </h4>
                            <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                              {proj.product.category}
                            </p>
                          </div>
                          <span className="text-[10px] font-mono rounded bg-white/5 px-2 py-0.5 text-slate-300 border border-white/10 shrink-0">
                            {successfulShots} {successfulShots === 1 ? "asset" : "assets"}
                          </span>
                        </div>

                        {/* Prompt Description */}
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {proj.product.description}
                        </p>

                        {/* Thumbnail strips of generated shots */}
                        <div className="flex items-center space-x-2 pt-1">
                          {proj.product.masterImageUrl && (
                            <img
                              src={proj.product.masterImageUrl}
                              alt="Master Thumbnail"
                              referrerPolicy="no-referrer"
                              className="h-8 w-8 rounded bg-slate-950 border border-white/5 object-cover"
                            />
                          )}
                          {proj.shots.map(
                            (shot) =>
                              shot.imageUrl && (
                                <img
                                  key={shot.id}
                                  src={shot.imageUrl}
                                  alt={shot.mediumName}
                                  referrerPolicy="no-referrer"
                                  className="h-8 w-8 rounded bg-slate-950 border border-white/5 object-cover"
                                />
                              )
                          )}
                        </div>

                        {/* Date and Navigation indicators */}
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-white/5">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 text-slate-600" />
                            <span>{formatDate(proj.createdAt)}</span>
                          </span>
                          <span className="flex items-center text-slate-300 group-hover:translate-x-0.5 transition duration-300">
                            <span>Open</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>

                      {/* Absolute Trash Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(proj.id);
                        }}
                        className="absolute top-3 right-3 rounded-md p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition opacity-0 group-hover:opacity-100"
                        title="Delete Campaign"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Sticky warning on bottom */}
            {projects.length > 0 && (
              <div className="border-t border-white/10 bg-slate-950/40 p-4">
                <div className="flex items-start space-x-2 rounded-lg bg-slate-950/20 p-3 border border-white/5">
                  <AlertCircle className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Campaigns are cached in your local browser storage. Clearing browser data will reset these visual portfolios.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
