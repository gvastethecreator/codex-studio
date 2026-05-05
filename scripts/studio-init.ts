import { initStudio } from '../apps/local-server/src/init';

const result = initStudio();
console.log(JSON.stringify(result, null, 2));
