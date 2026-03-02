import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";

function setCoreEnv(): void {
  process.env.OPENAI_API_KEY = "sk-test";
  process.env.OPENAI_IDEA_MODEL = "gpt-4o-mini";
  process.env.OPENAI_IMAGE_MODEL = "gpt-image-1";
  process.env.NFT_THEME = "retro robots";
  process.env.NFT_COLLECTION_NAME = "BotVault";
  process.env.NFT_COLLECTION_DESCRIPTION = "Robot collectibles";
  process.env.PINATA_JWT = "pinata-jwt";
  process.env.RPC_URL = "https://example.com";
  process.env.CHAIN = "sepolia";
  process.env.MINTER_PRIVATE_KEY = "0x" + "1".repeat(64);
  process.env.NFT_CONTRACT_ADDRESS = "0x" + "1".repeat(40);
  process.env.MINT_FUNCTION_NAME = "safeMint";
  process.env.LISTING_PRICE_ETH = "0.01";
  process.env.LISTING_DURATION_HOURS = "24";
}

describe("config", () => {
  it("validates openclaw provider settings", () => {
    setCoreEnv();
    process.env.MARKETPLACE_PROVIDER = "openclaw";
    process.env.OPENCLAW_API_URL = "https://api.openclaw.example";
    process.env.OPENCLAW_API_KEY = "openclaw-key";
    process.env.OPENCLAW_COLLECTION_SLUG = "daily-drop";
    delete process.env.OPENSEA_API_KEY;

    expect(() => loadConfig()).not.toThrow();
  });

  it("validates opensea provider settings", () => {
    setCoreEnv();
    process.env.MARKETPLACE_PROVIDER = "opensea";
    process.env.OPENSEA_API_KEY = "opensea-api";
    delete process.env.OPENCLAW_API_URL;
    delete process.env.OPENCLAW_API_KEY;
    delete process.env.OPENCLAW_COLLECTION_SLUG;

    expect(() => loadConfig()).not.toThrow();
  });
});
