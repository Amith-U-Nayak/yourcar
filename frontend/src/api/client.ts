import axios from "axios";
import { AuthResponseData, Vehicle, ApiResponse } from "../types";

export const API_BASE_URL = "/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically inject JWT token from localStorage if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("yourcar_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: automatically log out if 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear expired credentials
      localStorage.removeItem("yourcar_token");
      localStorage.removeItem("yourcar_user");
    }
    return Promise.reject(error);
  }
);

// ── Auth APIs ─────────────────────────────────────────────────────────────

export async function loginApi(
  email: string,
  password: string
): Promise<AuthResponseData> {
  const res = await apiClient.post<ApiResponse<AuthResponseData>>("/auth/login", {
    email,
    password,
  });
  return res.data.data!;
}

export async function registerApi(
  email: string,
  password: string,
  role: "USER" | "ADMIN" = "USER"
): Promise<AuthResponseData> {
  const res = await apiClient.post<ApiResponse<AuthResponseData>>(
    "/auth/register",
    {
      email,
      password,
      role,
    }
  );
  return res.data.data!;
}

// ── Vehicle APIs ──────────────────────────────────────────────────────────

export async function getVehiclesApi(): Promise<Vehicle[]> {
  const res = await apiClient.get<ApiResponse<{ vehicles: Vehicle[] }>>(
    "/vehicles"
  );
  return res.data.data!.vehicles;
}

export async function searchVehiclesApi(
  params: Record<string, unknown>
): Promise<Vehicle[]> {
  const res = await apiClient.get<ApiResponse<{ vehicles: Vehicle[] }>>(
    "/vehicles/search",
    { params }
  );
  return res.data.data!.vehicles;
}

export async function getVehicleByIdApi(id: string): Promise<Vehicle> {
  const res = await apiClient.get<ApiResponse<{ vehicle: Vehicle }>>(
    `/vehicles/${id}`
  );
  return res.data.data!.vehicle;
}

export async function createVehicleApi(
  data: Partial<Vehicle>
): Promise<Vehicle> {
  const res = await apiClient.post<ApiResponse<{ vehicle: Vehicle }>>(
    "/vehicles",
    data
  );
  return res.data.data!.vehicle;
}

export async function updateVehicleApi(
  id: string,
  data: Partial<Vehicle>
): Promise<Vehicle> {
  const res = await apiClient.put<ApiResponse<{ vehicle: Vehicle }>>(
    `/vehicles/${id}`,
    data
  );
  return res.data.data!.vehicle;
}

export async function deleteVehicleApi(id: string): Promise<void> {
  await apiClient.delete(`/vehicles/${id}`);
}

export async function purchaseVehicleApi(id: string): Promise<Vehicle> {
  const res = await apiClient.post<ApiResponse<{ vehicle: Vehicle }>>(
    `/vehicles/${id}/purchase`
  );
  return res.data.data!.vehicle;
}

export async function restockVehicleApi(
  id: string,
  quantity?: number
): Promise<Vehicle> {
  const res = await apiClient.post<ApiResponse<{ vehicle: Vehicle }>>(
    `/vehicles/${id}/restock`,
    { quantity }
  );
  return res.data.data!.vehicle;
}
