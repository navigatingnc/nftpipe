import OpenAI from "openai";
import { z } from "zod";
import type { AppConfig } from "../config.js";
import type { NftIdea } from "../types.js";

const ideaSchema = z.object({
  title: z.string(),
  description: z.string(),
  traits: z.array(
    z.object({
      trait_type: z.string(),
      value: z.string()
    })
  ).min(3),
  imagePrompt: z.string().min(30)
});

export async function generateIdea(config: AppConfig, client: OpenAI): Promise<NftIdea> {
  const completion = await client.chat.completions.create({
    model: config.OPENAI_IDEA_MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "You are an NFT creative director. Return ONLY JSON with title, description, traits[], and imagePrompt."
      },
      {
        role: "user",
        content: `Create exactly one premium NFT concept for theme: ${config.NFT_THEME}. Keep it unique, collectible, and visually rich.`
      }
    ]
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Ideation stage returned empty response.");
  }

  return ideaSchema.parse(JSON.parse(content));
}
