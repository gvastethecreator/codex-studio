const ANIME_PACK_SEQUENCE: ReadonlyArray<string> = ['pack_05', 'pack_13', 'pack_16'];

function parsePackNumericId(packId: string) {
  const match = /^pack_(\d{2})$/.exec(packId);
  return match ? Number(match[1]) : null;
}

function sequenceRank(packId: string) {
  const animeIndex = ANIME_PACK_SEQUENCE.indexOf(packId);
  if (animeIndex >= 0) {
    return 5 + animeIndex;
  }

  const numeric = parsePackNumericId(packId);
  if (numeric === null) return null;
  if (numeric <= 4) return numeric;
  if (numeric === 5 || numeric === 13 || numeric === 16) return null;
  return numeric + 2;
}

export function compareStylePackIdsForDisplay(aId: string, bId: string) {
  const aRank = sequenceRank(aId);
  const bRank = sequenceRank(bId);

  if (aRank !== null && bRank !== null && aRank !== bRank) return aRank - bRank;
  if (aRank !== null && bRank === null) return -1;
  if (aRank === null && bRank !== null) return 1;

  const aNumeric = parsePackNumericId(aId);
  const bNumeric = parsePackNumericId(bId);
  if (aNumeric !== null && bNumeric !== null && aNumeric !== bNumeric) {
    return aNumeric - bNumeric;
  }

  return aId.localeCompare(bId);
}

export function getStylePackDisplayName(packId: string, packName: string) {
  const animeIndex = ANIME_PACK_SEQUENCE.indexOf(packId);
  if (animeIndex < 0) return packName;
  const sequence = String(animeIndex + 1).padStart(2, '0');
  return `Anime ${sequence} — ${packName}`;
}
