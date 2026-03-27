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

export async function fetchUsers() {
  return request<any[]>("/users");
}

export async function createVenue(venue: Record<string, unknown>) {
  return request<any>("/venues", {
    method: "POST",
    body: JSON.stringify(venue),
  });
}
