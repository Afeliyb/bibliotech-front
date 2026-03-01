const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ─── Books ────────────────────────────────────────────────────────────────────

export async function getBooks() {
  const res = await fetch(`${BASE}/books`);
  if (!res.ok) throw new Error("Failed to fetch books");
  return res.json();
}

export async function createBook(payload: any) {
  const res = await fetch(`${BASE}/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create book");
  return res.json();
}

export async function updateBook(id: number, payload: any) {
  const res = await fetch(`${BASE}/books/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update book");
  return res.json();
}

export async function addBookCopies(id: number, count: number) {
  const res = await fetch(`${BASE}/books/${id}/copies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ count }),
  });
  if (!res.ok) throw new Error("Failed to add copies");
  return res.json();
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUsers() {
  const res = await fetch(`${BASE}/users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function updateUser(id: number, payload: any) {
  const res = await fetch(`${BASE}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Identifiants invalides");
  }
  return res.json();
}

export async function register(payload: any) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Erreur d'inscription");
  }
  return res.json();
}

// ─── Borrowings ───────────────────────────────────────────────────────────────

export async function getBorrowings() {
  const res = await fetch(`${BASE}/borrowings`);
  if (!res.ok) throw new Error("Failed to fetch borrowings");
  return res.json();
}

export async function createBorrowing(payload: any) {
  const res = await fetch(`${BASE}/borrowings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create borrowing");
  }
  return res.json();
}

export async function returnBook(id: number) {
  const res = await fetch(`${BASE}/borrowings/${id}/return`, { method: "PUT" });
  if (!res.ok) throw new Error("Failed to return book");
  return res.json();
}

// ─── Reservations ─────────────────────────────────────────────────────────────

export async function getReservations() {
  const res = await fetch(`${BASE}/reservations`);
  if (!res.ok) throw new Error("Failed to fetch reservations");
  return res.json();
}

export async function createReservation(payload: any) {
  const res = await fetch(`${BASE}/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create reservation");
  return res.json();
}

export async function updateReservationStatus(id: number, status: string) {
  const res = await fetch(`${BASE}/reservations/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update reservation status");
  return res.json();
}

// ─── Penalties ────────────────────────────────────────────────────────────────

export async function getPenalties() {
  const res = await fetch(`${BASE}/penalties`);
  if (!res.ok) throw new Error("Failed to fetch penalties");
  return res.json();
}

export async function payPenalty(id: number) {
  const res = await fetch(`${BASE}/penalties/${id}/pay`, { method: "PUT" });
  if (!res.ok) throw new Error("Failed to pay penalty");
  return res.json();
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function getNotifications(user_id: number) {
  const res = await fetch(`${BASE}/notifications?user_id=${user_id}`);
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export async function getUnreadCount(user_id: number): Promise<number> {
  const res = await fetch(`${BASE}/notifications/unread-count?user_id=${user_id}`);
  if (!res.ok) return 0;
  const data = await res.json();
  return data.count ?? 0;
}

export async function markNotificationRead(id: number) {
  const res = await fetch(`${BASE}/notifications/${id}/read`, { method: "PUT" });
  if (!res.ok) throw new Error("Failed to mark notification read");
  return res.json();
}

export async function markAllNotificationsRead(user_id: number) {
  const res = await fetch(`${BASE}/notifications/mark-all-read`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id }),
  });
  if (!res.ok) throw new Error("Failed to mark all read");
  return res.json();
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getStats() {
  const res = await fetch(`${BASE}/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}
