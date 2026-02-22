# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Desabilita telemetry do Next.js
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json* ./


# Remove pnpm-lock.yaml se existir para usar npm
RUN rm -f pnpm-lock.yaml && npm cache clean --force

RUN npm install

COPY . .
COPY backend ./backend

RUN npm run build

# Stage 2: Production
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV LOG_LEVEL=info

# Copia arquivos necessários do build
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/lib ./lib

EXPOSE 3000

# Inicia o server.js que contém Next.js + Socket.io
CMD ["npm", "start"]


