import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createTranslator } from "next-intl";
import ts from "typescript";

// Exercise the real pure modules without a development server or database.
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

const { validateActionForm } = await import(
  await moduleUrl("../src/features/actions/validation.ts", {
    "@/lib/validation": await moduleUrl("../src/lib/validation.ts"),
  })
);
const { formatActionDate } = await import(
  await moduleUrl("../src/features/actions/date.ts")
);
const { formatAgendaDate } = await import(
  await moduleUrl("../src/features/calendar/date.ts")
);
const { formatInterviewTime } = await import(
  await moduleUrl("../src/features/interviews/date.ts")
);

const valid = {
  applicationId: "00000000-0000-4000-8000-000000000001",
  description: "  Preparar o CV  ",
  dueDate: "2026-09-04",
  status: "pending",
  priority: "medium",
};
function form(values) {
  const result = new FormData();
  for (const [key, value] of Object.entries(values)) result.set(key, value);
  return result;
}
const invalidCases = [
  ["applicationId", "", "invalidApplication"],
  ["applicationId", "invalid", "invalidApplication"],
  ["description", " ", "requiredDescription"],
  ["description", "x".repeat(501), "descriptionLength"],
  ["dueDate", "2026-02-29", "invalidDate"],
  ["dueDate", "2026-04-31", "invalidDate"],
  ["dueDate", "04/09/2026", "invalidDate"],
  ["status", "invalid", "invalidStatus"],
  ["priority", "invalid", "invalidPriority"],
];
let reference;
let checked = 0;
for (const locale of ["pt-PT", "en-GB"]) {
  const messages = JSON.parse(
    await readFile(
      new URL(`../messages/${locale}.json`, import.meta.url),
      "utf8",
    ),
  );
  const t = createTranslator({ locale, messages, namespace: "TaskValidation" });
  const good = validateActionForm(form(valid), t);
  assert.deepEqual(good.fieldErrors, {});
  assert.equal(good.values.description, "Preparar o CV");
  assert.equal(good.values.due_date, valid.dueDate);
  if (reference) assert.deepEqual(good.values, reference);
  reference = good.values;

  for (const [field, value, message] of invalidCases) {
    const result = validateActionForm(form({ ...valid, [field]: value }), t);
    assert.deepEqual(result.fieldErrors, { [field]: t(message) });
    checked += 1;
  }
  for (const dueDate of ["", "2024-02-29", "2026-12-31", "2027-01-01"]) {
    const result = validateActionForm(
      form({ ...valid, dueDate, description: "x".repeat(500) }),
      t,
    );
    assert.deepEqual(result.fieldErrors, {});
    assert.equal(result.values.due_date, dueDate || null);
  }
  for (const status of ["pending", "completed", "cancelled"]) {
    for (const priority of ["low", "medium", "high"]) {
      const result = validateActionForm(
        form({ ...valid, status, priority }),
        t,
      );
      assert.deepEqual(result.fieldErrors, {});
      assert.equal(result.values.status, status);
      assert.equal(result.values.priority, priority);
      if (status === "completed")
        assert.ok(Number.isFinite(Date.parse(result.values.completed_at)));
      else assert.equal(result.values.completed_at, null);
    }
  }
  assert.equal(formatActionDate("2026-09-04", locale), "04/09/2026");
  assert.equal(formatInterviewTime("2026-01-04T12:30:00Z", locale), "12:30");
  assert.equal(formatInterviewTime("2026-07-04T12:30:00Z", locale), "13:30");
  const heading = formatAgendaDate("2026-09-04", locale);
  assert.match(
    heading,
    locale === "en-GB"
      ? /Friday.*September.*2026/u
      : /Sexta-feira.*setembro.*2026/u,
  );
}
console.log(
  `Tasks/calendar OK: ${checked} localised error cases, valid boundaries, status/priority combinations, preserved data and dates/time zones verified.`,
);
