FROM node:18-buster
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# Serve the production build
CMD ["yarn", "start"]
