import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "red" | "gold" | "blue" | "orange" | "gray" | "purple";
  className?: string;
}

const variants = {
  green: "bg-emerald-100 text-emerald-700",
  red: "bg-red-100 text-red-700",
  gold: "bg-yellow-100 text-yellow-700",
  blue: "bg-blue-100 text-blue-700",
  orange: "bg-orange-100 text-orange-700",
  gray: "bg-gray-100 text-gray-600",
  purple: "bg-purple-100 text-purple-700",
};

export function Badge({ children, variant = "gray", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold", variants[variant], className)}>
      {children}
    </span>
  );
}

export function statusToBadgeVariant(status: string): BadgeProps["variant"] {
  switch (status) {
    case "ACTIVE": case "PAID": case "COMPLETED": case "VERIFIED":
    case "CONFIRMED": case "CHECKED_IN": case "RENEWED":
      return "green";
    case "OVERDUE": case "URGENT": case "OPEN": case "REJECTED":
    case "CANCELLED": case "NO_SHOW":
      return "red";
    case "PENDING": case "ASSIGNED": case "ONBOARDING":
      return "blue";
    case "PARTIAL": case "IN_PROGRESS": case "HIGH":
      return "orange";
    case "MEDIUM": case "RESERVED":
      return "gold";
    case "CHECKED_OUT": case "ROUTINE":
      return "purple";
    default:
      return "gray";
  }
}
