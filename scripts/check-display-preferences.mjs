import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const configSource = await readFile(
  new URL("../src/i18n/config.ts", import.meta.url),
  "utf8",
);
const transpiledConfig = ts.transpileModule(configSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const config = await import(
  `data:text/javascript;base64,${Buffer.from(transpiledConfig).toString("base64")}`
);

assert.equal(config.localeFromAcceptLanguage("pt-PT,pt;q=0.9"), "pt-PT");
assert.equal(config.localeFromAcceptLanguage("pt-BR,pt;q=0.9"), "pt-PT");
assert.equal(config.localeFromAcceptLanguage("PT-br"), "pt-PT");
assert.equal(config.localeFromAcceptLanguage("en-US,en;q=0.9"), "en-GB");
assert.equal(config.localeFromAcceptLanguage("es-ES,pt-PT;q=0.9"), "en-GB");
assert.equal(config.localeFromAcceptLanguage("pt-AO"), "en-GB");
assert.equal(config.localeFromAcceptLanguage(null), "en-GB");

const [requestSource, layoutSource, settingsSource, fontSettingsSource, css] =
  await Promise.all([
    readFile(new URL("../src/i18n/request.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/app/layout.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../src/app/(app)/definicoes/page.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL(
        "../src/components/accessibility/font-size-settings.tsx",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(new URL("../src/app/globals.css", import.meta.url), "utf8"),
  ]);

assert.match(requestSource, /localeFromAcceptLanguage/u);
assert.match(requestSource, /get\("accept-language"\)/u);
assert.match(layoutSource, /job-tracker-font-scale/u);
assert.match(layoutSource, /data-font-scale="100"/u);
assert.match(settingsSource, /<FontSizeSettings\s*\/>/u);
assert.match(fontSettingsSource, /type="range"/u);
assert.match(fontSettingsSource, /\[90, 95, 100, 105, 110\]/u);
assert.match(css, /--app-font-scale: 1/u);
assert.match(css, /--text-sm: calc\(0\.875rem \* var\(--app-font-scale\)\)/u);
assert.doesNotMatch(
  css,
  /\.job-tracker-tour-navigation[^}]*background:\s*#fff/isu,
);

console.log(
  "Display preferences OK: browser locale, manual-preference fallback, text scale and tour navigation styling verified.",
);
