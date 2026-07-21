import { useEffect, useState } from "react";
import type { UserRole } from "./api";

export interface Session {
  userId: number;
  userName: string;
  userEmail: string;
  userRole: UserRole;
}

declare global {
  interface Window {
    __resolverAuthSession?: Session | null;
  }
}

const EVENT_NAME = "cms:auth";

export function normalizeRole(role: unknown): UserRole {
  const value = typeof role === "string" ? role.trim().toUpperCase() : "";
  return value === "STUDENT" || value === "HOD" || value === "PRINCIPAL" || value === "EXECUTIVE_CHAIRMAN"
    ? value
    : "STUDENT";
}

function unwrapUserPayload(user: unknown): Record<string, unknown> {
  if (!user || typeof user !== "object") return {};
  const record = user as Record<string, unknown>;
  const nested =
    record.data ??
    record.result ??
    record.response ??
    record.user ??
    record.payload ??
    record.body;

  if (nested && typeof nested === "object") {
    return nested as Record<string, unknown>;
  }

  return record;
}

function pickValue(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      return source[key];
    }
  }
  return undefined;
}

export function normalizeSession(user: unknown): Session {
  const payload = unwrapUserPayload(user);
  const rawUserId = pickValue(payload, ["userId", "id", "user_id", "userid"]);
  const rawUserName = pickValue(payload, ["userName", "name", "user_name", "username"]);
  const rawUserEmail = pickValue(payload, ["userEmail", "email", "user_email", "useremail"]);
  const rawUserRole = pickValue(payload, ["userRole", "role", "user_role", "userrole"]);

  const userId = typeof rawUserId === "number" ? rawUserId : Number(rawUserId) || 0;
  const userName = typeof rawUserName === "string" ? rawUserName.trim() : "";
  const userEmail = typeof rawUserEmail === "string" ? rawUserEmail.trim() : "";

  return {
    userId,
    userName,
    userEmail,
    userRole: normalizeRole(rawUserRole),
  };
}

export function isCompleteSession(session: Session | null | undefined): session is Session {
  return !!session && session.userId > 0;
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  return window.__resolverAuthSession ?? null;
}

export function setSession(session: Session) {
  window.__resolverAuthSession = session;
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function clearSession() {
  window.__resolverAuthSession = null;
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function useSession() {
  const [session, setState] = useState<Session | null>(() => getSession());
  useEffect(() => {
    const handler = () => setState(getSession());
    window.addEventListener(EVENT_NAME, handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
    };
  }, []);
  return session;
}
