const API_BASE = "http://127.0.0.1:3000/api";

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.detail || data?.error || `API error ${response.status}`;
    throw new Error(message);
  }

  return data;
}

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export function registerUser(data) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function loginUser(data) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getCurrentUser(token) {
  return request("/auth/me", {
    headers: authHeaders(token),
  });
}

export function getFlashcards(token, search = "") {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return request(`/flashcards${query}`, {
    headers: authHeaders(token),
  });
}

export function createFlashcard(token, data) {
  return request("/flashcards", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export function updateFlashcard(token, id, data) {
  return request(`/flashcards/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export function deleteFlashcard(token, id) {
  return request(`/flashcards/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export function createHistory(token, data) {
  return request("/history", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export function getMyHistory(token) {
  return request("/history/me", {
    headers: authHeaders(token),
  });
}

export function getAllHistory(token) {
  return request("/history/all", {
    headers: authHeaders(token),
  });
}

export function deleteHistory(token, id) {
  return request(`/history/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}