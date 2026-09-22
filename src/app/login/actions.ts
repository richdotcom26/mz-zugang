"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionValue, SESSION_COOKIE } from "@/lib/auth/session";
import { fail, type ActionState } from "@/lib/domain/action-state";

export async function login(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const hash = process.env.PORTAL_PASSWORD_HASH;

  if (!hash) {
    console.error("[login] PORTAL_PASSWORD_HASH ist nicht gesetzt.");
    return fail("Portal ist noch nicht eingerichtet.");
  }
  if (!password || !verifyPassword(password, hash)) {
    return fail("Falsches Passwort.");
  }

  const { value, maxAge } = createSessionValue();
  const jar = await cookies();
  jar.set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    path: "/",
  });

  const next = String(formData.get("next") ?? "/");
  redirect(next.startsWith("/") ? next : "/");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/login");
}
