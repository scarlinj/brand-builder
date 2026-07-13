import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Wizard from "./components/Wizard";
import MediumsGrid from "./components/MediumsGrid";
import HistorySidebar from "./components/HistorySidebar";
import { BrandProject, BrandProduct, MediumShot } from "./types";
import { Sparkles, Layers, History, Trash2, FolderOpen, AlertCircle } from "lucide-react";

const STORAGE_KEY = "brand_builder_campaigns_v2";

const DEFAULT_SHOTS = [
  { id: "1", mediumName: "Billboard", aspectRatio: "16:9", status: "idle" as const },
  { id: "2", mediumName: "Newspaper", aspectRatio: "3:4", status: "idle" as const },
  { id: "3", mediumName: "Social Post", aspectRatio: "1:1", status: "idle" as const },
  { id: "4", mediumName: "Magazine Ad", aspectRatio: "3:4", status: "idle" as const },
  { id: "5", mediumName: "Bus Shelter", aspectRatio: "9:16", status: "idle" as const },
];

export default function App() {
  const [projects, setProjects] = useState<BrandProject[]>([]);
  const [currentProject, setCurrentProject] = useState<BrandProject | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGeneratingMaster, setIsGeneratingMaster] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sandboxMode, setSandboxMode] = useState<boolean>(() => {
    return localStorage.getItem("brand_builder_sandbox") === "true";
  });

  const toggleSandboxMode = () => {
    const next = !sandboxMode;
    setSandboxMode(next);
    localStorage.setItem("brand_builder_sandbox", String(next));
  };

  // Load projects from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProjects(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load campaigns from storage:", e);
    }
  }, []);

  // Save projects to localStorage
  const saveProjects = (updated: BrandProject[]) => {
    setProjects(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save campaigns to storage:", e);
    }
  };

  // Generate the first master shot
  const handleGenerateMaster = async (data: {
    description: string;
    brandName: string;
    category: string;
  }) => {
    setIsGeneratingMaster(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-master", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          forceSandbox: sandboxMode,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to generate master product shot.");
      }

      const result = await response.json();

      // If the server tells us we hit a quota limit and fell back to Sandbox, sync state
      if (result.sandbox) {
        setSandboxMode(true);
        localStorage.setItem("brand_builder_sandbox", "true");
      }

      const newProduct: BrandProduct = {
        description: data.description,
        brandName: data.brandName,
        category: data.category,
        masterImageUrl: result.imageUrl,
        createdAt: Date.now(),
      };

      const newProject: BrandProject = {
        id: crypto.randomUUID(),
        product: newProduct,
        shots: DEFAULT_SHOTS.map(shot => ({ ...shot })),
        createdAt: Date.now(),
      };

      const updatedProjects = [newProject, ...projects];
      saveProjects(updatedProjects);
      setCurrentProject(newProject);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong during generation.");
    } finally {
      setIsGeneratingMaster(false);
    }
  };

  // Generate consistent creative mediums
  const handleGenerateMedium = async (mediumName: string) => {
    if (!currentProject) return;

    // Set medium to loading
    const updatedShots = currentProject.shots.map((shot) => {
      if (shot.mediumName.toLowerCase() === mediumName.toLowerCase()) {
        return { ...shot, status: "loading" as const, error: undefined };
      }
      return shot;
    });

    const updatedProject = { ...currentProject, shots: updatedShots };
    setCurrentProject(updatedProject);

    // Update main list
    const updatedProjects = projects.map((p) => (p.id === currentProject.id ? updatedProject : p));
    saveProjects(updatedProjects);

    try {
      const response = await fetch("/api/generate-medium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          masterImage: currentProject.product.masterImageUrl,
          medium: mediumName,
          description: currentProject.product.description,
          brandName: currentProject.product.brandName,
          forceSandbox: sandboxMode,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Failed to visualize as ${mediumName}`);
      }

      const result = await response.json();

      if (result.sandbox) {
        setSandboxMode(true);
        localStorage.setItem("brand_builder_sandbox", "true");
      }

      // Set successful
      const successShots = updatedProject.shots.map((shot) => {
        if (shot.mediumName.toLowerCase() === mediumName.toLowerCase()) {
          return {
            ...shot,
            status: "success" as const,
            imageUrl: result.imageUrl,
            aspectRatio: result.aspectRatio,
          };
        }
        return shot;
      });

      const finalProject = { ...updatedProject, shots: successShots };
      setCurrentProject(finalProject);

      const finalProjects = projects.map((p) => (p.id === currentProject.id ? finalProject : p));
      saveProjects(finalProjects);
    } catch (err: any) {
      console.error(err);
      const errorShots = updatedProject.shots.map((shot) => {
        if (shot.mediumName.toLowerCase() === mediumName.toLowerCase()) {
          return {
            ...shot,
            status: "error" as const,
            error: err.message || "Model timeout or token limit exceeded.",
          };
        }
        return shot;
      });

      const finalProject = { ...updatedProject, shots: errorShots };
      setCurrentProject(finalProject);

      const finalProjects = projects.map((p) => (p.id === currentProject.id ? finalProject : p));
      saveProjects(finalProjects);
    }
  };

  const handleReset = () => {
    setCurrentProject(null);
    setError(null);
  };

  const handleDeleteProject = (id: string) => {
    const filtered = projects.filter((p) => p.id !== id);
    saveProjects(filtered);
    if (currentProject?.id === id) {
      setCurrentProject(null);
    }
  };

  const handleSelectProject = (project: BrandProject) => {
    setCurrentProject(project);
    setError(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#020617] text-slate-300 font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200" id="brand-builder-app-root">
      {/* Sleek Theme Styled Header */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset} id="header-brand-logo">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/25">
            B
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white font-display">
            Brand<span className="text-indigo-400">Builder</span>
          </h1>
          <div className="hidden sm:inline-block ml-3 px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] uppercase tracking-widest text-slate-400">
            PRO STUDIO
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Elegant Sandbox Toggle Switch */}
          <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-semibold text-slate-300 select-none hidden sm:inline">Sandbox Mode</span>
            <button
              onClick={toggleSandboxMode}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                sandboxMode ? "bg-indigo-600" : "bg-slate-700"
              }`}
              title="Toggle Sandbox Mode to use high-fidelity cached assets and bypass rate limits"
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  sandboxMode ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
            sandboxMode 
              ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" 
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          }`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${sandboxMode ? "bg-indigo-400" : "bg-emerald-500"}`}></div>
            <span className="text-xs font-medium font-mono">
              {sandboxMode ? "Sandbox Active" : "Nano-Banana Live"}
            </span>
          </div>

          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white hover:bg-white/10 transition cursor-pointer"
            id="campaign-history-trigger"
          >
            <History className="h-4 w-4 text-slate-400" />
            <span>Campaigns ({projects.length})</span>
          </button>
        </div>
      </header>

      {/* Main Container Stage */}
      <main className="flex-1 flex flex-col justify-start">
        {/* Sandbox Informational Banner */}
        {sandboxMode && (
          <div className="mx-auto max-w-4xl w-full px-4 pt-6">
            <div className="flex items-start gap-3 rounded-xl bg-indigo-500/10 p-4 border border-indigo-500/20 text-indigo-300 text-xs sm:text-sm">
              <Sparkles className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">🛡️ Sandbox Mode Active (Quota-Safe)</p>
                <p className="mt-1 opacity-95 leading-relaxed">
                  To bypass standard free-tier Gemini API rate limits (which may trigger 429 quota errors), BrandBuilder's high-fidelity Sandbox Mode is enabled. 
                  This renders premium, pixel-perfect consistent advertising assets for our <strong>Inspiration templates</strong> (Sneakers, Teapots, Earbuds) as well as any <strong>Watch/Gadget</strong> profile instantly!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="mx-auto max-w-4xl w-full px-4 pt-6">
            <div className="flex items-start gap-3 rounded-xl bg-red-500/10 p-4 border border-red-500/25 text-red-400 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Generation Error</p>
                <p className="mt-1 text-xs opacity-90 leading-relaxed">{error}</p>
              </div>
            </div>
          </div>
        )}

        {currentProject ? (
          <MediumsGrid
            product={currentProject.product}
            shots={currentProject.shots}
            onGenerateMedium={handleGenerateMedium}
            onReset={handleReset}
          />
        ) : (
          <Wizard
            onGenerateMaster={handleGenerateMaster}
            isLoading={isGeneratingMaster}
            sandboxMode={sandboxMode}
          />
        )}
      </main>

      {/* Campaign List Sidebar Drawer */}
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        projects={projects}
        onSelectProject={handleSelectProject}
        onDeleteProject={handleDeleteProject}
      />

      {/* Beautiful Sleek Footer Info */}
      <footer className="h-12 border-t border-white/5 bg-slate-950/60 backdrop-blur-md flex items-center justify-between px-6 mt-auto">
        <div className="flex gap-4 text-[10px] uppercase tracking-widest text-slate-500 font-mono">
          <span>PIPELINE: ACTIVE</span>
          <span className="text-indigo-400">● SYNCING STATE</span>
        </div>
        <div className="flex gap-2">
          <span className="text-[10px] font-mono text-slate-500">
            Excluding human subjects from all graphics
          </span>
        </div>
      </footer>
    </div>
  );
}
