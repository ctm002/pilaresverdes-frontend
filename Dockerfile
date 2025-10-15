# Fetching the latest node image on alpine linux
FROM node:22.12.0-alpine3.21 AS builder

# Build arguments
ARG VITE_BUILD_HASH
ENV VITE_BUILD_HASH=$VITE_BUILD_HASH

# Declaring env
ENV NODE_ENV development


# Setting up the work directory
WORKDIR /app

# Installing dependencies
COPY  ./package*.json /app

# RUN npm install
RUN npm ci && npm cache clean --force

# Copying all the files in our project
COPY . /app

RUN ls

# Building our application
RUN npm run build


# Fetching the latest nginx image
FROM nginx

# Copying built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copying our nginx.conf
# COPY nginx.conf /etc/nginx/conf.d/default.conf