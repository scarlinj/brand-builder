import React, { useState } from "react";
import { Download, Play, Eye, RotateCcw, Sparkles, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BrandProduct, MediumShot } from "../types";

interface MediumsGridProps {
  product: BrandProduct;
  shots: MediumShot[];
  onGenerateMedium: (mediumName: string) => Promise<void>;
  onReset: () => void;
}

const AD_MEDIUMS = [
  {
    name: "Billboard",
    desc: "16:9 Widescreen high-highway billboard structure display",
    aspectClass: "aspect-video",
    ratioLabel: "16:9",
    icon: "🏙️",
  },
  {
    name: "Newspaper",
    desc: "3:4 Vintage newsprint layout with halftone inks",
    aspectClass: "aspect-[3/4]",
    ratioLabel: "3:4",
    icon: "📰",
  },
  {
    name: "Social Post",
    desc: "1:1 Modern, clean social flatlay marketing grid ad",
    aspectClass: "aspect-square",
    ratioLabel: "1:1",
    icon: "📱",
  },
  {
    name: "Magazine Ad",
    desc: "3:4 Glossy premium luxury print layout, spacious margins",
    aspectClass: "aspect-[3/4]",
    ratioLabel: "3:4",
    icon: "📖",
  },
  {
    name: "Bus Shelter",
    desc: "9:16 Ambient illuminated glass lightbox display at twilight",
    aspectClass: "aspect-[9/16]",
    ratioLabel: "9:16",
    icon: "🚏",
  },
];

export default function MediumsGrid({ product, shots, onGenerateMedium, onReset }: MediumsGridProps) {
  const [selectedShot, setSelectedShot] = useState<MediumShot | null>(null);

  const getShotState = (mediumName: string) => {
    return shots.find((s) => s.mediumName.toLowerCase() === mediumName.toLowerCase());
  };

  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" id="campaign-visualizer-section">
      {/* Visualizer Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/10 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              Active Campaign
            </span>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
              {product.category}
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-2 uppercase">
            {product.brandName} Campaign Builder
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Imagine this product placed across different channels. The engine uses the master reference photo to preserve details.
          </p>
        </div>

        <button
          onClick={onReset}
          className="flex items-center justify-center space-x-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition duration-250 cursor-pointer shadow-sm"
          id="start-over-btn"
        >
          <RotateCcw className="h-4 w-4" />
          <span>New Product Profile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left column: Master reference shot (occupies 4/12 grid) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md p-5 shadow-xl sticky top-24">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-3.5">
              Master Reference Shot
            </h3>

            {product.masterImageUrl ? (
              <div className="relative overflow-hidden rounded-xl bg-slate-950 border border-white/5 group shadow-inner" id="master-image-container">
                <img
                  src={product.masterImageUrl}
                  alt={product.description}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover transition duration-500 group-hover:scale-102"
                />
                <button
                  onClick={() => handleDownload(product.masterImageUrl!, `${product.brandName}-master.png`)}
                  className="absolute bottom-3 right-3 rounded-full bg-slate-900/90 p-2 text-white hover:bg-indigo-600 shadow-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                  title="Download Master Shot"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-xl bg-slate-950 border-2 border-dashed border-white/5 text-slate-500">
                <span>No master image</span>
              </div>
            )}

            <div className="mt-5 space-y-4 border-t border-white/5 pt-4">
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Brand Identity</h4>
                <p className="text-lg font-display font-bold text-white mt-0.5">{product.brandName}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Prompt Seed</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-white/5 line-clamp-4 overflow-y-auto max-h-32">
                  {product.description}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-start space-x-2">
                <div className="rounded-full bg-emerald-500/10 p-0.5 mt-0.5">
                  <Check className="h-3 w-3 text-emerald-400" />
                </div>
                <p className="text-[11px] text-emerald-300 leading-normal">
                  Details are locked. Ready to imagine across advertising mediums below.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Medium generation grid (occupies 8/12 grid) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="mediums-grid-container">
            {AD_MEDIUMS.map((med) => {
              const state = getShotState(med.name);
              const isLoading = state?.status === "loading";
              const isSuccess = state?.status === "success";
              const isError = state?.status === "error";

              return (
                <div
                  key={med.name}
                  className={`rounded-2xl border bg-slate-900/30 p-4.5 shadow-xl flex flex-col justify-between transition-all duration-300 ${
                    isSuccess
                      ? "border-white/10 bg-slate-900/50 hover:border-white/20 hover:shadow-2xl"
                      : "border-white/5 hover:border-white/10"
                  }`}
                  id={`medium-card-${med.name.toLowerCase().replace(" ", "-")}`}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-lg">{med.icon}</span>
                        <div>
                          <h3 className="font-display text-sm font-semibold text-white">
                            {med.name}
                          </h3>
                          <p className="text-[10px] font-mono text-slate-500">
                            Aspect Ratio: {med.ratioLabel}
                          </p>
                        </div>
                      </div>

                      {/* Status Badges */}
                      {isSuccess && (
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                          Built
                        </span>
                      )}
                      {isLoading && (
                        <span className="inline-flex items-center space-x-1 rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20 animate-pulse">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                          <span>Imaging...</span>
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-400 leading-normal">
                      {med.desc}
                    </p>

                    {/* Inner Stage (Visualizer Box) */}
                    <div
                      className={`relative overflow-hidden rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center ${med.aspectClass}`}
                    >
                      {isSuccess && state.imageUrl ? (
                        <>
                          <img
                            src={state.imageUrl}
                            alt={`${med.name} Ad`}
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 h-full w-full object-cover transition hover:scale-101"
                          />
                          {/* Hover action overlay */}
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 hover:opacity-100 transition duration-300 flex items-center justify-center space-x-2.5 backdrop-blur-xs">
                            <button
                              onClick={() => setSelectedShot(state)}
                              className="rounded-full bg-white p-2.5 text-slate-900 hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer"
                              title="View Creative Mockup"
                            >
                              <Eye className="h-4.5 w-4.5" />
                            </button>
                            <button
                              onClick={() => handleDownload(state.imageUrl!, `${product.brandName}-${med.name.toLowerCase().replace(" ", "-")}.png`)}
                              className="rounded-full bg-indigo-600 p-2.5 text-white hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer"
                              title="Download Asset"
                            >
                              <Download className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </>
                      ) : isLoading ? (
                        <div className="flex flex-col items-center justify-center space-y-3 p-4 text-center">
                          <div className="relative flex h-10 w-10 items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-2 border-white/10 border-t-indigo-500 animate-spin" />
                            <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                          </div>
                          <span className="text-[10px] font-mono text-indigo-400 animate-pulse">
                            Maintaining consistency...
                          </span>
                        </div>
                      ) : isError ? (
                        <div className="flex flex-col items-center justify-center p-4 text-center text-slate-400">
                          <AlertCircle className="h-5 w-5 text-red-500 mb-1.5" />
                          <span className="text-[10px] font-mono text-red-400 leading-normal max-w-[85%]">
                            {state.error || "Generation failed"}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                          <span className="text-2xl opacity-50">{med.icon}</span>
                          <span className="text-[10px] font-mono text-slate-500">
                            Not yet visualized
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Trigger Action */}
                  <div className="mt-4 border-t border-white/5 pt-3.5">
                    <button
                      onClick={() => onGenerateMedium(med.name)}
                      disabled={isLoading}
                      className={`flex w-full items-center justify-center space-x-1.5 rounded-xl py-2.5 px-3 text-xs font-semibold shadow-md transition duration-200 cursor-pointer ${
                        isLoading
                          ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                          : isSuccess
                          ? "bg-white/5 text-slate-200 hover:bg-white/10 border border-white/10"
                          : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-900/20"
                      }`}
                    >
                      <Play className="h-3.5 w-3.5 shrink-0" />
                      <span>{isSuccess ? "Regenerate Visual" : `Imagine as ${med.name}`}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Campaign Visualizer Lightbox / Mockup Modal */}
      <AnimatePresence>
        {selectedShot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedShot(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4 md:p-8 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 p-6 md:p-8 shadow-2xl flex flex-col items-center text-slate-300"
            >
              {/* Modal Header */}
              <div className="w-full flex items-center justify-between mb-5 border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-semibold bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-900/30">
                    AD AGENCY PROTOTYPE
                  </span>
                  <h4 className="font-display text-lg font-bold mt-1 text-white">
                    {product.brandName} &mdash; {selectedShot.mediumName} Showcase
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedShot(null)}
                  className="rounded-full bg-white/5 hover:bg-white/10 p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  &times; Close
                </button>
              </div>

              {/* Dynamic Showcase Stage / Frameworks for specific mediums */}
              <div className="w-full flex-1 flex items-center justify-center py-4">
                {/* 1. BILLBOARD SHOWCASE */}
                {selectedShot.mediumName.toLowerCase() === "billboard" && (
                  <div className="w-full max-w-2xl bg-slate-950 p-4 rounded-xl border border-white/5 shadow-2xl flex flex-col items-center">
                    {/* Metal support truss frame */}
                    <div className="w-full border-4 border-slate-800 bg-slate-900 rounded overflow-hidden aspect-video shadow-2xl relative">
                      <img
                        src={selectedShot.imageUrl}
                        alt="Billboard Render"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {/* Realistic lighting spotlight cones */}
                      <div className="absolute top-0 left-1/4 w-32 h-16 bg-white/5 blur-lg pointer-events-none origin-top -rotate-45" />
                      <div className="absolute top-0 right-1/4 w-32 h-16 bg-white/5 blur-lg pointer-events-none origin-top rotate-45" />
                    </div>
                    {/* Steel beam support columns */}
                    <div className="h-16 w-3 bg-slate-800 shadow-inner mt-px" />
                    <div className="h-2 w-16 bg-slate-700 rounded-full" />
                  </div>
                )}

                {/* 2. NEWSPAPER SHOWCASE */}
                {selectedShot.mediumName.toLowerCase() === "newspaper" && (
                  <div className="w-full max-w-md bg-[#f4f1ea] text-stone-900 p-6 md:p-8 rounded shadow-2xl border border-stone-200 font-serif relative overflow-hidden">
                    {/* Subtle paper grain background pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] opacity-2 pointer-events-none" />
                    <div className="border-b-2 border-double border-stone-900 pb-2 mb-4 text-center">
                      <h5 className="font-bold text-lg tracking-widest uppercase">The Daily Chronicle</h5>
                      <div className="flex justify-between text-[10px] font-mono mt-1 px-1 border-t border-stone-900 pt-0.5">
                        <span>EST. 1894</span>
                        <span>WEATHER: CALM</span>
                        <span>PRICE: $0.15</span>
                      </div>
                    </div>
                    {/* Newspaper headline */}
                    <h6 className="font-bold text-xl md:text-2xl leading-none text-center tracking-tight mb-4 uppercase">
                      DESIGN EXCELLENCE UNVEILED IN CITY CENTRE
                    </h6>
                    <div className="grid grid-cols-3 gap-4">
                      {/* Left side mock newspaper text */}
                      <div className="col-span-1 text-[8px] leading-relaxed text-stone-700 space-y-2 pr-2 border-r border-stone-300">
                        <p className="indent-2 font-semibold">Today marks a significant milestone in design history.</p>
                        <p>Industry pioneers have revealed their newest aesthetic breakthroughs this morning.</p>
                        <p>Observers are stunned by the absolute visual consistency achieved across standard printing presses.</p>
                      </div>
                      {/* Halftone ad photo in center */}
                      <div className="col-span-2">
                        <div className="border border-stone-900 p-1 bg-white">
                          <img
                            src={selectedShot.imageUrl}
                            alt="Newspaper Render"
                            referrerPolicy="no-referrer"
                            className="w-full h-auto grayscale contrast-125"
                          />
                        </div>
                        <p className="text-[8px] font-mono mt-1 text-center text-stone-500 italic">
                          Fig 1.1: The newly designed {product.brandName} model.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SOCIAL POST SHOWCASE */}
                {selectedShot.mediumName.toLowerCase() === "social post" && (
                  <div className="w-full max-w-sm border border-stone-850 bg-black rounded-3xl overflow-hidden shadow-2xl p-3">
                    <div className="bg-stone-900 rounded-2xl overflow-hidden pb-4">
                      {/* Header bar */}
                      <div className="flex items-center space-x-2.5 p-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center font-bold text-xs text-white">
                          {product.brandName[0]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-stone-100">{product.brandName.toLowerCase()}</p>
                          <p className="text-[9px] text-stone-400">Sponsored</p>
                        </div>
                      </div>
                      {/* Post body image */}
                      <div className="aspect-square bg-stone-950 relative">
                        <img
                          src={selectedShot.imageUrl}
                          alt="Social Render"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Icons bar */}
                      <div className="flex items-center justify-between px-3.5 py-3">
                        <div className="flex space-x-3.5 text-stone-200">
                          <span>❤️</span>
                          <span>💬</span>
                          <span>✈️</span>
                        </div>
                        <span className="text-stone-300">🔖</span>
                      </div>
                      {/* Comments section */}
                      <div className="px-3.5 text-xs text-stone-300 space-y-1">
                        <p>
                          <span className="font-semibold text-stone-100 mr-1.5">{product.brandName.toLowerCase()}</span>
                          Introducing the next phase of design consistency. Experience premium detail without human intervention.
                        </p>
                        <p className="text-[10px] text-stone-500 uppercase tracking-wide pt-1">
                          View all 42 comments
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. MAGAZINE AD SHOWCASE */}
                {selectedShot.mediumName.toLowerCase() === "magazine ad" && (
                  <div className="w-full max-w-2xl aspect-[1.414/1] bg-white rounded shadow-2xl overflow-hidden flex border border-stone-200 relative">
                    {/* Spine shadow split */}
                    <div className="absolute inset-y-0 left-1/2 w-6 bg-gradient-to-r from-black/15 via-black/35 to-black/15 -translate-x-1/2 z-10" />
                    {/* Left page */}
                    <div className="w-1/2 bg-stone-50 p-6 flex flex-col justify-between text-stone-900 border-r border-stone-200">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-semibold">
                          ISSUE 04 / EDITION VII
                        </span>
                        <h5 className="font-display text-4xl font-light tracking-tight mt-6 leading-none text-stone-950">
                          FORM<br/>&amp; MATIERE.
                        </h5>
                      </div>
                      <p className="text-[10px] text-stone-450 leading-relaxed font-sans max-w-[85%]">
                        Exploring the boundaries of computational aesthetics, material replication, and clean compositions in product sculpture.
                      </p>
                    </div>
                    {/* Right page */}
                    <div className="w-1/2 relative bg-stone-100 flex items-center justify-center p-3">
                      <img
                        src={selectedShot.imageUrl}
                        alt="Magazine Render"
                        referrerPolicy="no-referrer"
                        className="w-full h-auto max-h-full object-contain shadow"
                      />
                    </div>
                  </div>
                )}

                {/* 5. BUS SHELTER SHOWCASE */}
                {selectedShot.mediumName.toLowerCase() === "bus shelter" && (
                  <div className="h-[480px] w-64 bg-slate-950 p-3 rounded-2xl border border-white/10 shadow-2xl relative flex flex-col">
                    {/* Shelter poster illuminated frame */}
                    <div className="flex-1 rounded-lg border-2 border-slate-700 bg-slate-900 overflow-hidden relative shadow-inner">
                      <img
                        src={selectedShot.imageUrl}
                        alt="Bus Shelter Render"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {/* Glass glare and raindrop layer */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 opacity-80 pointer-events-none" />
                      <div className="absolute top-0 inset-x-0 h-10 bg-white/5 blur-xs pointer-events-none" />
                    </div>
                    {/* Digital display text */}
                    <div className="mt-2.5 flex justify-between text-[9px] font-mono text-slate-500 px-1">
                      <span>NEXT BUS: 4 MIN</span>
                      <span>SHELTER AD 03B</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="w-full mt-6 flex justify-center space-x-4 border-t border-white/10 pt-5">
                <button
                  onClick={() => handleDownload(selectedShot.imageUrl!, `${product.brandName}-${selectedShot.mediumName.toLowerCase()}.png`)}
                  className="flex items-center space-x-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-100 transition shadow cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download High-Res Asset</span>
                </button>
                <button
                  onClick={() => setSelectedShot(null)}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
