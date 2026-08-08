export type NoteField = "content";

export type NoteActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<NoteField, string>>;
};

export type ApplicationNote = {
  id: string;
  applicationId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export const initialNoteActionState: NoteActionState = {
  status: "idle",
};
