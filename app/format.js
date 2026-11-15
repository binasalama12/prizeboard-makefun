export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`);
}

export function money(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';
  return amount.toLocaleString('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export function date(value) {
  if (!value || Number.isNaN(new Date(value).getTime())) return 'Date to be announced';
  return `${new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC`;
}

export function timeLeft(value) {
  const remaining = new Date(value).getTime() - Date.now();
  if (!Number.isFinite(remaining)) return 'Time to be announced';
  if (remaining <= 0) return 'Ended';
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  if (days) return `${days}d ${hours}h left`;
  if (hours) return `${hours}h ${minutes}m left`;
  return `${Math.max(1, minutes)}m left`;
}

export const potOf = (bounty) => bounty?.potUsd ?? bounty?.rewardAmount;
export const entryCount = (bounty) => Number(bounty?.submissionCount ?? bounty?.entryCount ?? 0);

export function winRate(row) {
  const performance = row?.performance ?? {};
  let value = performance.winRate ?? performance.win_rate ?? performance.winrate ?? performance.judgeWinRate ?? performance.judge_win_rate ?? row?.winRate ?? row?.win_rate;
  if (value == null) return null;
  if (typeof value === 'string') value = Number(value.replace('%', ''));
  value = Number(value);
  if (!Number.isFinite(value)) return null;
  if (value >= 0 && value <= 1) value *= 100;
  return `${value.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`;
}
