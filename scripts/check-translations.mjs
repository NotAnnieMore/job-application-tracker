import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { createTranslator } from "next-intl";
import ts from "typescript";

const locales = ["pt-PT", "en-GB"];

function flatten(messages, prefix = "") {
  return Object.fromEntries(
    Object.entries(messages).flatMap(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      return typeof value === "string"
        ? [[path, value]]
        : Object.entries(flatten(value, path));
    }),
  );
}

function parameters(message) {
  return [...message.matchAll(/\{(\w+)\s*(?:,|\})/g)]
    .map((match) => match[1])
    .filter((value, index, values) => values.indexOf(value) === index)
    .sort();
}

const dictionaries = await Promise.all(
  locales.map(async (locale) => {
    const messages = JSON.parse(
      await readFile(
        new URL(`../messages/${locale}.json`, import.meta.url),
        "utf8",
      ),
    );
    return { locale, messages, flat: flatten(messages) };
  }),
);

const reference = dictionaries[0].flat;
for (const { locale, messages, flat } of dictionaries) {
  assert.deepEqual(
    Object.keys(flat).sort(),
    Object.keys(reference).sort(),
    `${locale}: translation keys must match Portuguese`,
  );
  const errors = [];
  const t = createTranslator({
    locale,
    messages,
    onError: (error) => errors.push(error),
  });

  for (const [key, message] of Object.entries(flat)) {
    assert.ok(message.trim(), `${locale}: empty translation at ${key}`);
    assert.deepEqual(
      parameters(message),
      parameters(reference[key]),
      `${locale}: interpolation parameters differ at ${key}`,
    );
    // Exercise ICU plurals with zero, singular and plural values.
    for (const count of [0, 1, 2]) {
      const values = Object.fromEntries(
        parameters(message).map((parameter) => [
          parameter,
          parameter === "count" ||
          /^(?:plural|number)\b/u.test(
            message.split(`{${parameter},`)[1]?.trim() ?? "",
          )
            ? count
            : "Example",
        ]),
      );
      assert.ok(t(key, values), `${locale}: failed to format ${key}`);
    }
  }
  assert.equal(
    errors.length,
    0,
    `${locale}: invalid ICU messages: ${errors.map((error) => error.message).join("; ")}`,
  );
}

// Loading headings must use the same dictionary as their destination pages.
const appDirectory = new URL("../src/app/", import.meta.url);
let loadingCount = 0;
for (const path of await readdir(appDirectory, { recursive: true })) {
  if (!/(^|[/\\])loading\.tsx$/u.test(path)) continue;
  const source = await readFile(
    new URL(path.replaceAll("\\", "/"), appDirectory),
    "utf8",
  );
  const ast = ts.createSourceFile(
    path,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  function visit(node) {
    if (
      ts.isJsxAttribute(node) &&
      ["title", "description"].includes(node.name.getText(ast))
    ) {
      assert.ok(
        !node.initializer || !ts.isStringLiteral(node.initializer),
        `${path}: loading text must come from a translation`,
      );
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  loadingCount++;
}

console.log(
  `Translations OK: ${Object.keys(reference).length} keys in each of ${locales.length} locales; ICU formatting and parameter parity verified.`,
);
console.log(
  `Loading localisation OK: ${loadingCount} loading files checked for untranslated headings.`,
);
