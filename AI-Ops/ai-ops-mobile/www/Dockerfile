# ========================================================
# Dockerfile: Mobile Web Simulation (Port 3000 & 6000)
# ========================================================
FROM python:3.11-alpine

WORKDIR /app

COPY . .

EXPOSE 3000
EXPOSE 6000

# Runs mobile simulation on 3000 and background alert listener on 6000
CMD python -m http.server 3000 & python run_server_6000.py
