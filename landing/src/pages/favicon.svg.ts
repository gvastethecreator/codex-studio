import { resolve } from "node:path";
import type { APIRoute } from "astro";
import { faviconSvg, loadYaml } from "../../kit/engine.mjs";

const SITE_YAML_ENV = "GVASTE_SITE_Y" + "AML";

export const GET: APIRoute = () => {
  const yamlPath = resolve(process.cwd(), process.env[SITE_YAML_ENV] ?? "site.yaml");
  const site = loadYaml(yamlPath);
  const initials = site?.brand?.initials ?? "GP";
  return new Response(faviconSvg(String(initials)), {
    headers: { "Content-Type": "image/svg+xml" },
  });
};
