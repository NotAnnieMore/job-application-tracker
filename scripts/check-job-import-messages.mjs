import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createTranslator } from "next-intl";
import ts from "typescript";

// Run the real route and parsers with all external I/O replaced by local fixtures.
function codeUrl(code) {
  return `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
}
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
const fixture = { authenticated: true, publicDns: true, t: null };
globalThis.__jobImportTest = fixture;
const errorsUrl = await moduleUrl("../src/features/job-import/errors.ts");
const urlsUrl = await moduleUrl("../src/features/job-import/url.ts", {
  "@/features/job-import/errors": errorsUrl,
});
const { normalizeJobUrl } = await import(urlsUrl);
const { JobImportError } = await import(errorsUrl);
const { POST } = await import(
  await moduleUrl("../src/app/api/job-import/route.ts", {
    "@/features/job-import/errors": errorsUrl,
    "@/features/job-import/url": urlsUrl,
    "@/features/job-import/parser": await moduleUrl(
      "../src/features/job-import/parser.ts",
    ),
    "next-intl/server": codeUrl(
      "export async function getTranslations() { return globalThis.__jobImportTest.t; }",
    ),
    "@/lib/supabase/server": codeUrl(
      'export async function createClient() { return {auth:{getClaims:async()=>({data:{claims:globalThis.__jobImportTest.authenticated?{sub:"test-user"}:null},error:null})}}; }',
    ),
    "node:dns/promises": codeUrl(
      'export async function resolve4() { return globalThis.__jobImportTest.publicDns?["93.184.216.34"]:["127.0.0.1"]; } export async function resolve6() { return []; }',
    ),
  })
);
const originalFetch = globalThis.fetch;
const responseHtml = (html, headers = {}) =>
  new Response(html, { headers: { "content-type": "text/html", ...headers } });
const html = (description) =>
  `<script type="application/ld+json">${JSON.stringify({ "@type": "JobPosting", title: "Vaga original", description, hiringOrganization: { name: "Empresa original" }, jobLocation: { address: { addressLocality: "Lisboa" } } })}</script>`;
async function request(payload) {
  const response = await POST(
    new Request("https://app.example/api/job-import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
  return { status: response.status, body: await response.json() };
}
let checked = 0,
  reference;
try {
  for (const locale of ["pt-PT", "en-GB"]) {
    const messages = JSON.parse(
      await readFile(
        new URL(`../messages/${locale}.json`, import.meta.url),
        "utf8",
      ),
    );
    const t = createTranslator({
      locale,
      messages,
      namespace: "JobImportMessages",
      onError(error) {
        throw error;
      },
    });
    fixture.t = t;
    globalThis.fetch = async () => {
      throw Error("Unexpected network access");
    };
    const errorCases = [
      [{}, 400, "inputRequired"],
      [{ url: "x".repeat(4001) }, 400, "inputTooLong"],
      [{ text: "x".repeat(20001) }, 400, "inputTooLong"],
      [{ url: "https://[" }, 422, "invalidJobUrl"],
      [{ url: "https://user:secret@jobs.example/job" }, 422, "invalidProtocol"],
      [{ url: "http://localhost/job" }, 422, "blockedAddress"],
      [{ url: "http://127.0.0.1/job" }, 422, "unverifiedAddress"],
      [
        { url: "https://www.linkedin.com/jobs/search-results/" },
        422,
        "linkedinJobRequired",
      ],
      [{ url: "https://pt.indeed.com/jobs" }, 422, "indeedJobRequired"],
    ];
    for (const [payload, status, key] of errorCases) {
      assert.deepEqual(await request(payload), {
        status,
        body: { message: t(key) },
      });
      checked++;
    }
    fixture.authenticated = false;
    assert.deepEqual(await request({ text: "test" }), {
      status: 401,
      body: { message: t("sessionExpired") },
    });
    fixture.authenticated = true;
    const invalidJson = await POST(
      new Request("https://app.example/api/job-import", {
        method: "POST",
        body: "{",
      }),
    );
    assert.equal(invalidJson.status, 400);
    assert.equal((await invalidJson.json()).message, t("invalidRequest"));
    fixture.publicDns = false;
    assert.equal(
      (await request({ url: "https://jobs.example/job" })).body.message,
      t("unverifiedAddress"),
    );
    fixture.publicDns = true;
    for (const [response, key] of [
      [() => new Response("", { status: 403 }), "accessDenied"],
      [
        () =>
          new Response("{}", {
            headers: { "content-type": "application/json" },
          }),
        "notHtml",
      ],
      [() => responseHtml("", { "content-length": "1500001" }), "pageTooLarge"],
      [() => responseHtml("x".repeat(1500001)), "pageTooLarge"],
      [
        () =>
          new Response(null, {
            status: 302,
            headers: { location: "https://jobs.example/again" },
          }),
        "tooManyRedirects",
      ],
      [
        () =>
          new Response(null, {
            status: 302,
            headers: { location: "http://127.0.0.1/private" },
          }),
        "unverifiedAddress",
      ],
    ]) {
      globalThis.fetch = async () => response();
      assert.equal(
        (await request({ url: "https://jobs.example/job" })).body.message,
        t(key),
      );
      checked++;
    }
    globalThis.fetch = async () => {
      throw new Error("private upstream detail");
    };
    assert.equal(
      (await request({ url: "https://jobs.example/job" })).body.message,
      t("importFailed"),
    );
    assert.equal(
      (
        await request({
          url: "https://pt.indeed.com/viewjob?jk=7abbf370c2c82dc3",
        })
      ).body.message,
      t("indeedBlocked"),
    );
    globalThis.fetch = async () => responseHtml(html("Descrição original"));
    const success = await request({ url: "https://jobs.example/job" });
    assert.equal(success.status, 200);
    assert.equal(success.body.data.title, "Vaga original");
    assert.equal(success.body.data.description, "Descrição original");
    if (reference)
      assert.deepEqual(
        success.body.data,
        reference,
        "Locale must not change imported content",
      );
    else reference = success.body.data;
    globalThis.fetch = async () => responseHtml(html("a".repeat(6000)));
    const long = await request({ url: "https://jobs.example/job" });
    assert.equal(long.body.data.description.length, 5000);
    assert.ok(
      long.body.warnings.includes(
        t("descriptionTruncated", {
          descriptionLength: 6000,
          maxDescriptionLength: 5000,
        }),
      ),
    );
    globalThis.fetch = async () =>
      responseHtml(
        '<h1 class="top-card-layout__title">Vaga original</h1><a class="topcard__org-name-link">Empresa original</a><span class="topcard__flavor--bullet">Lisboa</span><div class="show-more-less-html__markup">LinkedIn description</div>',
      );
    const linkedin = await request({
      url: "https://www.linkedin.com/jobs/search-results/?currentJobId=4448300831&trackingId=discard",
    });
    assert.equal(
      linkedin.body.data.jobUrl,
      "https://www.linkedin.com/jobs/view/4448300831/",
    );
    assert.ok(linkedin.body.warnings.includes(t("linkedinReview")));
    // Every parser must leave truncation to the response boundary, so warnings survive.
    for (const length of [5000, 5001, 6000]) {
      const description = "a".repeat(length);
      const fixtures = [
        [{ url: "https://jobs.example/job" }, html(description)],
        [
          { url: "https://www.linkedin.com/jobs/view/4448300831/" },
          `<h1 class="top-card-layout__title">Job</h1><a class="topcard__org-name-link">Company</a><div class="show-more-less-html__markup">${description}</div>`,
        ],
        [
          { url: "https://pt.indeed.com/viewjob?jk=7abbf370c2c82dc3" },
          `<script>${JSON.stringify({ jobTitle: "Job", companyName: "Company", sanitizedJobDescription: description })}</script>`,
        ],
        [{ text: `Job\nCompany\nSobre a vaga\n${description}` }, ""],
      ];
      for (const [payload, markup] of fixtures) {
        globalThis.fetch = async () => responseHtml(markup);
        const imported = await request(payload);
        assert.equal(imported.status, 200);
        assert.equal(
          imported.body.data.description.length,
          Math.min(length, 5000),
        );
        const warning = t("descriptionTruncated", {
          descriptionLength: length,
          maxDescriptionLength: 5000,
        });
        assert.equal(imported.body.warnings.includes(warning), length > 5000);
      }
    }
    globalThis.fetch = async () => {
      throw Error("blocked");
    };
    const fallback = await request({
      url: "https://jobs.example/job",
      text: "Vaga original\nEmpresa original\nLisboa\nSobre a vaga\nDescrição original",
    });
    assert.equal(fallback.status, 200);
    assert.ok(fallback.body.warnings.includes(t("textFallback")));
    const linkedinFallback = await request({
      url: "https://www.linkedin.com/jobs/view/4448300831/",
      text: "Vaga original\nEmpresa original\nSobre a vaga\nDescrição original",
    });
    assert.ok(linkedinFallback.body.warnings.includes(t("linkedinFallback")));
  }
  assert.equal(
    normalizeJobUrl(
      new URL(
        "https://pt.indeed.com/jobs?vjk=7abbf370c2c82dc3&tracking=discard",
      ),
    ).toString(),
    "https://pt.indeed.com/viewjob?jk=7abbf370c2c82dc3",
  );
  assert.throws(
    () => normalizeJobUrl(new URL("https://linkedin.com/jobs/")),
    (error) =>
      error instanceof JobImportError && error.key === "linkedinJobRequired",
  );
} finally {
  globalThis.fetch = originalFetch;
  delete globalThis.__jobImportTest;
}
console.log(
  `Job import OK: ${checked} error/guard cases, localised warnings, truncation, unchanged data and canonical URLs. All network/auth I/O mocked.`,
);
