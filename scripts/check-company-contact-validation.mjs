import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createTranslator } from "next-intl";
import ts from "typescript";

// Compile the actual pure validators in memory, without a server or database.
async function moduleUrl(path, dependencies = {}) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  let code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  for (const [specifier, url] of Object.entries(dependencies)) {
    code = code.replaceAll(JSON.stringify(specifier), JSON.stringify(url));
  }
  return `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
}

const uuidUrl = await moduleUrl("../src/lib/validation.ts");
const { validateCompanyForm } = await import(
  await moduleUrl("../src/features/companies/validation.ts")
);
const { validateRecruiterForm } = await import(
  await moduleUrl("../src/features/recruiters/validation.ts", {
    "@/lib/validation": uuidUrl,
  })
);

function form(values) {
  const result = new FormData();
  for (const [key, value] of Object.entries(values)) result.set(key, value);
  return result;
}

const companyCases = [
  ["name", " ", "requiredName"],
  ["name", "x".repeat(161), "nameLength"],
  ["website", "https://[", "invalidWebsite"],
  ["website", "x".repeat(501), "websiteLength"],
  ["logoUrl", "http://example.com/logo.png", "httpsLogo"],
  ["logoUrl", "not-a-url", "invalidLogo"],
  ["logoUrl", "x".repeat(1001), "logoLength"],
  ["location", "x".repeat(161), "locationLength"],
  ["industry", "x".repeat(161), "industryLength"],
  ["notes", "x".repeat(4001), "notesLength"],
  ["workMode", "invalid", "invalidWorkMode"],
];
const contactCases = [
  ["companyId", "invalid-id", "invalidCompany"],
  ["name", " ", "requiredName"],
  ["name", "x".repeat(161), "nameLength"],
  ["email", "x".repeat(255), "emailLength"],
  ["email", "not-an-email", "invalidEmail"],
  ["phone", "1".repeat(51), "phoneLength"],
  ["phone", "not-a-phone", "invalidPhone"],
  ["jobTitle", "x".repeat(161), "jobTitleLength"],
  [
    "linkedinUrl",
    "https://linkedin.com.evil.example/profile",
    "invalidLinkedin",
  ],
  ["linkedinUrl", "http://linkedin.com/in/example", "invalidLinkedin"],
  ["linkedinUrl", "https://[", "invalidLinkedin"],
  ["linkedinUrl", "x".repeat(501), "linkedinLength"],
  ["notes", "x".repeat(4001), "notesLength"],
];
const scenarios = [
  {
    namespace: "CompanyValidation",
    validate: validateCompanyForm,
    valid: {
      name: "  Empresa Original  ",
      website: "example.com",
      workMode: "remote",
      notes: "Notas originais",
    },
    cases: companyCases,
    boundaries: {
      name: "x".repeat(160),
      location: "x".repeat(160),
      industry: "x".repeat(160),
      notes: "x".repeat(4000),
    },
  },
  {
    namespace: "RecruiterValidation",
    validate: validateRecruiterForm,
    valid: {
      name: "  Contacto Original  ",
      email: "EXAMPLE@EXAMPLE.COM",
      linkedinUrl: "linkedin.com/in/example",
      phone: "+351 912 345 678",
      notes: "Notas originais",
    },
    cases: contactCases,
    boundaries: {
      name: "x".repeat(160),
      jobTitle: "x".repeat(160),
      notes: "x".repeat(4000),
      companyId: "00000000-0000-4000-8000-000000000001",
    },
  },
];

const valuesByScenario = new Map();
let checked = 0;
for (const locale of ["pt-PT", "en-GB"]) {
  const messages = JSON.parse(
    await readFile(
      new URL(`../messages/${locale}.json`, import.meta.url),
      "utf8",
    ),
  );
  for (const { namespace, validate, valid, cases, boundaries } of scenarios) {
    const t = createTranslator({ locale, messages, namespace });
    const good = validate(form(valid), t);
    assert.deepEqual(good.fieldErrors, {});
    if (valuesByScenario.has(namespace)) {
      assert.deepEqual(
        good.values,
        valuesByScenario.get(namespace),
        "Locale must not change stored values",
      );
    } else {
      valuesByScenario.set(namespace, good.values);
    }
    assert.deepEqual(validate(form(boundaries), t).fieldErrors, {});
    assert.deepEqual(validate(form({ name: "Example" }), t).fieldErrors, {});
    for (const [field, value, message] of cases) {
      const result = validate(form({ name: "Example", [field]: value }), t);
      assert.deepEqual(Object.keys(result.fieldErrors), [field]);
      assert.equal(
        result.fieldErrors[field],
        t(message),
        `${locale}: ${namespace}.${message}`,
      );
      checked += 1;
    }
  }
}

assert.equal(
  valuesByScenario.get("CompanyValidation").website,
  "https://example.com/",
);
assert.equal(valuesByScenario.get("CompanyValidation").work_mode, "remote");
assert.equal(
  valuesByScenario.get("CompanyValidation").name,
  "Empresa Original",
);
assert.equal(
  valuesByScenario.get("RecruiterValidation").email,
  "example@example.com",
);
assert.equal(
  valuesByScenario.get("RecruiterValidation").linkedin_url,
  "https://linkedin.com/in/example",
);
console.log(
  `Company/contact validation OK: ${checked} localised error cases, accepted boundaries and unchanged normalised data in both locales.`,
);
