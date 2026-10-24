# Ergocraft Seating — E-Commerce Platform

Production-ready, full-stack e-commerce architecture for **Ergocraft Seating Pvt. Ltd.**, luxury furniture and commercial ergonomics brand.

## Project Structure

```text
Ergo Craft/
├── frontend/             # Next.js 16 Storefront (Customer UI, GSAP Hero, Cart, Checkout)
├── admin/                # Next.js 16 Admin Panel (Catalogue, Order Management, Analytics)
├── backend/              # Node.js + Express API (MongoDB Atlas, Razorpay, Brevo, Cloudinary)
├── README.md
└── .gitignore
```

## Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, GSAP ScrollTrigger, Lucide Icons
- **Admin**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons
- **Backend**: Node.js, Express, MongoDB Atlas, Mongoose, Zod, JWT, Argon2/Bcrypt, Helmet, Rate Limiter
- **Integrations**:
  - **Payment**: Razorpay (HMAC-SHA256 signature verification & webhooks)
  - **Media**: Cloudinary (Product images, multi-image uploads, secure destruction)
  - **Email**: Brevo Transactional API (Password reset, order confirmations, shipping updates)

## Quick Start

### 1. Backend API
```bash
cd backend
npm install
cp .env.example .env
npm run dev
# Server runs on http://localhost:5000
# Health check: http://localhost:5000/api/v1/health
```

### 2. Admin Portal
```bash
cd admin
npm install
cp .env.example .env.local
npm run dev
# Admin runs on http://localhost:3001
```

### 3. Customer Storefront
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
# Storefront runs on http://localhost:3000
```
