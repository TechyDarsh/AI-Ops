# ==============================================================================
# AI-OPS ALL-IN-ONE MULTI-SERVICE DOCKERFILE
# Packages Backend (8080), React App (5173), Mobile Sim (3000/6000), Gateway (8081)
# ==============================================================================

# STAGE 1: Build Spring Boot Backend using JDK 22
FROM maven:3.9-eclipse-temurin-22-alpine AS backend-build
WORKDIR /app/backend
COPY aiops-backend/ .
RUN mvn clean package -DskipTests

# STAGE 2: Build React Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY ai-ops/package*.json ./
RUN npm install
COPY ai-ops/ .
RUN npm run build

# STAGE 3: Final Unified Runtime Image using JRE 22
FROM eclipse-temurin:22-jre-alpine

# Install Node.js, Python, Supervisor, and dependencies
RUN apk add --no-cache nodejs npm python3 py3-pip supervisor bash curl

# Set up Python virtual environment for Gateway
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir pyserial websockets

# Install 'serve' globally to host built React app on Port 5173
RUN npm install -g serve

WORKDIR /app

# 1. Copy Spring Boot JAR (Port 8080)
COPY --from=backend-build /app/backend/target/*.jar /app/backend/app.jar

# 2. Copy Production React Build (Port 5173)
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# 3. Copy Mobile Web Simulation (Port 3000 & 6000)
COPY ai-ops-mobile/www /app/mobile

# 4. Copy Edge Gateway (Port 8081)
COPY edge-gateway /app/gateway

# 5. Setup Supervisord configuration to manage all 5 background services
RUN mkdir -p /etc/supervisor/conf.d
RUN echo "[supervisord]" > /etc/supervisord.conf && \
    echo "nodaemon=true" >> /etc/supervisord.conf && \
    echo "logfile=/var/log/supervisord.log" >> /etc/supervisord.conf && \
    echo "" >> /etc/supervisord.conf && \
    echo "[program:backend]" >> /etc/supervisord.conf && \
    echo "command=java -jar /app/backend/app.jar" >> /etc/supervisord.conf && \
    echo "autostart=true" >> /etc/supervisord.conf && \
    echo "autorestart=true" >> /etc/supervisord.conf && \
    echo "" >> /etc/supervisord.conf && \
    echo "[program:frontend]" >> /etc/supervisord.conf && \
    echo "command=serve -s /app/frontend/dist -l 5173" >> /etc/supervisord.conf && \
    echo "autostart=true" >> /etc/supervisord.conf && \
    echo "autorestart=true" >> /etc/supervisord.conf && \
    echo "" >> /etc/supervisord.conf && \
    echo "[program:mobile_web]" >> /etc/supervisord.conf && \
    echo "directory=/app/mobile" >> /etc/supervisord.conf && \
    echo "command=python3 -m http.server 3000" >> /etc/supervisord.conf && \
    echo "autostart=true" >> /etc/supervisord.conf && \
    echo "autorestart=true" >> /etc/supervisord.conf && \
    echo "" >> /etc/supervisord.conf && \
    echo "[program:alert_console]" >> /etc/supervisord.conf && \
    echo "directory=/app/mobile" >> /etc/supervisord.conf && \
    echo "command=python3 run_server_6000.py" >> /etc/supervisord.conf && \
    echo "autostart=true" >> /etc/supervisord.conf && \
    echo "autorestart=true" >> /etc/supervisord.conf && \
    echo "" >> /etc/supervisord.conf && \
    echo "[program:edge_gateway]" >> /etc/supervisord.conf && \
    echo "directory=/app/gateway" >> /etc/supervisord.conf && \
    echo "command=/opt/venv/bin/python3 gateway.py" >> /etc/supervisord.conf && \
    echo "autostart=true" >> /etc/supervisord.conf && \
    echo "autorestart=true" >> /etc/supervisord.conf

# Expose all ports
EXPOSE 8080 5173 3000 6000 8081

# Launch supervisor which runs all 5 services concurrently
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
