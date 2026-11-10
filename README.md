# Student Management System

A full-stack, containerized Student Management System built with a Vanilla JavaScript + Vite frontend, a Node.js + Express REST API backend, and a MongoDB database. Designed for high performance, reliability, and containerized deployment using Docker and Docker Compose.

---

## 1. Project Overview

The **Student Management System** streamlines academic administrative workflows including student enrollment, record filtering, searching, profile management, and role-based staff authentication. The project has completed Phase 1 (Core Architecture), Phase 2 (Frontend Client & Responsive Interface), and Phase 3 (DevOps Implementation & Containerization).

---

## 2. Technology Stack

- **Frontend**:
  - Vanilla JavaScript (ES Modules)
  - Vite Bundler
  - HTML5 & Responsive CSS3
  - Nginx 1.27 Alpine (Production Web Server & Reverse Proxy)
- **Backend**:
  - Node.js (v20 Alpine)
  - Express.js (v5)
  - JSON Web Tokens (JWT) for stateless authentication
  - bcryptjs for password hashing
  - Mongoose (v8) ODM
- **Database**:
  - MongoDB 7 (Official Alpine/Linux Image)
  - Named Docker Volume for persistent storage
- **Containerization & DevOps**:
  - Docker Multi-Stage Builds
  - Docker Compose v2/v5 specification
  - Custom isolated Docker bridge network
  - Automated health check probes

---

## 3. Architecture Overview

In production, client browsers connect directly to the Nginx frontend container on the published port (`http://localhost:5173`). Nginx serves static production assets and transparently reverse-proxies all `/api/*` requests internally to the Express backend container (`http://backend:5000`). The backend handles business authentication and connects to the isolated MongoDB database container (`mongodb://mongodb:27017`).

### Container Communication Diagram

```
User Browser
    │
    │ HTTP Requests (Port 5173)
    ▼
┌────────────────────────────────────────────────────────┐
│  Frontend Container (student-frontend)                 │
│  - Nginx 1.27 Alpine (Port 80)                        │
│  - Static SPA Web Root: /usr/share/nginx/html          │
│  - Reverse Proxy: /api/* ──► http://backend:5000       │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ Internal Docker Bridge Network (student-network)
                            ▼
┌────────────────────────────────────────────────────────┐
│  Backend Container (student-backend)                   │
│  - Node.js 20 Alpine / Express API (Port 5000)         │
│  - Health Endpoint: /api/health                        │
│  - Auth Endpoints: /api/auth/register, /api/auth/login │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ Mongoose TCP Connection (Port 27017)
                            ▼
┌────────────────────────────────────────────────────────┐
│  Database Container (student-mongodb)                  │
│  - MongoDB 7 Community Edition                         │
│  - Host Port: 27017:27017                              │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  Persistent Docker Named Volume                        │
│  - Volume Name: mongodb_data (Mount: /data/db)         │
└────────────────────────────────────────────────────────┘
```

---

## 4. Repository Structure

```
Student-management-system/
├── .env.example              # Root Docker Compose environment template
├── .gitignore                # Root Git ignore rules
├── docker-compose.yml        # Multi-container orchestration definition
├── README.md                 # Project and deployment documentation
├── backend/
│   ├── .dockerignore         # Docker context exclusions for backend
│   ├── .env.example          # Backend environment variable template
│   ├── .gitignore            # Backend-specific ignore rules
│   ├── Dockerfile            # Production Node.js Alpine container image
│   ├── package.json          # Backend dependencies and scripts
│   ├── package-lock.json     # Backend locked dependency tree
│   └── src/
│       ├── models/
│       │   └── User.js       # Mongoose User schema (auth)
│       ├── routes/
│       │   └── auth.js       # Register and Login routes
│       └── server.js         # Express server & health check entrypoint
├── frontend/
│   ├── .dockerignore         # Docker context exclusions for frontend
│   ├── .env.example          # Frontend environment variable template
│   ├── .gitignore            # Frontend-specific ignore rules
│   ├── Dockerfile            # Multi-stage production Nginx container image
│   ├── index.html            # Single Page Application HTML root
│   ├── nginx.conf            # Nginx server block, SPA fallback & reverse proxy
│   ├── package.json          # Frontend dependencies and Vite build scripts
│   ├── package-lock.json     # Frontend locked dependency tree
│   ├── public/               # Public static assets & SVG icons
│   └── src/
│       ├── api/
│       │   ├── client.js     # Unified HTTP client with dynamic proxy routing
│       │   └── students.js   # Student CRUD service (dual mock / REST mode)
│       ├── components/
│       │   ├── dashboard.js  # Dashboard & student management UI controller
│       │   └── navbar.js     # Dynamic navbar with auth state binding
│       ├── state/
│       │   └── auth.js       # Client authentication and JWT session state
│       └── style.css         # Responsive UI design system styles
└── frontend_phase2_backup/   # Phase 2 reference backup (preserved)
```

---

## 5. Docker Prerequisites

Before running the application with Docker Compose, ensure the following are installed and running on your system:

- **Docker Desktop** (version 24.0 or newer)
  - Ensure Docker Desktop is launched and the Linux container engine is active.
- **Docker Compose** (v2 or newer, bundled with Docker Desktop)
- Minimum System Resources:
  - 2 CPU cores
  - 4 GB RAM available
  - 5 GB free disk space

To verify Docker is active:
```bash
docker --version
docker-compose --version
# or
docker compose version
```

---

## 6. Environment Setup

Copy the example environment files to configure runtime secrets:

### Root Environment (Docker Compose)
```bash
cp .env.example .env
```
Key configuration settings in `.env`:
- `JWT_SECRET`: A secure, random string (min. 32 characters) used to sign and verify authentication tokens.
- `PORT`: Backend container port (default: `5000`).
- `MONGODB_URI`: Internal connection string (`mongodb://mongodb:27017/student_management`).
- `CLIENT_URL`: Allowed CORS origin (`http://localhost:5173`).

### Backend Local Development
If running the backend locally outside Docker:
```bash
cd backend
cp .env.example .env
```

### Frontend Local Development
If running Vite in local development mode:
```bash
cd frontend
cp .env.example .env
```

> **Security Note**: Never commit `.env` files containing real production secrets to version control. All `.env` files are strictly excluded by `.gitignore`.

---

## 7. Docker Image Build Instructions

To build all container images without starting them:

```bash
docker-compose build
# or
docker compose build
```

To build a specific service image (e.g., frontend or backend):
```bash
docker-compose build frontend
docker-compose build backend
```

---

## 8. Docker Compose Startup Instructions

### Start All Services in Background (Detached Mode)
```bash
docker-compose up -d --build
# or
docker compose up -d --build
```

### Service Startup Order
Docker Compose coordinates service startup using health checks:
1. `mongodb` starts first. Its health check verifies that the MongoDB daemon is ready to receive queries using `mongosh --eval "db.adminCommand('ping')"`.
2. `backend` starts once `mongodb` is healthy. Its health check verifies readiness via `wget -qO- http://127.0.0.1:5000/api/health`.
3. `frontend` starts once `backend` is healthy, ensuring zero reverse proxy connection failures for incoming users.

---

## 9. Application Access URLs

Once containers are started:

| Component | Target URL | Description |
|-----------|------------|-------------|
| **Frontend Application** | [http://localhost:5173](http://localhost:5173) | Production Nginx web interface & dashboard |
| **Backend Health Endpoint** | [http://localhost:5173/api/health](http://localhost:5173/api/health) | Health status via Nginx reverse proxy |
| **Direct Backend Health Check** | [http://localhost:5001/api/health](http://localhost:5001/api/health) | Direct backend port for developer debugging |
| **MongoDB Database Port** | `localhost:27017` | Direct database connection (Compass / CLI) |

---

## 10. Container Inspection Commands

### Check Status of Running Services
```bash
docker-compose ps
# or
docker compose ps
```

### Inspect Container Health & Resource Usage
```bash
docker stats
```

### Inspect Container Top Processes
```bash
docker-compose top
```

---

## 11. Logs Commands

### View Aggregated Logs (Follow Mode)
```bash
docker-compose logs -f
```

### View Backend Logs
```bash
docker-compose logs -f backend
```

### View Frontend Nginx Logs
```bash
docker-compose logs -f frontend
```

### View MongoDB Logs
```bash
docker-compose logs -f mongodb
```

### View Last 100 Lines of Logs
```bash
docker-compose logs --tail=100 backend
```

---

## 12. Stop and Restart Commands

### Stop Running Containers (Preserves Database Data)
```bash
docker-compose stop
```

### Restart Containers
```bash
docker-compose restart
```

### Stop and Remove Containers, Networks
```bash
docker-compose down
```

> ⚠️ **CRITICAL WARNING**: Never execute `docker-compose down -v` unless you explicitly want to permanently delete all MongoDB database records and persistent volume storage.

---

## 13. Database Persistence Explanation

MongoDB data is stored in a dedicated named Docker volume:
```yaml
volumes:
  mongodb_data:
    driver: local
```
- In the container, the database directory `/data/db` is mounted directly from the `mongodb_data` volume.
- When containers are stopped (`docker-compose stop`) or recreated (`docker-compose down && docker-compose up -d`), all stored collections, users, and student records remain intact.

---

## 14. Troubleshooting

### 1. Docker Desktop Engine Not Running
- **Symptom**: `failed to connect to the docker API at npipe:////./pipe/docker_engine... The system cannot find the file specified.`
- **Solution**: Open Docker Desktop from your Start menu / Applications. Wait until the status indicator in the bottom-left corner displays green ("Engine running") before executing `docker-compose up -d`.

### 2. Port Conflict on Host Machine
- **Symptom**: `Bind for 0.0.0.0:5173 failed: port is already allocated` or `port 27017 is already allocated`.
- **Solution**: Check if local node or mongod processes are occupying the ports:
  ```powershell
  Get-NetTCPConnection -LocalPort 5173, 5001, 27017
  ```
  Terminate conflicting background processes or adjust host port mappings in `docker-compose.yml`.

### 3. Nginx 502 Bad Gateway
- **Symptom**: Accessing `http://localhost:5173/api/health` returns `502 Bad Gateway`.
- **Solution**: Check backend container logs:
  ```bash
  docker-compose logs backend
  ```
  Ensure the backend container is healthy and connected to `student-network`.

### 4. MongoDB Connection Failure
- **Symptom**: Backend logs display `MongoDB connection failed`.
- **Solution**: Verify MongoDB service health:
  ```bash
  docker-compose ps mongodb
  docker-compose logs mongodb
  ```

---

## 15. Known Limitations

1. **Student Records Storage**: The Phase 2 student CRUD interface currently operates with client-side state / mock data persistence in browser `localStorage`. Real backend database endpoints (`/api/students`) are reserved for backend implementation by the backend teammate. Once implemented, toggling `USE_MOCK_DATA = false` in `frontend/src/api/students.js` enables live REST API persistence without UI changes.
2. **User Registration Security**: The `/api/auth/register` endpoint is currently enabled for initial administrator/staff provisioning. In an enterprise production deployment, this endpoint should be restricted to authenticated administrative roles.
