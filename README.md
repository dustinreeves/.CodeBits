# Movie Night Vote

A simple group movie voting app built with Next.js (App Router), TypeScript, Prisma + SQLite, and TailwindCSS. Hosts create sessions with participants and movies, participants vote and use up to three vetoes, and the session finalizes to a ranked result.

## Features

- Create sessions with a join code and veto mode (hard or soft).
- Participants pick their name (no accounts).
- Upvote once per movie, veto up to three movies (vetoes are permanent).
- Live updates via polling every 2 seconds.
- Finalized results with winner + full ranking.

## Setup

```bash
npm install
```

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Run database migrations:

```bash
npx prisma migrate dev --name init
```

Generate Prisma client:

```bash
npx prisma generate
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm run start
```

## Usage

- Visit `/` to join an existing session or create a new one.
- Hosts manage voting and finalize from the session page.
- Results are available at `/s/[code]/results` once finalized.

## Ranking logic

- **Hard veto (default):** any veto removes a movie from the winner list. If all movies are vetoed, the winner is picked by _fewest vetoes, then highest votes_.
- **Soft veto:** each veto is -3 points in scoring.

## Testing

```bash
npm test
```

## Deployment

- The app is designed for a cheap VPS or local deployment.
- Set `DATABASE_URL` to a persistent SQLite file (or point to a different database Prisma supports).
- Run migrations on the server before starting the app.

## Improvements to add next

- **Suggestion mode:** allow participants to propose movies before the host locks the list.
- **Two-phase flow:** vote on proposals, then run a final 5 runoff.
- **Configurable veto semantics:** let hosts choose hard vs soft veto (already included), expand with point weights.
- **Share link + QR code:** add share UI for join links.
- **Tie breakers:** default to fewer vetoes, then earliest added.
