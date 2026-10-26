# ========================================================
# Dockerfile: Edge Gateway Python Service (Port 8081)
# ========================================================
FROM python:3.11-slim

WORKDIR /app

RUN pip install --no-cache-dir pyserial websockets

COPY gateway.py .

EXPOSE 8081

CMD ["python", "gateway.py"]
