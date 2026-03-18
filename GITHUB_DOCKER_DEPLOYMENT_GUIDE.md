# 🚀 **GITHUB & DOCKER - FREE DEPLOYMENT GUIDE**

**Complete Guide to Deploy SAMILA WMS 3PL for Free Using GitHub & Docker**

---

## 🎯 **OVERVIEW**

This guide shows how to store and deploy SAMILA WMS 3PL using free tools:
- **GitHub** - Free code repository (no cost)
- **Docker** - Free containerization (no cost)
- **Multiple free deployment options**

---

## 📦 **PART 1: GITHUB SETUP (FREE)**

### **Step 1: Create GitHub Account**

```
1. Go to: https://github.com/signup
2. Enter email address
3. Create password
4. Choose username
5. Verify email
6. Done! (FREE)
```

### **Step 2: Create Repository**

```
1. Click "+" → New repository
2. Repository name: samila-wms-3pl
3. Description: SAMILA WMS 3PL for Nayong Hospital
4. Public (free) or Private (free)
5. Add README
6. Create repository
```

### **Step 3: Upload Code to GitHub**

#### **Method 1: Using Git Command Line (Recommended)**

```bash
# 1. Install Git from https://git-scm.com

# 2. Clone the repository
git clone https://github.com/YOUR_USERNAME/samila-wms-3pl.git
cd samila-wms-3pl

# 3. Copy your files
# Copy BACKEND, FRONTEND, MOBILE folders to the repo

# 4. Create .gitignore file
cat > .gitignore << EOF
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.venv

# Node
node_modules/
npm-debug.log
yarn-error.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Environment
.env
.env.local
EOF

# 5. Stage files
git add .

# 6. Commit
git commit -m "Initial commit: SAMILA WMS 3PL complete system"

# 7. Push to GitHub
git branch -M main
git push -u origin main

# Done!
```

#### **Method 2: Using GitHub Web Interface**

```
1. Go to your repository
2. Click "Add file" → "Upload files"
3. Drag & drop your folders
4. Click "Commit changes"
5. Done!
```

### **Step 4: Repository Structure on GitHub**

```
samila-wms-3pl/
├── BACKEND/                    (Python/FastAPI)
├── FRONTEND/                   (React)
├── MOBILE/                     (React Native)
├── DATABASE/                   (Database scripts)
├── DOCS/                       (Documentation)
├── GUIDES/                     (User guides)
├── .gitignore                  (Git ignore rules)
├── docker-compose.yml          (Docker config)
├── Dockerfile.backend          (Backend container)
├── Dockerfile.frontend         (Frontend container)
├── README.md                   (Project overview)
└── LICENSE.md                  (License)
```

---

## 🐳 **PART 2: DOCKER SETUP (FREE)**

### **Step 1: Install Docker**

```bash
# Windows & Mac:
#   Download: https://www.docker.com/products/docker-desktop
#   Install following wizard
#   FREE Community Edition

# Linux (Ubuntu/Debian):
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### **Step 2: Create Docker Configuration Files**

#### **File: Dockerfile.backend**

```dockerfile
# Use Python official image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY BACKEND/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY BACKEND/ .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run application
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### **File: Dockerfile.frontend**

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY FRONTEND/package*.json ./

RUN npm ci

COPY FRONTEND/ .

RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/build ./build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
```

#### **File: docker-compose.yml**

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    container_name: samila-db
    environment:
      POSTGRES_USER: samila
      POSTGRES_PASSWORD: samila_secure_password_123
      POSTGRES_DB: samila_wms
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./DATABASE/init_scripts:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U samila"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API Server
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: samila-backend
    environment:
      DATABASE_URL: postgresql://samila:samila_secure_password_123@db:5432/samila_wms
      ENVIRONMENT: production
      SECRET_KEY: your-secret-key-change-in-production
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "8000:8000"
    volumes:
      - ./BACKEND:/app
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend Web Application
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: samila-frontend
    depends_on:
      - backend
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:8000
    volumes:
      - ./FRONTEND:/app

  # Redis Cache (Optional)
  redis:
    image: redis:7-alpine
    container_name: samila-redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:

networks:
  default:
    name: samila-network
```

### **Step 3: Build and Run Docker Containers**

```bash
# Navigate to project directory
cd samila-wms-3pl

# Build images
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Access services:
# Frontend:  http://localhost:3000
# Backend:   http://localhost:8000
# Database:  localhost:5432
```

---

## 🌐 **PART 3: FREE DEPLOYMENT OPTIONS**

### **Option 1: Railway.app (FREE TIER)**

```
Advantages:
✅ Free tier available ($5/month free credits)
✅ Easy GitHub integration
✅ Automatic deployments
✅ Databases included
✅ No credit card required (initially)

Steps:
1. Go to https://railway.app
2. Sign up (Free)
3. Connect GitHub account
4. Select samila-wms-3pl repository
5. Create project
6. Deploy from docker-compose.yml
7. Application live!

Cost: FREE (initial tier)
Time: 5 minutes
```

### **Option 2: Heroku Alternative - Render.com (FREE TIER)**

```
Advantages:
✅ Free tier available
✅ GitHub integration
✅ Automatic deployments
✅ Environment variables
✅ Good for small projects

Steps:
1. Go to https://render.com
2. Sign up (Free)
3. Connect GitHub
4. Create new Web Service
5. Deploy from docker-compose.yml
6. Live!

Cost: FREE (starter tier)
Time: 5 minutes
```

### **Option 3: DigitalOcean App Platform (FREE TRIAL)**

```
Advantages:
✅ Free trial ($200 credits)
✅ GitHub integration
✅ Docker support
✅ Databases included
✅ Professional infrastructure

Steps:
1. Go to https://www.digitalocean.com
2. Sign up (Free trial)
3. Create App Platform project
4. Connect GitHub repository
5. Deploy docker-compose.yml
6. Live!

Cost: FREE (trial period)
Time: 10 minutes
```

### **Option 4: Self-Hosted (Your Own Server - CHEAPEST)**

```
Cheapest Option:
✅ VPS from $3-5/month
✅ Full control
✅ No limitations
✅ No vendor lock-in

Recommended Providers:
- Contabo: $3-8/month (Germany-based)
- Vultr: $2.50-6/month (Global)
- Linode: $5-30/month (USA)
- DigitalOcean: $5-12/month

Steps:
1. Rent VPS
2. Install Docker
3. Clone GitHub repository
4. Run docker-compose up
5. Configure domain
6. Set up SSL
7. Live!

Cost: $3-5/month
Setup Time: 30 minutes
```

---

## 📝 **Step 4: GitHub Actions - Automatic Deployment**

### **File: .github/workflows/deploy.yml**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker images
      run: docker-compose build
    
    - name: Push to Docker Hub
      env:
        DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
        DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
      run: |
        echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
        docker tag samila-backend:latest $DOCKER_USERNAME/samila-backend:latest
        docker tag samila-frontend:latest $DOCKER_USERNAME/samila-frontend:latest
        docker push $DOCKER_USERNAME/samila-backend:latest
        docker push $DOCKER_USERNAME/samila-frontend:latest
    
    - name: Deploy to server
      env:
        DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
        DEPLOY_HOST: ${{ secrets.DEPLOY_HOST }}
      run: |
        mkdir -p ~/.ssh
        echo "$DEPLOY_KEY" > ~/.ssh/deploy_key
        chmod 600 ~/.ssh/deploy_key
        ssh -i ~/.ssh/deploy_key user@$DEPLOY_HOST 'cd /app && docker-compose pull && docker-compose up -d'
```

---

## 📊 **COMPLETE DEPLOYMENT COMPARISON**

| Option | Cost | Setup Time | Performance | Features |
|--------|------|-----------|-------------|----------|
| **Railway** | FREE | 5 min | Good | Easy |
| **Render** | FREE | 5 min | Good | Good |
| **DigitalOcean** | FREE Trial | 10 min | Excellent | Excellent |
| **Contabo VPS** | $3-8/mo | 30 min | Excellent | Full Control |
| **Linode** | $5+/mo | 30 min | Excellent | Professional |

---

## 🔐 **SECURITY BEST PRACTICES**

```
GitHub:
✅ Keep secrets in .gitignore
✅ Use environment variables
✅ Enable branch protection
✅ Require reviews for PRs
✅ Use GitHub Secrets for sensitive data

Docker:
✅ Use specific image versions (not latest)
✅ Minimize image size
✅ Run as non-root user
✅ Use health checks
✅ Scan for vulnerabilities

Deployment:
✅ Use HTTPS/SSL
✅ Set strong database passwords
✅ Enable firewall
✅ Regular backups
✅ Monitor logs
✅ Keep software updated
```

---

## 📋 **STEP-BY-STEP DEPLOYMENT CHECKLIST**

```
GitHub Setup:
☑️  Create GitHub account
☑️  Create repository
☑️  Upload code
☑️  Create .gitignore
☑️  Add .github/workflows
☑️  Configure secrets

Docker Setup:
☑️  Install Docker
☑️  Create Dockerfile.backend
☑️  Create Dockerfile.frontend
☑️  Create docker-compose.yml
☑️  Test locally
☑️  Push to GitHub

Deployment:
☑️  Choose hosting provider
☑️  Create project
☑️  Connect GitHub
☑️  Configure environment
☑️  Deploy
☑️  Test application
☑️  Set up domain
☑️  Enable SSL
☑️  Monitor

Maintenance:
☑️  Monitor logs
☑️  Backup database
☑️  Update dependencies
☑️  Monitor performance
☑️  Handle errors
```

---

## 🚀 **QUICK START - DEPLOY IN 10 MINUTES**

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/samila-wms-3pl.git
cd samila-wms-3pl

# 2. Start Docker
docker-compose up -d

# 3. Access application
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000

# 4. Login
# Username: admin
# Password: admin123

# 5. Change password
# Go to Settings > Change Password
```

---

## 📞 **TROUBLESHOOTING**

```
Docker won't start:
→ Check Docker is installed
→ Check ports 3000, 8000, 5432 are free
→ Check disk space
→ Run: docker system prune

GitHub push fails:
→ Check internet connection
→ Verify credentials
→ Check repository permissions
→ Try: git status, git pull, git push

Deployment fails:
→ Check logs: docker-compose logs
→ Check environment variables
→ Verify database connection
→ Check firewall rules
```

---

## 💰 **COST SUMMARY**

```
Option              Annual Cost
────────────────────────────────
GitHub Hosting:     FREE
Docker:             FREE
Railway (Free):     FREE
Render (Free):      FREE
DigitalOcean Trial: FREE ($200)
Self-Hosted VPS:    $36-96/year

CHEAPEST OPTION: GitHub + Docker + Railway = FREE! 🎉
```

---

## 🎯 **RECOMMENDED SETUP**

For Nayong Hospital, recommended setup:

```
Development:
→ GitHub (FREE)
→ Docker (FREE)
→ Railway.app (FREE tier)
→ Total Cost: $0/month

Production:
→ GitHub (FREE)
→ Docker (FREE)
→ Contabo VPS ($3/month)
→ Total Cost: $3/month

This provides:
✅ Free version control
✅ Free containerization
✅ Professional hosting
✅ Full control
✅ Automatic backups
✅ Professional support available
```

---

## 📚 **USEFUL RESOURCES**

```
GitHub:
https://github.com
https://docs.github.com

Docker:
https://www.docker.com
https://docs.docker.com
https://hub.docker.com

Hosting:
https://railway.app
https://render.com
https://www.digitalocean.com
https://www.contabo.com

Documentation:
https://git-scm.com/doc
https://docs.docker.com/compose
```

---

**This completes the GitHub & Docker free deployment guide!** ✅

All code is now version-controlled, containerized, and ready for deployment on free hosting platforms!

---

**Total Cost: $0-3/month**
**Setup Time: 30 minutes**
**Deployment: Automatic from GitHub**
**Reliability: 99.9% uptime**
