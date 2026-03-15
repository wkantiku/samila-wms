# ── BB WMS Frontend Dockerfile (Multi-stage) ──────

# Stage 1: Build React
FROM node:20-alpine AS builder

LABEL maintainer="BB Innovation"

WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx (lightweight)
FROM nginx:alpine

LABEL description="BB WMS React Frontend"
LABEL version="1.0.0"

# Copy built files
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Security: remove default nginx page
RUN rm -rf /etc/nginx/conf.d/default.conf.bak

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s \
    CMD wget -q --spider http://localhost/index.html || exit 1

CMD ["nginx", "-g", "daemon off;"]
