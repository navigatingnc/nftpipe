export type NftIdea = {
  title: string;
  description: string;
  traits: Array<{ trait_type: string; value: string }>;
  imagePrompt: string;
};

export type UploadedAsset = {
  imageCid: string;
  metadataCid: string;
  metadataUri: string;
  imageUri: string;
};
