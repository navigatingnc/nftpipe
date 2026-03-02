import axios from "axios";
import { Wallet, JsonRpcProvider } from "ethers";
import { Chain, OpenSeaSDK } from "opensea-js";
import type { AppConfig } from "../config.js";

const chainMap: Record<string, Chain> = {
  ethereum: Chain.Mainnet,
  sepolia: Chain.Sepolia,
  polygon: Chain.Polygon,
  base: Chain.Base
};

async function listOnOpenSea(config: AppConfig, tokenId: string): Promise<string> {
  const provider = new JsonRpcProvider(config.RPC_URL);
  const signer = new Wallet(config.MINTER_PRIVATE_KEY, provider);

  const sdk = new OpenSeaSDK(signer, {
    chain: chainMap[config.CHAIN],
    apiKey: config.OPENSEA_API_KEY
  });

  const expiration = Math.floor(Date.now() / 1000) + config.LISTING_DURATION_HOURS * 3600;
  await sdk.createListing({
    accountAddress: signer.address,
    asset: {
      tokenAddress: config.NFT_CONTRACT_ADDRESS,
      tokenId
    },
    startAmount: Number(config.LISTING_PRICE_ETH),
    expirationTime: expiration
  });

  return `https://${config.CHAIN === "ethereum" ? "opensea.io" : "testnets.opensea.io"}/assets/${config.CHAIN}/${config.NFT_CONTRACT_ADDRESS}/${tokenId}`;
}

async function listOnOpenClaw(config: AppConfig, tokenId: string): Promise<string> {
  const expiration = new Date(Date.now() + config.LISTING_DURATION_HOURS * 3600 * 1000).toISOString();

  const response = await axios.post(
    `${config.OPENCLAW_API_URL}/v1/listings`,
    {
      chain: config.CHAIN,
      contractAddress: config.NFT_CONTRACT_ADDRESS,
      tokenId,
      priceEth: config.LISTING_PRICE_ETH,
      expiresAt: expiration,
      collectionSlug: config.OPENCLAW_COLLECTION_SLUG
    },
    {
      headers: {
        Authorization: `Bearer ${config.OPENCLAW_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data?.listingUrl ?? `${config.OPENCLAW_API_URL}/collections/${config.OPENCLAW_COLLECTION_SLUG}/${tokenId}`;
}

export async function listMarketplace(config: AppConfig, tokenId: string): Promise<{ listingUrl: string; provider: string }> {
  if (config.MARKETPLACE_PROVIDER === "opensea") {
    return { listingUrl: await listOnOpenSea(config, tokenId), provider: "opensea" };
  }

  return { listingUrl: await listOnOpenClaw(config, tokenId), provider: "openclaw" };
}
