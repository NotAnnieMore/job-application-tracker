import type { AuthActionState } from "@/features/auth/types";
import { cn } from "@/lib/utils";

export function AuthFormMessage({ state }: { state: AuthActionState }) {
  if (!state.message || state.status === "idle") return null;

  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      aria-live="polite"
      className={cn(
        "rounded-xl border px-4 py-3 text-sm leading-6",
        state.status === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700",
      )}
    >
      {state.message}
    </p>
  );
}
