import fs from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import type { AppConfig } from "../config.js";
import type { NftIdea } from "../types.js";

export async function generateImage(config: AppConfig, idea: NftIdea, client: OpenAI): Promise<string> {
  const result = await client.images.generate({
    model: config.OPENAI_IMAGE_MODEL,
    prompt: `${idea.imagePrompt}. High detail. No text or watermark.`,
    size: "1024x1024"
  });

  const imageB64 = result.data[0]?.b64_json;
  if (!imageB64) {
    throw new Error("Image generation stage returned no image bytes.");
  }

  await fs.mkdir(config.OUTPUT_DIR, { recursive: true });
  const slug = idea.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const filePath = path.join(config.OUTPUT_DIR, `${new Date().toISOString().slice(0, 10)}-${slug}.png`);
  await fs.writeFile(filePath, Buffer.from(imageB64, "base64"));

  return filePath;
}
