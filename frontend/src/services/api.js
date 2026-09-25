import * as signalR from '@microsoft/signalr';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const api = {
  async getActiveRooms(search = '', page = 1, pageSize = 6) {
    const params = new URLSearchParams();
    if (search && search.trim()) params.append('search', search.trim());
    params.append('page', page);
    params.append('pageSize', pageSize);

    try {
      const res = await fetch(`${API_BASE}/api/rooms?${params.toString()}`);
      if (!res.ok) {
        console.warn(`[api.getActiveRooms] HTTP ${res.status}`);
        return null;
      }
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.warn('[api.getActiveRooms] Network error:', err);
      return null;
    }
  },

  async getRoomByCode(code) {
    const res = await fetch(`${API_BASE}/api/rooms/${code}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    return json.data;
  },

  async createRoom(roomData) {
    const res = await fetch(`${API_BASE}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomData),
    });
    if (!res.ok) {
      let msg = 'Oda oluşturulamadı.';
      try {
        const errJson = await res.json();
        if (errJson && errJson.message) {
          msg = errJson.message;
        }
      } catch {
        const text = await res.text().catch(() => '');
        if (text) msg = text;
      }
      throw new Error(msg);
    }
    const json = await res.json();
    return json;
  },

  async scrapeLinkedIn(url) {
    const res = await fetch(`${API_BASE}/api/scraper/linkedin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    return json.data;
  },

  // Admin Panel APIs
  async adminLogin(username, password, captchaToken = '') {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, captchaToken })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Giriş başarısız.');
    return json.data;
  },

  async getAdminStats(token) {
    const res = await fetch(`${API_BASE}/api/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Yetkisiz erişim.');
    return json.data;
  },

  async getAdminRooms(token, search = '', page = 1, pageSize = 10) {
    const params = new URLSearchParams();
    if (search && search.trim()) params.append('search', search.trim());
    params.append('page', page);
    params.append('pageSize', pageSize);

    const res = await fetch(`${API_BASE}/api/admin/rooms?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Yetkisiz erişim.');
    return json.data;
  },

  async deleteAdminRoom(token, roomId) {
    const res = await fetch(`${API_BASE}/api/admin/rooms/${roomId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Oda silinemedi.');
    return json;
  }
};

export function createGameHubConnection() {
  const hubUrl = `${API_BASE}/gamehub`;
  return new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      skipNegotiation: false,
      transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
    })
    .withAutomaticReconnect()
    .build();
}
