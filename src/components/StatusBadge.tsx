import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import type { ComplaintStatus } from "@/lib/api";

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  const map = {
    PENDING: {
      label: "Pending",
      icon: Clock,
      cls: "bg-warning/15 text-warning-foreground border border-warning/40",
    },
    IN_PROGRESS: {
      label: "In progress",
      icon: Loader2,
      cls: "bg-primary/10 text-primary border border-primary/30",
    },
    RESOLVED: {
      label: "Resolved",
      icon: CheckCircle2,
      cls: "bg-success/15 text-success border border-success/40",
    },
  } as const;
  const { label, icon: Icon, cls } = map[status];
  return (
    <Badge className={`gap-1.5 font-medium ${cls}`} variant="outline">
      <Icon className={`h-3.5 w-3.5 ${status === "IN_PROGRESS" ? "animate-spin" : ""}`} />
      {label}
    </Badge>
  );
}