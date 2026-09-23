from pathlib import Path


def replace_once(file, old, new):
    path = Path(file)
    text = path.read_text()
    assert text.count(old) == 1, file
    path.write_text(text.replace(old, new, 1))

replace_once('lib/recipeContext.test.ts', '''    expect(context).toContain('[SELECTED STYLE LAYERS]');
    expect(context).toContain(
      'Slot 1: Studio Headshot | Pack: Photography & Realism | Strength: 0.70',
    );
    expect(context).toContain('Slot 2: Film Noir | Pack: Cinematic & Media | Strength: 0.40');''', '''    expect(context).toContain('[ACTIVE VISUAL FIELDS]');
    expect(context).toContain('Style layer 1 (influence 0.70)');
    expect(context).toContain('Style layer 2 (influence 0.40)');
    expect(context).toContain('clean studio portrait');
    expect(context).toContain('hard shadow crime drama');
    for (const metadata of ['Studio Headshot', 'Film Noir', 'Photography & Realism', 'Cinematic & Media']) {
      expect(context).not.toContain(metadata);
    }''')

file = 'components/recipes/stylePresetCatalogData.ts'
replace_once(file, "  'pack_17',\n] as const;", "  'pack_17',\n  'pack_19',\n  'pack_20',\n  'pack_21',\n] as const;")
anchor = '''  pack_17: () =>
    import('./stylePresetCatalogData.pack_17').then((module) =>
      module.loadStylePresetCatalogPackData(),
    ),'''
replace_once(file, anchor, anchor + '\n' + '\n'.join(anchor.replace('pack_17', f'pack_{n}') for n in [19, 20, 21]))
template = Path('components/recipes/stylePresetCatalogData.pack_17.ts').read_text()
for n in [19, 20, 21]:
    path = Path(f'components/recipes/stylePresetCatalogData.pack_{n}.ts')
    assert not path.exists()
    path.write_text(template.replace('pack_17', f'pack_{n}'))

replace_once('scripts/generate-style-runtime-data.ts', "if (process.argv.includes('--search-index-only')) {", """if (!checkMode && !skipFormat) {
  await formatGeneratedFiles(searchIndex.packs.map((pack) => path.join(searchIndexDir, `${pack.id}.json`)));
}
if (process.argv.includes('--search-index-only')) {""")

file = 'scripts/generate-style-curation-review-doc.ts'
replace_once(file, "import { readFile, writeFile } from 'node:fs/promises';", "import { readFile, writeFile, rm } from 'node:fs/promises';")
replace_once(file, "const output = `${lines.join('\\n').trim()}\\n`;", "let output = `${lines.join('\\n').trim()}\\n`;")
replace_once(file, "if (process.argv.includes('--check')) {", """const temporary = `docs/styles/curation-v2/.category-review-${process.pid}.tmp.md`;
try {
  await writeFile(temporary, output, 'utf8');
  const formatter = Bun.spawn(['bunx', 'vp', 'fmt', '--threads', '4', temporary], { stdout: 'inherit', stderr: 'inherit' });
  if (await formatter.exited !== 0) throw new Error('Category review formatting failed');
  output = await readFile(temporary, 'utf8');
} finally {
  await rm(temporary, { force: true });
}
if (process.argv.includes('--check')) {""")
