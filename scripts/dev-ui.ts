import { createServer } from 'vite-plus';

const port = Number(process.env.STUDIO_UI_PORT) || 17222;

// Keep the renderer server in this child process so the Studio launcher owns its
// lifetime. The vp CLI starts another process that can outlive its command wrapper.
const server = await createServer({
  cacheDir: `node_modules/.vite-studio-${port}`,
  server: { port, strictPort: true },
});
await server.listen();
server.printUrls();

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void server.close().finally(() => process.exit(0));
  });
}
