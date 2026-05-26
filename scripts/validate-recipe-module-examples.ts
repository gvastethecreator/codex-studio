import { RECIPE_MODULE_EXAMPLES, validateRecipeModuleExamples } from '../lib/recipeModuleExamples';

const asJson = process.argv.includes('--json');
const report = validateRecipeModuleExamples();

if (asJson) {
  console.log(JSON.stringify({ ...report, examples: RECIPE_MODULE_EXAMPLES }, null, 2));
} else {
  console.log(
    `[recipes:examples] examples=${RECIPE_MODULE_EXAMPLES.length} errors=${report.errors.length}`,
  );
  for (const example of RECIPE_MODULE_EXAMPLES) {
    console.log(
      `- ${example.id} | module=${example.moduleId} | task=${example.task} | providers=${example.supportedProviders.join(',')} | activation=${example.activation}`,
    );
  }
  for (const error of report.errors) console.error(`- ${error}`);
}

if (!report.valid) process.exit(1);
