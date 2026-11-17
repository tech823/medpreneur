# ---------- Stage 1: build frontend ----------
FROM node:20-alpine AS fe
WORKDIR /fe
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --network-timeout 600000
COPY frontend/ ./
ENV CI=false
ENV REACT_APP_BACKEND_URL=/api
RUN yarn build

# ---------- Stage 2: runtime (nginx + FastAPI) ----------
FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends nginx supervisor curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/ -r requirements.txt
COPY backend/ /app/
COPY --from=fe /fe/build /usr/share/nginx/html
RUN rm -f /etc/nginx/sites-enabled/default
COPY nginx.conf /etc/nginx/conf.d/app.conf
COPY supervisord.conf /etc/supervisor/conf.d/app.conf
EXPOSE 80
CMD ["supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]