# Oud Kraft Backend

The standalone Node.js/Express API foundation for the Oud Kraft luxury perfume store. This sprint provides infrastructure only; it intentionally includes no authentication, commerce workflows, payments, email sending, or CRUD endpoints.

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Set `MONGODB_URI` to the MongoDB Atlas connection string and replace `JWT_SECRET` before running outside local development.

## Commands

```bash
npm run dev    # development server with automatic reload
npm start      # production-style server
npm run lint   # lint JavaScript files
```

The API starts only after MongoDB connects. Confirm the process with `GET /api/health`.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port (default: 5000) |
| `NODE_ENV` | Runtime environment |
| `MONGODB_URI` | MongoDB Atlas connection URI |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Reserved authentication settings |
| `CLIENT_URL` | Allowed React client origin |
| `CLOUDINARY_*` | Reserved asset-hosting credentials |
| `EMAIL_*` | Reserved Nodemailer SMTP settings |
| `STRIPE_SECRET_KEY` | Reserved Stripe credential |

## Folder structure

```text
backend/
├── src/
│   ├── config/        # environment and MongoDB lifecycle
│   ├── controllers/   # reserved request handlers
│   ├── middleware/    # security, validation, errors, uploads
│   ├── models/        # timestamped Mongoose model placeholders
│   ├── routes/        # versioned API route placeholders
│   ├── services/ validators/ utils/ constants/
│   ├── tests/ docs/ uploads/
│   └── app.js
├── server.js
└── .env.example
```

## Development workflow

Keep feature routes under `/api/v1`, add validation before controllers, and use `asyncHandler` plus `AppError` for every asynchronous endpoint. Define Mongoose schemas and indexes before enabling any CRUD workflow. Use managed secrets in deployment rather than committing `.env`.
