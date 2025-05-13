# 🧩 next-node-go-microservices

A basic microservices architecture project using:

- **Frontend**: Next.js (TypeScript)
- **Auth Service**: Node.js + MongoDB
- **Product Service**: Go + PostgreSQL
- **API Gateway**: NGINX (Reverse Proxy)
- **Deployment**: Docker & Docker Compose

---

## 📐 Architecture Overview

```
                     +----------------------+
                     |     Next.js (UI)     |
                     |  (Client Frontend)   |
                     +----------+-----------+
                                |
                        API Requests (HTTP)
                                |
               +-------------------------------+
               |         API Gateway           |
               |        (NGINX Reverse Proxy)  |
               +---------------+---------------+
                               |
         +---------------------+----------------------+
         |                                            |
   +-----v-----+                                +-----v-----+
   |  Auth     |                                |  Product  |
   | Service   |                                |  Service  |
   | (Node.js) |                                |   (Go)    |
   +-----+-----+                                +-----+-----+
         |                                            |
   +-----v-----+                                +-----v------+
   | MongoDB   |                                | PostgreSQL |
   +-----------+                                +------------+
```

---

## 📁 Folder Structure

```
next-node-go-microservices/
│
├── client/                # Next.js frontend
│
├── auth-service/          # Node.js + MongoDB
│
├── product-service/       # Go + PostgreSQL
│
├── api-gateway/           # NGINX config
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Getting Started

### 📦 Prerequisites

- Docker & Docker Compose
- Node.js (v18+)
- Go (v1.20+)
- MongoDB & PostgreSQL clients (optional)

---

### 🔧 Run the Application

#### 1. Clone the Repository

```bash
git clone https://github.com/your-username/next-node-go-microservices.git
cd next-node-go-microservices
```

#### 2. Run with Docker

```bash
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- API Gateway: `http://localhost`
- Auth Service: `http://localhost/api/auth/`
- Product Service: `http://localhost/api/products/`

---

## 🔧 Docker Compose Overview

```yaml
version: "3.8"

services:
  client:
    build: ./client
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost/api

  auth-service:
    build: ./auth-service
    ports:
      - "3001:3001"
    environment:
      MONGO_URI: mongodb://mongo:27017/authdb

  product-service:
    build: ./product-service
    ports:
      - "3002:3002"
    environment:
      POSTGRES_URI: postgres://user:pass@postgres:5432/productdb

  mongo:
    image: mongo
    ports:
      - "27017:27017"

  postgres:
    image: postgres
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: productdb
    ports:
      - "5432:5432"

  api-gateway:
    image: nginx:latest
    volumes:
      - ./api-gateway/nginx.conf:/etc/nginx/conf.d/default.conf
    ports:
      - "80:80"
```

---

## 🔐 Auth Service

- **Tech**: Node.js, Express, MongoDB
- **Features**:
  - Register & Login
  - JWT Token Authentication
  - Mongoose for DB models
  - Validation with Joi or Zod

---

## 📦 Product Service

- **Tech**: Go (Gin/Fiber), PostgreSQL
- **Features**:
  - CRUD for products
  - Database access using GORM or sqlx
  - Input validation with validator.v10

---

## 🖥️ Frontend (Next.js)

- **Tech**: Next.js, Tailwind CSS, TypeScript
- **Features**:
  - Authentication-aware UI
  - API calls to gateway using Axios / SWR / React Query
  - Forms using React Hook Form + Zod

---

## 📈 Future Enhancements

- Add gRPC or NATS for inter-service communication
- Integrate Redis for caching/session
- Add Prometheus + Grafana for monitoring
- Switch to Kubernetes for scaling

---

## 🧪 Testing

- **Unit Tests** per service
- **Integration Tests** across services
- **E2E Tests** via Playwright or Cypress

---

## 🪪 License

MIT License — feel free to use and modify.

---
