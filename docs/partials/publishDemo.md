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
