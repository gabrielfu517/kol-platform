# Frontend Dockerfile - Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Reduce memory usage during React build on low-RAM hosts
ENV NODE_OPTIONS="--max-old-space-size=256"
ENV GENERATE_SOURCEMAP=false

# Clear npm cache and install dependencies
RUN npm cache clean --force && \
    npm config set registry https://registry.npmjs.org && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 600000 && \
    npm ci --prefer-offline --no-audit

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

