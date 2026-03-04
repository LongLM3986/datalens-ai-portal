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

# Cài gettext để dùng envsubst (thay thế biến môi trường trong nginx.conf)
RUN apk add --no-cache gettext

# Copy build output vào Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config dưới dạng template
COPY nginx.conf /etc/nginx/conf.d/nginx.conf.template

EXPOSE 80

# Dùng envsubst để thay ${BACKEND_URL} trong template rồi start nginx
CMD ["/bin/sh", "-c", "envsubst '${BACKEND_URL}' < /etc/nginx/conf.d/nginx.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
