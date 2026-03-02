# NFTPipe

A production-style automated NFT pipeline that runs in 3 stages every day:
1. **AI ideation** (title, description, traits, visual prompt)
2. **Image generation** (OpenAI image model)
3. **Mint + marketplace listing** (IPFS upload, ERC-721 mint, then OpenClaw/OpenSea listing)

No frontend is included by design.

## How it works

- `src/stages/ideation.ts` generates a structured NFT concept using OpenAI chat.
- `src/stages/imageGeneration.ts` generates and stores PNG artwork.
- `src/stages/uploadAndMint.ts` uploads image + metadata to IPFS via Pinata, then mints on your contract.
- `src/stages/listOnOpenSea.ts` routes listing to either OpenClaw or OpenSea based on `MARKETPLACE_PROVIDER`.
- `.github/workflows/daily-nft-pipeline.yml` executes the full pipeline daily.

## Marketplace provider configuration

Set `MARKETPLACE_PROVIDER` to one of:
- `openclaw` (default)
- `opensea`

### OpenClaw settings
Required when `MARKETPLACE_PROVIDER=openclaw`:
- `OPENCLAW_API_URL`
- `OPENCLAW_API_KEY`
- `OPENCLAW_COLLECTION_SLUG`

### OpenSea settings
Required when `MARKETPLACE_PROVIDER=opensea`:
- `OPENSEA_API_KEY`

## Prerequisites

1. A deployed ERC-721 contract with either `safeMint(address,string)` or `mintTo(address,string)`.
2. Wallet private key that can mint and list NFTs.
3. OpenAI API key.
4. Pinata JWT for IPFS upload.
5. OpenClaw API key (or OpenSea API key if using OpenSea provider).
6. RPC URL for your chain.

## Setup

```bash
cp .env.example .env
npm install
npm run build
npm start
```

## GitHub Actions scheduling

Workflow path: `.github/workflows/daily-nft-pipeline.yml`

Add the required repository secrets:
- `OPENAI_API_KEY`
- `PINATA_JWT`
- `RPC_URL`
- `MINTER_PRIVATE_KEY`
- `OPENCLAW_API_KEY` (if using OpenClaw)
- `OPENSEA_API_KEY` (if using OpenSea)

Add repository variables:
- `NFT_COLLECTION_NAME`
- `NFT_COLLECTION_DESCRIPTION`
- `NFT_CONTRACT_ADDRESS`
- `MARKETPLACE_PROVIDER`
- `OPENCLAW_API_URL` / `OPENCLAW_COLLECTION_SLUG` (if using OpenClaw)
- optional tuning vars used by workflow

## Security notes

- Use a dedicated hot wallet with minimal funds.
- Prefer testnet (`sepolia`) before mainnet.
- Add spend/transfer controls in your minter contract when possible.
