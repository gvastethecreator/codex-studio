import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

function readDoc(relativePath: string) {
  return readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');
}

describe('onboarding docs contract', () => {
  const readme = readDoc('README.md');
  const troubleshooting = readDoc('docs/TROUBLESHOOTING.md');
  const electron = readDoc('docs/ELECTRON.md');
  const skill = readDoc('skills/codex-studio-setup/SKILL.md');
  const four = [readme, troubleshooting, electron, skill].join('\n---\n');

  it('README first-run path matches the CTA matrix and names Codex Studio in user home', () => {
    expect(readme).toContain('folder named `Codex Studio` in your user home');
    expect(readme).toContain('never silent-installs Bun');
    expect(readme).toContain('https://bun.sh/docs/installation');
    expect(readme).toContain('https://github.com/openai/codex');
    expect(readme).toContain('visible `codex login` terminal');
    expect(readme).toContain('bun run studio:onboard --setup');
    expect(readme).toContain('Start app-server');
    expect(readme).toContain('Open Studio');
    expect(readme).toContain('outputs/<workspace>/');
    expect(readme).not.toMatch(/as `AI-Studio-Library`/);
  });

  it('TROUBLESHOOTING lists studio:onboard, consent, and STUDIO_LIBRARY_DIR', () => {
    expect(troubleshooting).toContain('bun run studio:onboard');
    expect(troubleshooting).toContain('Mutating steps need an explicit yes');
    expect(troubleshooting).toContain('STUDIO_LIBRARY_DIR');
    expect(troubleshooting).toContain('Codex Studio');
    expect(troubleshooting).toContain('Preferred Output Path is not the generate destination');
  });

  it('ELECTRON.md says Electron is not the user channel', () => {
    expect(electron).toContain('Electron is not that channel');
    expect(electron).toContain('not the packaged user product for this spec');
    expect(electron).toContain('does not bundle ChatGPT login');
  });

  it('setup skill still owns the Setup Prompt text', () => {
    expect(skill).toContain('CODEX_STUDIO_SETUP_SKILL_PATH');
    expect(skill).toContain('Copy prompt and Ask Codex');
    expect(skill).toContain('bun run studio:onboard');
    expect(skill).toContain('Never silent-install Bun');
  });

  it('does not call Preferred Output Path the generation destination or claim silent Bun / bundled login', () => {
    expect(four).not.toMatch(/Preferred Output Path is the generate destination/i);
    expect(four).not.toMatch(/Generate writes to Preferred Output Path/i);
    expect(four).not.toMatch(/silently installs Bun/i);
    expect(four).not.toMatch(/Studio bundles ChatGPT login/i);
    expect(electron).toContain('does not bundle ChatGPT login');
    expect(readme).toContain('That login is not bundled');
  });
});
