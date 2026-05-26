type RecipeParamRecord = Record<string, unknown>;

const CHARACTER_LAYOUT_INSTRUCTIONS: Record<string, string> = {
  'Classic Turnaround':
    'a character turnaround reference sheet. Aim for 3 full-body views of the character in a neutral A-pose, arranged horizontally: 1. Front View 2. Side View (Left Profile) 3. Back View. Keep the head and feet visually aligned where possible.',
  'Isometric Sheet':
    'a full character sheet with multiple isometric views of the same character in a neutral A-pose. Aim for 4 views: 1. Front-Right Isometric 2. Front-Left Isometric 3. Back-Right Isometric 4. Back-Left Isometric. Prefer a clean 2x2 grid.',
  'Dynamic Sheet':
    'a dynamic character pose sheet. Aim for 3 views of the character: 1. A main, full-body dynamic action pose. 2. A close-up portrait with a neutral expression. 3. A three-quarter back view.',
  'Expression Sheet':
    'a facial expression sheet. Focus on the head and shoulders. Aim for 6 distinct emotional states (e.g., Neutral, Angry, Happy, Sad, Surprised, Combat-Ready) arranged in a readable 2x3 grid.',
  'Wireframe Sheet':
    'the character visualized as a 3D wireframe-style model, with the form suggested through polygon mesh lines and a visible grid pattern.',
  'Anatomy Sheet':
    "an anatomical reference sheet in the style of a medical or artist's illustration. Show a detailed view of the character's musculature and skeletal structure.",
  'Clothing Layers': "a character sheet showing an 'exploded view' of the character's clothing.",
};

export function getCharacterLayoutInstruction(layout: string) {
  return (
    CHARACTER_LAYOUT_INSTRUCTIONS[layout] ?? CHARACTER_LAYOUT_INSTRUCTIONS['Classic Turnaround']
  );
}

export function getCharacterStyleInstruction(style: string) {
  return style === 'Preserve Source Style'
    ? "Use the reference image's art style (line weight, shading, color palette) as the main style guide."
    : `RENDER STYLE: ${style.toUpperCase()}. Ignore reference image style if it conflicts.`;
}

export function createCinematicLayoutInstruction(frames: number, rows: number, cols: number) {
  const layoutDescription = `${rows} rows by ${cols} columns`;
  if (frames === 3) return `Create a cinematic triptych (${layoutDescription}).`;
  if (frames === 6) return `Create a 6-frame storyboard grid (${layoutDescription}).`;
  return 'Create a 9-frame storyboard contact sheet (3x3 grid).';
}

export function createCinematicFrameDirectives(frameShots: RecipeParamRecord) {
  return Object.entries(frameShots)
    .map(([index, shot]) =>
      typeof shot === 'string' && shot !== 'Auto'
        ? `- Frame ${Number(index) + 1}: ${shot} Shot`
        : null,
    )
    .filter((directive): directive is string => Boolean(directive));
}

export function createCinematicFrameInstructions(frameShots: RecipeParamRecord) {
  const frameDirectives = createCinematicFrameDirectives(frameShots);
  return frameDirectives.length > 0 ? `\nSPECIFIC FRAME SHOTS:\n${frameDirectives.join('\n')}` : '';
}

export function parseSpritesheetGrid(grid: string) {
  if (grid.includes('Strip')) return { gridCols: 6, gridRows: 1 };

  const [rawCols, rawRows] = grid.split('x').map((value) => Number(value));
  const gridCols = Number.isFinite(rawCols) && rawCols > 0 ? rawCols : 2;
  const gridRows = Number.isFinite(rawRows) && rawRows > 0 ? rawRows : 2;
  return { gridCols, gridRows };
}

export function getSpritesheetDividerState(dividers: string) {
  const hasDividers = dividers !== 'No Dividers';
  const dividerColor = dividers.split(' ')[0].toUpperCase();
  return {
    hasDividers,
    dividerColor,
    cellSeparation: hasDividers ? `VISIBLE_${dividerColor}_LINES` : 'NO_VISIBLE_SEPARATION',
  };
}

export function getSpritesheetBackgroundDirective(background: string, customColor: string) {
  if (background.includes('Green')) return 'SOLID_GREEN_#00FF00';
  if (background === 'Custom') return `SOLID_COLOR_${customColor.toUpperCase()}`;
  if (background === 'Black') return 'SOLID_BLACK';
  return background.toUpperCase();
}

export function createSpritesheetCellDirectives(cellPrompts: RecipeParamRecord) {
  return Object.entries(cellPrompts).reduce<string[]>((acc, [index, prompt]) => {
    if (typeof prompt === 'string' && prompt.trim() !== '') {
      acc.push(`Cell ${Number(index) + 1}: ${String(prompt)}`);
    }
    return acc;
  }, []);
}
