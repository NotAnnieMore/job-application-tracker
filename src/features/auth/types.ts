export type AuthField = "name" | "email" | "password" | "confirmPassword";

export interface AuthActionState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<AuthField, string>>;
}

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
}

export const initialAuthActionState: AuthActionState = {
  status: "idle",
};
