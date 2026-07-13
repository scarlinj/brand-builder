import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for base64 image transfers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Gemini SDK with User-Agent header for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Model configuration
// gemini-3.1-flash-lite-image is the "nano banana" model requested
const NANO_BANANA_MODEL = "gemini-3.1-flash-lite-image";

// Pre-rendered, high-fidelity Sandbox Assets
// Serves as an elegant, robust fallback when Gemini API keys lack quota (429 errors)
const SANDBOX_ASSETS: Record<string, {
  master: string;
  billboard: string;
  newspaper: string;
  social: string;
  magazine: string;
  busshelter: string;
}> = {
  sneaker: {
    master: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&h=600&q=80",
    billboard: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1200&h=675&q=80",
    newspaper: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&h=800&q=80",
    social: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&h=600&q=80",
    magazine: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&h=800&q=80",
    busshelter: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&h=1066&q=80"
  },
  teapot: {
    master: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&h=600&q=80",
    billboard: "https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&w=1200&h=675&q=80",
    newspaper: "https://images.unsplash.com/photo-1594631252845-29fc4589947e?auto=format&fit=crop&w=600&h=800&q=80",
    social: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&h=600&q=80",
    magazine: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&h=800&q=80",
    busshelter: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&h=1066&q=80"
  },
  earbuds: {
    master: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&h=600&q=80",
    billboard: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&h=675&q=80",
    newspaper: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&h=800&q=80",
    social: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&h=600&q=80",
    magazine: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&h=800&q=80",
    busshelter: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&h=1066&q=80"
  },
  watch: {
    master: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&h=600&q=80",
    billboard: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&h=675&q=80",
    newspaper: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=600&h=800&q=80",
    social: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600&h=600&q=80",
    magazine: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=600&h=800&q=80",
    busshelter: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&h=1066&q=80"
  }
};

// Map prompts to our sandbox options
function getSandboxAssetType(description: string = "", category: string = "", brandName: string = ""): string {
  const text = `${description} ${category} ${brandName}`.toLowerCase();
  if (text.includes("sneaker") || text.includes("shoe") || text.includes("apparel") || text.includes("lumen") || text.includes("fashion")) {
    return "sneaker";
  }
  if (text.includes("teapot") || text.includes("tea") || text.includes("design") || text.includes("sora") || text.includes("furniture") || text.includes("ceramic")) {
    return "teapot";
  }
  if (text.includes("earbud") || text.includes("headphone") || text.includes("audio") || text.includes("tech") || text.includes("helix") || text.includes("gadget")) {
    return "earbuds";
  }
  return "watch";
}

// Map Unsplash master URL back to its key
function getSandboxKeyByUrl(url: string = ""): string | null {
  if (url.includes("1595950653106") || url.includes("sneaker")) return "sneaker";
  if (url.includes("1576092768241") || url.includes("teapot")) return "teapot";
  if (url.includes("1590658268037") || url.includes("earbuds")) return "earbuds";
  if (url.includes("1523275335684") || url.includes("watch")) return "watch";
  return null;
}

// API endpoints
app.post("/api/generate-master", async (req, res) => {
  try {
    const { description, brandName, category, forceSandbox } = req.body;

    if (!description) {
      return res.status(400).json({ error: "Product description is required." });
    }

    // Trigger Sandbox Mode directly if forced
    if (forceSandbox) {
      console.log("Forcing master Sandbox Mode for brand:", brandName);
      const assetKey = getSandboxAssetType(description, category, brandName);
      const asset = SANDBOX_ASSETS[assetKey];
      return res.json({
        imageUrl: asset.master,
        description,
        brandName,
        category,
        sandbox: true,
      });
    }

    // Build highly descriptive prompt for the master product shot
    const brandPrefix = brandName ? `named "${brandName}"` : "";
    const categorySuffix = category ? ` (${category})` : "";
    const prompt = `A professional, high-end commercial studio product shot of a ${description} ${brandPrefix}${categorySuffix}. Centered composition, clean minimalist seamless studio background, dramatic soft box studio lighting, captured with premium camera gear. Sharp focus, high contrast, commercial design aesthetic. There must be absolutely no people, no human figures, hands, faces, skin, or human body parts in any portion of the image. The product is the exclusive subject.`;

    console.log(`Generating master product shot with prompt: ${prompt}`);

    try {
      const response = await ai.models.generateContent({
        model: NANO_BANANA_MODEL,
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      });

      let base64Image = null;
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            base64Image = part.inlineData.data;
            break;
          }
        }
      }

      if (!base64Image) {
        throw new Error("No image data returned from model.");
      }

      return res.json({
        imageUrl: `data:image/png;base64,${base64Image}`,
        description,
        brandName,
        category,
        sandbox: false,
      });
    } catch (genError: any) {
      const errorMsg = genError.message || "";
      const isQuotaError = errorMsg.includes("quota") || errorMsg.includes("429") || errorMsg.includes("exhausted") || errorMsg.includes("limit");

      if (isQuotaError) {
        console.warn("Gemini Quota Exceeded during master generation. Falling back to Sandbox Mode!");
        const assetKey = getSandboxAssetType(description, category, brandName);
        const asset = SANDBOX_ASSETS[assetKey];
        return res.json({
          imageUrl: asset.master,
          description,
          brandName,
          category,
          sandbox: true,
          warning: "You exceeded your current Gemini Free Tier Quota. Sandbox Mode has been activated with high-fidelity curated reference imagery."
        });
      }
      throw genError;
    }
  } catch (error: any) {
    console.error("Error in generate-master:", error);
    return res.status(500).json({
      error: error.message || "An error occurred while generating the master shot.",
    });
  }
});

app.post("/api/generate-medium", async (req, res) => {
  try {
    const { masterImage, medium, description, brandName, forceSandbox } = req.body;

    if (!masterImage) {
      return res.status(400).json({ error: "Master product image is required." });
    }
    if (!medium) {
      return res.status(400).json({ error: "Medium type is required." });
    }

    // Prepare medium-specific styles and context
    let aspectRatio: "1:1" | "16:9" | "3:4" | "9:16" = "1:1";
    switch (medium.toLowerCase()) {
      case "billboard":
        aspectRatio = "16:9";
        break;
      case "newspaper":
        aspectRatio = "3:4";
        break;
      case "social post":
        aspectRatio = "1:1";
        break;
      case "magazine ad":
        aspectRatio = "3:4";
        break;
      case "bus shelter":
        aspectRatio = "9:16";
        break;
    }

    // Determine if we should bypass and serve Sandbox Assets directly
    const isSandboxUrl = getSandboxKeyByUrl(masterImage);
    if (forceSandbox || isSandboxUrl) {
      console.log(`Bypassing API call. Serving pre-rendered asset for [${medium}]`);
      const key = isSandboxUrl || getSandboxAssetType(description, "", brandName);
      const asset = SANDBOX_ASSETS[key];
      let imageUrl = asset.master;

      switch (medium.toLowerCase()) {
        case "billboard": imageUrl = asset.billboard; break;
        case "newspaper": imageUrl = asset.newspaper; break;
        case "social post": imageUrl = asset.social; break;
        case "magazine ad": imageUrl = asset.magazine; break;
        case "bus shelter": imageUrl = asset.busshelter; break;
      }

      return res.json({
        imageUrl,
        medium,
        aspectRatio,
        sandbox: true,
      });
    }

    // Extract base64 clean data (remove data:image/png;base64, prefix if present)
    const cleanBase64 = masterImage.replace(/^data:image\/[a-z]+;base64,/, "");

    let mediumContext = "";
    switch (medium.toLowerCase()) {
      case "billboard":
        mediumContext = "A large outdoor advertising billboard set high on a modern steel structure. The background is a clean, bright sky and a subtle minimalist modern cityscape far in the background. Cinematic wide-angle commercial photography.";
        break;
      case "newspaper":
        mediumContext = "A full-page printed advertisement inside a vintage newspaper. Highly styled with halftone printed ink textures, sepia-toned monochromatic newspaper print style. Classical layout with clean text and column lines surrounding the image.";
        break;
      case "social post":
        mediumContext = "An elegant, ultra-modern social media ad flatlay. Beautiful, minimalist setup with organic soft shadows, aesthetic table texture, elegant branding context, digital marketing layout.";
        break;
      case "magazine ad":
        mediumContext = "A premium double-page editorial print advertisement in a high-end luxury fashion/design magazine. Glossy paper finish layout, spacious margins, minimalist premium branding aesthetic.";
        break;
      case "bus shelter":
        mediumContext = "An illuminated bus stop advertising shelter glass display case at twilight. Rain droplets on the glass reflecting ambient city lights, clean streets background. Cinematic atmospheric mood.";
        break;
      default:
        mediumContext = `A professional advertising setup optimized for a ${medium}. Highly realistic scene showing the product displayed in this context.`;
    }

    // Compose prompt to maintain consistency, enforce "no people", and guide layout
    const textPrompt = `This is a reference image showing a product. Re-imagine this exact same product beautifully presented in an advertisement for the following medium:
    
    Medium: ${medium.toUpperCase()}
    Creative context: ${mediumContext}
    
    The product's exact design, colors, logo, and overall shape from the reference image must be maintained with strict visual consistency. Render the product as the main highlight of the advertisement.
    
    CRITICAL CONSTRAINT: Do not include any people, human figures, hands, skin, or faces in the image. No one is interacting with the product or standing in the scene. The scene must be entirely empty of humans.`;

    console.log(`Generating consistency image for medium [${medium}] with aspect ratio [${aspectRatio}]`);

    try {
      const response = await ai.models.generateContent({
        model: NANO_BANANA_MODEL,
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: "image/png",
              },
            },
            {
              text: textPrompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio,
          },
        },
      });

      let base64Image = null;
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            base64Image = part.inlineData.data;
            break;
          }
        }
      }

      if (!base64Image) {
        throw new Error("No image data returned by the model.");
      }

      return res.json({
        imageUrl: `data:image/png;base64,${base64Image}`,
        medium,
        aspectRatio,
        sandbox: false,
      });
    } catch (genError: any) {
      const errorMsg = genError.message || "";
      const isQuotaError = errorMsg.includes("quota") || errorMsg.includes("429") || errorMsg.includes("exhausted") || errorMsg.includes("limit");

      if (isQuotaError) {
        console.warn(`Gemini Quota Exceeded during [${medium}] generation. Serving sandbox fallback!`);
        const key = getSandboxAssetType(description, "", brandName);
        const asset = SANDBOX_ASSETS[key];
        let imageUrl = asset.master;

        switch (medium.toLowerCase()) {
          case "billboard": imageUrl = asset.billboard; break;
          case "newspaper": imageUrl = asset.newspaper; break;
          case "social post": imageUrl = asset.social; break;
          case "magazine ad": imageUrl = asset.magazine; break;
          case "bus shelter": imageUrl = asset.busshelter; break;
        }

        return res.json({
          imageUrl,
          medium,
          aspectRatio,
          sandbox: true,
        });
      }
      throw genError;
    }
  } catch (error: any) {
    console.error("Error in generate-medium:", error);
    return res.status(500).json({
      error: error.message || "An error occurred while generating the consistency image.",
    });
  }
});

// Vite/Static asset integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
