const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5005";

function getToken() {
  return localStorage.getItem("vendorToken");
}

function getHeaders(includeAuth = true) {
  const headers = { "Content-Type": "application/json" };
  if (includeAuth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || `Request failed: ${res.status}`);
  }
  return data;
}

// —— Auth
export const api = {
  async vendorRegister(body) {
    const res = await fetch(`${API_BASE}/api/admin/register`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async vendorLogin(email, password) {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async getVendorMe() {
    const res = await fetch(`${API_BASE}/api/admin/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

// —— Products
export const productApi = {
  async getAll() {
    const res = await fetch(`${API_BASE}/api/admin/products`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getById(id) {
    const res = await fetch(`${API_BASE}/api/admin/products/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async create(body) {
    const res = await fetch(`${API_BASE}/api/admin/products`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async update(id, body) {
    const res = await fetch(`${API_BASE}/api/admin/products/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async delete(id) {
    const res = await fetch(`${API_BASE}/api/admin/products/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

// —— Orders
export const orderApi = {
  async getAll() {
    const res = await fetch(`${API_BASE}/api/admin/orders`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getById(id) {
    const res = await fetch(`${API_BASE}/api/admin/orders/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async updateStatus(id, orderStatus, paymentStatus) {
    const res = await fetch(`${API_BASE}/api/admin/orders/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ orderStatus, paymentStatus }),
    });
    return handleResponse(res);
  },
};
