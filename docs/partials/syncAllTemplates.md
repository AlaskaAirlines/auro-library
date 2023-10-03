## How to Run the `syncAllTemplates.mjs` Script

To run the `syncAllTemplates.mjs` script, you will need to add a new node script into the linked component and point that to the `syncAllTemplates.mjs` file. You can individually run the workflow configurations by pointing to the `syncAllTemplates.mjs` file and adding a `--github` parameter after the path. The same can be done for the linter configurations by adding a `--linters` parameter.

### Example Calls

```
// Default
"syncTemplates": "./node_modules/@aurodesignsystem/auro-library/scripts/config/syncAllTemplates.mjs"
```

```
// Only sync github workflow templates
"syncTemplates": "./node_modules/@aurodesignsystem/auro-library/scripts/config/syncAllTemplates.mjs --github"
```

```
// Only sync linter configuration templates
"syncTemplates": "./node_modules/@aurodesignsystem/auro-library/scripts/config/syncAllTemplates.mjs --linters"
```
