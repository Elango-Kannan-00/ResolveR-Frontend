import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, Loader2, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { normalizeSession, setSession } from "@/lib/auth";
import { AuthLayout } from "@/components/AuthLayout";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — ResolveR" },
      {
        name: "description",
        content: "Register as a student and start raising campus complaints on ResolveR.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [deptId, setDeptId] = useState("");

  const departments = useQuery({
    queryKey: ["academic-departments"],
    queryFn: api.getAcademicDepartments,
  });

  const register = useMutation({
    mutationFn: () =>
      api.register({
        userName: name,
        userEmail: email,
        userPassword: password,
        academicDepartmentId: Number(deptId),
      }),
    onSuccess: async (user) => {
      const session = normalizeSession(user);
      const resolvedSession = {
        ...session,
        userName: session.userName || name.trim() || "User",
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
          toast.success("Account created", {
            description: "You are signed in and ready to raise complaints.",
          });
          navigate({ to: "/student" });
          return;
        }
      }

      if (!resolvedSession.userId) {
        toast.error("Signup succeeded, but the backend did not return a user id.");
        return;
      }

      setSession(resolvedSession);
      toast.success("Account created", {
        description: "You are signed in and ready to raise complaints.",
      });
      navigate({ to: "/student" });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AuthLayout
      badge="Student onboarding"
      panelTitle="Join ResolveR in minutes."
      panelDescription="Create your account, choose your academic department, and start raising issues with a focused workflow."
      panelBullets={[
        "Track complaint history from your dashboard",
        "Submit feedback after each resolved case",
        "Use a clean student-focused experience",
      ]}
      formTitle="Create account"
      formDescription="Fill in your details to get started."
      formFooter={
        <>
          Already registered?{" "}
          <Link to="/" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
      panelImageClassName="bg-[linear-gradient(180deg,#243d84_0%,#13264f_55%,#090f1f_100%)]"
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!deptId) {
            toast.error("Please select your academic department.");
            return;
          }
          register.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Johnson"
              className="h-11 rounded-2xl pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@campus.edu"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="h-11 rounded-2xl pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Academic department</Label>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Select value={deptId} onValueChange={setDeptId}>
              <SelectTrigger className="h-11 rounded-2xl pl-9">
                <SelectValue
                  placeholder={departments.isLoading ? "Loading departments..." : "Select your department"}
                />
              </SelectTrigger>
              <SelectContent>
                {departments.data?.map((department) => (
                  <SelectItem
                    key={department.academicDepartmentId}
                    value={String(department.academicDepartmentId)}
                  >
                    {department.academicDepartmentName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {departments.isError ? (
            <p className="text-xs text-destructive">
              Couldn't load departments. Please check the API server.
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={register.isPending}
          className="group mt-2 h-11 w-full rounded-2xl bg-[image:var(--gradient-hero)] text-white hover:opacity-95 hover:shadow-[var(--shadow-elegant)]"
        >
          {register.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Create account
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
