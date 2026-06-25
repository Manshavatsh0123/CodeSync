# Build Next.js Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend .
RUN npm run build

# Build Backend
FROM node:20-alpine

WORKDIR /app

COPY Backend/package*.json ./
RUN npm install

COPY Backend .

# Copy frontend build
COPY --from=frontend-builder /frontend/.next ./frontend/.next
COPY --from=frontend-builder /frontend/public ./frontend/public
COPY --from=frontend-builder /frontend/package.json ./frontend/package.json

EXPOSE 8000

CMD ["node", "server.js"]