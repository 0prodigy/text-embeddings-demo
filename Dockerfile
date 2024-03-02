FROM node:lts as builder

WORKDIR /ui

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM node:lts
WORKDIR /ui

COPY --from=builder /ui .

EXPOSE 3000

CMD ["yarn", "start"]