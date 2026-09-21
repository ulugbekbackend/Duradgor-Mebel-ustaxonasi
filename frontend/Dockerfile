# React 19 + Vite frontend — build va nginx'da tarqatish
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# API'ning bazaviy manzili (/api bilan birga) — nginx /api/ ni backend'ga yo'naltiradi
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
