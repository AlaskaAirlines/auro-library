/* eslint-disable no-console */

import { hex } from "../utils/ansiColors.mjs";

console.log(
  hex("#ffd200")(`

╭ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ──────────────────────────────╮`) +
    hex("#f26135")(`

    Are you familiar with Auro's Definition of Done?

                Please be sure to review`) +
    hex("#ffd200")(`
      https://auro.alaskaair.com/definition-of-done`) +
    hex("#f26135")(`
            before submitting your pull request
             to ensure that you are compliant.`) +
    hex("#ffd200")(`

╰─────────────────────────────── ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─╯
`),
);
