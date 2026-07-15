export const BRAND = {
  name: "Veethrill Brands & Partners Realty",
  shortName: "Veethrill Realty",
  tagline: "Premium Property Management Platform",
  colors: {
    navy: "#0B1F3A",
    navyLight: "#132840",
    navyMid: "#1a3555",
    gold: "#D4AF37",
    goldLight: "#e8c84a",
    emerald: "#1E8E5A",
    emeraldLight: "#25b070",
  },
} as const;

export const NAV_ITEMS = [
  { group: "Overview", items: [
    { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { label: "Analytics", href: "/dashboard/analytics", icon: "BarChart2" },
  ]},
  { group: "Portfolio", items: [
    { label: "Properties", href: "/dashboard/properties", icon: "Building2", badge: "47" },
    { label: "Units", href: "/dashboard/units", icon: "Home" },
  ]},
  { group: "People", items: [
    { label: "Tenants", href: "/dashboard/tenants", icon: "Users", badge: "312" },
    { label: "Guests", href: "/dashboard/guests", icon: "UserCheck" },
    { label: "Owners", href: "/dashboard/owners", icon: "Briefcase" },
    { label: "Vendors", href: "/dashboard/vendors", icon: "Wrench" },
  ]},
  { group: "Operations", items: [
    { label: "Leases", href: "/dashboard/leases", icon: "FileText" },
    { label: "Shortlets", href: "/dashboard/shortlets", icon: "CalendarDays" },
    { label: "Rent & Payments", href: "/dashboard/payments", icon: "CreditCard", badge: "12" },
    { label: "Maintenance", href: "/dashboard/maintenance", icon: "Cog", badge: "8" },
    { label: "Inspections", href: "/dashboard/inspections", icon: "Search" },
  ]},
  { group: "Finance", items: [
    { label: "Accounting", href: "/dashboard/accounting", icon: "BookOpen" },
    { label: "Reports", href: "/dashboard/reports", icon: "TrendingUp" },
  ]},
  { group: "Tools", items: [
    { label: "Documents", href: "/dashboard/documents", icon: "FolderOpen" },
    { label: "Communications", href: "/dashboard/communications", icon: "MessageSquare", badge: "3" },
    { label: "AI Assistant", href: "/dashboard/ai", icon: "Sparkles" },
  ]},
] as const;

export const USER_ROLES = [
  "SUPER_ADMIN",
  "COMPANY_ADMIN",
  "PROPERTY_MANAGER",
  "OWNER",
  "TENANT",
  "GUEST",
  "VENDOR",
  "MAINTENANCE_STAFF",
] as const;

export type UserRole = typeof USER_ROLES[number];
