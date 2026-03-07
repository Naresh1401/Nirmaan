/**
 * API client for Nirmaan backend.
 *
 * Centralized HTTP client with auth token management,
 * error handling, and request/response interceptors.
 */

import axios, { AxiosInstance, AxiosError } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    // Request interceptor: attach auth token
    this.client.interceptors.request.use((config) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Response interceptor: handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired — redirect to login
          if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // ── Auth ──────────────────────────────────────────────
  async register(data: {
    full_name: string;
    phone: string;
    password: string;
    role?: string;
  }) {
    const res = await this.client.post("/auth/register", data);
    this.setTokens(res.data);
    return res.data;
  }

  async login(phone: string, password: string) {
    const res = await this.client.post("/auth/login", { phone, password });
    this.setTokens(res.data);
    return res.data;
  }

  async getMe() {
    const res = await this.client.get("/auth/me");
    return res.data;
  }

  // ── Products ──────────────────────────────────────────
  async getProducts(params?: {
    category?: string;
    city?: string;
    min_price?: number;
    max_price?: number;
    in_stock?: boolean;
    sort_by?: string;
    page?: number;
    page_size?: number;
  }) {
    const res = await this.client.get("/products", { params });
    return res.data;
  }

  async getProduct(id: string) {
    const res = await this.client.get(`/products/${id}`);
    return res.data;
  }

  async getCategories() {
    const res = await this.client.get("/products/categories");
    return res.data;
  }

  // ── Suppliers ─────────────────────────────────────────
  async getSuppliers(params?: {
    city?: string;
    verified?: boolean;
    page?: number;
  }) {
    const res = await this.client.get("/suppliers", { params });
    return res.data;
  }

  async getSupplier(id: string) {
    const res = await this.client.get(`/suppliers/${id}`);
    return res.data;
  }

  // ── Orders ────────────────────────────────────────────
  async createOrder(data: {
    items: { product_id: string; quantity: number }[];
    delivery_address: string;
    delivery_city: string;
    delivery_pincode: string;
    priority?: string;
    notes?: string;
  }) {
    const res = await this.client.post("/orders", data);
    return res.data;
  }

  async getOrders(params?: { status?: string; page?: number }) {
    const res = await this.client.get("/orders", { params });
    return res.data;
  }

  async getOrder(id: string) {
    const res = await this.client.get(`/orders/${id}`);
    return res.data;
  }

  async cancelOrder(id: string) {
    const res = await this.client.put(`/orders/${id}/cancel`);
    return res.data;
  }

  // ── Search ────────────────────────────────────────────
  async search(q: string, city?: string) {
    const res = await this.client.get("/search", { params: { q, city } });
    return res.data;
  }

  // ── Delivery Tracking ─────────────────────────────────
  async trackDelivery(deliveryId: string) {
    const res = await this.client.get(`/deliveries/${deliveryId}/tracking`);
    return res.data;
  }

  // ── Helpers ───────────────────────────────────────────
  private setTokens(data: { access_token: string; refresh_token: string }) {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
    }
  }

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
    }
  }

  // ── Premium ───────────────────────────────────────────
  async getPlans() {
    const res = await this.client.get("/premium/plans");
    return res.data;
  }

  async subscribe(tier: string, billingCycle: string) {
    const res = await this.client.post("/premium/subscribe", {
      tier,
      billing_cycle: billingCycle,
    });
    return res.data;
  }

  async getMembership() {
    const res = await this.client.get("/premium/membership");
    return res.data;
  }

  async renewMembership() {
    const res = await this.client.put("/premium/membership/renew");
    return res.data;
  }

  async cancelMembership() {
    const res = await this.client.delete("/premium/membership/cancel");
    return res.data;
  }

  async getBenefits() {
    const res = await this.client.get("/premium/benefits");
    return res.data;
  }

  // ── Loyalty ───────────────────────────────────────────
  async getLoyaltyBalance() {
    const res = await this.client.get("/premium/loyalty/balance");
    return res.data;
  }

  async getLoyaltyHistory(limit = 20) {
    const res = await this.client.get("/premium/loyalty/history", {
      params: { limit },
    });
    return res.data;
  }

  async redeemPoints(points: number, orderId?: string) {
    const res = await this.client.post("/premium/loyalty/redeem", {
      points,
      order_id: orderId,
    });
    return res.data;
  }

  // ── Referral ──────────────────────────────────────────
  async generateReferralCode() {
    const res = await this.client.post("/premium/referral/generate");
    return res.data;
  }

  async applyReferralCode(code: string) {
    const res = await this.client.post("/premium/referral/apply", { code });
    return res.data;
  }

  async getReferralStats() {
    const res = await this.client.get("/premium/referral/stats");
    return res.data;
  }

  // ── AI Consultant ─────────────────────────────────────
  async consultAI(query: string, context?: Record<string, unknown>) {
    const res = await this.client.post("/ai/consultant", { query, context });
    return res.data;
  }
}

export const api = new ApiClient();
