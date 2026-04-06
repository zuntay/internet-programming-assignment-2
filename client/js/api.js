const API_BASE = "http://127.0.0.1:3000/api";

async function apiRequest(path, options = {}) {
	const res = await fetch(API_BASE + path, {
		headers: { "Content-Type": "application/json", ...(options.headers || {}) },
		...options,
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`API ${res.status}: ${text}`);
	}
	return await res.json();
}

async function getCards() {
	return apiRequest("/cards");
}

async function createCard(data) {
	return apiRequest("/cards", { method: "POST", body: JSON.stringify(data) });
}

async function updateCard(id, data) {
	return apiRequest(`/cards/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

async function deleteCard(id) {
	return apiRequest(`/cards/${id}`, { method: "DELETE" });
}