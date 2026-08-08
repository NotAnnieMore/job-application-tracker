export type ProfileField = "name" | "avatar";

export interface ProfileActionState {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<ProfileField, string>>;
}

export const initialProfileActionState: ProfileActionState = {
  status: "idle",
};
