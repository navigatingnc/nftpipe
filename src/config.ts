import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_IDEA_MODEL: z.string().default("gpt-4o-mini"),
  OPENAI_IMAGE_MODEL: z.string().default("gpt-image-1"),
  NFT_THEME: z.string().default("futuristic digital collectibles"),
  NFT_COLLECTION_NAME: z.string().min(1),
  NFT_COLLECTION_DESCRIPTION: z.string().min(1),

  PINATA_JWT: z.string().min(1),

  RPC_URL: z.string().url(),
  CHAIN: z.enum(["ethereum", "sepolia", "polygon", "base"]).default("sepolia"),
  MINTER_PRIVATE_KEY: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  NFT_CONTRACT_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  MINT_FUNCTION_NAME: z.string().default("safeMint"),

  MARKETPLACE_PROVIDER: z.enum(["opensea", "openclaw"]).default("openclaw"),

  OPENSEA_API_KEY: z.string().optional(),

  OPENCLAW_API_URL: z.string().url().optional(),
  OPENCLAW_API_KEY: z.string().optional(),
  OPENCLAW_COLLECTION_SLUG: z.string().optional(),

  LISTING_PRICE_ETH: z.coerce.number().positive(),
  LISTING_DURATION_HOURS: z.coerce.number().int().positive().default(24),

  METADATA_EXTERNAL_URL: z.string().url().optional(),
  OUTPUT_DIR: z.string().default("./output")
}).superRefine((env, ctx) => {
  if (env.MARKETPLACE_PROVIDER === "opensea" && !env.OPENSEA_API_KEY) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["OPENSEA_API_KEY"],
      message: "OPENSEA_API_KEY is required when MARKETPLACE_PROVIDER=opensea"
    });
  }

  if (env.MARKETPLACE_PROVIDER === "openclaw") {
    if (!env.OPENCLAW_API_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["OPENCLAW_API_URL"],
        message: "OPENCLAW_API_URL is required when MARKETPLACE_PROVIDER=openclaw"
      });
    }
    if (!env.OPENCLAW_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["OPENCLAW_API_KEY"],
        message: "OPENCLAW_API_KEY is required when MARKETPLACE_PROVIDER=openclaw"
      });
    }
    if (!env.OPENCLAW_COLLECTION_SLUG) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["OPENCLAW_COLLECTION_SLUG"],
        message: "OPENCLAW_COLLECTION_SLUG is required when MARKETPLACE_PROVIDER=openclaw"
      });
    }
  }
});

export type AppConfig = z.infer<typeof envSchema>;

export function loadConfig(): AppConfig {
  return envSchema.parse(process.env);
}
