# syntax=docker/dockerfile:1

# ---------- Build stage: build the frontend with Vite ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the code and build the frontend
COPY . .
RUN npm run build

# ---------- Runtime stage: run Express server and serve built frontend ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Required environment variables (can be overridden at runtime)
ENV PORT=5000
ENV MONGODB_URI="mongodb+srv://whiskerBond:wh1sk3rB0nd@whiskerbond.s8edfrz.mongodb.net/whiskerBond?retryWrites=true&w=majority&appName=whiskerBond"

# Install only production dependencies
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy server code and built frontend assets
COPY server ./server
COPY --from=builder /app/dist ./dist

EXPOSE 5000
CMD ["node", "server/index.js"]
