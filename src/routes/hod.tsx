import { createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  type LucideIcon,
  Home,
  Inbox,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { StatusBadge } from "@/components/StatusBadge";
import { api, type ComplaintStatus, type HodComplaintResponseDto } from "@/lib/api";
import { useSession, type Session } from "@/lib/auth";

export const Route = createFileRoute("/hod")({
  head: () => ({
    meta: [
      { title: "HOD dashboard — Resolvr" },
      {
        name: "description",
        content: "Review and update the status of complaints assigned to your department.",
      },
    ],
  }),
  component: HodDashboard,
});

const FILTERS: Array<{ value: "ALL" | ComplaintStatus; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "RESOLVED", label: "Resolved" },
];

type Section = "#home" | "#complaints" | "#profile";

function sectionFromHash(hash: string): Section {
  if (hash === "#complaints") return "#complaints";
  if (hash === "#profile") return "#profile";
  return "#home";
}

function HodDashboard() {
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const [activeSection, setActiveSection] = useState<Section>(() => sectionFromHash(location.hash));
  const [filter, setFilter] = useState<"ALL" | ComplaintStatus>("ALL");
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
      description: "Review and update assigned complaints",
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
    queryKey: ["hod-complaints", session?.userId],
    queryFn: () => api.getHodComplaints(session!.userId),
    enabled: sessionReady,
  });

  if (!session || !sessionReady) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSidebar
          session={session || { userId: 0, userName: "Loading...", userEmail: "", userRole: "HOD" }}
          title="Department hub"
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

  const list = complaints.data ?? [];
  const stats = {
    total: list.length,
    pending: list.filter((c) => c.complaintStatus === "PENDING").length,
    inProgress: list.filter((c) => c.complaintStatus === "IN_PROGRESS").length,
    resolved: list.filter((c) => c.complaintStatus === "RESOLVED").length,
  };
  const visible = filter === "ALL" ? list : list.filter((c) => c.complaintStatus === filter);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        session={session}
        title="Department hub"
        description="Navigate your assigned queue"
        items={sidebarItems}
        activeHref={activeSection}
        onSelect={(href) => setActiveSection(href as Section)}
      />

      <main className="lg:pl-[232px]">
        <div className="page-grid mx-auto max-w-7xl px-6 py-8 lg:px-8">
          {activeSection === "#home" ? (
            <HomeSection
              userName={session.userName}
              onViewComplaints={() => setActiveSection("#complaints")}
              onViewProfile={() => setActiveSection("#profile")}
            />
          ) : null}

          {activeSection === "#complaints" ? (
            <ComplaintSection
              complaints={complaints}
              filter={filter}
              setFilter={setFilter}
              visible={visible}
              stats={stats}
              onRefresh={() =>
                qc.invalidateQueries({ queryKey: ["hod-complaints", session.userId] })
              }
            />
          ) : null}

          {activeSection === "#profile" ? <ProfileSection session={session} /> : null}
        </div>
      </main>
    </div>
  );
}

function HomeSection({
  userName,
  onViewComplaints,
  onViewProfile,
}: {
  userName: string;
  onViewComplaints: () => void;
  onViewProfile: () => void;
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
              onClick={onViewComplaints}
            >
              Review Complaints
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-border/70 bg-white/80"
              onClick={onViewProfile}
            >
              My Profile
            </Button>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-3">
            {[
              { icon: BadgeCheck, label: "Transparent", value: "Process" },
              { icon: Users, label: "All roles", value: "Connected" },
              { icon: ClipboardList, label: "Digital", value: "Records" },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-[22px] border border-border/70 bg-white/80 p-4 text-left"
              >
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
              <div className="text-xs uppercase tracking-[0.25em] text-white/55">
                What is ResolveR?
              </div>
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

          <div className="text-xs uppercase tracking-[0.3em] text-white/45">
            Welcome back, {firstName}
          </div>
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
  stats,
  onRefresh,
}: {
  complaints: {
    data?: HodComplaintResponseDto[];
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    isFetching: boolean;
  };
  filter: "ALL" | ComplaintStatus;
  setFilter: (value: "ALL" | ComplaintStatus) => void;
  visible: HodComplaintResponseDto[] | undefined;
  stats: { total: number; pending: number; inProgress: number; resolved: number };
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-8 animate-fade-in">
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              My complaints
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Review complaints assigned to your department and move them forward.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={onRefresh}
            className="group rounded-full border-border/70 bg-card/80 hover:border-primary/60 hover:text-primary"
          >
            <RefreshCw
              className={`mr-1 h-4 w-4 transition-transform group-hover:rotate-180 ${
                complaints.isFetching ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MiniStat
            label="Total"
            value={stats.total}
            icon={Inbox}
            tone="text-primary bg-primary/10"
          />
          <MiniStat
            label="Pending"
            value={stats.pending}
            icon={CalendarClock}
            tone="text-warning bg-warning/15"
          />
          <MiniStat
            label="In progress"
            value={stats.inProgress}
            icon={Loader2}
            tone="text-primary bg-primary/10"
            spin
          />
          <MiniStat
            label="Resolved"
            value={stats.resolved}
            icon={CheckCircle2}
            tone="text-success bg-success/15"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
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
            title={filter === "ALL" ? "No complaints yet" : `No ${filter.toLowerCase()} complaints`}
          />
        ) : (
          <div className="grid gap-4">
            {visible.map((complaint, index) => (
              <HodCard
                key={complaint.complaintId}
                complaint={complaint}
                index={index}
                onChanged={onRefresh}
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
          <ProfileItem label="Role" value={session.userRole || "HOD"} />
        </CardContent>
      </Card>
    </section>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <Card className="border-dashed border-border/60 bg-card/40">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Inbox className="h-7 w-7" />
        </div>
        <div className="text-lg font-semibold">{title}</div>
        <p className="max-w-sm text-sm text-muted-foreground">
          Complaints routed to your department will appear here.
        </p>
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

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon: Icon,
  tone,
  spin,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: string;
  spin?: boolean;
}) {
  return (
    <Card className="border-border/60 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]">
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

function HodCard({
  complaint,
  index,
  onChanged,
}: {
  complaint: HodComplaintResponseDto;
  index: number;
  onChanged: () => void;
}) {
  const nextStatus: ComplaintStatus | null =
    complaint.complaintStatus === "PENDING"
      ? "IN_PROGRESS"
      : complaint.complaintStatus === "IN_PROGRESS"
        ? "RESOLVED"
        : null;

  const update = useMutation({
    mutationFn: (status: ComplaintStatus) =>
      api.updateComplaintStatus(complaint.complaintId, status),
    onSuccess: (m) => {
      toast.success(m || "Status updated");
      onChanged();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const nextLabel =
    nextStatus === "IN_PROGRESS"
      ? "Start working"
      : nextStatus === "RESOLVED"
        ? "Mark resolved"
        : null;

  return (
    <Card
      className="group border-border/60 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-elegant)] animate-fade-in"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="min-w-0 flex-1">
          <CardTitle className="line-clamp-1 text-lg">{complaint.complaintTitle}</CardTitle>
          <CardDescription className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <User className="h-3.5 w-3.5" /> {complaint.studentName}
            </span>
            <span>•</span>
            <span>{complaint.departmentName}</span>
            <span>•</span>
            <span>{new Date(complaint.createdAt).toLocaleString()}</span>
          </CardDescription>
        </div>
        <StatusBadge status={complaint.complaintStatus} />
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {complaint.complaintDescription}
        </p>

        {nextStatus && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                className="bg-[image:var(--gradient-hero)] text-white hover:opacity-95"
                disabled={update.isPending}
              >
                {update.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {nextLabel}
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Update complaint status?</AlertDialogTitle>
                <AlertDialogDescription>
                  You're about to move this complaint to{" "}
                  <strong>{nextStatus.replace("_", " ").toLowerCase()}</strong>. The student will
                  see the change immediately.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => update.mutate(nextStatus)}>
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  );
}
