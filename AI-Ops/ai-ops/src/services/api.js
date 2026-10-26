// ============================================================
// AI-Ops API Service — connects React frontend to Spring Boot
// ============================================================

const BASE_URL = 'http://localhost:8080/api';

function getToken() { return localStorage.getItem('aiops_token'); }

function getHeaders() {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function request(method, path, body = null) {
  const options = { method, headers: getHeaders() };
  if (body) options.body = JSON.stringify(body);
  try {
    const res = await fetch(`${BASE_URL}${path}`, options);
    if (res.status === 401) {
      if (localStorage.getItem('aiops_token')) {
        console.warn(`[AI-Ops] 401 Unauthorized on ${path} — session expired, signing out`);
        localStorage.removeItem('aiops_token');
        window.dispatchEvent(new Event('auth-expired'));
      }
      return null;
    }
    // Safe JSON parsing — handle empty or non-JSON responses
    const text = await res.text();
    if (!text || !text.trim()) return null;
    try { return JSON.parse(text); }
    catch { console.warn(`Non-JSON from ${path}:`, text.substring(0, 80)); return null; }
  } catch (err) {
    console.error(`API Error [${method} ${path}]:`, err.message);
    throw err;
  }
}

export const authApi = {
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  logout: () => request('POST', '/auth/logout'),
  me: () => request('GET', '/auth/me'),
};

export const dashboardApi = {
  getKPIs: () => request('GET', '/dashboard/kpis'),
  getHealthTrend: () => request('GET', '/dashboard/machine-health-trend'),
  getAlerts: () => request('GET', '/dashboard/alerts'),
};

export const machineApi = {
  getAll: (status, dept) => {
    let q = status ? `?status=${status}` : dept ? `?department=${dept}` : '';
    return request('GET', `/machines${q}`);
  },
  getById: (id) => request('GET', `/machines/${id}`),
  getTelemetry: (id) => request('GET', `/machines/${id}/telemetry`),
  getSummary: () => request('GET', '/machines/stats/summary'),
  create: (data) => request('POST', '/machines', data),
  updateStatus: (id, status) => request('PATCH', `/machines/${id}/status`, { status }),
};

export const maintenanceApi = {
  getWorkOrders: (status) => request('GET', `/maintenance/work-orders${status ? '?status=' + status : ''}`),
  createWorkOrder: (data) => request('POST', '/maintenance/work-orders', data),
  updateStatus: (id, status, notes) => request('PATCH', `/maintenance/work-orders/${id}/status`, { status, resolutionNotes: notes }),
  getStats: () => request('GET', '/maintenance/stats'),
};

export const inventoryApi = {
  getAll: (cat) => request('GET', `/inventory${cat ? '?category=' + cat : ''}`),
  getLowStock: () => request('GET', '/inventory/low-stock'),
  updateStock: (id, qty) => request('PATCH', `/inventory/${id}/stock`, { qty }),
  getStats: () => request('GET', '/inventory/stats'),
  create: (data) => request('POST', '/inventory', data),
};

export const incidentApi = {
  getAll: (status) => request('GET', `/incidents${status ? '?status=' + status : ''}`),
  getById: (id) => request('GET', `/incidents/${id}`),
  create: (data) => request('POST', '/incidents', data),
  resolve: (id, rootCause, resolution) => request('PATCH', `/incidents/${id}/resolve`, { rootCause, resolution }),
  getStats: () => request('GET', '/incidents/stats'),
};

export const productionApi = {
  getToday: () => request('GET', '/production/today'),
  getMonthly: () => request('GET', '/production/monthly'),
};

export const userApi = {
  getAll: () => request('GET', '/users'),
  getStats: () => request('GET', '/users/stats'),
};
