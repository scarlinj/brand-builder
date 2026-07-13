import React, { useState } from "react";
import { Sparkles, ArrowRight, Check, Package, Palette, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";

interface WizardProps {
  onGenerateMaster: (data: {
    description: string;
    brandName: string;
    category: string;
  }) => Promise<void>;
  isLoading: boolean;
  sandboxMode?: boolean;
}

const CATEGORIES = [
  { id: "Design", label: "Home & Furniture", icon: "🛋️" },
  { id: "Tech", label: "Technology & Gadgets", icon: "⚡" },
  { id: "Beauty", label: "Cosmetics & Beauty", icon: "🌱" },
  { id: "Apparel", label: "Fashion & Apparel", icon: "👟" },
];

const STYLES = [
  {
    name: "Nordic Minimalist",
    description: "Soft warm light, clean wood & matte texture, stone textures",
    suffix: "Nordic minimalist design, soft natural lighting, earthy textures, ceramic matte finish, warm white backdrop",
  },
  {
    name: "Futuristic Matte Black",
    description: "Sleek dark finish, dramatic studio lighting, metallic details",
    suffix: "Sleek industrial futuristic design, dark brushed metal, obsidian black matte textures, sharp rim lights, carbon fiber accents",
  },
  {
    name: "Organic Botanical",
    description: "Earthy, green, soft natural leaves, raw limestone base",
    suffix: "Eco-friendly sustainable styling, raw concrete pedestal, fresh green eucalyptus leaves, bright natural daylight, dew drops",
  },
  {
    name: "Cyberpunk Neon",
    description: "Moody, high contrast, vibrant electric blue & magenta hues",
    suffix: "Modern hyper-tech design, glass refraction, neon ambient glow, dark polished glass surface, sharp futuristic styling",
  },
];

const SUGGESTIONS = [
  {
    title: "Eco Sustainable Sneaker",
    brand: "Lumen",
    category: "Apparel",
    styleIndex: 2,
    description: "A futuristic running shoe made of recycled organic knit mesh on a curved hollow cellular sole, detailed stitching.",
  },
  {
    title: "Geometric Ceramic Teapot",
    brand: "Sora",
    category: "Design",
    styleIndex: 0,
    description: "A modular, flat-topped matte grey clay teapot with a circular raw wood handle and an ultra-fine angular pouring spout.",
  },
  {
    title: "Brushed Aluminum Earbuds",
    brand: "Helix",
    category: "Tech",
    styleIndex: 1,
    description: "Sleek wireless earbuds resting on a pocket-sized charging pod with glowing circular light indicator rings.",
  },
];

export default function Wizard({ onGenerateMaster, isLoading, sandboxMode }: WizardProps) {
  const [brandName, setBrandName] = useState("");
  const [category, setCategory] = useState("Design");
  const [rawDescription, setRawDescription] = useState("");
  const [selectedStyleIndex, setSelectedStyleIndex] = useState<number | null>(null);

  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const loadingPhrases = [
    "Spinning up Nano-Banana generation model...",
    "Arranging professional studio lighting grid...",
    "Calibrating high-aperture 85mm prime lens...",
    "Excluding human subjects and figures from background...",
    "Rendering clean 1:1 master product showcase...",
    "Polishing matte surfaces and ambient occlusions...",
  ];

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingTextIndex(0);
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % loadingPhrases.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleApplySuggestion = (sug: typeof SUGGESTIONS[0]) => {
    setBrandName(sug.brand);
    setCategory(sug.category);
    setRawDescription(sug.description);
    setSelectedStyleIndex(sug.styleIndex);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawDescription) return;

    let finalDescription = rawDescription;
    if (selectedStyleIndex !== null) {
      finalDescription += `, styled with ${STYLES[selectedStyleIndex].suffix}`;
    }

    onGenerateMaster({
      description: finalDescription,
      brandName: brandName || "Generic",
      category,
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12" id="brand-builder-wizard-container">
      {/* Introduction Hero Section */}
      <div className="text-center mb-10 md:mb-12">
        <span className="inline-flex items-center space-x-1.5 rounded-full bg-slate-900/60 px-3 py-1 text-xs font-mono text-slate-400 border border-white/10">
          <Package className="h-3.5 w-3.5 text-indigo-400" />
          <span>Stage 01: Master Product Profile</span>
        </span>
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl mt-3 uppercase">
          Design Your Brand Visuals
        </h2>
        <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Enter your product details and choose a style profile. The Nano-Banana model will generate a high-fidelity reference shot, which is then used to consistently build your advertising campaign assets.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Config Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md p-6 shadow-xl space-y-5" id="wizard-form">
            {/* Brand Name Input */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="brand-name" className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                  Brand / Product Name
                </label>
                <input
                  type="text"
                  id="brand-name"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Aether, Solis, Peak"
                  maxLength={40}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                  Category Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex items-center space-x-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                        category === cat.id
                          ? "border-indigo-500 bg-indigo-600/20 text-indigo-400"
                          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Description Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="product-desc" className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Product Details & Materials
                </label>
                <span className="text-xs font-mono text-slate-500">
                  {rawDescription.length}/300
                </span>
              </div>
              <textarea
                id="product-desc"
                required
                value={rawDescription}
                onChange={(e) => setRawDescription(e.target.value.slice(0, 300))}
                rows={4}
                placeholder="Describe the product shape, core textures, materials, and distinct visual markings. (e.g. A sleek titanium reusable flask with leather wrap handle, polished gold cap...)"
                className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none leading-relaxed"
              />
            </div>

            {/* Design Style Preset Grid */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2">
                Aesthetic Style Profile
              </label>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {STYLES.map((style, idx) => (
                  <button
                    key={style.name}
                    type="button"
                    onClick={() => setSelectedStyleIndex(selectedStyleIndex === idx ? null : idx)}
                    className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all cursor-pointer ${
                      selectedStyleIndex === idx
                        ? "border-indigo-500 bg-indigo-600/10"
                        : "border-white/5 bg-slate-900/30 hover:bg-slate-900/50 hover:border-white/10"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-display text-xs font-semibold text-white">
                        {style.name}
                      </span>
                      {selectedStyleIndex === idx ? (
                        <Check className="h-3.5 w-3.5 text-indigo-400" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border border-white/10" />
                      )}
                    </div>
                    <span className="mt-1.5 text-[11px] text-slate-400 leading-normal">
                      {style.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* No-People Warning Banner */}
            <div className="flex items-start space-x-2.5 rounded-xl bg-amber-500/10 p-3.5 border border-amber-500/20" id="strict-warning-banner">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="text-xs text-amber-200/90 leading-relaxed">
                <span className="font-semibold text-amber-400">Strict No-People Constraint Active:</span> The generation pipelines are configured to exclude human models, hands, or figures from all shots, ensuring the spotlight is 100% focused on your product.
              </div>
            </div>

            {/* Submit / Trigger Button */}
            <button
              type="submit"
              disabled={isLoading || !rawDescription}
              className={`flex w-full items-center justify-center space-x-2 rounded-xl py-4 text-sm font-semibold text-white shadow-lg transition-all cursor-pointer ${
                isLoading || !rawDescription
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                  : sandboxMode
                    ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/25 hover:shadow-xl active:scale-[0.98]"
                    : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/25 hover:shadow-xl active:scale-[0.98]"
              }`}
              id="generate-master-submit-btn"
            >
              {isLoading ? (
                <div className="flex flex-col items-center py-1">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-white" />
                </div>
              ) : (
                <>
                  <span>{sandboxMode ? "Visualize Brand Set (Sandbox Mode)" : "Generate Brand Set (Live Model)"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Rendering Loading Wizard Status */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/5 bg-slate-900/30 p-5 text-center shadow-inner"
              id="wizard-loading-status"
            >
              <p className="text-xs font-mono text-indigo-400 uppercase tracking-widest animate-pulse">
                Processing Creative Assets
              </p>
              <p className="mt-1.5 text-sm font-semibold text-white transition-all duration-500" id="wizard-loading-text">
                {loadingPhrases[loadingTextIndex]}
              </p>
              <div className="mt-3.5 mx-auto h-1 w-48 overflow-hidden rounded-full bg-slate-850">
                <div className="h-full bg-indigo-500 animate-infinite-loading rounded-full" style={{ width: "60%" }}></div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Predefined Inspirations */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/5 bg-slate-900/20 p-5">
            <h3 className="font-display text-sm font-semibold text-white flex items-center space-x-1.5 mb-3">
              <Palette className="h-4 w-4 text-slate-400" />
              <span>Inspiration Templates</span>
            </h3>
            <p className="text-xs text-slate-400 leading-normal mb-4">
              Need a starting point? Click one of our custom designed concepts to instantly populate the Brand profile settings.
            </p>

            <div className="space-y-2.5">
              {SUGGESTIONS.map((sug) => (
                <button
                  key={sug.title}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleApplySuggestion(sug)}
                  className="w-full text-left rounded-xl border border-white/10 bg-white/5 p-3.5 shadow-sm hover:border-white/20 hover:bg-white/10 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition">
                      {sug.title}
                    </span>
                    <span className="text-[10px] font-mono rounded bg-white/10 px-1.5 py-0.5 text-slate-400">
                      {sug.brand}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {sug.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
