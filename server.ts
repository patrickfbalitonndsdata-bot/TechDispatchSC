import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "50mb" }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.post("/api/parse-pdf", async (req, res) => {
  try {
    const { base64Data, fileName, mimeType = "application/pdf" } = req.body;

    if (!base64Data) {
      return res.status(400).json({ error: "Missing base64Data" });
    }

    const prompt = `You are an expert traffic operations scheduler and document analyst for NDS (National Data & Surveying Services).
Analyze the attached traffic data collection project approval PDF or Cover Sheet (File name: "${fileName || "document.pdf"}").
Your task is to accurately extract all operational fields required for dispatch and scheduling emails:

1. projectNumber: The primary NDS project number (typically format XX-XXXXXX like 26-240037, 26-770109, 26-470282, or with sub-ID 26-XXXXXX-XXX). If not explicitly labeled, check the top header or the filename.
2. locationsCount: The total count of locations / sites / stations / cameras to be scheduled. If multiple detail sections or locations are listed (e.g. Location 1, 2, 3... or 26-240037-001 through -006), count the total number of locations (e.g. "6").
3. studyType: "ATR" (for ALG conversion, pneumatic tubes, speed/volume, machine collection) or "TMC" (for turning movement counts, camera placement approval).
4. addOns: Traffic study add-on features (e.g. "Volume", "Volume, Speed", "Speed & Classification", or vehicle classification like "Pedestrians, Bicycles, Heavy Trucks..."). If ATR with only volume, specify "Volume".
5. fullStudyFormatted: Standard formatted study line:
   - For ATR: "ALG <AddOns>" (e.g. "ALG Volume", "ALG Speed & Classification", "ALG Volume, Speed")
   - For TMC: "TMC" or "TMC <AddOns>"
6. cityState: City and State or Parish and State (e.g. "Ascension Parish, LA", "Boulder, CO", "Cheyenne, WY", "Dallas, TX").
7. region: NDS scheduling region (e.g. "South Central", "Southeast", "Mountain"). Default to "South Central" for LA, TX, OK, AR.
8. urgency: Urgency classification (e.g. "Priority Client", "Standard"). Default to "Priority Client".
9. firm: Client firm or agency name (e.g. "LADOTD", "LSC Transportation Consultants", "Kimley-Horn").
10. contact: Contact person name if listed.
11. dueDate: Due date string if listed.`;

    let responseText = "";
    // Try gemini-3.1-flash-lite first, fallback to gemini-flash-latest
    try {
      const result = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: [
          {
            inlineData: {
              mimeType: mimeType || "application/pdf",
              data: base64Data,
            },
          },
          { text: prompt },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              projectNumber: { type: Type.STRING },
              locationsCount: { type: Type.STRING },
              studyType: { type: Type.STRING },
              addOns: { type: Type.STRING },
              fullStudyFormatted: { type: Type.STRING },
              cityState: { type: Type.STRING },
              region: { type: Type.STRING },
              urgency: { type: Type.STRING },
              firm: { type: Type.STRING },
              contact: { type: Type.STRING },
              dueDate: { type: Type.STRING },
            },
            required: ["projectNumber", "locationsCount", "studyType", "fullStudyFormatted", "cityState"],
          },
        },
      });
      responseText = result.text || "";
    } catch (primaryErr) {
      console.warn("Primary model error, attempting fallback model:", primaryErr);
      const fallbackResult = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: [
          {
            inlineData: {
              mimeType: mimeType || "application/pdf",
              data: base64Data,
            },
          },
          { text: prompt },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });
      responseText = fallbackResult.text || "";
    }

    const data = JSON.parse(responseText.trim());
    return res.json(data);
  } catch (error: any) {
    console.error("PDF Parse API error:", error);
    return res.status(500).json({ error: error.message || "Failed to parse PDF" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
