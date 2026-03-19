FROM node:24-alpine3.21 AS base

ENV DIR=/app
WORKDIR $DIR
# ARG NPM_TOKEN  # Descomenta esta línea si necesitas instalar paquetes privados de npm

FROM base AS dev

ENV NODE_ENV=development
ENV CI=true

RUN npm install -g pnpm@10.27.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Para paquetes privados de npm, descomenta las siguientes 3 líneas y comenta la línea simple:
# RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ".npmrc" && \
#     pnpm install --frozen-lockfile && \
#     rm -f .npmrc
RUN pnpm install --frozen-lockfile

COPY prisma prisma
COPY prisma.config.ts .
COPY tsconfig*.json .
COPY nest-cli.json .
COPY scripts scripts
COPY src src

# Generar el cliente de Prisma (solo tipos, no necesita DATABASE_URL)
RUN npx prisma generate

EXPOSE $PORT
CMD ["sh", "-c", "npx prisma migrate deploy && node --run dev"]

FROM base AS build

ENV CI=true

RUN apk update && apk add --no-cache dumb-init=1.2.5-r3 && npm install -g pnpm@10.27.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Para paquetes privados de npm, descomenta las siguientes 3 líneas y comenta la línea simple:
# RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ".npmrc" && \
#     pnpm install --frozen-lockfile && \
#     rm -f .npmrc
RUN pnpm install --frozen-lockfile

COPY prisma prisma
COPY prisma.config.ts .
COPY tsconfig*.json .
COPY nest-cli.json .
COPY scripts scripts
COPY src src

# Generar el cliente de Prisma antes del build (solo tipos, no necesita DATABASE_URL)
RUN npx prisma generate

RUN node --run build && \
    pnpm prune --prod

FROM base AS production

ENV NODE_ENV=production
ENV USER=node

COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
COPY --from=build $DIR/package.json .
COPY --from=build $DIR/pnpm-lock.yaml .
COPY --from=build $DIR/node_modules node_modules
COPY --from=build $DIR/dist dist
COPY --from=build $DIR/prisma prisma
COPY --from=build $DIR/prisma.config.ts .

USER $USER
EXPOSE $PORT
CMD ["sh", "-c", "dumb-init sh -c 'npx prisma migrate deploy && node dist/main.js'"]
