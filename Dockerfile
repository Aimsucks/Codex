FROM node:20-alpine
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN cp .env.development .env
RUN npx prisma generate
RUN pnpm run build
CMD npx prisma migrate deploy && pnpm run start