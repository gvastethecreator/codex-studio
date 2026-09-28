import { initStudio } from '../apps/local-server/src/init';

// Style packs are Cozy Extensions (ADR 0011): install them from Studio Settings, Extensions.
const result = initStudio();
console.log(JSON.stringify(result, null, 2));
