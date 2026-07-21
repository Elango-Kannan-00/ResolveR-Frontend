import { createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileText,
  Home,
  Inbox,
  Laptop2,
  Loader2,
  LockKeyhole,
  MessageCircleMore,
  MessageSquarePlus,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Timer,
  Trash2,
  User,
  Users,
  Workflow,
  ChartNoAxesCombined,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { StatusBadge } from "@/components/StatusBadge";
import { api, type ComplaintResponseDto, type ComplaintStatus } from "@/lib/api";
import { useSession, type Session } from "@/lib/auth";

export const Route = createFileRoute("/student")({
  head: () => ({
    meta: [
      { title: "Student dashboard — Resolvr" },
      { name: "description", content: "Raise, track and give feedback on your campus complaints." },
    ],
  }),
  component: StudentDashboard,
});

type Section = "#home" | "#complaints" | "#profile";

function sectionFromHash(hash: string): Section {
  if (hash === "#complaints") return "#complaints";
  if (hash === "#profile") return "#profile";
  return "#home";
}

const STATUS_FILTERS: Array<{ value: "ALL" | ComplaintStatus; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "RESOLVED", label: "Resolved" },
];

function StudentDashboard() {
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const [activeSection, setActiveSection] = useState<Section>(() => sectionFromHash(location.hash));
  const [filter, setFilter] = useState<"ALL" | ComplaintStatus>("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const sessionReady = !!session && !!session.userId && !!session.userName && !!session.userEmail;

  const sidebarItems = [
    {
      label: "Home",
      description: "About ResolveR and how it works",
      href: "#home",
      icon: Home,
    },
    {
      label: "My complaints",
      description: "Create, edit, and track issues",
      href: "#complaints",
      icon: Inbox,
    },
    {
      label: "My profile",
      description: "Account details and session info",
      href: "#profile",
      icon: User,
    },
  ];

  useEffect(() => {
    if (session === null) {
      navigate({ to: "/" });
    }
  }, [navigate, session]);

  useEffect(() => {
    setActiveSection((current) => {
      const next = sectionFromHash(location.hash);
      return current === next ? current : next;
    });
  }, [location.hash]);

  const complaints = useQuery({
    queryKey: ["complaints", session?.userId],
    queryFn: () => api.getStudentComplaints(session!.userId),
    enabled: sessionReady,
  });

  const stats = {
    total: complaints.data?.length ?? 0,
    pending: complaints.data?.filter((c) => c.complaintStatus === "PENDING").length ?? 0,
    inProgress: complaints.data?.filter((c) => c.complaintStatus === "IN_PROGRESS").length ?? 0,
    resolved: complaints.data?.filter((c) => c.complaintStatus === "RESOLVED").length ?? 0,
  };

  const visible =
    filter === "ALL" ? complaints.data : complaints.data?.filter((c) => c.complaintStatus === filter);

  if (!session || !sessionReady) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSidebar
          session={session || { userId: 0, userName: "Loading...", userEmail: "", userRole: "STUDENT" }}
          title="Student hub"
          description="Preparing your workspace"
          items={[
            { label: "Home", description: "Loading...", href: "#home", icon: Home },
            { label: "My complaints", description: "Loading...", href: "#complaints", icon: Inbox },
            { label: "My profile", description: "Loading...", href: "#profile", icon: User },
          ]}
          activeHref={activeSection}
          onSelect={(href) => setActiveSection(href as Section)}
        />
        <main className="lg:pl-[232px]">
          <div className="page-grid mx-auto max-w-7xl px-6 py-8 lg:px-8">
            <Card className="surface-card rounded-[24px]">
              <CardContent className="py-16 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-sm text-muted-foreground">Loading your dashboard...</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        session={session}
        title="Student hub"
        description="Navigate your complaint workspace"
        items={sidebarItems}
        activeHref={activeSection}
        onSelect={(href) => setActiveSection(href as Section)}
      />

      <main className="lg:pl-[232px]">
        <div className="page-grid mx-auto max-w-7xl px-6 py-8 lg:px-8">
          {activeSection === "#home" ? (
            <HomeSection
              userName={session.userName}
              onRaiseComplaint={() => setCreateOpen(true)}
              onViewComplaints={() => setActiveSection("#complaints")}
            />
          ) : null}

          {activeSection === "#complaints" ? (
          <ComplaintSection
              complaints={complaints}
              filter={filter}
              setFilter={setFilter}
              visible={visible}
              stats={stats}
              createOpen={createOpen}
              setCreateOpen={setCreateOpen}
              onRefresh={() => qc.invalidateQueries({ queryKey: ["complaints", session.userId] })}
            />
          ) : null}

          {activeSection === "#profile" ? (
            <ProfileSection session={session} />
          ) : null}
        </div>
      </main>

      <CreateComplaintDialog
        studentId={session.userId}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onDone={() => {
          qc.invalidateQueries({ queryKey: ["complaints", session.userId] });
          setActiveSection("#complaints");
        }}
      />
    </div>
  );
}

function HomeSection({
  userName,
  onRaiseComplaint,
  onViewComplaints,
}: {
  userName: string;
  onRaiseComplaint: () => void;
  onViewComplaints: () => void;
}) {
  const displayName = (userName || "User").trim();
  const firstName = displayName.split(/\s+/).filter(Boolean)[0] || "User";

  const steps = [
    "Student Registration",
    "Raise a Complaint",
    "Department Review",
    "Complaint Resolution",
    "Student Feedback",
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="surface-card mx-auto max-w-6xl overflow-hidden rounded-[28px] p-6 sm:p-8 lg:p-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/85 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            ResolveR home
          </div>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-5xl font-bold leading-[1.03] tracking-tight md:text-6xl lg:text-[72px]">
              ResolveR - Smart Complaint Management for Modern Campuses
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              A centralized platform that empowers students to raise complaints, enables departments
              to resolve them efficiently, and provides administrators with complete visibility into
              the complaint resolution process.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Button
              className="rounded-full bg-[image:var(--gradient-hero)] text-white hover:opacity-95 hover:shadow-[var(--shadow-elegant)]"
              onClick={onRaiseComplaint}
            >
              Raise Complaint
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-border/70 bg-white/80"
              onClick={onViewComplaints}
            >
              My Complaints
            </Button>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-3">
            {[
              { icon: BadgeCheck, label: "Transparent", value: "Process" },
              { icon: Users, label: "All roles", value: "Connected" },
              { icon: ClipboardList, label: "Digital", value: "Records" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-[22px] border border-border/70 bg-white/80 p-4 text-left">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-sm font-semibold text-foreground">{label}</div>
                <div className="mt-1 text-sm text-muted-foreground">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#18316d_0%,#10224f_100%)] p-6 text-white sm:p-8 lg:p-10">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/12">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="font-display text-xl font-semibold tracking-tight">ResolveR</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/55">
                Smart campus complaints
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
            <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <div className="text-xs uppercase tracking-[0.25em] text-white/55">What is ResolveR?</div>
              <p className="mt-3 text-sm leading-7 text-white/80">
                ResolveR is a modern Complaint Management System designed to streamline the way
                educational institutions manage and resolve student grievances. It replaces paper,
                emails, and verbal follow-ups with a transparent digital platform.
              </p>
              <p className="mt-3 text-sm leading-7 text-white/80">
                Our goal is to improve communication, increase accountability, and ensure every
                concern is addressed promptly.
              </p>
            </div>

            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-white/55">How it works</div>
              <div className="mt-4 space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-3"
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="font-medium">{step}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-xs uppercase tracking-[0.3em] text-white/45">Welcome back, {firstName}</div>
        </div>
      </section>
    </div>
  );
}

function ComplaintSection({
  complaints,
  filter,
  setFilter,
  visible,
  sessionUserId,
  stats,
  createOpen,
  setCreateOpen,
  onRefresh,
}: {
  complaints: {
    data?: ComplaintResponseDto[];
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    isFetching: boolean;
  };
  filter: "ALL" | ComplaintStatus;
  setFilter: (value: "ALL" | ComplaintStatus) => void;
  visible: ComplaintResponseDto[] | undefined;
  stats: { total: number; pending: number; inProgress: number; resolved: number };
  createOpen: boolean;
  setCreateOpen: (open: boolean) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-8 animate-fade-in">
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">My complaints</h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Create a complaint, review updates, and give feedback after resolution.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onRefresh}
              className="group rounded-full border-border/70 bg-card/80 hover:border-primary/60 hover:text-primary"
            >
              <RefreshCw className={`mr-1 h-4 w-4 transition-transform group-hover:rotate-180 ${complaints.isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setCreateOpen(true)}
              className="group rounded-full bg-[image:var(--gradient-hero)] text-white hover:opacity-95 hover:shadow-[var(--shadow-elegant)]"
            >
              <Plus className="mr-1 h-4 w-4 transition-transform group-hover:rotate-90" />
              New complaint
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total" value={stats.total} icon={Inbox} accent="primary" />
          <StatCard label="Pending" value={stats.pending} icon={CalendarClock} accent="warning" />
          <StatCard label="In progress" value={stats.inProgress} icon={Loader2} accent="primary" spin />
          <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle2} accent="success" />
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                filter === f.value
                  ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                  : "border-border/60 bg-card/80 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        {complaints.isLoading ? (
          <div className="grid gap-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-2xl" />
            ))}
          </div>
        ) : complaints.isError ? (
          <ErrorState message={(complaints.error as Error).message} />
        ) : !visible?.length ? (
          <EmptyState
            onCreate={() => setCreateOpen(true)}
            title={filter === "ALL" ? "No complaints yet" : `No ${filter.toLowerCase()} complaints`}
          />
        ) : (
          <div className="grid gap-4">
            {visible.map((complaint, index) => (
              <ComplaintCard
                key={complaint.complaintId}
                complaint={complaint}
                index={index}
                onChanged={() => onRefresh()}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProfileSection({ session }: { session: Session }) {
  return (
    <section className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">My profile</h1>
        <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
          Everything the portal knows about your current session.
        </p>
      </div>

      <Card className="surface-card rounded-[24px]">
        <CardHeader>
          <CardTitle className="font-display text-2xl">{session.userName || "User"}</CardTitle>
          <CardDescription>{session.userEmail || "No email available"}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <ProfileItem label="Name" value={session.userName || "User"} />
          <ProfileItem label="Email" value={session.userEmail || "Not available"} />
          <ProfileItem label="Role" value={session.userRole || "STUDENT"} />
        </CardContent>
      </Card>
    </section>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  spin,
}: {
  label: string;
  value: number;
  icon: any;
  accent: "primary" | "warning" | "success";
  spin?: boolean;
}) {
  const tone = {
    primary: "text-primary bg-primary/10",
    warning: "text-warning bg-warning/15",
    success: "text-success bg-success/15",
  }[accent];

  return (
    <Card className="group border-border/60 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
          <div className="mt-1 text-3xl font-bold">{value}</div>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}>
          <Icon className={`h-5 w-5 ${spin ? "animate-spin" : ""}`} />
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ title, onCreate }: { title: string; onCreate: () => void }) {
  return (
    <Card className="border-dashed border-border/60 bg-card/40">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Inbox className="h-7 w-7" />
        </div>
        <div className="text-lg font-semibold">{title}</div>
        <p className="max-w-sm text-sm text-muted-foreground">
          When you raise a complaint, it will appear here with live status updates.
        </p>
        <Button onClick={onCreate} className="mt-2 rounded-full bg-[image:var(--gradient-hero)] text-white hover:opacity-95">
          <MessageSquarePlus className="mr-1 h-4 w-4" /> Raise a complaint
        </Button>
      </CardContent>
    </Card>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardContent className="py-10 text-center">
        <div className="font-semibold text-destructive">Couldn't load complaints</div>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

function ComplaintCard({
  complaint,
  index,
  onChanged,
}: {
  complaint: ComplaintResponseDto;
  index: number;
  onChanged: () => void;
}) {
  const editable =
    complaint.complaintStatus === "PENDING" &&
    Date.now() - new Date(complaint.createdAt).getTime() < 3600_000;
  const canFeedback = complaint.complaintStatus === "RESOLVED" && !complaint.feedback;

  const del = useMutation({
    mutationFn: () => api.deleteComplaint(complaint.complaintId),
    onSuccess: (message) => {
      toast.success(message || "Complaint deleted");
      onChanged();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Card
      className="group animate-fade-in border-border/60 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-elegant)]"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="min-w-0 flex-1">
          <CardTitle className="line-clamp-1 text-lg">{complaint.complaintTitle}</CardTitle>
          <CardDescription className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="font-medium text-foreground">{complaint.departmentName}</span>
            <span>•</span>
            <span>Raised {formatDate(complaint.createdAt)}</span>
          </CardDescription>
        </div>
        <StatusBadge status={complaint.complaintStatus} />
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{complaint.complaintDescription}</p>

        {complaint.feedback ? (
          <div className="rounded-xl border border-success/30 bg-success/5 p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-success">Your feedback</div>
            <p className="mt-1 text-sm">{complaint.feedback}</p>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {editable ? <EditComplaintDialog complaint={complaint} onDone={onChanged} /> : null}
          {editable ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="hover:border-destructive/60 hover:text-destructive">
                  <Trash2 className="mr-1 h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this complaint?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action can't be undone. The complaint will be removed permanently.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => del.mutate()}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
          {canFeedback ? <FeedbackDialog complaintId={complaint.complaintId} onDone={onChanged} /> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function CreateComplaintDialog({
  studentId,
  open,
  onOpenChange,
  onDone,
}: {
  studentId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [deptId, setDeptId] = useState("");

  const departments = useQuery({
    queryKey: ["complaint-departments", studentId],
    queryFn: () => api.getComplaintDepartments(studentId),
  });

  const create = useMutation({
    mutationFn: () =>
      api.createComplaint(studentId, {
        complaintTitle: title,
        complaintDescription: desc,
        complaintDepartmentId: Number(deptId),
      }),
    onSuccess: () => {
      toast.success("Complaint submitted", { description: "You can track its status here." });
      setTitle("");
      setDesc("");
      setDeptId("");
      onOpenChange(false);
      onDone();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Raise a complaint</DialogTitle>
          <DialogDescription>
            Route your concern to the right department. You can edit or delete within 1 hour.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!deptId) {
              toast.error("Please pick a department.");
              return;
            }
            create.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              maxLength={100}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Short summary of the issue"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              required
              maxLength={1000}
              rows={5}
              value={desc}
              onChange={(event) => setDesc(event.target.value)}
              placeholder="What happened? Include enough detail so the department can act."
            />
            <div className="text-right text-xs text-muted-foreground">{desc.length}/1000</div>
          </div>

          <div className="space-y-2">
            <Label>Department</Label>
            <Select value={deptId} onValueChange={setDeptId}>
              <SelectTrigger>
                <SelectValue placeholder={departments.isLoading ? "Loading..." : "Choose a department"} />
              </SelectTrigger>
              <SelectContent>
                {departments.data?.map((department) => (
                  <SelectItem key={department.complaintDepartmentId} value={String(department.complaintDepartmentId)}>
                    {department.complaintDepartmentName}{" "}
                    <span className="ml-1 text-xs text-muted-foreground">({department.departmentType})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={create.isPending}
              className="rounded-full bg-[image:var(--gradient-hero)] text-white hover:opacity-95"
            >
              {create.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="mr-1 h-4 w-4" /> Submit
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditComplaintDialog({
  complaint,
  onDone,
}: {
  complaint: ComplaintResponseDto;
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(complaint.complaintTitle);
  const [desc, setDesc] = useState(complaint.complaintDescription);

  const update = useMutation({
    mutationFn: () =>
      api.updateComplaint(complaint.complaintId, {
        complaintTitle: title,
        complaintDescription: desc,
      }),
    onSuccess: () => {
      toast.success("Complaint updated");
      setOpen(false);
      onDone();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="mr-1 h-4 w-4" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit complaint</DialogTitle>
          <DialogDescription>Only allowed within 1 hour and while pending.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            update.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="etitle">Title</Label>
            <Input id="etitle" required maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edesc">Description</Label>
            <Textarea
              id="edesc"
              required
              maxLength={1000}
              rows={5}
              value={desc}
              onChange={(event) => setDesc(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={update.isPending}
              className="rounded-full bg-[image:var(--gradient-hero)] text-white hover:opacity-95"
            >
              {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FeedbackDialog({
  complaintId,
  onDone,
}: {
  complaintId: number;
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  const submit = useMutation({
    mutationFn: () => api.submitFeedback(complaintId, feedback),
    onSuccess: (message) => {
      toast.success(message || "Feedback submitted", { description: "Thanks for helping us improve." });
      setOpen(false);
      setFeedback("");
      onDone();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquarePlus className="mr-1 h-4 w-4" /> Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share feedback</DialogTitle>
          <DialogDescription>Tell us how the resolution went.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback</Label>
            <Textarea
              id="feedback"
              required
              rows={5}
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              placeholder="Share your experience"
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={submit.isPending}
              className="rounded-full bg-[image:var(--gradient-hero)] text-white hover:opacity-95"
            >
              {submit.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="mr-1 h-4 w-4" /> Submit
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
