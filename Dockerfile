FROM node:18-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN npx prisma generate

RUN pnpm run build

FROM node:18-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 3000

CMD ["pnpm", "run", "start"]