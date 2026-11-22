# 🪡 Swarada Saree Center — eCommerce Platform

A premium full-stack eCommerce platform for Swarada Saree Center, built with React, Express, Prisma, and PostgreSQL.

## Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS v4** for styling
- **shadcn/ui** component library
- **React Router v6** for routing
- **TanStack Query** for server state
- **React Hook Form + Zod** for forms & validation

### Backend
- **Express.js** REST API
- **Prisma ORM** with PostgreSQL
- **JWT** authentication (access + refresh tokens)
- **Argon2** password hashing
- **Razorpay** payment gateway
- **Cloudinary** image management
- **Shiprocket** shipping integration
- **WhatsApp Business API** for notifications
- **Vyapar** accounting integration

## Getting Started

```bash
# Clone and install
git clone <repo-url>
cd swarada-ecommerce
npm install

# Set up environment
cp .env.example .env
# Edit .env with your credentials

# Set up database
cd server
npx prisma migrate dev
npx prisma db seed

# Run development
cd ..
npm run dev:client   # starts on :5173
npm run dev:server   # starts on :5000
```

## Project Structure

```
swarada-ecommerce/
├── client/          # React frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── services/
│       ├── context/
│       └── routes/
├── server/          # Express backend
│   ├── prisma/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── routes/
│       ├── services/
│       ├── middleware/
│       ├── validators/
│       ├── integrations/
│       └── utils/
└── docs/            # Documentation
```

## License

Private — All rights reserved.
