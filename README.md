# RentNest Backend API

A secure and scalable RESTful API for a House Rental Management System. This backend enables tenants to discover rental properties, landlords to manage listings, and administrators to monitor the platform. The project follows a clean architecture using Express.js, TypeScript, Prisma ORM, PostgreSQL, JWT Authentication, and Stripe Payment Integration.

---

# 🚀 Live API

```
https://your-live-api-url.com
```


# 📖 Project Overview

RentNest is a modern rental platform that connects Tenants and Landlords through a secure web application.

The system provides:

- User Authentication
- Role Based Authorization
- Property Listing
- Rental Request System
- Rental Approval
- Stripe Payment
- Admin Dashboard
- Property Categories

---

# ✨ Features

## Public

- View Categories
- Browse Properties
- Filter Properties by Location

## Authentication

- User Registration
- User Login
- JWT Authentication
- Password Hashing using bcrypt

## Tenant

- Browse Properties
- Submit Rental Request
- Make Payment

## Landlord

- Create Property
- View Rental Requests
- Approve Rental Requests

## Admin

- Manage Users
- Ban / Unban Users
- View All Properties
- View All Rental Requests

---

# 🛠 Tech Stack

| Technology | Description |
|------------|-------------|
| Node.js | JavaScript Runtime |
| Express.js | Backend Framework |
| TypeScript | Programming Language |
| PostgreSQL | Database |
| Prisma ORM | Database ORM |
| JWT | Authentication |
| bcrypt | Password Hashing |
| Stripe | Online Payment |
| dotenv | Environment Variables |
| CORS | Cross Origin Support |

---
# 📂 Project Structure

```
rentnest-backend/
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── src/
│   ├── config/
│   │   └── prisma.ts
│   │
│   ├── controllers/
│   │   ├── auth.controllers.ts
│   │   ├── admin.controller.ts
│   │   ├── landlord.controller.ts
│   │   ├── tenant.controller.ts
│   │   ├── property.controller.ts
│   │   └── payment.controller.ts
│   │
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── checkRole.ts
│   │   ├── validateRequest.ts
│   │   ├── globalErrorHandler.ts
│   │   └── notFound.ts
│   │
│   ├── routes/
│   │   └── router.ts
│   │
│   ├── schemas/
│   │
│   ├── utils/
│   │
│   ├── app.ts
│   ├── server.ts
│   ├── interfaces.ts
│   └── swagger.ts
│
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---



---

