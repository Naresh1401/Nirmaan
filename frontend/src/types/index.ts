/**
 * TypeScript type definitions for the Nirmaan platform.
 */

// ── Users ─────────────────────────────────────────────────

export type UserRole = "customer" | "supplier" | "driver" | "admin";

export interface User {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  role: UserRole;
  is_verified: boolean;
  avatar_url?: string;
  city?: string;
  state?: string;
  created_at: string;
}

// ── Suppliers ─────────────────────────────────────────────

export type SubscriptionTier = "free" | "silver" | "gold" | "enterprise";

export interface Supplier {
  id: string;
  user_id: string;
  business_name: string;
  gst_number?: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  is_verified: boolean;
  rating: number;
  total_orders: number;
  subscription_tier: SubscriptionTier;
  delivery_radius_km: number;
  created_at: string;
}

// ── Products ──────────────────────────────────────────────

export type MaterialUnit =
  | "kg"
  | "bag"
  | "piece"
  | "cubic_ft"
  | "cubic_m"
  | "ton"
  | "load"
  | "sqft"
  | "liter"
  | "bundle"
  | "box";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_url?: string;
  parent_id?: string;
  sort_order: number;
}

export interface Product {
  id: string;
  supplier_id: string;
  category_id: string;
  name: string;
  description?: string;
  brand?: string;
  unit: MaterialUnit;
  price: number;
  mrp?: number;
  stock_quantity: number;
  min_order_quantity: number;
  max_order_quantity?: number;
  images: string[];
  specifications: Record<string, string>;
  is_active: boolean;
  created_at: string;
}

// ── Orders ────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "partially_shipped"
  | "in_transit"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "partially_paid"
  | "refunded"
  | "failed";

export type OrderPriority = "standard" | "express" | "urgent" | "scheduled";

export interface OrderItem {
  id: string;
  product_id: string;
  supplier_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  sub_order_number?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: OrderStatus;
  delivery_address: string;
  delivery_city: string;
  subtotal: number;
  delivery_fee: number;
  platform_fee: number;
  discount: number;
  total_amount: number;
  payment_status: PaymentStatus;
  payment_method?: string;
  priority: OrderPriority;
  scheduled_date?: string;
  notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

// ── Delivery ──────────────────────────────────────────────

export type VehicleType =
  | "auto"
  | "mini_truck"
  | "lcv"
  | "truck"
  | "tractor"
  | "tipper"
  | "flatbed";

export type DeliveryStatus =
  | "assigned"
  | "accepted"
  | "at_pickup"
  | "picked_up"
  | "in_transit"
  | "at_delivery"
  | "delivered"
  | "failed";

export interface DeliveryPartner {
  id: string;
  user_id: string;
  vehicle_type: VehicleType;
  vehicle_number: string;
  vehicle_capacity_kg: number;
  is_available: boolean;
  is_verified: boolean;
  rating: number;
  total_deliveries: number;
  completion_rate: number;
  city: string;
  created_at: string;
}

export interface DeliveryTracking {
  delivery_id: string;
  status: DeliveryStatus;
  driver_location: {
    lat: number | null;
    lng: number | null;
  };
  estimated_delivery_time?: string;
  pickup_locations: Array<{ lat: number; lng: number; address: string }>;
  delivery_location: { lat: number; lng: number; address: string };
}

// ── Paginated Response ────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

// ── Cart ──────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
  supplier: Supplier;
}
