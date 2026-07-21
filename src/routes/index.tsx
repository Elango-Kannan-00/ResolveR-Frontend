import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { normalizeSession, setSession } from "@/lib/auth";
import { AuthLayout } from "@/components/AuthLayout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ResolveR — Sign in" },
      {
        name: "description",
        content: "Sign in to ResolveR, the smart complaint management platform for campuses.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = useMutation({
    mutationFn: () => api.login({ userEmail: email, userPassword: password }),
    onSuccess: async (user) => {
      const session = normalizeSession(user);
      const resolvedSession = {
        ...session,
        userName: session.userName || "User",
        userEmail: session.userEmail || email.trim(),
      };

      if (!resolvedSession.userId && resolvedSession.userEmail) {
        const profileSession = normalizeSession(await api.getUserProfileByEmail(resolvedSession.userEmail));
        if (profileSession.userId) {
          setSession({
            ...profileSession,
            userName: profileSession.userName || resolvedSession.userName,
            userEmail: profileSession.userEmail || resolvedSession.userEmail,
          });
          toast.success("Welcome back", {
            description: `Signed in as ${formatRoleLabel(profileSession.userRole)}`,
          });
          navigate({ to: routeForRole(profileSession.userRole) });
          return;
        }
      }

      if (!resolvedSession.userId) {
        toast.error("Login succeeded, but the backend did not return a user id.");
        return;
      }

      setSession(resolvedSession);
      toast.success("Welcome back", {
        description: `Signed in as ${formatRoleLabel(resolvedSession.userRole)}`,
      });
      navigate({ to: routeForRole(resolvedSession.userRole) });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AuthLayout
      badge="Campus access"
      panelTitle="Welcome back to ResolveR."
      panelDescription="Sign in to review complaints, check progress, and continue where you left off."
      panelBullets={[
        "Keep your complaint history in one place",
        "Switch between student and HOD workflows quickly",
        "Use a focused interface built for campus resolution",
      ]}
      formTitle="Login"
      formDescription="Use your campus email and password to access ResolveR."
      formFooter={
        <>
          New here?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          login.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@campus.edu"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 rounded-2xl pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 rounded-2xl pl-9"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <a
            href="mailto:support@resolver.edu?subject=ResolveR%20password%20help"
            className="text-sm font-medium text-primary hover:underline"
          >
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          disabled={login.isPending}
          className="group mt-2 h-11 w-full rounded-2xl bg-[image:var(--gradient-hero)] text-white hover:opacity-95 hover:shadow-[var(--shadow-elegant)]"
        >
          {login.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Login
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}

function formatRoleLabel(role: string) {
  return role
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function routeForRole(role: string) {
  if (role === "STUDENT") return "/student";
  if (role === "HOD") return "/hod";
  return "/student";
}
