# ── Etapa 1: Build ──────────────────────────────────────
FROM node:20-alpine AS build

ARG API_URL=http://localhost:8080

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Reemplazar la URL marcadora en environment.ts
RUN sed -i "s|https://backend-en-railway.up.railway.app|${API_URL}|g" src/environments/environment.ts

RUN npm run build -- --configuration=production

# ── Etapa 2: Servir con Nginx ────────────────────────────
FROM nginx:alpine

COPY --from=build /app/dist/bike-shop-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
