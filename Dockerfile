FROM node:20-bookworm-slim as base

WORKDIR /app
COPY . .
RUN npm ci
RUN npx prisma generate
RUN npx tsc

FROM node:20-bookworm-slim as runner
WORKDIR /app
COPY --from=base ./app/dist ./dist
COPY package*.json ./
COPY prisma ./prisma/
RUN apt update -y && apt install -y openssl
ENV NODE_ENV production
RUN npm ci

EXPOSE 4000

CMD [ "node", "./dist/index.js" ]