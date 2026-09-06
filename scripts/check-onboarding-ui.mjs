import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const configSource = await readFile(
  new URL("../src/features/onboarding/config.ts", import.meta.url),
  "utf8",
);
const configCode = ts.transpileModule(configSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const configUrl = `data:text/javascript;base64,${Buffer.from(configCode).toString("base64")}`;
const { CURRENT_ONBOARDING_VERSION, onboardingSteps } = await import(configUrl);

assert.equal(CURRENT_ONBOARDING_VERSION, 1);
assert.equal(onboardingSteps.length, 9);
assert.equal(new Set(onboardingSteps.map((step) => step.id)).size, 9);
assert.equal(new Set(onboardingSteps.map((step) => step.selector)).size, 9);
assert.ok(
  onboardingSteps.every((step) => step.navigationHref),
  "Every tour step should identify the active navigation item",
);
assert.deepEqual(
  onboardingSteps
    .filter((step) => step.advanceOnTargetClick)
    .map((step) => step.id),
  ["add-application", "interviews"],
);

const routeFiles = {
  "/dashboard": "../src/components/dashboard/dashboard-page.tsx",
  "/candidaturas": "../src/app/(app)/candidaturas/page.tsx",
  "/candidaturas/nova": "../src/components/applications/application-form.tsx",
  "/entrevistas": "../src/app/(app)/entrevistas/page.tsx",
  "/entrevistas/nova": "../src/components/interviews/interview-form.tsx",
  "/recrutadores": "../src/app/(app)/recrutadores/page.tsx",
  "/acoes": "../src/app/(app)/acoes/page.tsx",
};
const sourceByRoute = new Map();
for (const [route, path] of Object.entries(routeFiles)) {
  sourceByRoute.set(
    route,
    await readFile(new URL(path, import.meta.url), "utf8"),
  );
}

for (const step of onboardingSteps) {
  assert.ok(routeFiles[step.route], `Unknown route in tour: ${step.route}`);
  const target = step.selector.match(/data-tour='([^']+)'/)?.[1];
  assert.ok(target, `Invalid tour selector: ${step.selector}`);
  assert.match(
    sourceByRoute.get(step.route),
    new RegExp(`data-tour=["']${target}["']`),
    `Missing ${step.selector} on ${step.route}`,
  );
}

const migration = await readFile(
  new URL(
    "../supabase/migrations/20260906120000_add_onboarding_version.sql",
    import.meta.url,
  ),
  "utf8",
);
assert.match(migration, /onboarding_version smallint not null default 0/u);
assert.match(migration, /check \(onboarding_version >= 0\)/u);

const onboardingAction = await readFile(
  new URL("../src/features/onboarding/actions.ts", import.meta.url),
  "utf8",
);
assert.match(onboardingAction, /requireCurrentUser\(\)/u);
assert.match(
  onboardingAction,
  /update\(\{ onboarding_version: CURRENT_ONBOARDING_VERSION \}\)/u,
);
assert.match(onboardingAction, /\.eq\("id", user\.id\)/u);

const newApplicationPage = await readFile(
  new URL("../src/app/(app)/candidaturas/nova/page.tsx", import.meta.url),
  "utf8",
);
assert.match(newApplicationPage, /progressiveDisclosure/u);
assert.match(newApplicationPage, /headerTitle=\{t\("title"\)\}/u);

const applicationForm = await readFile(
  new URL(
    "../src/components/applications/application-form.tsx",
    import.meta.url,
  ),
  "utf8",
);
assert.match(applicationForm, /aria-expanded=\{showAdvancedDetails\}/u);
assert.match(applicationForm, /application-more-details/u);
assert.doesNotMatch(
  applicationForm.match(
    /const advancedApplicationFields = \[[\s\S]*?\] as const;/u,
  )?.[0] ?? "",
  /"jobUrl"/u,
);

const interviewForm = await readFile(
  new URL("../src/components/interviews/interview-form.tsx", import.meta.url),
  "utf8",
);
assert.match(
  interviewForm,
  /<select[\s\S]*?name="interviewType"[\s\S]*?<\/select>/u,
);
assert.doesNotMatch(interviewForm, /<datalist/u);

const sidebar = await readFile(
  new URL("../src/components/layout/app-sidebar.tsx", import.meta.url),
  "utf8",
);
assert.match(sidebar, /data-navigation-href=\{item\.href\}/u);

const applicationsPage = sourceByRoute.get("/candidaturas");
assert.match(applicationsPage, /xl:grid-cols-12/u);
assert.match(applicationsPage, /xl:col-span-6/u);
assert.ok(
  (applicationsPage.match(/xl:col-span-2/gu) ?? []).length >= 6,
  "The second filter row should fill the 12-column desktop grid",
);

console.log(
  "Onboarding/UI OK: 9 stable cross-route targets, per-account persistence, progressive form and filter grid verified.",
);
