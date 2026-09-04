import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createTranslator } from "next-intl";
import ts from "typescript";

// Real application code, isolated from Supabase and Next's runtime.
const codeUrl = (code) =>
  `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
async function moduleUrl(path, dependencies = {}) {
  let code = ts.transpileModule(
    await readFile(new URL(path, import.meta.url), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  for (const [name, url] of Object.entries(dependencies))
    code = code.replaceAll(JSON.stringify(name), JSON.stringify(url));
  return codeUrl(code);
}
const statuses = [
  "interested",
  "applied",
  "interview_scheduled",
  "interview_completed",
  "awaiting_response",
  "offer_received",
  "rejected",
  "withdrawn",
];
const id = "00000000-0000-4000-8000-000000000001";
const interviewId = "00000000-0000-4000-8000-000000000002";
const fixture = {
  status: "applied",
  owner: "user",
  missing: false,
  queryError: false,
  inserts: [],
  updates: [],
  options: false,
  locale: "pt-PT",
  messages: null,
};
function client() {
  return {
    from(table) {
      const filters = [],
        query = {
          select() {
            return query;
          },
          eq(field, value) {
            filters.push((row) => row[field] === value);
            return query;
          },
          in(field, values) {
            filters.push((row) => values.includes(row[field]));
            return query;
          },
          update(values) {
            fixture.updates.push({ table, values });
            return query;
          },
          async insert(values) {
            fixture.inserts.push(values);
            return { error: null };
          },
          rows() {
            let rows = [];
            if (table === "applications" && !fixture.missing)
              rows = (fixture.options ? statuses : [fixture.status]).map(
                (status, index) => ({
                  id: fixture.options ? `${id}-${index}` : id,
                  user_id: fixture.owner,
                  status,
                  opportunity_id: "opportunity",
                  primary_recruiter_id: null,
                  interview_preparation: "Guião original",
                  questions_for_company: "Perguntas originais",
                }),
              );
            if (table === "opportunities")
              rows = [
                {
                  id: "opportunity",
                  user_id: "user",
                  company_id: "company",
                  title: "Vaga original",
                },
              ];
            if (table === "companies")
              rows = [
                {
                  id: "company",
                  user_id: "user",
                  name: "Empresa original",
                  logo_url: null,
                },
              ];
            if (table === "interviews")
              rows = [{ id: interviewId, user_id: "user", application_id: id }];
            return rows.filter((row) => filters.every((filter) => filter(row)));
          },
          async maybeSingle() {
            return {
              data: query.rows()[0] ?? null,
              error: fixture.queryError ? {} : null,
            };
          },
          then(resolve, reject) {
            return Promise.resolve({ data: query.rows(), error: null }).then(
              resolve,
              reject,
            );
          },
        };
      return query;
    },
  };
}
globalThis.__interviewEligibilityTest = {
  client,
  translate: (namespace) =>
    createTranslator({
      locale: fixture.locale,
      messages: fixture.messages,
      namespace,
      onError(error) {
        throw error;
      },
    }),
};
const eligibilityUrl = await moduleUrl(
  "../src/features/interviews/eligibility.ts",
);
const { canCreateInterview } = await import(eligibilityUrl);
const dependencies = {
  "server-only": codeUrl("export {};"),
  "next-intl/server": codeUrl(
    "export async function getTranslations(ns){return globalThis.__interviewEligibilityTest.translate(ns)}",
  ),
  "next/cache": codeUrl("export function revalidatePath(){}"),
  "next/navigation": codeUrl(
    'export function redirect(url){const error=new Error("redirect");error.destination=url;throw error;}',
  ),
  "@/lib/auth/session": codeUrl(
    'export async function requireCurrentUser(){return {id:"user"}}',
  ),
  "@/lib/supabase/server": codeUrl(
    "export async function createClient(){return globalThis.__interviewEligibilityTest.client()}",
  ),
  "@/features/interviews/eligibility": eligibilityUrl,
  "@/features/interviews/constants": await moduleUrl(
    "../src/features/interviews/constants.ts",
  ),
  "@/features/interviews/date": await moduleUrl(
    "../src/features/interviews/date.ts",
  ),
  "@/features/interviews/validation": await moduleUrl(
    "../src/features/interviews/validation.ts",
    { "@/lib/validation": await moduleUrl("../src/lib/validation.ts") },
  ),
};
const { createInterviewAction, updateInterviewAction } = await import(
  await moduleUrl("../src/features/interviews/actions.ts", dependencies)
);
const { getInterviewApplicationOptions } = await import(
  await moduleUrl("../src/features/interviews/data.ts", dependencies)
);
function form() {
  const data = new FormData();
  for (const [key, value] of Object.entries({
    applicationId: id,
    interviewType: "Entrevista original",
    scheduledAtLocal: "2026-09-10T14:30",
    timezoneOffset: "-60",
    status: "scheduled",
    format: "video",
    durationMinutes: "30",
  }))
    data.set(key, value);
  return data;
}
let checked = 0;
try {
  for (const locale of ["pt-PT", "en-GB"]) {
    fixture.locale = locale;
    fixture.messages = JSON.parse(
      await readFile(
        new URL(`../messages/${locale}.json`, import.meta.url),
        "utf8",
      ),
    );
    const t =
      globalThis.__interviewEligibilityTest.translate("InterviewActions");
    for (const status of statuses) {
      fixture.status = status;
      fixture.inserts = [];
      const eligible = ["applied", "awaiting_response"].includes(status);
      assert.equal(canCreateInterview(status), eligible);
      if (eligible) {
        await assert.rejects(
          createInterviewAction({ status: "idle" }, form()),
          (error) =>
            error.destination === "/entrevistas?aviso=entrevista-criada",
        );
        assert.equal(fixture.inserts.length, 1);
        assert.equal(fixture.inserts[0].application_id, id);
        assert.equal(fixture.inserts[0].user_id, "user");
      } else {
        const result = await createInterviewAction({ status: "idle" }, form());
        assert.equal(result.status, "error");
        assert.equal(
          result.fieldErrors.applicationId,
          t("ineligibleApplication"),
        );
        assert.equal(fixture.inserts.length, 0);
      }
      checked++;
    }
    // Stale forms are blocked using the latest persisted status, not submitted fields.
    fixture.status = "rejected";
    fixture.inserts = [];
    const stale = form();
    stale.set("applicationStatus", "applied");
    assert.equal(
      (await createInterviewAction({ status: "idle" }, stale)).fieldErrors
        .applicationId,
      t("ineligibleApplication"),
    );
    assert.equal(fixture.inserts.length, 0);
    for (const mutation of [
      { owner: "another-user" },
      { missing: true },
      { queryError: true },
    ]) {
      Object.assign(
        fixture,
        { owner: "user", missing: false, queryError: false, status: "applied" },
        mutation,
      );
      const result = await createInterviewAction({ status: "idle" }, form());
      assert.equal(result.fieldErrors.applicationId, t("availableApplication"));
      assert.equal(fixture.inserts.length, 0);
    }
    Object.assign(fixture, {
      owner: "user",
      missing: false,
      queryError: false,
      status: "rejected",
      options: true,
    });
    const eligible = await getInterviewApplicationOptions({
      forCreation: true,
    });
    assert.equal(eligible.length, 2);
    assert.deepEqual(eligible.map((row) => row.id).sort(), [
      `${id}-1`,
      `${id}-4`,
    ]);
    assert.equal(
      (await getInterviewApplicationOptions()).length,
      8,
      "History/filter options must remain available",
    );
    fixture.options = false;
    fixture.updates = [];
    await assert.rejects(
      updateInterviewAction(interviewId, false, { status: "idle" }, form()),
      (error) => error.destination?.startsWith(`/entrevistas/${interviewId}?`),
    );
    assert.equal(
      fixture.updates.length,
      1,
      "Existing interviews remain editable after rejection",
    );
    assert.equal(fixture.updates[0].table, "interviews");
  }
} finally {
  delete globalThis.__interviewEligibilityTest;
}
console.log(
  `Interview eligibility OK: ${checked} status/locale cases, filtered options, stale/foreign/missing applications and historical editing. No external I/O.`,
);
