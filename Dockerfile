FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies only
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

# Final image
FROM base AS runner
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodeuser -u 1001

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Remove dev/test files
RUN rm -f .env .env.local todo.db

USER nodeuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "app.js"]
