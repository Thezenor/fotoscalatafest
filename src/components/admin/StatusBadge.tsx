import { Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Photo } from "@/lib/mock-data";

export function StatusBadge({
  status,
  featured,
  labels,
}: {
  status: Photo["status"];
  featured?: boolean;
  labels: { pending: string; approved: string; rejected: string; featured: string };
}) {
  if (featured) {
    return (
      <Badge tone="brand">
        <Star className="h-3 w-3 fill-current" /> {labels.featured}
      </Badge>
    );
  }
  if (status === "approved") return <Badge tone="success">{labels.approved}</Badge>;
  if (status === "rejected") return <Badge tone="danger">{labels.rejected}</Badge>;
  return <Badge tone="brand">{labels.pending}</Badge>;
}
