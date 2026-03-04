# ---- Stage 1: Build React app ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY index.html ./
COPY vite.config.js ./
COPY src/ ./src/

# Build production bundle
RUN npm run build

# ---- Stage 2: Serve bằng Nginx ----
FROM nginx:alpine

# Copy build output vào Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
