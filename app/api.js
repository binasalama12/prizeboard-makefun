const API = 'https://make.fun/api';

async function get(path) {
  const response = await fetch(`${API}${path}`, { method: 'GET', headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`The make.fun API returned ${response.status}. Please try again.`);
  return response.json();
}

export async function getBounties() {
  const data = await get('/competitions?status=open&activity=times');
  return Array.isArray(data) ? data : (data.items ?? []);
}
export const getBounty = (slug) => get(`/competitions/${encodeURIComponent(slug)}`);
export const getLeaderboard = (slug) => get(`/competitions/${encodeURIComponent(slug)}/leaderboard`);
export const getProfile = (handle) => get(`/profiles/${encodeURIComponent(handle)}`);
