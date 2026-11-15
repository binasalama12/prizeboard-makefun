import { date, entryCount, esc, money, potOf, timeLeft, winRate } from './format.js';

const bountyPath = (slug) => `#/bounty/${encodeURIComponent(slug ?? '')}`;
const number = (value) => Number(value ?? 0).toLocaleString('en-US');
const feeLabel = (bounty) => Number(bounty?.entryFeeUsd) > 0 ? money(bounty.entryFeeUsd) : 'Free entry';

export function loading(label = 'Loading') {
  return `<section class="state-card"><span class="spinner" aria-hidden="true"></span><p>${esc(label)}…</p></section>`;
}

export function errorState(error) {
  return `<section class="state-card error-state"><span class="eyebrow">A little pause</span><h1>We couldn’t load this view.</h1><p>${esc(error?.message ?? 'Please check your connection and try again.')}</p><a class="button-link" href="#/">Back to the board</a></section>`;
}

export function board(bounties, query = '', sort = 'pot') {
  const normalized = query.trim().toLowerCase();
  const filtered = bounties.filter((b) => `${b.title ?? ''} ${b.summary ?? ''} ${b.category ?? ''}`.toLowerCase().includes(normalized));
  filtered.sort((a, b) => {
    if (sort === 'deadline') return new Date(a.deadline ?? Infinity) - new Date(b.deadline ?? Infinity);
    if (sort === 'entries') return entryCount(b) - entryCount(a);
    return Number(potOf(b) ?? 0) - Number(potOf(a) ?? 0);
  });
  const cards = filtered.map((b) => `
    <article class="bounty-card">
      <div class="card-topline"><span class="category-tag">${esc(b.category || 'Open bounty')}</span><span class="entries-pill">↗ ${number(entryCount(b))} ${entryCount(b) === 1 ? 'entry' : 'entries'}</span></div>
      <h2><a href="${bountyPath(b.slug)}">${esc(b.title || 'Untitled bounty')}</a></h2>
      <p class="card-summary">${esc(b.summary || 'A new opportunity to build something useful.')}</p>
      <div class="pot-block"><span class="label">PRIZE POOL</span><strong>${money(potOf(b))}</strong>${b.rewardAmount != null && b.potUsd != null ? `<small>Base reward ${money(b.rewardAmount)}</small>` : ''}</div>
      <div class="card-meta"><span><small>ENTRY</small><b>${feeLabel(b)}</b></span><span><small>TIME LEFT</small><b>${esc(timeLeft(b.deadline))}</b></span></div>
      <a class="card-cta" href="${bountyPath(b.slug)}">View bounty <span aria-hidden="true">↗</span></a>
    </article>`).join('');
  return `<section class="board-hero"><div><span class="eyebrow">THE OPEN CALL</span><h1>Big ideas.<br><em>Real rewards.</em></h1><p>Find your next challenge and turn a good idea into a great finish.</p></div><div class="hero-stamp"><span>MAKE</span><b>✳</b><span>YOUR<br>MOVE</span></div></section>
    <section class="board-section"><div class="section-heading"><div><span class="eyebrow">THE BOARD</span><h2>Open bounties <span class="count">${bounties.length}</span></h2></div><div class="filters"><label class="search-box"><span aria-hidden="true">⌕</span><input id="bounty-search" type="search" value="${esc(query)}" placeholder="Search challenges" aria-label="Search bounties"></label><label class="sort-box"><span class="sr-only">Sort bounties</span><select id="bounty-sort"><option value="pot" ${sort === 'pot' ? 'selected' : ''}>Biggest pot</option><option value="deadline" ${sort === 'deadline' ? 'selected' : ''}>Ending soon</option><option value="entries" ${sort === 'entries' ? 'selected' : ''}>Most entries</option></select></label></div></div>
    ${filtered.length ? `<div class="bounty-grid">${cards}</div>` : `<div class="empty-state"><span>⌕</span><h3>${bounties.length ? 'No matches just yet' : 'The board is warming up'}</h3><p>${bounties.length ? 'Try another search to find your next challenge.' : 'Check back soon for fresh opportunities.'}</p></div>`}</section>`;
}

export function bounty(b) {
  const slug = b.slug || '';
  const rewards = Array.isArray(b.rewards) ? b.rewards : (b.rewards && typeof b.rewards === 'object' ? Object.entries(b.rewards).map(([place, value]) => typeof value === 'object' ? { place, ...value } : { place, amount: value }) : null);
  const rewardSection = rewards ? `<section class="detail-panel"><span class="eyebrow">HOW THE POT BREAKS DOWN</span><h2>Rewards</h2><div class="reward-list">${rewards.length ? rewards.map((reward, i) => `<div class="reward-row"><span class="reward-rank">${esc(reward.place ?? reward.rank ?? `0${i + 1}`)}</span><b>${esc(reward.title ?? reward.label ?? reward.name ?? 'Prize')}</b><strong>${money(reward.amountUsd ?? reward.prizeUsd ?? reward.amount ?? reward.value)}</strong></div>`).join('') : '<p>Reward details will be announced soon.</p>'}</div></section>` : '';
  return `<div class="detail-wrap"><a class="back-link" href="#/">← All bounties</a><section class="bounty-hero"><div class="bounty-intro"><span class="category-tag">${esc(b.category || 'OPEN BOUNTY')}</span><h1>${esc(b.title)}</h1><p class="lead">${esc(b.summary)}</p><div class="detail-links"><a class="button-link" href="#/leaderboard?slug=${encodeURIComponent(slug)}">View leaderboard <span>↗</span></a><span class="live-dot">Open for entries</span></div></div><aside class="prize-card"><span class="eyebrow">TOTAL PRIZE POOL</span><strong>${money(potOf(b))}</strong><span class="base-reward">${b.rewardAmount != null ? `${money(b.rewardAmount)} base reward` : 'Make your mark'}</span><div class="prize-rule"></div><div class="prize-facts"><span><small>ENTRY FEE</small><b>${feeLabel(b)}</b></span><span><small>ENTRIES</small><b>${number(entryCount(b))}</b></span><span><small>DEADLINE</small><b data-countdown="${esc(b.deadline)}">${esc(timeLeft(b.deadline))}</b></span></div><small class="deadline-date">${esc(date(b.deadline))}</small></aside></section><div class="detail-columns"><section class="detail-panel description-panel"><span class="eyebrow">THE BRIEF</span><h2>What you’re building</h2><div class="description">${esc(b.description || b.summary || 'Full challenge details are coming soon.')}</div></section>${rewardSection}</div></div>`;
}

export function leaderboard(data, bounties, selectedSlug) {
  const competition = data.competition ?? {};
  const slug = selectedSlug || competition.slug || '';
  const title = competition.title || bounties.find((item) => item.slug === slug)?.title || 'Selected bounty';
  const rows = data.rows ?? data.entries ?? data.standings ?? data.items ?? [];
  const columns = Array.isArray(data.columns) ? data.columns : [];
  const records = Array.isArray(rows) ? rows : [];
  const entries = records.map((row, i) => {
    const handle = row.handle ?? row.agent?.handle ?? row.agentHandle ?? row.agent_handle ?? row.profile?.handle;
    const entrant = row.entrant?.handle ?? row.entrant?.name ?? row.agent?.name ?? row.name ?? handle ?? 'Anonymous maker';
    const entryTitle = row.entryTitle ?? row.entry_title ?? row.title ?? row.entry?.title ?? row.submission?.title ?? 'Untitled entry';
    const metric = winRate(row);
    const rank = row.rank ?? row.position ?? i + 1;
    return `<tr><td class="rank-cell">${String(rank).padStart(2, '0')}</td><td>${handle ? `<a class="entrant-link" href="#/profile/${encodeURIComponent(handle)}">${esc(entrant)}</a>` : esc(entrant)}</td><td>${esc(entryTitle)}</td><td>${metric ? `<span class="metric-value">${esc(metric)}</span>` : '<span class="muted">—</span>'}</td></tr>`;
  }).join('');
  return `<section class="interior-hero"><span class="eyebrow">LIVE STANDINGS</span><h1>Leaderboard</h1><p>See how the field is shaping up.</p></section><section class="leaderboard-section"><div class="leaderboard-toolbar"><div><span class="eyebrow">CURRENTLY TRACKING</span><h2>${esc(title)}</h2></div><label class="select-label"><span>Choose a bounty</span><select id="leaderboard-bounty">${bounties.map((item) => `<option value="${esc(item.slug)}" ${item.slug === slug ? 'selected' : ''}>${esc(item.title)}</option>`).join('')}</select></label></div>${records.length ? `<div class="table-wrap"><table><thead><tr><th>RANK</th><th>ENTRANT</th><th>ENTRY</th><th>${esc(columns.find((c) => /win.?rate/i.test(typeof c === 'string' ? c : c.name ?? c.key ?? ''))?.name ?? 'WIN RATE')}</th></tr></thead><tbody>${entries}</tbody></table></div>` : `<div class="empty-state leaderboard-empty"><span>✳</span><h3>It’s anyone’s game</h3><p>No entries have landed on this leaderboard yet. Be the first to make a move.</p></div>`}</section>`;
}

export function profile(input) {
  const p = input.profile ?? input;
  const record = p.record ?? {};
  const handle = p.handle ?? p.username ?? 'maker';
  const stats = [
    ['Entered', record.competitions_entered], ['Placed', record.competitions_placed], ['Won', record.competitions_won],
    ['Podium finishes', record.podium_finishes], ['Best placement', record.best_placement ? `#${record.best_placement}` : '—'], ['Prize earned', money(record.prize_usd)],
  ];
  const wallet = p.walletAddress ?? p.wallet_address ?? p.wallet ?? '';
  const shortWallet = wallet.length > 15 ? `${wallet.slice(0, 8)}…${wallet.slice(-6)}` : wallet;
  const solutions = Array.isArray(p.solutions) ? p.solutions : [];
  return `<div class="profile-wrap"><a class="back-link" href="#/">← Back to board</a><section class="profile-hero"><div class="avatar-mark">${esc(String(handle).slice(0, 1).toUpperCase())}</div><div><span class="eyebrow">MAKER PROFILE</span><h1>${esc(p.displayName ?? p.display_name ?? handle)}</h1><span class="handle">@${esc(handle)}</span></div></section><section class="profile-bio"><div><span class="eyebrow">ABOUT</span><p>${esc(p.bio || 'This maker is ready to build something worth remembering.')}</p></div>${wallet ? `<div class="wallet"><span class="eyebrow">WALLET</span><code title="${esc(wallet)}">${esc(shortWallet)}</code></div>` : ''}</section><section class="stats-section"><span class="eyebrow">THE TRACK RECORD</span><div class="stats-grid">${stats.map(([label, value]) => `<div class="stat-card"><span>${esc(label)}</span><strong>${esc(value ?? '0')}</strong></div>`).join('')}</div></section><section class="solutions-section"><div class="section-heading"><div><span class="eyebrow">WORK IN THE ARENA</span><h2>Solutions <span class="count">${solutions.length}</span></h2></div></div>${solutions.length ? `<div class="solution-list">${solutions.map((solution) => { const competition = solution.competition ?? {}; return `<a class="solution-card" href="${bountyPath(competition.slug)}"><span class="solution-icon">↗</span><span><strong>${esc(solution.title ?? 'Untitled solution')}</strong><small>${esc(competition.title ?? 'Competition')} · ${esc(competition.status ?? 'open')}</small></span><span aria-hidden="true">→</span></a>`; }).join('')}</div>` : `<div class="empty-state"><span>✳</span><h3>First solution awaits</h3><p>When this maker enters a bounty, their work will show up here.</p></div>`}</section></div>`;
}
