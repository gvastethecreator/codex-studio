import type { ProviderAssetInputRef } from './externalProviderInputs';

export interface FalAssetRequestFields {
  image_url?: string;
  mask_url?: string;
  control_image_url?: string;
  reference_image_urls?: string[];
}

export type FalAssetUploadLocalFile = (asset: ProviderAssetInputRef) => Promise<string>;

export interface FalAssetRequestFieldDependencies {
  uploadLocalAsset?: FalAssetUploadLocalFile;
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

async function resolveHostedAssetUrl(
  asset: ProviderAssetInputRef,
  { uploadLocalAsset }: FalAssetRequestFieldDependencies,
) {
  if (asset.sourceUrl) {
    if (!isHttpUrl(asset.sourceUrl)) {
      throw new Error(`fal.ai asset "${asset.name}" sourceUrl must be an http(s) URL.`);
    }
    return asset.sourceUrl;
  }

  if (asset.localPath) {
    if (!uploadLocalAsset) {
      throw new Error(
        `fal.ai asset "${asset.name}" must be uploaded to a hosted URL before execution.`,
      );
    }
    const uploadedUrl = await uploadLocalAsset(asset);
    if (!isHttpUrl(uploadedUrl)) {
      throw new Error(`fal.ai asset "${asset.name}" upload returned a non-http URL.`);
    }
    return uploadedUrl;
  }

  if (asset.hasInlineData) {
    throw new Error(
      `fal.ai inline asset "${asset.name}" is not available in the compact Provider Input; import it as a localPath or sourceUrl asset before execution.`,
    );
  }

  return null;
}

export async function createFalAssetRequestFields(
  assets: ProviderAssetInputRef[],
  dependencies: FalAssetRequestFieldDependencies = {},
): Promise<FalAssetRequestFields> {
  const fields: FalAssetRequestFields = {};
  const referenceImageUrls: string[] = [];

  for (const asset of assets) {
    const sourceUrl = await resolveHostedAssetUrl(asset, dependencies);
    if (!sourceUrl) continue;

    if ((asset.role === 'input' || asset.role === 'external_output') && !fields.image_url) {
      fields.image_url = sourceUrl;
    } else if (asset.role === 'mask' && !fields.mask_url) {
      fields.mask_url = sourceUrl;
    } else if (asset.role === 'control' && !fields.control_image_url) {
      fields.control_image_url = sourceUrl;
    } else if (asset.role === 'reference') {
      referenceImageUrls.push(sourceUrl);
    }
  }

  if (referenceImageUrls.length > 0) {
    fields.reference_image_urls = referenceImageUrls;
  }

  return fields;
}
