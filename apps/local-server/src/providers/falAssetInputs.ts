import { Effect } from 'effect';
import { providerOperation, type ProviderEffect } from './providerEffect';
import type { ProviderAssetInputRef } from './externalProviderInputs';

export interface FalAssetRequestFields {
  image_url?: string;
  mask_url?: string;
  control_image_url?: string;
  reference_image_urls?: string[];
}

export type FalAssetUploadLocalFile = (asset: ProviderAssetInputRef) => ProviderEffect<string>;

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

function resolveHostedAssetUrl(
  asset: ProviderAssetInputRef,
  { uploadLocalAsset }: FalAssetRequestFieldDependencies,
) {
  return providerOperation(
    Effect.gen(function* () {
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
        const uploadedUrl = yield* uploadLocalAsset(asset);
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
    }),
  );
}

export function createFalAssetRequestFields(
  assets: ProviderAssetInputRef[],
  dependencies: FalAssetRequestFieldDependencies = {},
): ProviderEffect<FalAssetRequestFields> {
  return providerOperation(
    Effect.gen(function* () {
      const fields: FalAssetRequestFields = {};
      const referenceImageUrls: string[] = [];

      const resolvedUrls = yield* Effect.forEach(
        assets,
        (asset) =>
          resolveHostedAssetUrl(asset, dependencies).pipe(
            Effect.map((sourceUrl) => ({ asset, sourceUrl })),
          ),
        { concurrency: 'unbounded' },
      );

      for (const { asset, sourceUrl } of resolvedUrls) {
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
    }),
  );
}
