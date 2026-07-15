import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "NGN"): string {
  if (currency === "NGN") {
    return `₦${amount.toLocaleString("en-NG")}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function getOccupancyColor(rate: number): string {
  if (rate >= 90) return "text-emerald-600";
  if (rate >= 75) return "text-yellow-600";
  return "text-red-500";
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "URGENT": return "bg-red-100 text-red-700";
    case "HIGH": return "bg-orange-100 text-orange-700";
    case "MEDIUM": return "bg-yellow-100 text-yellow-700";
    case "LOW": return "bg-blue-100 text-blue-700";
    case "ROUTINE": return "bg-gray-100 text-gray-600";
    default: return "bg-gray-100 text-gray-600";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "ACTIVE":
    case "PAID":
    case "COMPLETED":
    case "VERIFIED":
    case "CONFIRMED":
    case "CHECKED_IN":
      return "bg-emerald-100 text-emerald-700";
    case "PENDING":
    case "ASSIGNED":
    case "ONBOARDING":
      return "bg-blue-100 text-blue-700";
    case "OVERDUE":
    case "URGENT":
    case "OPEN":
    case "REJECTED":
    case "CANCELLED":
      return "bg-red-100 text-red-700";
    case "PARTIAL":
    case "IN_PROGRESS":
    case "REVIEW":
      return "bg-orange-100 text-orange-700";
    case "EXPIRED":
    case "TERMINATED":
    case "VACANT":
      return "bg-gray-100 text-gray-600";
    case "RENEWED":
    case "CHECKED_OUT":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

export function nightsCount(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  return Math.ceil((b.getTime() - a.getTime()) / 86400000);
}
