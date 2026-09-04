import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createTranslator } from "next-intl";
import ts from "typescript";

// Exercise the actual validators, without a server, credentials or database.
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
  return `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
}
const uuid = await moduleUrl("../src/lib/validation.ts");
const dependencies = {
  "@/lib/validation": uuid,
  "@/features/applications/constants": await moduleUrl(
    "../src/features/applications/constants.ts",
  ),
};
const auth = await import(
  await moduleUrl("../src/features/auth/validation.ts")
);
const profile = await import(
  await moduleUrl("../src/features/profile/validation.ts")
);
const notes = await import(
  await moduleUrl("../src/features/notes/validation.ts", dependencies)
);
const applications = await import(
  await moduleUrl("../src/features/applications/validation.ts", dependencies)
);
const interviews = await import(
  await moduleUrl("../src/features/interviews/validation.ts", dependencies)
);
const id = "00000000-0000-4000-8000-000000000001";
function form(values) {
  const result = new FormData();
  for (const [key, value] of Object.entries(values)) result.set(key, value);
  return result;
}
const scenarios = [
  {
    namespace: "AuthValidation",
    validate: auth.validateRegistration,
    valid: {
      name: "  Nome original  ",
      email: "TEST@EXAMPLE.COM",
      password: " senha segura 123 ",
      confirmPassword: " senha segura 123 ",
    },
    cases: [
      ["email", "invalid", "invalidEmail"],
      ["email", "x".repeat(255), "invalidEmail"],
      ["name", "x", "nameLength"],
      ["name", "x".repeat(121), "nameLength"],
      ["confirmPassword", "different", "passwordMismatch"],
    ],
    boundaries: { name: "x".repeat(120) },
  },
  {
    namespace: "ProfileValidation",
    validate: profile.validateProfileForm,
    valid: { name: "  Nome original  ", removeAvatar: "true" },
    cases: [
      ["name", " ", "requiredName"],
      ["name", "x".repeat(121), "nameLength"],
      [
        "avatar",
        new File(["x"], "bad.gif", { type: "image/gif" }),
        "avatarType",
      ],
      [
        "avatar",
        new File([new Uint8Array(profile.avatarMaxSize + 1)], "large.png", {
          type: "image/png",
        }),
        "avatarSize",
      ],
    ],
    boundaries: {
      name: "x".repeat(120),
      avatar: new File([new Uint8Array(profile.avatarMaxSize)], "limit.png", {
        type: "image/png",
      }),
    },
  },
  {
    namespace: "ApplicationValidation",
    validate: applications.validateApplicationForm,
    valid: {
      companyId: id,
      title: "  Vaga original  ",
      currency: "eur",
      status: "applied",
      applicationDate: "2026-09-04",
      jobUrl: "example.com/job",
      skills: " SQL, SQL, React ",
      salaryMin: "1200,50",
      salaryMax: "2000",
      summaryNotes: " Notas originais ",
    },
    cases: [
      ["companyId", "invalid", "invalidCompany"],
      ["primaryRecruiterId", "invalid", "invalidRecruiter"],
      ["title", " ", "requiredTitle"],
      ["title", "x".repeat(201), "titleLength"],
      ["workMode", "invalid", "invalidWorkMode"],
      ["salaryMax", "100", "salaryRange"],
      ["currency", "EURO", "invalidCurrency"],
      ["skills", "x".repeat(81), "skillsLength"],
      [
        "skills",
        Array.from({ length: 31 }, (_, i) => `skill${i}`).join(","),
        "skillsLength",
      ],
      ["status", "invalid", "invalidStatus"],
      ["applicationDate", "2026-02-29", "invalidDate"],
      ["followUpDate", "2026-04-31", "invalidDate"],
      ["jobUrl", "https://[", "invalidUrl"],
      ["jobUrl", "x".repeat(1001), "urlLength"],
    ],
    boundaries: {
      title: "x".repeat(200),
      location: "x".repeat(160),
      employmentType: "x".repeat(120),
      source: "x".repeat(120),
      opportunitySummary: "x".repeat(5000),
      summaryNotes: "x".repeat(5000),
      nextActionSummary: "x".repeat(240),
      interviewPreparation: "x".repeat(10000),
      questionsForCompany: "x".repeat(10000),
      applicationDate: "2024-02-29",
    },
  },
  {
    namespace: "InterviewValidation",
    validate: interviews.validateInterviewForm,
    valid: {
      applicationId: id,
      interviewType: "  Entrevista original  ",
      scheduledAtLocal: "2026-09-04T14:30",
      timezoneOffset: "-60",
      status: "scheduled",
      format: "video",
      durationMinutes: "30",
      participants: " Ana, Bruno;Carla ",
      feedback: " Notas originais ",
    },
    cases: [
      ["applicationId", "invalid", "invalidApplication"],
      ["recruiterId", "invalid", "invalidRecruiter"],
      ["interviewType", " ", "requiredType"],
      ["interviewType", "x".repeat(121), "typeLength"],
      ["scheduledAtLocal", "2026-02-29T10:00", "invalidDate"],
      ["scheduledAtLocal", "2026-09-04T24:00", "invalidDate"],
      ["status", "invalid", "invalidStatus"],
      ["format", "invalid", "invalidFormat"],
      ["durationMinutes", "4", "invalidDuration"],
      ["durationMinutes", "481", "invalidDuration"],
      ["durationMinutes", "30.5", "invalidDuration"],
      ["locationOrUrl", "x".repeat(1001), "locationLength"],
      ["participants", "x".repeat(161), "participantsLength"],
      ["participants", Array(21).fill("Name").join(","), "participantsLength"],
      ["preparation", "x".repeat(10001), "preparationLength"],
      ["feedback", "x".repeat(10001), "feedbackLength"],
      ["result", "x".repeat(4001), "resultLength"],
    ],
    boundaries: {
      interviewType: "x".repeat(120),
      durationMinutes: "480",
      locationOrUrl: "x".repeat(1000),
      participants: Array(20).fill("x".repeat(160)).join(","),
      preparation: "x".repeat(10000),
      feedback: "x".repeat(10000),
      result: "x".repeat(4000),
    },
  },
];
let checked = 0;
const original = new Map();
for (const locale of ["pt-PT", "en-GB"]) {
  const messages = JSON.parse(
    await readFile(
      new URL(`../messages/${locale}.json`, import.meta.url),
      "utf8",
    ),
  );
  const translator = (namespace) =>
    createTranslator({
      locale,
      messages,
      namespace,
      onError(error) {
        throw error;
      },
    });
  for (const { namespace, validate, valid, cases, boundaries } of scenarios) {
    const t = translator(namespace);
    const good = validate(form(valid), t);
    assert.deepEqual(good.fieldErrors, {});
    if (original.has(namespace))
      assert.deepEqual(
        good,
        original.get(namespace),
        "Language must not change stored data",
      );
    else original.set(namespace, good);
    assert.deepEqual(
      validate(form({ ...valid, ...boundaries }), t).fieldErrors,
      {},
    );
    for (const [field, value, key] of cases) {
      const result = validate(form({ ...valid, [field]: value }), t);
      assert.deepEqual(
        result.fieldErrors,
        { [field]: t(key) },
        `${locale} ${namespace} ${field}`,
      );
      checked++;
    }
  }
  const av = translator("AuthValidation");
  assert.equal(
    auth.validateEmailPassword(form({ email: "a@example.com" }), av).fieldErrors
      .password,
    av("requiredPassword"),
  );
  assert.equal(
    auth.validateResetRequest(form({ email: "invalid" }), av).fieldErrors.email,
    av("invalidEmail"),
  );
  for (const length of [0, 11, 129]) {
    const password = "x".repeat(length);
    const values = form({ password, confirmPassword: password });
    assert.equal(
      auth.validatePasswordUpdate(values, av).fieldErrors.password,
      av("passwordLength"),
    );
    assert.equal(
      auth.validateRegistration(values, av).fieldErrors.password,
      av("passwordLength"),
    );
  }
  for (const length of [12, 128])
    assert.deepEqual(
      auth.validatePasswordUpdate(
        form({
          password: "x".repeat(length),
          confirmPassword: "x".repeat(length),
        }),
        av,
      ).fieldErrors,
      {},
    );
  const nv = translator("NoteValidation");
  assert.equal(
    notes.validateNoteForm(form({ content: " " }), nv).error,
    nv("requiredContent"),
  );
  assert.equal(
    notes.validateNoteForm(form({ content: "x".repeat(5001) }), nv).error,
    nv("contentLength"),
  );
  assert.equal(
    notes.validateNoteForm(form({ content: "x".repeat(5000) }), nv).error,
    undefined,
  );
  assert.equal(
    notes.validateNoteForm(form({ content: " Notas originais " }), nv).content,
    "Notas originais",
  );
  const app = scenarios[2];
  const appt = translator(app.namespace);
  for (const [field, maxLength] of [
    ["location", 160],
    ["employmentType", 120],
    ["source", 120],
    ["opportunitySummary", 5000],
    ["summaryNotes", 5000],
    ["nextActionSummary", 240],
    ["interviewPreparation", 10000],
    ["questionsForCompany", 10000],
  ]) {
    assert.equal(
      app.validate(
        form({ ...app.valid, [field]: "x".repeat(maxLength + 1) }),
        appt,
      ).fieldErrors[field],
      appt("textLength", { label: appt(field), maxLength }),
    );
    checked++;
  }
  for (const field of ["salaryMin", "salaryMax", "expectedSalary"]) {
    for (const value of ["-1", "invalid", "Infinity"]) {
      assert.equal(
        app.validate(form({ ...app.valid, [field]: value }), appt).fieldErrors[
          field
        ],
        appt("positiveNumber", { label: appt(field) }),
      );
      checked++;
    }
  }
  const interview = scenarios[3],
    it = translator(interview.namespace);
  for (const timezoneOffset of ["841", "invalid", "1.5"])
    assert.equal(
      interview.validate(form({ ...interview.valid, timezoneOffset }), it)
        .fieldErrors.scheduledAtLocal,
      it("invalidDate"),
    );
  for (const status of ["scheduled", "completed", "cancelled"])
    assert.equal(
      interview.validate(form({ ...interview.valid, status }), it).values
        .status,
      status,
    );
  for (const format of ["video", "phone", "onsite", "other"])
    assert.equal(
      interview.validate(form({ ...interview.valid, format }), it).values
        .format,
      format,
    );
}
assert.equal(original.get("AuthValidation").password, " senha segura 123 ");
assert.equal(original.get("AuthValidation").email, "test@example.com");
assert.equal(original.get("ProfileValidation").values.removeAvatar, true);
assert.equal(original.get("ApplicationValidation").values.p_salary_min, 1200.5);
assert.equal(
  original.get("ApplicationValidation").values.p_job_url,
  "https://example.com/job",
);
assert.deepEqual(original.get("ApplicationValidation").values.p_skills, [
  "SQL",
  "React",
]);
assert.equal(
  original.get("InterviewValidation").values.scheduled_at,
  "2026-09-04T13:30:00.000Z",
);
assert.deepEqual(original.get("InterviewValidation").values.participants, [
  "Ana",
  "Bruno",
  "Carla",
]);
for (const [type, bytes] of [
  ["image/png", [137, 80, 78, 71, 13, 10, 26, 10]],
  ["image/jpeg", [255, 216, 255]],
  ["image/webp", [82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80]],
]) {
  assert.equal(
    await profile.avatarMatchesMimeType(
      new File([Uint8Array.from(bytes)], "avatar", { type }),
    ),
    true,
  );
  assert.equal(
    await profile.avatarMatchesMimeType(
      new File(["invalid"], "avatar", { type }),
    ),
    false,
  );
}
console.log(
  `Remaining validation OK: ${checked} field-error cases, auth/note checks, accepted boundaries, image signatures and identical data in both languages.`,
);
