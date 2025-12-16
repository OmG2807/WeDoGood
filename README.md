# WeDoGood - NGO Impact Tracker

A full-stack web application that enables NGOs across India to submit monthly impact reports and allows administrators to view aggregated analytics through an intuitive dashboard.

![WeDoGood](https://img.shields.io/badge/WeDoGood-NGO%20Impact%20Tracker-606c38?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)
![Next.js](https://img.shields.io/badge/Next.js-14+-000000?style=flat-square&logo=next.js)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite)

## ✨ Features

### Core Features
- ✅ **Report Submission Form** - Submit individual monthly reports with validation
- ✅ **Bulk CSV Upload** - Upload multiple reports via CSV with background processing
- ✅ **Real-time Progress** - Live job status updates via polling
- ✅ **Admin Dashboard** - Aggregated monthly statistics with charts
- ✅ **Idempotent Submissions** - Same NGO/month updates existing data

### Bonus Features Implemented
- ✅ **Retry Logic** - Automatic retries for failed CSV rows (3 attempts with exponential backoff)
- ✅ **Pagination & Filtering** - Filter reports by month/NGO with pagination
- ✅ **Component Library** - Custom reusable UI components
- ✅ **Admin Authentication** - API key-based auth (optional)
- ✅ **OpenAPI/Swagger Spec** - Full API documentation at `/api-docs`
- ✅ **Postman Collection** - Ready-to-import API collection
- ✅ **Docker Setup** - Multi-stage Dockerfiles + docker-compose
- ✅ **Structured Logging** - JSON-formatted logs with timestamps

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js |
| Database | SQLite |
| Icons | Lucide React |
| DevOps | Docker, docker-compose |

## 📁 Project Structure

```
WeDoGood/
├── frontend/                   # Next.js frontend
│   ├── src/
│   │   ├── app/               # App router pages
│   │   ├── components/ui/     # Reusable UI components
│   │   └── lib/               # Utils, hooks, API client, types
│   ├── Dockerfile
│   └── package.json
│
├── backend/                    # Express.js API
│   ├── src/
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Logger, validation, response
│   │   ├── middleware/        # Auth middleware
│   │   └── db/                # Database init
│   ├── openapi.yaml           # OpenAPI specification
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml          # Multi-container setup
├── postman_collection.json     # Postman API collection
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Option 1: Local Development

```bash
# Clone the repository
git clone <repository-url>
cd WeDoGood

# Start backend
cd backend
npm install
npm run dev

# In another terminal, start frontend
cd frontend
npm install
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Option 2: Docker

```bash
# Build and run all services
docker-compose up --build

# Or run in background
docker-compose up -d
```

## 📡 API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/report` | Submit a single report |
| POST | `/reports/upload` | Upload CSV for bulk processing |
| GET | `/job-status/{job_id}` | Get job processing status |
| GET | `/job-status` | List all jobs |
| GET | `/dashboard?month=YYYY-MM` | Get aggregated monthly data |
| GET | `/dashboard/months` | List months with data |
| GET | `/dashboard/trends` | Get monthly trends |
| GET | `/dashboard/reports` | Paginated reports with filters |
| GET | `/dashboard/ngos` | List all NGOs |
| GET | `/api-docs` | OpenAPI specification |
| GET | `/health` | Health check |

### Sample Requests

**Submit a Report:**
```bash
curl -X POST http://localhost:5000/report \
  -H "Content-Type: application/json" \
  -d '{
    "ngo_id": "NGO-001",
    "month": "2024-03",
    "people_helped": 150,
    "events_conducted": 5,
    "funds_utilized": 50000
  }'
```

**Upload CSV:**
```bash
curl -X POST http://localhost:5000/reports/upload \
  -F "file=@reports.csv"
```

**Get Dashboard Data:**
```bash
curl "http://localhost:5000/dashboard?month=2024-03"
```

**Get Paginated Reports with Filter:**
```bash
curl "http://localhost:5000/dashboard/reports?page=1&limit=10&month=2024-03&ngo_id=NGO-001"
```

## 📊 CSV Format

```csv
ngo_id,month,people_helped,events_conducted,funds_utilized
NGO-001,2024-03,150,5,50000
NGO-002,2024-03,200,8,75000
```

| Column | Type | Format | Required |
|--------|------|--------|----------|
| ngo_id | string | Any unique ID | Yes |
| month | string | YYYY-MM | Yes |
| people_helped | integer | ≥ 0 | Yes |
| events_conducted | integer | ≥ 0 | Yes |
| funds_utilized | number | ≥ 0 | Yes |

## 🔐 Authentication (Optional)

Set environment variable to enable authentication:

```bash
AUTH_REQUIRED=true
ADMIN_API_KEY=your-secret-key
```

Then include in requests:
```bash
curl -H "X-API-Key: your-secret-key" http://localhost:5000/dashboard?month=2024-03
```

## 🐳 Docker Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Remove volumes (clears database)
docker-compose down -v
```

## 🔧 Environment Variables

### Backend
| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5000 | Server port |
| NODE_ENV | development | Environment |
| AUTH_REQUIRED | false | Enable authentication |
| ADMIN_API_KEY | admin-secret-key-... | API key for auth |

### Frontend
| Variable | Default | Description |
|----------|---------|-------------|
| NEXT_PUBLIC_API_URL | http://localhost:5000 | Backend API URL |

## 🏗 Architecture Decisions

### Background Processing
CSV files are processed asynchronously with:
- Immediate job ID response (HTTP 202)
- Progress tracking stored in SQLite
- Frontend polling every 1 second
- Automatic retry (3 attempts) for transient failures

### Idempotency
Reports use `UPSERT` with `(ngo_id, month)` as unique key:
- Same combination updates existing record
- No duplicate data

### Retry Logic
Failed rows are retried with exponential backoff:
- Max 3 attempts
- 100ms → 200ms → 400ms delays
- Validation errors fail immediately (no retry)

### Structured Logging
JSON-formatted logs with:
- ISO timestamp
- Log level (ERROR, WARN, INFO, DEBUG)
- Request metadata (method, path, duration)

## 📝 Deployment

### Vercel (Frontend)
```bash
cd frontend
vercel
```

### Render (Backend)
1. Create new Web Service
2. Connect GitHub repo
3. Set root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`

### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

## 🤖 AI Tools Used

This project was built with assistance from **Cursor AI** (Claude), which helped with:
- Project architecture and structure
- Code generation for both frontend and backend
- Implementing best practices (DRY, separation of concerns)
- Creating reusable components and utilities
- Writing documentation and API specs

## 📈 What I'd Improve with More Time

1. **WebSocket Support** - Real-time updates instead of polling
2. **Redis Queue** - Bull/BullMQ for production job processing
3. **PostgreSQL** - Migrate from SQLite for scale
4. **Testing** - Unit tests, integration tests, E2E tests
5. **CI/CD Pipeline** - GitHub Actions workflow
6. **Rate Limiting** - Protect API from abuse
7. **Data Export** - Download reports as CSV/Excel
8. **Charts Expansion** - More visualization options
9. **Multi-tenant** - Organization-level separation
10. **Email Notifications** - Job completion alerts

## 📜 License

MIT License - feel free to use this project as reference.

---

Built with ❤️ for NGOs making a difference | [Demo](#) | [API Docs](http://localhost:5000/api-docs)
