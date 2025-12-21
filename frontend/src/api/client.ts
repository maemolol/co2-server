import type {
    RegisterDTO,
    LoginDTO,
    User,
    Device,
    DeviceRegisterDTO,
    Measurement,
    ApiResponse,
} from "../types/api";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const res = await fetch(`/api${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  return data as ApiResponse<T>;
}

// === Auth ===

export async function apiRegister(body: RegisterDTO) {
  return request<User>("/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiLogin(body: LoginDTO) {
  return request<User>("/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// === Devices ===

export async function apiGetUserDevices(userId: string) {
  return request<Device[]>(`/devices/user/${userId}`);
}

export async function apiGetDevice(deviceId: string) {
  return request<Device>(`/devices/id/${deviceId}`);
}

export async function apiRegisterDevice(body: DeviceRegisterDTO) {
  return request<Device>("/devices/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiDeleteDevice(deviceMac: string) {
  return request<void>(`/devices/id/${deviceMac}/delete`);
}


// === Measurements ===

export async function apiGetDeviceMeasurements(
  deviceId: string,
  limit = 200
) {
  return request<Measurement[]>(`/measurements/${deviceId}?limit=${limit}`);
}

export async function apiGetLatestMeasurement(deviceId: string) {
  return request<Measurement>(`/measurements/${deviceId}/latest`);
}
