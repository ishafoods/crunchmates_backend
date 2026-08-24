# Crunchmates Backend

Node.js, Express, TypeScript, and MongoDB API for the Crunchmates frontend.

## Run locally

1. Start MongoDB.
2. Copy `.env.example` to `.env` and adjust values.
3. Run `npm install`.
4. Run `npm run seed` to create the catalog, content, and demo admin.
5. Run `npm run dev`.

The API runs at `http://localhost:4000` by default. Health check: `GET /api/health`.

## Authentication

- `POST /api/auth/customer` accepts `{ name, email }` and returns a customer JWT.
- `POST /api/auth/admin/login` accepts `{ email, password }` and returns an admin JWT.
- Send protected requests with `Authorization: Bearer <token>`.
- Guest carts use an `x-session-id` header. Customer carts automatically use the customer token.

## API surface

- Public: `GET /api/products`, `GET /api/products/:slug`, `GET /api/content`, `GET /api/catalog`
- Customer: `GET /api/auth/me`, `POST /api/auth/customer`, cart CRUD under `/api/cart`, `POST /api/orders`, `GET /api/orders/me`
- Admin: `GET /api/admin/dashboard`, product CRUD under `/api/products`, `PATCH /api/content`, `GET /api/admin/orders`, `PATCH /api/admin/orders/:id/status`
