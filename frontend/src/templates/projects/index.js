// FILE: frontend/src/templates/projects/index.js
// Purpose: Serves as a central barrel file for exporting all project templates.
//
// This pattern allows other parts of the application to import any available
// project template from a single, consistent path, like:
// `import { simpleCounterTemplate } from '@/templates/projects';`
// This simplifies imports and keeps the project structure clean.

// Exports the template for the "Simple Counter" project.
export { simpleCounterTemplate } from './simpleCounter';

// Exports the template for the "Whispering Woods" project.
export { whisperingWoodsTemplate } from './whisperingWoods'; // A placeholder for a future template.
