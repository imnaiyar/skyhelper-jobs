FROM oven/bun:latest

WORKDIR /root/skyhelper-jobs

COPY package.json bun.lockb ./

ENV NODE_ENV=
ENV TOKEN=
ENV MONGO_CONNECTION=

# OPTIONAL
ENV ERROR_WEBHOOK=

RUN bun install --frozen-lockfile

COPY . .

CMD ["bun", "run", "start:bun"]
