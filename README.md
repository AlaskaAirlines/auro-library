# Auro-Library

<!-- AURO-GENERATED-CONTENT:START (FILE:src=./../docs/partials/description.md) -->
<!-- The below content is automatically added from ./../docs/partials/description.md -->
This repository holds shared scripts, utilities, and workflows utilized across repositories along the Auro Design System.
<!-- AURO-GENERATED-CONTENT:END -->

## Scripts

### Publish Surge Demo

<!-- AURO-GENERATED-CONTENT:START (FILE:src=./../docs/partials/publishDemo.md) -->
<!-- The below content is automatically added from ./../docs/partials/publishDemo.md -->
This is an automated workflow that utilizes GitHub Actions to generate surge demos. Upon making any change to a PR a comment will be added or updated on the PR with a link to the demo similar to the following:

```md
Surge demo deployment succeeded! 🚀🚀🚀

[Auro Web Component Generator](https://surge.sh/)
```

This workflow utilizes the file `./scripts/config/useBundles.js` to update the demo HTML files to use the bundled versions of components so that they can be supported staticly in surge.

In order to add this functionality to an auro component you just need to add the following snippet into the `publishDemo.yml` file in the `./.github/workflows` directory.

```yml
name: Deploy Demo

on:
  pull_request:
    branches: [ main ]

jobs:
  call-publish-demo-workflow:
    uses: AlaskaAirlines/auro-library/.github/workflows/publishDemo.yml@main
    secrets:
      SURGE_TOKEN: ${{secrets.AURO_SURGE_TOKEN}}
```

> Note: This will only work properly in components located in the "AlaskaAirlines" organization due to a dependency on the org-wide Actions secret `AURO_SURGE_TOKEN`.

Afterwards you will want to make sure to update the script tags you want replaced with bundles in your `./demo/*.html` files with the `data-demo-scripts="true"` attribute.

```diff
--    <script type="module" src="../index.js"></script>
++    <script type="module" src="../index.js" data-demo-script="true"></script>
```

> Note: If you fail to do this, the components will fail to register in your demo.
<!-- AURO-GENERATED-CONTENT:END -->
---

### Surge Demo Teardown

<!-- AURO-GENERATED-CONTENT:START (FILE:src=./../docs/partials/demoTeardown.md) -->
<!-- The below content is automatically added from ./../docs/partials/demoTeardown.md -->
This workflow works to automatically delete and clear any surge demos that have been active for more than 2+ months. Surge in theory allows us to have an infinite amount of active pages but by clearing unused and stale demos we can keep our Surge account more organized in the future.

> Note: This workflow executes on a monthly cronjob on the first of each month.

In order to clear all our surge projects we rely on [this GitHub Action](https://github.com/marketplace/actions/surge-sh-teardown) to handle the deletion logic.
<!-- AURO-GENERATED-CONTENT:END -->
---

### Dependency Tag Versioning

<!-- AURO-GENERATED-CONTENT:START (FILE:src=./../docs/partials/dependencyTagVersioning.md) -->
<!-- The below content is automatically added from ./../docs/partials/dependencyTagVersioning.md -->
This is a two part utility for the purpose of generating a custom string for dependency component tag naming. This is important to prevent [version conflicts](https://www.thinktecture.com/en/web-components/web-components-flaws/#elementor-toc__heading-anchor-0) when multiple versions of a given Auro component may be loaded on a single page.

_Note: The example configuration used below in all code samples assumes `auro-dropdown` is the dependency component. Substitute any Auro component in the example code as needed._

#### Part 1: The Build

##### Configuration

1. Create a new file `./scripts/version.js` with the following content:

```js
const versionWriter = require("./versionWriter"); // need to update this with the right path when used from node_modules

versionWriter.writeDepVersionFile('@aurodesignsystem/auro-dropdown'); // duplicate this line for each Auro dependency.
```

2. Add the following script to the component `package.json` file:

```json
"build:version": "node scripts/version.js"
```

3. The `build:version` script in `package.json` should be added as the first step of the `build` script.

```json
"build": "npm-run-all build:version ... etc.",
```

##### Execution

Once configuration is complete, execute `npm run build`. This must be done once before `npm run dev` when developing locally. When Auro dependencies are initially installed or updated to new versions then `npm run build:version` or a complete `npm run build` must be executed.

Upon execution of `build:version`, for each Auro dependency defined in the `./scripts/version.js` file, a new JS file will be created that contains the installed version of the dependency.

For example, following these steps:
1. Run `npm i @aurodesignsystem/auro-dropdown@1.0.0`
2. add the following to the `./scripts/version.js` script file:
```js
versionWriter.writeDepVersionFile('@aurodesignsystem/auro-dropdown');
```
3. Run `npm run build`

Will result in:
- A new file created: `./src/dropdownVersion.js`
- File content will export the version of the component installed. In this case:
`export default '1.0.0'`

#### Part 2: The Runtime

##### Configuration

In the main component JS file located in the `./src` directory add the following:

```js
import { AuroDependencyVersioning } from "../scripts/dependencyTagVersioning.mjs";
import { AuroDropdown } from '@aurodesignsystem/auro-dropdown/src/auro-dropdown.js';
import dropdownVersion from './dropdownVersion';
```

In the components constructor add the following:

```js
const versioning = new AuroDependencyVersioning();
this.dropdownTag = versioning.generateTag('auro-dropdown', dropdownVersion, AuroDropdown);
```

In the component properties add the following:

```js
/**
 * @private
 */
dropdownTag: { type: Object }
```

##### Usage

The new dynamically named version of `auro-dropdown` may now be used in your component template as follows:

```js
render() {
  return html`
    <div>
      <${this.dropdownTag}></${this.dropdownTag}>
    </div>
  `;
}
```

When the component is rendered during runtime the DOM will now show up as follows:

```html
<div>
  <auro-dropdown_1_0_0></auro-dropdown_1_0_0>
</div>
```

_Note: the numbers attached in the tag name will match the version of the dependency that was installed._

##### Accessing the dynamically named element with JS

The dynamic component is accessible using a the following string in a JS query selector:
```js
this.dropdownTag._$litStatic$
```

```js
firstUpdated() {
  this.dropdown = this.shadowRoot.querySelector(this.dropdownTag._$litStatic$);
};
```
<!-- AURO-GENERATED-CONTENT:END -->
---

### Sync All Templates

<!-- AURO-GENERATED-CONTENT:START (FILE:src=./../docs/partials/syncAllTemplates.md) -->
<!-- The below content is automatically added from ./../docs/partials/syncAllTemplates.md -->

### How to Run the `syncAllTemplates.mjs` Script

To run the `syncAllTemplates.mjs` script, you will need to add a new node script into the linked component and point that to the `syncAllTemplates.mjs` file. You can individually run the workflow configurations by pointing to the `syncAllTemplates.mjs` file and adding a `--github` parameter after the path. The same can be done for the linter configurations by adding a `--linters` parameter.

#### Example Calls

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
<!-- AURO-GENERATED-CONTENT:END -->
