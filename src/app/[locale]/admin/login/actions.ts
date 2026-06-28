"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { logAudit } from "@/server/services/audit.service";

export type LoginState = { error?: "invalid" | "error" };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/admin");

  try {
    await signIn("credentials", {
      email,
      password: String(formData.get("password") ?? ""),
      redirectTo: callbackUrl,
    });
    return {};
  } catch (err) {
    // En caso de éxito, signIn lanza un redirect (NO es AuthError):
    // se re-lanza para que Next complete la redirección.
    if (err instanceof AuthError) {
      await logAudit({
        action: "LOGIN_FAILED",
        entityType: "User",
        metadata: { email },
      });
      return { error: err.type === "CredentialsSignin" ? "invalid" : "error" };
    }
    throw err;
  }
}
