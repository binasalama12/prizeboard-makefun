import { getBounties, getBounty, getLeaderboard, getProfile } from './api.js';
import { board, bounty, errorState, leaderboard, loading, profile } from './views.js';
import { potOf, timeLeft } from './format.js';

const app = document.getElementById('app');
let bountyCache = null;
let boardQuery = '';
let boardSort = 'pot';
let currentRequest = 0;

function routeParts() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, query = ''] = raw.split('?');
  return { path, params: new URLSearchParams(query) };
}

async function openBounties() {
  if (!bountyCache) bountyCache = await getBounties();
  return bountyCache;
}

async function render() {
  const requestId = ++currentRequest;
  window.__shotReady = false;
  app.innerHTML = loading('Gathering the good stuff');
  const { path, params } = routeParts();
  try {
    let content;
    if (path === '/leaderboard') {
      const bounties = await openBounties();
      const selected = params.get('slug') || [...bounties].sort((a, b) => Number(potOf(b) ?? 0) - Number(potOf(a) ?? 0))[0]?.slug;
      if (!selected) content = leaderboard({ rows: [] }, bounties, '');
      else content = leaderboard(await getLeaderboard(selected), bounties, selected);
      document.title = 'Leaderboard | PrizeBoard';
    } else if (path.startsWith('/bounty/')) {
      const slug = decodeURIComponent(path.slice('/bounty/'.length));
      const item = await getBounty(slug);
      content = bounty(item);
      document.title = `${item.title ?? 'Bounty'} | PrizeBoard`;
    } else if (path.startsWith('/profile/')) {
      const handle = decodeURIComponent(path.slice('/profile/'.length));
      const person = await getProfile(handle);
      content = profile(person);
      document.title = `${person.displayName ?? person.display_name ?? person.handle ?? handle} | PrizeBoard`;
    } else {
      const bounties = await openBounties();
      content = board(bounties, boardQuery, boardSort);
      document.title = 'PrizeBoard — open competitions';
    }
    if (requestId !== currentRequest) return;
    app.innerHTML = content;
    window.scrollTo(0, 0);
    window.__shotReady = true;
  } catch (error) {
    if (requestId !== currentRequest) return;
    app.innerHTML = errorState(error);
    document.title = 'PrizeBoard — unable to load';
    window.__shotReady = true;
  }
}

app.addEventListener('input', (event) => {
  if (event.target.id !== 'bounty-search') return;
  boardQuery = event.target.value;
  const cursor = event.target.selectionStart;
  app.innerHTML = board(bountyCache ?? [], boardQuery, boardSort);
  const input = document.getElementById('bounty-search');
  input.focus();
  input.setSelectionRange(cursor, cursor);
});

app.addEventListener('change', (event) => {
  if (event.target.id === 'bounty-sort') {
    boardSort = event.target.value;
    app.innerHTML = board(bountyCache ?? [], boardQuery, boardSort);
  }
  if (event.target.id === 'leaderboard-bounty') {
    location.hash = `#/leaderboard?slug=${encodeURIComponent(event.target.value)}`;
  }
});

window.addEventListener('hashchange', render);
window.setInterval(() => {
  document.querySelectorAll('[data-countdown]').forEach((node) => { node.textContent = timeLeft(node.dataset.countdown); });
}, 30000);
render();
