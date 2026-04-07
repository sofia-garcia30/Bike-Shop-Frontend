# ── Etapa 1: Build ──────────────────────────────────────
FROM node:20-alpine AS build

# Argumento para la URL del backend (se pasa desde railway.json)
ARG API_URL=https://proactive-fulfillment-production-f1e7.up.railway.app

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Verificar que el archivo environment.ts existe y mostrar su contenido antes del reemplazo (opcional, para debug)
RUN echo "=== Contenido original de environment.ts ===" && cat src/environments/environment.ts

# Reemplazar la URL marcadora en environment.ts (solo si el archivo existe)
RUN if [ -f src/environments/environment.ts ]; then \
        sed -i "s|https://backend-en-railway.up.railway.app|${API_URL}|g" src/environments/environment.ts && \
        echo "=== Contenido después del reemplazo ===" && cat src/environments/environment.ts; \
    else \
        echo "ERROR: No se encontró src/environments/environment.ts"; \
        exit 1; \
    fi

# Asegurar que la variable production sea true (por si acaso)
RUN sed -i 's/production: false/production: true/g' src/environments/environment.ts

# Construir la aplicación para producción
RUN npm run build -- --configuration=production

# ── Etapa 2: Servir con Nginx ────────────────────────────
FROM nginx:alpine

# Copiar los archivos estáticos construidos
COPY --from=build /app/dist/bike-shop-frontend/browser /usr/share/nginx/html

# Copiar configuración personalizada de Nginx (sin proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80 (Nginx)
EXPOSE 80

# Comando para iniciar Nginx (por defecto)
CMD ["nginx", "-g", "daemon off;"]
