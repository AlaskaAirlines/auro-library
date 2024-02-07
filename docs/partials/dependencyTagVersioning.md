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
