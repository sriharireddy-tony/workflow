# Jira SaaS

## Backend (`server/`)

```bash
cd server
npm install
cp .env.example .env   # then edit .env
npm run dev
```

See [server/README.md](server/README.md) and Swagger at `http://localhost:4000/api/docs`.

## Frontend (`client/`)

```bash
cd client
npm install
npm run dev
```

Opens **http://localhost:5173**; API calls to `/api` are proxied to the server on port **4000**. Run **both** `server` and `client` for full-stack dev.

See [client/README.md](client/README.md).
