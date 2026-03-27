// Copilot-generated API client helper
// Verbindet das Frontend mit den Gateway-API-Endpunkten.

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Request failed ${response.status} ${response.statusText}: ${body}`,
    );
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json();
}

export async function fetchMeets() {
  return request<any[]>("/meets");
}

export async function fetchMeet(id: string) {
  return request<any>(`/meets/${id}`);
}

export async function createMeet(meet: Record<string, unknown>) {
  return request<any>("/meets", {
    method: "POST",
    body: JSON.stringify(meet),
  });
}

export async function fetchVenues() {
  return request<any[]>("/venues");
}

export async function fetchUser(userId: string) {
  return request<any>(`/users/${userId}`);
}

export async function updateUser(
  userId: string,
  payload: Record<string, unknown>,
) {
  return request<any>(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function fetchVehicles(userId?: string) {
  return request<any[]>(userId ? `/vehicles?userId=${userId}` : "/vehicles");
}

export async function createVehicle(vehicle: Record<string, unknown>) {
  return request<any>("/vehicles", {
    method: "POST",
    body: JSON.stringify(vehicle),
  });
}

export async function fetchRegistrations(
  filters: Record<string, string | undefined> = {},
) {
  const qs = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => v && qs.append(k, v));
  return request<any[]>(`/registrations?${qs.toString()}`);
}

export async function createRegistration(reg: Record<string, unknown>) {
  return request<any>("/registrations", {
    method: "POST",
    body: JSON.stringify(reg),
  });
}

export async function cancelRegistration(registrationId: string) {
  return request<any>(`/registrations/${registrationId}`, {
    method: "DELETE",
  });
}

export async function createVenue(venue: Record<string, unknown>) {
  return request<any>("/venues", {
    method: "POST",
    body: JSON.stringify(venue),
  });
}
