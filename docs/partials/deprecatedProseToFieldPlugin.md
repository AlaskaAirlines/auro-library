The `deprecatedProseToFieldPlugin` is a shared [Custom Elements Manifest](https://github.com/open-wc/custom-elements-manifest) analyzer plugin. It promotes deprecation prose written on `@event` and `@slot` tags into the machine-readable `deprecated` field of the generated `custom-elements.json`, so editor tooling can strike deprecated events and slots through.

The CEM analyzer already emits a `deprecated` field for attributes and members declared with an explicit `@deprecated` JSDoc tag, but it does **not** do so for events and slots declared as inline class-level `@event` / `@slot` tags. This plugin fills that gap by scanning each declaration's `events` and `slots` and, where a description contains a deprecation marker (`(Deprecated) …`, `**DEPRECATED** …`, or a leading `deprecated` word):

- sets `deprecated` to the guidance text that follows the marker and a separator (`-`, `:`, `–`, or `—`) — for example, `"Use the \`input\` event instead."`, or
- sets `deprecated` to `true` when the prose offers no replacement guidance.

Attributes and members are intentionally left untouched — the analyzer already flags those correctly. Entries that already carry a `deprecated` value are never overwritten.

## Usage

Import the plugin into your component library's `custom-elements-manifest.config.mjs` and add it to the `plugins` array:

```js
import { deprecatedProseToFieldPlugin } from '@aurodesignsystem/auro-library/scripts/build/deprecatedProseToFieldPlugin.mjs';

export default {
  globs: ['components/**/src/*.js'],
  litelement: true,
  plugins: [deprecatedProseToFieldPlugin()]
};
```

Regenerating your `custom-elements.json` will now mark deprecated events and slots with their guidance messages.
