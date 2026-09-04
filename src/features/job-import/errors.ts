import type messages from "../../../messages/en-GB.json";

// Keep known import errors language-independent until the response boundary.
export class JobImportError extends Error {
  constructor(public readonly key: keyof typeof messages.JobImportMessages) {
    super(key);
    this.name = "JobImportError";
  }
}
