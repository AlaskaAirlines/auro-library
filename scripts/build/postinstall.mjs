import { createRequire } from "node:module";
import { resolve } from "path";
import { hex } from "../utils/ansiColors.mjs";

const require = createRequire(import.meta.url);
const pjson = require(resolve(process.cwd(), "package.json"));

console.log(
  hex("#f26135")(`

 _______                   __           __ __
|     __|.---.-.--.--.    |  |--.-----.|  |  |.-----.
|__     ||  _  |  |  |    |     |  -__||  |  ||  _  |
|_______||___._|___  |    |__|__|_____||__|__||_____|
               |_____|
 __              _______                    __
|  |_.-----.    |   _   |.--.--.----.-----.|  |
|   _|  _  |    |       ||  |  |   _|  _  ||__|
|____|_____|    |___|___||_____|__| |_____||__|


╭ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ──────────────────────────────╮

        Thanks for installing the latest version
        of `) +
    hex("#ffd200").bold(`${pjson.name} v${pjson.version}.`) +
    hex("#f26135")(`

╰─────────────────────────────── ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─╯
`),
);
