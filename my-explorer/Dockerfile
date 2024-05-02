FROM node:18-alpine
WORKDIR /app

RUN apk --no-cache --virtual build-dependencies add python make g++
RUN yarn global add node-gyp

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# Serve the production build
CMD ["yarn", "start"]
