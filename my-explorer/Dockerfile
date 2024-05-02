FROM node:18-alpine
WORKDIR /app

# Install Python and other dependencies
RUN apk add --no-cache python3 make g++

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# Serve the production build
CMD ["yarn", "start"]
