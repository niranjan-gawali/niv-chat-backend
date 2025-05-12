FROM node:23-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install

COPY . .

EXPOSE 3000

CMD ["pnpm", "run", "start:dev"]
