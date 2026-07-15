export type PropertyType =
  | "RESIDENTIAL"
  | "COMMERCIAL"
  | "MIXED_USE"
  | "SHORTLET"
  | "LUXURY_RESIDENTIAL";

export type PropertyStatus = "ACTIVE" | "INACTIVE" | "UNDER_RENOVATION" | "SOLD";

export type UnitStatus = "OCCUPIED" | "VACANT" | "RESERVED" | "MAINTENANCE" | "SHORTLET";

export type LeaseStatus = "ACTIVE" | "EXPIRED" | "PENDING" | "TERMINATED" | "RENEWED";

export type PaymentStatus = "PAID" | "PENDING" | "OVERDUE" | "PARTIAL" | "REFUNDED";

export type WorkOrderPriority = "URGENT" | "HIGH" | "MEDIUM" | "LOW" | "ROUTINE";

export type WorkOrderStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type BookingStatus =
  | "CONFIRMED"
  | "PENDING"
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "CANCELLED"
  | "NO_SHOW";

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  address: string;
  city: string;
  state: string;
  country: string;
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: number;
  monthlyRevenue: number;
  status: PropertyStatus;
  thumbnail?: string;
  healthScore: number;
  createdAt: string;
}

export interface Unit {
  id: string;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  floor: number;
  bedrooms: number;
  bathrooms: number;
  sqMeters: number;
  monthlyRent: number;
  nightlyRate?: number;
  depositAmount: number;
  status: UnitStatus;
  amenities: string[];
}

export interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  unitId: string;
  unitNumber: string;
  propertyName: string;
  leaseEnd: string;
  monthlyRent: number;
  paymentStatus: PaymentStatus;
  kycStatus: "VERIFIED" | "PENDING" | "REJECTED";
  createdAt: string;
}

export interface Lease {
  id: string;
  tenantId: string;
  tenantName: string;
  unitId: string;
  unitNumber: string;
  propertyName: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  depositAmount: number;
  status: LeaseStatus;
  autoRenew: boolean;
  documentUrl?: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  tenantName: string;
  leaseId: string;
  unitNumber: string;
  propertyName: string;
  amount: number;
  type: "RENT" | "DEPOSIT" | "MAINTENANCE" | "PENALTY" | "REFUND";
  method: "PAYSTACK" | "FLUTTERWAVE" | "STRIPE" | "BANK_TRANSFER" | "CASH";
  status: PaymentStatus;
  reference: string;
  paidAt?: string;
  dueDate: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  propertyId: string;
  propertyName: string;
  unitId?: string;
  unitNumber?: string;
  category: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  assignedVendorName?: string;
  estimatedCost?: number;
  actualCost?: number;
  slaHours: number;
  raisedAt: string;
  completedAt?: string;
  photos: string[];
}

export interface ShortletBooking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  unitId: string;
  unitNumber: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  nightlyRate: number;
  totalAmount: number;
  source: "DIRECT" | "AIRBNB" | "BOOKING_COM" | "EXPEDIA" | "OTHER";
  status: BookingStatus;
  guestCount: number;
  specialRequests?: string;
}

export interface KPIData {
  monthlyRevenue: number;
  revenueChange: number;
  occupancyRate: number;
  occupancyChange: number;
  openWorkOrders: number;
  overdueRent: number;
  totalProperties: number;
  totalUnits: number;
  collectionRate: number;
  renewalRate: number;
  activeShortlets: number;
  shortletRevenue: number;
}
