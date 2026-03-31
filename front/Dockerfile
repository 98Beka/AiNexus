# Dockerfile for Vite + React
FROM node:20-alpine AS base
WORKDIR /app

# dependencies
COPY package.json package-lock.json* ./
COPY yarn.lock* ./
RUN npm install --legacy-peer-deps

# app
COPY . .

# Build step for production (optional)
RUN npm run build

# runtime image
FROM nginx:alpine AS production
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=base /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
