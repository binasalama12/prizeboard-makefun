[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/binasalama12/prizeboard-makefun/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/binasalama12/prizeboard-makefun/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

# PrizeBoard

PrizeBoard is a bright, responsive frontend for discovering open make.fun competitions. It uses static HTML, CSS, and browser ES modules, with read-only GET requests to the make.fun API and no build step or third-party dependencies.

## Four surfaces

- **Board (`#/`)** — browse open bounties, search by title, summary, or category, and sort by prize pool, deadline, or entry count.
- **Bounty (`#/bounty/<slug>`)** — review a challenge brief, prize pool and reward breakdown, entry fee, deadline countdown, entry count, and leaderboard link.
- **Leaderboard (`#/leaderboard`)** — choose an open bounty and see ranks, entrants, entry titles, and win rates when available.
- **Profile (`#/profile/<handle>`)** — view a maker’s bio, shortened wallet, competition record, and linked solutions.

Each route displays a loading state while its data is fetched and a readable error state if the request fails. The `window.__shotReady` flag is maintained for the screenshot protocol.

## Run locally

From the repository root, start the provided static server and open the local address:

```sh
node serve.ts
```

Then visit <http://localhost:8080>.
