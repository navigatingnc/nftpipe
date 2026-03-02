import OpenAI from "openai";
import { loadConfig } from "./config.js";
import { generateIdea } from "./stages/ideation.js";
import { generateImage } from "./stages/imageGeneration.js";
import { uploadAndMint } from "./stages/uploadAndMint.js";
import { listMarketplace } from "./stages/listOnOpenSea.js";

async function run(): Promise<void> {
  const config = loadConfig();
  const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

  console.log("[1/3] AI ideation...");
  const idea = await generateIdea(config, openai);

  console.log("[2/3] Image generation...");
  const imagePath = await generateImage(config, idea, openai);

  console.log("[3/3] Mint + list on marketplace...");
  const { tokenId, uploaded } = await uploadAndMint(config, idea, imagePath);
  const listing = await listMarketplace(config, tokenId);

  console.log("Done.");
  console.log(JSON.stringify({
    nft: idea,
    imagePath,
    tokenId,
    metadataUri: uploaded.metadataUri,
    listingProvider: listing.provider,
    listingUrl: listing.listingUrl
  }, null, 2));
}

run().catch((error) => {
  console.error("Pipeline failed:", error);
  process.exitCode = 1;
});
