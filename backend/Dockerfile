FROM node:20-alpine

WORKDIR /app

# Copy package files và cài dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Copy source code
COPY src/ ./src/
COPY migrations/ ./migrations/

EXPOSE 3001

CMD ["node", "src/index.js"]
