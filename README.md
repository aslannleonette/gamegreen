# Game Green

Aplicativo web de gamificação ambiental: usuários registram entregas de recicláveis, parceiros validam e os pontos podem ser trocados por recompensas.

## Stack
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Banco:** PostgreSQL
- **Auth:** JWT + hash de senha com `pgcrypto`

## Estrutura

```txt
.
├── backend
├── frontend
├── db
├── docker-compose.yml
└── README.md
```

## Pré-requisitos
- Node.js 20+
- npm 10+
- PostgreSQL 14+ (ou Docker)

## 1) Banco de dados

### Opção A: Docker
```bash
docker compose up -d db
```

### Opção B: PostgreSQL local
Crie um banco chamado `gamegreen` e ajuste variáveis no `.env` do backend.

### Rodar migrations + seed
```bash
psql -h localhost -U postgres -d gamegreen -f db/schema.sql
psql -h localhost -U postgres -d gamegreen -f db/seed.sql
```

## 2) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Servidor: `http://localhost:3000`

## 3) Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App: `http://localhost:5173`

## Usuários de exemplo (seed)
- Parceiro: `parceiro@gamegreen.com` / `123456`
- Usuário: `usuario@gamegreen.com` / `123456`

## Fluxo
1. Usuário registra entrega (material + peso).
2. Entrega fica pendente.
3. Parceiro aprova/rejeita no painel parceiro.
4. Ao aprovar, pontos são creditados.
5. Usuário resgata recompensas no dashboard.

## Scripts úteis

### Backend
- `npm run dev` — desenvolvimento
- `npm run start` — produção

### Frontend
- `npm run dev` — desenvolvimento
- `npm run build` — build produção

## Segurança implementada
- Hash de senha com `pgcrypto` (`crypt` + `gen_salt`).
- JWT para autenticação.
- Middleware de autorização por papel (`user` / `partner`).
- Validação de payload no backend por funções dedicadas.
- Queries SQL parametrizadas.
