# Festival Social Grid

MVP described in [`PRD.md`](./PRD.md). Working rules for agents live in [`AGENTS.md`](./AGENTS.md).

## Local development

Requirements: Node.js, pnpm and Docker (rootless is recommended).

```bash
cp .env.example .env
docker compose up -d --wait   # Postgres (festival_dev + festival_test) and Mailpit
pnpm install
pnpm dev
```

- `festival_dev` is the development database; `festival_test` is wiped by integration tests.
- Mailpit captures outgoing email: SMTP on `localhost:1025`, web UI on <http://localhost:8025>.
- The test database is created only on the first start of an empty volume. To recreate it, run `docker compose down -v`, which also deletes development data.
