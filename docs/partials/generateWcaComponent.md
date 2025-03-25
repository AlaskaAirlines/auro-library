# How to Run the `generateWcaComponent.mjs` Script

To run the `generateWcaComponent.mjs` script, you need to provide the file paths for the components you want to process with WCA. This script should be executed only once after adding a new component to the project. Upon running the script, `.js` files will be generated in the `scripts/wca` folder.

## Example Calls

```json
// Common case: 1 component in 1 project
"build:api:prepare": "node ./node_modules/@aurodesignsystem/auro-library/scripts/generateWcaComponent.mjs 'src/auro-flight.js'"
```

```
// multiple components in 1 project
"build:api:prepare": "node ./node_modules/@aurodesignsystem/auro-library/scripts/config/syncAllTemplates.mjs 'src/auro-flight*.js'"
```
