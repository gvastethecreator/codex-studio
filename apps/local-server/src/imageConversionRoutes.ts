import { Hono } from 'hono';
import { parseImageConversionRequest } from '../../../packages/shared/src/imageConversion';
import {
  createImageConversion,
  ImageConversionError,
  type ImageConversionDependencies,
} from './imageConversion';

export function createImageConversionRoutes(dependencies: ImageConversionDependencies) {
  const routes = new Hono();
  const convert = createImageConversion(dependencies);
  routes.post('/:id/convert', async (c) => {
    let options;
    try {
      options = parseImageConversionRequest(await c.req.json());
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : 'Invalid conversion options.' },
        400,
      );
    }
    try {
      const result = await convert(c.req.param('id'), options);
      if (result.kind === 'library') return c.json(result.result);
      return new Response(new Uint8Array(result.bytes), {
        headers: {
          'Content-Type': result.mimeType,
          'Content-Length': String(result.outputBytes),
          'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(result.filename).replace(/['()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`)}`,
          'X-Source-Bytes': String(result.sourceBytes),
          'Access-Control-Expose-Headers': 'Content-Disposition, X-Source-Bytes',
          'Cache-Control': 'no-store',
        },
      });
    } catch (error) {
      if (error instanceof ImageConversionError) {
        return c.json({ error: error.message }, error.status);
      }
      return c.json(
        { error: error instanceof Error ? error.message : 'Image conversion failed.' },
        500,
      );
    }
  });
  return routes;
}
