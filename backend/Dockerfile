# backend/Dockerfile - .env.docker kopyala:
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
# .env.docker'ı kopyala (eğer varsa)
COPY .env.docker ./

EXPOSE 4000

CMD ["npm", "start"]