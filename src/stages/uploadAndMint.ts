import { Contract, Wallet, JsonRpcProvider } from "ethers";
import type { AppConfig } from "../config.js";
import type { NftIdea, UploadedAsset } from "../types.js";
import { pinFile, pinJson } from "../services/pinata.js";

const minterAbi = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "function safeMint(address to, string uri) public returns (uint256)",
  "function mintTo(address to, string uri) public returns (uint256)"
];

export async function uploadAndMint(config: AppConfig, idea: NftIdea, imageFilePath: string): Promise<{ tokenId: string; uploaded: UploadedAsset }> {
  const imageCid = await pinFile(config.PINATA_JWT, imageFilePath);
  const imageUri = `ipfs://${imageCid}`;

  const metadata = {
    name: idea.title,
    description: idea.description,
    image: imageUri,
    attributes: idea.traits,
    external_url: config.METADATA_EXTERNAL_URL
  };

  const metadataCid = await pinJson(config.PINATA_JWT, metadata);
  const metadataUri = `ipfs://${metadataCid}`;

  const provider = new JsonRpcProvider(config.RPC_URL);
  const signer = new Wallet(config.MINTER_PRIVATE_KEY, provider);
  const contract = new Contract(config.NFT_CONTRACT_ADDRESS, minterAbi, signer);

  const mintFn = contract.getFunction(config.MINT_FUNCTION_NAME);
  const tx = await mintFn(signer.address, metadataUri);
  const receipt = await tx.wait();

  const transferLog = receipt.logs
    .map((l: { topics: readonly string[]; data: string }) => {
      try {
        return contract.interface.parseLog(l);
      } catch {
        return null;
      }
    })
    .find((parsed: { name: string; args: { tokenId: bigint } } | null) => parsed?.name === "Transfer");

  if (!transferLog) {
    throw new Error("Mint succeeded but tokenId could not be extracted from Transfer event.");
  }

  return {
    tokenId: transferLog.args.tokenId.toString(),
    uploaded: { imageCid, metadataCid, metadataUri, imageUri }
  };
}
